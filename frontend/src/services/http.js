//دالة الارسال العامه
import { API_URL } from "../config.js";

// هنا دالة وحدة ترسل أي طلب POST للباك وترجع رقم الرد والبيانات
export async function postJson(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}