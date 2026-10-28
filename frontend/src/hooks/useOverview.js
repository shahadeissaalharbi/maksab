import { useEffect, useState } from "react";
import { HTTP_STATUS } from "../constants/messages.js";
import { LOAD_STATUS } from "../constants/market.js";
import { getOverview } from "../services/overviewService.js";

// هنا أجيب بيانات المورد وأرقامه وطلباته أول ما تفتح الصفحة
export function useOverview() {
  const [supplier, setSupplier] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState(LOAD_STATUS.LOADING);

  useEffect(() => {
    getOverview()
      .then(({ status: code, data }) => {
        if (code === HTTP_STATUS.OK) {
          setSupplier(data.supplier);
          setStats(data.stats);
          setOrders(data.orders || []);
          setStatus(LOAD_STATUS.READY);
        } else {
          setStatus(LOAD_STATUS.ERROR);
        }
      })
      .catch(() => setStatus(LOAD_STATUS.ERROR));
  }, []);

  // هنا أغير حالة طلب واحد في الصفحة، ولما ينربط الباك نرسلها له
  function changeOrderStatus(orderId, newStatus) {
    const updated = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updated);
  }

  return { supplier, stats, orders, status, changeOrderStatus };
}
