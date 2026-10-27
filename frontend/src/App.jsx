import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import TraderHome from "./pages/TraderHome.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import SupplierOverview from "./pages/SupplierOverview.jsx"; 
import SupplierHome from "./pages/SupplierHome.jsx"; // ⬅️ 1. استيراد صفحة المنتجات والمخزون
import { ROUTES } from "./constants/routes.js";
import { SUPPLIER_NAV_LINKS } from "./constants/market.js";

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
        
        {/* لوحة المورد الرئيسية (نظرة عامة) */}
        <Route
          path={ROUTES.SUPPLIER_HOME}
          element={<SupplierOverview />}
        />

        {/* ⬅️ 2. إضافة مسار صفحة المنتجات والمخزون */}
        <Route 
          path="/supplier/products" 
          element={<SupplierHome />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;