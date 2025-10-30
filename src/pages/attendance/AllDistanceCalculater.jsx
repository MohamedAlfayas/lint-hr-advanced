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

  const employeeBracnchID = employeeData.find(
    (d) => allLocationData.employee_id === d.id
  );
  // console.log("employeeBracnchID", employeeBracnchID);
  // console.log("allLocationData", allLocationData);
  
  

  const branchObj = branchData.find((b) =>
    employeeBracnchID.branch_id_list.includes(b.id)
  );
  console.log("branchObj", branchObj);
  

  const [mapZoom, setMapZoom] = useState(21);

  const [mapCenter, setMapCenter] = useState({
    lat: 8.3865046,
    lng: 77.608336,
  });

  const branchLocations = [];

  if (!!branchObj) {
    branchObj.location_details.forEach((d) => {
      branchLocations.push({
        lat: parseFloat(d.latitude),
        lng: parseFloat(d.longitude),
        radius: d.radius_range,
        name: d.name,
        type: 0,
      });
    });
  }

  const allLocations = [
    ...allLocationData.entry_log
      .map((entry) =>
        entry.location_id !== null
          ? {
              lat: parseFloat(entry.latitude),
              lng: parseFloat(entry.longitude),
              name: entry.location,
              type: entry.entry_type,
            }
          : null
      )
      .filter((location) => location !== null),
  ];

  const multipleLocations = branchLocations.concat(allLocations);

  useEffect(() => {
    if (allLocations.length === 1) {
      setTimeout(() => {
        setMapZoom(17);
      }, 250);
    }
  }, []);

  useEffect(() => {
    if (!!branchObj) {
      if (!!branchObj?.latitude && !!branchObj?.longitude) {
        branchObj;
        setMapCenter({
          lat: parseFloat(branchObj?.latitude),
          lng: parseFloat(branchObj?.longitude),
        });
      }
    }
  }, [branchObj?.radius_range, branchObj?.latitude, branchObj?.longitude]);

  const [mapCircleOptions, setMapCircleOptions] = useState({
    strokeColor: "#008000",
    strokeOpacity: 0.3,
    strokeWeight: 2,
    fillColor: "#008000",
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

  const mapStyles = [
    {
      featureType: "administrative.locality",
      elementType: "geometry.fill",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.business",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.place_of_worship",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.school",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
  ];

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
  });

  const [map, setMap] = React.useState(null);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onLoadCircle = (circle) => {};

  const onUnmountCircle = (circle) => {};

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

  useEffect(() => {
    if (mapRefCenter.current) {
      const bounds = new window.google.maps.LatLngBounds();
      multipleLocations.forEach((location) => {
        bounds.extend(
          new window.google.maps.LatLng(location.lat, location.lng)
        );
      });

      mapRefCenter.current.fitBounds(bounds);
    }
  }, []);

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedMarkerBranch, setSelectedMarkerBranch] = useState(null);

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
          options={{ gestureHandling: "greedy", styles: mapStyles }}
        >
          {/* Markers for the two points */}
          {allLocations.map((location, index) => {
            const nextLocation =
              allLocations[index === allLocations.length - 1 ? 0 : index + 1];

            const rotation = calculateHeading(location, nextLocation);

            return (
              <Marker
                key={index}
                position={location}
                title={location.name}
                icon={{
                  url: location.type === 1 ? mapCheckIn : mapCheckOut,
                  scaledSize: new window.google.maps.Size(45, 45),
                  rotation: rotation,
                }}
                onClick={() => {
                  setSelectedMarker(location);
                  setMapZoom(21);
                  setMapCenter({
                    lat: location.lat,
                    lng: location.lng,
                  });
                }}
              />
            );
          })}
          {branchLocations.map((location, index) => (
            <Marker
              key={index}
              position={location}
              title={location.name} // Add title to the marker
              icon={{
                url: mapIconOffice,
                scaledSize: new window.google.maps.Size(40, 40),
              }}
              onClick={() => {
                setSelectedMarkerBranch(location);
                setMapZoom(21);
                setMapCenter({
                  lat: location.lat,
                  lng: location.lng,
                });
              }}
            />
          ))}

          {/* InfoWindow to display label */}
          {selectedMarkerBranch && (
            <InfoWindow
              position={selectedMarkerBranch}
              onCloseClick={() => {
                setSelectedMarkerBranch(null);
              }}
            >
              <div>{selectedMarkerBranch.name}</div>
            </InfoWindow>
          )}

          {selectedMarker && (
            <InfoWindow
              position={selectedMarker}
              onCloseClick={() => {
                setSelectedMarker(null);
                const bounds = new window.google.maps.LatLngBounds();

                allLocations.forEach((location) => {
                  bounds.extend(
                    new window.google.maps.LatLng(location.lat, location.lng)
                  );
                });
                setMapZoom(mapRef.current.zoom);

                mapRef.current.fitBounds(bounds);
              }}
            >
              <div>{selectedMarker.name}</div>
            </InfoWindow>
          )}

          {branchLocations.map((d) => {
            return (
              <Circle
                // optional
                onLoad={onLoadCircle}
                // optional
                onUnmount={onUnmountCircle}
                // required
                center={{
                  ...mapCircleOptions,
                  lat: d.lat,
                  lng: d.lng,
                }}
                // required
                options={{
                  ...mapCircleOptions,
                  radius: d.radius,
                }}
              />
            );
          })}
          {/* Polyline to connect the two points */}
          <Polyline
            path={allLocations}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 1.0,
              strokeWeight: 2,
              geodesic: true,
              icons: [
                {
                  icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                  offset: "100%",
                },
              ],
            }}
            // options={{
            //   strokeColor: "#FF0000",
            //   strokeOpacity: 0,

            //   icons: [
            //     {
            //       icon: {
            //         path: "M 0,-1 0,1",
            //         strokeOpacity: 1,
            //         scale: 3,
            //       },
            //       offset: "0",
            //       repeat: "20px", // Adjust the spacing between dots here
            //     },
            //   ],
            // }}
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

export default AllDistanceCalculater;
