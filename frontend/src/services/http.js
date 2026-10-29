import { API_URL } from "../config.js";
import { getToken } from "./session.js";

// هنا أجهز الهيدرز: نوع البيانات لو فيه body، والتوكن لو المستخدم داخل
function buildHeaders(hasBody) {
  const headers = {};
  const token = getToken();

  if (hasBody) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

// هنا أقرا رد الباك، ولو ما فيه JSON أرجع كائن فاضي
async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

// هنا POST: إرسال بيانات جديدة (تسجيل، دخول، إضافة منتج)
export async function postJson(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });
  return readResponse(response);
}

// هنا GET: جلب بيانات
export async function getJson(path) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: buildHeaders(false),
  });
  return readResponse(response);
}

// هنا PUT: تعديل شي موجود
export async function putJson(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });
  return readResponse(response);
}

// هنا DELETE: حذف شي موجود
export async function deleteJson(path) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: buildHeaders(false),
  });
  return readResponse(response);
}