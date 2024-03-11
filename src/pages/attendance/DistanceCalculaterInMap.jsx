import {
  Circle,
  GoogleMap,
  InfoWindow,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import React, { useEffect, useRef, useState } from "react";
import { Col } from "reactstrap";
import { map_radius_options } from "../../common/constant/Constants";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const mapIconOffice = require("../../assets/images/icons/office.png");
const mapIconEmployee = require("../../assets/images/icons/location.png");

const DistanceCalculaterInMap = ({ locationData, locationType }) => {
  let locationObj;

  if (locationType === "in") {
    locationObj = locationData.entry_log[0] || null;
  } else {
    locationObj = locationData.entry_log
      .filter((entry) => entry.entry_type === 2)
      .slice(-1)[0];
  }

  const employeeData = GetLocalStorageData("employee") || [];
  const branchData = GetLocalStorageData("branch") || [];

  const employeeBracnchID = employeeData.find(
    (d) => locationData.employee_id === d.id
  );

  const branchObj = branchData.find((b) =>
    employeeBracnchID.branch_id_list.includes(b.id)
  );

  const [mapZoom, setMapZoom] = useState(21);

  const [mapCenter, setMapCenter] = useState({
    lat: 8.3865046,
    lng: 77.608336,
  });

  // const locations = [
  //   { lat: 8.3865046, lng: 77.608336, name: "Lintcloud Office" }, // New York City
  //   { lat: 8.389969903467833, lng: 77.60979309924807, name: "A4 Agency" }, // Los Angeles
  // ];

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
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  useEffect(() => {
    // Calculate total distance of the polyline
    let totalDistance = 0;

    totalDistance += calculateDistance(
      branchObj.latitude,
      branchObj.longitude,
      locationObj.latitude,
      locationObj.longitude
    );

    setDistance(totalDistance.toFixed(2)); // Set distance state
  }, []);

  useEffect(() => {
    // Fit map bounds based on polyline path
    if (mapRef.current && distance) {
      const bounds = new window.google.maps.LatLngBounds();

      bounds.extend(
        new window.google.maps.LatLng(
          locationObj.latitude,
          locationObj.longitude
        )
      );
      bounds.extend(
        new window.google.maps.LatLng(branchObj.latitude, branchObj.longitude)
      );

      mapRef.current.fitBounds(bounds);
    }
  }, [distance]);

  const mapRefCenter = useRef(null);

  useEffect(() => {
    if (mapRefCenter.current) {
      const bounds = new window.google.maps.LatLngBounds();

      bounds.extend(
        new window.google.maps.LatLng(
          locationObj.latitude,
          locationObj.longitude
        )
      );
      bounds.extend(
        new window.google.maps.LatLng(branchObj.latitude, branchObj.longitude)
      );

      mapRefCenter.current.fitBounds(bounds);
    }
  }, []);

  const [selectedMarker, setSelectedMarker] = useState(null);

  // Function to calculate heading between two points
  const calculateHeading = (pointA, pointB) => {
    const lat1 = (pointA.latitude * Math.PI) / 180;
    const lon1 = (pointA.longitude * Math.PI) / 180;
    const lat2 = (pointB.latitude * Math.PI) / 180;
    const lon2 = (pointB.longitude * Math.PI) / 180;

    const dLon = lon2 - lon1;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let brng = Math.atan2(y, x);
    brng = (brng * 180) / Math.PI;

    return brng;
  };
  const rotation = calculateHeading(branchObj, locationObj);
  const paths = [
    {
      lat: parseFloat(branchObj.latitude),
      lng: parseFloat(branchObj.longitude),
    },
    {
      lat: parseFloat(locationObj.latitude),
      lng: parseFloat(locationObj.longitude),
    },
  ];

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
          {/* {locations.map((location, index) => (
            <Marker
              key={index}
              position={location}
              title={location.name} // Add title to the marker
            />
          ))} */}

          {/* Markers for the two points */}
          {/* {locations.map((location, index) => {
            const nextLocation =
              locations[index === locations.length - 1 ? 0 : index + 1];
            const rotation = calculateHeading(location, nextLocation);
            return (
              <Marker
                key={index}
                position={location}
                title={location.name} // Add title to the marker
                icon={{
                  url: index === 0 ? mapIconOffice : mapIconEmployee,
                  scaledSize: new window.google.maps.Size(40, 40),
                  rotation: rotation,
                }}
              >
                <InfoWindow>
                  <div>{location.name}</div>
                </InfoWindow>
              </Marker>
            );
          })} */}

          {/* Markers for the two points */}
          <>
            <Marker
              position={{
                lat: parseFloat(branchObj.latitude),
                lng: parseFloat(branchObj.longitude),
              }}
              title={branchObj.name} // Add title to the marker
              icon={{
                url: mapIconOffice,

                scaledSize: new window.google.maps.Size(40, 40),
                rotation: rotation,
              }}
              onClick={() => setSelectedMarker(branchObj)}
            />
            <Marker
              position={{
                lat: parseFloat(locationObj.latitude),
                lng: parseFloat(locationObj.longitude),
              }}
              title={locationObj.location}
              icon={{
                url: mapIconEmployee,
                scaledSize: new window.google.maps.Size(40, 40),
                rotation: rotation, // You can adjust this if needed
              }}
              onClick={() => setSelectedMarker(locationObj)}
            />
          </>

          {/* InfoWindow to display label */}
          {selectedMarker && (
            <InfoWindow
              position={{
                lat: parseFloat(selectedMarker.latitude),
                lng: parseFloat(selectedMarker.longitude),
              }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                {selectedMarker.name ? (
                  <> {selectedMarker.name}</>
                ) : (
                  <>{selectedMarker.location}</>
                )}
              </div>
            </InfoWindow>
          )}
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
            path={paths}
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
                top: 55,
                left: 90,
                transform: "translateX(-50%)",
                backgroundColor: "white",
                padding: 5,
                borderRadius: 5,
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
              }}
            >
              <b>{distance}</b> Km Diff.
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
};

export default DistanceCalculaterInMap;
