import { postJson } from "./http.js";

const AUTH_ENDPOINTS = Object.freeze({
  REGISTER: "/api/auth/register",
  LOGIN: "/api/auth/login",
});

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