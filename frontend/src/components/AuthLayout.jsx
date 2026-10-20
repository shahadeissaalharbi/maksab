import Logo from "./Logo.jsx";
import BrandPanel from "./BrandPanel.jsx";
import "../styles/Auth.css";

// هنا الإطار المشترك لصفحتي الدخول والتسجيل، والقسم الأخضر يطلع بس إذا الصفحة طلبته
function AuthLayout({ subtitle, title, description, showBrand = false, children }) {
  return (
    <main className="register-page" dir="rtl">
      <section className="register-form-section">
        <Logo />

        <div className="register-content">
          <p className="register-subtitle">{subtitle}</p>
          <h1>{title}</h1>
          <p className="register-description">{description}</p>
          {children}
        </div>
      </section>

      {showBrand && <BrandPanel />}
    </main>
  );
}

export default AuthLayout;