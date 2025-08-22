import React, { useState, useEffect } from "react";

export default function LiveLocationTracker() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState("");

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setError("");
        },
        (err) => {
          setError(err.message);
        },
        {
          enableHighAccuracy: true, // more accurate tracking
          timeout: 5000,           // wait max 5s for location
          maximumAge: 0,           // don't use cached position
        }
      );

      // cleanup when component unmounts
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📍 Live Location Tracker</h2>

      {error && <p style={styles.error}>❌ {error}</p>}

      {location.lat && location.lng ? (
        <>
          <p style={styles.text}>Latitude: <b>{location.lat}</b></p>
          <p style={styles.text}>Longitude: <b>{location.lng}</b></p>
          <iframe
            title="map"
            width="100%"
            height="300"
            style={styles.map}
            src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
          ></iframe>
        </>
      ) : (
        <p style={styles.text}>Getting location...</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "auto",
    padding: "20px",
    border: "2px solid #ddd",
    borderRadius: "10px",
    textAlign: "center",
    background: "#f9f9f9",
  },
  heading: {
    marginBottom: "15px",
    color: "#333",
  },
  text: {
    fontSize: "16px",
    margin: "5px 0",
  },
  error: {
    color: "red",
  },
  map: {
    marginTop: "15px",
    border: "none",
    borderRadius: "10px",
  },
};
