import CostBreakdown from "./CostBreakdown.jsx";
import { CALCULATOR_TEXT } from "../constants/calculator.js";

const format = (number) => number.toLocaleString("en-US");

// هنا بطاقة النتيجة: السعر المقترح والربح والتفاصيل
function PriceResult({ result, verified }) {
  if (!result) {
    return (
      <section className="cl-result cl-empty">
        <p>{CALCULATOR_TEXT.EMPTY_RESULT}</p>
      </section>
    );
  }

  return (
    <section className="cl-result" aria-live="polite">
      <p className="cl-result-label">{CALCULATOR_TEXT.RESULT_TITLE}</p>
      <p className="cl-price">
        <strong>{format(result.suggestedPrice)}</strong> {CALCULATOR_TEXT.CURRENCY}
      </p>
      <p className="cl-per">{CALCULATOR_TEXT.PER_UNIT}</p>

      <dl className="cl-facts">
        <dt>{CALCULATOR_TEXT.COST_PER_UNIT}</dt>
        <dd>
          {format(result.costPerUnit)} {CALCULATOR_TEXT.CURRENCY}
        </dd>
        <dt>{CALCULATOR_TEXT.PROFIT_PER_UNIT}</dt>
        <dd className="cl-profit">
          {format(result.profitPerUnit)} {CALCULATOR_TEXT.CURRENCY}
        </dd>
        <dt>{CALCULATOR_TEXT.TOTAL_COST}</dt>
        <dd>
          {format(result.totalCost)} {CALCULATOR_TEXT.CURRENCY}
        </dd>
        <dt>{CALCULATOR_TEXT.TOTAL_PROFIT}</dt>
        <dd className="cl-profit">
          {format(result.totalProfit)} {CALCULATOR_TEXT.CURRENCY}
        </dd>
      </dl>

      <CostBreakdown result={result} />

      <p className="cl-formula">{CALCULATOR_TEXT.FORMULA}</p>
      {verified && <p className="cl-verified">{CALCULATOR_TEXT.VERIFIED}</p>}
    </section>
  );
}

export default PriceResult;