import React, { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { MapShell, MapSkeleton } from "../../common/skeleton/Skeleton";
import { useMapThemeStyles } from "../../../shared/theme/mapStyles";
import "../../../pages/payroll/SalaryPoliciesModal.css";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import {
  FormAutocomplete,
  FormCheckbox,
  FormSection,
  FormSwitch,
  FormTextField,
} from "../../../shared/ui/form";

const containerStyle = {
  width: "100%",
  height: "450px",
};

const center = {
  lat: 30.3165,
  lng: 78.0322,
};

const defaultValues = {
  web_app_manual: false,
  mobile_app_manual: false,
  mobile_app_qr: false,
  geofencing: false,
  allow_outside_office: false,
  address: "Lint HQ",
  radius: null,
};

const LocationEditForm = () => {
  const [map, setMap] = useState(null);
  const mapStyles = useMapThemeStyles();

  const { control, handleSubmit } = useForm({
    mode: "onTouched",
    defaultValues,
  });

  const address = useWatch({ control, name: "address" });

  // Google Maps API Configuration
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your API key
  });
  const [tilesReady, setTilesReady] = useState(false);

  const onLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const onUnmount = () => {
    setMap(null);
  };

  const handleShowOnMap = () => {
    // Use the Google Maps Geocoding API to convert the address to coordinates
    if (map) {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          map.panTo(location);
          new window.google.maps.Marker({
            position: location,
            map: map,
            title: address,
          });
        } else {
          console.error(
            "Geocode was not successful for the following reason:",
            status,
          );
        }
      });
    }
  };

  const radius_option = useMemo(
    () => [
      { id: "1", label: "10(meters)", value: "10(meters)" },
      { id: "2", label: "25(meters)", value: "25(meters)" },
      { id: "3", label: "50(meters)", value: "50(meters)" },
      { id: "4", label: "100(meters)", value: "100(meters)" },
      { id: "5", label: "200(meters)", value: "200(meters)" },
      { id: "6", label: "500(meters)", value: "500(meters)" },
    ],
    [],
  );

  const onSubmit = () => {};

  return (
    <SidebarFormLayout onSubmit={handleSubmit(onSubmit)} hideSubmit>
      <FormSection title="Allow clocking in/out on">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: "100%" }}>
              <Typography variant="body2" fontWeight={600}>
                Web App
              </Typography>
              <FormCheckbox
                name="web_app_manual"
                control={control}
                label="Using Manual Button"
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: "100%" }}>
              <Typography variant="body2" fontWeight={600}>
                Mobile App
              </Typography>
              <Stack>
                <FormCheckbox
                  name="mobile_app_manual"
                  control={control}
                  label="Using Manual Button"
                />
                <FormCheckbox
                  name="mobile_app_qr"
                  control={control}
                  label="Using QR Code"
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </FormSection>

      <FormSection title="Geofencing">
        <FormSwitch
          name="geofencing"
          control={control}
          label="Geofencing"
          description="Restrict clock in/out to a radius around the address"
        />
        <FormSwitch
          name="allow_outside_office"
          control={control}
          label="Allow clock in/out outside the office"
          description="Employees can still clock in/out when outside the radius"
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <FormTextField
              name="address"
              control={control}
              label="Accurate address"
              required
              fullWidth
              helperText="Select Accurate Address."
              startIcon={<PlaceOutlinedIcon fontSize="small" color="action" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormAutocomplete
              name="radius"
              control={control}
              label="Radius"
              placeholder="Select radius"
              options={radius_option}
              required
              helperText="Select Radius."
            />
          </Grid>
        </Grid>
        <Box>
          <Button
            data-testid="location-edit-show-on-map-button"
            variant="outlined"
            startIcon={<MapOutlinedIcon />}
            onClick={handleShowOnMap}
          >
            Show on Map
          </Button>
        </Box>
      </FormSection>

      <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", border: 1, borderColor: "divider" }}>
        {isLoaded ? (
          <MapShell ready={tilesReady} style={{ height: containerStyle.height }}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={15}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onTilesLoaded={() => setTilesReady(true)}
              options={{ styles: mapStyles }}
            />
          </MapShell>
        ) : (
          <MapSkeleton style={{ height: containerStyle.height }} />
        )}
      </Box>
    </SidebarFormLayout>
  );
};

export default LocationEditForm;
