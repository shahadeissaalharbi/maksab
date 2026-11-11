import { getJson, putJson } from "./http.js";

const LOCATION_ENDPOINT = "/api/users/location";

// هنا أجيب موقع الحساب المحفوظ في الباك
export async function getMyLocation() {
  return getJson(LOCATION_ENDPOINT);
}

// هنا أحفظ موقع الحساب في الباك
export async function saveMyLocation({ latitude, longitude }) {
  return putJson(LOCATION_ENDPOINT, { latitude, longitude });
}