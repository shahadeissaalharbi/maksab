import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import CartLine from "../components/CartLine.jsx";
import FormMessage from "../components/FormMessage.jsx";
import { ROUTES } from "../constants/routes.js";
import { CART_TEXT, getOrderError } from "../constants/cart.js";
import { HTTP_STATUS, MESSAGE_TYPES } from "../constants/messages.js";
import { getToken, getUser } from "../services/session.js";
import { createOrder } from "../services/ordersService.js";
import { useCart } from "../hooks/useCart.js";
import "../styles/Auth.css";
import "../styles/Trader.css";
import "../styles/Cart.css";

// هنا صفحة السلة: تراجع الكميات وترسل الطلب، وكل مورد له طلب مستقل
function Cart() {
  const { items, total, changeQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const user = getUser() || {};

  // اللي ما سجل دخول يرجع لصفحة الدخول
  if (!getToken()) return <Navigate to={ROUTES.LOGIN} />;

  // هنا أقسم السلة حسب المورد
  const groups = {};
  for (const item of items) {
    const key = item.supplier_name || "—";
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }

  const handleCheckout = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { status } = await createOrder(items);

      // لو انسوى الطلب نفضي السلة ونوديه لطلباتي
      if (status === HTTP_STATUS.CREATED) {
        clearCart();
        navigate(`${ROUTES.MY_ORDERS}?placed=1`);
        return;
      }
      setMessage({ type: MESSAGE_TYPES.ERROR, text: getOrderError(status) });
    } catch {
      setMessage({ type: MESSAGE_TYPES.ERROR, text: getOrderError("NETWORK") });
    }
    setLoading(false);
  };

  return (
    <div className="trader-page" dir="rtl">
      <Navbar userName={user.full_name} />

      <main className="ct-main">
        <h1>{CART_TEXT.TITLE}</h1>

        {items.length === 0 && (
          <div className="ct-empty">
            <p>{CART_TEXT.EMPTY}</p>
            <Link to={ROUTES.TRADER_HOME} className="ct-back">
              {CART_TEXT.BACK_TO_MARKET}
            </Link>
          </div>
        )}

        {Object.keys(groups).map((supplierName) => {
          let subtotal = 0;
          for (const item of groups[supplierName]) {
            subtotal += item.price * item.quantity;
          }

          return (
            <section key={supplierName} className="ct-group">
              <header className="ct-group-head">
                <span>
                  {CART_TEXT.SUPPLIER}: <strong>{supplierName}</strong>
                </span>
                <span>
                  {CART_TEXT.SUBTOTAL}: {subtotal.toLocaleString("en-US")} {CART_TEXT.CURRENCY}
                </span>
              </header>

              {groups[supplierName].map((item) => (
                <CartLine
                  key={item.product_id}
                  item={item}
                  onChangeQuantity={changeQuantity}
                  onRemove={removeItem}
                />
              ))}
            </section>
          );
        })}

        {items.length > 0 && (
          <div className="ct-summary">
            <p className="ct-note">{CART_TEXT.SPLIT_NOTE}</p>
            <div className="ct-total">
              <span>{CART_TEXT.TOTAL}</span>
              <strong>
                {total.toLocaleString("en-US")} {CART_TEXT.CURRENCY}
              </strong>
            </div>

            <FormMessage message={message} />

            <button
              type="button"
              className="ct-checkout"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? CART_TEXT.CHECKING_OUT : CART_TEXT.CHECKOUT}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;