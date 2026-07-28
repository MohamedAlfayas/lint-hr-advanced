import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const loaderOptions = {
  id: "google-map-script",
  googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
  libraries: ["places"],
  version: "weekly",
};

const indiaCenter = { lat: 8.3784499, lng: 77.6082801 };

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5f6f8" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f6f8" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e0e0e0" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#e8eaed" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eceff1" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e2f0e4" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#cfe8f3" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#d6d6d6" }],
  },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

// ---- Hardcoded API-shaped data (replace fetchEmployeeLocations body with real call) ----
const RAW_LOCATIONS = [
  {
    action: "location_update",
    employee_id: 9,
    employee_name: "Suman Raj",
    latitude: "8.3784499",
    longitude: "77.6082801",
    is_outside_range: false,
    created_time: "2026-07-21 04:55:15.025232+00:00",
  },
  {
    action: "location_update",
    employee_id: 12,
    employee_name: "Arjun Kumar",
    latitude: "8.3925310",
    longitude: "77.6210044",
    is_outside_range: false,
    created_time: "2026-07-21 04:54:40.025232+00:00",
  },
  {
    action: "location_update",
    employee_id: 14,
    employee_name: "Priya Menon",
    latitude: "8.3661200",
    longitude: "77.5980500",
    is_outside_range: true,
    created_time: "2026-07-21 04:50:12.025232+00:00",
  },
  {
    action: "location_update",
    employee_id: 21,
    employee_name: "Faisal Ahmed",
    latitude: "8.4012870",
    longitude: "77.6155600",
    is_outside_range: false,
    created_time: "2026-07-21 04:53:02.025232+00:00",
  },
  {
    action: "location_update",
    employee_id: 27,
    employee_name: "Divya S",
    latitude: "8.3559900",
    longitude: "77.6320100",
    is_outside_range: true,
    created_time: "2026-07-21 04:48:55.025232+00:00",
  },
];

// Simulated async API call — swap body with:
// const res = await Api.get("/attendance/get-current-locations");
// return res.data.data;
async function fetchEmployeeLocations() {
  await new Promise((res) => setTimeout(res, 700));
  return RAW_LOCATIONS.map((emp) => ({
    ...emp,
    latitude: (
      parseFloat(emp.latitude) +
      (Math.random() - 0.5) * 0.002
    ).toFixed(7),
    longitude: (
      parseFloat(emp.longitude) +
      (Math.random() - 0.5) * 0.002
    ).toFixed(7),
    created_time: new Date().toISOString(),
  }));
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const COLORS = {
  ok: "#16a34a",
  outside: "#dc2626",
};

function makeDotIcon(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
      <circle cx="13" cy="13" r="9" fill="${color}" stroke="#ffffff" stroke-width="3"/>
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(26, 26),
    anchor: new window.google.maps.Point(13, 13),
    labelOrigin: new window.google.maps.Point(13, 34),
  };
}

