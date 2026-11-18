import { Navigate, Outlet } from "react-router-dom";
import OverviewSidebar from "./OverviewSidebar.jsx";
import { ROUTES } from "../constants/routes.js";
import { getToken } from "../services/session.js";
import "../styles/Auth.css";
import "../styles/SupplierOverview.css";
import "../styles/SupplierSoon.css";

// هنا إطار لوحة المورد: القائمة الجانبية ثابتة، والوسط بس يتغير حسب الصفحة (Outlet)
// كذا لما يتنقل المورد بين صفحات اللوحة ما تختفي القائمة ولا تتحمل من جديد
function SupplierLayout() {
  // اللي ما سجل دخول يرجع لصفحة الدخول
  if (!getToken()) return <Navigate to={ROUTES.LOGIN} />;

  return (
    <div className="ov-page" dir="rtl">
      <OverviewSidebar />
      <main className="ov-main">
        <Outlet />
      </main>
    </div>
  );
}

export default SupplierLayout;
