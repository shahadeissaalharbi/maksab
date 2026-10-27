import { useState, useEffect } from "react";
import { OVERVIEW_LOAD } from "../constants/overview.js";

export function useOverview() {
  const [supplier, setSupplier] = useState({ business_name: "متجر بيادر للتمور" });
  const [stats, setStats] = useState({
    total_sales: 15420,
    new_orders: 5,
    active_products: 12
  });
  const [orders, setOrders] = useState([
    { id: 1, customer_name: "سارة أحمد", total: 250, status: "جديد", date: "2026-10-24" },
    { id: 2, customer_name: "محمد خالد", total: 420, status: "قيد التنفيذ", date: "2026-10-23" }
  ]);
  const [status, setStatus] = useState(OVERVIEW_LOAD.SUCCESS);

  const changeOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  return { supplier, stats, orders, status, changeOrderStatus };
}