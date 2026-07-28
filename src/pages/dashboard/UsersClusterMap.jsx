// src/component/maps/UsersClusterMapGoogle.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { useSelector } from "react-redux";
import "../../common/css/lc_style.css";

// ✅ Map Container Style
const containerStyle = {
  width: "105%",
  height: "95%",
  borderRadius: "6px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

// ✅ Default Center (India)
const indiaCenter = {
  lat: 22.3511148,
  lng: 78.6677428,
};

// ✅ Loader Config
const GOOGLE_MAPS_CONFIG = {
  id: "google-map-script",
  googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
  libraries: ["places"],
};

// ✅ Zoom -> coordinate rounding precision.
// Lower zoom (zoomed out) => fewer decimal places => markers merge into bigger clusters.
// Higher zoom (zoomed in) => more decimal places => markers separate.
const getPrecision = (z) => {
  if (z <= 3) return 0; // whole world -> 1 cluster
  if (z <= 5) return 1;
  if (z <= 7) return 2;
  if (z <= 10) return 3;
  return 5; // zoomed in -> near-exact, markers separate
};

const UsersClusterMapGoogle = ({ locations }) => {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);
  const attendanceData = useSelector(
    (state) => state.TodayAttendanceReducer.today_attendance,
  );

  const [groupedMarkers, setGroupedMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [zoom, setZoom] = useState(5);
  const mapRef = useRef(null);

  // ✅ Build marker data and group by lat/lng (grouping precision depends on zoom)
  useEffect(() => {
    const allData =
      Array.isArray(locations) && locations.length > 0
        ? locations.map((loc) => {
            let indianTime = "";
            if (loc?.timestamp) {
              const date = new Date(loc.timestamp);
              indianTime = date.toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
            }

            // ✅ Clean address: remove the first comma part if it looks like a plus code
            let cleanedAddress = "";
            if (loc?.accurate_address) {
              const parts = loc.accurate_address.split(",");
              if (parts.length > 1 && parts[0].trim().match(/^[A-Z0-9+]+$/)) {
                cleanedAddress = parts.slice(1).join(",").trim();
              } else {
                cleanedAddress = loc.accurate_address.trim();
              }
            }

            return {
              name: loc?.employee?.first_name || "",
              lat: parseFloat(loc?.latitude) || 0,
              lng: parseFloat(loc?.longitude) || 0,
              address: cleanedAddress,
              timestamp: indianTime,
              profile_url: loc?.employee?.profile_url,
            };
          })
        : attendanceData
          ? attendanceData
              .filter((item) => item.first_check_in)
              .map((item) => {
                let cleanedAddress = "";
                if (item.first_check_in.location) {
                  const parts = item.first_check_in.location.split(",");
                  if (
                    parts.length > 1 &&
                    parts[0].trim().match(/^[A-Z0-9+]+$/)
                  ) {
                    cleanedAddress = parts.slice(1).join(",").trim();
                  } else {
                    cleanedAddress = item.first_check_in.location.trim();
                  }
                }

                return {
                  name: item.employee.first_name,
                  department: item.employee.department_name,
                  lat: parseFloat(item.first_check_in.latitude),
                  lng: parseFloat(item.first_check_in.longitude),
                  profile_url: item.employee.profile_url,
                  address: cleanedAddress,
                  timestamp: item.first_check_in_time,
                };
              })
          : [];

    const validMarkers = allData.filter((m) => !isNaN(m.lat) && !isNaN(m.lng));

    // ✅ Group markers by rounded coordinate (precision depends on current zoom).
    // At very low zoom (whole world view), force everything into ONE cluster
    // showing the total count, regardless of how far apart the coordinates are.
    const grouped = {};
    if (zoom <= 3) {
      grouped["world"] = validMarkers;
    } else {
      const precision = getPrecision(zoom);
      validMarkers.forEach((m) => {
        const key = `${m.lat.toFixed(precision)}-${m.lng.toFixed(precision)}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(m);
      });
    }

    const groupedArray = Object.keys(grouped).map((key) => {
      const group = grouped[key];
      // Use the average position so the cluster marker sits centered among its
      // members rather than snapped to the rounded grid key.
      const lat = group.reduce((s, m) => s + m.lat, 0) / group.length;
      const lng = group.reduce((s, m) => s + m.lng, 0) / group.length;
      return { lat, lng, count: group.length, users: group };
    });

    setGroupedMarkers(groupedArray);
  }, [locations, attendanceData, zoom]);

  // ✅ Fit map bounds automatically — only when the underlying data changes,
  // not on every zoom-driven regroup (otherwise zooming in/out fights itself)
  useEffect(() => {
    if (mapRef.current && groupedMarkers.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      groupedMarkers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
      mapRef.current.fitBounds(bounds, 80);
    }
  }, [locations, attendanceData]);

  const handleMarkerClick = (marker) => setSelectedMarker(marker);
  const handleCloseClick = () => setSelectedMarker(null);

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={groupedMarkers.length ? undefined : indiaCenter}
      zoom={groupedMarkers.length ? 10 : 5}
      onLoad={(map) => {
        mapRef.current = map;
        setZoom(map.getZoom());
      }}
      onZoomChanged={() => {
        if (mapRef.current) setZoom(mapRef.current.getZoom());
      }}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* ✅ Marker with count */}
      {groupedMarkers.map((marker, index) => (
        <Marker
          key={index}
          position={{ lat: marker.lat, lng: marker.lng }}
          onClick={() => handleMarkerClick(marker)}
          label={{
            text: String(marker.count),
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
          }}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#007bff",
            fillOpacity: 0.9,
            strokeColor: "white",
            strokeWeight: 2,
            scale: 16,
          }}
        />
      ))}

      {/* ✅ InfoWindow - individual address & time for each record */}
      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={handleCloseClick}
        >
          <div className="lc-infowindow-card lc-infowindow-compact">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <h6 className="lc-infowindow-title" style={{ margin: 0 }}>
                📍 {selectedMarker.count} Record
                {selectedMarker.count > 1 ? "s" : ""}
              </h6>
              <button
                onClick={handleCloseClick}
                title="Close"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "16px",
                  lineHeight: 1,
                  color: "#64748b",
                  padding: "2px",
                  flexShrink: 0,
                }}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            <ul className="lc-infowindow-list">
              {selectedMarker.users.map((user, i) => (
                <li key={i} className="lc-infowindow-item">
                  <div className="lc-infowindow-user">
                    {user.profile_url ? (
                      <img
                        src={user.profile_url}
                        alt={user.name}
                        className="lc-infowindow-avatar"
                      />
                    ) : (
                      <div className="lc-infowindow-avatar-placeholder">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="lc-infowindow-details">
                      <strong className="lc-infowindow-name">
                        {user.name}
                      </strong>
                      <div className="lc-infowindow-time">
                        <i className="ri-time-line"></i> {user.timestamp}
                      </div>
                      <div className="lc-infowindow-address">
                        <i className="ri-map-pin-2-fill"></i> {user.address}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default UsersClusterMapGoogle;
