import { getAccountTypeLabel } from "../constants/accountTypes.js";
import { PROFILE_TEXT } from "../constants/profile.js";
import { getInitial } from "../utils/accountInitial.js";

// هنا ملخص الحساب: الدائرة والاسم والبريد (قراءة فقط) ونوع الحساب
function ProfileInfo({ user }) {
  return (
    <section className="profile-summary">
      <span className="profile-summary-avatar">
        {getInitial(user.full_name)}
      </span>

      <div className="profile-summary-text">
        <strong>{user.full_name}</strong>
        <p>
          {user.email}
          <span className="profile-verified">{PROFILE_TEXT.VERIFIED}</span>
        </p>
        <span className="profile-badge">{getAccountTypeLabel(user.role)}</span>
      </div>
    </section>
  );
}

export default ProfileInfo;
