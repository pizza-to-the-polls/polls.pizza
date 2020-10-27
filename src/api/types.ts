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

export type OrderQueryResults = {
  results: OrderInfo[];
  count: number;
};

export type OrderInfo = {
  id: number;
  meals: number;
  quantity: number;
  orderType: string;
  pizzas: number;
  restaurant: string;
  createdAt: Date;
  location: LocationInfo;
  reports: ReportInfo[];
};

export type LocationInfo = {
  city: string;
  state: string;
  zip: string;
  address: string;
  fullAddress: string;
  lat: string;
  lng: string;
  id: number;
  validatedAt: Date;
  stateName: string;
};

export type ReportInfo = {
  createdAt: Date;
  id: number;
  reportURL: string;
  waitTime: string;
};
