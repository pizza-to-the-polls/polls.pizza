import { toQueryString } from "../util";

import { ApiError, ApiSuccess, LocationId, LocationStatus, OrderDetails, OrderId, OrderQueryResults, PizzaTotals, SessionPutResults, TruckQueryResults, UploadPostResults } from "./types";

const BASE_URL = process.env.PIZZA_BASE_DOMAIN;

// TODO: This should not need to be exported, remove once all commands are on `PizzaApi`
export const baseFetch = async <T = any>(path: string, options: { [key: string]: string } = {}): Promise<(T & { isError: undefined }) | ApiError> => {
  const headers = options.headers || {};
  const resp = await fetch(`${BASE_URL}${path}`, {
    mode: "cors",
    ...options,
    headers: { "Content-Type": "application/json", ...headers },
  });

  const text = await resp.text();
  const data = JSON.parse(text, reviver);

  if (resp.status > 299) {
    return { isError: true, status: resp.status, messages: data.errors as string[] };
  }

  return data as T & { isError: undefined };
};

const reviver: (this: any, key: string, value: any) => any = (key, value) => {
  if (key === "createdAt" || key === "validatedAt" || key === "cancelledAt") {
    return new Date(Date.parse(value));
  }
  return value;
};

/**
 * NOTE: Keep all public methods sorted alphabetically
 */
class PizzaApi {
  public async getHealth() : Promise<void> {
    await baseFetch("/health")
  }

  public async getLocationStatus(normalizedAddress: string | LocationId, errorHandler?: (error: ApiError) => void): Promise<LocationStatus | null> {
    return this.handleResponse(await baseFetch<LocationStatus>(`/locations/${encodeURIComponent(normalizedAddress)}`), errorHandler);
  }

  public async getOrder(id: OrderId, errorHandler?: (error: ApiError) => void): Promise<OrderDetails | null> {
    return this.handleResponse(await baseFetch<OrderDetails>(`/order/${id}`), errorHandler);
  }

  public async getOrders(page: number = 0, limit: number = 100, errorHandler?: (error: ApiError) => void): Promise<OrderQueryResults> {
    return this.handleResponse(await baseFetch<OrderQueryResults>(`/orders?page=${page}&limit=${limit}`), errorHandler) || { results: [], count: 0 };
  }

  public async getTotals(errorHandler?: (error: ApiError) => void): Promise<PizzaTotals> {
    const totals = this.handleResponse(await baseFetch<PizzaTotals>(`/totals/`), errorHandler) || {
      costs: 0,
      donors: 0,
      locations: 0,
      meals: 0,
      orders: 0,
      pizzas: 0,
      raised: 0,
      states: 0,
    };

    return totals;
  }

  public async getTrucks(showHistorical: boolean = false, locationId?: LocationId, errorHandler?: (error: ApiError) => void): Promise<TruckQueryResults> {
    const result = await baseFetch<TruckQueryResults>(
      `/trucks` +
        toQueryString(
          {
            location: locationId,
            past: showHistorical === true ? true : undefined,
          },
          true,
        ),
    );
    return this.handleResponse(result, errorHandler) || { results: [], count: 0 };
  }

  public async postSession(email: string, errorHandler?: (error: ApiError) => void) : Promise<void> {
    const result = await baseFetch<ApiSuccess>(`/session`, {
      body: JSON.stringify({ email }),
      method: "POST",
    });
    this.handleResponse(result, errorHandler)
  }
  public async postUpload(fileHash: string, fileName: string, address: string, errorHandler?: (error: ApiError) => void): Promise<UploadPostResults> {
    const result = await baseFetch<UploadPostResults>("/upload", { method: "POST", body: JSON.stringify({ fileHash, fileName, address }) });
    return this.handleResponse(result, errorHandler) || { id: '', isDuplicate: true }
  }
  public async putSession(token: string, errorHandler?: (error: ApiError) => void) : Promise<SessionPutResults> {
    const result = await baseFetch<SessionPutResults>(`/session`, {
      body: JSON.stringify({ token }),
      method: "PUT",
    });
    return this.handleResponse(result, errorHandler) || { redirect: '' }
  }

  /**
   *
   * @param result
   * @param errorHandler Optional function that will receive the response if it is an error, else the error will throw
   */
  private handleResponse<T>(result: (T & { isError: undefined }) | ApiError, errorHandler?: (error: ApiError) => void) {
    if (result?.isError === true) {
      if (errorHandler != null) {
        errorHandler(result);
      } else {
        throw result;
      }
      return null;
    }
    return result;
  }
}

const singleton = new PizzaApi();
export default singleton;
