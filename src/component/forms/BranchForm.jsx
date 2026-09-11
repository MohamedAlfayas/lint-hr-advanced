import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
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
import Select from "react-select";
import {
  form_default_input_types,
  timzone_options,
  form_date_type,
  DateFormat,
} from "../../common/constant/Constants";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../common/js/ConvertDateFormat";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DatePicker } from "antd";
dayjs.extend(customParseFormat);
import { useFormik } from "formik";
import * as Yup from "yup";

import CountryList from "../../common/data/CountryList";
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


const resolveFlag = (countryObj) => {
  if (!countryObj) return null;

  const direct =
    countryObj.flag ||
    countryObj.flag_url ||
    countryObj.flagUrl ||
    countryObj.flagImage ||
    countryObj.countryFlagImageUrl ||
    countryObj.emoji;
  if (direct) return { type: "src", value: direct };

  const iso2 =
    countryObj.iso2 || countryObj.alpha2 || countryObj.code;
  if (iso2 && iso2.length === 2) {
    return {
      type: "src",
      value: `https://flagcdn.com/24x18/${iso2.toLowerCase()}.png`,
    };
  }

  return null;
};
const BranchForm = () => {
  const dispatch = useDispatch();
  const inputRef = useRef();
  const fieldRefs = useRef({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  // ── Country / State options ──────────────────────────────────────────────
  const [CountryListOptions, setCountryListOptions] = useState([]);
  const [branchStateOptions, setBranchStateOptions] = useState([]);
  const [locationStateOptions, setLocationStateOptions] = useState([]);

  // ── Modal ────────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [ptSettingsOptions, setPtSettingsOptions] = useState([]);

  // ── Submit-only required errors; instant max-length / format warnings ────
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [liveTouched, setLiveTouched] = useState({
    pincode: false,
    contact_number: false,
    contact_email: false,
  });
  const [lengthWarnings, setLengthWarnings] = useState({
    name: "",
    address: "",
    city: "",
    contact_email: "",
    about: "",
  });

  const MAX_LENGTHS = {
    name: 100,
    address: 250,
    city: 100,
    contact_email: 100,
    about: 2000,
  };

  const FIELD_LABELS = {
    name: "Branch Name",
    address: "Address",
    city: "City",
    contact_email: "Email",
    about: "Company Overview",
  };

  const LIVE_FORMAT_FIELDS = ["pincode", "contact_number", "contact_email"];

  const checkMaxLength = (field, rawValue) => {
    const max = MAX_LENGTHS[field];
    if (!max) return;
    const msg =
      rawValue.length > max
        ? `${FIELD_LABELS[field] || field} must not exceed ${max} characters`
        : "";
    setLengthWarnings((prev) => ({ ...prev, [field]: msg }));
  };

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
    const country_list = CountryList.filter((c) => c.show === true).map(
      (d) => ({
        ...d,
        label: d.countryName,
        value: d.countryName,
      }),
    );
    setCountryListOptions(country_list);
  }, []);

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

  // ── Branch Formik ────────────────────────────────────────────────────────
  const FormikForm = useFormik({
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    initialValues: {
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
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .matches(
          /^[A-Za-z0-9.,&()'\-\s]+$/,
          "Branch Name can contain only letters, numbers, spaces, and . , - & ( ) '"
        )
        .required("Please Enter Branch Name")
        .min(1, "Branch Name must be at least 1 character")
        .max(100, "Branch Name must not exceed 100 characters"),
      country: Yup.string().required("Please select country"),
      state: Yup.string().required("Please select state"),
      address: Yup.string()
        .trim()
        .required("Please enter address")
        .matches(
          /^[A-Za-z0-9\s.,\-#/'&]+$/,
          "Address can contain only letters, numbers, spaces, and . , - # / ' &"
        )
        .max(250, "Address must not exceed 250 characters"),
      city: Yup.string()
        .trim()
        .required("Please enter city")
        .matches(
          /^[A-Za-z\s.'-]+$/,
          "City can contain only letters, spaces, . - and '"
        )
        .min(1, "City must be at least 1 character")
        .max(100, "City must not exceed 100 characters"),
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
        .max(2000, "Company Overview must not exceed 2000 characters"),

      contact_email: Yup.string()
        .trim()
        .required("Please enter email")
        .transform((value) => (value ? value.trim().toLowerCase() : value))
        .max(100, "Email must not exceed 100 characters")
        .matches(
          /^[a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,13}$/,
          "Enter a valid email address.",
        ),
    }),
    onSubmit: async (values) => {
      dispatch(setLoaderVisible(true));

      const updatedObject = Object.fromEntries(
        Object.entries(values).filter(
          ([key]) => key !== "entity_location_details",
        ),
      );

      const ApiRes = await PostApi("branch/add-new/", updatedObject, false);
      dispatch(setLoaderVisible(false));

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
    },
  });

  const setFieldAndMaybeValidate = (name, value, forceValidate = false) => {
    const shouldValidate =
      forceValidate ||
      hasAttemptedSubmit ||
      LIVE_FORMAT_FIELDS.includes(name);
    FormikForm.setFieldValue(name, value, shouldValidate);
  };

  // ── Load form_obj into Formik when sidebar opens ─────────────────────────
  useEffect(() => {
    if (form_obj && Object.keys(form_obj).length) {
      Object.entries(form_obj).forEach(([key, val]) => {
        FormikForm.setFieldValue(key, val ?? "", false);
      });

      if (form_obj?.country) {
        const found = CountryList.find(
          (d) => d.countryName === form_obj.country,
        );
        setBranchStateOptions(found?.states || []);
        if (!form_obj.country_code && found?.countryCode) {
          FormikForm.setFieldValue("country_code", found.countryCode, false);
        }
      }
      setHasAttemptedSubmit(false);
      setLiveTouched({
        pincode: false,
        contact_number: false,
        contact_email: false,
      });
      setLengthWarnings({
        name: "",
        address: "",
        city: "",
        contact_email: "",
        about: "",
      });
    }
  }, [form_obj]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const setField = (name, value, forceValidate = false) =>
    setFieldAndMaybeValidate(name, value, forceValidate);

  const markLiveTouched = (field) => {
    setLiveTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleNumberOnly = (e, field) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (field === "pincode") val = val.slice(0, 6);
    if (field === "contact_number") val = val.slice(0, 10);
    markLiveTouched(field);
    setField(field, val, true);
  };

  const handleTextOnly = (e) => {
    const { name, value } = e.target;

    FormikForm.setFieldValue(name, value.replace(/[^a-zA-Z\s]/g, ""), false);
  };

  const handleCityChange = (e) => {
    const value = e.target.value
      .replace(/^\s+/, "") // remove leading spaces
      .replace(/[^A-Za-z\s.'-]/g, "");

    setField("city", value);
    checkMaxLength("city", value);
  };

  const handleBranchNameChange = (e) => {
    const value = e.target.value
      .replace(/^[ ]+/g, "") // remove leading spaces
      .replace(/[^A-Za-z0-9.,&()'|\-\s]/g, "");

    setField("name", value);
    checkMaxLength("name", value);
  };

  // const handleBranchCountryChange = (e) => {
  //   setField("country", e?.value || "");
  //   setField("state", "");
  //   const found = CountryList.find((d) => d.countryName === e?.value);
  //   setBranchStateOptions(found?.states || []);
  // };

  const handleBranchCountryChange = (e) => {
    const country = e?.value || "";
    const country_code = e?.countryCode || "";

    FormikForm.setValues(
      { ...FormikForm.values, country , country_code, state: "" },
      hasAttemptedSubmit || false // only force-validate if user already tried to submit
    );

    const found = CountryList.find((d) => d.countryName === country);
    setBranchStateOptions(found?.states || []);
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

  // ── Auto-focus first error (EmployeeForm pattern) ────────────────────────
  const focusFirstErrorField = (errors) => {
    if (!errors || !Object.keys(errors).length) return;

    let firstErrorField = Object.keys(errors)[0];

    // Country code is read-only / auto-filled — focus Country select instead
    if (firstErrorField === "country_code") {
      firstErrorField = "country";
    }

    FormikForm.setFieldTouched(firstErrorField, true, false);

    requestAnimationFrame(() => {
      const node = fieldRefs.current[firstErrorField];
      if (!node) return;

      node.scrollIntoView({ behavior: "smooth", block: "center" });

      const focusable = node.querySelector(
        "input:not([type='hidden']), textarea, select",
      );
      if (focusable) {
        focusable.focus();
        return;
      }

      // react-select fallback
      const rsInput = node.querySelector("input");
      rsInput?.focus();
    });
  };

  const v = FormikForm.values;
  const e = FormikForm.errors;

  // Required messages only after Save; format errors instant for live fields
  const showFieldError = (field) => {
    if (!e[field]) return false;
    if (hasAttemptedSubmit) return true;
    if (!LIVE_FORMAT_FIELDS.includes(field) || !liveTouched[field]) return false;
    const value = String(v[field] ?? "").trim();
    if (!value) return false; // empty → wait for Save for "Please enter…"
    return true;
  };

  const isInvalid = (field) =>
    showFieldError(field) || !!lengthWarnings[field];

  // Single message slot (hint OR error) — avoids FormFeedback padding expanding gaps
  const renderFieldHelp = (field, hint) => {
    const errorText =
      lengthWarnings[field] || (showFieldError(field) ? e[field] : "");
    if (errorText) {
      return <div className="lc_form_error_text">{errorText}</div>;
    }
    return <div className="form-text">{hint}</div>;
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
        ...(v.entity_location_details || []),
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
          newLocationDetails = [...(v.entity_location_details || []), response];
        } else {
          newLocationDetails = existing_entity_location_details.map((d) =>
            d.id === response.id ? response : d,
          );
        }

        setField("entity_location_details", newLocationDetails);

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

  // const handleLocationCountryChange = (e) => {
  //   setLocField("country", e?.value || "");
  //   setLocField("state", "");
  //   const found = CountryList.find((d) => d.countryName === e?.value);
  //   setLocationStateOptions(found?.states || []);
  // };

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
    setBranchLocationObj({ ...initialBranchLocationObj, type_id: v.id });
    LocationFormikForm.resetForm();
    setModalOpen(true);
  };

  const handleEditLocation = (location) => {
    setBranchLocationObj({ ...location, type_id: v.id, type: "branch" });
    setModalOpen(true);
    if (location?.country) {
      const found = CountryList.find((d) => d.countryName === location.country);
      setLocationStateOptions(found?.states || []);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl={12} lg={12}>
          <div>
            <Form
              onSubmit={async (ev) => {
                ev.preventDefault();
                setHasAttemptedSubmit(true);

                const touchedFields = {};
                Object.keys(FormikForm.initialValues).forEach((key) => {
                  touchedFields[key] = true;
                });
                FormikForm.setTouched(touchedFields, false);

                const errors = await FormikForm.validateForm();
                if (Object.keys(errors).length > 0) {
                  focusFirstErrorField(errors);
                  return;
                }

                FormikForm.handleSubmit();
              }}
              noValidate
            >
              <div className="live-preview">
                <Row className="gy-4">
                  {/* ── Branch Name ───────────────────────────────────── */}
                  <Col lg={12}>
                    <div ref={(el) => (fieldRefs.current.name = el)}>
                      <Label htmlFor="name" className="form-label">
                        Branch Name <span>*</span>
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          className="form-control form-control-icon"
                          id="name"
                          name="name"
                          innerRef={inputRef}
                          placeholder="New Branch"
                          value={v.name || ""}
                          onChange={handleBranchNameChange}
                          invalid={isInvalid("name")}
                        />
                        {!isInvalid("name") && (
                          <i className="ri-building-2-line" />
                        )}
                      </div>
                      {renderFieldHelp("name", "Enter your branch name.")}
                    </div>
                  </Col>

                  {/* ── Country ───────────────────────────────────────── */}
                  <Col lg={12}>
                    <div ref={(el) => (fieldRefs.current.country = el)}>
                      <Label htmlFor="country" className="form-label">
                        Country <span>*</span>
                      </Label>
                      <Select
                        id="country"
                        name="country"
                        options={CountryListOptions}
                        value={
                          CountryListOptions.find(
                            (d) => d.value === v.country,
                          ) || null
                        }
                        onChange={handleBranchCountryChange}
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderColor:
                              !state.isFocused && isInvalid("country")
                                ? "red"
                                : provided.borderColor,
                          }),
                        }}
                      />
                      {renderFieldHelp("country", "Select country.")}
                    </div>
                  </Col>

                  {/* ── State ─────────────────────────────────────────── */}
                  <Col lg={12}>
                    <div ref={(el) => (fieldRefs.current.state = el)}>
                      <Label className="form-label">
                        State <span>*</span>
                      </Label>
                      <Select
                        name="state"
                        options={branchStateOptions}
                        value={
                          branchStateOptions.find((d) => d.value === v.state) ||
                          null
                        }
                        onChange={(opt) => {
                          setField("state", opt?.value || "");
                        }}
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderColor:
                              !state.isFocused && isInvalid("state")
                                ? "red"
                                : provided.borderColor,
                          }),
                        }}
                      />
                      {renderFieldHelp("state", "Select state.")}
                    </div>
                  </Col>

                  <Col lg={12}>
                    <Label className="form-label">
                      Professional Tax Settings
                    </Label>
                    <Select
                      options={ptSettingsOptions}
                      value={
                        ptSettingsOptions.find(
                          (d) => d.value === v.pt_settings,
                        ) || null
                      }
                      onChange={(opt) =>
                        setField("pt_settings", opt?.value || null)
                      }
                      isClearable
                    />
                    <div className="form-text">
                      Links PT slab rules to this branch.
                    </div>
                  </Col>

                  {/* ── Address ───────────────────────────────────────── */}
                  <Col lg={12}>
                    <div ref={(el) => (fieldRefs.current.address = el)}>
                      <Label htmlFor="address" className="form-label">
                        Address <span>*</span>
                      </Label>
                      <Input
                        type="textarea"
                        className="form-control"
                        id="address"
                        name="address"
                        rows="2"
                        value={v.address || ""}
                        onChange={(ev) => {
                          const value = ev.target.value
                            .replace(/^\s+/, "")
                            .replace(/[^A-Za-z0-9\s.,\-#/'&]/g, "");

                          setField("address", value);
                          checkMaxLength("address", value);
                        }}
                        invalid={isInvalid("address")}
                      />
                      {renderFieldHelp("address", "Enter address.")}
                    </div>
                  </Col>

                  {/* ── City ──────────────────────────────────────────── */}
                  <Col lg={12}>
                    <div ref={(el) => (fieldRefs.current.city = el)}>
                      <Label htmlFor="city" className="form-label">
                        City <span>*</span>
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          className="form-control form-control-icon"
                          id="city"
                          name="city"
                          placeholder="City"
                          value={v.city || ""}
                          onChange={handleCityChange}
                          invalid={isInvalid("city")}
                        />
                        {!isInvalid("city") && (
                          <i className="ri-map-pin-line" />
                        )}
                      </div>
                      {renderFieldHelp("city", "Enter city (letters only).")}
                    </div>
                  </Col>

                  {/* ── Pincode ───────────────────────────────────────── */}
                  <Col lg={12}>
                    <div ref={(el) => (fieldRefs.current.pincode = el)}>
                      <Label htmlFor="pincode" className="form-label">
                        Pincode <span>*</span>
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          className="form-control form-control-icon"
                          id="pincode"
                          name="pincode"
                          placeholder="600001"
                          inputMode="numeric"
                          value={v.pincode || ""}
                          maxLength={6}
                          onChange={(ev) => handleNumberOnly(ev, "pincode")}
                          invalid={isInvalid("pincode")}
                        />
                        {!isInvalid("pincode") && (
                          <i className="ri-map-2-line" />
                        )}
                      </div>
                      {renderFieldHelp(
                        "pincode",
                        "Enter pincode (digits only).",
                      )}
                    </div>
                  </Col>

                  {/* ── Country Code / Contact Number ── */}
                  <Col lg={12}>
                    <Row>
                      <Col md={4}>
                        <div
                          ref={(el) => (fieldRefs.current.country_code = el)}
                        >
                          <Label
                            htmlFor="country_code"
                            className="form-label"
                          >
                            Country Code <span>*</span>
                          </Label>
                          <Input
                            type="text"
                            name="country_code"
                            id="country_code"
                            className="form-control"
                            placeholder="e.g. +91"
                            value={v.country_code || ""}
                            readOnly
                            invalid={isInvalid("country_code")}
                          />
                          {renderFieldHelp(
                            "country_code",
                            "Auto-filled based on selected country.",
                          )}
                        </div>
                      </Col>
                      <Col md={8}>
                        <div
                          ref={(el) =>
                            (fieldRefs.current.contact_number = el)
                          }
                        >
                          <Label
                            htmlFor="contact_number"
                            className="form-label"
                          >
                            Contact Number <span>*</span>
                          </Label>
                          <Input
                            type="text"
                            name="contact_number"
                            id="contact_number"
                            className="form-control"
                            placeholder="9876543210"
                            inputMode="numeric"
                            value={v.contact_number || ""}
                            maxLength={10}
                            onChange={(ev) =>
                              handleNumberOnly(ev, "contact_number")
                            }
                            invalid={isInvalid("contact_number")}
                          />
                          {renderFieldHelp(
                            "contact_number",
                            "Enter 10 digits only.",
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Col>

                  {/* ── Contact Email ─────────────────────────────────── */}
                  <Col lg={12}>
                    <div ref={(el) => (fieldRefs.current.contact_email = el)}>
                      <Label htmlFor="contact_email" className="form-label">
                        Contact Email <span>*</span>
                      </Label>
                      <div className="form-icon right">
                        <Input
                          name="contact_email"
                          className="form-control form-control-icon"
                          id="contact_email"
                          placeholder="user@company.com"
                          value={v.contact_email || ""}
                          onChange={(ev) => {
                            const val = ev.target.value;
                            markLiveTouched("contact_email");
                            setField("contact_email", val, true);
                            checkMaxLength("contact_email", val);
                          }}
                          onBlur={(ev) => {
                            const value = ev.target.value
                              .trim()
                              .toLowerCase();
                            setField("contact_email", value, true);
                            if (value !== "") {
                              markLiveTouched("contact_email");
                            }
                          }}
                          invalid={isInvalid("contact_email")}
                        />
                        {!isInvalid("contact_email") && (
                          <i className="ri-mail-line" />
                        )}
                      </div>
                      {renderFieldHelp(
                        "contact_email",
                        "Enter contact email.",
                      )}
                    </div>
                  </Col>

                  {/* ── About ─────────────────────────────────────────── */}
                  <Col lg={12}>
                    <div ref={(el) => (fieldRefs.current.about = el)}>
                      <Label htmlFor="about" className="form-label">
                        Company Overview
                      </Label>
                      <Input
                        type="textarea"
                        className="form-control"
                        id="about"
                        name="about"
                        rows="3"
                        value={v.about || ""}
                        onChange={(ev) => {
                          const value = ev.target.value
                            .replace(/^\s+/, "")
                            .replace(
                              /[^a-zA-Z0-9\s\n.,!?'"\-_()&:;/]/g,
                              "",
                            );

                          setField("about", value);
                          checkMaxLength("about", value);
                        }}
                        invalid={isInvalid("about")}
                      />
                      {renderFieldHelp("about", "Company overview.")}
                    </div>
                  </Col>

                  {/* ── Custom Fields ─────────────────────────────────── */}
                  {v.cf_values && v.cf_values.length
                    ? v.cf_values.map((obj) => (
                        <Col lg={12} key={obj.id}>
                          <div
                            ref={(el) =>
                              (fieldRefs.current[obj.input_name] = el)
                            }
                          >
                          <Label
                            htmlFor={obj.input_name}
                            className="form-label"
                          >
                            {obj.name}
                          </Label>
                          {form_default_input_types.includes(obj.type) && (
                            <Input
                              type={obj.type || "text"}
                              name={obj.input_name}
                              id={obj.input_name}
                              className="form-control"
                              placeholder={`Enter ${obj.name}`}
                              value={obj.value || ""}
                              onChange={(ev) => handleCFInputChange(ev, obj.id)}
                            />
                          )}
                          {obj.type === form_date_type && (
                            <DatePicker
                              name={obj.input_name}
                              id={obj.input_name}
                              className="form-control"
                              format={DateFormat}
                              value={
                                obj.value === ""
                                  ? null
                                  : dayjs(
                                      ConvertDateFormat(obj.value),
                                      DateFormat,
                                    )
                              }
                              allowClear={false}
                              onChange={(ev, dateStr) =>
                                handleCFDateChange(ev, dateStr, obj.id)
                              }
                            />
                          )}
                          <div className="form-text">Enter {obj.name}</div>
                          </div>
                        </Col>
                      ))
                    : null}

                  {/* ── Location Table ────────────────────────────────── */}
                  {v.entity_location_details &&
                    v.entity_location_details.length > 0 && (
                      <Col>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Address</th>
                              <th>Radius</th>
                              <th>Image</th>
                              <th>Edit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {v.entity_location_details.map(
                              (location, index) => (
                                <tr key={index}>
                                  <td>{location.name}</td>
                                  <td>{location.accurate_address}</td>
                                  <td>{location.radius_range} m</td>
                                  <td>
                                    <img
                                      src={location.image_url || no_image}
                                      style={{
                                        height: "50px",
                                        objectFit: "cover",
                                      }}
                                      alt="loc"
                                    />
                                  </td>
                                  <td>
                                    <a
                                      onClick={() =>
                                        handleEditLocation(location)
                                      }
                                      className="text-primary d-inline-block edit-item-btn ms-2"
                                      href="javascript:void(0)"
                                    >
                                      <i className="ri-pencil-fill fs-16"></i>
                                    </a>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </Col>
                    )}

                  {/* ── Footer Buttons ────────────────────────────────── */}
                  <Row>
                    <Col>
                      <Row className="mt-4" style={{ height: "50px" }}>
                        <Col lg={6} className="text-start">
                          {v.id !== 0 && (
                            <Button
                              color="primary"
                              type="button"
                              onClick={handleAddClick}
                            >
                              Add Location <i className="ri-map-pin-line"></i>
                            </Button>
                          )}
                        </Col>
                        <Col lg={6} className="text-end">
                          <Button
                            color="success"
                            type="submit"
                            className="btn-label"
                          >
                            <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                            Save
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Row>
              </div>
            </Form>

            {/* ── Location Modal ───────────────────────────────────────── */}
            <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
              <ModalHeader toggle={() => setModalOpen(false)}>
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
                                // setLocField("name", val);
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
                              <FormFeedback type="invalid">
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
                            <FormFeedback type="invalid">
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
                            id="loc_country"
                            options={CountryListOptions}
                            value={
                              CountryListOptions.find(
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
                                // setLocField("city", val);
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
                              <FormFeedback type="invalid">
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
                              <FormFeedback type="invalid">
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
                          <Button
                            color="success"
                            type="submit"
                            className="btn-label"
                          >
                            <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                            Save
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Col>
                </Row>
              </ModalBody>
              <ModalFooter />
            </Modal>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default BranchForm;
