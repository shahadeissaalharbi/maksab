import { ORDER_STATUS, ORDER_STATUS_OPTIONS, OVERVIEW_TEXT } from "../constants/overview.js";
import { formatNumber } from "../utils/overviewFormat.js";

// هنا صف طلب واحد: رقمه وعميله ومبلغه وحالته
function OverviewOrderRow({ order, onStatusChange }) {
  const isNew = order.status === ORDER_STATUS.NEW.value;

  return (
    <div className="ov-order-row">
      <div className="ov-order-info">
        <span className="ov-order-id">#{order.id}</span>
        <div>
          <p className="ov-order-customer">
            {order.customer} · {order.district}
          </p>
          <p className="ov-order-items">{OVERVIEW_TEXT.itemsCount(order.items_count)}</p>
        </div>
      </div>

      <span className="ov-order-total">
        {formatNumber(order.total)} {OVERVIEW_TEXT.CURRENCY}
      </span>

      <div className="ov-order-actions">
        <select
          value={order.status}
          onChange={(event) => onStatusChange(order.id, event.target.value)}
          aria-label={OVERVIEW_TEXT.STATUS_LABEL}
        >
          {ORDER_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button type="button" className={isNew ? "ov-btn-primary" : "ov-btn-light"}>
          {isNew ? OVERVIEW_TEXT.ACTION_REVIEW : OVERVIEW_TEXT.ACTION_DETAILS}
        </button>
      </div>
    </div>
  );
}

export default OverviewOrderRow;
