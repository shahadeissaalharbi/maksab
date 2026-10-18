import { useState } from "react";
import { API_URL } from "../api.js";
import "./Auth.css";

// هنا جهزت صفحة تسجيل الدخول، وهي وحدة للأسرة المنتجة والمورد مع بعض
function Login() {
  // هنا خزنت الإيميل وكلمة المرور اللي يكتبها المستخدم
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // هنا خزنت الرسالة اللي تطلع للمستخدم ونوعها نجاح أو خطأ
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // هنا خزنت حالة الانتظار عشان أوقف الزر وقت الإرسال
  const [loading, setLoading] = useState(false);

  // هنا جهزت دالة الدخول اللي تشتغل لما المستخدم يضغط "تسجيل الدخول"
  const handleSubmit = async (event) => {
    event.preventDefault();

    // هنا جمعت البيانات بنفس الأسماء اللي ينتظرها الباك إند
    const formData = {
      email: email,
      password: password,
    };

    setLoading(true);
    setMessage("");

    try {
      // هنا أرسلت البيانات للباك وانتظرت الرد
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // هنا إذا نجح الدخول أحفظ التوكن وبيانات المستخدم في المتصفح
      if (response.status === 200) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const accountName = data.user.role === "supplier" ? "مورد" : "أسرة منتجة";
        setMessageType("success");
        setMessage(`أهلًا ${data.user.full_name}، تم تسجيل دخولك كـ ${accountName}`);
        return;
      }

      // هنا ترجمت أخطاء الباك لرسائل واضحة للمستخدم
      setMessageType("error");
      if (response.status === 401) {
        setMessage("الإيميل أو كلمة المرور غلط");
      } else if (response.status === 400) {
        setMessage("أدخلي الإيميل وكلمة المرور");
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
          {/* هنا حطيت عنوان الصفحة */}
          <p className="register-subtitle">أهلًا فيك من جديد</p>
          <h1>سجلي دخولك</h1>
          <p className="register-description">أدخلي الإيميل وكلمة المرور.</p>

          {/* هنا حطيت حقول الدخول */}
          <form onSubmit={handleSubmit}>
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
              placeholder="كلمة المرور"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            {/* هنا خليت الزر يتوقف ويتغير كلامه وقت الإرسال */}
            <button className="register-submit" type="submit" disabled={loading}>
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>

            {/* هنا تطلع رسالة النجاح أو الخطأ */}
            {message && <p className={`form-message ${messageType}`}>{message}</p>}
          </form>

          {/* هنا حطيت رابط يودي لصفحة إنشاء الحساب */}
          <p className="register-login">
            ما عندك حساب؟ <a href="/register">أنشئي حساب</a>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;