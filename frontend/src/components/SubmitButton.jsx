// هنا زر الإرسال، ويتوقف وقت الانتظار أو لو الصفحة منعته، عشان ما ينضغط وهو ناقص أو غلط
function SubmitButton({ loading, disabled = false, label, loadingLabel }) {
  return (
    <button
      className="register-submit"
      type="submit"
      disabled={loading || disabled}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

export default SubmitButton;
