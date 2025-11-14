// src/component/maps/UsersClusterMapAll.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import "../../common/css/lc_style.css";

// ✅ Google Maps loader configuration
const loaderOptions = {
  id: "google-map-script",
  googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
  libraries: ["places"],
  version: "weekly",
};

// ✅ Map container style
const containerStyle = {
  width: "100%",
  height: "95%",
  borderRadius: "8px",
};

// ✅ Default India center
const indiaCenter = { lat: 22.3511148, lng: 78.6677428 };

const UsersClusterMapAll = ({ locations = [] }) => {
  const { isLoaded } = useJsApiLoader(loaderOptions);
  const mapRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [path, setPath] = useState([]);

  // ✅ Prepare path and clean address data
  useEffect(() => {
    if (Array.isArray(locations) && locations.length > 0) {
      const processed = locations.map((loc, index) => {
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
          index: index + 1, // sequential order
          name: loc?.employee?.first_name || "",
          lat: parseFloat(loc?.latitude) || 0,
          lng: parseFloat(loc?.longitude) || 0,
          address: cleanedAddress,
          timestamp: indianTime,
          profile_url: loc?.employee?.profile_url,
        };
      });

      setPath(processed);
    }
  }, [locations]);

  // ✅ Fit map bounds to route
  useEffect(() => {
    if (mapRef.current && path.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((p) => bounds.extend(p));
      mapRef.current.fitBounds(bounds, 80);
    }
  }, [path]);

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={path.length ? path[0] : indiaCenter}
      zoom={10}
      onLoad={(map) => (mapRef.current = map)}
      options={{
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
      }}
    >
      {/* 🟢 Numbered Markers */}
      {path.map((p, i) => (
        <Marker
          key={i}
          position={p}
          label={{
            text: `${i + 1}`, // 1, 2, 3, 4, 5...
            color: "white",
            fontSize: "12px",
            fontWeight: "bold",
          }}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor:
              i === 0
                ? "#28a745" // green start
                : i === path.length - 1
                ? "#dc3545" // red end
                : "#0d6efd", // blue middle
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          }}
          onClick={() =>
            setSelectedMarker({
              lat: p.lat,
              lng: p.lng,
              count: 1,
              users: [p],
            })
          }
        />
      ))}

      {/* 🔵 Route Line with Direction Arrows */}
      {path.length > 1 && (
        <Polyline
          path={path}
          options={{
            strokeColor: "#0d6efd",
            strokeOpacity: 0.8,
            strokeWeight: 3,
            icons: [
              {
                icon: {
                  path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 3,
                  strokeOpacity: 1,
                  fillColor: "#0d6efd",
                  fillOpacity: 1,
                },
                offset: "100%",
                repeat: "100px", // repeat arrows along line
              },
            ],
          }}
        />
      )}

      {/* 🪧 Info Window */}
      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="lc-infowindow-card lc-infowindow-compact">
            <h6 className="lc-infowindow-title">
              📍 {selectedMarker.count} Record
              {selectedMarker.count > 1 ? "s" : ""}
            </h6>

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

export default UsersClusterMapAll;
