// هنا أول حرف من اسم الحساب، يطلع داخل دائرة علامة حسابي
export function getInitial(name) {
  const first = Array.from(String(name || "").trim())[0];

  return first ? first.toUpperCase() : "؟";
}
