import { useEffect } from "react";
import { AdvancedMarker, APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { MAP_ID, MAP_ZOOM, MAPS_API_KEY } from "../constants/map.js";

// هنا لما تتغير النقطة من برا الخريطة (موقعي الحالي أو رابط) نحرك الخريطة لها
function FollowPoint({ position }) {
  const map = useMap();

  useEffect(() => {
    if (map) map.panTo(position);
  }, [map, position]);

  return null;
}

// هنا خريطة Google التفاعلية: الضغط على الخريطة أو سحب الدبوس يختار الموقع
function LocationMap({ point, onPick }) {
  const position = { lat: point.latitude, lng: point.longitude };

  // هنا ضغطة على الخريطة تعطينا الإحداثيات مباشرة
  const handleMapClick = (event) => {
    const latLng = event.detail.latLng;
    if (latLng) onPick({ latitude: latLng.lat, longitude: latLng.lng });
  };

  // هنا لما يخلص سحب الدبوس ناخذ مكانه الجديد
  const handleDragEnd = (event) => {
    if (event.latLng) onPick({ latitude: event.latLng.lat(), longitude: event.latLng.lng() });
  };

  return (
    <APIProvider apiKey={MAPS_API_KEY} language="ar" region="SA">
      <Map
        className="location-map"
        defaultCenter={position}
        defaultZoom={MAP_ZOOM}
        mapId={MAP_ID}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        onClick={handleMapClick}
      >
        <AdvancedMarker position={position} draggable onDragEnd={handleDragEnd} />
        <FollowPoint position={position} />
      </Map>
    </APIProvider>
  );
}

export default LocationMap;