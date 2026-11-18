import { useEffect, useState } from "react";
import { MOYASAR_FORM, FORM_STATE } from "../constants/payment.js";
import { paymentResultPath } from "../constants/routes.js";
import { loadMoyasar } from "../services/moyasarLoader.js";

// هنا أحمّل نموذج ميسّر وأشغله ببيانات الفاتورة اللي رجعها الباك
export function useMoyasarForm(checkout) {
  const [state, setState] = useState(FORM_STATE.LOADING);

  useEffect(() => {
    if (!checkout?.publishable_key) return;
    // لو المستخدم طلع قبل ما يخلص التحميل ما أشغل النموذج
    let left = false;

    loadMoyasar()
      .then((Moyasar) => {
        if (left) return;
        Moyasar.init({
          element: MOYASAR_FORM.ELEMENT,
          amount: checkout.amount_halalas,
          currency: checkout.currency,
          description: checkout.description,
          publishable_api_key: checkout.publishable_key,
          callback_url: window.location.origin + paymentResultPath(checkout.id),
          metadata: checkout.metadata,
          methods: MOYASAR_FORM.METHODS,
          supported_networks: MOYASAR_FORM.NETWORKS,
          language: MOYASAR_FORM.LANGUAGE,
          fixed_width: false,
        });
        setState(FORM_STATE.READY);
      })
      .catch(() => {
        if (!left) setState(FORM_STATE.FAILED);
      });

    return () => {
      left = true;
    };
  }, [checkout]);

  return state;
}
