import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import PriceResult from "../components/PriceResult.jsx";
import {
  CALCULATOR_LIMITS,
  CALCULATOR_TEXT,
  PRICING_FIELDS,
} from "../constants/calculator.js";
import { ROLE_HOME, ROUTES } from "../constants/routes.js";
import { getToken, getUser } from "../services/session.js";
import { usePriceCalculator } from "../hooks/usePriceCalculator.js";
import "../styles/Auth.css";
import "../styles/Trader.css";
import "../styles/Calculator.css";

// هنا صفحة حاسبة التسعير: تكاليفك على اليمين، والسعر المقترح على اليسار، ويتحدث وأنتِ تكتبين
function Calculator() {
  const {
    values,
    setValue,
    visibleErrors,
    result,
    verified,
    fillExample,
    clearAll,
  } = usePriceCalculator();
  const user = getUser() || {};

  // اللي ما سجل دخول يرجع لصفحة الدخول، والمورد يرجع لصفحته
  if (!getToken()) return <Navigate to={ROUTES.LOGIN} />;
  if (user.role && user.role !== "merchant") {
    return <Navigate to={ROLE_HOME[user.role] || ROUTES.LOGIN} />;
  }

  return (
    <div className="trader-page" dir="rtl">
      <Navbar />

      <main className="cl-main">
        <header className="cl-header">
          <p className="cl-eyebrow">{CALCULATOR_TEXT.EYEBROW}</p>
          <h1>{CALCULATOR_TEXT.TITLE}</h1>
          <p className="cl-subtitle">{CALCULATOR_TEXT.SUBTITLE}</p>
        </header>

        <div className="cl-layout">
          <section className="cl-card">
            <div className="cl-card-head">
              <h2>{CALCULATOR_TEXT.INPUTS_TITLE}</h2>
              <div className="cl-actions">
                <button type="button" onClick={fillExample}>
                  {CALCULATOR_TEXT.EXAMPLE}
                </button>
                <button type="button" onClick={clearAll}>
                  {CALCULATOR_TEXT.CLEAR}
                </button>
              </div>
            </div>

            {PRICING_FIELDS.map((field) => (
              <div key={field.name} className="cl-field">
                <label htmlFor={`cl-${field.name}`}>
                  {field.label} <small>{field.hint}</small>
                </label>
                <div
                  className={`cl-input ${visibleErrors[field.name] ? "invalid" : ""}`}
                >
                  <input
                    id={`cl-${field.name}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={values[field.name]}
                    onChange={(event) =>
                      setValue(field.name, event.target.value)
                    }
                    placeholder="0"
                  />
                  <span>{field.unit}</span>
                </div>
                {visibleErrors[field.name] && (
                  <p className="cl-error">{visibleErrors[field.name]}</p>
                )}
              </div>
            ))}

            <div className="cl-field">
              <label htmlFor="cl-margin">
                {CALCULATOR_TEXT.MARGIN_LABEL}{" "}
                <small>{CALCULATOR_TEXT.MARGIN_HINT}</small>
              </label>
              <div className="cl-margin">
                <input
                  type="range"
                  min="0"
                  max={CALCULATOR_LIMITS.MAX_MARGIN}
                  value={values.margin || 0}
                  onChange={(event) => setValue("margin", event.target.value)}
                  aria-label={CALCULATOR_TEXT.MARGIN_LABEL}
                />
                <div
                  className={`cl-input ${visibleErrors.margin ? "invalid" : ""}`}
                >
                  <input
                    id="cl-margin"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max={CALCULATOR_LIMITS.MAX_MARGIN}
                    step="any"
                    value={values.margin}
                    onChange={(event) => setValue("margin", event.target.value)}
                  />
                  <span>%</span>
                </div>
              </div>
              {visibleErrors.margin && (
                <p className="cl-error">{visibleErrors.margin}</p>
              )}
            </div>
          </section>

          <PriceResult result={result} verified={verified} />
        </div>
      </main>
    </div>
  );
}

export default Calculator;
