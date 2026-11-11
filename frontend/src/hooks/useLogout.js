import { useNavigate } from "react-router-dom";
import { useCart } from "./useCart.js";
import { ROUTES } from "../constants/routes.js";
import { clearSession } from "../services/session.js";

// هنا تسجيل الخروج: يمسح الجلسة والسلة ويرجع لصفحة الدخول
export function useLogout() {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  return () => {
    clearSession();
    // السلة تخص الحساب، فنمسحها عشان ما تطلع لحساب ثاني
    clearCart();
    navigate(ROUTES.LOGIN);
  };
}
