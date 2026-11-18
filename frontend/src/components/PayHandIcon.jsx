// هنا رسمة يد ماسكة بطاقة، تطلع جنب عنوان صفحة الدفع
function PayHandIcon() {
  return (
    <svg className="pay-hand" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="56" className="pay-hand-bg" />
      <g transform="rotate(-14 62 46)">
        <rect
          x="30"
          y="26"
          width="64"
          height="40"
          rx="7"
          className="pay-hand-card"
        />
        <rect x="30" y="35" width="64" height="8" className="pay-hand-stripe" />
        <rect
          x="38"
          y="50"
          width="14"
          height="9"
          rx="2"
          className="pay-hand-chip"
        />
      </g>
      <path
        d="M22 92c6-10 14-18 24-21l22-5c4-1 8 2 7 6-1 3-3 5-6 5l-13 2 20-1c6 0 12-3 16-7l6-5c3-2 7-1 8 2 1 2 0 4-1 6l-12 13c-5 6-13 9-21 9H40l-8 6z"
        className="pay-hand-palm"
      />
    </svg>
  );
}

export default PayHandIcon;
