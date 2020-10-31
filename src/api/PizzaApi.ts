import { LocationId, LocationStatus, OrderDetails, OrderId, OrderQueryResults, PizzaTotals } from "./types";

const BASE_URL = process.env.PIZZA_BASE_DOMAIN;

// TODO: This should not need to be exported, remove once all commands are on `PizzaApi`
export const baseFetch = async (path: string, options: { [key: string]: string } = {}): Promise<any> => {
  const headers = options.headers || {};
  const resp = await fetch(`${BASE_URL}${path}`, {
    mode: "cors",
    ...options,
    headers: { "Content-Type": "application/json", ...headers },
  });

  const data = await resp.json();

  if (resp.status > 299) {
    throw data.errors;
  }

  return data;
};

/**
 * NOTE: Keep all public methods sorted alphabetically
 */
class PizzaApi {
  public async getLocationStatus(normalizedAddress: string | LocationId): Promise<LocationStatus> {
    return await baseFetch(`/locations/${encodeURIComponent(normalizedAddress)}`);
  }

  public async getOrder(id: OrderId): Promise<OrderDetails> {
    return await baseFetch(`/order/${id}`);
  }

  public async getOrders(page: number = 0, limit: number = 100): Promise<OrderQueryResults> {
    return await baseFetch(`/orders?page=${page}&limit=${limit}`);
  }

  public async getTotals(): Promise<PizzaTotals> {
    return await baseFetch(`/totals/2020`);
  }
}

const singleton = new PizzaApi();
export default singleton;
