import React from "react";
import { useNavigate } from "react-router-dom";
import { NAV_ITEMS, OVERVIEW_TEXT } from "../constants/overview.js";

// هنا القائمة الجانبية: الشعار ونوع الحساب وروابط التنقل
function OverviewSidebar({ activeId, onSelect }) {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    // إذا كان الزر هو المنتجات والمخزون، نوجهه لصفحة المنتجات
    if (item.id === "products") {
      navigate("/supplier/products"); // أو المسار المعرّف لديك للمنتجات
    } else {
      onSelect(item.id);
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col justify-between">
      <div>
        {/* الشعار ونوع الحساب */}
        <div className="mb-8 border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-amber-400 flex items-center gap-1">
            {OVERVIEW_TEXT.BRAND} ↗
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {OVERVIEW_TEXT.ACCOUNT_TYPE}
          </p>
        </div>

        {/* قائمة الروابط */}
        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full text-right px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* زر العودة للمنصة */}
      <div className="pt-4 border-t border-slate-800">
        <button className="w-full text-right px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
          {OVERVIEW_TEXT.BACK_TO_PLATFORM}
        </button>
      </div>
    </aside>
  );
}

export default OverviewSidebar;