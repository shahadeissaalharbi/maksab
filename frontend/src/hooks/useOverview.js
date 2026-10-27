import { useEffect, useState } from "react";
import { OVERVIEW_LOAD } from "../constants/overview.js";
import { getOverview } from "../services/overviewService.js";

// هنا نطلب بيانات المورد مع إحصائياته والطلبات، ونتحكم بتغيير حالة الطلب
export function useOverview() {
  const [supplier, setSupplier] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState(OVERVIEW_LOAD.LOADING);

  useEffect(() => {
    let isMounted = true;

    getOverview()
      .then(({ status: code, data }) => {
        if (!isMounted) return;

        if (code === 200) {
          setSupplier(data.supplier);
          setStats(data.stats);
          setOrders(data.orders ?? []);
          setStatus(OVERVIEW_LOAD.READY);
        } else {
          setStatus(OVERVIEW_LOAD.ERROR);
        }
      })
      .catch(() => {
        if (isMounted) setStatus(OVERVIEW_LOAD.ERROR);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // هنا نغير حالة طلب واحد محلياً، ولما ينربط الباك إند نرسلها له من هنا
  const changeOrderStatus = (orderId, newStatus) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return { supplier, stats, orders, status, changeOrderStatus };
}