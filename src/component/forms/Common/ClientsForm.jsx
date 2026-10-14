import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import {
  addClient,
  editClient,
} from "../../../redux/reducers/ChildReducer/ClientReducer";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { PostApi } from "../../../common/api/PostApi";
import { PutApi } from "../../../common/api/PutApi";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import { timzone_options } from "../../../common/constant/Constants";
import CountryList, { countriesWithStates } from "../../../common/data/CountryList";
import LocationSearch from "../../../pages/organization/LocationSearch";
import no_image from "../../../assets/images/users/no_img.jpg";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import {
  FormAutocomplete,
  FormSection,
  FormSwitch,
  FormTextField,
} from "../../../shared/ui/form";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const allowedTlds = [
  "com",
  "org",
  "net",
  "edu",
  "gov",
  "mil",
  "info",
  "biz",
  "name",
  "pro",
  "xyz",
  "online",
  "site",
  "store",
  "tech",
  "app",
  "dev",
  "ai",
  "io",

  "in",
  "us",
  "uk",
  "au",
  "ca",
  "de",
  "fr",
  "jp",
  "cn",
  "sg",
  "ae",
  "nz",
  "pk",
  "lk",
];

const validateWebsite = (value) => {
  if (!value || !value.trim()) {
    return false;
  }

  const website = value.trim().toLowerCase();

  if (website.length > 500) {
    return false;
  }

  if (/^(ftp|smtp):\/\//i.test(website)) {
    return false;
  }

  if (/\s/.test(website)) {
    return false;
  }

  if (website.includes("..")) {
    return false;
  }

  if (/^(w|ww)\./i.test(website)) {
    return false;
  }

  const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d{1,5})?(\/.*)?$/i;

  if (!regex.test(website)) {
    return false;
  }

  const hostname = website
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];

  const parts = hostname.split(".");

  const lastTwo = parts.slice(-2).join(".");
  const lastOne = parts[parts.length - 1];

  return (
    allowedTlds.includes(lastOne) ||
    ["co.in", "gov.in", "edu.in"].includes(lastTwo)
  );
};

