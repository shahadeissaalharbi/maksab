import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import OverviewSidebar from "../components/OverviewSidebar.jsx";
import OverviewStatCard from "../components/OverviewStatCard.jsx";
import OverviewOrderRow from "../components/OverviewOrderRow.jsx";
import AddProductModal from "../components/AddProductModal.jsx";
import { ROUTES } from "../constants/routes.js";
import { LOAD_STATUS } from "../constants/market.js";
import { HTTP_STATUS } from "../constants/messages.js";
import { OVERVIEW_TEXT } from "../constants/overview.js";
import { getToken } from "../services/session.js";
import { useOverview } from "../hooks/useOverview.js";
import { addSupplierProduct } from "../services/supplierService.js";
import { formatNumber, formatToday } from "../utils/overviewFormat.js";
import "../styles/Auth.css";
import "../styles/SupplierOverview.css";

// هنا صباح الخير قبل الساعة 12، وبعدها مساء الخير
function getSalutation() {
  return new Date().getHours() < 12 ? OVERVIEW_TEXT.GOOD_MORNING : OVERVIEW_TEXT.GOOD_EVENING;
}

// هنا النظرة العامة للمورد: الترحيب والأرقام وأحدث الطلبات
function SupplierOverview() {
  const { supplier, stats, orders, status, changeOrderStatus } = useOverview();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // هنا أضيف المنتج، وإذا انضاف أروح لصفحة المنتجات عشان يشوفه
  const handleAdd = async (product) => {
    const result = await addSupplierProduct(product);
    if (result.status === HTTP_STATUS.CREATED) {
      navigate(ROUTES.SUPPLIER_PRODUCTS);
    }
    return result;
  };

  // هنا اللي ما سجل دخول يرجع لصفحة الدخول
  if (!getToken()) return <Navigate to={ROUTES.LOGIN} />;

  if (status === LOAD_STATUS.LOADING) {
    return <p className="ov-state">{OVERVIEW_TEXT.LOADING}</p>;
  }

  if (status === LOAD_STATUS.ERROR) {
    return <p className="ov-state error">{OVERVIEW_TEXT.ERROR}</p>;
  }

  return (
    <div className="ov-page" dir="rtl">
      <OverviewSidebar activeId="overview" />

      <main className="ov-main">
        <header className="ov-header">
          <div>
            <p className="ov-date">{formatToday()}</p>
            <h1>{OVERVIEW_TEXT.greeting(getSalutation(), supplier.business_name)}</h1>
            <p className="ov-subtitle">{OVERVIEW_TEXT.newOrdersNotice(stats.new_orders)}</p>
          </div>
          <button type="button" className="ov-btn-primary ov-add" onClick={() => setShowModal(true)}>
            {OVERVIEW_TEXT.ADD_PRODUCT}
          </button>
        </header>

        <section className="ov-stats">
          <OverviewStatCard
            label={OVERVIEW_TEXT.STAT_SALES}
            value={`${formatNumber(stats.month_sales)} ${OVERVIEW_TEXT.CURRENCY}`}
          />
          <OverviewStatCard
            label={OVERVIEW_TEXT.STAT_NEW_ORDERS}
            value={formatNumber(stats.new_orders)}
            hint={OVERVIEW_TEXT.STAT_NEW_ORDERS_HINT}
          />
          <OverviewStatCard
            label={OVERVIEW_TEXT.STAT_PRODUCTS}
            value={formatNumber(stats.available_products)}
            hint={OVERVIEW_TEXT.productsOf(stats.total_products)}
          />
        </section>

        <section className="ov-panel">
          <div className="ov-panel-header">
            <div>
              <p className="ov-eyebrow">{OVERVIEW_TEXT.ORDERS_EYEBROW}</p>
              <h2>{OVERVIEW_TEXT.ORDERS_TITLE}</h2>
            </div>
            <span className="ov-link">{OVERVIEW_TEXT.VIEW_ALL_ORDERS}</span>
          </div>

          {orders.map((order) => (
            <OverviewOrderRow key={order.id} order={order} onStatusChange={changeOrderStatus} />
          ))}
        </section>

        <section className="ov-notice">
          <h3>{OVERVIEW_TEXT.DELIVERY_TITLE}</h3>
          <p>{OVERVIEW_TEXT.DELIVERY_BODY}</p>
        </section>
      </main>

      {showModal && <AddProductModal onClose={() => setShowModal(false)} onSubmit={handleAdd} />}
    </div>
  );
}

export default SupplierOverview;