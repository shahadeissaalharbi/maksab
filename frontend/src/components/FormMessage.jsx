// هنا رسالة النجاح أو الخطأ، وما تطلع إذا ما فيه رسالة
function FormMessage({ message }) {
  if (!message) return null;

  return (
    <p className={`form-message ${message.type}`} role="status">
      {message.text}
    </p>
  );
}

export default FormMessage;