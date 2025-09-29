import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Users data (India + Sri Lanka, total 10)
const users = [
  { id: 1, name: "Alice", lat: 28.6139, lng: 77.2090, image: "https://i.pravatar.cc/40?img=1" },
  { id: 2, name: "Ravi", lat: 19.0760, lng: 72.8777, image: "https://i.pravatar.cc/40?img=2" },
  { id: 3, name: "Priya", lat: 13.0827, lng: 80.2707, image: "https://i.pravatar.cc/40?img=3" },
  { id: 4, name: "Arjun", lat: 12.9716, lng: 77.5946, image: "https://i.pravatar.cc/40?img=4" },
  { id: 5, name: "Neha", lat: 22.5726, lng: 88.3639, image: "https://i.pravatar.cc/40?img=5" },
  { id: 6, name: "Vikram", lat: 17.3850, lng: 78.4867, image: "https://i.pravatar.cc/40?img=6" },

  // Sri Lanka
  { id: 7, name: "Kavindi", lat: 6.9271, lng: 79.8612, image: "https://i.pravatar.cc/40?img=7" },
  { id: 8, name: "Nimal", lat: 7.2906, lng: 80.6337, image: "https://i.pravatar.cc/40?img=8" },
  { id: 9, name: "Tharushi", lat: 6.0535, lng: 80.2210, image: "https://i.pravatar.cc/40?img=9" },
  { id: 10, name: "Sahan", lat: 8.3114, lng: 80.4037, image: "https://i.pravatar.cc/40?img=10" },
];

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

// Component to auto-fit bounds
const FitBounds = ({ users }) => {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(users.map((u) => [u.lat, u.lng]));
    map.fitBounds(bounds, { padding: [50, 50] }); // Add padding so markers don’t stick to edges
  }, [map, users]);

  return null;
};

const UsersClusterMap = () => {
    
  return (
    <MapContainer
      center={[20, 0]} // fallback center
      zoom={2} // fallback zoom
      style={{ height: "65vh", width: "100%", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
      />

      <MarkerClusterGroup chunkedLoading>
        {users.map((user) => (
          <Marker key={user.id} position={[user.lat, user.lng]}>
            <Popup>
              <div style={{ textAlign: "center" }}>
                <img
                  src={user.image}
                  alt={user.name}
                  style={{ borderRadius: "50%", width: 50, height: 50 }}
                />
                <h4 style={{ margin: "5px 0", fontSize: "14px" }}>{user.name}</h4>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      <FitBounds users={users} />
    </MapContainer>
  );
};

export default UsersClusterMap;
