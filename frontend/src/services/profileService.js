import { API_URL, USE_MOCK } from "../config.js";
import { getToken, updateUser } from "./session.js";

// هنا أرسل بيانات النشاط المعدلة للباك
export async function updateProfile(data) {
  // لين يجهز رابط الباك، أحفظ البيانات في المتصفح بس
  if (USE_MOCK) {
    updateUser(data);
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

  // إذا انحفظت في الباك، أحدثها في المتصفح بعد
  if (response.status === 200) {
    updateUser(data);
  }

  return { status: response.status };
}
