import { NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";
import ProfileMenu from "./ProfileMenu.jsx";
import { NAV_LINKS } from "../constants/market.js";
import { CART_TEXT } from "../constants/cart.js";
import { ROUTES } from "../constants/routes.js";
import { getUser } from "../services/session.js";
import { useCart } from "../hooks/useCart.js";

// هنا الشريط العلوي، والروابط تجي من الصفحة عشان التاجر والمورد يستخدمونه
function Navbar({ links = NAV_LINKS }) {
  const { items } = useCart();
  const user = getUser() || {};

  // السلة تطلع للأسرة المنتجة بس
  const showCart = user.role === "merchant";

  return (
    <header className="navbar">
      <Logo />

      <nav className="navbar-links">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="navbar-user">
        {showCart && (
          <NavLink to={ROUTES.CART} className="navbar-cart">
            {CART_TEXT.NAV_LABEL}
            {items.length > 0 && (
              <span className="cart-badge">{items.length}</span>
            )}
          </NavLink>
        )}
        <ProfileMenu />
      </div>
    </header>
  );
}

export default Navbar;
