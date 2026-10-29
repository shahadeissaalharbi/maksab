import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FormMessage from "./FormMessage.jsx";
import { ERROR_MESSAGES, VERIFY_TEXT } from "../constants/messages.js";
import { ROUTES } from "../constants/routes.js";
import { resendVerification } from "../services/authService.js";

// هنا الشاشة اللي تطلع بعد التسجيل، تقوله يشوف إيميله
function CheckEmail({ email, onBack }) {
  const [message, setMessage] = useState(null);
  const [seconds, setSeconds] = useState(60);

  // كل ثانية ينقص العداد واحد، لين يوصل صفر
  useEffect(() => {
    if (seconds === 0) return;
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  async function handleResend() {
    try {
      await resendVerification(email);
      setMessage({ type: "success", text: VERIFY_TEXT.RESENT });
      setSeconds(60);
    } catch {
      setMessage({ type: "error", text: ERROR_MESSAGES.NETWORK });
    }
  }

  return (
    <div className="check-email">
      <p className="check-email-hint">{VERIFY_TEXT.HINT}</p>

      <Link to={ROUTES.LOGIN} className="register-submit check-email-login">
        {VERIFY_TEXT.GO_LOGIN}
      </Link>

      {seconds > 0 ? (
        <p className="check-email-wait">
          {VERIFY_TEXT.WAIT} {seconds} ثانية
        </p>
      ) : (
        <button
          type="button"
          className="check-email-resend"
          onClick={handleResend}
        >
          {VERIFY_TEXT.RESEND}
        </button>
      )}

      <FormMessage message={message} />
      <button type="button" className="check-email-resend" onClick={onBack}>
        الإيميل غلط؟ رجوع للتسجيل
      </button>
    </div>
  );
}

export default CheckEmail;
