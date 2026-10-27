import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes.js";

// هنا البانر اللي فوق صفحة التاجر، بنفس هوية صفحة التسجيل
function Banner() {
  return (
    <section className="banner">
      <div className="banner-circle"></div>

      <div className="banner-text">
        <p>مكسب لأعمال أوضح</p>
        <h2>من أول تكلفة، إلى طلب جملة ناجح.</h2>
        <span>احسبي تكلفة منتجك، واطلبي موادك من مكان واحد</span>
      </div>

      <Link to={ROUTES.CALCULATOR} className="banner-link">
        احسبي سعر منتجك
      </Link>
    </section>
  );
}

export default Banner;
