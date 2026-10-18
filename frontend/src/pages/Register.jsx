import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api.js";
import "./Auth.css";

// هنا جهزت صفحة التسجيل وحطيت الأشياء اللي بحتاجها فيها
function Register() {
  // هنا خليت الأسرة المنتجة هي الخيار الافتراضي وخزنت نوع الحساب اللي يختاره المستخدم
  const [accountType, setAccountType] = useState("merchant");

  // هنا خزنت اسم النشاط والإيميل وكلمة المرور اللي يدخلها المستخدم
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // هنا خزنت الرسالة اللي تطلع للمستخدم بعد الإرسال ونوعها نجاح أو خطأ
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // هنا خزنت حالة الانتظار عشان أوقف الزر وقت الإرسال
  const [loading, setLoading] = useState(false);

  // هنا جبت أداة التنقل عشان أودي المستخدم لصفحة الدخول بعد التسجيل
  const navigate = useNavigate();

  // هنا جهزت دالة الإرسال اللي تشتغل لما المستخدم يضغط "إنشاء الحساب"
  const handleSubmit = async (event) => {
    event.preventDefault();

    // هنا جمعت البيانات بنفس الأسماء اللي ينتظرها الباك إند
    const formData = {
      full_name: businessName,
      email: email,
      password: password,
      role: accountType,
    };

    setLoading(true);
    setMessage("");

    try {
      // هنا أرسلت البيانات للباك وانتظرت الرد
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // هنا إذا نجح التسجيل أعرض رسالة نجاح وأودي المستخدم لصفحة الدخول
      if (response.status === 201) {
        setMessageType("success");
        setMessage("تم إنشاء حسابك بنجاح، جاري تحويلك لتسجيل الدخول");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      // هنا ترجمت أخطاء الباك لرسائل واضحة للمستخدم
      setMessageType("error");
      if (response.status === 409) {
        setMessage("هذا الإيميل مسجل من قبل، جربي تسجلين دخول");
      } else if (response.status === 400) {
        setMessage("تأكدي من البيانات وحاولي مرة ثانية");
      } else {
        setMessage("صار خطأ في الخادم، حاولي بعد شوي");
      }
    } catch {
      // هنا إذا ما قدر يوصل للباك أصلًا مثل انقطاع النت
      setMessageType("error");
      setMessage("ما قدرنا نوصل للخادم، تأكدي من اتصالك بالنت");
    } finally {
      // هنا رجعت الزر يشتغل بعد ما خلص الإرسال
      setLoading(false);
    }
  };

  return (
    <main className="register-page" dir="rtl">
      {/* هنا سويت قسم نموذج إنشاء الحساب */}
      <section className="register-form-section">
        <div className="register-logo">
          <span>
            {/* هنا رسمت أيقونة خط صاعد مثل شعار Figma */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 17 9 11 13 15 21 7" />
              <polyline points="15 7 21 7 21 13" />
            </svg>
          </span>
          <strong>مكسب</strong>
        </div>

        <div className="register-content">
          {/* هنا حطيت عنوان الصفحة والوصف */}
          <p className="register-subtitle">ابدئي مشروعك مع مكسب</p>
          <h1>أنشئي حساب أعمالك</h1>
          <p className="register-description">
            اختاري نوع الحساب وأدخلي بياناتك الأساسية.
          </p>

          {/* هنا سويت خيارين لنوع الحساب */}
          <div className="account-types">
            <button
              type="button"
              className={accountType === "merchant" ? "selected" : ""}
              onClick={() => setAccountType("merchant")}
              aria-pressed={accountType === "merchant"}
            >
              <strong>أسرة منتجة</strong>
              <small>أبحث عن المواد والتغليف بالجملة</small>
            </button>

            <button
              type="button"
              className={accountType === "supplier" ? "selected" : ""}
              onClick={() => setAccountType("supplier")}
              aria-pressed={accountType === "supplier"}
            >
              <strong>مورد</strong>
              <small>أعرض منتجات الجملة وأدير الطلبات</small>
            </button>
          </div>

          {/* هنا حطيت حقول التسجيل */}
          <form onSubmit={handleSubmit}>
            <label htmlFor="businessName">اسم النشاط التجاري</label>
            {/* هنا خليت المثال يتغير حسب نوع الحساب */}
            <input
              id="businessName"
              type="text"
              placeholder={accountType === "merchant" ? "مثال: معمول نورة" : "مثال: مستودع الخير للجملة"}
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              autoComplete="organization"
              required
            />

            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="password">كلمة المرور</label>
            <input
              id="password"
              type="password"
              placeholder="ثمانية أحرف على الأقل"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />

            {/* هنا خليت الزر يتوقف ويتغير كلامه وقت الإرسال */}
            <button className="register-submit" type="submit" disabled={loading}>
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>

            {/* هنا تطلع رسالة النجاح أو الخطأ */}
            {message && <p className={`form-message ${messageType}`}>{message}</p>}
          </form>

          <p className="register-login">
            لديك حساب؟ <a href="/login">سجلي الدخول</a>
          </p>
        </div>
      </section>

      {/* هنا سويت القسم الأخضر اللي يسار الصفحة */}
      <section className="register-brand-section">
        <div className="brand-circle"></div>

        <div className="brand-text">
          <p>مكسب لأعمال أوضح</p>
          <h2>
            من أول تكلفة،
            <br />
            إلى طلب جملة ناجح.
          </h2>
          <span>منصة واحدة للتسعير والشراء وإدارة الطلبات.</span>
        </div>
      </section>
    </main>
  );
}

export default Register;