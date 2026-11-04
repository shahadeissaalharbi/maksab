//الرابط يجي من .env، ولو ما فيه نستخدم رابط Railway.
export const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : "https://maksab-production-dca7.up.railway.app");
// هنا أختار مصدر بيانات السوق: مؤقت لين يجهز الباك، و false في .env يحوله للحقيقي
// هنا الموقع المنشور يستخدم الباك الحقيقي لحاله، والتجريبي يشتغل بس لو كتبنا VITE_USE_MOCK=true
export const USE_MOCK = import.meta.env.PROD
  ? import.meta.env.VITE_USE_MOCK === "true"
  : import.meta.env.VITE_USE_MOCK !== "false";
