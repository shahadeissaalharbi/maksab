import { useState } from "react";
import { useCart } from "./useCart.js";
import { HTTP_STATUS } from "../constants/messages.js";
import { clearSession } from "../services/session.js";
import {
  changePassword,
  deleteAccount,
  saveAccount,
} from "../services/profileService.js";

// هنا الحركات اللي تسويها صفحة حسابي: حفظ البيانات وتغيير كلمة المرور وحذف الحساب
export function useProfileActions() {
  const { clearCart } = useCart();
  const [deleted, setDeleted] = useState(false);

  // هنا أي طلب يفشل بسبب الإنترنت يرجع حالة NETWORK بدل ما تتوقف الصفحة
  const safely =
    (action) =>
    async (...args) => {
      try {
        return await action(...args);
      } catch {
        return { status: "NETWORK" };
      }
    };

  // لو انحذف الحساب نمسح الجلسة (التوكن) والسلة، والصفحة توديه لصفحة الدخول
  const removeAccount = async (password) => {
    const result = await safely(deleteAccount)(password);

    if (result.status === HTTP_STATUS.OK) {
      clearSession();
      clearCart();
      setDeleted(true);
    }
    return result;
  };

  return {
    saveAccount: safely(saveAccount),
    changePassword: safely(changePassword),
    removeAccount,
    deleted,
  };
}
