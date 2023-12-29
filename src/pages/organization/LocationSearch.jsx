import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Col, Input, Label } from "reactstrap";

const containerStyle = {
  width: "400px",
  height: "400px",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

function LocationSearch() {
  const [locationText, setLocationText] = useState("");

  const [predictions, setPredictions] = useState([]);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const autocomplete = new window.google.maps.places.AutocompleteService();

    if (locationText && autocomplete) {
      autocomplete.getPlacePredictions(
        { input: locationText },
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
  }, [locationText]);

  const handleSelectPrediction = (placeId) => {
    const placesService = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    placesService.getDetails({ placeId }, (place, status) => {
      if (status === "OK") {
        console.log("Selected Place:", place);
        // You can do something with the selected place, e.g., fetch its coordinates.
      }
    });

    // Clear predictions and input
    setPredictions([]);
    setLocationText("");
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.DEV_MAP_API_KEY,
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <Col lg={12}>
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
            onChange={(e) => setLocationText(e.target.value)}
            value={locationText}
            ref={autocompleteRef}
            autoComplete={false}
          />
          <i className="ri-map-pin-line"></i>
        </div>
        {predictions.length > 0 && (
          <ul>
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                onClick={() => handleSelectPrediction(prediction.place_id)}
              >
                {prediction.description}
              </li>
            ))}
          </ul>
        )}
        <div id="passwordHelpBlock" className="form-text">
          Company Overview.
        </div>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Child components, such as markers, info windows, etc. */}
        <></>
      </GoogleMap>
    </Col>
  ) : (
    <></>
  );
}

export default LocationSearch;
