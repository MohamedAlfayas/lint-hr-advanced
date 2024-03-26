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
const mapCheckIn = require("../../assets/images/icons/checkin.png");
const mapCheckOut = require("../../assets/images/icons/checkout.png");

const AllDistanceCalculater = ({ allLocationData }) => {
  const employeeData = GetLocalStorageData("employee") || [];
  const branchData = GetLocalStorageData("branch") || [];

  console.log("alllocationData", allLocationData);

  const employeeBracnchID = employeeData.find(
    (d) => allLocationData.employee_id === d.id
  );

  const branchObj = branchData.find((b) =>
    employeeBracnchID.branch_id_list.includes(b.id)
  );

  const [mapZoom, setMapZoom] = useState(21);

  const [mapCenter, setMapCenter] = useState({
    lat: 8.3865046,
    lng: 77.608336,
  });

  const branchLocation = [
    {
      lat: parseFloat(branchObj.latitude),
      lng: parseFloat(branchObj.longitude),
      name: branchObj.label,
    },
  ];

  const allLocations = [
    {
      lat: parseFloat(branchObj.latitude),
      lng: parseFloat(branchObj.longitude),
      name: branchObj.label,
    },
    ...allLocationData.entry_log
      .map((entry) =>
        entry.location_id !== null
          ? {
              lat: parseFloat(entry.latitude),
              lng: parseFloat(entry.longitude),
              name: entry.location,
            }
          : null
      )
      .filter((location) => location !== null), // Filter out null values if any
  ];
  const checkInOut = allLocationData.entry_log.filter(
    (d) => d.location_id !== null
  );
  console.log("check IN out", checkInOut);

  const checkInOutLocation = [
    checkInOut
      .filter((e) => e.entry_type === 1)
      .map((e) => ({
        lat: parseFloat(e.latitude),
        lng: parseFloat(e.longitude),
        name: e.location,
      })),
    checkInOut
      .filter((e) => e.entry_type === 2)
      .map((e) => ({
        lat: parseFloat(e.latitude),
        lng: parseFloat(e.longitude),
        name: e.location,
      })),
  ];

  console.log("CheckInOutLocation", checkInOutLocation);

  console.log("Location", allLocations);

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

    for (let i = 1; i < allLocations.length; i++) {
      totalDistance += calculateDistance(
        allLocations[i - 1].lat,
        allLocations[i - 1].lng,
        allLocations[i].lat,
        allLocations[i].lng
      );
    }
    setDistance(totalDistance.toFixed(2)); // Set distance state
  }, []);

  useEffect(() => {
    // Fit map bounds based on polyline path
    if (mapRef.current && distance) {
      const bounds = new window.google.maps.LatLngBounds();

      allLocations.forEach((location) => {
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
      allLocations.forEach((location) => {
        bounds.extend(
          new window.google.maps.LatLng(location.lat, location.lng)
        );
      });

      mapRefCenter.current.fitBounds(bounds);
    }
  }, []);

  const [selectedMarker, setSelectedMarker] = useState(null);

  // Function to calculate heading between two points
  const calculateHeading = (pointA, pointB) => {
    const lat1 = (pointA.lat * Math.PI) / 180;
    const lon1 = (pointA.lng * Math.PI) / 180;
    const lat2 = (pointB.lat * Math.PI) / 180;
    const lon2 = (pointB.lng * Math.PI) / 180;

    const dLon = lon2 - lon1;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let brng = Math.atan2(y, x);
    brng = (brng * 180) / Math.PI;

    return brng;
  };

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
          options={{ gestureHandling: "greedy" }}
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

          <Marker
            position={branchLocation}
            title={location.name} // Add title to the marker
            icon={{
              mapIconOffice,

              scaledSize: new window.google.maps.Size(40, 40),
            }}
            onClick={() => setSelectedMarker(branchLocation)}
          />

          {/* Markers for the two points */}
          {allLocations.map((location, index) => {
            console.log("Location for Marker", location);
            const nextLocation =
              allLocations[index === allLocations.length - 1 ? 0 : index + 1];
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
                onClick={() => setSelectedMarker(location)}
              />
            );
          })}
          {/* InfoWindow to display label */}
          {selectedMarker && (
            <InfoWindow
              position={selectedMarker}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>{selectedMarker.name}</div>
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
          {/* <Polyline
            path={allLocations}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 1.0,
              strokeWeight: 2,
            }}
          /> */}
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

export default AllDistanceCalculater;
