import { useEffect, useRef } from "react";
import { TomTomConfig } from "@tomtom-org/maps-sdk/core";
import { TomTomMap } from "@tomtom-org/maps-sdk/map";
import { Marker } from "maplibre-gl";
import { MAP_ZOOM, TOMTOM_API_KEY } from "../constants/map.js";

// TomTom interactive map: click the map or drag the pin to choose a location
function LocationMap({ point, onPick, onFail }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onPickRef = useRef(onPick);
  const onFailRef = useRef(onFail);

  // keep the latest callbacks without recreating the map
  useEffect(() => {
    onPickRef.current = onPick;
    onFailRef.current = onFail;
  }, [onPick, onFail]);

  // create the map once
  useEffect(() => {
    TomTomConfig.instance.put({ apiKey: TOMTOM_API_KEY });
    const center = [point.longitude, point.latitude];
    const tomtomMap = new TomTomMap({
      mapLibre: { container: containerRef.current, center, zoom: MAP_ZOOM },
    });
    const map = tomtomMap.mapLibreMap;
    const marker = new Marker({ draggable: true }).setLngLat(center).addTo(map);

    marker.on("dragend", () => {
      const { lat, lng } = marker.getLngLat();
      onPickRef.current({ latitude: lat, longitude: lng });
    });
    map.on("click", (event) => {
      onPickRef.current({ latitude: event.lngLat.lat, longitude: event.lngLat.lng });
    });
    // key rejected (wrong key or domain not allowed): parent switches to the fallback map
    map.on("error", (event) => {
      const status = event?.error?.status;
      if (status === 401 || status === 403) onFailRef.current?.();
    });

    mapRef.current = map;
    markerRef.current = marker;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when the point changes from outside (current location or pasted link) move the pin and map
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const center = [point.longitude, point.latitude];
    markerRef.current.setLngLat(center);
    mapRef.current.easeTo({ center });
  }, [point.latitude, point.longitude]);

  return <div ref={containerRef} className="location-map" style={{ minHeight: 280 }} />;
}

export default LocationMap;
