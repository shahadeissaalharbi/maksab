import { useState } from "react";
import "./Auth.css";
// هنا جهزت صفحة التسجيل وحطيت الأشياء اللي بحتاجها فيها
function Register() {
    // هنا خليت الأسرة المنتجة هي الخيار الافتراضي وخزنت نوع الحساب اللي يختاره المستخدم
    const [accountType, setAccountType] = useState("merchant");
    // هنا خزنت اسم النشاط اللي يدخله المستخدم 
    const [businessName, setBusinessName] = useState("");
    // هنا خزنت الإيميل اللي يدخله المستخدم 
    const [email, setEmail] = useState("");
    // هنا خزنت كلمة المرور اللي يكتبها المستخدم 
    const [password, setPassword] = useState("");
  // هنا جهزت دالة الإرسال اللي تشتغل لما المستخدم يضغط "إنشاء الحساب"
  const handleSubmit = (event) => {
    // هنا منعت الصفحة تعيد التحميل لما ينضغط الزر
    event.preventDefault();

    // هنا جمعت البيانات في كائن واحد بنفس الأسماء اللي ينتظرها الباك إند حق ريم
    const formData = {
      full_name: businessName,
      email: email,
      password: password,
      role: accountType,
    };

    // هنا طبعت البيانات للتجربة، وخبيت كلمة المرور عشان الأمان
    console.log("بيانات التسجيل:", { ...formData, password: "********" });
  };
    return (<main className="register-page" dir="rtl"> {/* هنا سويت نموذج إنشاء الحساب */} <section className="register-form-section"> <div className="register-logo"> <span>↗</span> <strong>مكسب</strong> </div>
        <div className="register-content">
            {/* هنا حطيت عنوان الصفحة والوصف */}
            <p className="register-subtitle">ابدئي مشروعك مع مكسب</p>
            <h1>أنشئي حساب أعمالك</h1>
            <p className="register-description">
                اختاري نوع الحساب وأدخلي بياناتك الأساسية.
            </p>

            {/* هنا سويت خيارين لنوع الحساب */}
            <div className="account-types">
                <button
                    type="button"
                    className={accountType === "merchant" ? "selected" : ""}
                    onClick={() => setAccountType("merchant")}
                    aria-pressed={accountType === "merchant"}
                >
                    <strong>أسرة منتجة</strong>
                    <small>أبحث عن المواد والتغليف بالجملة</small>
                </button>

                <button
                    type="button"
                    className={accountType === "supplier" ? "selected" : ""}
                    onClick={() => setAccountType("supplier")}
                    aria-pressed={accountType === "supplier"}
                >
                    <strong>مورد</strong>
                    <small>أعرض منتجات الجملة وأدير الطلبات</small>
                </button>
            </div>

            {/* هنا حطيت حقول التسجيل */}
            <form onSubmit={handleSubmit}>
                <label htmlFor="businessName">اسم النشاط التجاري</label>
                <input
                    id="businessName"
                    type="text"
                    placeholder={accountType === "merchant" ? "مثال: معمول نورة" : "مثال: مستودع الخير للجملة"} /* هنا خليت المثال يتغير حسب نوع الحساب */                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    required
                />

                <label htmlFor="email">البريد الإلكتروني</label>
                <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <label htmlFor="password">كلمة المرور</label>
                <input
                    id="password"
                    type="password"
                    placeholder="ثمانية أحرف على الأقل"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                />

                {/* هنا حطيت زر إنشاء الحساب */}
                <button className="register-submit" type="submit">
                    إنشاء الحساب
                </button>
            </form>

            <p className="register-login">
                لديك حساب؟ <a href="/login">سجلي الدخول</a>
            </p>
        </div>
    </section>

        {/* هنا سويت القسم الأخضر اللي يسار الصفحة */}
        <section className="register-brand-section">
            <div className="brand-circle"></div>

            <div className="brand-text">
                <p>مكسب لأعمال أوضح</p>
                <h2>
                    من أول تكلفة،
                    <br />
                    إلى طلب جملة ناجح.
                </h2>
                <span>منصة واحدة للتسعير والشراء وإدارة الطلبات.</span>
            </div>
        </section>
    </main>
    );
}
export default Register;