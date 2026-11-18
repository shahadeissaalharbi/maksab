import { useCallback, useState } from "react";
import { LOCATE_STATE, LOCATE_TIMEOUT_MS } from "../constants/map.js";

// هنا أطلب موقع الجهاز من المتصفح (مجاني وما يمر على أي خدمة)
export function useCurrentLocation(onFound) {
  const [state, setState] = useState(LOCATE_STATE.IDLE);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState(LOCATE_STATE.FAILED);
      return;
    }

    setState(LOCATE_STATE.LOCATING);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState(LOCATE_STATE.IDLE);
        onFound({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        // رقم 1 يعني المستخدم ما سمح
        setState(error.code === 1 ? LOCATE_STATE.DENIED : LOCATE_STATE.FAILED);
      },
      { enableHighAccuracy: true, timeout: LOCATE_TIMEOUT_MS },
    );
  }, [onFound]);

  return { state, locate };
}