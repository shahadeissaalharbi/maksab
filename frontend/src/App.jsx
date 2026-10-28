import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import TraderHome from "./pages/TraderHome.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import BusinessInfo from "./pages/BusinessInfo.jsx";
import Landing from "./pages/Landing.jsx";
import SupplierOverview from "./pages/SupplierOverview.jsx";
import SupplierHome from "./pages/SupplierHome.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import { ROUTES } from "./constants/routes.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Landing />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.LANDING} element={<Landing />} />
        <Route path={ROUTES.CALCULATOR} element={<ComingSoon title="حاسبة التسعير" />} />

        {/* صفحات الأسرة المنتجة */}
        <Route path={ROUTES.TRADER_HOME} element={<TraderHome />} />
        <Route path={ROUTES.BUSINESS_INFO} element={<BusinessInfo />} />
        <Route path={ROUTES.MY_ORDERS} element={<MyOrders />} />

        {/* صفحات المورد */}
        <Route path={ROUTES.SUPPLIER_HOME} element={<SupplierOverview />} />
        <Route path={ROUTES.SUPPLIER_PRODUCTS} element={<SupplierHome />} />
        <Route path="/supplier/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
