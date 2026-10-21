import { NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";
import LogoutButton from "./LogoutButton.jsx";
import { NAV_LINKS } from "../constants/market.js";

// هنا الشريط العلوي، و NavLink يلون الرابط الحالي لحاله
function Navbar({ userName }) {
  return (
    <header className="navbar">
      <Logo />

      <nav className="navbar-links">
        {NAV_LINKS.map((link) => (
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