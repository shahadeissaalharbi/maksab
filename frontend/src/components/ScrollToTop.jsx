import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// هنا كل ما تغيرت الصفحة أرجع لفوق، عشان الصفحة الجديدة ما تفتح من نص الشاشة
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
