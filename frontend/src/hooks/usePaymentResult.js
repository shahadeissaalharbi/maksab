import { useEffect, useState } from "react";
import { HTTP_STATUS } from "../constants/messages.js";
import {
  CHECKOUT_STATUS,
  RESULT_CHECK,
  RESULT_STATE,
} from "../constants/payment.js";
import { getCheckout } from "../services/checkoutService.js";
import { forgetCheckout } from "../services/checkoutStorage.js";
import { useCart } from "./useCart.js";

const NOT_PAID = [CHECKOUT_STATUS.FAILED, CHECKOUT_STATUS.CANCELLED];

// هنا ما أصدق الرابط، أسأل الباك كم مرة لين يأكد الـ webhook الدفع
export function usePaymentResult(checkoutId, shouldCheck) {
  const { clearCart } = useCart();
  const [state, setState] = useState(RESULT_STATE.CHECKING);

  useEffect(() => {
    if (!shouldCheck) return;
    let tries = 0;
    let timer = null;
    let left = false;

    const check = async () => {
      tries += 1;
      try {
        const { status, data } = await getCheckout(checkoutId);
        if (left) return;
        const current = status === HTTP_STATUS.OK ? data.checkout.status : null;

        if (current === CHECKOUT_STATUS.PAID) {
          clearCart();
          forgetCheckout();
          setState(RESULT_STATE.PAID);
          return;
        }
        if (NOT_PAID.includes(current)) {
          setState(RESULT_STATE.FAILED);
          return;
        }
      } catch {
        // لو النت فصل أكمل للمحاولة الجاية
      }

      // خلصت المحاولات وهي للحين pending
      if (tries >= RESULT_CHECK.TRIES) {
        if (!left) setState(RESULT_STATE.WAITING);
        return;
      }
      timer = setTimeout(check, RESULT_CHECK.EVERY_MS);
    };

    check();
    return () => {
      left = true;
      clearTimeout(timer);
    };
  }, [checkoutId, shouldCheck, clearCart]);

  return state;
}
