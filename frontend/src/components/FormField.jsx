import "../styles/FormHint.css";

// هنا حقل واحد: العنوان، وتحته جملة توضيحية (تتحول لرسالة خطأ وقت الكتابة)، ثم الخانة
function FormField({ id, label, hint, error, ...inputProps }) {
  const noteId = `${id}-note`;
  const note = error || hint;

  return (
    <>
      <label htmlFor={id}>{label}</label>
      {note && (
        <small
          id={noteId}
          className={error ? "field-note field-error" : "field-note field-hint"}
          role={error ? "alert" : undefined}
        >
          {note}
        </small>
      )}
      <input
        id={id}
        name={id}
        className={error ? "input-error" : undefined}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={note ? noteId : undefined}
        {...inputProps}
      />
    </>
  );
}

export default FormField;
