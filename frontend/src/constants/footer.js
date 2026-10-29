import { ROUTES } from "./routes.js";

// هنا كل نصوص الفوتر في مكان واحد
export const FOOTER_TEXT = {
  TAGLINE: "مكسب يدعم المشاريع المنزلية والصغيرة، شريكة رؤية 2030",
  VISION_NOTE:
    "رؤية 2030 تستهدف رفع مساهمة المنشآت الصغيرة والمتوسطة إلى 35% من الناتج المحلي",
  LINKS_TITLE: "روابط سريعة",
  CONTACT_TITLE: "تواصل معنا",
  EMAIL: "contact.maksab@gmail.com",
  COPYRIGHT: "© 2026 مكسب · مشروع Holberton School – أكاديمية طويق",
};

// هنا روابط الفوتر
export const FOOTER_LINKS = [
  { label: "الرئيسية", to: ROUTES.LANDING },
  { label: "حاسبة التسعير", to: ROUTES.CALCULATOR },
  { label: "سوق الجملة", to: ROUTES.TRADER_HOME },
];
