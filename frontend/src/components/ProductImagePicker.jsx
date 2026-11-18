import { useId } from "react";
import { IMAGE_TEXT, IMAGE_UPLOAD_ENABLED } from "../constants/images.js";
import { useImageUpload } from "../hooks/useImageUpload.js";
import "../styles/ProductImage.css";

// هنا اختيار صورة المنتج: معاينة، واختيار أو تغيير أو إزالة، والرفع يبدأ أول ما تنختار الصورة
// value رابط الصورة الحالي، وonChange يوصله الرابط الجديد أو null لما تنشال
// compact نسخة صغيرة لبطاقة المنتج وقت التعديل
function ProductImagePicker({ value, onChange, onBusyChange, compact = false }) {
  const inputId = useId();
  const { error, upload, isUploading } = useImageUpload({
    onUploaded: onChange,
    onBusyChange,
  });

  // لو إعدادات الرفع مو موجودة نخفي الاختيار كله
  if (!IMAGE_UPLOAD_ENABLED) return null;

  const handleFile = (event) => {
    upload(event.target.files[0]);
    // نفضي الحقل عشان لو اختار نفس الصورة مرة ثانية يرتفع من جديد
    event.target.value = "";
  };

  return (
    <div className={`pi-box ${compact ? "is-compact" : ""}`}>
      {!compact && <span className="pi-label">{IMAGE_TEXT.LABEL}</span>}

      <div className="pi-row">
        <div className="pi-preview">
          {value ? (
            <img src={value} alt={IMAGE_TEXT.PREVIEW} />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h3l2-2h6l2 2h3v12H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          )}
        </div>

        <div className="pi-actions">
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="pi-input"
            onChange={handleFile}
            disabled={isUploading}
          />
          <label
            htmlFor={inputId}
            className={`pi-choose ${isUploading ? "is-busy" : ""}`}
          >
            {value ? IMAGE_TEXT.CHANGE : IMAGE_TEXT.CHOOSE}
          </label>
          {value && !isUploading && (
            <button
              type="button"
              className="pi-remove"
              onClick={() => onChange(null)}
            >
              {IMAGE_TEXT.REMOVE}
            </button>
          )}
        </div>
      </div>

      {isUploading && (
        <p className="pi-status" role="status">
          {IMAGE_TEXT.UPLOADING}
        </p>
      )}
      {error && (
        <p className="pi-error" role="alert">
          {error}
        </p>
      )}
      {!compact && !error && !isUploading && (
        <p className="pi-hint">{IMAGE_TEXT.HINT}</p>
      )}
    </div>
  );
}

export default ProductImagePicker;
