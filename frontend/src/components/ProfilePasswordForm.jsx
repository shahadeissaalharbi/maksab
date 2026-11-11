import { useState } from "react";
import FormField from "./FormField.jsx";
import FormMessage from "./FormMessage.jsx";
import SubmitButton from "./SubmitButton.jsx";
import { HTTP_STATUS, MESSAGE_TYPES } from "../constants/messages.js";
import {
  PROFILE_ERRORS,
  PROFILE_TEXT,
  getPasswordError,
} from "../constants/profile.js";
import { isValidPassword } from "../utils/profileValidation.js";

const EMPTY_FORM = { current: "", next: "", confirm: "" };

// هنا نموذج تغيير كلمة المرور: الجديدة 8 أحرف وتتطابق مع التأكيد، والزر ما ينضغط قبل كذا
function ProfilePasswordForm({ onChange }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const nextIsValid = isValidPassword(form.next);
  const confirmMatches = form.confirm === form.next;
  const canSave = form.current !== "" && nextIsValid && confirmMatches;

  const handleChange = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSave) return;

    setLoading(true);
    setMessage(null);

    const result = await onChange(form.current, form.next);

    if (result.status === HTTP_STATUS.OK) {
      setMessage({
        type: MESSAGE_TYPES.SUCCESS,
        text: PROFILE_TEXT.PASSWORD_CHANGED,
      });
      setForm(EMPTY_FORM);
    } else {
      setMessage({
        type: MESSAGE_TYPES.ERROR,
        text: getPasswordError(result.status),
      });
    }
    setLoading(false);
  };

  return (
    <section className="profile-card">
      <h2>{PROFILE_TEXT.PASSWORD_TITLE}</h2>
      <p className="profile-note">{PROFILE_TEXT.PASSWORD_NOTE}</p>
      <form onSubmit={handleSubmit}>
        <FormField
          id="current"
          label={PROFILE_TEXT.CURRENT_PASSWORD}
          type="password"
          autoComplete="current-password"
          value={form.current}
          onChange={handleChange}
        />
        <FormField
          id="next"
          label={PROFILE_TEXT.NEW_PASSWORD}
          hint={PROFILE_TEXT.NEW_PASSWORD_HINT}
          error={
            form.next !== "" && !nextIsValid
              ? PROFILE_ERRORS.PASSWORD_SHORT
              : ""
          }
          type="password"
          autoComplete="new-password"
          value={form.next}
          onChange={handleChange}
        />
        <FormField
          id="confirm"
          label={PROFILE_TEXT.CONFIRM_PASSWORD}
          error={
            form.confirm !== "" && !confirmMatches
              ? PROFILE_ERRORS.PASSWORD_MISMATCH
              : ""
          }
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={handleChange}
        />

        <FormMessage message={message} />
        <SubmitButton
          loading={loading}
          disabled={!canSave}
          label={PROFILE_TEXT.CHANGE_PASSWORD}
          loadingLabel={PROFILE_TEXT.CHANGING_PASSWORD}
        />
      </form>
    </section>
  );
}

export default ProfilePasswordForm;
