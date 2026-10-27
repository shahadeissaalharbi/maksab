import { API_URL, USE_MOCK } from "../config.js";
import { getToken } from "./session.js";

// هنا أرسل بيانات النشاط المعدلة للباك
export async function updateProfile(data) {
  // لين يجهز رابط الباك، أطبع البيانات بس وأرجع إنها انحفظت
  if (USE_MOCK) {
    console.log("بيانات النشاط:", data);
    return { status: 200 };
  }

  const response = await fetch(`${API_URL}/api/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  return { status: response.status };
}
