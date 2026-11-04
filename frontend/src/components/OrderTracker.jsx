import {
  ORDER_STEP_INDEX,
  ORDER_TRACK_STEPS,
  ORDER_TRACK_TEXT,
} from "../constants/myOrders.js";
import "../styles/OrderTracker.css";

// هنا شريط تتبع الطلب: وين وصل عند المورد
function OrderTracker({ status }) {
  if (status === "cancelled") {
    return <p className="ot-cancelled">{ORDER_TRACK_TEXT.CANCELLED}</p>;
  }

  const current = ORDER_STEP_INDEX[status] || 0;

  return (
    <ol className="ot-steps" aria-label="تتبع الطلب">
      {ORDER_TRACK_STEPS.map((step, index) => {
        let state = "todo";
        if (index < current) state = "done";
        else if (index === current) state = "current";

        return (
          <li
            key={step.id}
            className={`ot-step ${state}`}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="ot-dot">{state === "done" ? "✓" : index + 1}</span>
            <span className="ot-label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default OrderTracker;
