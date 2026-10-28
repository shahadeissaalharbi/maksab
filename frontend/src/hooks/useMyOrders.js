import { useEffect, useState } from "react";
import { HTTP_STATUS } from "../constants/messages.js";
import { LOAD_STATUS } from "../constants/market.js";
import { getMyOrders } from "../services/myOrdersService.js";

// هنا أجيب الطلبات أول ما تفتح الصفحة
export function useMyOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState(LOAD_STATUS.LOADING);

  useEffect(() => {
    getMyOrders()
      .then(({ status: code, data }) => {
        if (code === HTTP_STATUS.OK) {
          setOrders(data.orders || []);
          setStatus(LOAD_STATUS.READY);
        } else {
          setStatus(LOAD_STATUS.ERROR);
        }
      })
      .catch(() => setStatus(LOAD_STATUS.ERROR));
  }, []);

  return { orders, status };
}
