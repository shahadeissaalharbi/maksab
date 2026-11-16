import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { ROUTES } from "../constants/routes.js";
import { NOT_FOUND_TEXT } from "../constants/notFound.js";
import "../styles/Auth.css";
import "../styles/Trader.css";

// هنا صفحة 404: تطلع لأي رابط ما له صفحة، بدل صفحة فاضية
function NotFound() {
  return (
    <div className="trader-page" dir="rtl">
      <section className="market-hero coming-soon">
        <Logo />
        <span className="market-badge">{NOT_FOUND_TEXT.BADGE}</span>
        <h1>{NOT_FOUND_TEXT.TITLE}</h1>
        <p>{NOT_FOUND_TEXT.MESSAGE}</p>
        <Link to={ROUTES.HOME} className="coming-soon-link">
          {NOT_FOUND_TEXT.BACK}
        </Link>
      </section>
    </div>
  );
}

export default NotFound;
