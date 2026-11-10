// هنا أقل عدد حروف للاسم
const MIN_NAME_LENGTH = 2;

// هنا أتأكد إن الاسم حرفين على الأقل وفيه حروف، مو أرقام أو رموز بس
export function isValidName(value) {
  const name = String(value || "").trim();
  return name.length >= MIN_NAME_LENGTH && /\p{L}/u.test(name);
}
