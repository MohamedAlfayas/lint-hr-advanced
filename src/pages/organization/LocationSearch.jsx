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

function LocationSearch({ branchObj, setBranchObj, FormikForm }) {
  const [mapZoom, setMapZoom] = useState(21);

  const [mapCenter, setMapCenter] = useState({
    lat: 8.3865046,
    lng: 77.608336,
  });

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

  console.log("Branch Obj = ", branchObj);

  const [predictions, setPredictions] = useState([]);
  const autocompleteRef = useRef(null);

  const containerStyle = {
    width: "100%",
    height: "400px",
  };

  const handleLocationChange = (e) => {
    const { value } = e.target;

    setBranchObj({
      ...branchObj,
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
        console.log("Selected Place:", place);
        setBranchObj({
          ...branchObj,
          map_data: place,
          accurate_address: place?.name,
          location_id: place?.place_id,
          latitude: String(place.geometry.location.lat()),
          longitude: String(place.geometry.location.lng()),
        });
      }
    });

    // Clear predictions and input
    setPredictions([]);
    setBranchObj({
      ...branchObj,
      accurate_address: "",
    });
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.DEV_MAP_API_KEY,
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(mapCenter);
    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onLoadMarker = (marker) => {
    console.log("marker: ", marker);
  };

  const onMarkerDrag = (e) => {
    console.log("onMarkerDrag: ", e.latLng.lat());

    setBranchObj({
      ...branchObj,
      latitude: String(e.latLng.lat()),
      longitude: String(e.latLng.lng()),
    });
  };

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onLoadCircle = (circle) => {
    console.log("Circle onLoad circle: ", circle);
  };

  const onUnmountCircle = (circle) => {
    console.log("Circle onUnmount circle: ", circle);
  };

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
                value={branchObj?.accurate_address || ""}
                ref={autocompleteRef}
                autoComplete={false}
                invalid={
                  FormikForm.touched.accurate_address &&
                  FormikForm.errors.accurate_address
                    ? true
                    : false
                }
              />
              {!FormikForm.touched.accurate_address &&
                !FormikForm.errors.accurate_address && (
                  <i className="ri-map-pin-line"></i>
                )}
              {FormikForm.touched.accurate_address &&
              FormikForm.errors.accurate_address ? (
                <FormFeedback type="invalid">
                  {FormikForm.errors.accurate_address}
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
                branchObj?.radius_range
                  ? map_radius_options.find(
                      (d) =>
                        parseInt(d.value) === parseInt(branchObj?.radius_range)
                    )
                  : []
              }
              onChange={(e) => {
                setBranchObj({
                  ...branchObj,
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
