import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes.js";

// هنا البانر اللي فوق صفحة التاجر، بنفس هوية صفحة التسجيل
function Banner() {
  return (
    <section className="banner">
      <div className="banner-circle"></div>

      <div className="banner-text">
        <p>مكسب لأعمال أوضح</p>
        <h2>كل ريال يتوفر في الجملة… مكسب.</h2>
        <span>موادك وتغليفك بسعر المورد مباشرة، بدون وسيط</span>
      </div>

      <Link to={ROUTES.CALCULATOR} className="banner-link">
        مكسبك بالأرقام ←
      </Link>
    </section>
  );
}

export default Banner;
