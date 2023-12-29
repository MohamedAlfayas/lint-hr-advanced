import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import React from "react";
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
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCSwfau91w6IEpvHR6BGsnPBfT1PUJ27Vs",
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
          />
          <i className="ri-map-pin-line"></i>
        </div>
        <div id="passwordHelpBlock" className="form-text">
          Company Overview.
        </div>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
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
