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
  // لو ما فيه بيانات محفوظة، نبدأ بكائن فاضي
  const user = getUser() || {};

  // الحقول تبدأ بالبيانات المحفوظة، ولو ما فيه تبدأ فاضية
  const [form, setForm] = useState({
    business_name: user.business_name || "",
    commercial_register: user.commercial_register || "",
    phone: user.phone || "",
    address_text: user.address_text || "",
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

    // السجل اختياري، بس إذا انكتب لازم يكون 10 أرقام
    const register = form.commercial_register;
    if (register !== "" && !/^\d{10}$/.test(register)) {
      setMessage({
        type: "error",
        text: "رقم السجل التجاري لازم يكون 10 أرقام",
      });
      return;
    }

    // الجوال اختياري، ونقبل 05xxxxxxxx أو +9665xxxxxxxx
    const phone = form.phone;
    if (phone !== "" && !/^(05|\+9665)\d{8}$/.test(phone)) {
      setMessage({
        type: "error",
        text: "رقم الجوال لازم يكون مثل 05xxxxxxxx",
      });
      return;
    }

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
      <Navbar userName={user.full_name} />

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

          <label htmlFor="commercial_register">رقم السجل التجاري</label>
          <input
            id="commercial_register"
            name="commercial_register"
            value={form.commercial_register}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={10}
            placeholder="10 أرقام"
          />

          <label htmlFor="phone">رقم الجوال</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            maxLength={13}
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
