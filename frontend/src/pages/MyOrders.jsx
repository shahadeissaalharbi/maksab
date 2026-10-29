import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import AccountSidebar from "../components/AccountSidebar.jsx";
import MyOrderCard from "../components/MyOrderCard.jsx";
import { ROUTES } from "../constants/routes.js";
import { LOAD_STATUS } from "../constants/market.js";
import { MY_ORDERS_TEXT } from "../constants/myOrders.js";
import { getToken, getUser } from "../services/session.js";
import { useMyOrders } from "../hooks/useMyOrders.js";
import "../styles/Auth.css";
import "../styles/Trader.css";
import "../styles/MyOrders.css";

// هنا صفحة طلباتي وإيصالاتي للأسرة المنتجة
function MyOrders() {
  const { orders, status } = useMyOrders();
  const user = getUser() || {};

  // اللي ما سجل دخول يرجع لصفحة الدخول
  if (!getToken()) return <Navigate to={ROUTES.LOGIN} />;

  return (
    <div className="trader-page" dir="rtl">
      <Navbar userName={user.full_name} />

      <div className="mo-layout">
        <AccountSidebar />

        <main className="mo-main">
          <header className="mo-header">
            <div>
              <p className="mo-eyebrow">{MY_ORDERS_TEXT.EYEBROW}</p>
              <h1>{MY_ORDERS_TEXT.TITLE}</h1>
            </div>
            <Link to={ROUTES.TRADER_HOME} className="mo-new">
              {MY_ORDERS_TEXT.NEW_ORDER}
            </Link>
          </header>

          {status === LOAD_STATUS.LOADING && <p className="mo-state">{MY_ORDERS_TEXT.LOADING}</p>}
          {status === LOAD_STATUS.ERROR && <p className="mo-state error">{MY_ORDERS_TEXT.ERROR}</p>}
          {status === LOAD_STATUS.READY && orders.length === 0 && (
            <p className="mo-state">{MY_ORDERS_TEXT.EMPTY}</p>
          )}

          {orders.map((order) => (
            <MyOrderCard key={order.id} order={order} />
          ))}
        </main>
      </div>
    </div>
  );
}

export default MyOrders;
