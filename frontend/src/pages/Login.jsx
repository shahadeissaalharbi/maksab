import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import FormField from "../components/FormField.jsx";
import SubmitButton from "../components/SubmitButton.jsx";
import FormMessage from "../components/FormMessage.jsx";
import { ACCOUNT_TYPES, getAccountTypeLabel } from "../constants/accountTypes.js";
import { HTTP_STATUS, SUCCESS_MESSAGES, getErrorMessage } from "../constants/messages.js";
import { ROUTES } from "../constants/routes.js";
import { loginUser } from "../services/authService.js";
import { saveSession } from "../services/session.js";
import { useFormStatus } from "../hooks/useFormStatus.js";

const REDIRECT_DELAY_MS = 1500;
const EMPTY_FORM = { email: "", password: "" };

// هنا صفحة الدخول، وحدة للأسرة المنتجة والمورد لأن الباك يعرف النوع من الإيميل
function Login() {
  const [form, setForm] = useState(EMPTY_FORM);
  const { loading, message, showSuccess, showError, run } = useFormStatus();
  const navigate = useNavigate();

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = (event) => {
    event.preventDefault();

    run(async () => {
      const { status, data } = await loginUser(form);

      if (status === HTTP_STATUS.OK) {
        saveSession(data.token, data.user);
        showSuccess(SUCCESS_MESSAGES.LOGIN(data.user.full_name, getAccountTypeLabel(data.user.role)));

        // هنا الأسرة المنتجة تنتقل لسوق الجملة بعد الترحيب
        if (data.user.role === ACCOUNT_TYPES.MERCHANT.value) {
          setTimeout(() => navigate(ROUTES.TRADER_HOME), REDIRECT_DELAY_MS);
        }
      } else {
        showError(getErrorMessage(status));
      }
    });
  };

  return (
    <AuthLayout subtitle="أهلًا فيك من جديد" title="سجلي دخولك" description="أدخلي الإيميل وكلمة المرور.">
      <form onSubmit={handleSubmit}>
        <FormField
          id="email"
          label="البريد الإلكتروني"
          type="email"
          placeholder="name@example.com"
          value={form.email}
          onChange={updateField}
          autoComplete="email"
          required
        />
        <FormField
          id="password"
          label="كلمة المرور"
          type="password"
          placeholder="كلمة المرور"
          value={form.password}
          onChange={updateField}
          autoComplete="current-password"
          required
        />

        <SubmitButton loading={loading} label="تسجيل الدخول" loadingLabel="جاري تسجيل الدخول..." />
        <FormMessage message={message} />
      </form>

      <p className="register-login">
        ما عندك حساب؟ <Link to={ROUTES.REGISTER}>أنشئي حساب</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;