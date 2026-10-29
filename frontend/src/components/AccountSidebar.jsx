import { NavLink } from "react-router-dom";
import { ACCOUNT_LINKS, MY_ORDERS_TEXT } from "../constants/myOrders.js";

// هنا قائمة "إدارة الحساب" اللي على الجنب
function AccountSidebar() {
  return (
    <aside className="mo-sidebar">
      <h3>{MY_ORDERS_TEXT.SIDEBAR_TITLE}</h3>

      {ACCOUNT_LINKS.map((link) =>
        link.to ? (
          <NavLink key={link.id} to={link.to}>
            {link.label}
          </NavLink>
        ) : (
          <span key={link.id} className="mo-soon">
            {link.label} <small>{MY_ORDERS_TEXT.SOON}</small>
          </span>
        )
      )}
    </aside>
  );
}

export default AccountSidebar;
