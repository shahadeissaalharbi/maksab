import { Link, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import PaymentStatusIcon from "../components/PaymentStatusIcon.jsx";
import PaymentSteps from "../components/PaymentSteps.jsx";
import { ROUTES } from "../constants/routes.js";
import {
  MOYASAR_FAILED,
  PAYMENT_TEXT,
  RESULT_STATE,
  STEP,
} from "../constants/payment.js";
import { usePaymentResult } from "../hooks/usePaymentResult.js";
import "../styles/Auth.css";
import "../styles/Trader.css";
import "../styles/Payment.css";

// هنا نص وزر كل حالة
const RESULT_VIEW = {
  [RESULT_STATE.PAID]: {
    title: PAYMENT_TEXT.PAID_TITLE,
    text: PAYMENT_TEXT.PAID_TEXT,
    link: ROUTES.MY_ORDERS,
    linkText: PAYMENT_TEXT.MY_ORDERS,
  },
  [RESULT_STATE.FAILED]: {
    title: PAYMENT_TEXT.FAILED_TITLE,
    text: PAYMENT_TEXT.FAILED_TEXT,
    link: ROUTES.CART,
    linkText: PAYMENT_TEXT.BACK_TO_CART,
  },
  [RESULT_STATE.WAITING]: {
    title: PAYMENT_TEXT.WAITING_TITLE,
    text: PAYMENT_TEXT.WAITING_TEXT,
    link: ROUTES.MY_ORDERS,
    linkText: PAYMENT_TEXT.MY_ORDERS,
  },
};

// هنا الصفحة اللي يرجعنا لها ميسّر بعد الدفع
function PaymentResult() {
  const { checkoutId } = useParams();
  const [searchParams] = useSearchParams();
  // لو ميسّر قال فشل ما نحتاج نسأل الباك
  const moyasarFailed = searchParams.get("status") === MOYASAR_FAILED;
  const checked = usePaymentResult(checkoutId, !moyasarFailed);
  const state = moyasarFailed ? RESULT_STATE.FAILED : checked;
  const view = RESULT_VIEW[state];

  return (
    <div className="trader-page pay-page" dir="rtl">
      <Navbar />

      <main className="pay-main pay-result">
        <PaymentSteps current={STEP.RESULT} />

        {state === RESULT_STATE.CHECKING && (
          <p className="pay-loading">{PAYMENT_TEXT.CHECKING}</p>
        )}

        {view && (
          <div className="pay-card">
            <PaymentStatusIcon state={state} />
            <h1 className={`pay-title-${state}`}>{view.title}</h1>
            <p>{view.text}</p>
            <Link to={view.link} className="pay-back">
              {view.linkText}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default PaymentResult;
