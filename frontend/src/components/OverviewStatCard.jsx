import React from "react";

// بطاقة إحصائية تعرض العنوان، القيمة الكبيرة، وملاحظة توضيحية تحتها
function OverviewStatCard({ label, value, hint, hintTone = "green" }) {
  const toneClass = hintTone === "red" ? "text-red-500" : "text-emerald-500";

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <div className="my-3">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
      </div>
      {hint && <span className={`text-xs font-semibold ${toneClass}`}>{hint}</span>}
    </div>
  );
}

export default OverviewStatCard;