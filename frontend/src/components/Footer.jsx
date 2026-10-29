import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { FOOTER_TEXT, FOOTER_LINKS } from "../constants/footer.js";
import "../styles/Footer.css";

// هنا الفوتر اللي يطلع آخر كل صفحة
function Footer() {
  return (
    <footer className="site-footer" dir="rtl">
      <div className="footer-top">
        <div className="footer-brand">
          <Logo />
          <p className="footer-tagline">{FOOTER_TEXT.TAGLINE}</p>
          <small className="footer-vision">{FOOTER_TEXT.VISION_NOTE}</small>
        </div>

        <nav className="footer-links">
          <h4>{FOOTER_TEXT.LINKS_TITLE}</h4>
          {FOOTER_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="footer-contact">
          <h4>{FOOTER_TEXT.CONTACT_TITLE}</h4>
          <a href={`mailto:${FOOTER_TEXT.EMAIL}`}>{FOOTER_TEXT.EMAIL}</a>
        </div>
      </div>

      <p className="footer-copy">{FOOTER_TEXT.COPYRIGHT}</p>
    </footer>
  );
}

export default Footer;
