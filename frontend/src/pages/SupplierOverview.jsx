import { useState } from "react";
import "../styles/SupplierOverview.css";
import OverviewOrderRow from "../components/OverviewOrderRow.jsx";
import OverviewSidebar from "../components/OverviewSidebar.jsx";
import OverviewStatCard from "../components/OverviewStatCard.jsx";
import { OVERVIEW_LOAD, OVERVIEW_TEXT } from "../constants/overview.js";
import { useOverview } from "../hooks/useOverview.js";
import { formatNumber, formatToday } from "../utils/overviewFormat.js";
import "../styles/Auth.css";

const getSalutation = () =>
  new Date().getHours() < 12
    ? OVERVIEW_TEXT.GOOD_MORNING
    : OVERVIEW_TEXT.GOOD_EVENING;

function SupplierOverview() {
  const [activeNav, setActiveNav] = useState("overview");
  const { supplier, stats, orders, status, changeOrderStatus } = useOverview();

  if (status === OVERVIEW_LOAD.LOADING) {
    return (
      <div className="ov-page" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p className="ov-state-message">{OVERVIEW_TEXT.LOADING}</p>
      </div>
    );
  }

  if (status === OVERVIEW_LOAD.ERROR) {
    return (
      <div className="ov-page" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p className="ov-state-message" style={{ color: "#ef4444" }}>{OVERVIEW_TEXT.ERROR}</p>
      </div>
    );
  }

  return (
    <div className="ov-page" dir="rtl">
      {/* القائمة الجانبية */}
      <OverviewSidebar activeId={activeNav} onSelect={setActiveNav} />

      {/* المحتوى الرئيسي */}
      <main className="ov-main">
        {/* الترويسة العليا */}
        <div className="ov-page-header">
          <div>
            <p className="ov-today">{formatToday()}</p>
            <h1>
              {OVERVIEW_TEXT.greeting(getSalutation(), supplier?.business_name)}
            </h1>
            <p className="ov-subtitle">
              {OVERVIEW_TEXT.newOrdersNotice(stats?.new_orders ?? 0)}
            </p>
          </div>
          <button className="ov-add-product">
            {OVERVIEW_TEXT.ADD_PRODUCT}
          </button>
        </div>

        {/* البطاقات الإحصائية الثلاث */}
        <div className="ov-stat-row">
          <OverviewStatCard
            label="إجمالي المبيعات"
            value={`${formatNumber(stats?.total_sales ?? 0)} ر.س`}
            hint="+12% عن الشهر الماضي"
            hintTone="green"
          />
          <OverviewStatCard
            label="الطلبات الجديدة"
            value={formatNumber(stats?.new_orders ?? 0)}
            hint="تحتاج إلى مراجعة"
            hintTone="green"
          />
          <OverviewStatCard
            label="المنتجات النشطة"
            value={formatNumber(stats?.active_products ?? 0)}
            hint="متوفرة في المتجر"
            hintTone="green"
          />
        </div>

        {/* قسم الطلبات */}
        <div className="ov-orders-card">
          <div className="ov-orders-header">
            <div>
              <p className="ov-eyebrow">{OVERVIEW_TEXT.ORDERS_EYEBROW}</p>
              <h2>{OVERVIEW_TEXT.ORDERS_TITLE}</h2>
            </div>
            <button className="ov-link-button">
              {OVERVIEW_TEXT.VIEW_ALL_ORDERS}
            </button>
          </div>

          <div>
            {orders.map((order) => (
              <OverviewOrderRow
                key={order.id}
                order={order}
                onStatusChange={changeOrderStatus}
              />
            ))}
          </div>
        </div>

        {/* قسم مسؤولية التوصيل */}
        <div className="ov-delivery-note">
          <h3>{OVERVIEW_TEXT.DELIVERY_TITLE}</h3>
          <p>{OVERVIEW_TEXT.DELIVERY_BODY}</p>
        </div>
      </main>
    </div>
  );
}

export default SupplierOverview;