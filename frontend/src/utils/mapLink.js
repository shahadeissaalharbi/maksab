// هنا أطلع الإحداثيات من رابط خرائط Google أو من «24.71, 46.67» مكتوبة
// أمثلة: .../@24.7136,46.6753,15z  و  ?q=24.7136,46.6753  و  ?query=24.7136,46.6753
const PATTERNS = [
  /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /[?&](?:q|query|ll|center)=(-?\d+(?:\.\d+)?)(?:,|%2C)\s*(-?\d+(?:\.\d+)?)/i,
  /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/,
];

// هنا أتأكد إن الرقمين ممكن يكونون موقع على الأرض
const isOnEarth = (latitude, longitude) =>
  Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;

export function parseMapLink(text) {
  const value = String(text || "").trim();

  for (const pattern of PATTERNS) {
    const match = value.match(pattern);
    if (!match) continue;

    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (isOnEarth(latitude, longitude)) return { latitude, longitude };
  }

  return null;
}