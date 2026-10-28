const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};

export function saveSession(token, user) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

// هنا أقرا التوكن عشان أرسله مع الطلبات اللي تحتاج دخول
export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

// هنا أقرا بيانات المستخدم، ولو ما فيه أرجع null
export function getUser() {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
}

// هنا أمسح الجلسة عند تسجيل الخروج
export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}
