// هنا زر الإرسال، ويتوقف وقت الانتظار عشان ما ينضغط مرتين
function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <button className="register-submit" type="submit" disabled={loading}>
      {loading ? loadingLabel : label}
    </button>
  );
}

export default SubmitButton;