import { useCallback, useState } from "react";
import LocationMap from "./LocationMap.jsx";
import MapErrorBoundary from "./MapErrorBoundary.jsx";
import MapPreview from "./MapPreview.jsx";
import { DEFAULT_POINT, LOCATE_STATE, LOCATION_TEXT, MAPS_API_KEY } from "../constants/map.js";
import { useCurrentLocation } from "../hooks/useCurrentLocation.js";
import { useMapsAuthFailure } from "../hooks/useMapsAuthFailure.js";
import { SAVE_STATE, useMyLocation } from "../hooks/useMyLocation.js";
import { parseMapLink } from "../utils/mapLink.js";
import "../styles/Location.css";

const LOCATE_ERRORS = {
  [LOCATE_STATE.DENIED]: LOCATION_TEXT.DENIED,
  [LOCATE_STATE.FAILED]: LOCATION_TEXT.FAILED,
};

// هنا قسم «موقع التوصيل» في حسابي: الخريطة التفاعلية (لو المفتاح موجود) أو موقع الجهاز أو رابط، ثم الحفظ
function DeliveryLocationSection() {
  const { saved, save, saveState } = useMyLocation();
  // هنا الخريطة التفاعلية بس لو المفتاح مضبوط وGoogle قبله
  const mapsRejected = useMapsAuthFailure();
  const interactive = Boolean(MAPS_API_KEY) && !mapsRejected;
  const [picked, setPicked] = useState(null);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");

  // هنا كل موقع جديد يصير «المختار» لين يضغط حفظ
  const choose = useCallback((point) => {
    setPicked(point);
    setLinkError("");
  }, []);
  const { state: locateState, locate } = useCurrentLocation(choose);

  // هنا بعد الحفظ ينمسح «المختار»، فتعرض الخريطة المحفوظ ويطلع «انحفظ موقعك»
  const handleSave = async () => {
    if (await save(picked)) setPicked(null);
  };

  const applyLink = () => {
    const point = parseMapLink(link);
    if (point) choose(point);
    else setLinkError(LOCATION_TEXT.PASTE_INVALID);
  };

  // هنا اللي نعرضه: المختار الجديد، أو المحفوظ، أو وسط الرياض
  const shown = picked || saved || DEFAULT_POINT;
  const hasPoint = Boolean(picked || saved);

  return (
    <section className="profile-card location-card" aria-label={LOCATION_TEXT.TITLE}>
      <h2>{LOCATION_TEXT.TITLE}</h2>
      <p className="location-note">{LOCATION_TEXT.NOTE}</p>

      <button
        type="button"
        className="location-locate"
        onClick={locate}
        disabled={locateState === LOCATE_STATE.LOCATING}
      >
        {locateState === LOCATE_STATE.LOCATING ? LOCATION_TEXT.LOCATING : LOCATION_TEXT.USE_CURRENT}
      </button>
      {LOCATE_ERRORS[locateState] && <p className="location-error" role="alert">{LOCATE_ERRORS[locateState]}</p>}

      <label className="location-paste-label" htmlFor="map-link">{LOCATION_TEXT.PASTE_LABEL}</label>
      <div className="location-paste">
        <input
          id="map-link"
          type="url"
          dir="ltr"
          value={link}
          placeholder={LOCATION_TEXT.PASTE_PLACEHOLDER}
          onChange={(event) => setLink(event.target.value)}
        />
        <button type="button" onClick={applyLink}>{LOCATION_TEXT.PASTE_APPLY}</button>
      </div>
      {linkError && <p className="location-error" role="alert">{linkError}</p>}

      {!hasPoint && <p className="location-empty">{LOCATION_TEXT.NOT_SET}</p>}

      {/* هنا لو المفتاح مضبوط الخريطة تفاعلية، وإلا (أو لو صار خطأ) خريطة Google المضمنة تعرض النقطة */}
      {interactive ? (
        <>
          <p className="location-note">{LOCATION_TEXT.MAP_HINT}</p>
          <MapErrorBoundary fallback={<MapPreview point={shown} />}>
            <LocationMap point={shown} onPick={choose} />
          </MapErrorBoundary>
        </>
      ) : (
        <MapPreview point={shown} />
      )}

      <button
        type="button"
        className="location-save"
        onClick={handleSave}
        disabled={!picked || saveState === SAVE_STATE.SAVING}
      >
        {saveState === SAVE_STATE.SAVING ? LOCATION_TEXT.SAVING : LOCATION_TEXT.SAVE}
      </button>
      {saveState === SAVE_STATE.SAVED && !picked && <p className="location-ok" role="status">{LOCATION_TEXT.SAVED}</p>}
      {saveState === SAVE_STATE.ERROR && <p className="location-error" role="alert">{LOCATION_TEXT.SAVE_ERROR}</p>}
    </section>
  );
}

export default DeliveryLocationSection;