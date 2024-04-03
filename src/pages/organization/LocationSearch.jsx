import {
  Circle,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  Col,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
  FormFeedback,
  Row,
} from "reactstrap";
import { map_radius_options } from "../../common/constant/Constants";
import Select from "react-select";

function LocationSearch({
  branchLocationObj,
  setBranchLocationObj,
  LocationFormikForm,
}) {
  const [mapZoom, setMapZoom] = useState(21);

  const [mapCenter, setMapCenter] = useState({
    lat: 8.3865046,
    lng: 77.608336,
  });

  useEffect(() => {
    if (!!branchLocationObj?.latitude && !!branchLocationObj?.longitude) {
      setTimeout(() => {
        setMapCenter({
          lat: parseFloat(branchLocationObj?.latitude),
          lng: parseFloat(branchLocationObj?.longitude),
        });
      }, 250);
    }
    if (!!branchLocationObj?.radius_range) {
      setMapCircleOptions({
        ...mapCircleOptions,
        radius: branchLocationObj?.radius_range,
      });
      setMapZoom(
        map_radius_options.find(
          (d) => d.value === branchLocationObj?.radius_range
        ).zoom
      );
    }
  }, [
    branchLocationObj?.radius_range,
    branchLocationObj?.latitude,
    branchLocationObj?.longitude,
  ]);

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

  const [predictions, setPredictions] = useState([]);
  const autocompleteRef = useRef(null);

  const containerStyle = {
    width: "100%",
    height: "400px",
  };

  const handleLocationChange = (e) => {
    const { value } = e.target;

    setBranchLocationObj({
      ...branchLocationObj,
      accurate_address: value,
    });

    if (value.trim().length) {
      const autocomplete = new window.google.maps.places.AutocompleteService();

      if (autocomplete) {
        autocomplete.getPlacePredictions(
          { input: value },
          (predictions, status) => {
            if (status === "OK") {
              setPredictions(predictions);
            } else {
              setPredictions([]);
            }
          }
        );
      } else {
        setPredictions([]);
      }
    }
  };

  const handleSelectPrediction = (placeId) => {
    const placesService = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    placesService.getDetails({ placeId }, (place, status) => {
      if (status === "OK") {
        let city;
        let country;
        let state;
        let pincode;

        {
          place?.address_components.forEach((component) => {
            if (component.types.includes("country")) {
              country = component.long_name;
            } else if (
              component.types.includes("administrative_area_level_1")
            ) {
              state = component.long_name;
            } else if (component.types.includes("locality")) {
              city = component.long_name;
            } else if (component.types.includes("postal_code")) {
              pincode = component.long_name;
            } else {
              return null;
            }
          });
        }
        setBranchLocationObj({
          ...branchLocationObj,
          map_data: place,
          accurate_address: place?.name,
          location_id: place?.place_id,
          latitude: String(place.geometry.location.lat()),
          longitude: String(place.geometry.location.lng()),
          address: place?.formatted_address,
          country: country,
          state: state,
          city: city,
          pincode: pincode,
        });
      }
    });

    // Clear predictions and input
    setPredictions([]);
    setBranchLocationObj({
      ...branchLocationObj,
      accurate_address: "",
    });
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(mapCenter);
    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onLoadMarker = (marker) => {};

  const onMarkerDrag = (e) => {
    setBranchLocationObj({
      ...branchLocationObj,
      latitude: String(e.latLng.lat()),
      longitude: String(e.latLng.lng()),
    });
  };

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onLoadCircle = (circle) => {};

  const onUnmountCircle = (circle) => {};

  return isLoaded ? (
    <React.Fragment>
      <Row className="mt-3 mb-1">
        <Col lg={9}>
          <div>
            <Label htmlFor="branchLocation" className="form-label">
              Accurate Address
            </Label>
            <div className="form-icon right">
              <Input
                type="text"
                className="form-control form-control-icon"
                id="branchLocation"
                placeholder="Search an address"
                onChange={handleLocationChange}
                value={branchLocationObj?.accurate_address || ""}
                ref={autocompleteRef}
                autoComplete={false}
                invalid={
                  LocationFormikForm.touched.accurate_address &&
                  LocationFormikForm.errors.accurate_address
                    ? true
                    : false
                }
              />
              {!LocationFormikForm.touched.accurate_address &&
                !LocationFormikForm.errors.accurate_address && (
                  <i className="ri-map-pin-line"></i>
                )}
              {LocationFormikForm.touched.accurate_address &&
              LocationFormikForm.errors.accurate_address ? (
                <FormFeedback type="invalid">
                  {LocationFormikForm.errors.accurate_address}
                </FormFeedback>
              ) : null}
            </div>
            {predictions.length > 0 && (
              <ListGroup>
                {predictions.map((prediction) => (
                  <ListGroupItem
                    tag="button"
                    key={prediction.place_id}
                    onClick={() => handleSelectPrediction(prediction.place_id)}
                    className="list-group-item-action"
                  >
                    <i className="ri-map-pin-user-line align-middle me-2"></i>
                    {/* <i className="mdi mdi-map-marker-right align-middle me-2"></i> */}
                    {prediction.description}
                  </ListGroupItem>
                ))}
              </ListGroup>
            )}
          </div>
        </Col>
        <Col lg={3} className="ps-0 pe-0">
          <div>
            <Label htmlFor="map_radius" className="form-label">
              Radius
            </Label>

            <Select
              id="map_radius"
              name="map_radius"
              options={map_radius_options || []}
              className="basic-multi-select"
              value={
                branchLocationObj?.radius_range
                  ? map_radius_options.find(
                      (d) =>
                        parseInt(d.value) ===
                        parseInt(branchLocationObj?.radius_range)
                    )
                  : []
              }
              onChange={(e) => {
                setBranchLocationObj({
                  ...branchLocationObj,
                  radius_range: e.value,
                });
              }}
            />
          </div>
        </Col>
      </Row>
      <Col lg={12}>
        {" "}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={mapZoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          <Marker
            onLoad={onLoadMarker}
            onDragEnd={onMarkerDrag}
            position={mapCenter}
            draggable={true}
          />
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
          {/* Child components, such as markers, info windows, etc. */}
          <></>
        </GoogleMap>
      </Col>
    </React.Fragment>
  ) : (
    <></>
  );
}

export default LocationSearch;
