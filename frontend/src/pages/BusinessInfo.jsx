import { useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import FormMessage from "../components/FormMessage.jsx";
import { ROUTES } from "../constants/routes.js";
import { getToken, getUser } from "../services/session.js";
import { updateProfile } from "../services/profileService.js";
import "../styles/Auth.css";
import "../styles/Trader.css";

// هنا صفحة بيانات النشاط والعنوان
function BusinessInfo() {
  const user = getUser();

  // الحقول تبدأ بالبيانات المحفوظة، ولو ما فيه تبدأ فاضية
  const [form, setForm] = useState({
    business_name: user?.business_name ?? "",
    commercial_register: user?.commercial_register ?? "",
    phone: user?.phone ?? "",
    address_text: user?.address_text ?? "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // اللي ما سجل دخول يرجع لصفحة الدخول
  if (!getToken()) return <Navigate to={ROUTES.LOGIN} />;

  // كل ما تكتب في حقل، أحدث قيمته بس وأخلي الباقي زي ما هو
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await updateProfile(form);

      if (response.status === 200) {
        setMessage({ type: "success", text: "انحفظت ✓ وطلباتك عرفت طريقها" });
      } else {
        setMessage({
          type: "error",
          text: "ما انحفظت هالمرة، نرجو مراجعة البيانات",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "الإنترنت فصل في نص الطريق، نرجو المحاولة بعد شوي",
      });
    }

    setLoading(false);
  }

  return (
    <div className="trader-page" dir="rtl">
      <Navbar userName={user?.full_name} />

      <main className="business-info">
        <h1>بيانات النشاط والعنوان</h1>
        <p>عنوان دقيق = طلبات توصل أسرع</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="business_name">اسم النشاط</label>
          <input
            id="business_name"
            name="business_name"
            value={form.business_name}
            onChange={handleChange}
            placeholder="مثل: حلويات البيت"
            required
          />

          <label htmlFor="commercial_register">
            رقم السجل التجاري أو وثيقة العمل الحر
          </label>
          <input
            id="commercial_register"
            name="commercial_register"
            value={form.commercial_register}
            onChange={handleChange}
            inputMode="numeric"
          />

          <label htmlFor="phone">رقم الجوال</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="05xxxxxxxx"
          />

          <label htmlFor="address_text">العنوان</label>
          <textarea
            id="address_text"
            name="address_text"
            value={form.address_text}
            onChange={handleChange}
            rows="3"
            placeholder="الحي، الشارع، رقم المبنى"
          />

          <button type="submit" className="register-submit" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>

          <FormMessage message={message} />
        </form>
      </main>
    </div>
  );
}

export default BusinessInfo;
