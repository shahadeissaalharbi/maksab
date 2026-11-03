//الملف الوحيد اللي يكلم الباك في الحاسبة. الصفحات ما تكلم الباك بنفسها أبدًا.


import { postJson } from "./http.js";
import { toNumber } from "../utils/pricing.js";

const CALCULATOR_ENDPOINT = "/api/calculator/price";

// هنا أرسل نفس الأرقام للباك عشان يتأكد، وأجرة العمل = الساعات × أجرة الساعة
export function verifyPrice(values) {
  return postJson(CALCULATOR_ENDPOINT, {
    material: toNumber(values.material), //تكلفة المواد
    packaging: toNumber(values.packaging), //تكلفة التغليف.
    labor: toNumber(values.hours) * toNumber(values.hourlyRate),//تكلفة أجرة العمل
    quantity: toNumber(values.quantity),//عدد القطع.
    margin: toNumber(values.margin),//نسبة الربح.
  });
}

//ترسل هذه البيانات وتنتظر الرد من السيرفر للتأكد من مطابقة الحسابات وتوثيقها.