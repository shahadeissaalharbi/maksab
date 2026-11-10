import { getUser } from "../services/session.js";
import "../styles/AccountName.css";

// هنا اسم صاحب الحساب في الأعلى، وما يطلع إذا ما فيه حساب داخل
function AccountName({ className = "" }) {
  const name = getUser()?.full_name;

  if (!name) return null;

  return <strong className={`account-name ${className}`}>{name}</strong>;
}

export default AccountName;
