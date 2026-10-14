import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocationCityRoundedIcon from "@mui/icons-material/LocationCityRounded";
import PinDropRoundedIcon from "@mui/icons-material/PinDropRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import FormSection from "../../shared/ui/form/FormSection";
import {
  form_default_input_types,
  timzone_options,
  form_date_type,
  DateFormat,
  organization_component_name,
} from "../../common/constant/Constants";
import { UPDATE_COMPANY_PROFILE_ACCESS_KEY } from "../../common/constant/RoleConstants";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../common/js/ConvertDateFormat";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useFormik } from "formik";
import * as Yup from "yup";
import CountryList, { countriesWithStates } from "../../common/data/CountryList";
import Dropzone from "react-dropzone";
import { Api } from "../../common/api/Api";
import { toast } from "react-toastify";
import { GetCustomField } from "../../common/js/GetCustomField";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { useDispatch } from "react-redux";
import { PostApi } from "../../common/api/PostApi";
import { setCompanyDetail } from "../../redux/reducers/ChildReducer/CompanyReducer";
import { CheckRoleAccess } from "../../common/js/CheckRoleAccess";

dayjs.extend(customParseFormat);

const allowedTlds = [
  // gTLDs
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
  "co",

  // ccTLDs
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

  // Max length
  if (website.length > 500) {
    return false;
  }

  // Reject unsupported protocols
  if (/^(ftp|smtp):\/\//i.test(website)) {
    return false;
  }

  // Reject spaces
  if (/\s/.test(website)) {
    return false;
  }
    // Reject dangerous chars
  if (/[<>"'\\;]/.test(website)) {
    return false;
  }

  // Reject consecutive dots
  if (website.includes("..")) {
    return false;
  }

  if (/^(w|ww)\./i.test(website)) {
    return false;
  }

  
  const regex =
    /^(https?:\/\/)?(([a-z0-9]+(-[a-z0-9]+)*)\.)+[a-z]{2,}(:\d{1,5})?(\/[a-z0-9\-._~%!$&'()*+,;=:@/]*)?(\?[a-z0-9\-._~%!$&'()*+,;=:@/?]*)?(#[a-z0-9\-._~%!$&'()*+,;=:@/?]*)?$/i;
  // return regex.test(website);
  if (!regex.test(website)) {
    return false;
  }

  // Remove protocol and port
  const hostname = website
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0]
    .split("?")[0]
    .split("#")[0];

  const parts = hostname.split(".");

  // Handle domains like company.co.in
  const lastTwo = parts.slice(-2).join(".");
  const lastOne = parts[parts.length - 1];

  const valid =
    allowedTlds.includes(lastOne) ||
    ["co.in", "gov.in", "edu.in"].includes(lastTwo);

  return valid;
};

const OrgInfoTab = () => {
  const [stateListOptions, setStateListOptions] = useState([]);
  const [darkLogoFile, setDarkLogoFile] = useState(null);
  const [lightLogoFile, setLightLogoFile] = useState(null);
  const [showUpdateBtn, setShowUpdateBtn] = useState(false);
  // Without update access the whole form is view-only.
  const readOnly = !showUpdateBtn;
  const dispatch = useDispatch();
  const inputRef = useRef();

  const CountryListOptions = countriesWithStates.map(
    (d) => ({
      ...d,
      label: d.countryName,
      value: d.countryName,
    }),
  );

  const CountryCodeListOptions = CountryList.filter((c) => c.countryCode).map(
    (d) => ({
      ...d,
      label: d.countryCode,
      value: d.countryCode,
    }),
  );

  const CustomFieldsForThisForm =
    GetCustomField(organization_component_name) || [];

  const initialValues = useMemo(
    () => ({
      id: "0",
      website: "",
      contact_number: "",
      country_code: "+91",
      contact_email: "",
      about: "",
      address: "",
      city: "",
      pincode: "",
      country: "",
      state: "",
      timezone: "",
      show_attendance_timer: true,
      cf_values: CustomFieldsForThisForm || [],
    }),
    [],
  );

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: Yup.object({
      website: Yup.string()
        .trim()
        .required("Please enter website")
        .max(500, "Website URL must not exceed 500 characters")
        .test(
          "website-validation",
          "Enter a valid website URL with a supported domain extension",
          (value) => validateWebsite(value),
        ),
      contact_number: Yup.string()
        .required("Please enter phone number")
        .matches(/^[0-9]+$/, "Phone number must contain digits only")
        .length(10, "Phone number must be 10 digits"),
      contact_email: Yup.string()
        .trim()
        .required("Please enter email")
        .transform((value) => (value ? value.trim().toLowerCase() : value))
        .max(254, "Email must not exceed 254 characters")
        .matches(
          /^[a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/,
          "Enter a valid email address",
        ),
      about: Yup.string().trim().required("Please enter company overview")
        .matches(
          /^[a-zA-Z0-9\s\n.,!?'"\-_()&:;/]+$/,
          "Company overview can contain only letters, numbers, spaces, line breaks, and . , ! ? ' \" - _ ( ) & : ;"
        ),
      address: Yup.string()
        .required("Please enter address")
        .max(300, "Address must not exceed 300 characters")
        .matches(
          /^[a-zA-Z0-9\s.,\-#/'&]+$/,
          "Address can contain only letters, numbers, spaces, and . , - # / ' &"
        ),
      
      country: Yup.string().required("Please select country"),
      state: Yup.string().required("Please select state"),
      city: Yup.string()
        .trim()
        .required("Please enter city")
        .matches(/^[a-zA-Z\s]+$/, "City must contain letters only"),
      pincode: Yup.string()
        .required("Please enter pincode")
        .matches(/^[0-9]+$/, "Pincode must contain digits only")
        .length(6, "Please enter valid 6 digit pincode"),
      timezone: Yup.string().required("Please select time zone"),
    }),
    onSubmit: async (values) => {
      dispatch(setLoaderVisible(true));
      let form_data = new FormData();

      darkLogoFile !== null &&
        form_data.append("dark_logo", darkLogoFile, darkLogoFile.name);
      lightLogoFile !== null &&
        form_data.append("light_logo", lightLogoFile, lightLogoFile.name);

      Object.entries(values).forEach(([key, val]) => {
        if (key === "cf_values") {
          form_data.append(key, JSON.stringify(val));
        } else {
          form_data.append(key, val);
        }
      });

      const ApiRes = await PostApi(
        "/branch/save-company-profile/",
        form_data,
        true,
      );
      dispatch(setLoaderVisible(false));
      if (ApiRes.status && ApiRes.status === 200) {
        toast.success(ApiRes?.data?.message);
        setDarkLogoFile(null);
        setLightLogoFile(null);
        GetCompanyProfileData();
      } else {
        toast.error(ApiRes?.data?.message || ApiRes?.data?.detail);
      }
    },
  });

  useEffect(() => {
    GetCompanyProfileData();
    setShowUpdateBtn(CheckRoleAccess(UPDATE_COMPANY_PROFILE_ACCESS_KEY));
  }, []);

  const GetCompanyProfileData = () => {
    Api({ method: "GET", url: "/branch/get-company-profile/" })
      .then((res) => {
        const response = res?.data?.data;
        if (response && Object.keys(response).length) {
          let thisCFValues = [...(response?.cf_values || [])];
          let cf = thisCFValues.length
            ? CustomFieldsForThisForm.map((obj) => ({
                ...obj,
                value:
                  thisCFValues.find((t) => t.id === obj.id)?.value || obj.value,
              }))
            : CustomFieldsForThisForm;

          const merged = { ...response, cf_values: cf };
          dispatch(setCompanyDetail(merged));

          // ── Set all values into Formik at once ──────────────────────
          Object.entries(merged).forEach(([key, val]) => {
            FormikForm.setFieldValue(key, val ?? "");
          });

          const foundCountry = CountryListOptions.find(
            (d) => d.value === response?.country,
          );
          setStateListOptions(foundCountry?.states || []);
        }
      })
      .catch((err) => console.log(err));
  };

  // ── Helpers ─────────────────────────────────────────────────────────────
  const setField = (name, value) => {
    FormikForm.setFieldValue(name, value);
  };

  const handleNumberOnly = (e, field, maxLength) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, maxLength);
    setField(field, val);
  };

  const handleCountryChange = (e) => {
    setField("country", e.value);
    setField("country_code", e.countryCode);
    setField("state", "");
    setStateListOptions(
      CountryListOptions.find((d) => d.value === e.value)?.states || [],
    );
  };

  const handleCountryCodeChange = (e) => {
    setField("country_code", e.value);
    setField("country", e.countryName);
    setStateListOptions(
      CountryListOptions.find((d) => d.value === e.countryName)?.states || [],
    );
  };

  const handleCFInputChange = (e, cf_id) => {
    const updated = FormikForm.values.cf_values.map((item) =>
      item.id === cf_id ? { ...item, value: e.target.value } : item,
    );
    setField("cf_values", updated);
  };

  const handleCFDateChange = (e, dateStr, cf_id) => {
    const updated = FormikForm.values.cf_values.map((item) =>
      item.id === cf_id
        ? { ...item, value: ConvertISODateFormat(ConvertDateFormat(dateStr)) }
        : item,
    );
    setField("cf_values", updated);
  };

  function handleAcceptedFiles(files, logo_type) {
    const file = files[0];

    if (!file) return;

    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedImageTypes.includes(file.type)) {
      toast.error("Only image files are allowed");
      return;
    }
    // const chosenFile = Object.assign(file[0], {
    //   preview: URL.createObjectURL(file[0]),
    //   formattedSize: formatBytes(file[0].size),
    // });
    const chosenFile = Object.assign(file, {
      preview: URL.createObjectURL(file),
      formattedSize: formatBytes(file.size),
    });
    logo_type === "dark"
      ? setDarkLogoFile(chosenFile)
      : setLightLogoFile(chosenFile);
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  // ── Auto-focus first error field on submit ───────────────────────────────
  useEffect(() => {
    if (
      FormikForm.submitCount > 0 &&
      Object.keys(FormikForm.errors).length > 0
    ) {
      const firstErrorField = Object.keys(FormikForm.errors)[0];
      FormikForm.setFieldTouched(firstErrorField, true, false);
      const errorField = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorField) errorField.focus();
    }
  }, [FormikForm.submitCount]);

  const v = FormikForm.values;
  const e = FormikForm.errors;
  const t = FormikForm.touched;

  const isInvalid = (field) => !!(t[field] && e[field]);
  const showHint = (field) => !e[field];

  const fieldError = (field) => (isInvalid(field) ? e[field] : undefined);
  const touch = (field) => () => FormikForm.setFieldTouched(field, true);
  const logoPreview = lightLogoFile?.preview || v.light_logo_image;

  return (
    <Box component="form" id="company-info-form" onSubmit={FormikForm.handleSubmit} noValidate>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Card sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={logoPreview || undefined}
              alt={v.name || "Company logo"}
              sx={{
                width: 64,
                height: 64,
                flexShrink: 0,
                bgcolor: logoPreview ? "background.paper" : "primary.main",
                border: 1,
                borderColor: "divider",
                "& img": { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" },
              }}
            >
              <BusinessRoundedIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {v.name || "Company Info"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your company profile, contact details and branding
              </Typography>
            </Box>
          </Stack>
          {showUpdateBtn && (
            <Button
              data-testid="organization-header-update-button"
              type="submit"
              variant="contained"
              color="success"
              startIcon={<SaveRoundedIcon />}
              disabled={FormikForm.isSubmitting}
            >
              Update
            </Button>
          )}
        </Stack>
      </Card>

      <Grid container spacing={3}>
        {/* ── Contact ──────────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ p: { xs: 2, md: 3 }, height: "100%" }}>
            <FormSection title="Contact" description="How people reach your company">
              <TextField
                disabled={readOnly}
                label="Company Website"
                required
                fullWidth
                name="website"
                inputRef={inputRef}
                placeholder="www.company.com"
                value={v.website || ""}
                onChange={(ev) =>
                  setField(
                    "website",
                    ev.target.value.toLowerCase().replace(/[^a-z0-9:/?&=._#-]/gi, ""),
                  )
                }
                onBlur={touch("website")}
                error={isInvalid("website")}
                helperText={fieldError("website")}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LanguageRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Autocomplete
                  disabled={readOnly}
                  disableClearable
                  options={CountryCodeListOptions}
                  value={
                    CountryCodeListOptions.find((d) => d.value === v.country_code && d.show) ||
                    CountryCodeListOptions.find((d) => d.value === v.country_code) ||
                    null
                  }
                  getOptionLabel={(o) => o.countryCode || ""}
                  getOptionKey={(o) => o.id}
                  isOptionEqualToValue={(o, val) => o.id === val.id}
                  filterOptions={(opts, { inputValue }) => {
                    const q = inputValue.trim().toLowerCase().replace(/^\+/, "");
                    return opts.filter(
                      (o) =>
                        o.countryCode.replace(/^\+/, "").startsWith(q) ||
                        o.countryName.toLowerCase().startsWith(q),
                    );
                  }}
                  onChange={(_, opt) => opt && handleCountryCodeChange(opt)}
                  renderOption={({ key, ...props }, o) => (
                    <Box component="li" key={o.id} {...props} sx={{ gap: 1 }}>
                      {o.flagImg && (
                        <img src={o.flagImg} alt="" width={20} style={{ borderRadius: 2 }} />
                      )}
                      <span>{o.countryCode}</span>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {o.countryName}
                      </Typography>
                    </Box>
                  )}
                  slotProps={{ popper: { sx: { minWidth: 260 } } }}
                  sx={{ width: 130, flexShrink: 0 }}
                  renderInput={(params) => <TextField {...params} label="Code" />}
                />
                <TextField
                  disabled={readOnly}
                  label="Contact Number"
                  required
                  fullWidth
                  name="contact_number"
                  placeholder="Enter number"
                  value={v.contact_number || ""}
                  onChange={(ev) => handleNumberOnly(ev, "contact_number", 10)}
                  onBlur={touch("contact_number")}
                  error={isInvalid("contact_number")}
                  helperText={fieldError("contact_number")}
                  slotProps={{
                    htmlInput: { inputMode: "numeric", maxLength: 10 },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneRoundedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>

              <TextField
                disabled={readOnly}
                label="Contact Email"
                required
                fullWidth
                type="email"
                name="contact_email"
                placeholder="user@company.com"
                value={v.contact_email || ""}
                onChange={(ev) => setField("contact_email", ev.target.value.trim())}
                onBlur={() => {
                  FormikForm.setFieldTouched("contact_email", true);
                  setField("contact_email", (v.contact_email || "").trim().toLowerCase());
                }}
                error={isInvalid("contact_email")}
                helperText={fieldError("contact_email")}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </FormSection>
          </Card>
        </Grid>

        {/* ── About ────────────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ p: { xs: 2, md: 3 }, height: "100%" }}>
            <FormSection title="About" description="A short description of your company">
              <TextField
                disabled={readOnly}
                label="Company Overview"
                required
                fullWidth
                multiline
                minRows={7}
                name="about"
                value={v.about || ""}
                onChange={(ev) =>
                  setField(
                    "about",
                    ev.target.value
                      .replace(/^\s+/, "")
                      .replace(/[^a-zA-Z0-9\s\n.,!?'"\-_()&:;/]/g, ""),
                  )
                }
                onBlur={touch("about")}
                error={isInvalid("about")}
                helperText={fieldError("about")}
              />
            </FormSection>
          </Card>
        </Grid>

        {/* ── Address & region ─────────────────────────────────────────── */}
        <Grid size={12}>
          <Card sx={{ p: { xs: 2, md: 3 } }}>
            <FormSection title="Address & Region" description="Registered office location and time zone">
              <TextField
                disabled={readOnly}
                label="Address"
                required
                fullWidth
                multiline
                minRows={2}
                name="address"
                value={v.address || ""}
                onChange={(ev) =>
                  setField(
                    "address",
                    ev.target.value.replace(/^\s+/, "").replace(/[^a-zA-Z0-9\s.,\-#/'&]/g, ""),
                  )
                }
                onBlur={touch("address")}
                error={isInvalid("address")}
                helperText={fieldError("address") || `${(v.address || "").length}/300`}
                slotProps={{ htmlInput: { maxLength: 300 } }}
              />

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                  <Autocomplete
                    disabled={readOnly}
                    disableClearable
                    options={CountryListOptions}
                    value={CountryListOptions.find((d) => d.value === v.country) || null}
                    isOptionEqualToValue={(o, val) => o.value === val.value}
                    onChange={(_, opt) => opt && handleCountryChange(opt)}
                    onBlur={touch("country")}
                    renderOption={({ key, ...props }, o) => (
                      <Box component="li" key={o.id} {...props} sx={{ gap: 1 }}>
                        {o.flagImg && (
                          <img src={o.flagImg} alt="" width={20} style={{ borderRadius: 2 }} />
                        )}
                        {o.countryName}
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        disabled={readOnly}
                        {...params}
                        label="Country"
                        required
                        name="country"
                        error={!!(t.country && e.country)}
                        helperText={t.country ? e.country : undefined}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                  <Autocomplete
                    disabled={readOnly}
                    disableClearable
                    options={stateListOptions}
                    value={stateListOptions.find((d) => d.value === v.state) || null}
                    isOptionEqualToValue={(o, val) => o.value === val.value}
                    onChange={(_, opt) => opt && setField("state", opt.value)}
                    onBlur={touch("state")}
                    noOptionsText={v.country ? "No states" : "Select a country first"}
                    renderInput={(params) => (
                      <TextField
                        disabled={readOnly}
                        {...params}
                        label="State"
                        required
                        name="state"
                        error={!!(t.state && e.state)}
                        helperText={t.state ? e.state : undefined}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                  <TextField
                    disabled={readOnly}
                    label="City"
                    required
                    fullWidth
                    name="city"
                    placeholder="Chennai"
                    value={v.city || ""}
                    onChange={(ev) => setField("city", ev.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                    onBlur={touch("city")}
                    error={isInvalid("city")}
                    helperText={fieldError("city")}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationCityRoundedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                  <TextField
                    disabled={readOnly}
                    label="Pincode"
                    required
                    fullWidth
                    name="pincode"
                    placeholder="600001"
                    value={v.pincode || ""}
                    onChange={(ev) => handleNumberOnly(ev, "pincode", 6)}
                    onBlur={touch("pincode")}
                    error={isInvalid("pincode")}
                    helperText={fieldError("pincode")}
                    slotProps={{
                      htmlInput: { inputMode: "numeric", maxLength: 6 },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PinDropRoundedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 12, xl: 8 }}>
                  <Autocomplete
                    disabled={readOnly}
                    disableClearable
                    options={timzone_options}
                    value={timzone_options.find((o) => o.value === v.timezone) || null}
                    isOptionEqualToValue={(o, val) => o.value === val.value}
                    onChange={(_, opt) => opt && setField("timezone", opt.value)}
                    onBlur={touch("timezone")}
                    renderInput={(params) => (
                      <TextField
                        disabled={readOnly}
                        {...params}
                        label="Time Zone"
                        required
                        name="timezone"
                        placeholder="Select a time zone"
                        error={!!(t.timezone && e.timezone)}
                        helperText={t.timezone ? e.timezone : undefined}
                        slotProps={{
                          input: {
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <ScheduleRoundedIcon fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </FormSection>
          </Card>
        </Grid>

        {/* ── Custom fields ────────────────────────────────────────────── */}
        {v.cf_values && v.cf_values.length > 0 && (
          <Grid size={12}>
            <Card sx={{ p: { xs: 2, md: 3 } }}>
              <FormSection title="Additional Details">
                <Grid container spacing={2.5}>
                  {v.cf_values.map((obj) => (
                    <Grid key={obj.id} size={{ xs: 12, md: 6, xl: 4 }}>
                      {obj.type === form_date_type ? (
                        <DatePicker
                          disabled={readOnly}
                          label={obj.name}
                          format={DateFormat}
                          value={obj.value ? dayjs(ConvertDateFormat(obj.value), DateFormat) : null}
                          onChange={(d) =>
                            d?.isValid() && handleCFDateChange(null, d.format(DateFormat), obj.id)
                          }
                          slotProps={{ textField: { fullWidth: true, name: obj.input_name } }}
                        />
                      ) : (
                        form_default_input_types.includes(obj.type) && (
                          <TextField
                            disabled={readOnly}
                            label={obj.name}
                            fullWidth
                            type={obj.type === "number" ? "number" : "text"}
                            name={obj.input_name}
                            placeholder={`Enter ${obj.name}`}
                            value={obj.value || ""}
                            onChange={(ev) => handleCFInputChange(ev, obj.id)}
                          />
                        )
                      )}
                    </Grid>
                  ))}
                </Grid>
              </FormSection>
            </Card>
          </Grid>
        )}

        {/* ── Branding ─────────────────────────────────────────────────── */}
        <Grid size={12}>
          <Card sx={{ p: { xs: 2, md: 3 } }}>
            <FormSection title="Branding" description="Logo shown in the app header and documents">
              <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="stretch">
                <Box
                  sx={{
                    width: { xs: "100%", md: 180 },
                    height: 140,
                    flexShrink: 0,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "action.hover",
                    overflow: "hidden",
                  }}
                >
                  {logoPreview ? (
                    <Box
                      component="img"
                      src={logoPreview}
                      alt="Company logo"
                      sx={{ maxWidth: "85%", maxHeight: "85%", objectFit: "contain" }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No logo
                    </Typography>
                  )}
                </Box>

                <Dropzone
                  disabled={readOnly}
                  multiple={false}
                  accept={{
                    "image/jpeg": [".jpeg", ".jpg"],
                    "image/png": [".png"],
                    "image/webp": [".webp"],
                  }}
                  onDrop={(acceptedFiles, fileRejections) => {
                    if (fileRejections.length > 0) {
                      toast.error("Only image files are allowed");
                      return;
                    }
                    handleAcceptedFiles(acceptedFiles, "light");
                  }}
                >
                  {({ getRootProps, getInputProps, isDragActive }) => (
                    <Box
                      {...getRootProps()}
                      sx={{
                        flex: 1,
                        minHeight: 140,
                        border: "2px dashed",
                        borderColor: isDragActive ? "primary.main" : "divider",
                        borderRadius: 2,
                        bgcolor: readOnly
                          ? "action.disabledBackground"
                          : isDragActive
                            ? "action.selected"
                            : "transparent",
                        opacity: readOnly ? 0.6 : 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                        p: 2,
                        cursor: readOnly ? "not-allowed" : "pointer",
                        textAlign: "center",
                        transition: "border-color .15s, background-color .15s",
                        "&:hover": { borderColor: readOnly ? "divider" : "primary.main" },
                      }}
                      aria-disabled={readOnly}
                    >
                      <input {...getInputProps()} data-testid="organization-logo-file-input" />
                      <CloudUploadOutlinedIcon color={readOnly ? "disabled" : "primary"} sx={{ fontSize: 36 }} />
                      <Typography variant="body2" fontWeight={600}>
                        {readOnly
                          ? "Logo upload is disabled"
                          : lightLogoFile
                            ? lightLogoFile.name
                            : "Drop your logo here or click to upload"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {readOnly
                          ? "You don't have permission to update the company profile"
                          : lightLogoFile
                            ? `${lightLogoFile.formattedSize} · will be saved when you click Update`
                            : "PNG, JPG or WEBP"}
                      </Typography>
                    </Box>
                  )}
                </Dropzone>
              </Stack>
            </FormSection>
          </Card>
        </Grid>
      </Grid>

      {showUpdateBtn && (
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button
            data-testid="organization-logo-update-button"
            type="submit"
            variant="contained"
            color="success"
            size="large"
            startIcon={<SaveRoundedIcon />}
            disabled={FormikForm.isSubmitting}
          >
            Update
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default OrgInfoTab;
