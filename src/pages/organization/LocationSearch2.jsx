import React, { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  StandaloneSearchBox,
} from "@react-google-maps/api";

const LocationSearch2 = () => {
  const [map, setMap] = useState(null);
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);

  const onLoad = (map) => {
    setMap(map);
  };

  const onPlacesChanged = () => {
    console.log(query);
    if (map !== null) {
      const placesService = new window.google.maps.places.PlacesService(map);

      placesService.textSearch({ query }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaces(results);
          // Do something with the places like setting markers on the map, etc.
        } else {
          console.error("Error fetching places:", status);
        }
      });
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <LoadScript
        googleMapsApiKey="AIzaSyCSwfau91w6IEpvHR6BGsnPBfT1PUJ27Vs"
        libraries={["places"]}
      >
        <StandaloneSearchBox onPlacesChanged={onPlacesChanged}>
          <input
            className="mb-3"
            type="text"
            placeholder="Search places..."
            onChange={handleInputChange}
            value={query}
          />
        </StandaloneSearchBox>
        <GoogleMap
          mapContainerStyle={{
            height: "100%",
            width: "100%",
          }}
          center={{
            lat: 0,
            lng: 0,
          }}
          zoom={2}
          onLoad={onLoad}
        >
          {/* You can render markers for places here */}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default LocationSearch2;
