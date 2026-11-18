import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes.js";
import { NAV_ITEMS, OVERVIEW_TEXT, SOON_PAGES } from "../constants/overview.js";
import "../styles/SupplierSoon.css";

// هنا صفحة «قريبًا» داخل لوحة المورد: تطلع في الوسط، والقائمة الجانبية من SupplierLayout
// عشان نضيف صفحة جديدة: سطر في NAV_ITEMS وسطر في SOON_PAGES ومسار في App.jsx
function SupplierComingSoon({ pageId }) {
  const page = NAV_ITEMS.find((item) => item.id === pageId);

  return (
    <section className="ov-soon">
      <span className="ov-soon-badge">{OVERVIEW_TEXT.SOON}</span>
      <h1>{page.label}</h1>
      <p>{SOON_PAGES[pageId]}</p>
      <p className="ov-soon-note">{OVERVIEW_TEXT.SOON_NOTE}</p>
      <Link to={ROUTES.SUPPLIER_HOME} className="ov-soon-back">
        {OVERVIEW_TEXT.BACK_TO_OVERVIEW}
      </Link>
    </section>
  );
}

export default SupplierComingSoon;
