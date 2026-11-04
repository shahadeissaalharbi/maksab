import { USE_MOCK } from "../config.js";
import { getJson, patchJson } from "./http.js";
import { MOCK_OVERVIEW } from "./mockOverview.js";
import { BACKEND_STATUS } from "../constants/overview.js";

const OVERVIEW_ENDPOINTS = Object.freeze({
  DASHBOARD: "/api/supplier/dashboard",
});

// هنا أجيب بيانات النظرة العامة، مؤقتة أو من الباك
export async function getOverview() {
  if (USE_MOCK) {
    return { status: 200, data: MOCK_OVERVIEW };
  }

  return getJson(OVERVIEW_ENDPOINTS.DASHBOARD);
}

// هنا أرسل الحالة الجديدة للباك، وبالوضع المؤقت أرد نجاح على طول
export async function updateOrderStatus(orderId, uiStatus) {
  if (USE_MOCK) {
    return { status: 200, data: {} };
  }

  return patchJson(`/api/orders/${orderId}/status`, {
    status: BACKEND_STATUS[uiStatus],
  });
}
