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

  const locations = [
    {
      lat: parseFloat(branchObj.latitude),
      lng: parseFloat(branchObj.longitude),
      name: branchObj.label,
    },
    {
      ...(locationType === "in"
        ? {
            lat: parseFloat(locationData.first_check_in_latitude),
            lng: parseFloat(locationData.first_check_in_longitude),
            name: locationData.first_check_in_location,
          }
        : {
            lat: parseFloat(locationData.last_check_out_latitude),
            lng: parseFloat(locationData.last_check_out_longitude),
            name: locationData.last_check_out_location,
          }),
    },
  ];

  // const allLocations = [
  //   {
  //     lat: parseFloat(branchObj.latitude),
  //     lng: parseFloat(branchObj.longitude),
  //     name: branchObj.label,
  //   },
  //   ...locationData.entry_log.map(entry => ({
  //     lat: parseFloat(entry.latitude),
  //     lng: parseFloat(entry.longitude),
  //     name:entry.location
  //     // You might want to add a name property here as well, if applicable
  //   }))
  // ];
  // console.log("LOcat",allLocations);

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

          {/* Markers for the two points */}
          {locations.map((location, index) => {
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
