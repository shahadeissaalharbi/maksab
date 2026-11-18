import { RESULT_STATE } from "../constants/payment.js";

// هنا شكل العلامة داخل الدائرة لكل حالة
const ICON_PATHS = {
  [RESULT_STATE.PAID]: "M7 12.5l3.2 3.2L17 9",
  [RESULT_STATE.FAILED]: "M8.5 8.5l7 7M15.5 8.5l-7 7",
  [RESULT_STATE.WAITING]: "M12 7.5V12l3 2",
};

function PaymentStatusIcon({ state }) {
  return (
    <svg
      className={`pay-icon pay-icon-${state}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="11" />
      <path d={ICON_PATHS[state]} />
    </svg>
  );
}

export default PaymentStatusIcon;
