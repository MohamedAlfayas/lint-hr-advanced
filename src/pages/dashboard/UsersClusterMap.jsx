import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  MarkerClusterer,
} from "@react-google-maps/api";
import { useSelector } from "react-redux";
import "../../common/css/lc_style.css";

const containerStyle = {
  width: "105%",
  height: "95%",
  borderRadius: "2px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const indiaCenter = {
  lat: 22.3511148, // Approximate center of India
  lng: 78.6677428,
};

const UsersClusterMapGoogle = ({ locations }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
  });

  const attendanceData = useSelector(
    (state) => state.TodayAttendanceReducer.today_attendance
  );

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);

  // ✅ Build markers based on source (locations or attendanceData)
  useEffect(() => {
    if (locations && locations.length > 0) {
      const newMarkers = locations
        .map((loc, idx) => ({
          id: idx,
          name: `Point ${idx + 1}`,
          lat: parseFloat(loc.latitude),
          lng: parseFloat(loc.longitude),
          address: loc.accurate_address,
          timestamp: loc.timestamp,
        }))
        .filter((m) => !isNaN(m.lat) && !isNaN(m.lng));
      setMarkers(newMarkers);
    } else if (attendanceData && attendanceData.length > 0) {
      const newMarkers = attendanceData
        .map((item) => {
          if (!item.first_check_in) return null;

          const lat = parseFloat(item.first_check_in.latitude);
          const lng = parseFloat(item.first_check_in.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          return {
            id: item.employee.id,
            name: item.employee.first_name,
            profile_url: item.employee.profile_url,
            lat,
            lng,
          };
        })
        .filter(Boolean);
      setMarkers(newMarkers);
    } else {
      setMarkers([]);
    }
  }, [locations, attendanceData]);

  // ✅ Auto-fit map bounds when markers update
  useEffect(() => {
    if (mapRef.current && markers.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
      mapRef.current.fitBounds(bounds, 50);
    }
  }, [markers]);

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markers.length > 0 ? undefined : indiaCenter}
      zoom={markers.length > 0 ? 10 : 5}
      onLoad={(map) => (mapRef.current = map)}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* ✅ Render clustered markers */}
      {markers.length > 0 && (
        <MarkerClusterer>
          {(clusterer) =>
            markers.map((m) => (
              <Marker
                key={m.id}
                position={{ lat: m.lat, lng: m.lng }}
                clusterer={clusterer}
                onClick={() => setSelectedMarker(m)}
              />
            ))
          }
        </MarkerClusterer>
      )}

      {/* ✅ InfoWindow on marker click */}
      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="lc_infowindow">
            {selectedMarker.profile_url ? (
              <img
                src={selectedMarker.profile_url}
                alt={selectedMarker.name}
                className="lc_marker_img"
              />
            ) : (
              <div className="lc_marker_fallback">
                {selectedMarker.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <h4 className="lc_marker_name">{selectedMarker.name}</h4>
            {selectedMarker.address && (
              <p className="lc_marker_address">{selectedMarker.address}</p>
            )}
            {selectedMarker.timestamp && (
              <small className="lc_marker_time">
                {new Date(selectedMarker.timestamp).toLocaleString()}
              </small>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default UsersClusterMapGoogle;
