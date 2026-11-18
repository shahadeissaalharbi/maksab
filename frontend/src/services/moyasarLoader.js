import { MOYASAR_FORM } from "../constants/payment.js";

let loading = null;

// هنا أضيف ملفات ميسّر للصفحة مرة وحدة بس
export function loadMoyasar() {
  if (loading) return loading;

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = MOYASAR_FORM.STYLE_URL;
  document.head.appendChild(style);

  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = MOYASAR_FORM.SCRIPT_URL;
    script.onload = () => resolve(window.Moyasar);
    // لو فشل أفضي loading عشان نقدر نحاول مرة ثانية
    script.onerror = () => {
      loading = null;
      reject(new Error("moyasar"));
    };
    document.head.appendChild(script);
  });

  return loading;
}
