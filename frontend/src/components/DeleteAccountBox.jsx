import { useState } from "react";
import FormMessage from "./FormMessage.jsx";
import { HTTP_STATUS, MESSAGE_TYPES } from "../constants/messages.js";
import { PROFILE_TEXT, getDeleteError } from "../constants/profile.js";

// هنا منطقة حذف الحساب: زر أول، وبعدها كلمة المرور للتأكيد
function DeleteAccountBox({ onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleConfirm = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await onDelete(password);

    if (result.status !== HTTP_STATUS.OK) {
      setMessage({
        type: MESSAGE_TYPES.ERROR,
        text: getDeleteError(result.status, result.code),
      });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setPassword("");
    setMessage(null);
  };

  return (
    <section className="profile-card profile-danger">
      <h2>{PROFILE_TEXT.DANGER_TITLE}</h2>
      <p>{PROFILE_TEXT.DANGER_TEXT}</p>

      {isOpen ? (
        <form onSubmit={handleConfirm}>
          <label htmlFor="deletePassword">{PROFILE_TEXT.PASSWORD}</label>
          <input
            id="deletePassword"
            name="deletePassword"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <FormMessage message={message} />
          <div className="profile-actions">
            <button type="submit" className="profile-delete" disabled={loading}>
              {loading ? PROFILE_TEXT.DELETING : PROFILE_TEXT.CONFIRM_DELETE}
            </button>
            <button
              type="button"
              className="profile-cancel"
              onClick={handleCancel}
            >
              {PROFILE_TEXT.CANCEL}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="profile-delete"
          onClick={() => setIsOpen(true)}
        >
          {PROFILE_TEXT.DELETE}
        </button>
      )}
    </section>
  );
}

export default DeleteAccountBox;
