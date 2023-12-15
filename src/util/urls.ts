import { LocationInfo, OrderDetails } from "../api";

export const orderURL = (order: OrderDetails): string => `${locationURL(order.location)}/${order.id}`;

export const locationURL = (location: LocationInfo): string => `/deliveries/${location.fullAddress.replace(/\s/g, "+")}`;
