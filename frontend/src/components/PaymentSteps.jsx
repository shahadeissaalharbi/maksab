import { PAYMENT_STEPS } from "../constants/payment.js";

// هنا شريط الخطوات: السلة ثم الدفع ثم التأكيد، والحالية ملونة
function PaymentSteps({ current }) {
  return (
    <ol className="pay-steps">
      {PAYMENT_STEPS.map((step, index) => (
        <li
          key={step}
          className={index <= current ? "pay-step is-done" : "pay-step"}
        >
          <span>{index + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  );
}

export default PaymentSteps;
