import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button as RsButton,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Form,
  Label,
  Input,
  FormFeedback,
} from "reactstrap";
import Select from "../../shared/ui/TestableSelect";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import {
  form_default_input_types,
  timzone_options,
  form_date_type,
} from "../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useFormik } from "formik";
import * as Yup from "yup";

import CountryList, { countriesWithStates } from "../../common/data/CountryList";
import no_image from "../../assets/images/users/no_img.jpg";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { PostApi } from "../../common/api/PostApi";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import {
  addBranch,
  editBranch,
  setBranch,
} from "../../redux/reducers/ChildReducer/BranchReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";
import LocationSearch from "../../pages/organization/LocationSearch";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { GetApi } from "../../common/api/GetApi";
import SidebarFormLayout from "../../shared/ui/SidebarFormLayout";
import {
  FormAutocomplete,
  FormDatePicker,
  FormSection,
  FormTextField,
} from "../../shared/ui/form";
import { testId, itemTestKey } from "../../shared/testing/testId";
import ModalCloseButton from "../../shared/ui/ModalCloseButton";

dayjs.extend(customParseFormat);

const NAME_MAX = 100;
const ADDRESS_MAX = 250;
const CITY_MAX = 100;
const EMAIL_MAX = 100;
const ABOUT_MAX = 2000;

const COUNTRY_OPTIONS = countriesWithStates.map((d) => ({
  ...d,
  label: d.countryName,
  value: d.countryName,
}));

const optionValue = (o) => o?.value;

const statesOf = (country) =>
  CountryList.find((d) => d.countryName === country)?.states || [];

