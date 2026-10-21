import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import TraderHome from "./pages/TraderHome.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import { ROUTES } from "./constants/routes.js";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;