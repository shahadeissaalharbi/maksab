import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";
import ProfileMenu from "./ProfileMenu.jsx";
import { NAV_ITEMS, OVERVIEW_TEXT } from "../constants/overview.js";
import { ROUTES } from "../constants/routes.js";
import "../styles/SupplierSoon.css";

// هنا القائمة الجانبية: الشعار وروابط لوحة المورد
// NavLink يعرف الصفحة الحالية لحاله ويلونها، والصفحات اللي ما انبنت جنبها علامة قريبًا
function OverviewSidebar() {
  return (
    <aside className="ov-sidebar">
      <div className="ov-brand">
        <Logo />
        <span>{OVERVIEW_TEXT.ACCOUNT_TYPE}</span>
        <ProfileMenu onDark />
      </div>

      <nav className="ov-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            // end: «نظرة عامة» تتلون بس في /supplier، مو في كل صفحات اللوحة
            end={item.to === ROUTES.SUPPLIER_HOME}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {item.label}
            {item.soon && (
              <small className="ov-soon-tag">{OVERVIEW_TEXT.SOON}</small>
            )}
          </NavLink>
        ))}
      </nav>

      <Link to={ROUTES.LANDING} className="ov-back">
        {OVERVIEW_TEXT.BACK_TO_PLATFORM}
      </Link>
    </aside>
  );
}

export default OverviewSidebar;
