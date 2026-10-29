import { ROUTES } from "./routes.js";

// هنا كل نصوص الفوتر في مكان واحد
export const FOOTER_TEXT = {
  TAGLINE: "مكسب للأسرة، مكسب للمورد، ومكسب للوطن",
  VISION_NOTE:
    "تستهدف رؤية 2030 رفع مساهمة المنشآت الصغيرة والمتوسطة في الناتج المحلي إلى 35%",
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
