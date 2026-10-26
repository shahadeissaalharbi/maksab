import { MOCK_OVERVIEW } from "./mockOverview.js";

// زر التبديل: true = بيانات مؤقتة، false = البيانات الحقيقية من الباك إند
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

const OVERVIEW_ENDPOINTS = Object.freeze({
  DASHBOARD: "/api/supplier/dashboard",
});

// يجلب بيانات لوحة المورد، ويعرف الصفحة إذا هي مؤقتة أو من الباك إند
export async function getOverview() {
  if (USE_MOCK) {
    return { status: 200, data: MOCK_OVERVIEW };
  }
  
  const response = await fetch(OVERVIEW_ENDPOINTS.DASHBOARD, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
  });
  
  return { status: response.status, data: await response.json() };
}