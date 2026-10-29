import { postJson } from "./http.js";

const AUTH_ENDPOINTS = {
  REGISTER: "/api/auth/register",
  LOGIN: "/api/auth/login",
  RESEND_VERIFICATION: "/api/auth/resend-verification",
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

// هنا أطلب رابط توثيق جديد لنفس الإيميل
export const resendVerification = (email) =>
  postJson(AUTH_ENDPOINTS.RESEND_VERIFICATION, { email });
