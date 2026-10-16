// هنا جبت أدوات التنقل بين الصفحات من مكتبة React Router
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// هنا جبت صفحة التسجيل وصفحة الدخول اللي سويتها
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";

// هنا حددت كل رابط وش الصفحة اللي يفتحها
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* هنا خليت الرابط الرئيسي يودي لصفحة التسجيل تلقائيًا */}
        <Route path="/" element={<Navigate to="/register" />} />

        {/* هنا ربطت /register بصفحة التسجيل */}
        <Route path="/register" element={<Register />} />

        {/* هنا ربطت /login بصفحة الدخول */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;