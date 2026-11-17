import { useState } from "react";
import {
  IMAGE_EXTENSIONS,
  IMAGE_LIMITS,
  IMAGE_TEXT,
  IMAGE_UPLOAD_STATE,
} from "../constants/images.js";
import { uploadProductImage } from "../services/imageService.js";

// هنا أتأكد إن الملف صورة: من نوعه، أو من امتداده لو النوع فاضي
function isImage(file) {
  return file.type.startsWith("image/") || IMAGE_EXTENSIONS.test(file.name);
}

// هنا رفع صورة وحدة: يتأكد من الملف ويرفعه، ويوصل الرابط للنموذج
// onBusyChange يعلم النموذج إن الرفع شغال، عشان زر الحفظ ينتظر
export function useImageUpload({ onUploaded, onBusyChange }) {
  const [state, setState] = useState(IMAGE_UPLOAD_STATE.IDLE);
  const [error, setError] = useState("");

  const fail = (text) => {
    setState(IMAGE_UPLOAD_STATE.ERROR);
    setError(text);
  };

  const upload = async (file) => {
    if (!file) return;
    if (!isImage(file)) return fail(IMAGE_TEXT.NOT_IMAGE);
    if (file.size > IMAGE_LIMITS.MAX_ORIGINAL_BYTES) {
      return fail(IMAGE_TEXT.TOO_BIG);
    }

    setState(IMAGE_UPLOAD_STATE.UPLOADING);
    setError("");
    onBusyChange?.(true);

    try {
      const url = await uploadProductImage(file);
      if (url) {
        onUploaded(url);
        setState(IMAGE_UPLOAD_STATE.IDLE);
      } else {
        fail(IMAGE_TEXT.FAILED);
      }
    } catch {
      fail(IMAGE_TEXT.FAILED);
    } finally {
      onBusyChange?.(false);
    }
  };

  return {
    error,
    upload,
    isUploading: state === IMAGE_UPLOAD_STATE.UPLOADING,
  };
}
