// هنا شمس للصباح وقمر للمساء، تطلع جنب الترحيب
function GreetingIcon({ morning }) {
  if (morning) {
    return (
      <svg className="ov-greet-icon" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="6.5" className="ov-sun" />
        <path
          d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"
          className="ov-sun-rays"
        />
      </svg>
    );
  }

  return (
    <svg className="ov-greet-icon" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M20 4a12 12 0 1 0 8 19A10 10 0 0 1 20 4z" className="ov-moon" />
      <path
        d="M24 7l.9 2.1L27 10l-2.1.9L24 13l-.9-2.1L21 10l2.1-.9z"
        className="ov-sun"
      />
    </svg>
  );
}

export default GreetingIcon;
