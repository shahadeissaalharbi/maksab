import { CALCULATOR_TEXT } from "../constants/calculator.js";

// هنا شريط يبين وين تروح التكلفة: مواد وتغليف وعمل
function CostBreakdown({ result }) {
  const parts = [
    { key: "material", label: CALCULATOR_TEXT.MATERIAL, value: result.material },
    { key: "packaging", label: CALCULATOR_TEXT.PACKAGING, value: result.packaging },
    { key: "labor", label: CALCULATOR_TEXT.LABOR, value: result.labor },
  ];

  return (
    <div className="cl-breakdown">
      <h3>{CALCULATOR_TEXT.BREAKDOWN_TITLE}</h3>

      <div className="cl-bar" role="img" aria-label={CALCULATOR_TEXT.BREAKDOWN_TITLE}>
        {parts.map((part) => (
          <span
            key={part.key}
            className={`cl-bar-${part.key}`}
            style={{ width: `${result.totalCost > 0 ? (part.value / result.totalCost) * 100 : 0}%` }}
          ></span>
        ))}
      </div>

      <ul className="cl-legend">
        {parts.map((part) => (
          <li key={part.key}>
            <i className={`cl-dot cl-bar-${part.key}`}></i>
            {part.label}
            <strong>
              {part.value.toLocaleString("en-US")} {CALCULATOR_TEXT.CURRENCY}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CostBreakdown;