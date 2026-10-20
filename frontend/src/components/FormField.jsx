// هنا حقل واحد: العنوان والخانة مع بعض، و name نفس id عشان الصفحة تعرف أي حقل تغير
function FormField({ id, label, ...inputProps }) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} {...inputProps} />
    </>
  );
}

export default FormField;