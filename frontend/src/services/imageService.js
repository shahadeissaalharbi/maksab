import { CLOUDINARY, IMAGE_LIMITS, uploadUrl } from "../constants/images.js";

// هنا أصغر الصورة في المتصفح قبل الرفع، ولو المتصفح ما قدر يقراها أرجع null
async function shrinkImage(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      IMAGE_LIMITS.MAX_SIDE / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    // خلفية بيضاء عشان الصور الشفافة (PNG) ما تطلع خلفيتها سوداء
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    return await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", IMAGE_LIMITS.QUALITY),
    );
  } catch {
    return null;
  }
}

// هنا أرفع الصورة على Cloudinary وأرجع رابطها، ولو ما نجح الرفع أرجع null
export async function uploadProductImage(file) {
  const small = await shrinkImage(file);

  const body = new FormData();
  body.append("file", small || file);
  body.append("upload_preset", CLOUDINARY.UPLOAD_PRESET);

  const response = await fetch(uploadUrl(), { method: "POST", body });
  if (!response.ok) return null;

  const data = await response.json().catch(() => ({}));
  const url = data.secure_url;
  const fits = typeof url === "string" && url.length <= IMAGE_LIMITS.MAX_URL_LENGTH;
  return fits ? url : null;
}
