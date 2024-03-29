export type OrderId = number;
export type ReportId = number;
export type LocationId = number;

export type ApiSuccess = {
  succcess: boolean;
};
export type ApiError = {
  isError: true;
  status: number;
  errors: { [key: string]: string };
};

export enum OrderTypes {
  pizzas = "pizzas",
  donuts = "donuts",
}

export enum OrderTypeMealCounts {
  pizzas = 14,
  donuts = 12,
}

export type OrderInfo = {
  id: OrderId;
  snacks: number;
  quantity: number;
  orderType: OrderTypes;
  pizzas: number;
  restaurant: string;
  createdAt: Date;
  cancelledAt: Date;
  reports: ReportInfo[];
};

/**
 * /donations
 */

export type DonationPostResults = {
  success: boolean;
  checkoutSessionId?: string;
  message?: string;
};

/**
 * /locations/{address}
 */
export type LocationStatus =
  | (LocationInfo & {
      notFound: undefined;
      hasTruck: boolean;
      reports: any[];
      orders: OrderDetails[];
    })
  // allow us to store the results of a 404
  | { notFound: true };

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

/**
 * /orders
 */
export type OrderQueryResults = {
  results: OrderDetails[];
  count: number;
};

/**
 * /orders/{id}
 */
export type OrderDetails = OrderInfo & {
  location: LocationInfo;
};

/**
 * /reports
 */

export type ReportInfo = {
  id: ReportId;
  createdAt: Date;
  reportURL: string;
  waitTime: string;
};

export type ReportPostResults = {
  address?: LocationInfo;
  hasTruck: boolean;
  willReceive: boolean;
  alreadyOrdered: boolean;
};

/**
 * /sessions
 */
export type SessionPutResults = {
  redirect: string;
};

/**
 * /totals
 */

export type PizzaTotals = {
  raised: number;
  donors: number;
  costs: number;
  pizzas: number;
  snacks: number;
  orders: number;
  locations: number;
  states: number;
};

/**
 * /trucks
 */
export type TruckQueryResults = {
  results: TruckInfo[];
  count: number;
};

export type TruckInfo = {
  isActive: boolean;
  createdAt: Date;
  region: string;
  location: LocationInfo;
};

export type TruckDetails = TruckInfo & {
  reports: ReportInfo[];
};

/**
 * /uploads
 */
export type UploadPostResults = {
  id: string;
  filePath?: string;
  isDuplicate: boolean;
  presigned?: {
    url: string;
    fields: { [id: string]: string };
  };
};
