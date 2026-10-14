import { useMemo } from "react";
import { useSelector } from "react-redux";

export const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1d2329" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d2329" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a93a6" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#3a424c" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#a7b0c0" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#c3cad6" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#7d8696" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#232a31" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1f2d27" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#5f8a72" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c343d" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1f24" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9aa3b2" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3b4651" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f252b" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#c3cad6" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#262e36" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#8a93a6" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f1a24" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6a85" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#0f1a24" }] },
];

/**
 * Google Maps `styles` for the current layout mode. In light mode the
 * `lightStyles` are returned (an empty array resets to Google's default,
 * which `undefined` would not do after switching back from dark).
 * `merge` keeps `lightStyles` on top of the dark palette (e.g. hidden POIs).
 */
const NO_STYLES = [];

// Returns a stable array per mode: a fresh array each render makes map
// `options` change every render, so Google re-applies them constantly.
export const useMapThemeStyles = (lightStyles = NO_STYLES, { merge = false } = {}) => {
  const isDark = useSelector(
    (state) => state.LayoutReducer?.layoutModeType === "dark",
  );
  return useMemo(() => {
    if (!isDark) return lightStyles;
    return merge ? [...DARK_MAP_STYLES, ...lightStyles] : DARK_MAP_STYLES;
  }, [isDark, merge, lightStyles]);
};
