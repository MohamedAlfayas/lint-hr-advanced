import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Circle,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import {
  Col,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
  FormFeedback,
  Row,
} from "reactstrap";
import Select from "react-select";
import { map_radius_options } from "../../common/constant/Constants";

function LocationSearch({ branchLocationObj, setBranchLocationObj, LocationFormikForm }) {
  const [mapZoom, setMapZoom] = useState(21);
  const [mapCenter, setMapCenter] = useState({
    lat: 8.3865046,
    lng: 77.608336,
  });
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
  const [map, setMap] = useState(null);

  const containerStyle = {
    width: "100%",
    height: "400px",
  };

  // ✅ Use consistent loader ID and libraries
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
    libraries: ["places"],
  });

  // ✅ Handle location data updates
  useEffect(() => {
    if (branchLocationObj?.latitude && branchLocationObj?.longitude) {
      const lat = parseFloat(branchLocationObj.latitude);
      const lng = parseFloat(branchLocationObj.longitude);
      setTimeout(() => {
        setMapCenter({ lat, lng });
      }, 250);
    }

    if (branchLocationObj?.radius_range) {
      setMapCircleOptions((prev) => ({
        ...prev,
        radius: branchLocationObj.radius_range,
      }));

      const radiusData = map_radius_options.find(
        (d) => d.value === branchLocationObj.radius_range
      );
      if (radiusData) {
        setTimeout(() => setMapZoom(radiusData.zoom), 250);
      }
    }
  }, [
    branchLocationObj?.radius_range,
    branchLocationObj?.latitude,
    branchLocationObj?.longitude,
  ]);

  // ✅ Autocomplete search
  const handleLocationChange = (e) => {
    const { value } = e.target;

    setBranchLocationObj({
      ...branchLocationObj,
      accurate_address: value,
    });

    if (value.trim().length) {
      const autocomplete = new window.google.maps.places.AutocompleteService();
      autocomplete.getPlacePredictions({ input: value }, (preds, status) => {
        if (status === "OK") setPredictions(preds);
        else setPredictions([]);
      });
    } else {
      setPredictions([]);
    }
  };

  const handleSelectPrediction = (placeId) => {
    const placesService = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    placesService.getDetails({ placeId }, (place, status) => {
      if (status === "OK") {
        let city, country, state, pincode;
        place.address_components.forEach((component) => {
          if (component.types.includes("country")) country = component.long_name;
          else if (component.types.includes("administrative_area_level_1"))
            state = component.long_name;
          else if (component.types.includes("locality")) city = component.long_name;
          else if (component.types.includes("postal_code"))
            pincode = component.long_name;
        });

        setBranchLocationObj({
          ...branchLocationObj,
          map_data: place,
          accurate_address: place.name,
          location_id: place.place_id,
          latitude: String(place.geometry.location.lat()),
          longitude: String(place.geometry.location.lng()),
          address: place.formatted_address,
          country,
          state,
          city,
          pincode,
        });

        setMapCenter({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        setPredictions([]);
      }
    });
  };

  const onLoad = useCallback((mapInstance) => {
    const bounds = new window.google.maps.LatLngBounds(mapCenter);
    mapInstance.fitBounds(bounds);
    setMap(mapInstance);
  }, [mapCenter]);

  const onUnmount = useCallback(() => setMap(null), []);
  const onMarkerDrag = (e) => {
    setBranchLocationObj({
      ...branchLocationObj,
      latitude: String(e.latLng.lat()),
      longitude: String(e.latLng.lng()),
    });
  };

  return isLoaded ? (
    <React.Fragment>
      <Row className="mt-3 mb-1">
        <Col lg={9}>
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
              autoComplete="off"
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
                  {prediction.description}
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col lg={3} className="ps-0 pe-0">
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
                      parseInt(branchLocationObj.radius_range)
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
        </Col>
      </Row>

      <Col lg={12}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={mapZoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          <Marker
            position={mapCenter}
            onDragEnd={onMarkerDrag}
            draggable={true}
          />
          <Circle center={mapCenter} options={mapCircleOptions} />
        </GoogleMap>
      </Col>
    </React.Fragment>
  ) : (
    <></>
  );
}

export default React.memo(LocationSearch);
