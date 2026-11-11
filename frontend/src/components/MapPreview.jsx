import { LOCATION_TEXT, embedUrl, openInMapsUrl } from "../constants/map.js";

// هنا خريطة Google تعرض النقطة المختارة، ورابط يفتحها في خرائط Google
function MapPreview({ point }) {
  return (
    <div className="map-preview">
      <iframe
        title={LOCATION_TEXT.MAP_TITLE}
        src={embedUrl(point)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a href={openInMapsUrl(point)} target="_blank" rel="noreferrer">
        {LOCATION_TEXT.OPEN_IN_MAPS}
      </a>
    </div>
  );
}

export default MapPreview;