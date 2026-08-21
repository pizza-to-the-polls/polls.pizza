import { Fragment, h } from "@stencil/core";

import { OrderDetails } from "../../api";
import { locationURL } from "../../util";
import { formatDateTime } from "../../util";

const capitalize = (word: string): string => `${word.slice(0, 1).toUpperCase()}${word.slice(1, word.length)}`;

const Delivery = ({ order }: { order: OrderDetails }) => (
  <div class="delivery">
    <h5 class="has-text-black">
      {order.quantity} {capitalize(order.orderType)}
    </h5>
    <span class="time">{formatDateTime(order.createdAt)}</span>
    <p>
      <stencil-route-link url={locationURL(order.location)}>
        {order.location.address} in
        <br />
        {order.location.city}, {order.location.state}
      </stencil-route-link>
    </p>
  </div>
);

const SkeletonDelivery = () => (
  <div class="delivery loading">
    <div class="loading-line" style={{ width: "60%" }} />
    <div class="loading-line" style={{ width: "40%" }} />
    <div class="loading-line" style={{ width: "80%" }} />
  </div>
);

const Deliveries = ({ orders }: { orders?: OrderDetails[] }) => (
  <div class="deliveries">
    <h3 class="has-text-red">🚐 Deliveries</h3>
    <div class="deliveries-wrapper">
      {orders === undefined ? (
        [1, 2, 3].map(() => <SkeletonDelivery />)
      ) : orders.length === 0 ? (
        <p class="has-text-gray">No recent deliveries</p>
      ) : (
        orders.map(order => <Delivery order={order} />)
      )}
    </div>
    {orders != null && orders.length > 0 && (
      <Fragment>
        <hr />
        <stencil-route-link url="/activity" class="has-text-blue">
          See more deliveries
        </stencil-route-link>
      </Fragment>
    )}
  </div>
);

export default Deliveries;
