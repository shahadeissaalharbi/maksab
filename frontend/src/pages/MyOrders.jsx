import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import AccountSidebar from "../components/AccountSidebar.jsx";
import FormMessage from "../components/FormMessage.jsx";
import MyOrderCard from "../components/MyOrderCard.jsx";
import OrderFilters from "../components/OrderFilters.jsx";
import { ROUTES } from "../constants/routes.js";
import { LOAD_STATUS } from "../constants/market.js";
import {
  MY_ORDERS_TEXT,
  ORDER_GROUP,
  ORDER_TRACK_TEXT,
} from "../constants/myOrders.js";
import { CART_TEXT } from "../constants/cart.js";
import { MESSAGE_TYPES } from "../constants/messages.js";
import { getToken, getUser } from "../services/session.js";
import { useMyOrders } from "../hooks/useMyOrders.js";
import "../styles/Auth.css";
import "../styles/Trader.css";
import "../styles/MyOrders.css";

// هنا صفحة طلباتي وإيصالاتي للأسرة المنتجة
function MyOrders() {
  const { orders, status } = useMyOrders();
  const user = getUser() || {};
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState("all");

  // هنا أعد كم طلب في كل تبويب، وأعرض بس اللي يطابق التبويب
  const counts = { all: orders.length };
  for (const order of orders) {
    const group = ORDER_GROUP[order.status] || "active";
    counts[group] = (counts[group] || 0) + 1;
  }
  const visibleOrders = orders.filter(
    (order) =>
      filter === "all" || (ORDER_GROUP[order.status] || "active") === filter,
  );

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
          {/* لو جاي من السلة بعد إرسال الطلب */}
          {searchParams.get("placed") && (
            <FormMessage
              message={{ type: MESSAGE_TYPES.SUCCESS, text: CART_TEXT.PLACED }}
            />
          )}

          {status === LOAD_STATUS.LOADING && (
            <p className="mo-state">{MY_ORDERS_TEXT.LOADING}</p>
          )}
          {status === LOAD_STATUS.ERROR && (
            <p className="mo-state error">{MY_ORDERS_TEXT.ERROR}</p>
          )}
          {status === LOAD_STATUS.READY && orders.length === 0 && (
            <p className="mo-state">{MY_ORDERS_TEXT.EMPTY}</p>
          )}

          {orders.length > 0 && (
            <OrderFilters
              selected={filter}
              counts={counts}
              onSelect={setFilter}
            />
          )}
          {orders.length > 0 && visibleOrders.length === 0 && (
            <p className="mo-state">{ORDER_TRACK_TEXT.EMPTY_FILTER}</p>
          )}

          {visibleOrders.map((order) => (
            <MyOrderCard key={order.id} order={order} />
          ))}
        </main>
      </div>
    </div>
  );
}

export default MyOrders;
