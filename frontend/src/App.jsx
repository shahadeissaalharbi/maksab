import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import TraderHome from "./pages/TraderHome.jsx";
import Calculator from "./pages/Calculator.jsx";
import Payment from "./pages/Payment.jsx";
import PaymentResult from "./pages/PaymentResult.jsx";
import Landing from "./pages/Landing.jsx";
import SupplierOverview from "./pages/SupplierOverview.jsx";
import SupplierHome from "./pages/SupplierHome.jsx";
import SupplierComingSoon from "./pages/SupplierComingSoon.jsx";
import SupplierLayout from "./components/SupplierLayout.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import Cart from "./pages/Cart.jsx";
import Profile from "./pages/Profile.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import NotFound from "./pages/NotFound.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { ROUTES } from "./constants/routes.js";
import { COMING_SOON_PAGES } from "./constants/market.js";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
        <Route path={ROUTES.PAYMENT} element={<Payment />} />
        <Route path={ROUTES.PAYMENT_RESULT} element={<PaymentResult />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />
        {/* صفحات «قريبًا» للأسر المنتجة */}
        <Route
          path={ROUTES.ACADEMY}
          element={<ComingSoon {...COMING_SOON_PAGES.ACADEMY} />}
        />
        <Route
          path={ROUTES.PARTNERS}
          element={<ComingSoon {...COMING_SOON_PAGES.PARTNERS} />}
        />
        {/* صفحات المورد: كلها داخل SupplierLayout، فالقائمة الجانبية ثابتة والوسط بس يتغير */}
        <Route element={<SupplierLayout />}>
          <Route path={ROUTES.SUPPLIER_HOME} element={<SupplierOverview />} />
          <Route path={ROUTES.SUPPLIER_PRODUCTS} element={<SupplierHome />} />
          {/* صفحات «قريبًا» في لوحة المورد */}
          <Route
            path={ROUTES.SUPPLIER_ORDERS}
            element={<SupplierComingSoon pageId="orders" />}
          />
          <Route
            path={ROUTES.SUPPLIER_MESSAGES}
            element={<SupplierComingSoon pageId="messages" />}
          />
        </Route>
        <Route path={ROUTES.SUPPLIER_LOGIN} element={<Login />} />
        {/* أي رابط ما له صفحة يطلع صفحة 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
