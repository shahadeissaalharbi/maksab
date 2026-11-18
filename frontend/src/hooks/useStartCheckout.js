import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { USE_MOCK } from "../config.js";
import { ROUTES } from "../constants/routes.js";
import { getOrderError, getOrderErrorMessage } from "../constants/cart.js";
import { HTTP_STATUS, MESSAGE_TYPES } from "../constants/messages.js";
import { createOrder } from "../services/ordersService.js";
import { createCheckout } from "../services/checkoutService.js";
import { saveCheckout } from "../services/checkoutStorage.js";

// هنا زر إتمام الطلب: يسوي فاتورة ويودي لصفحة الدفع
export function useStartCheckout(items, clearCart) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const showError = (text) => {
    setMessage({ type: MESSAGE_TYPES.ERROR, text });
    setLoading(false);
  };

  // الوضع التجريبي ما فيه دفع، فيسوي الطلب مباشرة مثل قبل
  const startMock = async () => {
    await createOrder(items);
    clearCart();
    navigate(`${ROUTES.MY_ORDERS}?placed=1`);
  };

  const startPayment = async () => {
    const { status, data } = await createCheckout(items);
    if (status === HTTP_STATUS.CREATED) {
      saveCheckout(data.checkout);
      navigate(ROUTES.PAYMENT);
      return;
    }
    showError(getOrderErrorMessage(status, data));
  };

  const start = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (USE_MOCK) await startMock();
      else await startPayment();
    } catch {
      showError(getOrderError("NETWORK"));
    }
  };

  return { start, loading, message };
}
