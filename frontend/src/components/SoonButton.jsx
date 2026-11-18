import { useEffect, useState } from "react";
import { SOON_TEXT } from "../constants/soon.js";
import "../styles/Soon.css";

// هنا زر لشي لسا ما انبنى: جنبه علامة قريبًا، ولما ينضغط تطلع جملة صغيرة تشرح وش بيصير
// variant: "button" زر كامل، أو "link" نص شكله مثل الرابط
function SoonButton({ label, note = SOON_TEXT.DEFAULT_NOTE, variant = "button" }) {
  const [open, setOpen] = useState(false);

  // هنا الجملة تختفي لحالها بعد 4 ثواني
  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => setOpen(false), SOON_TEXT.NOTE_MS);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <span className="soon-wrap">
      <button
        type="button"
        className={`soon-button is-${variant}`}
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        {label}
        <small className="soon-tag">{SOON_TEXT.TAG}</small>
      </button>
      {open && (
        <span className="soon-note" role="status">
          {note}
        </span>
      )}
    </span>
  );
}

export default SoonButton;
