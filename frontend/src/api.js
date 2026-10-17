// هنا حطيت عنوان الباك في مكان واحد عشان كل الصفحات تستخدمه
// وإذا ما لقى العنوان في ملف .env يستخدم الباك اللي على الجهاز
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";