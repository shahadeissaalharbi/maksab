import { useCallback, useEffect, useState } from "react";
import { HTTP_STATUS } from "../constants/messages.js";
import { getMyLocation, saveMyLocation } from "../services/locationService.js";

// هنا حالة الحفظ
export const SAVE_STATE = { IDLE: "idle", SAVING: "saving", SAVED: "saved", ERROR: "error" };

// هنا أجيب الموقع المحفوظ، وأحفظ الموقع الجديد في الباك
export function useMyLocation() {
  const [saved, setSaved] = useState(null);
  const [saveState, setSaveState] = useState(SAVE_STATE.IDLE);

  useEffect(() => {
    let ignore = false;
    getMyLocation()
      .then(({ status, data }) => {
        if (!ignore && status === HTTP_STATUS.OK) setSaved(data.location);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const save = useCallback(async (point) => {
    setSaveState(SAVE_STATE.SAVING);
    try {
      const { status, data } = await saveMyLocation(point);
      if (status === HTTP_STATUS.OK) {
        setSaved(data.location);
        setSaveState(SAVE_STATE.SAVED);
        return true;
      }
    } catch {
      // نفس رسالة الخطأ تحت
    }
    setSaveState(SAVE_STATE.ERROR);
    return false;
  }, []);

  return { saved, save, saveState };
}