const branchSchema = Yup.object({
  name: Yup.string()
    .trim()
    .matches(
      /^[A-Za-z0-9.,&()'\-\s]+$/,
      "Branch Name can contain only letters, numbers, spaces, and . , - & ( ) '"
    )
    .required("Please Enter Branch Name")
    .min(1, "Branch Name must be at least 1 character")
    .max(NAME_MAX, "Branch Name must not exceed 100 characters"),
  country: Yup.string().required("Please select country"),
  state: Yup.string().required("Please select state"),
  address: Yup.string()
    .trim()
    .required("Please enter address")
    .matches(
      /^[A-Za-z0-9\s.,\-#/'&]+$/,
      "Address can contain only letters, numbers, spaces, and . , - # / ' &"
    )
    .max(ADDRESS_MAX, "Address must not exceed 250 characters"),
  city: Yup.string()
    .trim()
    .required("Please enter city")
    .matches(/^[A-Za-z\s.'-]+$/, "City can contain only letters, spaces, . - and '")
    .min(1, "City must be at least 1 character")
    .max(CITY_MAX, "City must not exceed 100 characters"),
  pincode: Yup.string()
    .trim()
    .required("Please Enter Pincode")
    .matches(/^[0-9]+$/, "Pincode should contain only numbers")
    .length(6, "Please Enter Valid 6 Digit Pincode"),
  country_code: Yup.string().required("Country code is required"),
  contact_number: Yup.string()
    .required("Please Enter Phone Number")
    .matches(/^[0-9]+$/, "Phone number must contain digits only")
    .length(10, "Phone number must be 10 digits"),

  about: Yup.string()
    .matches(
      /^[a-zA-Z0-9\s\n.,!?'"\-_()&:;/]*$/,
      "Company Overview can contain only letters, numbers, spaces, line breaks, and . , ! ? ' \" - _ ( ) & : ; /"
    )
    .max(ABOUT_MAX, "Company Overview must not exceed 2000 characters"),

  contact_email: Yup.string()
    .trim()
    .required("Please enter email")
    .transform((value) => (value ? value.trim().toLowerCase() : value))
    .max(EMAIL_MAX, "Email must not exceed 100 characters")
    .matches(
      /^[a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,13}$/,
      "Enter a valid email address.",
    ),
});

const BRANCH_DEFAULTS = {
  id: 0,
  name: "",
  country: "",
  country_code: "",
  state: "",
  address: "",
  city: "",
  pincode: "",
  contact_number: "",
  contact_email: "",
  about: "",
  cf_values: [],
  entity_location_details: [],
};

const toFormValues = (obj) => {
  const values = { ...BRANCH_DEFAULTS };
  Object.entries(obj || {}).forEach(([key, val]) => {
    values[key] = val ?? "";
  });
  if (!Array.isArray(values.cf_values)) values.cf_values = [];
  if (!Array.isArray(values.entity_location_details)) values.entity_location_details = [];
  ["pincode", "contact_number"].forEach((key) => {
    values[key] = String(values[key] ?? "");
  });
  if (values.country && !values.country_code) {
    const found = CountryList.find((d) => d.countryName === values.country);
    if (found?.countryCode) values.country_code = found.countryCode;
  }
  return values;
};

// Error focus order; country_code is read-only, so its errors focus Country.
const FIELD_ORDER = [
  "name",
  "country",
  "state",
  "address",
  "city",
  "pincode",
  "country_code",
  "contact_number",
  "contact_email",
  "about",
];

const BranchForm = () => {
  const dispatch = useDispatch();
  const fieldRefs = useRef({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── State options ────────────────────────────────────────────────────────
  const [locationStateOptions, setLocationStateOptions] = useState([]);

  // ── Modal ────────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [ptSettingsOptions, setPtSettingsOptions] = useState([]);

  const initialBranchLocationObj = {
    type_id: 0,
    type: "branch",
    id: 0,
    address: "",
    city: "",
    pincode: "",
    country: "",
    state: "",
    pt_settings: null,
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

  useEffect(() => {
    GetApi("payroll/pt-settings/").then((res) => {

      console.log("pt",res?.data?.data || [])
      const opts = (res?.data?.data || []).map((p) => ({
        value: p.id,
        label: `${p.state_display} (${p.deduction_cycle})`,
      }));
      setPtSettingsOptions(opts);
    });
  }, []);

  // ── Branch form ──────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    getFieldState,
    watch,
  } = useForm({
    resolver: yupResolver(branchSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: toFormValues(form_obj),
  });

  // ── Load form_obj into the form when sidebar opens ───────────────────────
  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  useEffect(() => {
    const sub = watch((values, { name, type }) => {
      if (name !== "country" || type !== "change") return;
      const found = CountryList.find((d) => d.countryName === values.country);
      setValue("country_code", found?.countryCode || "", {
        shouldValidate: !!getFieldState("country_code").error,
      });
      setValue("state", "", { shouldValidate: !!getFieldState("state").error });
    });
    return () => sub.unsubscribe();
  }, [watch, setValue, getFieldState]);

  const [branchId, country, cfValues, entityLocationDetails] = useWatch({
    control,
    name: ["id", "country", "cf_values", "entity_location_details"],
  });

  const branchStateOptions = useMemo(() => statesOf(country), [country]);

  const refFor = (field) => (el) => {
    fieldRefs.current[field] = el;
  };

  // ── Auto-focus first error (EmployeeForm pattern) ────────────────────────
  const focusFirstErrorField = (errors) => {
    if (!errors || !Object.keys(errors).length) return;

    let firstErrorField =
      FIELD_ORDER.find((f) => errors[f]) || Object.keys(errors)[0];

    // Country code is read-only / auto-filled — focus Country select instead
    if (firstErrorField === "country_code") {
      firstErrorField = "country";
    }

    requestAnimationFrame(() => {
      const node = fieldRefs.current[firstErrorField];
      if (!node) return;

      node.scrollIntoView({ behavior: "smooth", block: "center" });

      const focusable = node.querySelector(
        "input:not([type='hidden']):not([readonly]), textarea:not([aria-hidden='true']), select",
      );
      focusable?.focus();
    });
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    const updatedObject = Object.fromEntries(
      Object.entries(values).filter(
        ([key]) => key !== "entity_location_details",
      ),
    );

    const ApiRes = await PostApi("branch/add-new/", updatedObject, false);
    setIsSubmitting(false);

    if (ApiRes.status && ApiRes.status === 200) {
      if (values.id === 0) {
        dispatch(addBranch(ApiRes?.data.data));
        SetLocalStorage("branch", ApiRes?.data.data, 2);
      } else {
        dispatch(editBranch(ApiRes?.data?.data));
        SetLocalStorage("branch", ApiRes?.data.data, 3);
      }
      dispatch(toggleRSBView(false));
      toast.success(ApiRes?.data?.message);
    } else {
      toast.error(ApiRes?.data?.message || ApiRes?.data?.detail);
    }
  };

  // ── Location Formik ──────────────────────────────────────────────────────
  const [branchLocationObj, setBranchLocationObj] = useState(
    initialBranchLocationObj,
  );

  const LocationFormikForm = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: branchLocationObj,
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .matches(
          /^[A-Za-z0-9.,&()'\-\s]+$/,
          "Location Name can contain only letters, numbers, spaces, and . , - & ( ) '"
        )
        .required("Please Enter Location Name")
        .min(1, "Location Name must be at least 1 character")
        .max(100, "Location Name must not exceed 100 characters"),

      address: Yup.string()
        .trim().required("Please Enter Address")
         .matches(
          /^[A-Za-z0-9\s.,\-#/'&]+$/,
          "Address can contain only letters, numbers, spaces, and . , - # / ' &"
        )
        .min(1, "Address must be atleast 1 character")
        .max(250, "Address must not exceed 250 characters"),

      country: Yup.string().required("Please Select Country"),

      state: Yup.string().required("Please Select State"),

      city: Yup.string()
        .trim()
        .required("Please Enter City")
        .matches(
          /^[A-Za-z\s.'-]+$/,
          "City can contain only letters, spaces, . - and '"
        )
        .min(1, "City must be at least 1 character")
        .max(100, "City must not exceed 100 characters"),

      pincode: Yup.string()
        .trim()
        .matches(/^[0-9]+$/, "Pincode should contain only numbers")
        .length(6, "Please Enter Valid 6 Digit Pincode")
        .required("Please Enter Pincode"),

      timezone: Yup.string().required("Please Select Time Zone"),

      accurate_address: Yup.string()
        .trim()
        .required("Please Enter Accurate Address"),
    }),
    onSubmit: async (values) => {
      dispatch(setLoaderVisible(true));
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

      if (
        typeof values.map_data === "object" &&
        values.map_data !== null &&
        !Array.isArray(values.map_data)
      ) {
        let updated_mapdata = {};
        for (const key of map_data_keys) {
          if (Object.prototype.hasOwnProperty.call(values.map_data, key)) {
            updated_mapdata[key] = values.map_data[key];
          }
        }
        values.map_data = updated_mapdata;
      } else {
        values.map_data = [];
      }

      let form_data = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "map_data") {
          form_data.append(key, JSON.stringify(value));
        } else if (key === "image") {
          if (value === null || value === undefined) {
            form_data.append("image", "");
          } else {
            form_data.append("image", value, value.name);
          }
        } else {
          form_data.append(key, value);
        }
      });

      const existing_entity_location_details = [
        ...(getValues("entity_location_details") || []),
      ];
      const ApiRes = await PostApi(
        "location/add-entity-location/",
        form_data,
        true,
      );

      if (ApiRes.status && ApiRes.status === 200) {
        const response = ApiRes?.data?.data;
        const localStorageBranchData = GetLocalStorageData("branch");

        let newLocationDetails;
        if (values.id === 0) {
          newLocationDetails = [...existing_entity_location_details, response];
        } else {
          newLocationDetails = existing_entity_location_details.map((d) =>
            d.id === response.id ? response : d,
          );
        }

        setValue("entity_location_details", newLocationDetails);

        let updatedBranch = localStorageBranchData.map((d) => {
          if (d.id === values?.type_id) {
            return { ...d, entity_location_details: newLocationDetails };
          }
          return d;
        });

        let GlobalMetaData =
          localStorage.getItem("lint_hr_globaldata") !== null
            ? JSON.parse(localStorage.getItem("lint_hr_globaldata"))
            : {};
        GlobalMetaData["branch"] = updatedBranch;
        localStorage.setItem(
          "lint_hr_globaldata",
          JSON.stringify(GlobalMetaData),
        );
        dispatch(setBranch(updatedBranch));

        dispatch(setLoaderVisible(false));
        toast.success(ApiRes?.data?.message);
        setModalOpen(false);
      } else {
        toast.error(ApiRes?.data?.message || ApiRes?.data?.detail);
        dispatch(setLoaderVisible(false));
      }
    },
  });

  useEffect(() => {
    if (
      LocationFormikForm.submitCount > 0 &&
      Object.keys(LocationFormikForm.errors).length > 0
    ) {
      const firstErrorField = Object.keys(LocationFormikForm.errors)[0];
      LocationFormikForm.setFieldTouched(firstErrorField, true, false);
      const errorField = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorField) errorField.focus();
    }
  }, [LocationFormikForm.submitCount]);

  const setLocField = (name, value) => {
    setBranchLocationObj((prev) => ({ ...prev, [name]: value }));
    LocationFormikForm.setFieldValue(name, value, true);
    LocationFormikForm.setFieldTouched(name, true, false);
  };

  const lv = LocationFormikForm.values;
  const le = LocationFormikForm.errors;
  const lt = LocationFormikForm.touched;
  const isLocInvalid = (field) => !!(lt[field] && le[field]);
  const showLocHint = (field) => !le[field];

  const handleLocationCountryChange = (e) => {
    const country = e?.value || "";
    setBranchLocationObj((prev) => ({ ...prev, country, state: "" }));
    LocationFormikForm.setValues(
      { ...LocationFormikForm.values, country, state: "" },
      true
    );
    LocationFormikForm.setFieldTouched("country", true, false);
    LocationFormikForm.setFieldTouched("state", true, false);

    const found = CountryList.find((d) => d.countryName === country);
    setLocationStateOptions(found?.states || []);
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
      toast.error(
        "Please upload a valid image. Accepted formats: JPG, JPEG, PNG, GIF, WEBP.",
      );
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      setLocField("image", file);
      setLocField("image_url", readerEvent.target.result);
    };

    reader.readAsDataURL(file);
  };

  const handleAddClick = () => {
    setBranchLocationObj({ ...initialBranchLocationObj, type_id: getValues("id") });
    LocationFormikForm.resetForm();
    setModalOpen(true);
  };

  const handleEditLocation = (location) => {
    setBranchLocationObj({ ...location, type_id: getValues("id"), type: "branch" });
    setModalOpen(true);
    if (location?.country) {
      const found = CountryList.find((d) => d.countryName === location.country);
      setLocationStateOptions(found?.states || []);
    }
  };

  return (
    <React.Fragment>
      <SidebarFormLayout
        onSubmit={handleSubmit(onSubmit, focusFirstErrorField)}
        isSubmitting={isSubmitting}
        submitLabel="Save"
        footerStart={
          branchId !== 0 && (
            <Button
              data-testid="branch-add-location-button"
              variant="outlined"
              onClick={handleAddClick}
              startIcon={<AddLocationAltOutlinedIcon />}
            >
              Add Location
            </Button>
          )
        }
      >
        <FormSection title="Branch details">
          <Box ref={refFor("name")}>
            <FormTextField
              name="name"
              control={control}
              label="Branch Name"
              placeholder="New Branch"
              required
              autoFocus
              fullWidth
              maxLength={NAME_MAX}
              sanitize={(val) =>
                val.replace(/^[ ]+/g, "").replace(/[^A-Za-z0-9.,&()'|\-\s]/g, "")
              }
              startIcon={<ApartmentOutlinedIcon fontSize="small" color="action" />}
            />
          </Box>
        </FormSection>

        <FormSection title="Address">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }} ref={refFor("country")}>
              <FormAutocomplete
                name="country"
                control={control}
                label="Country"
                placeholder="Select country"
                required
                disableClearable
                options={COUNTRY_OPTIONS}
                getOptionValue={optionValue}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} ref={refFor("state")}>
              <FormAutocomplete
                name="state"
                control={control}
                label="State"
                placeholder="Select state"
                required
                disableClearable
                options={branchStateOptions}
                getOptionValue={optionValue}
              />
            </Grid>
          </Grid>

          <Box ref={refFor("address")}>
            <FormTextField
              name="address"
              control={control}
              label="Address"
              required
              multiline
              minRows={2}
              maxRows={5}
              fullWidth
              maxLength={ADDRESS_MAX}
              sanitize={(val) =>
                val.replace(/^\s+/, "").replace(/[^A-Za-z0-9\s.,\-#/'&]/g, "")
              }
            />
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }} ref={refFor("city")}>
              <FormTextField
                name="city"
                control={control}
                label="City"
                placeholder="City"
                required
                fullWidth
                maxLength={CITY_MAX}
                sanitize={(val) =>
                  val.replace(/^\s+/, "").replace(/[^A-Za-z\s.'-]/g, "")
                }
                startIcon={<LocationOnOutlinedIcon fontSize="small" color="action" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} ref={refFor("pincode")}>
              <FormTextField
                name="pincode"
                control={control}
                label="Pincode"
                placeholder="600001"
                required
                fullWidth
                helperText="Digits only"
                sanitize={(val) => val.replace(/[^0-9]/g, "").slice(0, 6)}
                startIcon={<MapOutlinedIcon fontSize="small" color="action" />}
                slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 6 } }}
              />
            </Grid>
          </Grid>
        </FormSection>

        <FormSection title="Contact">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }} ref={refFor("country_code")}>
              <FormTextField
                name="country_code"
                control={control}
                label="Country Code"
                placeholder="e.g. +91"
                required
                fullWidth
                helperText="Auto-filled from country"
                slotProps={{ htmlInput: { readOnly: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }} ref={refFor("contact_number")}>
              <FormTextField
                name="contact_number"
                control={control}
                label="Contact Number"
                placeholder="9876543210"
                required
                fullWidth
                helperText="Enter 10 digits only."
                sanitize={(val) => val.replace(/[^0-9]/g, "").slice(0, 10)}
                slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 10 } }}
              />
            </Grid>
          </Grid>

          <Box ref={refFor("contact_email")}>
            <FormTextField
              name="contact_email"
              control={control}
              label="Contact Email"
              placeholder="user@company.com"
              type="email"
              required
              fullWidth
              maxLength={EMAIL_MAX}
              sanitize={(val) => val.toLowerCase()}
              startIcon={<EmailOutlinedIcon fontSize="small" color="action" />}
            />
          </Box>
        </FormSection>

        <FormSection title="Payroll & overview">
          <FormAutocomplete
            name="pt_settings"
            control={control}
            label="Professional Tax Settings"
            placeholder="Select PT settings"
            helperText="Links PT slab rules to this branch."
            options={ptSettingsOptions}
            getOptionValue={optionValue}
          />

          <Box ref={refFor("about")}>
            <FormTextField
              name="about"
              control={control}
              label="Company Overview"
              multiline
              minRows={3}
              maxRows={8}
              fullWidth
              maxLength={ABOUT_MAX}
              sanitize={(val) =>
                val.replace(/^\s+/, "").replace(/[^a-zA-Z0-9\s\n.,!?'"\-_()&:;/]/g, "")
              }
            />
          </Box>
        </FormSection>

        {/* ── Custom Fields ─────────────────────────────────── */}
        {cfValues && cfValues.length > 0 && (
          <FormSection title="Custom fields">
            {cfValues.map((obj, index) => (
              <Box key={obj.id ?? index}>
                {form_default_input_types.includes(obj.type) && (
                  <FormTextField
                    name={`cf_values.${index}.value`}
                    control={control}
                    label={obj.name}
                    type={obj.type === "number" ? "number" : "text"}
                    placeholder={`Enter ${obj.name}`}
                    fullWidth
                  />
                )}
                {obj.type === form_date_type && (
                  <FormDatePicker
                    name={`cf_values.${index}.value`}
                    control={control}
                    label={obj.name}
                  />
                )}
              </Box>
            ))}
          </FormSection>
        )}

        {/* ── Locations ─────────────────────────────────────── */}
        {entityLocationDetails && entityLocationDetails.length > 0 && (
          <FormSection title="Locations">
            <Stack spacing={1}>
              {entityLocationDetails.map((location, index) => (
                <Paper
                  key={location.id ?? index}
                  variant="outlined"
                  sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}
                >
                  <Avatar
                    variant="rounded"
                    src={location.image_url || no_image}
                    alt="loc"
                    sx={{ width: 48, height: 48 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {location.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div" noWrap>
                      {location.accurate_address}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Radius: {location.radius_range} m
                    </Typography>
                  </Box>
                  <Tooltip title="Edit location">
                    <IconButton
                      data-testid={testId("branch-edit", itemTestKey(location), "button")}
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
          </FormSection>
        )}
      </SidebarFormLayout>

      {/* ── Location Modal ───────────────────────────────────────── */}
      <Modal data-testid="branch-add-new-location-dialog" isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader close={<ModalCloseButton onClick={() => setModalOpen(false)} testId="branch-add-new-location-close-button" />} toggle={() => setModalOpen(false)}>
          {branchLocationObj.id === 0
            ? "Add New Location"
            : "Edit Location"}
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col xl={12} lg={12}>
              <Form onSubmit={LocationFormikForm.handleSubmit} noValidate>
                <Row className="gy-4">
                  {/* Location Name */}
                  <Col lg={12}>
                    <Label htmlFor="loc_name" className="form-label">
                      Location Name <span>*</span>
                    </Label>
                    <div className="form-icon right">
                      <Input
                        data-testid="branch-add-new-location-name-input"
                        type="text"
                        className="form-control form-control-icon"
                        id="loc_name"
                        name="name"
                        placeholder="Enter Name"
                        value={lv.name || ""}
                        onChange={(ev) => {
                          const val = ev.target.value
                            .replace(/^\s+/, "") // remove leading spaces
                            .replace(/[^A-Za-z0-9.,&()'\-\s]/g, "");
                          LocationFormikForm.setFieldValue("name", val, true);
                          LocationFormikForm.setFieldTouched("name", true, false);
                        }}
                        onBlur={() =>
                          LocationFormikForm.setFieldTouched("name", true)
                        }
                        invalid={isLocInvalid("name")}
                      />
                      {!isLocInvalid("name") && (
                        <i className="ri-building-2-line" />
                      )}
                      {isLocInvalid("name") && (
                        <FormFeedback data-testid="branch-add-new-location-name-error" type="invalid">
                          {le.name}
                        </FormFeedback>
                      )}
                    </div>
                    {showLocHint("name") && (
                      <div className="form-text">
                        Enter location name.
                      </div>
                    )}
                  </Col>

                  <LocationSearch
                    locationObj={branchLocationObj}
                    setLocationObj={setBranchLocationObj}
                    LocationFormikForm={LocationFormikForm}
                  />

                  {/* Address */}
                  <Col lg={12}>
                    <Label htmlFor="loc_address" className="form-label">
                      Address <span>*</span>
                    </Label>
                    <Input
                      data-testid="branch-add-new-location-address-textarea"
                      type="textarea"
                      className="form-control"
                      id="loc_address"
                      name="address"
                      rows="2"
                      value={lv.address || ""}
                      onChange={(ev) => {
                        const val = ev.target.value
                          .replace(/^\s+/, "")
                          .replace(/[^A-Za-z0-9\s.,\-#/'&]/g, "");

                        LocationFormikForm.setFieldValue("address", val, true);
                        LocationFormikForm.setFieldTouched("address", true, false);
                      }}
                      onBlur={() =>
                        LocationFormikForm.setFieldTouched(
                          "address",
                          true,
                        )
                      }
                      invalid={isLocInvalid("address")}
                    />
                    {isLocInvalid("address") && (
                      <FormFeedback data-testid="branch-add-new-location-address-error" type="invalid">
                        {le.address}
                      </FormFeedback>
                    )}
                    {showLocHint("address") && (
                      <div className="form-text">Address.</div>
                    )}
                  </Col>

                  {/* Country */}
                  <Col lg={12}>
                    <Label htmlFor="loc_country" className="form-label">
                      Country <span>*</span>
                    </Label>
                    <Select
                      testId="branch-add-new-location-loc-country"
                      id="loc_country"
                      options={COUNTRY_OPTIONS}
                      value={
                        COUNTRY_OPTIONS.find(
                          (d) => d.value === lv.country,
                        ) || null
                      }
                      onChange={handleLocationCountryChange}
                      onBlur={() =>
                        LocationFormikForm.setFieldTouched(
                          "country",
                          true,
                        )
                      }
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderColor:
                            !state.isFocused && lt.country && le.country
                              ? "red"
                              : provided.borderColor,
                        }),
                      }}
                    />
                    {lt.country && le.country && (
                      <div className="lc_form_error_text">
                        {le.country}
                      </div>
                    )}
                    {showLocHint("country") && (
                      <div className="form-text">Select country.</div>
                    )}
                  </Col>

                  {/* State */}
                  <Col lg={12}>
                    <Label className="form-label">
                      State <span>*</span>
                    </Label>
                    <Select
                      testId="branch-add-new-location-state"
                      options={locationStateOptions}
                      value={
                        locationStateOptions.find(
                          (d) => d.value === lv.state,
                        ) || null
                      }
                      onChange={(opt) => {
                        setLocField("state", opt?.value || "");
                        LocationFormikForm.setFieldTouched("state", true);
                      }}
                      onBlur={() =>
                        LocationFormikForm.setFieldTouched("state", true)
                      }
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderColor:
                            !state.isFocused && lt.state && le.state
                              ? "red"
                              : provided.borderColor,
                        }),
                      }}
                    />
                    {lt.state && le.state && (
                      <div className="lc_form_error_text">{le.state}</div>
                    )}
                    {showLocHint("state") && (
                      <div className="form-text">Select state.</div>
                    )}
                  </Col>

                  {/* City */}
                  <Col lg={12}>
                    <Label htmlFor="loc_city" className="form-label">
                      City <span>*</span>
                    </Label>
                    <div className="form-icon right">
                      <Input
                        type="text"
                        className="form-control form-control-icon"
                        id="loc_city"
                        name="city"
                        placeholder="City"
                        value={lv.city || ""}
                        onChange={(ev) => {
                          const val = ev.target.value
                            .replace(/^\s+/, "") // remove leading spaces
                            .replace(/[^A-Za-z\s.'-]/g, "")
                          LocationFormikForm.setFieldValue("city", val, true);
                          LocationFormikForm.setFieldTouched("city", true, false);
                        }}
                        onBlur={() =>
                          LocationFormikForm.setFieldTouched("city", true)
                        }
                        invalid={isLocInvalid("city")}
                      />
                      {!isLocInvalid("city") && (
                        <i className="ri-map-pin-line" />
                      )}
                      {isLocInvalid("city") && (
                        <FormFeedback data-testid="branch-add-new-location-state-error" type="invalid">
                          {le.city}
                        </FormFeedback>
                      )}
                    </div>
                    {showLocHint("city") && (
                      <div className="form-text">
                        Enter city (letters, spaces, . - and ' allowed).
                      </div>
                    )}
                  </Col>

                  {/* Pincode */}
                  <Col lg={12}>
                    <Label htmlFor="loc_pincode" className="form-label">
                      Pincode <span>*</span>
                    </Label>
                    <div className="form-icon right">
                      <Input
                        data-testid="branch-add-new-location-pincode-input"
                        type="text"
                        className="form-control form-control-icon"
                        id="loc_pincode"
                        name="pincode"
                        placeholder="600001"
                        inputMode="numeric"
                        value={lv.pincode || ""}
                        onChange={(ev) => {
                          const val = ev.target.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, 6);

                          setLocField("pincode", val);
                        }}
                        onBlur={() =>
                          LocationFormikForm.setFieldTouched(
                            "pincode",
                            true,
                          )
                        }
                        invalid={isLocInvalid("pincode")}
                      />
                      {!isLocInvalid("pincode") && (
                        <i className="ri-map-2-line" />
                      )}
                      {isLocInvalid("pincode") && (
                        <FormFeedback data-testid="branch-add-new-location-pincode-error" type="invalid">
                          {le.pincode}
                        </FormFeedback>
                      )}
                    </div>
                    {showLocHint("pincode") && (
                      <div className="form-text">
                        Enter pincode (digits only).
                      </div>
                    )}
                  </Col>

                  {/* Image */}
                  <Col lg={12}>
                    <Label htmlFor="loc_image" className="form-label">
                      Image
                    </Label>
                    <div className="form-icon right">
                      <Input
                        data-testid="branch-add-new-location-image-file-input"
                        type="file"
                        name="image"
                        id="loc_image"
                        className="form-control"
                        placeholder="Choose Image"
                        onChange={handleLocationImageUpdate}
                      />
                      <i className="ri-image-line" />
                    </div>
                    {lv.image_url && (
                      <img
                        src={lv.image_url}
                        alt="preview"
                        style={{
                          height: "60px",
                          marginTop: "8px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div className="form-text">Choose image.</div>
                  </Col>

                  {/* Time Zone */}
                  <Col lg={12}>
                    <Label htmlFor="loc_timezone" className="form-label">
                      Time Zone <span>*</span>
                    </Label>
                    <Select
                      testId="branch-add-new-location-timezone"
                      name="timezone"
                      id="loc_timezone"
                      options={timzone_options}
                      placeholder="Select a time zone"
                      value={
                        lv.timezone
                          ? timzone_options.find(
                              (opt) => opt.value === lv.timezone,
                            )
                          : null
                      }
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderColor:
                            !state.isFocused && lt.timezone && le.timezone
                              ? "red"
                              : provided.borderColor,
                        }),
                      }}
                      onChange={(opt) =>
                        setLocField("timezone", opt.value)
                      }
                      onBlur={() =>
                        LocationFormikForm.setFieldTouched(
                          "timezone",
                          true,
                        )
                      }
                    />
                    {lt.timezone && le.timezone && (
                      <div className="lc_form_error_text">
                        {le.timezone}
                      </div>
                    )}
                    {showLocHint("timezone") && (
                      <div className="form-text">Select time zone.</div>
                    )}
                  </Col>

                  <Col className="text-end">
                    <RsButton
                      color="success"
                      type="submit"
                      className="btn-label"
                    >
                      <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                      Save
                    </RsButton>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter />
      </Modal>
    </React.Fragment>
  );
};

export default BranchForm;
