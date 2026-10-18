// هنا حطيت عنوان الباك في مكان واحد عشان كل الصفحات تستخدمه
// وإذا كان العنوان فاضي في .env تروح الطلبات للـ proxy اللي في vite.config.js
export const API_URL = import.meta.env.VITE_API_URL ?? "";