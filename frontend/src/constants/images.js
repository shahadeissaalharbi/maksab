// هنا إعدادات رفع صور المنتجات على Cloudinary (خدمة صور مجانية)
// الاسم والـpreset يجون من إعدادات Vercel، ولو ما انحطوا يختفي اختيار الصورة وكل شي يشتغل مثل قبل
export const CLOUDINARY = {
  CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "",
  UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "",
};

export const IMAGE_UPLOAD_ENABLED = Boolean(
  CLOUDINARY.CLOUD_NAME && CLOUDINARY.UPLOAD_PRESET,
);

export const uploadUrl = () =>
  `https://api.cloudinary.com/v1_1/${CLOUDINARY.CLOUD_NAME}/image/upload`;

// هنا نصغر الصورة قبل الرفع: أطول ضلع 1200 بكسل وجودة 82%، عشان ترتفع بسرعة من الجوال
export const IMAGE_LIMITS = {
  MAX_SIDE: 1200,
  QUALITY: 0.82,
  // لو المتصفح ما قدر يصغرها (مثل صور HEIC على الكمبيوتر) نرفعها زي ما هي لين هذا الحجم
  MAX_ORIGINAL_BYTES: 10 * 1024 * 1024,
  // رابط الصورة لازم يدخل في عمود image_url في الباك
  MAX_URL_LENGTH: 255,
};

// هنا صور الآيفون (HEIC) أحيانًا توصل بدون نوع، فنعرفها من الامتداد
export const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|heic|heif)$/i;

export const IMAGE_UPLOAD_STATE = {
  IDLE: "idle",
  UPLOADING: "uploading",
  ERROR: "error",
};

export const IMAGE_TEXT = {
  LABEL: "صورة المنتج (اختياري)",
  HINT: "صورة واضحة للمنتج، تطلع للأسر في سوق الجملة",
  CHOOSE: "اختيار صورة",
  CHANGE: "تغيير الصورة",
  REMOVE: "إزالة الصورة",
  UPLOADING: "جاري رفع الصورة...",
  NOT_IMAGE: "الملف لازم يكون صورة",
  TOO_BIG: "الصورة كبيرة، نرجو اختيار صورة أصغر من 10 ميجا",
  FAILED: "ما ارتفعت الصورة، نرجو المحاولة مرة ثانية",
  PREVIEW: "معاينة صورة المنتج",
  ALT: (name) => `صورة ${name}`,
};
