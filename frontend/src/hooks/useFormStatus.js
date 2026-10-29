import { useState } from "react";
import { ERROR_MESSAGES, MESSAGE_TYPES } from "../constants/messages.js";

// هنا حالة الانتظار والرسالة اللي تحت الزر، تستخدمها كل صفحات النماذج
export function useFormStatus() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const showSuccess = (text) => setMessage({ type: MESSAGE_TYPES.SUCCESS, text });
  const showError = (text) => setMessage({ type: MESSAGE_TYPES.ERROR, text });

  // هنا أشغل الطلب، وأتعامل مع الانتظار وانقطاع النت في مكان واحد
  const run = async (request) => {
    setLoading(true);
    setMessage(null);

    try {
      await request();
    } catch {
      showError(ERROR_MESSAGES.NETWORK);
    } finally {
      setLoading(false);
    }
  };

  return { loading, message, showSuccess, showError, run };
}