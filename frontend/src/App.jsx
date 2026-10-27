import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import TraderHome from "./pages/TraderHome.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import SupplierOverview from "./pages/SupplierOverview.jsx"; // 1. استيراد صفحة المورد الجديدة
import { ROUTES } from "./constants/routes.js";
import { SUPPLIER_NAV_LINKS } from "./constants/market.js";

// هنا كل رابط وش الصفحة اللي يفتحها، والروابط نفسها من ROUTES
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.REGISTER} />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.TRADER_HOME} element={<TraderHome />} />
        <Route path={ROUTES.LANDING} element={<ComingSoon title="الرئيسية" />} />
        <Route path={ROUTES.CALCULATOR} element={<ComingSoon title="حاسبة التسعير" />} />
        
        {/* 2. استبدال ComingSoon بـ SupplierOverview الحقيقية */}
        <Route
          path={ROUTES.SUPPLIER_HOME}
          element={<SupplierOverview />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;