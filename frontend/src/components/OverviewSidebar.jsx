import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { NAV_ITEMS, OVERVIEW_TEXT } from "../constants/overview.js";
import { ROUTES } from "../constants/routes.js";

// هنا القائمة الجانبية: الشعار وروابط لوحة المورد
function OverviewSidebar({ activeId }) {
  return (
    <aside className="ov-sidebar">
      <div className="ov-brand">
        <Logo />
        <span>{OVERVIEW_TEXT.ACCOUNT_TYPE}</span>
      </div>

      <nav className="ov-nav">
        {NAV_ITEMS.map((item) =>
          item.to ? (
            <Link
              key={item.id}
              to={item.to}
              className={item.id === activeId ? "active" : ""}
            >
              {item.label}
            </Link>
          ) : (
            <span key={item.id} className="ov-nav-soon">
              {item.label} <small>{OVERVIEW_TEXT.SOON}</small>
            </span>
          )
        )}
      </nav>

      <Link to={ROUTES.LANDING} className="ov-back">
        {OVERVIEW_TEXT.BACK_TO_PLATFORM}
      </Link>
    </aside>
  );
}

export default OverviewSidebar;
