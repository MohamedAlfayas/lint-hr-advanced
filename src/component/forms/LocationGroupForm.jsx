import React, { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseIcon from "@mui/icons-material/Close";
import EditLocationAltOutlinedIcon from "@mui/icons-material/EditLocationAltOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import MarkunreadMailboxOutlinedIcon from "@mui/icons-material/MarkunreadMailboxOutlined";
import { PostApi } from "../../common/api/PostApi";
import { PutApi } from "../../common/api/PutApi";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  addLocationGroup,
  editLocationGroup,
  setLocationGroup,
} from "../../redux/reducers/ChildReducer/LocationGroupReducer";
import { timzone_options } from "../../common/constant/Constants";
import CountryList, { countriesWithStates } from "../../common/data/CountryList";
import LocationSearch from "../../pages/organization/LocationSearch";
import no_image from "../../assets/images/users/no_img.jpg";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import SidebarFormLayout from "../../shared/ui/SidebarFormLayout";
import {
  FormAutocomplete,
  FormSection,
  FormTextField,
} from "../../shared/ui/form";
import useLocationSearchBridge from "./Common/useLocationSearchBridge";
import { testId, itemTestKey } from "../../shared/testing/testId";
import "./LocationGroupForm.scss";

const LOCATION_FORM_ID = "location-group-location-form";

const LocationStep = ({ step, title, caption }) => (
  <div className="lgx-step">
    <span className="lgx-step-num">{step}</span>
    <span className="lgx-step-text">
      <b>{title}</b>
      <small>{caption}</small>
    </span>
  </div>
);

const NAME_MAX = 100;
const DESCRIPTION_MAX = 200;
const ADDRESS_MAX = 200;
const CITY_MAX = 100;
const ACCURATE_ADDRESS_MAX = 200;

