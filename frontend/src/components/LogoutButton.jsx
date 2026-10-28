import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes.js";
import { MARKET_TEXT } from "../constants/market.js";
import { clearSession } from "../services/session.js";

// هنا زر الخروج: يمسح الجلسة ويرجع لصفحة الدخول
function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate(ROUTES.LOGIN);
  };

  return (
    <button type="button" className="logout-button" onClick={handleLogout}>
      {MARKET_TEXT.LOGOUT}
    </button>
  );
}

export default LogoutButton;