const AllEmployeeLocation = () => {
  const { isLoaded } = useJsApiLoader(loaderOptions);
  const [employees, setEmployees] = useState(RAW_LOCATIONS);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedId, setSelectedId] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEmployeeLocations();
      setEmployees(data);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const points = useMemo(
    () =>
      employees.map((e) => ({
        ...e,
        lat: parseFloat(e.latitude),
        lng: parseFloat(e.longitude),
      })),
    [employees],
  );

  const fitBounds = useCallback((map, pts) => {
    if (!map || !pts.length || !window.google) return;
    if (pts.length === 1) {
      map.setCenter({ lat: pts[0].lat, lng: pts[0].lng });
      map.setZoom(14);
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    pts.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, []);

  const onMapLoad = useCallback(
    (map) => {
      setMapRef(map);
      fitBounds(map, points);
    },
    [points, fitBounds],
  );

  useEffect(() => {
    if (mapRef) fitBounds(mapRef, points);
  }, [points, mapRef, fitBounds]);

  const total = employees.length;
  const online = employees.filter(
    (e) => (Date.now() - new Date(e.created_time).getTime()) / 60000 < 5,
  ).length;
  const outside = employees.filter((e) => e.is_outside_range).length;
  const offline = total - online;

  const selected = points.find((p) => p.employee_id === selectedId) || null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        background: "#f3f4f6",
        color: "#111827",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          padding: "12px 20px",
          borderBottom: "1px solid #e5e7eb",
          background: "#ffffff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "linear-gradient(135deg,#0ea5e9,#0369a1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            LC
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, lineHeight: 1 }}>
              Lintcloud
            </div>
            <div
              style={{ fontSize: "10.5px", color: "#6b7280", marginTop: "3px" }}
            >
              Live location monitoring
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "11.5px", color: "#6b7280" }}>
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
              background: loading ? "#f3f4f6" : "#0ea5e9",
              color: loading ? "#6b7280" : "#fff",
              padding: "7px 14px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              transition: "background .15s",
            }}
          >
            <i
              className="ri-refresh-line"
              style={{
                display: "inline-block",
                animation: loading ? "aelgm-spin 0.8s linear infinite" : "none",
              }}
            ></i>
            Refresh
          </button>
        </div>
      </div>

      <style>{`@keyframes aelgm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div
        style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "row" }}
      >
        {/* Map (now on the left, sidebar on right) */}
        <div
          style={{
            flex: 1,
            minHeight: "300px",
            position: "relative",
            padding: "14px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.08), 0 1px 8px rgba(0,0,0,0.06)",
              border: "1px solid #e5e7eb",
            }}
          >
            {!isLoaded ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  fontSize: "13px",
                  background: "#fff",
                }}
              >
                Loading map...
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={indiaCenter}
                zoom={13}
                onLoad={onMapLoad}
                options={{
                  streetViewControl: false,
                  fullscreenControl: false,
                  mapTypeControl: false,
                  zoomControl: true,
                  styles: MAP_STYLE,
                }}
              >
                {points.map((p) => (
                  <Marker
                    key={p.employee_id}
                    position={{ lat: p.lat, lng: p.lng }}
                    onClick={() => setSelectedId(p.employee_id)}
                    icon={makeDotIcon(
                      p.is_outside_range ? COLORS.outside : COLORS.ok,
                    )}
                    label={{
                      text: p.employee_name || `#${p.employee_id}`,
                      className: "aelgm-marker-label",
                      color: "#111827",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  />
                ))}
              </GoogleMap>
            )}
          </div>

          {/* mobile stat strip */}
          <div
            className="aelgm-mobile-stats"
            style={{
              position: "absolute",
              bottom: "26px",
              left: "26px",
              right: "26px",
              display: "none",
              gap: "8px",
              background: "rgba(255,255,255,0.96)",
              borderRadius: "12px",
              padding: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            <StatCard label="Total" value={total} bg="#f3f4f6" small />
            <StatCard label="Active" value={online} bg="#dcfce7" small />
            <StatCard label="Outside" value={outside} bg="#fef3c7" small />
            <StatCard label="Offline" value={offline} bg="#fee2e2" small />
          </div>
        </div>

        {/* Sidebar (right side) */}
        <div
          style={{
            width: "300px",
            flexShrink: 0,
            borderLeft: "1px solid #e5e7eb",
            background: "#ffffff",
            overflowY: "auto",
          }}
          className="aelgm-sidebar"
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              padding: "14px",
            }}
          >
            <StatCard label="Total" value={total} bg="#f3f4f6" />
            <StatCard label="Active" value={online} bg="#dcfce7" />
            <StatCard label="Outside range" value={outside} bg="#fef3c7" />
            <StatCard label="Offline" value={offline} bg="#fee2e2" />
          </div>

          <div
            style={{
              padding: "6px 14px 10px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#6b7280",
              letterSpacing: "0.5px",
            }}
          >
            EMPLOYEE TRACKING ({total})
          </div>

          {employees.map((e) => (
            <button
              key={e.employee_id}
              onClick={() => {
                setSelectedId(e.employee_id);
                if (mapRef) {
                  mapRef.panTo({
                    lat: parseFloat(e.latitude),
                    lng: parseFloat(e.longitude),
                  });
                  mapRef.setZoom(15);
                }
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                border: "none",
                borderBottom: "1px solid #f3f4f6",
                background:
                  selectedId === e.employee_id ? "#eff6ff" : "transparent",
                padding: "10px 14px",
                cursor: "pointer",
                color: "#111827",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  {e.employee_name || `Employee #${e.employee_id}`}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "10px",
                    background: e.is_outside_range ? "#fee2e2" : "#dcfce7",
                    color: e.is_outside_range ? "#b91c1c" : "#15803d",
                  }}
                >
                  {e.is_outside_range ? "OUTSIDE" : "ON RANGE"}
                </span>
              </div>
              <div
                style={{ fontSize: "11px", color: "#6b7280", marginTop: "3px" }}
              >
                GPS {timeAgo(e.created_time)} &middot;{" "}
                {parseFloat(e.latitude).toFixed(4)},{" "}
                {parseFloat(e.longitude).toFixed(4)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .aelgm-marker-label {
          background: #ffffff;
          padding: 1px 6px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
          white-space: nowrap;
        }
        @media (max-width: 767px) {
          .aelgm-sidebar { display: none !important; }
          .aelgm-mobile-stats { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

function StatCard({ label, value, bg, small }) {
  return (
    <div
      style={{
        background: bg,
        borderRadius: "10px",
        padding: small ? "6px 8px" : "10px 12px",
        textAlign: small ? "center" : "left",
      }}
    >
      <div style={{ fontSize: small ? "9px" : "11px", color: "#6b7280" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: small ? "14px" : "19px",
          fontWeight: 700,
          marginTop: "2px",
          color: "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default AllEmployeeLocation;
