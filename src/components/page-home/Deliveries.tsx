import { h } from "@stencil/core";

import { OrderDetails } from "../../api";

const capitalize = (word: string): String => `${word.slice(0, 1).toUpperCase()}${word.slice(1, word.length)}`;

const formatDate = (date: Date): String => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
  const minutes = date.getMinutes();
  const meridian = date.getHours() > 12 ? "pm" : "am";

  return `${day}/${month} ${hours}:${minutes} ${meridian}`;
};

const Delivery = ({ order }: { order: OrderDetails }) => (
  <div class="delivery">
    <h5>
      {order.quantity} {capitalize(order.orderType)}
    </h5>
    <span class="time">{formatDate(order.createdAt)}</span>
    <p>
      {order.location.address} in
      <br />
      {order.location.city}, {order.location.state}
    </p>
  </div>
);

const Deliveries = ({ orders }: { orders?: OrderDetails[] }) => (
  <div class="deliveries">
    <h3 class="has-text-red">🚐 Deliveries</h3>
    <div class="deliveries-wrapper">
      {orders?.map(order => (
        <Delivery order={order} />
      ))}
    </div>
  </div>
);

export default Deliveries;
