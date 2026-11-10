import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getAccountTypeLabel } from "../constants/accountTypes.js";
import { PROFILE_MENU_TEXT } from "../constants/profile.js";
import { ROUTES } from "../constants/routes.js";
import { getUser } from "../services/session.js";
import { useLogout } from "../hooks/useLogout.js";
import { getInitial } from "../utils/accountInitial.js";
import "../styles/ProfileMenu.css";

// هنا علامة حسابي: دائرة فيها أول حرف من اسمك، وتفتح قائمة فيها بياناتي وتسجيل الخروج
function ProfileMenu({ onDark = false }) {
  const user = getUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const logout = useLogout();

  // هنا القائمة تنقفل لو ضغطتي برا أو ضغطتي Escape
  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className={`profile-menu ${onDark ? "on-dark" : ""}`} ref={menuRef}>
      <button
        type="button"
        className="profile-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="profile-avatar">{getInitial(user.full_name)}</span>
        <span className="profile-trigger-label">{PROFILE_MENU_TEXT.LABEL}</span>
        <span className="profile-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="profile-dropdown" role="menu">
          <div className="profile-dropdown-head">
            <strong>{user.full_name}</strong>
            <span className="profile-badge">
              {getAccountTypeLabel(user.role)}
            </span>
          </div>
          <Link
            to={ROUTES.PROFILE}
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            {PROFILE_MENU_TEXT.PROFILE}
          </Link>
          <button
            type="button"
            role="menuitem"
            className="profile-logout-item"
            onClick={logout}
          >
            {PROFILE_MENU_TEXT.LOGOUT}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
