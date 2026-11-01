import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormMessage from "./FormMessage.jsx";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  OTP_ERRORS,
  VERIFY_TEXT,
} from "../constants/messages.js";
import { ROUTES } from "../constants/routes.js";
import { resendVerification, verifyOtp } from "../services/authService.js";

const CODE_LENGTH = 6;
const REDIRECT_DELAY_MS = 1500;

// هنا الشاشة اللي تطلع بعد التسجيل: يكتب رمز التحقق اللي وصله بالإيميل
function CheckEmail({ email, onBack }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60);

  // كل ثانية ينقص العداد واحد، لين يوصل صفر
  useEffect(() => {
    if (seconds === 0) return;
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  // الخانة تقبل أرقام بس، وما تزيد عن 6
  function handleCodeChange(event) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
  }

  async function handleConfirm(event) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { status } = await verifyOtp(email, code);

      if (status === HTTP_STATUS.OK) {
        setMessage({ type: "success", text: VERIFY_TEXT.VERIFIED });
        setTimeout(
          () => navigate(`${ROUTES.LOGIN}?verified=1`),
          REDIRECT_DELAY_MS,
        );
      } else {
        setMessage({
          type: "error",
          text: OTP_ERRORS[status] || ERROR_MESSAGES.DEFAULT,
        });
      }
    } catch {
      setMessage({ type: "error", text: ERROR_MESSAGES.NETWORK });
    }

    setLoading(false);
  }

  async function handleResend() {
    try {
      await resendVerification(email);
      setMessage({ type: "success", text: VERIFY_TEXT.RESENT });
      setCode("");
      setSeconds(60);
    } catch {
      setMessage({ type: "error", text: ERROR_MESSAGES.NETWORK });
    }
  }

  return (
    <form className="check-email" onSubmit={handleConfirm}>
      <p className="check-email-hint">{VERIFY_TEXT.HINT}</p>

      <label htmlFor="otp-code" className="check-email-label">
        {VERIFY_TEXT.CODE_LABEL}
      </label>
      <input
        id="otp-code"
        className="check-email-code"
        value={code}
        onChange={handleCodeChange}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="______"
        maxLength={CODE_LENGTH}
        required
      />

      <button
        type="submit"
        className="register-submit check-email-login"
        disabled={loading || code.length !== CODE_LENGTH}
      >
        {loading ? VERIFY_TEXT.CONFIRMING : VERIFY_TEXT.CONFIRM}
      </button>

      <FormMessage message={message} />

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

      <button type="button" className="check-email-resend" onClick={onBack}>
        {VERIFY_TEXT.BACK}
      </button>
    </form>
  );
}

export default CheckEmail;
