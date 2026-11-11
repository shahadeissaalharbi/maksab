import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import TraderHome from "./pages/TraderHome.jsx";
import Calculator from "./pages/Calculator.jsx";
import Landing from "./pages/Landing.jsx";
import SupplierOverview from "./pages/SupplierOverview.jsx";
import SupplierHome from "./pages/SupplierHome.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import Cart from "./pages/Cart.jsx";
import Profile from "./pages/Profile.jsx";
import Footer from "./components/Footer.jsx";
import { ROUTES } from "./constants/routes.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Landing />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.LANDING} element={<Landing />} />
        <Route path={ROUTES.CALCULATOR} element={<Calculator />} />
        {/* صفحات الأسرة المنتجة */}
        <Route path={ROUTES.TRADER_HOME} element={<TraderHome />} />
        {/* بيانات النشاط صارت داخل صفحة حسابي */}
        <Route
          path={ROUTES.BUSINESS_INFO}
          element={<Navigate to={ROUTES.PROFILE} replace />}
        />
        <Route path={ROUTES.MY_ORDERS} element={<MyOrders />} />
        <Route path={ROUTES.CART} element={<Cart />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />
        {/* صفحات المورد */}
        <Route path={ROUTES.SUPPLIER_HOME} element={<SupplierOverview />} />
        <Route path={ROUTES.SUPPLIER_PRODUCTS} element={<SupplierHome />} />
        <Route path={ROUTES.SUPPLIER_LOGIN} element={<Login />} />{" "}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
