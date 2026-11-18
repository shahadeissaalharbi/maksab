import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import PayHandIcon from "../components/PayHandIcon.jsx";
import PaymentSteps from "../components/PaymentSteps.jsx";
import { ROUTES } from "../constants/routes.js";
import { FORM_STATE, PAYMENT_TEXT, STEP } from "../constants/payment.js";
import { getToken } from "../services/session.js";
import { readCheckout } from "../services/checkoutStorage.js";
import { useMoyasarForm } from "../hooks/useMoyasarForm.js";
import "../styles/Auth.css";
import "../styles/Trader.css";
import "../styles/Payment.css";

// هنا صفحة الدفع: المبلغ ونموذج ميسّر
function Payment() {
  // أقرا الفاتورة مرة وحدة، عشان النموذج ما ينعاد كل رسمة
  const [checkout] = useState(readCheckout);
  const formState = useMoyasarForm(checkout);

  if (!getToken()) return <Navigate to={ROUTES.LOGIN} />;
  if (!checkout) return <Navigate to={ROUTES.CART} />;

  const key = checkout.publishable_key;

  return (
    <div className="trader-page pay-page" dir="rtl">
      <Navbar />

      <main className="pay-main">
        <PaymentSteps current={STEP.PAYMENT} />

        <section className="pay-hero">
          <PayHandIcon />
          <div className="pay-hero-text">
            <h1>{PAYMENT_TEXT.TITLE}</h1>
            <p>{PAYMENT_TEXT.SUBTITLE}</p>
          </div>
          <div className="pay-amount">
            <span>{PAYMENT_TEXT.TOTAL}</span>
            <strong>
              {checkout.total_amount} <small>{PAYMENT_TEXT.CURRENCY}</small>
            </strong>
          </div>
        </section>

        <section className="pay-box">
          <span className="pay-secure">{PAYMENT_TEXT.SECURE}</span>

          {!key && <p className="pay-error">{PAYMENT_TEXT.NO_KEY}</p>}
          {key && formState === FORM_STATE.LOADING && (
            <p className="pay-loading">{PAYMENT_TEXT.LOADING}</p>
          )}
          {formState === FORM_STATE.FAILED && (
            <p className="pay-error">{PAYMENT_TEXT.FORM_FAILED}</p>
          )}

          {/* هنا ميسّر يرسم النموذج */}
          <div className="mysr-form pay-form"></div>

          <Link to={ROUTES.CART} className="pay-secondary">
            {PAYMENT_TEXT.BACK_TO_CART}
          </Link>
        </section>
      </main>
    </div>
  );
}

export default Payment;
