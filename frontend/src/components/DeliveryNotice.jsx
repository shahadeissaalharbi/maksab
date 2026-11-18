import { Link } from "react-router-dom";
import { DELIVERY_NOTICE_TEXT } from "../constants/map.js";
import { ROUTES } from "../constants/routes.js";
import { useMyLocation } from "../hooks/useMyLocation.js";

// هنا تنبيه التوصيل في السلة: مجاني لموقعك، أو حدد موقعك قبل الدفع
// (لو تبون توقفون زر الدفع بدون موقع: نفس الـhook في الصفحة  const { saved } = useMyLocation())
function DeliveryNotice() {
  const { saved } = useMyLocation();

  if (!saved) {
    return (
      <div className="delivery-notice is-missing" role="status">
        <span>{DELIVERY_NOTICE_TEXT.NEEDS_LOCATION}</span>
        <Link to={ROUTES.PROFILE}>{DELIVERY_NOTICE_TEXT.SET_LOCATION}</Link>
      </div>
    );
  }

  return (
    <div className="delivery-notice" role="status">
      <span>{DELIVERY_NOTICE_TEXT.FREE}</span>
      <Link to={ROUTES.PROFILE}>{DELIVERY_NOTICE_TEXT.CHANGE}</Link>
    </div>
  );
}

export default DeliveryNotice;