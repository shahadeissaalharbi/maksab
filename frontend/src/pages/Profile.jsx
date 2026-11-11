import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ProfileInfo from "../components/ProfileInfo.jsx";
import ProfileAccountForm from "../components/ProfileAccountForm.jsx";
import ProfilePasswordForm from "../components/ProfilePasswordForm.jsx";
import DeleteAccountBox from "../components/DeleteAccountBox.jsx";
import DeliveryLocationSection from "../components/DeliveryLocationSection.jsx";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import { HTTP_STATUS } from "../constants/messages.js";
import { NAV_LINKS, SUPPLIER_NAV_LINKS } from "../constants/market.js";
import { PROFILE_TEXT } from "../constants/profile.js";
import { ROUTES } from "../constants/routes.js";
import { getToken, getUser } from "../services/session.js";
import { refreshAccount } from "../services/profileService.js";
import { useProfileActions } from "../hooks/useProfileActions.js";
import "../styles/Auth.css";
import "../styles/Trader.css";
import "../styles/Profile.css";

// هنا صفحة حسابي: بياناتك وتعديلها وكلمة المرور وحذف الحساب في مكان واحد
function Profile() {
  const [user, setUser] = useState(getUser() || {});
  const { saveAccount, changePassword, removeAccount, deleted } =
    useProfileActions();

  // هنا أقرا بيانات الحساب من الباك أول ما تفتح الصفحة، وأحدثها لو وصلت بيانات جديدة
  useEffect(() => {
    refreshAccount()
      .then(() => setUser(getUser() || {}))
      .catch(() => {});
  }, []);

  // هنا بعد حذف الحساب يرجع للصفحة الرئيسية
  if (deleted) return <Navigate to={ROUTES.LANDING} />;

  // اللي ما سجل دخول يرجع لصفحة الدخول
  if (!getToken()) return <Navigate to={ROUTES.LOGIN} />;

  // هنا بعد ما تنحفظ البيانات أقرا المحدثة من المتصفح
  const handleSave = async (values) => {
    const result = await saveAccount(values);
    if (result.status === HTTP_STATUS.OK) setUser(getUser() || {});
    return result;
  };

  const links =
    user.role === ACCOUNT_TYPES.SUPPLIER.value ? SUPPLIER_NAV_LINKS : NAV_LINKS;

  return (
    <div className="trader-page" dir="rtl">
      <Navbar links={links} />

      <main className="profile">
        <h1>{PROFILE_TEXT.TITLE}</h1>
        <p className="profile-subtitle">{PROFILE_TEXT.SUBTITLE}</p>
        <ProfileInfo user={user} />
        <ProfileAccountForm user={user} onSave={handleSave} />
        <DeliveryLocationSection />
        <ProfilePasswordForm onChange={changePassword} />
        <DeleteAccountBox onDelete={removeAccount} />
      </main>
    </div>
  );
}

export default Profile;
