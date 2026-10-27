import React from "react";
import {
  ORDER_ACTION_LABEL,
  ORDER_STATUS_OPTIONS,
  OVERVIEW_TEXT,
} from "../constants/overview.js";
import { formatMoney } from "../utils/overviewFormat.js";

// صف طلب واحد: رقمه، عميله، عدد منتجاته، حالته، وزر الإجراء
function OverviewOrderRow({ order, onStatusChange }) {
  const isNew = order.status === "new";

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
      {/* رقم الطلب والعميل */}
      <div className="flex items-center gap-4">
        <span className="font-bold text-slate-900">#{order.id}</span>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {order.customer} · {order.district}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {OVERVIEW_TEXT.productsCount(order.items_count)}
          </p>
        </div>
      </div>

      {/* المبلغ */}
      <div className="text-left">
        <span className="text-sm font-bold text-slate-900">
          {formatMoney(order.total)} {OVERVIEW_TEXT.CURRENCY}
        </span>
      </div>

      {/* قائمة حالة الطلب */}
      <div className="flex items-center gap-3">
       <select
          value={order.status}
          onChange={(e) => onStatusChange(order.id, e.target.value)}
          aria-label="حالة الطلب"
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-amber-400"
        >
          {ORDER_STATUS_OPTIONS.map((option, index) => (
            <option 
              key={option.id || option.value || index} 
              value={option.id || option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* زر الإجراء المتغير بحسب الحالة */}
        <button
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            isNew
              ? "bg-amber-400 text-slate-950 hover:bg-amber-500"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {ORDER_ACTION_LABEL[order.status] || "التفاصيل"}
        </button>
      </div>
    </div>
  );
}

export default OverviewOrderRow;