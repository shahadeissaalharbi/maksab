const PHONE_PATTERN = /^(05|\+9665)\d{8}$/;
const COMMERCIAL_REGISTER_PATTERN = /^\d{10}$/;
const MIN_PASSWORD_LENGTH = 8;

// هنا الجوال اختياري، وإذا انكتب لازم يكون 05xxxxxxxx أو +9665xxxxxxxx
export const isValidPhone = (value) =>
  value === "" || PHONE_PATTERN.test(value);

// هنا السجل التجاري اختياري، وإذا انكتب لازم يكون 10 أرقام
export const isValidCommercialRegister = (value) =>
  value === "" || COMMERCIAL_REGISTER_PATTERN.test(value);

// هنا كلمة المرور 8 أحرف أو أكثر مثل الباك
export const isValidPassword = (value) => value.length >= MIN_PASSWORD_LENGTH;
