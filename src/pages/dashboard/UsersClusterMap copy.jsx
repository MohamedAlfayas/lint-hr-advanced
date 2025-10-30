import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useSelector } from "react-redux";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Auto-fit bounds helper
const FitBounds = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, markers]);
  return null;
};

const UsersClusterMap = ({ locations }) => {
  const attendanceData = useSelector(
    (state) => state.TodayAttendanceReducer.today_attendance
  );

  let markers = [];

  if (locations && locations.length > 0) {
    // 👤 Employee mode → show only clicked employee's history
    markers = locations.map((loc, idx) => ({
      id: idx,
      name: `Point ${idx + 1}`,
      lat: parseFloat(loc.latitude),
      lng: parseFloat(loc.longitude),
      address: loc.accurate_address,
      timestamp: loc.timestamp,
    }));
  } else {
    // 🌍 Default mode → show all employees
    markers = attendanceData
      .map((item) => {
        let lat = null;
        let lng = null;

        if (item.first_check_in) {
          lat = parseFloat(item.first_check_in.latitude);
          lng = parseFloat(item.first_check_in.longitude);
        } else if (item.location_history && item.location_history.length > 0) {
          lat = parseFloat(item.location_history[0].latitude);
          lng = parseFloat(item.location_history[0].longitude);
        }

        if (!lat || !lng) return null;

        return {
          id: item.employee.id,
          name: item.employee.first_name,
          profile_url: item.employee.profile_url,
          lat,
          lng,
        };
      })
      .filter(Boolean);
  }

  return (
    <div className="lc_map">
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{
        height: "71vh",
        width: "100%",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        subdomains={["a", "b", "c", "d"]}
        maxZoom={20}
      />

      <MarkerClusterGroup chunkedLoading>
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            <Popup>
              {m.profile_url ? (
                <img
                  src={m.profile_url}
                  alt={m.name}
                  style={{
                    borderRadius: "50%",
                    width: 50,
                    height: 50,
                    objectFit: "cover",
                    marginBottom: "5px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    backgroundColor: "#4a90e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 20,
                    fontWeight: "bold",
                    margin: "0 auto 5px",
                  }}
                >
                  {m.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <h4 style={{ margin: "5px 0", fontSize: "14px" }}>{m.name}</h4>
              {m.address && <p>{m.address}</p>}
              {m.timestamp && (
                <small>{new Date(m.timestamp).toLocaleString()}</small>
              )}
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      <FitBounds markers={markers} />
    </MapContainer>
    </div>
  );
};

export default UsersClusterMap;
