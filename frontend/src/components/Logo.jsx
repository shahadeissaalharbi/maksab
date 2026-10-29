// هنا سويت قطعة الشعار
function Logo() {
  // هنا بدأت الشكل
  return (
    // هنا الصندوق اللي يجمع الأيقونة والاسم
    <div className="register-logo">
      {/* هنا المربع الأخضر بالإطار الأصفر */}
      <span>
        {/* هنا رسمت أيقونة الخط الصاعد */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {/* هنا الخط الصاعد */}
          <polyline points="3 17 9 11 13 15 21 7" />
          {/* هنا رأس السهم */}
          <polyline points="15 7 21 7 21 13" />
        </svg>
      </span>
      {/* هنا كلمة مكسب */}
      <strong>مكسب</strong>
    </div>
  );
}

// هنا صدرت الشعار عشان أستخدمه في أي مكان
export default Logo;