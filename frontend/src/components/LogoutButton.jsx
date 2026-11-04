import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes.js";
import { MARKET_TEXT } from "../constants/market.js";
import { clearSession } from "../services/session.js";
import { useCart } from "../hooks/useCart.js";

// هنا زر الخروج: يمسح الجلسة ويرجع لصفحة الدخول
function LogoutButton() {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const handleLogout = () => {
    clearSession();
    // السلة تخص الحساب، فنمسحها عشان ما تطلع لحساب ثاني
    clearCart();
    navigate(ROUTES.LOGIN);
  };

  return (
    <button type="button" className="logout-button" onClick={handleLogout}>
      {MARKET_TEXT.LOGOUT}
    </button>
  );
}

export default LogoutButton;