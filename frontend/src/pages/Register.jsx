import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import AccountTypeSelector from "../components/AccountTypeSelector.jsx";
import FormField from "../components/FormField.jsx";
import SubmitButton from "../components/SubmitButton.jsx";
import FormMessage from "../components/FormMessage.jsx";
import { DEFAULT_ACCOUNT_TYPE } from "../constants/accountTypes.js";
import {
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  getErrorMessage,
} from "../constants/messages.js";
import { ROUTES } from "../constants/routes.js";
import { registerUser } from "../services/authService.js";
import { useFormStatus } from "../hooks/useFormStatus.js";

const REDIRECT_DELAY_MS = 1500;
const EMPTY_FORM = { businessName: "", email: "", password: "" };

// هنا صفحة التسجيل: تركّب القطع وترسل النموذج، والتفاصيل كل وحدة في ملفها
function Register() {
  const [accountType, setAccountType] = useState(DEFAULT_ACCOUNT_TYPE);
  const [form, setForm] = useState(EMPTY_FORM);
  const { loading, message, showSuccess, showError, run } = useFormStatus();
  const navigate = useNavigate();

  // هنا دالة وحدة لكل الحقول، تعرف الحقل من name
  const updateField = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = (event) => {
    event.preventDefault();

    run(async () => {
      const { status } = await registerUser({
        ...form,
        accountType: accountType.value,
      });

      if (status === HTTP_STATUS.CREATED) {
        showSuccess(SUCCESS_MESSAGES.REGISTER);
        setTimeout(() => navigate(ROUTES.LOGIN), REDIRECT_DELAY_MS);
      } else {
        showError(getErrorMessage(status));
      }
    });
  };

  return (
    <AuthLayout
      subtitle="أول خطوة… أول مكسب"
      title="حساب أعمال جديد"
      description="دقيقة وحدة، ومشروعك على الطريق."
      showBrand
    >
      <AccountTypeSelector selected={accountType} onSelect={setAccountType} />

      <form onSubmit={handleSubmit}>
        <FormField
          id="businessName"
          label="اسم النشاط التجاري"
          type="text"
          placeholder={accountType.placeholder}
          value={form.businessName}
          onChange={updateField}
          autoComplete="organization"
          required
        />
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
          placeholder="ثمانية أحرف على الأقل"
          value={form.password}
          onChange={updateField}
          autoComplete="new-password"
          minLength={8}
          required
        />

        <SubmitButton
          loading={loading}
          label="إنشاء الحساب"
          loadingLabel="جاري إنشاء الحساب..."
        />
        <FormMessage message={message} />
      </form>

      <p className="register-login">
        لديك حساب؟ <Link to={ROUTES.LOGIN}>تسجيل الدخول</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
