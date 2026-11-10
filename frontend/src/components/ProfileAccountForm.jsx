import { useEffect, useState } from "react";
import FormField from "./FormField.jsx";
import FormMessage from "./FormMessage.jsx";
import SubmitButton from "./SubmitButton.jsx";
import {
  HTTP_STATUS,
  MESSAGE_TYPES,
  NAME_ERROR,
  NAME_HINT,
  getErrorMessage,
} from "../constants/messages.js";
import { PROFILE_ERRORS, PROFILE_TEXT } from "../constants/profile.js";
import { isValidName } from "../utils/nameValidation.js";
import {
  isValidCommercialRegister,
  isValidPhone,
} from "../utils/profileValidation.js";

// هنا أبدأ الحقول بالبيانات المحفوظة، واللي ما انكتب يبدأ فاضي
const toForm = (user) => ({
  name: user.full_name || "",
  phone: user.phone || "",
  commercial_register: user.commercial_register || "",
  address_text: user.address_text || "",
});

// هنا نموذج بياناتي: كل حقل يتأكد منه وقت الكتابة، وزر الحفظ ما ينضغط لين تصير كلها صحيحة
function ProfileAccountForm({ user, onSave }) {
  const [form, setForm] = useState(toForm(user));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // هنا لو تحدثت بيانات الحساب (بعد الحفظ أو القراءة من الباك) أبدأ الحقول منها
  useEffect(() => {
    setForm(toForm(user));
  }, [user]);

  const saved = toForm(user);
  const nameIsValid = isValidName(form.name);
  const phoneIsValid = isValidPhone(form.phone);
  const registerIsValid = isValidCommercialRegister(form.commercial_register);
  const hasChanges = Object.keys(form).some((key) => form[key] !== saved[key]);
  const canSave = nameIsValid && phoneIsValid && registerIsValid && hasChanges;

  const handleChange = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSave) return;

    setLoading(true);
    setMessage(null);

    const name = form.name.trim();
    const result = await onSave({
      name,
      business_name: name,
      phone: form.phone.trim(),
      commercial_register: form.commercial_register.trim(),
      address_text: form.address_text.trim(),
    });

    if (result.status === HTTP_STATUS.OK) {
      setMessage({ type: MESSAGE_TYPES.SUCCESS, text: PROFILE_TEXT.SAVED });
    } else {
      setMessage({
        type: MESSAGE_TYPES.ERROR,
        text: getErrorMessage(result.status),
      });
    }
    setLoading(false);
  };

  return (
    <section className="profile-card">
      <h2>{PROFILE_TEXT.DATA_TITLE}</h2>
      <form onSubmit={handleSubmit}>
        <FormField
          id="name"
          label={PROFILE_TEXT.NAME}
          hint={NAME_HINT}
          error={form.name !== "" && !nameIsValid ? NAME_ERROR : ""}
          type="text"
          value={form.name}
          onChange={handleChange}
          required
        />
        <FormField
          id="phone"
          label={PROFILE_TEXT.PHONE}
          hint={PROFILE_TEXT.PHONE_HINT}
          error={phoneIsValid ? "" : PROFILE_ERRORS.PHONE}
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={handleChange}
        />
        <FormField
          id="commercial_register"
          label={PROFILE_TEXT.REGISTER}
          hint={PROFILE_TEXT.REGISTER_HINT}
          error={registerIsValid ? "" : PROFILE_ERRORS.REGISTER}
          inputMode="numeric"
          maxLength={10}
          value={form.commercial_register}
          onChange={handleChange}
        />

        <label htmlFor="address_text">{PROFILE_TEXT.ADDRESS}</label>
        <textarea
          id="address_text"
          name="address_text"
          rows={3}
          placeholder={PROFILE_TEXT.ADDRESS_PLACEHOLDER}
          value={form.address_text}
          onChange={handleChange}
        />

        <FormMessage message={message} />
        <SubmitButton
          loading={loading}
          disabled={!canSave}
          label={PROFILE_TEXT.SAVE}
          loadingLabel={PROFILE_TEXT.SAVING}
        />
      </form>
    </section>
  );
}

export default ProfileAccountForm;
