import { useEffect } from "react";
import { CART_TEXT } from "../constants/cart.js";
import "../styles/CartNotice.css";

const NOTICE_MS = 3500;

// هنا تنبيه الحد: يطلع تحت الشاشة ويختفي لحاله
function CartNotice({ notice, onClose }) {
  useEffect(() => {
    if (!notice) return undefined;

    const timer = setTimeout(onClose, NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice, onClose]);

  if (!notice) return null;

  return (
    <div className="cart-notice" role="alert">
      <span>{notice.text}</span>
      <button type="button" onClick={onClose} aria-label={CART_TEXT.CLOSE}>
        ×
      </button>
    </div>
  );
}

export default CartNotice;
