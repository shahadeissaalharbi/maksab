import { useEffect, useState } from "react";
import { HTTP_STATUS, MESSAGE_TYPES } from "../constants/messages.js";
import { LOAD_STATUS } from "../constants/market.js";
import { getStatusError } from "../constants/overview.js";
import { getOverview, updateOrderStatus } from "../services/overviewService.js";
import { normalizeOrder } from "../utils/overviewOrders.js";

// هنا أجيب بيانات المورد وأرقامه وطلباته أول ما تفتح الصفحة
export function useOverview() {
  const [supplier, setSupplier] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState(LOAD_STATUS.LOADING);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getOverview()
      .then(({ status: code, data }) => {
        if (code === HTTP_STATUS.OK) {
          setSupplier(data.supplier);
          setStats(data.stats);
          setOrders((data.orders || []).map(normalizeOrder));
          setStatus(LOAD_STATUS.READY);
        } else {
          setStatus(LOAD_STATUS.ERROR);
        }
      })
      .catch(() => setStatus(LOAD_STATUS.ERROR));
  }, []);

  // هنا أغير حالة الطلب: أرسلها للباك أول، ولو انحفظت أغيرها في الصفحة
  async function changeOrderStatus(orderId, newStatus) {
    setMessage(null);

    try {
      const { status: code } = await updateOrderStatus(orderId, newStatus);

      if (code === HTTP_STATUS.OK) {
        setOrders((current) =>
          current.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order,
          ),
        );
        return;
      }
      setMessage({ type: MESSAGE_TYPES.ERROR, text: getStatusError(code) });
    } catch {
      setMessage({
        type: MESSAGE_TYPES.ERROR,
        text: getStatusError("NETWORK"),
      });
    }
  }

  return { supplier, stats, orders, status, message, changeOrderStatus };
}
