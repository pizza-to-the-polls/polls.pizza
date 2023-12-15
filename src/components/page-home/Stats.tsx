import { h } from "@stencil/core";

import { PizzaTotals } from "../../api";

const Stats = ({ totals }: { totals?: PizzaTotals }) => (
  <div class="container stats-wrapper">
    <div class="stats-row">
      <div class="stat">
        <span class="stat-emoji">🍕</span>
        <span class="stat-number">
          <ui-dynamic-text value={totals?.pizzas} format={x => x.toLocaleString()} />
        </span>
        <span class="stat-label">Pizzas sent</span>
      </div>
      <div class="stat">
        <span class="stat-emoji">🗳</span>
        <span class="stat-number">
          <ui-dynamic-text value={totals?.locations} format={x => x.toLocaleString()} />
        </span>
        <span class="stat-label">Polling places</span>
      </div>
      <div class="stat">
        <span class="stat-emoji">🇺🇸</span>
        <span class="stat-number">
          <ui-dynamic-text value={totals?.states} format={x => x.toLocaleString()} />
        </span>
        <span class="stat-label">States</span>
      </div>
      <div class="stat">
        <span class="stat-emoji">😌</span>
        <span class="stat-number">
          <ui-dynamic-text value={totals?.snacks} format={x => Number(x / 1000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "K"} />
        </span>
        <span class="stat-label">People fed</span>
      </div>
    </div>
  </div>
);

export default Stats;
