//الرابط يجي من .env، ولو ما فيه نستخدم رابط Railway.
export const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://127.0.0.1:5000"
    : "https://maksab-production-dca7.up.railway.app");
// هنا أختار مصدر بيانات السوق: مؤقت لين يجهز الباك، و false في .env يحوله للحقيقي
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
