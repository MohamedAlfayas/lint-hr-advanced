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

const UsersClusterMapGoogle = ({ locations }) => {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);
  const attendanceData = useSelector(
    (state) => state.TodayAttendanceReducer.today_attendance
  );

  const [groupedMarkers, setGroupedMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);

  console.log("atttt",attendanceData);
  

  // ✅ Build marker data and group by lat/lng
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
            cleanedAddress = parts.slice(1).join(",").trim(); // remove the first part (e.g. "X7GW+6WM")
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
            if (parts.length > 1 && parts[0].trim().match(/^[A-Z0-9+]+$/)) {
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
console.log(allData,"DATA");
    const validMarkers = allData.filter(
      (m) => !isNaN(m.lat) && !isNaN(m.lng)
    );

    // ✅ Group markers by coordinate (to show count)
    const grouped = {};
    validMarkers.forEach((m) => {
      const key = `${m.lat.toFixed(6)}-${m.lng.toFixed(6)}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });

    const groupedArray = Object.keys(grouped).map((key) => {
      const [lat, lng] = key.split("-").map(Number);
      return {
        lat,
        lng,
        count: grouped[key].length,
        users: grouped[key],
      };
    });

    setGroupedMarkers(groupedArray);
  },
   [locations, attendanceData]);

  // ✅ Fit map bounds automatically
  useEffect(() => {
    if (mapRef.current && groupedMarkers.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      groupedMarkers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
      mapRef.current.fitBounds(bounds, 80);
    }
  }, [groupedMarkers]);

  const handleMarkerClick = (marker) => setSelectedMarker(marker);
  const handleCloseClick = () => setSelectedMarker(null);

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={groupedMarkers.length ? undefined : indiaCenter}
      zoom={groupedMarkers.length ? 10 : 5}
      onLoad={(map) => (mapRef.current = map)}
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
            path: google.maps.SymbolPath.CIRCLE,
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
      <h6 className="lc-infowindow-title">
        📍 {selectedMarker.count} Record{selectedMarker.count > 1 ? "s" : ""}
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
                <strong className="lc-infowindow-name">{user.name}</strong>
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
