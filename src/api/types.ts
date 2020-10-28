export type OrderId = number;
export type ReportId = number;
export type LocationId = number;

export type PizzaTotals = {
  raised: number;
  donors: number;
  costs: number;
  pizzas: number;
  meals: number;
  orders: number;
  locations: number;
  states: number;
};

export type OrderInfo = {
  id: OrderId;
  meals: number;
  quantity: number;
  orderType: string;
  pizzas: number;
  restaurant: string;
  createdAt: Date;
};
/**
 * /orders/{id}
 */
export type OrderDetails = OrderInfo & {
  location: LocationInfo;
  reports: ReportInfo[];
};

export type LocationInfo = {
  id: LocationId;
  city: string;
  state: string;
  zip: string;
  address: string;
  fullAddress: string;
  lat: string;
  lng: string;
  validatedAt: Date;
  stateName: string;
};

export type ReportInfo = {
  id: ReportId;
  createdAt: Date;
  reportURL: string;
  waitTime: string;
};

/**
 * /locations/{address}
 */
export type LocationStatus = LocationInfo & {
  hasTruck: boolean;
  reports: any[];
  orders: OrderInfo[];
};

/**
 * /orders
 */
export type OrderQueryResults = {
  results: OrderDetails[];
  count: number;
};
