import { postJson } from "./http.js";

const AUTH_ENDPOINTS = {
  REGISTER: "/api/auth/register",
  LOGIN: "/api/auth/login",
  VERIFY_OTP: "/api/auth/verify-otp",
  RESEND_OTP: "/api/auth/resend-otp",
};

// التوثيق ما نزل على Railway للحين، فلما ينزل نخليها true
export const VERIFICATION_LIVE = true;
// هنا أحول بيانات الواجهة لنفس الأسماء اللي ينتظرها الباك
export const registerUser = ({ businessName, email, password, accountType }) =>
  postJson(AUTH_ENDPOINTS.REGISTER, {
    full_name: businessName,
    email,
    password,
    role: accountType,
  });

export const loginUser = ({ email, password }) =>
  postJson(AUTH_ENDPOINTS.LOGIN, { email, password });

// هنا أرسل رمز التحقق (6 أرقام) عشان يتوثق الحساب
export const verifyOtp = (email, code) =>
  postJson(AUTH_ENDPOINTS.VERIFY_OTP, { email, code });

// هنا أطلب رمز جديد لنفس الإيميل
export const resendVerification = (email) =>
  postJson(AUTH_ENDPOINTS.RESEND_OTP, { email });
