import { LANDING_ART } from "../constants/landing.js";

// هنا رسمة الواجهة: يد المورد تسلّم صندوق البضاعة ليد الأسرة المنتجة
function LandingArt() {
  return (
    <svg
      className="landing-art"
      viewBox="0 0 360 270"
      role="img"
      aria-label={LANDING_ART.LABEL}
    >
      <circle cx="180" cy="150" r="112" className="art-glow" />
      <circle cx="180" cy="150" r="84" className="art-glow" />

      {/* السهم من المورد للأسرة */}
      <path
        d="M312 92 C 286 40, 210 22, 150 34 S 66 66, 52 98"
        className="art-arrow art-dots"
      />
      <path d="M44 84 L52 100 L68 92" className="art-arrow" />

      <path
        d="M96 140 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z"
        className="art-spark"
      />
      <path
        d="M268 150 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z"
        className="art-spark art-spark-white"
      />
      <path
        d="M250 60 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5 l6 -2.5 z"
        className="art-spark art-spark-late"
      />

      {/* الصندوق مفتوح وفيه مستلزمات */}
      <g className="art-box">
        <path
          d="M136 98 L180 80 L160 70 L118 86 Z"
          className="art-flap-light"
        />
        <path d="M224 98 L180 80 L200 70 L242 86 Z" className="art-flap-dark" />
        <rect
          x="164"
          y="74"
          width="22"
          height="34"
          rx="5"
          className="art-jar"
        />
        <rect
          x="164"
          y="70"
          width="22"
          height="8"
          rx="3"
          className="art-jar-lid"
        />
        <path d="M169 90 h12" className="art-jar-label" />
        <circle cx="200" cy="94" r="12" className="art-spool" />
        <circle cx="200" cy="94" r="4" className="art-jar" />
        <path
          d="M136 98 L180 116 L180 182 L136 164 Z"
          className="art-box-front"
        />
        <path
          d="M224 98 L180 116 L180 182 L224 164 Z"
          className="art-box-side"
        />
        <path
          d="M136 98 L180 116 L162 132 L118 112 Z"
          className="art-flap-light"
        />
        <path
          d="M224 98 L180 116 L198 132 L242 112 Z"
          className="art-flap-dark"
        />
        <path
          d="M146 158 L156 148 L162 154 L172 142 M166 142 L172 142 L172 148"
          className="art-logo"
        />
      </g>

      {/* يد المورد */}
      <path
        d="M342 250 L300 204 L278 222 L316 266 Z"
        className="art-sleeve-supplier"
      />
      <path d="M300 204 L278 222" className="art-cuff-supplier" />
      <path
        d="M298 202 C 286 190, 266 184, 246 184 L 206 186 C 194 187, 192 199, 202 201 L 236 202 L 198 206 C 188 207, 188 219, 198 220 L 248 222 C 262 223, 272 224, 280 220 Z"
        className="art-hand"
      />

      {/* يد الأسرة المنتجة */}
      <path
        d="M18 250 L60 204 L82 222 L44 266 Z"
        className="art-sleeve-family"
      />
      <path d="M60 204 L82 222" className="art-cuff-family" />
      <path
        d="M62 202 C 74 190, 94 184, 114 184 L 154 186 C 166 187, 168 199, 158 201 L 124 202 L 162 206 C 172 207, 172 219, 162 220 L 112 222 C 98 223, 88 224, 80 220 Z"
        className="art-hand"
      />
    </svg>
  );
}

export default LandingArt;
