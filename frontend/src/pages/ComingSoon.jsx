import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { ROUTES } from "../constants/routes.js";
import { COMING_SOON_TEXT } from "../constants/market.js";
import { getToken, getUser } from "../services/session.js";
import "../styles/Auth.css";
import "../styles/Trader.css";

// هنا صفحة مؤقتة للصفحات اللي لسا ما انبنت، والعنوان يجي من الرابط
function ComingSoon({ title }) {
  if (!getToken()) return <Navigate to={ROUTES.LOGIN} />;

  return (
    <div className="trader-page" dir="rtl">
      <Navbar userName={getUser()?.full_name} />

      <section className="market-hero coming-soon">
        <span className="market-badge">{COMING_SOON_TEXT.BADGE}</span>
        <h1>{title}</h1>
        <p>{COMING_SOON_TEXT.MESSAGE}</p>
        <Link to={ROUTES.TRADER_HOME} className="coming-soon-link">
          {COMING_SOON_TEXT.BACK}
        </Link>
      </section>
    </div>
  );
}

export default ComingSoon;