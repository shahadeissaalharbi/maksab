// هنا جبت صفحة التسجيل اللي سويتها من مجلد pages
import Register from "./pages/Register.jsx";

// هنا خليت التطبيق يعرض صفحة التسجيل بس، لين نضيف باقي الصفحات
function App() {
  return <Register />;
}

// هنا صدّرت App عشان main.jsx يقدر يستخدمه ويعرضه بالمتصفح
export default App;
