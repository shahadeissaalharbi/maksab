import { NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";
import LogoutButton from "./LogoutButton.jsx";
import { NAV_LINKS } from "../constants/market.js";

// هنا الشريط العلوي، والروابط تجي من الصفحة عشان التاجر والمورد يستخدمونه
function Navbar({ userName, links = NAV_LINKS }) {
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
        {userName && <strong>{userName}</strong>}
        <LogoutButton />
      </div>
    </header>
  );
}

export default Navbar;