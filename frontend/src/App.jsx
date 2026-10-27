import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import TraderHome from "./pages/TraderHome.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import SupplierOverview from "./pages/SupplierOverview.jsx";
import SupplierHome from "./pages/SupplierHome.jsx";
import { ROUTES } from "./constants/routes.js";

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
        <Route path={ROUTES.SUPPLIER_HOME} element={<SupplierOverview />} />
        <Route path={ROUTES.SUPPLIER_PRODUCTS} element={<SupplierHome />} />
        <Route path="/supplier/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;