const NAME_CHARS = /[^A-Za-z0-9\s.,&()'-]/g;
const DESCRIPTION_CHARS = /[^A-Za-z0-9\s.,!?'"\-_()&:;/]/g;
const ADDRESS_CHARS = /[^A-Za-z0-9\s.,\-#/'&]/g;
const CITY_CHARS = /[^A-Za-z\s.'-]/g;

const initialLocationObj = {
  type_id: 0,
  type: "location_group",
  id: 0,
  address: "",
  city: "",
  pincode: "",
  country: "",
  state: "",
  timezone: "Asia/Kolkata",
  accurate_address: "",
  radius_range: 10,
  latitude: "8.3865046",
  longitude: "77.608336",
  location_id: "",
  name: "",
  image: null,
  image_url: null,
  map_data: [],
};

const groupSchema = Yup.object({
  name: Yup.string()
    .matches(/^[A-Za-z0-9\s.,&()'-]+$/, {
      message:
        "Location group name can contain only letters, numbers, spaces, ., ,, -, &, (, ) and '",
      excludeEmptyString: true,
    })
    .max(NAME_MAX, "Location group name cannot exceed 100 characters")
    .required("Please enter a location group name")
    .test(
      "not-only-spaces",
      "Please enter a location group name",
      (value) => !value || value.trim().length > 0,
    ),
  description: Yup.string()
    .matches(/^[A-Za-z0-9\s.,!?'"\-_()&:;/]+$/, {
      message: "Description contains invalid characters",
      excludeEmptyString: true,
    })
    .max(DESCRIPTION_MAX, "Description cannot exceed 200 characters"),
});

const locationSchema = Yup.object({
  name: Yup.string()
    .matches(/^[A-Za-z0-9\s.,&()'-]+$/, {
      message:
        "Location name can contain only letters, numbers, spaces, ., ,, -, &, (, ) and '",
      excludeEmptyString: true,
    })
    .max(NAME_MAX, "Location name cannot exceed 100 characters")
    .required("Please Enter Location Name")
    .test(
      "not-only-spaces",
      "Please Enter Location Name",
      (value) => !value || value.trim().length > 0,
    ),
  address: Yup.string()
    .trim()
    .matches(/^[A-Za-z0-9\s.,\-#/'&]+$/, {
      message:
        "Address can contain only letters, numbers, spaces, ., ,, -, #, /, ' and &",
      excludeEmptyString: true,
    })
    .max(ADDRESS_MAX, "Address cannot exceed 200 characters")
    .required("Please Enter Address"),
  country: Yup.string().required("Please Select Country"),
  state: Yup.string().required("Please Select State"),
  city: Yup.string()
    .trim()
    .matches(/^[A-Za-z\s.'-]+$/, {
      message:
        "City can contain only letters, spaces, dots, hyphens and apostrophes",
      excludeEmptyString: true,
    })
    .max(CITY_MAX, "City cannot exceed 100 characters")
    .required("Please Enter City"),
  pincode: Yup.string()
    .trim()
    .required("Please Enter Pincode")
    .matches(/^[0-9]+$/, {
      message: "Pincode should contain only numbers",
      excludeEmptyString: true,
    })
    .length(6, "Please Enter Valid 6 Digit Pincode"),
  timezone: Yup.string().required("Please Select Time Zone"),
  accurate_address: Yup.string()
    .trim()
    .required("Please Enter Accurate Address")
    .max(
      ACCURATE_ADDRESS_MAX,
      "Accurate Address cannot exceed 200 characters",
    ),
});

const optionValue = (o) => o?.value;

const countryOptions = countriesWithStates.map((d) => ({
  ...d,
  label: d.countryName,
  value: d.countryName,
}));

const toGroupValues = (obj) => ({
  name: obj?.name || "",
  description: obj?.description || "",
});

const toLocationValues = (obj) => ({
  ...initialLocationObj,
  ...obj,
  name: obj?.name ?? "",
  address: obj?.address ?? "",
  city: obj?.city ?? "",
  pincode: obj?.pincode != null ? String(obj.pincode) : "",
  country: obj?.country ?? "",
  state: obj?.state ?? "",
  timezone: obj?.timezone ?? "",
  accurate_address: obj?.accurate_address ?? "",
});

const LocationGroupForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const entityLocations = useSelector(
    (state) =>
      state.LocationGroupReducer.location_group_data.find(
        (g) => g.id === form_obj?.id,
      )?.entity_location_details || [],
  );

  const isEdit = parseInt(form_obj?.id) > 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);

  // ─── Main group form ─────────────────────────────────────────────────────────
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(groupSchema),
    mode: "onTouched",
    defaultValues: toGroupValues(form_obj),
  });

  useEffect(() => {
    reset(toGroupValues(form_obj));
  }, [form_obj, reset]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      let Api;
      if (isEdit) {
        Api = await PutApi(`location/location-groups/${form_obj.id}/`, values);
      } else {
        Api = await PostApi("location/location-groups/", values);
      }

      if (!Api) {
        toast.error("No response from server");
        return;
      }

      if ([200, 201].includes(Api.status)) {
        const response = Api.data;
        if (isEdit) {
          dispatch(editLocationGroup(response));
        } else {
          dispatch(addLocationGroup(response));
        }
        toast.success(
          isEdit
            ? "Location group updated successfully."
            : "Location group created successfully.",
        );
        dispatch(toggleRSBView(false));
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail || "Update failed.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          "API error occurred.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Location dialog form ────────────────────────────────────────────────────
  const {
    control: locControl,
    handleSubmit: handleLocSubmit,
    reset: resetLoc,
    setValue: setLocValue,
    setError: setLocError,
    trigger: triggerLoc,
    watch: watchLoc,
  } = useForm({
    resolver: yupResolver(locationSchema),
    mode: "onTouched",
    defaultValues: initialLocationObj,
  });

  const { locationObj, setLocationObj, LocationFormikForm } =
    useLocationSearchBridge({
      control: locControl,
      setValue: setLocValue,
      setError: setLocError,
      trigger: triggerLoc,
    });

  const locCountry = useWatch({ control: locControl, name: "country" });
  const locImageUrl = useWatch({ control: locControl, name: "image_url" });
  const locId = useWatch({ control: locControl, name: "id" });

  const locationStateOptions = useMemo(
    () => CountryList.find((d) => d.countryName === locCountry)?.states || [],
    [locCountry],
  );

  useEffect(() => {
    const sub = watchLoc((_, { name, type }) => {
      if (name === "country" && type === "change") setLocValue("state", "");
    });
    return () => sub.unsubscribe();
  }, [watchLoc, setLocValue]);

  const onLocationSubmit = async (values) => {
    setLocationSaving(true);
    try {
      const map_data_keys = [
        "address_components",
        "formatted_address",
        "geometry",
        "name",
        "place_id",
        "url",
        "utc_offset",
        "utc_offset_minutes",
        "vicinity",
      ];

      let map_data = [];
      if (
        typeof values.map_data === "object" &&
        values.map_data !== null &&
        !Array.isArray(values.map_data)
      ) {
        map_data = {};
        for (const key of map_data_keys) {
          if (Object.prototype.hasOwnProperty.call(values.map_data, key)) {
            map_data[key] = values.map_data[key];
          }
        }
      }

      const isNewLocation = values.id === 0;

      const fd = new FormData();
      fd.append("type", "location_group");
      fd.append("type_id", form_obj?.id ?? "");
      fd.append("name", values.name ?? "");
      fd.append("address", values.address ?? "");
      fd.append("city", values.city ?? "");
      fd.append("state", values.state ?? "");
      fd.append("country", values.country ?? "");
      fd.append("pincode", values.pincode ?? "");
      fd.append("timezone", values.timezone ?? "");
      fd.append("accurate_address", values.accurate_address ?? "");
      fd.append("radius_range", values.radius_range ?? "");
      fd.append("latitude", values.latitude ?? "");
      fd.append("longitude", values.longitude ?? "");
      if (values.location_id) fd.append("location_id", values.location_id);
      fd.append("map_data", JSON.stringify(map_data));

      // Only send a newly picked File so an unchanged image is not overwritten on edit.
      if (values.image instanceof File) {
        fd.append("image", values.image);
      }

      let Api;
      if (isNewLocation) {
        Api = await PostApi("location/add-entity-location/", fd, true);
      } else {
        fd.append("id", values.id);
        Api = await PostApi("location/add-entity-location/", fd, true);
      }

      if ([200, 201].includes(Api?.status)) {
        const response = Api?.data?.data ?? Api?.data;
        const localStorageLocationGroupData =
          GetLocalStorageData("location_groups");

        let updatedLocation = null;

        if (isNewLocation) {
          updatedLocation = localStorageLocationGroupData.map((d) => {
            if (d.id === values?.type_id) {
              return {
                ...d,
                entity_location_details: [
                  ...(d.entity_location_details || []),
                  response,
                ],
              };
            }
            return d;
          });
        } else {
          updatedLocation = localStorageLocationGroupData.map((d) => {
            if (d.id === values?.type_id) {
              const newLD = (d.entity_location_details || []).map((loc) =>
                loc.id === response.id ? response : loc,
              );
              return { ...d, entity_location_details: newLD };
            }
            return d;
          });
        }

        let GlobalMetaData =
          localStorage.getItem("lint_hr_globaldata") !== null
            ? JSON.parse(localStorage.getItem("lint_hr_globaldata"))
            : {};
        GlobalMetaData["location_groups"] = updatedLocation;
        localStorage.setItem(
          "lint_hr_globaldata",
          JSON.stringify(GlobalMetaData),
        );

        dispatch(setLocationGroup(updatedLocation));

        toast.success(
          isNewLocation
            ? "Location added successfully."
            : "Location updated successfully.",
        );
        setModalOpen(false);
      } else {
        toast.error(
          Api?.data?.message || Api?.data?.detail || "Failed to save location.",
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          "API error occurred.",
      );
    } finally {
      setLocationSaving(false);
    }
  };

  const handleLocationImageUpdate = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG and WEBP image files are allowed.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      setLocValue("image", file);
      setLocValue("image_url", readerEvent.target.result);
    };

    reader.readAsDataURL(file);
  };

  const handleAddClick = () => {
    resetLoc({
      ...initialLocationObj,
      type_id: form_obj?.id,
      type: "location_group",
    });
    setModalOpen(true);
  };

  const handleEditLocation = (location) => {
    resetLoc({
      ...toLocationValues(location),
      type_id: form_obj?.id,
      type: "location_group",
      // Existing image stays via image_url unless a new file is picked.
      image: null,
    });
    setModalOpen(true);
  };

  const handleModalClose = () => setModalOpen(false);

  return (
    <React.Fragment>
      <SidebarFormLayout
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        submitLabel={isEdit ? "Update" : "Save"}
      >
        <FormSection title="Details">
          <FormTextField
            name="name"
            control={control}
            label="Location group name"
            placeholder="e.g. Chennai Offices"
            required
            autoFocus
            maxLength={NAME_MAX}
            sanitize={(v) => v.replace(NAME_CHARS, "")}
            startIcon={
              <ApartmentOutlinedIcon fontSize="small" color="action" />
            }
          />
          <FormTextField
            name="description"
            control={control}
            label="Description"
            placeholder="e.g. All branches in Chennai region"
            multiline
            minRows={3}
            maxRows={6}
            maxLength={DESCRIPTION_MAX}
            sanitize={(v) => v.replace(DESCRIPTION_CHARS, "")}
          />
        </FormSection>

        {isEdit && (
          <FormSection
            title="Locations"
            action={
              <Button
                data-testid="location-group-add-location-button"
                size="small"
                startIcon={<AddLocationAltOutlinedIcon />}
                onClick={handleAddClick}
              >
                Add location
              </Button>
            }
          >
            {entityLocations.length > 0 ? (
              <Box
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  overflowX: "auto",
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Radius</TableCell>
                      <TableCell>Image</TableCell>
                      <TableCell align="right">Edit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entityLocations.map((location, index) => (
                      <TableRow key={location.id ?? index}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>{location.accurate_address}</TableCell>
                        <TableCell>{location.radius_range} m</TableCell>
                        <TableCell>
                          <Box
                            component="img"
                            src={location.image_url || no_image}
                            alt="location"
                            sx={{
                              height: 40,
                              width: 56,
                              objectFit: "cover",
                              borderRadius: 1,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            data-testid={testId("location-group-edit", itemTestKey(location), "button")}
                            size="small"
                            color="primary"
                            onClick={() => handleEditLocation(location)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No locations added yet.
              </Typography>
            )}
          </FormSection>
        )}
      </SidebarFormLayout>

      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        fullWidth
        maxWidth="md"
        slotProps={{ paper: { className: "lgx-dialog" } }}
      >
        <DialogTitle className="lgx-head">
          <span className="lgx-head-icon">
            {locId === 0 ? (
              <AddLocationAltOutlinedIcon />
            ) : (
              <EditLocationAltOutlinedIcon />
            )}
          </span>
          <span className="lgx-head-text">
            <span className="lgx-head-title">
              {locId === 0 ? "Add New Location" : "Edit Location"}
            </span>
            <span className="lgx-head-sub">
              Pin the exact spot and set the attendance radius.
            </span>
          </span>
          <IconButton
            data-testid="location-group-close-button"
            className="lgx-close"
            onClick={handleModalClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent className="lgx-body">
          <Stack
            component="form"
            id={LOCATION_FORM_ID}
            noValidate
            spacing={2.5}
            onSubmit={(e) => {
              e.stopPropagation();
              handleLocSubmit(onLocationSubmit)(e);
            }}
          >
            <LocationStep
              step={1}
              title="Basics"
              caption="Give this location a name your team will recognise."
            />
            <FormTextField
              name="name"
              control={locControl}
              label="Location name"
              placeholder="Enter Location Name"
              helperText="Enter location name."
              required
              maxLength={NAME_MAX}
              sanitize={(v) => v.replace(NAME_CHARS, "")}
              startIcon={
                <ApartmentOutlinedIcon fontSize="small" color="action" />
              }
            />

            <LocationStep
              step={2}
              title="Pin on map"
              caption="Search the place, then drag the pin to the exact entrance."
            />
            <Box>
              <LocationSearch
                locationObj={locationObj}
                setLocationObj={setLocationObj}
                LocationFormikForm={LocationFormikForm}
              />
            </Box>

            <LocationStep
              step={3}
              title="Address details"
              caption="Filled in from the map — review and adjust if needed."
            />
            <FormTextField
              name="address"
              control={locControl}
              label="Address"
              helperText="Enter address."
              required
              multiline
              minRows={2}
              maxLength={ADDRESS_MAX}
              sanitize={(v) => v.replace(ADDRESS_CHARS, "")}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormAutocomplete
                  name="country"
                  control={locControl}
                  label="Country"
                  placeholder="Select country"
                  helperText="Select country."
                  options={countryOptions}
                  getOptionValue={optionValue}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormAutocomplete
                  name="state"
                  control={locControl}
                  label="State"
                  placeholder="Select state"
                  helperText="Select state."
                  options={locationStateOptions}
                  getOptionValue={optionValue}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  name="city"
                  control={locControl}
                  label="City"
                  placeholder="City"
                  helperText="Enter city (letters only)."
                  required
                  fullWidth
                  maxLength={CITY_MAX}
                  sanitize={(v) => v.replace(CITY_CHARS, "")}
                  startIcon={
                    <LocationCityOutlinedIcon fontSize="small" color="action" />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  name="pincode"
                  control={locControl}
                  label="Pincode"
                  placeholder="600001"
                  helperText="Enter pincode (digits only)."
                  required
                  fullWidth
                  slotProps={{ htmlInput: { inputMode: "numeric" } }}
                  sanitize={(v) => v.replace(/[^0-9]/g, "").slice(0, 6)}
                  startIcon={
                    <MarkunreadMailboxOutlinedIcon
                      fontSize="small"
                      color="action"
                    />
                  }
                />
              </Grid>
            </Grid>

            <FormAutocomplete
              name="timezone"
              control={locControl}
              label="Time Zone"
              placeholder="Select a time zone"
              helperText="Select time zone."
              options={timzone_options}
              getOptionValue={optionValue}
              required
            />

            <LocationStep
              step={4}
              title="Photo"
              caption="Optional — helps employees spot the right building."
            />
            <Box
              data-testid="location-group-choose-image-button"
              component="label"
              className={`lgx-upload${locImageUrl ? " has-image" : ""}`}
            >
              <input
                data-testid="location-group-image-file-input"
                hidden
                type="file"
                name="image"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleLocationImageUpdate}
              />
              {locImageUrl ? (
                <img className="lgx-upload-preview" src={locImageUrl} alt="preview" />
              ) : (
                <span className="lgx-upload-icon">
                  <FileUploadOutlinedIcon />
                </span>
              )}
              <span className="lgx-upload-text">
                <b>{locImageUrl ? "Change photo" : "Upload a photo"}</b>
                <small>JPG, PNG or WEBP</small>
              </span>
              <span className="lgx-upload-btn">Browse</span>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions className="lgx-foot">
          <Button
            data-testid="location-group-cancel-button"
            color="inherit"
            variant="outlined"
            className="lgx-cancel"
            onClick={handleModalClose}
            disabled={locationSaving}
          >
            Cancel
          </Button>
          <Button
            data-testid="location-group-save-location-button"
            type="submit"
            form={LOCATION_FORM_ID}
            variant="contained"
            color="success"
            className="lgx-save"
            loading={locationSaving}
            loadingPosition="start"
            startIcon={<CheckRoundedIcon />}
          >
            Save Location
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default LocationGroupForm;
