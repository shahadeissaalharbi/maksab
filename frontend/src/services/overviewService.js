import { USE_MOCK } from "../config.js";
import { getJson } from "./http.js";
import { MOCK_OVERVIEW } from "./mockOverview.js";

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
