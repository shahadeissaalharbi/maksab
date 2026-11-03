//الملف الوحيد اللي يكلم الباك في الحاسبة. الصفحات ما تكلم الباك بنفسها أبدًا.


import { postJson } from "./http.js";
import { toNumber } from "../utils/pricing.js";

const CALCULATOR_ENDPOINT = "/api/calculator/price";

// هنا أرسل نفس الأرقام للباك عشان يتأكد، وأجرة العمل = الساعات × أجرة الساعة
export function verifyPrice(values) {
  return postJson(CALCULATOR_ENDPOINT, {
    material: toNumber(values.material),
    packaging: toNumber(values.packaging),
    labor: toNumber(values.hours) * toNumber(values.hourlyRate),
    quantity: toNumber(values.quantity),
    margin: toNumber(values.margin),
  });
}