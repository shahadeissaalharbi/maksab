import { useEffect, useState } from "react";

// هنا Google ينادي window.gm_authFailure لو رفض المفتاح (غلط أو مو مسموح لموقعنا)
// فنعرف ونرجع للخريطة المضمنة بدل خريطة رمادية
export function useMapsAuthFailure() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const previous = window.gm_authFailure;
    window.gm_authFailure = () => {
      setFailed(true);
      if (previous) previous();
    };
    return () => {
      window.gm_authFailure = previous;
    };
  }, []);

  return failed;
}