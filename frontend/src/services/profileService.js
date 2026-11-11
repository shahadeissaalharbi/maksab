import { API_URL, USE_MOCK } from "../config.js";
import { getToken, updateUser } from "./session.js";

const ENDPOINTS = {
  PROFILE: "/api/users/profile",
  PASSWORD: "/api/users/password",
  ME: "/api/auth/me",
};

// هنا كل طلب يحتاج دخول يرسل التوكن
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// هنا أقرأ رمز الخطأ (code) اللي يرجعه الباك، لأن نفس الرقم 400 يجي لأسباب مختلفة
async function readErrorCode(response) {
  try {
    const body = await response.json();
    return body.code || null;
  } catch {
    return null;
  }
}

// هنا أقرا بيانات الحساب من الباك وأدمجها مع المحفوظة في المتصفح
export async function refreshAccount() {
  if (USE_MOCK) return;

  const response = await fetch(`${API_URL}${ENDPOINTS.ME}`, {
    headers: authHeaders(),
  });

  if (response.status === 200) {
    const { user } = await response.json();
    updateUser(user);
  }
}

// هنا أرسل بيانات الحساب المعدلة للباك، والمتصفح يحدث بياناته بعدها
export async function saveAccount(values) {
  if (!USE_MOCK) {
    const response = await fetch(`${API_URL}${ENDPOINTS.PROFILE}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(values),
    });

    if (response.status !== 200) return { status: response.status };
  }

  updateUser({ ...values, full_name: values.name });
  return { status: 200 };
}

// هنا أغير كلمة المرور بعد ما أرسل الحالية والجديدة
export async function changePassword(currentPassword, newPassword) {
  if (USE_MOCK) return { status: 200 };

  const response = await fetch(`${API_URL}${ENDPOINTS.PASSWORD}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  return { status: response.status, code: await readErrorCode(response) };
}

// هنا أحذف الحساب بعد ما أرسل كلمة المرور للتأكيد
export async function deleteAccount(password) {
  if (USE_MOCK) return { status: 200 };

  const response = await fetch(`${API_URL}${ENDPOINTS.PROFILE}`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ password }),
  });

  return { status: response.status, code: await readErrorCode(response) };
}
