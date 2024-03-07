import {
  Circle,
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import React, { useEffect, useRef, useState } from "react";
import { Col } from "reactstrap";
import { map_radius_options } from "../../common/constant/Constants";

function DistanceCalculaterInMap({ branchObj }) {
  const [mapZoom, setMapZoom] = useState(21);

  const [mapCenter, setMapCenter] = useState({
    lat: 8.3865046,
    lng: 77.608336,
  });

  const locations = [
    { lat: 8.3865046, lng: 77.608336, name: "Lintcloud Office" }, // New York City
    { lat: 8.389969903467833, lng: 77.60979309924807, name: "A4 Agency" }, // Los Angeles
  ];

  useEffect(() => {
    if (!!branchObj?.radius_range) {
      setMapCircleOptions({
        ...mapCircleOptions,
        radius: branchObj?.radius_range,
      });
      setMapZoom(
        map_radius_options.find((d) => d.value === branchObj?.radius_range).zoom
      );
    }

    if (!!branchObj?.latitude && !!branchObj?.longitude) {
      setMapCenter({
        lat: parseFloat(branchObj?.latitude),
        lng: parseFloat(branchObj?.longitude),
      });
    }
  }, [branchObj?.radius_range, branchObj?.latitude, branchObj?.longitude]);

  const [mapCircleOptions, setMapCircleOptions] = useState({
    strokeColor: "#FF0000",
    strokeOpacity: 0.3,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.15,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 10,
    zIndex: 1,
  });

  const containerStyle = {
    width: "100%",
    height: "400px",
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.DEV_MAP_API_KEY,
  });

  const [map, setMap] = React.useState(null);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onLoadCircle = (circle) => {
    console.log("Circle onLoad circle: ", circle);
  };

  const onUnmountCircle = (circle) => {
    console.log("Circle onUnmount circle: ", circle);
  };

  const [distance, setDistance] = useState(null);
  const mapRef = useRef(null);

  // Function to calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 * 1000; // Radius of the Earth in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in meters
    return d;
  };

  useEffect(() => {
    // Calculate total distance of the polyline
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      totalDistance += calculateDistance(
        locations[i - 1].lat,
        locations[i - 1].lng,
        locations[i].lat,
        locations[i].lng
      );
    }
    setDistance(totalDistance.toFixed(2)); // Set distance state
  }, []);

  useEffect(() => {
    // Fit map bounds based on polyline path
    if (mapRef.current && distance) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach((location) => {
        bounds.extend(
          new window.google.maps.LatLng(location.lat, location.lng)
        );
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [distance]);

  const mapRefCenter = useRef(null);

  useEffect(() => {
    if (mapRefCenter.current) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach((location) => {
        bounds.extend(
          new window.google.maps.LatLng(location.lat, location.lng)
        );
      });
      mapRefCenter.current.fitBounds(bounds);
    }
  }, []);

  return isLoaded ? (
    <React.Fragment>
      <Col lg={12}>
        {" "}
        <GoogleMap
          mapContainerStyle={containerStyle}
          zoom={mapZoom}
          ref={mapRefCenter}
          onLoad={(map) => (mapRef.current = map)}
          onUnmount={onUnmount}
        >
          {/* Markers for the two points */}
          {locations.map((location, index) => (
            <Marker
              key={index}
              position={location}
              title={location.name} // Add title to the marker
            />
          ))}
          <Circle
            // optional
            onLoad={onLoadCircle}
            // optional
            onUnmount={onUnmountCircle}
            // required
            center={mapCenter}
            // required
            options={mapCircleOptions}
          />
          {/* Polyline to connect the two points */}
          <Polyline
            path={locations}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 1.0,
              strokeWeight: 2,
            }}
          />

          {/* Overlay to display distance above the polyline */}
          {distance && (
            <div
              style={{
                position: "absolute",
                top: 50,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "white",
                padding: 5,
                borderRadius: 5,
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              Distance: {distance} meters
            </div>
          )}
          {/* Child components, such as markers, info windows, etc. */}
          <></>
        </GoogleMap>
      </Col>
    </React.Fragment>
  ) : (
    <></>
  );
}

export default DistanceCalculaterInMap;
