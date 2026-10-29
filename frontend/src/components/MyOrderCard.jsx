import { MY_ORDERS_TEXT, MY_ORDER_STATUS } from "../constants/myOrders.js";

// هنا التاريخ بالعربي، مثل: 12 مارس 2026
function formatDate(date) {
  return new Date(date).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// هنا بطاقة طلب واحد: رقمه وحالته ومورده ومجموعه
function MyOrderCard({ order }) {
  const status = MY_ORDER_STATUS[order.status] || MY_ORDER_STATUS.new;

  return (
    <article className="mo-card">
      <div className="mo-card-top">
        <div>
          <strong>
            {MY_ORDERS_TEXT.ORDER_NO} {order.id}
          </strong>
          <p className="mo-date">{formatDate(order.created_at)}</p>
        </div>
        <span className={`mo-status ${status.tone}`}>{status.label}</span>
      </div>

      <div className="mo-card-body">
        <div>
          <p className="mo-supplier">{order.supplier_name}</p>
          <p className="mo-items">{order.items_summary}</p>
        </div>
        <strong className="mo-total">
          {order.total.toLocaleString("en-US")} {MY_ORDERS_TEXT.CURRENCY}
        </strong>
      </div>

      <div className="mo-card-bottom">
        <p>{MY_ORDERS_TEXT.DELIVERY_NOTE}</p>
        <button type="button" disabled>
          {MY_ORDERS_TEXT.RECEIPT} <small>{MY_ORDERS_TEXT.SOON}</small>
        </button>
      </div>
    </article>
  );
}

export default MyOrderCard;