// ─── Initial location object ──────────────────────────────────────────────────
const initialLocationObj = {
  type_id: 0,
  type: "client",
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

const CLIENT_NAME_MAX = 100;
const WEBSITE_MAX = 500;
const LOCATION_NAME_MAX = 100;
const LOCATION_CITY_MAX = 100;
const LOCATION_ADDRESS_MAX = 250;
const PREFERRED_DIAL_COUNTRY = {
  "+1": "United States of America",
  "+7": "Russia",
  "+34": "Spain",
  "+44": "England",
  "+47": "Norway",
  "+55": "Brazil",
  "+61": "Australia",
  "+64": "New Zealand",
  "+212": "Morocco",
  "+358": "Finland",
};

const optionValue = (o) => o?.value;

const sanitizeClientName = (v) => v.replace(/[^A-Za-z0-9\s.,&()'-]/g, "");
const sanitizeWebsite = (v) => v.toLowerCase().replace(/[^a-z0-9:/.-]/g, "");
const sanitizePhone = (v) => v.replace(/[^0-9]/g, "").slice(0, 10);
const sanitizeGst = (v) =>
  v
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 15);
const sanitizeLocationName = (v) => v.replace(/[^A-Za-z0-9\s.,&()'_-]/g, "");
const sanitizeCity = (v) => v.replace(/[^A-Za-z\s.'-]/g, "");
const sanitizeAddress = (v) => v.replace(/[^A-Za-z0-9\s.,\-#/'&]/g, "");
const sanitizePincode = (v) => v.replace(/[^0-9]/g, "").slice(0, 6);

const clientSchema = Yup.object({
  name: Yup.string()
    .trim()
    .matches(
      /^[A-Za-z0-9\s.,&()'-]+$/,
      "Client name should contain only letters, numbers, spaces, periods (.), commas (,), hyphens (-), ampersands (&), parentheses ( ), or apostrophes (')",
    )
    .required("Please Enter the Client name")
    .test(
      "client-name-length",
      "Client Name cannot exceed 100 characters",
      (value) => !value || value.length <= CLIENT_NAME_MAX,
    ),
  owner: Yup.string()
    .nullable()
    .typeError("Please Select Owner")
    .required("Please Select Owner"),
  phone_number: Yup.string()
    .required("Please Enter Phone Number")
    .matches(/^[0-9]+$/, "Phone number must contain digits only")
    .length(10, "Phone number must be 10 digits"),
  country_code: Yup.string().required("Country code is required"),
  website: Yup.string()
    .trim()
    .test(
      "website-length",
      "Website URL must not exceed 500 characters",
      (value) => !value || value.length <= WEBSITE_MAX,
    )
    .test(
      "website-validation",
      "Enter a valid website URL with a supported domain extension",
      (value) => {
        if (!value || value.trim() === "") return true;
        return validateWebsite(value);
      },
    ),
  gst_number: Yup.string()
    .nullable()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/, {
      message: "Enter a valid GST Number (e.g. 27AABFR5055K1Z0)",
      excludeEmptyString: true,
    })
    .test(
      "gst-length",
      "GST Number must be exactly 15 characters",
      (value) => !value || value.length === 15,
    ),
});

const locationSchema = Yup.object({
  name: Yup.string()
    .matches(
      /^[A-Za-z0-9\s.,&()'_-]+$/,
      "Location name should contain only letters, numbers, spaces, periods (.), commas (,), hyphens (-), ampersands (&), parentheses ( ), apostrophes ('), or underscores (_)",
    )
    .required("Please Enter Location Name")
    .test(
      "not-only-spaces",
      "Please Enter Location Name",
      (value) => !value || value.trim().length > 0,
    )
    .test(
      "location-name-length",
      "Location Name cannot exceed 100 characters",
      (value) => !value || value.length <= LOCATION_NAME_MAX,
    ),
  address: Yup.string()
    .trim()
    .required("Please Enter Address")
    .matches(
      /^[A-Za-z0-9\s.,\-#/'&]+$/,
      "Address should contain only letters, numbers, spaces, periods (.), commas (,), hyphens (-), hash (#), slash (/), apostrophes ('), and ampersands (&)",
    )
    .max(LOCATION_ADDRESS_MAX, "Address cannot exceed 250 characters"),
  country: Yup.string().required("Please Select Country"),
  state: Yup.string().required("Please Select State"),
  city: Yup.string()
    .trim()
    .matches(
      /^[A-Za-z\s.'-]+$/,
      "City should contain only letters, spaces, periods (.), hyphens (-), or apostrophes (')",
    )
    .required("Please Enter City")
    .test(
      "city-length",
      "City cannot exceed 100 characters",
      (value) => !value || value.length <= LOCATION_CITY_MAX,
    ),
  pincode: Yup.string()
    .trim()
    .matches(/^[0-9]+$/, "Pincode should contain only numbers")
    .length(6, "Please Enter Valid 6 Digit Pincode")
    .required("Please Enter Pincode"),
  timezone: Yup.string().required("Please Select Time Zone"),
  accurate_address: Yup.string()
    .trim()
    .matches(
      /^[A-Za-z0-9\s.,\-#/'&]+$/,
      "Accurate Address contains invalid characters",
    )
    .test(
      "accurate-address-length",
      "Accurate Address cannot exceed 250 characters",
      (value) => !value || value.length <= 250,
    ),
});

const toFormValues = (obj) => ({
  name: obj?.name ?? "",
  owner: obj?.owner ?? null,
  manager_id_list: obj?.manager_id_list ?? [],
  country_code: obj?.country_code || "+91",
  phone_number: obj?.phone_number ?? "",
  website: obj?.website ?? "",
  gst_number: obj?.gst_number ?? "",
  status: !!obj?.status,
});

const ClientForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const isEdit = !!(form_obj?.id && form_obj.id !== 0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entityLocations, setEntityLocations] = useState(
    form_obj?.entity_location_details,
  );
  const locations = entityLocations || [];

  // ─── Location modal state ─────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [isLocationSubmitting, setIsLocationSubmitting] = useState(false);

  // ─── Options ──────────────────────────────────────────────────────────────
  const employeeOptions = useMemo(
    () =>
      (GetLocalStorageData("employee") || []).map((emp) => ({
        ...emp,
        value: emp.id,
        label:
          `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
          emp.name ||
          `Employee ${emp.id}`,
      })),
    [form_obj],
  );

  const countryCodeOptions = useMemo(
    () =>
      CountryList.filter((c) => c.countryCode)
        .sort((a, b) => a.countryName.localeCompare(b.countryName))
        .map((d) => ({
          ...d,
          value: d.id,
          label: `${d.countryName} (${d.countryCode})`,
        })),
    [],
  );
  // Several countries share a dial code (+1, +44, +7…) and only the code is
  // saved, so keep the picked country and otherwise prefer the main one.
  const [pickedCountryId, setPickedCountryId] = useState(null);
  const findCountryByCode = (code) => {
    if (!code) return null;
    const matches = countryCodeOptions.filter((o) => o.countryCode === code);
    return (
      matches.find((o) => o.id === pickedCountryId) ||
      matches.find((o) => o.show) ||
      matches.find((o) => PREFERRED_DIAL_COUNTRY[code] === o.countryName) ||
      matches[0] ||
      null
    );
  };

  const CountryListOptions = useMemo(
    () =>
      countriesWithStates.map((d) => ({
        ...d,
        label: d.countryName,
        value: d.countryName,
      })),
    [],
  );

  // ─── Main client form ─────────────────────────────────────────────────────
  const { control, handleSubmit, reset, getValues } = useForm({
    resolver: yupResolver(clientSchema, undefined, { raw: true }),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  const status = useWatch({ control, name: "status" });

  useEffect(() => {
    reset(toFormValues(form_obj));
    setEntityLocations(form_obj?.entity_location_details);
  }, [form_obj, reset]);

  // Optional fields left empty keep their original value (undefined / null)
  // so the payload matches what the API received before.
  const keepBlank = (key, value) =>
    value === "" && form_obj?.[key] == null ? form_obj?.[key] : value;

  const buildClientData = (values) => {
    const { status: statusValue, ...fields } = values;
    return {
      ...form_obj,
      ...fields,
      ...(isEdit && { status: statusValue }),
      website: keepBlank("website", fields.website),
      gst_number: keepBlank("gst_number", fields.gst_number),
      entity_location_details: entityLocations,
    };
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const clientData = buildClientData(values);
      const payload = {
        ...clientData,
        name: clientData.name.trim(),
        owner: clientData.owner || null,
        manager_id_list: clientData.manager_id_list || [],
      };
      delete payload._manager_raw;

      const Api = isEdit
        ? await PutApi(`clients/`, payload, false)
        : await PostApi("clients/", payload, false);

      if (Api?.status === 200 || Api?.status === 201) {
        const responseData = Api?.data?.data;
        dispatch(isEdit ? editClient(responseData) : addClient(responseData));

        const oldClients = GetLocalStorageData("clients") || [];
        const updatedClients = isEdit
          ? oldClients.map((item) =>
              item.id === responseData.id ? responseData : item,
            )
          : [...oldClients, responseData];
        SetLocalStorage("clients", updatedClients, 1);

        toast.success(Api?.data?.message || "Success");
        dispatch(toggleRSBView(false));
      } else {
        toast.error(Api?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error("API Error");
    }
    setIsSubmitting(false);
  };

  // ─── Location form ────────────────────────────────────────────────────────
  const {
    control: locControl,
    handleSubmit: handleLocationSubmit,
    reset: resetLocation,
    getValues: getLocationValues,
    setValue: setLocationValue,
    setError: setLocationError,
    clearErrors: clearLocationErrors,
    getFieldState: getLocationFieldState,
    formState: {
      errors: locationErrors,
      touchedFields: locationTouched,
      isSubmitted: isLocationSubmitted,
    },
  } = useForm({
    resolver: yupResolver(locationSchema, undefined, { raw: true }),
    mode: "onTouched",
    defaultValues: initialLocationObj,
  });

  const watchedLocation = useWatch({ control: locControl });
  const locationObj = useMemo(
    () => ({ ...initialLocationObj, ...watchedLocation }),
    [watchedLocation],
  );

  const locationStateOptions = useMemo(
    () =>
      CountryList.find((d) => d.countryName === locationObj.country)?.states ||
      [],
    [locationObj.country],
  );

  // LocationSearch writes whole-object updates (and a Formik-like API);
  // both are mapped onto the location form here.
  const setLocationObj = useCallback(
    (next) => {
      const obj =
        typeof next === "function" ? next(getLocationValues()) : next;
      Object.entries(obj || {}).forEach(([key, value]) => {
        if (getLocationValues(key) === value) return;
        setLocationValue(key, value, {
          shouldDirty: true,
          shouldValidate:
            key !== "accurate_address" && !!getLocationFieldState(key).error,
        });
      });
    },
    [getLocationValues, setLocationValue, getLocationFieldState],
  );

  const locationFormikAdapter = {
    setFieldValue: (key, value) =>
      setLocationValue(key, value, { shouldDirty: true, shouldTouch: true }),
    setFieldTouched: () => {},
    setFieldError: (key, message) =>
      message
        ? setLocationError(key, { type: "manual", message })
        : clearLocationErrors(key),
    errors: { accurate_address: locationErrors.accurate_address?.message },
    touched: { accurate_address: !!locationTouched.accurate_address },
  };

  const handleLocationImageUpdate = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a file in a valid image format.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      setLocationValue("image", file, { shouldDirty: true });
      setLocationValue("image_url", readerEvent.target.result, {
        shouldDirty: true,
      });
    };

    reader.readAsDataURL(file);
  };

  const handleAddClick = () => {
    resetLocation({
      ...initialLocationObj,
      type_id: form_obj?.id,
      type: "client",
    });
    setModalOpen(true);
  };

  const handleEditLocation = (location) => {
    resetLocation({
      ...location,
      type_id: form_obj?.id,
      type: "client",
    });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    if (!isLocationSubmitting) setModalOpen(false);
  };

  const onLocationSubmit = async (values) => {
    setIsLocationSubmitting(true);

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

      let map_data = {};

      if (
        typeof values.map_data === "object" &&
        values.map_data !== null &&
        !Array.isArray(values.map_data)
      ) {
        for (const key of map_data_keys) {
          if (Object.prototype.hasOwnProperty.call(values.map_data, key)) {
            map_data[key] = values.map_data[key];
          }
        }
      }

      const isNewLocation = values.id === 0;

      const formData = new FormData();

      // Send id in body for update
      if (!isNewLocation) {
        formData.append("id", values.id);
      }

      formData.append("type", "client");
      formData.append("type_id", form_obj?.id);
      formData.append("name", values.name || "");
      formData.append("address", values.address || "");
      formData.append("city", values.city || "");
      formData.append("state", values.state || "");
      formData.append("country", values.country || "");
      formData.append("pincode", values.pincode || "");
      formData.append("timezone", values.timezone || "");
      formData.append("accurate_address", values.accurate_address || "");
      formData.append("radius_range", values.radius_range || "");
      formData.append("latitude", values.latitude || "");
      formData.append("longitude", values.longitude || "");
      formData.append("location_id", values.location_id || "");

      formData.append("map_data", JSON.stringify(map_data));

      // Image
      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      // Debug
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const Api = await PostApi(
        "location/add-entity-location/",
        formData,
        true,
      );

      if ([200, 201].includes(Api?.status)) {
        // Handle both flat and nested response shapes
        const response = Api?.data?.data ?? Api?.data;

        const updatedLocations = isNewLocation
          ? [...locations, response]
          : locations.map((loc) => (loc.id === response.id ? response : loc));

        // 1. Local list state (also used in the client payload)
        setEntityLocations(updatedLocations);

        // 2. localStorage "clients"
        const oldClients = GetLocalStorageData("clients") || [];
        const updatedClients = oldClients.map((client) =>
          client.id === form_obj?.id
            ? { ...client, entity_location_details: updatedLocations }
            : client,
        );
        SetLocalStorage("clients", updatedClients, 1);

        // 3. redux
        dispatch(
          editClient({
            ...buildClientData(getValues()),
            entity_location_details: updatedLocations,
          }),
        );

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
      setIsLocationSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <React.Fragment>
      <SidebarFormLayout
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        submitLabel={isEdit ? "Update" : "Save"}
      >
        <FormSection title="Client details">
          <FormTextField
            name="name"
            control={control}
            label="Client name"
            placeholder="Client Name"
            required
            autoFocus
            maxLength={CLIENT_NAME_MAX}
            sanitize={sanitizeClientName}
            startIcon={<ApartmentOutlinedIcon fontSize="small" color="action" />}
          />
          <FormAutocomplete
            name="owner"
            control={control}
            label="Owner"
            placeholder="Select Owner"
            options={employeeOptions}
            required
            helperText="Select the client owner."
          />
          <FormAutocomplete
            name="manager_id_list"
            control={control}
            label="Managers"
            placeholder="Select Managers"
            options={employeeOptions}
            multiple
            selectAll={false}
            helperText="Select one or more managers."
          />
        </FormSection>

        <FormSection title="Contact">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <Controller
                name="country_code"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const selected = findCountryByCode(field.value);
                  return (
                    <Autocomplete
                      options={countryCodeOptions}
                      value={selected}
                      onChange={(_, opt) => {
                        setPickedCountryId(opt?.id ?? null);
                        field.onChange(opt?.countryCode || "");
                      }}
                      onBlur={field.onBlur}
                      getOptionLabel={(o) => o?.countryCode ?? ""}
                      getOptionKey={(o) => o.id}
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      filterOptions={(opts, { inputValue }) => {
                        const q = inputValue.trim().toLowerCase().replace(/^\+/, "");
                        return opts.filter(
                          (o) =>
                            o.countryCode.replace(/^\+/, "").startsWith(q) ||
                            o.countryName.toLowerCase().startsWith(q),
                        );
                      }}
                      renderOption={(props, o) => {
                        const { key, ...rest } = props;
                        return (
                          <li key={key} {...rest}>
                            <Box
                              component="img"
                              src={o.flagImg}
                              alt=""
                              sx={{ height: 16, mr: 1 }}
                            />
                            {o.countryName}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ ml: 0.75 }}
                            >
                              {o.countryCode}
                            </Typography>
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          inputRef={field.ref}
                          label="Country code"
                          placeholder="Select"
                          required
                          error={!!error}
                          helperText={error?.message}
                          slotProps={{
                            input: {
                              ...params.InputProps,
                              startAdornment: selected ? (
                                <Box
                                  component="img"
                                  src={selected.flagImg}
                                  alt=""
                                  sx={{ height: 16, ml: 0.5 }}
                                />
                              ) : null,
                            },
                          }}
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 7 }}>
              <FormTextField
                name="phone_number"
                control={control}
                label="Phone number"
                placeholder="9876543210"
                required
                fullWidth
                sanitize={sanitizePhone}
                startIcon={<PhoneOutlinedIcon fontSize="small" color="action" />}
                slotProps={{ htmlInput: { inputMode: "numeric" } }}
              />
            </Grid>
          </Grid>
          <FormTextField
            name="website"
            control={control}
            label="Website"
            placeholder="www.company.com"
            maxLength={WEBSITE_MAX}
            sanitize={sanitizeWebsite}
            startIcon={<LanguageOutlinedIcon fontSize="small" color="action" />}
          />
          <FormTextField
            name="gst_number"
            control={control}
            label="GST number"
            placeholder="GST Number"
            sanitize={sanitizeGst}
            startIcon={
              <ReceiptLongOutlinedIcon fontSize="small" color="action" />
            }
          />
        </FormSection>

        {isEdit && (
          <FormSwitch
            name="status"
            control={control}
            label="Status"
            description={status ? "Active" : "Inactive"}
          />
        )}

        {isEdit && (
          <FormSection
            title="Locations"
            action={
              <Button
                data-testid="client-add-location-button"
                size="small"
                variant="outlined"
                startIcon={<AddLocationAltOutlinedIcon />}
                onClick={handleAddClick}
              >
                Add Location
              </Button>
            }
          >
            {locations.length > 0 ? (
              <Stack spacing={1.5}>
                {locations.map((location, index) => (
                  <Paper
                    key={location.id ?? index}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    <Avatar
                      variant="rounded"
                      src={location.image_url ? location.image_url : no_image}
                      alt="location"
                      sx={{ width: 56, height: 56 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {location.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="div"
                        noWrap
                      >
                        {location.accurate_address}
                      </Typography>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${location.radius_range} m`}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    <Tooltip title="Edit location">
                      <IconButton
                        data-testid={testId("client-edit", itemTestKey(location), "button")}
                        size="small"
                        color="primary"
                        onClick={() => handleEditLocation(location)}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No locations added yet.
              </Typography>
            )}
          </FormSection>
        )}
      </SidebarFormLayout>

      {/* ── Location Modal ── */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
        disableEnforceFocus
        slotProps={{
          paper: {
            component: "form",
            noValidate: true,
            onSubmit: (e) => {
              e.stopPropagation();
              handleLocationSubmit(onLocationSubmit)(e);
            },
          },
        }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          {locationObj.id === 0 ? "Add New Location" : "Edit Location"}
          <IconButton
            data-testid="client-close-button"
            aria-label="close"
            onClick={handleModalClose}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <FormTextField
              name="name"
              control={locControl}
              label="Location name"
              placeholder="Enter Location Name"
              required
              autoFocus
              maxLength={LOCATION_NAME_MAX}
              sanitize={sanitizeLocationName}
              startIcon={<PlaceOutlinedIcon fontSize="small" color="action" />}
            />

            {/* Map / Accurate Address Search */}
            <Box>
              <LocationSearch
                locationObj={locationObj}
                setLocationObj={setLocationObj}
                LocationFormikForm={locationFormikAdapter}
              />
            </Box>

            <FormTextField
              name="address"
              control={locControl}
              label="Address"
              required
              multiline
              minRows={2}
              maxLength={LOCATION_ADDRESS_MAX}
              sanitize={sanitizeAddress}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="country"
                  control={locControl}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      options={CountryListOptions}
                      value={
                        CountryListOptions.find(
                          (d) => d.value === field.value,
                        ) || null
                      }
                      onChange={(_, opt) => {
                        field.onChange(opt?.value || "");
                        setLocationValue("state", "", {
                          shouldValidate: isLocationSubmitted,
                        });
                      }}
                      onBlur={field.onBlur}
                      getOptionKey={(o) => o.id}
                      isOptionEqualToValue={(o, v) => o.value === v.value}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          inputRef={field.ref}
                          label="Country"
                          required
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormAutocomplete
                  name="state"
                  control={locControl}
                  label="State"
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
                  required
                  fullWidth
                  maxLength={LOCATION_CITY_MAX}
                  sanitize={sanitizeCity}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  name="pincode"
                  control={locControl}
                  label="Pincode"
                  placeholder="600001"
                  required
                  fullWidth
                  sanitize={sanitizePincode}
                  slotProps={{ htmlInput: { inputMode: "numeric" } }}
                />
              </Grid>
            </Grid>

            <FormAutocomplete
              name="timezone"
              control={locControl}
              label="Time zone"
              placeholder="Select a time zone"
              options={timzone_options}
              getOptionValue={optionValue}
            />

            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                variant="rounded"
                src={locationObj.image_url || undefined}
                alt="preview"
                sx={{ width: 64, height: 64 }}
              >
                <ImageOutlinedIcon />
              </Avatar>
              <Button
                data-testid="client-change-image-button"
                component="label"
                variant="outlined"
                startIcon={<UploadFileOutlinedIcon />}
              >
                {locationObj.image_url ? "Change image" : "Upload image"}
                <input
                  data-testid="client-image-file-input"
                  hidden
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleLocationImageUpdate}
                />
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            data-testid="client-cancel-button"
            variant="text"
            color="inherit"
            onClick={handleModalClose}
            disabled={isLocationSubmitting}
          >
            Cancel
          </Button>
          <Button
            data-testid="client-save-location-button"
            type="submit"
            variant="contained"
            color="success"
            loading={isLocationSubmitting}
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

export default ClientForm;
