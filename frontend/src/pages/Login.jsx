import { useState } from "react";
import "./Auth.css";

// هنا جهزت صفحة تسجيل الدخول، وهي وحدة للأسرة المنتجة والمورد مع بعض
function Login() {
  // هنا خزنت الإيميل اللي يكتبه المستخدم
  const [email, setEmail] = useState("");

  // هنا خزنت كلمة المرور اللي يكتبها المستخدم
  const [password, setPassword] = useState("");

  // هنا جهزت دالة الدخول اللي تشتغل لما المستخدم يضغط "تسجيل الدخول"
  const handleSubmit = (event) => {
    // هنا منعت الصفحة تعيد التحميل
    event.preventDefault();

    // هنا جمعت البيانات بنفس الأسماء اللي ينتظرها الباك إند حق ريم
    const formData = {
      email: email,
      password: password,
    };

    // هنا طبعت البيانات للتجربة، وخبيت كلمة المرور عشان الأمان
    console.log("بيانات الدخول:", { ...formData, password: "********" });
  };

  return (
    <main className="register-page" dir="rtl">
      <section className="register-form-section">
        <div className="register-logo">
          <span>↗</span>
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

            {/* هنا حطيت زر الدخول */}
            <button className="register-submit" type="submit">
              تسجيل الدخول
            </button>
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