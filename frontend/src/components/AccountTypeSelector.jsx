import { ACCOUNT_TYPES_ARRAY } from "../constants/accountTypes.js";

// هنا بطاقات نوع الحساب، تتولد من القائمة فأي نوع جديد يطلع لحاله
function AccountTypeSelector({ selected, onSelect }) {
  return (
    <div className="account-types">
      {ACCOUNT_TYPES_ARRAY.map((type) => {
        const isSelected = type.value === selected.value;

        return (
          <button
            key={type.value}
            type="button"
            className={isSelected ? "selected" : ""}
            onClick={() => onSelect(type)}
            aria-pressed={isSelected}
          >
            <strong>{type.label}</strong>
            <small>{type.description}</small>
          </button>
        );
      })}
    </div>
  );
}

export default AccountTypeSelector;