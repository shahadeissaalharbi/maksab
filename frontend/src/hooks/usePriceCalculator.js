import { useEffect, useState } from "react";
import {
  CALCULATOR_LIMITS,
  EMPTY_PRICING,
  EXAMPLE_PRICING,
  PRICING_ERRORS,
} from "../constants/calculator.js";
import { HTTP_STATUS } from "../constants/messages.js";
import { verifyPrice } from "../services/calculatorService.js";
import { calculatePrice, validatePricing } from "../utils/pricing.js";

// هنا كل منطق الحاسبة: الخانات والحساب الفوري والتحقق من الباك
export function usePriceCalculator() {
  const [values, setValues] = useState(EMPTY_PRICING);
  const [touched, setTouched] = useState({});
  const [verified, setVerified] = useState(false);

  const errors = validatePricing(values, PRICING_ERRORS, CALCULATOR_LIMITS);
  const isValid = Object.keys(errors).length === 0;
  const result = isValid ? calculatePrice(values) : null;

  // الخطأ يبان بعد ما المستخدم يلمس الخانة، مو من أول لحظة
  const visibleErrors = {};
  for (const name of Object.keys(errors)) {
    if (touched[name]) visibleErrors[name] = errors[name];
  }

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setTouched((current) => ({ ...current, [name]: true }));
  };

  const fillExample = () => {
    setValues(EXAMPLE_PRICING);
    setTouched({});
  };

  const clearAll = () => {
    setValues(EMPTY_PRICING);
    setTouched({});
  };

  // هنا بعد ما يوقف عن الكتابة نتأكد من الباك. لو ما رد زين، نسكت والحساب المحلي يكفي
  useEffect(() => {
    setVerified(false);
    if (!isValid) return undefined;

    const timer = setTimeout(() => {
      verifyPrice(values)
        .then(({ status, data }) => {
          if (status === HTTP_STATUS.OK && data.suggested_price === result.suggestedPrice) {
            setVerified(true);
          }
        })
        .catch(() => setVerified(false));
    }, CALCULATOR_LIMITS.VERIFY_DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  return { values, setValue, visibleErrors, result, verified, fillExample, clearAll };
}