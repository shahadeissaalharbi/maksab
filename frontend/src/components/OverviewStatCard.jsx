import React from "react";

// هنا بطاقة رقم: العنوان والرقم الكبير وملاحظة تحته
function OverviewStatCard({ label, value, hint }) {
  return (
    <div className="ov-stat-card">
      <span className="ov-stat-label">{label}</span>
      <strong className="ov-stat-value">{value}</strong>
      <span className="ov-stat-hint">{hint}</span>
    </div>
  );
}

export default OverviewStatCard;
