// هنا عنوان الباك، يجي من ملف .env وإذا كان فاضي تروح الطلبات للـ proxy
export const API_URL = import.meta.env.VITE_API_URL || "";

// هنا أختار مصدر بيانات السوق: مؤقت لين يجهز الباك، و false في .env يحوله للحقيقي
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";