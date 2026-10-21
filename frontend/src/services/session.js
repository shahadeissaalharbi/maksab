const STORAGE_KEYS = Object.freeze({
  TOKEN: "token",
  USER: "user",
});

// هنا أحفظ التوكن وبيانات المستخدم بعد الدخول
export function saveSession(token, user) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}