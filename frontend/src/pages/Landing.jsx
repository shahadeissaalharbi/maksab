import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { ROUTES } from "../constants/routes.js";
import "../styles/Auth.css";
import "../styles/Landing.css";

// هنا خطوات "كيف يشتغل مكسب"
const steps = [
  { icon: "/icons/calculator.svg", title: "تسعير بالأرقام", text: "حاسبة تعرّفك تكلفة منتجك وسعره الصح" },
  { icon: "/icons/shopping-cart.svg", title: "شراء بالجملة", text: "موادك وتغليفك من موردين سعوديين مباشرة" },
  { icon: "/icons/trending-up.svg", title: "مكسب أوضح", text: "تكلفة أقل، وربح واضح بالأرقام" },
];
  {
    number: "٢",
    title: "شراء بالجملة",
    text: "موادك وتغليفك من موردين سعوديين مباشرة",
  },
  { number: "٣", title: "مكسب أوضح", text: "تكلفة أقل، وربح واضح بالأرقام" },
];

// هنا الصفحة الأولى اللي يشوفها الزائر، ومفتوحة بدون حساب
function Landing() {
  return (
    <div className="landing" dir="rtl">
      <header className="landing-header">
        <Logo />
        <nav>
          <Link to={ROUTES.LOGIN} className="landing-login">
            تسجيل الدخول
          </Link>
          <Link to={ROUTES.REGISTER} className="landing-button">
            إنشاء حساب
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-circle"></div>
        <p className="landing-kicker">مكسب لأعمال أوضح</p>
        <h1>من أول تكلفة، إلى طلب جملة ناجح.</h1>
        <p className="landing-text">
          منصة تجمع الأسر المنتجة والموردين: تسعير أوضح، وشراء بالجملة من مكان
          واحد.
        </p>
        <div className="landing-actions">
          <Link to={ROUTES.REGISTER} className="landing-button">
            إنضمام لمكسب
          </Link>
          <Link to={ROUTES.LOGIN} className="landing-outline">
            عندي حساب
          </Link>
        </div>
      </section>

      <section className="landing-section">
        <h2>كيف يشتغل مكسب؟</h2>
        <div className="landing-steps">
          {steps.map((step) => (
                       <div key={step.title} className="landing-step">
              <img src={step.icon} alt="" className="landing-step-icon" />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2>لمين مكسب؟</h2>
        <div className="landing-cards">
          <div className="landing-card">
            <h3>أسرة منتجة</h3>
            <p>موادي وتغليفي بالجملة، بسعر يرفع مكسبي</p>
          </div>
          <div className="landing-card yellow">
            <h3>مورد</h3>
            <p>بضاعتي توصل لأسر منتجة في كل مكان</p>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <h2>مشروعك يستاهل مكسب أكبر</h2>
        <Link to={ROUTES.REGISTER} className="landing-button">
          يلا نبدأ ←
        </Link>
      </section>

      <footer className="landing-footer">
        <Logo />
        <p>© 2026 مكسب · مشروع Holberton School – أكاديمية طويق</p>
      </footer>
    </div>
  );
}

export default Landing;
