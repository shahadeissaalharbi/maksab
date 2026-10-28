import { USE_MOCK } from "../config.js";
import { getJson } from "./http.js";
import { MOCK_SUPPLIER_HOME } from "./mockSupplierHome.js";

const SUPPLIER_ENDPOINTS = Object.freeze({
  HOME: "/api/supplier/home",
});

// هنا أجيب بيانات لوحة المورد، والصفحة ما تعرف إذا هي مؤقتة أو من الباك
export async function getSupplierHome() {
  if (USE_MOCK) {
    return { status: 200, data: MOCK_SUPPLIER_HOME };
  }

  return getJson(SUPPLIER_ENDPOINTS.HOME);
}