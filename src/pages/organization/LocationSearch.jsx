import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapSkeleton, Skel } from "../../component/common/skeleton/Skeleton";
import {
  Circle,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useMapThemeStyles } from "../../shared/theme/mapStyles";
import { Input, Label, FormFeedback } from "reactstrap";
import Select from "../../shared/ui/TestableSelect";
import { map_radius_options } from "../../common/constant/Constants";
import { testId } from "../../shared/testing/testId";
import "./LocationSearch.scss";

// Static reference — must be defined outside component to avoid
// useJsApiLoader reloading the script on every render (which was
// silently killing AutocompleteService and breaking suggestions)
const GOOGLE_MAPS_LIBRARIES = ["places"];

const ADDRESS_CHARS = /[^A-Za-z0-9\s.,\-#/']/g;
const PIN_COLOR = "#0ab39c";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const readAddressParts = (components = []) => {
  let city, country, state, pincode;
  components.forEach((component) => {
    if (component.types.includes("country")) country = component.long_name;
    else if (component.types.includes("administrative_area_level_1"))
      state = component.long_name;
    else if (component.types.includes("locality")) city = component.long_name;
    else if (component.types.includes("postal_code"))
      pincode = component.long_name;
  });
  return { city, country, state, pincode };
};

function LocationSearch({ locationObj, setLocationObj, LocationFormikForm }) {
  const [mapZoom, setMapZoom] = useState(21);
  const mapStyles = useMapThemeStyles();
  const [mapCenter, setMapCenter] = useState({
    lat: 8.3865046,
    lng: 77.608336,
  });
  const [mapCircleOptions, setMapCircleOptions] = useState({
    strokeColor: PIN_COLOR,
    strokeOpacity: 0.9,
    strokeWeight: 2,
    fillColor: PIN_COLOR,
    fillOpacity: 0.14,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 10,
    zIndex: 1,
  });
  const [predictions, setPredictions] = useState([]);
  const [activePrediction, setActivePrediction] = useState(-1);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mapType, setMapType] = useState("roadmap");
  const [locating, setLocating] = useState(false);
  const autocompleteRef = useRef(null);
  const [map, setMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  const [tilesReady, setTilesReady] = useState(false);
  // Stop the tile skeleton even if tiles never finish (bad key / offline).
  useEffect(() => {
    const id = setTimeout(() => setTilesReady(true), 8000);
    return () => clearTimeout(id);
  }, []);

  const mapOptions = useMemo(
    () => ({
      styles: mapStyles,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      clickableIcons: false,
      tilt: 0,
    }),
    [mapStyles],
  );

  // âœ… Handle location data updates
  useEffect(() => {
    if (locationObj?.latitude && locationObj?.longitude) {
      const lat = parseFloat(locationObj.latitude);
      const lng = parseFloat(locationObj.longitude);
      setTimeout(() => {
        setMapCenter({ lat, lng });
      }, 250);
    }

    if (locationObj?.radius_range) {
      setMapCircleOptions((prev) => ({
        ...prev,
        radius: locationObj.radius_range,
      }));

      const radiusData = map_radius_options.find(
        (d) => d.value === locationObj.radius_range,
      );
      if (radiusData) {
        setTimeout(() => setMapZoom(radiusData.zoom), 250);
      }
    }
  }, [
    locationObj?.radius_range,
    locationObj?.latitude,
    locationObj?.longitude,
  ]);

  // âœ… Autocomplete search
  const handleLocationChange = (e) => {
    let value = e.target.value.replace(ADDRESS_CHARS, "");

    setLocationObj({
      ...locationObj,
      accurate_address: value,
    });

    LocationFormikForm.setFieldValue("accurate_address", value);
    LocationFormikForm.setFieldTouched("accurate_address", true, false);

    if (value.length > 200) {
      LocationFormikForm.setFieldError(
        "accurate_address",
        "Accurate Address cannot exceed 200 characters",
      );
    } else {
      LocationFormikForm.setFieldError("accurate_address", undefined);
    }

    setActivePrediction(-1);
    if (value.trim().length && isLoaded && window.google?.maps?.places) {
      const autocomplete = new window.google.maps.places.AutocompleteService();
      autocomplete.getPlacePredictions({ input: value }, (preds, status) => {
        if (status === "OK") {
          setPredictions(preds);
        } else {
          console.warn("Places prediction failed:", status);
          setPredictions([]);
        }
      });
    } else {
      setPredictions([]);
    }
  };

  const applyPlace = (place, accurateAddress) => {
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setLocationObj({
      ...locationObj,
      map_data: place,
      accurate_address: accurateAddress,
      location_id: place.place_id,
      latitude: String(lat),
      longitude: String(lng),
      address: place.formatted_address,
      ...readAddressParts(place.address_components),
    });

    setMapCenter({ lat, lng });
    map?.panTo({ lat, lng });
    setPredictions([]);
    setActivePrediction(-1);
  };

  const selectPrediction = (placeId) => {
    const placesService = new window.google.maps.places.PlacesService(
      document.createElement("div"),
    );

    placesService.getDetails({ placeId }, (place, status) => {
      if (status === "OK") {
        applyPlace(place, place.name);
      } else {
        console.warn("Place details failed:", status);
      }
    });
  };

  const handleSearchKeyDown = (e) => {
    if (!predictions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivePrediction((i) => (i + 1) % predictions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivePrediction((i) => (i <= 0 ? predictions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activePrediction >= 0) {
      e.preventDefault();
      selectPrediction(predictions[activePrediction].place_id);
    } else if (e.key === "Escape") {
      setPredictions([]);
    }
  };

  const clearSearch = () => {
    handleLocationChange({ target: { value: "" } });
    autocompleteRef.current?.focus();
  };

  const movePin = (latLng) => {
    setLocationObj({
      ...locationObj,
      latitude: String(latLng.lat()),
      longitude: String(latLng.lng()),
    });
  };

  const locateMe = () => {
    if (!navigator.geolocation || !window.google?.maps) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude };
        new window.google.maps.Geocoder().geocode(
          { location: position },
          (results, status) => {
            setLocating(false);
            if (status === "OK" && results?.[0]) {
              const result = results[0];
              const shortName = result.formatted_address
                .split(",")[0]
                .replace(ADDRESS_CHARS, "")
                .trim();
              applyPlace(result, shortName);
            } else {
              setLocationObj({
                ...locationObj,
                latitude: String(position.lat),
                longitude: String(position.lng),
              });
              map?.panTo(position);
            }
          },
        );
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const recenter = () => {
    if (!map) return;
    map.panTo(mapCenter);
    const radiusData = map_radius_options.find(
      (d) => d.value === Number(locationObj?.radius_range),
    );
    map.setZoom(radiusData?.zoom || 18);
  };

  const switchMapType = (type) => {
    setMapType(type);
    map?.setMapTypeId(type);
  };

  const onLoad = useCallback(
    (mapInstance) => {
      const bounds = new window.google.maps.LatLngBounds(mapCenter);
      mapInstance.fitBounds(bounds);
      setMap(mapInstance);
    },
    [mapCenter],
  );

  const onUnmount = useCallback(() => setMap(null), []);

  const addressError = LocationFormikForm.errors.accurate_address;
  const showPredictions = searchFocused && predictions.length > 0;
  const hasPin = !!(locationObj?.latitude && locationObj?.longitude);
  const radiusValue = Number(locationObj?.radius_range) || mapCircleOptions.radius;

  return isLoaded ? (
    <div className="lsx">
      <div className="lsx-fields">
        <div className="lsx-field lsx-field-search">
          <Label htmlFor="branchLocation" className="form-label">
            Accurate Address
          </Label>
          <div
            className={`lsx-search${addressError ? " is-invalid" : ""}${
              showPredictions ? " is-open" : ""
            }`}
          >
            <i className="ri-search-2-line lsx-search-icon"></i>
            <Input
              data-testid="location-search-branch-location-input"
              type="text"
              className="form-control"
              id="branchLocation"
              placeholder="Search a place, building or street"
              onChange={handleLocationChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              value={locationObj?.accurate_address || ""}
              innerRef={autocompleteRef}
              autoComplete="off"
              invalid={!!addressError}
            />
            {locationObj?.accurate_address ? (
              <button
                data-testid="location-search-clear-button"
                type="button"
                className="lsx-search-clear"
                aria-label="Clear address"
                onMouseDown={(e) => e.preventDefault()}
                onClick={clearSearch}
              >
                <i className="ri-close-line"></i>
              </button>
            ) : null}

            {showPredictions && (
              <ul className="lsx-suggest" role="listbox">
                {predictions.map((prediction, index) => (
                  <li key={prediction.place_id} role="none">
                    <button
                      data-testid={testId(
                        "location-search-prediction",
                        prediction.place_id,
                        "button",
                      )}
                      type="button"
                      role="option"
                      aria-selected={index === activePrediction}
                      className={`lsx-suggest-item${
                        index === activePrediction ? " is-active" : ""
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActivePrediction(index)}
                      onClick={() => selectPrediction(prediction.place_id)}
                    >
                      <span className="lsx-suggest-icon">
                        <i className="ri-map-pin-2-line"></i>
                      </span>
                      <span className="lsx-suggest-text">
                        <b>
                          {prediction.structured_formatting?.main_text ||
                            prediction.description}
                        </b>
                        {prediction.structured_formatting?.secondary_text ? (
                          <small>
                            {prediction.structured_formatting.secondary_text}
                          </small>
                        ) : null}
                      </span>
                      <i className="ri-arrow-right-up-line lsx-suggest-go"></i>
                    </button>
                  </li>
                ))}
                <li className="lsx-suggest-foot" role="none">
                  <i className="ri-google-fill"></i> Powered by Google
                </li>
              </ul>
            )}
          </div>
          {addressError ? (
            <FormFeedback
              data-testid="location-search-branch-location-error"
              type="invalid"
              className="d-block"
            >
              {addressError}
            </FormFeedback>
          ) : null}
        </div>

        <div className="lsx-field lsx-field-radius">
          <Label htmlFor="map_radius" className="form-label">
            Radius
          </Label>
          <Select
            testId="location-search-map-radius"
            id="map_radius"
            name="map_radius"
            options={map_radius_options || []}
            className="basic-multi-select"
            classNamePrefix="lsx-rs"
            isSearchable={false}
            value={
              locationObj?.radius_range
                ? map_radius_options.find(
                    (d) =>
                      parseInt(d.value) === parseInt(locationObj.radius_range),
                  )
                : []
            }
            onChange={(e) => {
              setLocationObj({
                ...locationObj,
                radius_range: e.value,
              });
            }}
          />
        </div>
      </div>

      <div className="lsx-map">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={mapZoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={(e) => e.latLng && movePin(e.latLng)}
          onTilesLoaded={() => setTilesReady(true)}
          options={mapOptions}
        >
          <Marker
            position={mapCenter}
            onDragEnd={(e) => movePin(e.latLng)}
            draggable={true}
          />
          <Circle center={mapCenter} options={mapCircleOptions} />
        </GoogleMap>
        {!tilesReady && <MapSkeleton overlay testId="location-search-map-loading-skeleton" />}

        <div className="lsx-maptype">
          <button
            data-testid="location-search-map-view-button"
            type="button"
            className={mapType === "roadmap" ? "active" : ""}
            onClick={() => switchMapType("roadmap")}
          >
            <i className="ri-map-2-line"></i>
            Map
          </button>
          <button
            data-testid="location-search-satellite-view-button"
            type="button"
            className={mapType === "hybrid" ? "active" : ""}
            onClick={() => switchMapType("hybrid")}
          >
            <i className="ri-earth-line"></i>
            Satellite
          </button>
        </div>

        <div className="lsx-tools">
          <button
            data-testid="location-search-current-location-button"
            type="button"
            className="lsx-tool"
            title="Use my current location"
            onClick={locateMe}
            disabled={locating}
          >
            <i
              className={
                locating ? "ri-loader-4-line lsx-spin" : "ri-focus-3-line"
              }
            ></i>
          </button>
          <button
            data-testid="location-search-recenter-button"
            type="button"
            className="lsx-tool"
            title="Re-center on pin"
            onClick={recenter}
          >
            <i className="ri-gps-line"></i>
          </button>
        </div>

        <div className="lsx-info">
          <span className="lsx-chip is-radius">
            <i className="ri-radar-line"></i>
            {radiusValue} m radius
          </span>
          {hasPin ? (
            <span className="lsx-chip">
              <i className="ri-map-pin-2-fill"></i>
              {Number(locationObj.latitude).toFixed(5)},{" "}
              {Number(locationObj.longitude).toFixed(5)}
            </span>
          ) : null}
        </div>

        <div className="lsx-hint">
          <i className="ri-drag-move-2-line"></i>
          Drag the pin or tap the map to fine-tune
        </div>
      </div>
    </div>
  ) : (
    <div className="lsx">
      <Skel h={46} style={{ marginBottom: 12 }} />
      <MapSkeleton style={{ height: 320, borderRadius: 12 }} testId="location-search-map-loading-skeleton" />
    </div>
  );
}

export default React.memo(LocationSearch);
