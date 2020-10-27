import { getTotals } from "../lib/sheets";

import { OrderQueryResults, PizzaTotals } from "./types";

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
  /**
   * TODO: This should go away when `getTotals` returns the proper value for `raised`
   */
  public async getDonations(): Promise<number> {
    const { raised } = await getTotals();
    return parseInt(raised.replace(",", ""), 10);
  }

  public async getOrders(page: number = 0): Promise<OrderQueryResults> {
    return await baseFetch(`/orders?page=${page}`);
  }

  public async getTotals(): Promise<PizzaTotals> {
    return await baseFetch(`/totals/2020`);
  }
}

const singleton = new PizzaApi();
export default singleton;
