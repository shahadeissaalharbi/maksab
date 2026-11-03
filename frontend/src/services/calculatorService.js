// الملف الوحيد اللي يكلم الباك في الحاسبة. الصفحات ما تكلم الباك بنفسها أبدًا.

import { postJson } from "./http.js";
import { toNumber } from "../utils/pricing.js";

const CALCULATOR_ENDPOINT = "/api/calculator/price";

/**
 * إرسال بيانات حاسبة التسعير للباك إند
 * متوافقة تماماً مع الـ API الجديد وشروط التحقق (costs, quantity, margin)
 */
export async function calculateProductPrice(calculatorData) {
  const payload = {
    costs: toNumber(calculatorData.costs),       // إجمالي التكاليف (يجب ألا تقل عن 0)
    quantity: toNumber(calculatorData.quantity),   // الكمية (يجب أن تكون أكبر من 0)
    margin: toNumber(calculatorData.margin),       // نسبة الربح (بين 0 وأقل من 100)
  };

  return await postJson(CALCULATOR_ENDPOINT, payload);
}










//ترسل هذه البيانات وتنتظر الرد من السيرفر للتأكد من مطابقة الحسابات وتوثيقها.