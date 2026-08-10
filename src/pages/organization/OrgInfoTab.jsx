import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormFeedback,
  Input,
  Label,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import Select from "react-select";
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
import { DatePicker } from "antd";
dayjs.extend(customParseFormat);
import { useFormik } from "formik";
import * as Yup from "yup";

import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar7 from "../../assets/images/users/avatar-7.jpg";

import SimpleBar from "simplebar-react";
import CountryList from "../../common/data/CountryList";
import Dropzone from "react-dropzone";
import { Api } from "../../common/api/Api";
import { toast } from "react-toastify";
import { GetCustomField } from "../../common/js/GetCustomField";
import { CountryCodeDisplayInSelect } from "../../common/js/CountryCodeDisplayInSelect";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { useDispatch } from "react-redux";
import { PostApi } from "../../common/api/PostApi";
import { setCompanyDetail } from "../../redux/reducers/ChildReducer/CompanyReducer";
import { CheckRoleAccess } from "../../common/js/CheckRoleAccess";

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
  const dispatch = useDispatch();
  const inputRef = useRef();

  const CountryListOptions = CountryList.filter((c) => c.show === true).map(
    (d) => ({
      ...d,
      label: d.countryName,
      value: d.countryName,
    }),
  );

  const CountryCodeListOptions = CountryList.filter((c) => c.show === true).map(
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

  return (
    <React.Fragment>
      <Row>
        <Col xl={12} lg={8}>
          <Card>
            <CardBody>
              <h6 className="mb-3 fw-semibold text-uppercase">Company Info</h6>

              <Form onSubmit={FormikForm.handleSubmit} noValidate>
                <div className="live-preview">
                  <Row className="gy-4">
                    {/* ── Website ──────────────────────────────────────── */}
                    <Col xxl={8} md={7}>
                      <Label htmlFor="orgwebsite" className="form-label">
                        Company Website <span>*</span>
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          name="website"
                          id="orgwebsite"
                          innerRef={inputRef}
                          className="form-control form-control-icon"
                          placeholder="www.company.com"
                          value={v.website || ""}
                          // onChange={(e) => setField("website", e.target.value)}
                          onChange={(e) => {
                            const value = e.target.value
                              .toLowerCase()
                              // .replace(/[^a-z0-9:/.-]/g, "")
                              .replace(/[^a-z0-9:/?&=._#-]/gi, "");

                            setField("website", value);
                            console.log(value.length);
                          }}
                          onBlur={() =>
                            FormikForm.setFieldTouched("website", true)
                          }
                          invalid={isInvalid("website")}
                        />
                        {!isInvalid("website") && (
                          <i className="ri-global-line" />
                        )}
                        {isInvalid("website") && (
                          <FormFeedback type="invalid">
                            {e.website}
                          </FormFeedback>
                        )}
                      </div>
                      {showHint("website") && (
                        <div className="form-text">
                          Enter your company website.
                        </div>
                      )}
                    </Col>

                    {/* ── Contact Number ───────────────────────────────── */}
                    <Col xxl={8} md={7}>
                      <Label htmlFor="contact_number" className="form-label">
                        Contact Number <span>*</span>
                      </Label>
                      <Row>
                        <Col md={3}>
                          <Select
                            id="country_code"
                            name="country_code"
                            isMulti={false}
                            options={CountryCodeListOptions}
                            className="basic-multi-select"
                            components={{ Option: CountryCodeDisplayInSelect }}
                            value={
                              v.country_code
                                ? CountryCodeListOptions.find(
                                    (d) => d.value === v.country_code,
                                  )
                                : null
                            }
                            onChange={handleCountryCodeChange}
                          />
                        </Col>
                        <Col md={9}>
                          <Input
                            type="text"
                            id="contact_number"
                            name="contact_number"
                            className="form-control rounded-end flag-input"
                            placeholder="Enter number"
                            inputMode="numeric"
                            value={v.contact_number || ""}
                            onChange={(e) =>
                              handleNumberOnly(e, "contact_number", 10)
                            }
                            onBlur={() =>
                              FormikForm.setFieldTouched("contact_number", true)
                            }
                            invalid={isInvalid("contact_number")}
                          />
                          {isInvalid("contact_number") && (
                            <FormFeedback type="invalid">
                              {e.contact_number}
                            </FormFeedback>
                          )}
                        </Col>
                      </Row>
                      {showHint("contact_number") && (
                        <div className="form-text">
                          Enter digits only, no spaces or special characters.
                        </div>
                      )}
                    </Col>

                    {/* ── Contact Email ────────────────────────────────── */}
                    <Col xxl={8} md={7}>
                      <Label htmlFor="companyemail" className="form-label">
                        Contact Email <span>*</span>
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="email"
                          name="contact_email"
                          id="companyemail"
                          className="form-control form-control-icon"
                          placeholder="user@company.com"
                          value={v.contact_email || ""}
                          onChange={(e) =>
                            setField("contact_email", e.target.value.trim())
                          }
                          onBlur={() => {
                            FormikForm.setFieldTouched("contact_email", true);
                            setField(
                              "contact_email",
                              (v.contact_email || "").trim().toLowerCase(),
                            );
                          }}
                          invalid={isInvalid("contact_email")}
                        />
                        {!isInvalid("contact_email") && (
                          <i className="ri-mail-line" />
                        )}
                        {isInvalid("contact_email") && (
                          <FormFeedback type="invalid">
                            {e.contact_email}
                          </FormFeedback>
                        )}
                      </div>
                      {showHint("contact_email") && (
                        <div className="form-text">
                          Enter your contact email.
                        </div>
                      )}
                    </Col>

                    {/* ── Company Overview ─────────────────────────────── */}
                    <Col xxl={8} md={7}>
                      <Label htmlFor="about" className="form-label">
                        Company Overview <span>*</span>
                      </Label>
                      <Input
                        type="textarea"
                        name="about"
                        id="about"
                        className="form-control"
                        rows="3"
                        value={v.about || ""}
                        // onChange={(e) => setField("about", e.target.value)}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/^\s+/, "") // remove leading spaces                 
                            .replace(
                              /[^a-zA-Z0-9\s\n.,!?'"\-_()&:;/]/g,
                              ""
                            );
                          setField("about", value);
                        }}
                        onBlur={() => FormikForm.setFieldTouched("about", true)}
                        invalid={isInvalid("about")}
                      />
                      {isInvalid("about") && (
                        <FormFeedback type="invalid">{e.about}</FormFeedback>
                      )}
                      {showHint("about") && (
                        <div className="form-text">Company overview.</div>
                      )}
                    </Col>

                    {/* ── Address ──────────────────────────────────────── */}
                    <Col xxl={8} md={12}>
                      <Label htmlFor="address" className="form-label">
                        Address <span>*</span>
                      </Label>
                      <Input
                        type="textarea"
                        name="address"
                        id="address"
                        className="form-control"
                        rows="2"
                        value={v.address || ""}
                        // onChange={(e) => setField("address", e.target.value)}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/^\s+/, "") // remove leading spaces only
                            .replace(/[^a-zA-Z0-9\s.,\-#/'&]/g, "");

                          setField("address", value);
                        }}
                        onBlur={() =>
                          FormikForm.setFieldTouched("address", true)
                        }
                        invalid={isInvalid("address")}
                      />
                      {isInvalid("address") && (
                        <FormFeedback type="invalid">{e.address}</FormFeedback>
                      )}
                      {showHint("address") && (
                        <div className="form-text">Address.</div>
                      )}
                    </Col>

                    {/* ── Country ──────────────────────────────────────── */}
                    <Col xxl={8} md={6}>
                      <Label htmlFor="country" className="form-label">
                        Country <span>*</span>
                      </Label>
                      <Select
                        id="country"
                        name="country"
                        isMulti={false}
                        options={CountryListOptions}
                        className="basic-multi-select"
                        value={
                          v.country
                            ? CountryListOptions.find(
                                (d) => d.value === v.country,
                              )
                            : null
                        }
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderColor:
                              !state.isFocused && t.country && e.country
                                ? "red"
                                : provided.borderColor,
                          }),
                        }}
                        onChange={handleCountryChange}
                        onBlur={() =>
                          FormikForm.setFieldTouched("country", true)
                        }
                      />
                      {t.country && e.country && (
                        <div className="lc_form_error_text">{e.country}</div>
                      )}
                      {showHint("country") && (
                        <div className="form-text">Select country.</div>
                      )}
                    </Col>

                    {/* ── State ────────────────────────────────────────── */}
                    <Col xxl={8} md={6}>
                      <Label htmlFor="state" className="form-label">
                        State <span>*</span>
                      </Label>
                      <Select
                        id="state"
                        name="state"
                        isMulti={false}
                        options={stateListOptions}
                        className="basic-multi-select"
                        value={
                          v.state
                            ? stateListOptions.find(
                                (d) => d.value === v.state,
                              ) || null
                            : null
                        }
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderColor:
                              !state.isFocused && t.state && e.state
                                ? "red"
                                : provided.borderColor,
                          }),
                        }}
                        onChange={(opt) => setField("state", opt.value)}
                        onBlur={() => FormikForm.setFieldTouched("state", true)}
                      />
                      {t.state && e.state && (
                        <div className="lc_form_error_text">{e.state}</div>
                      )}
                      {showHint("state") && (
                        <div className="form-text">Select state.</div>
                      )}
                    </Col>

                    {/* ── City ─────────────────────────────────────────── */}
                    <Col xxl={8} md={6}>
                      <Label htmlFor="companycity" className="form-label">
                        City <span>*</span>
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          name="city"
                          id="companycity"
                          className="form-control form-control-icon"
                          placeholder="Chennai"
                          value={v.city || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(
                              /[^a-zA-Z\s]/g,
                              "",
                            );
                            setField("city", val);
                          }}
                          onBlur={() =>
                            FormikForm.setFieldTouched("city", true)
                          }
                          invalid={isInvalid("city")}
                        />
                        {!isInvalid("city") && (
                          <i className="ri-map-pin-line" />
                        )}
                        {isInvalid("city") && (
                          <FormFeedback type="invalid">{e.city}</FormFeedback>
                        )}
                      </div>
                      {showHint("city") && (
                        <div className="form-text">
                          Enter city name (letters only).
                        </div>
                      )}
                    </Col>

                    {/* ── Pincode ──────────────────────────────────────── */}
                    <Col xxl={8} md={6}>
                      <Label htmlFor="companypincode" className="form-label">
                        Pincode <span>*</span>
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          name="pincode"
                          id="companypincode"
                          className="form-control form-control-icon"
                          placeholder="600001"
                          inputMode="numeric"
                          maxLength={6}
                          value={v.pincode || ""}
                          onChange={(e) => handleNumberOnly(e, "pincode", 6)}
                          onBlur={() =>
                            FormikForm.setFieldTouched("pincode", true)
                          }
                          invalid={isInvalid("pincode")}
                        />
                        {!isInvalid("pincode") && (
                          <i className="ri-map-2-line" />
                        )}
                        {isInvalid("pincode") && (
                          <FormFeedback type="invalid">
                            {e.pincode}
                          </FormFeedback>
                        )}
                      </div>
                      {showHint("pincode") && (
                        <div className="form-text">
                          Enter pincode (6 digits only).
                        </div>
                      )}
                    </Col>

                    {/* ── Time Zone ────────────────────────────────────── */}
                    <Col xxl={8} md={6}>
                      <Label htmlFor="timezone" className="form-label">
                        Time Zone <span>*</span>
                      </Label>
                      <Select
                        name="timezone"
                        id="timezone"
                        options={timzone_options}
                        placeholder="Select a time zone"
                        value={
                          v.timezone
                            ? timzone_options.find(
                                (opt) => opt.value === v.timezone,
                              )
                            : null
                        }
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderColor:
                              !state.isFocused && t.timezone && e.timezone
                                ? "red"
                                : provided.borderColor,
                          }),
                        }}
                        onChange={(opt) => setField("timezone", opt.value)}
                        onBlur={() =>
                          FormikForm.setFieldTouched("timezone", true)
                        }
                      />
                      {t.timezone && e.timezone && (
                        <div className="lc_form_error_text">{e.timezone}</div>
                      )}
                      {showHint("timezone") && (
                        <div className="form-text">Select time zone.</div>
                      )}
                    </Col>

                    {/* ── Custom Fields ────────────────────────────────── */}
                    {v.cf_values && v.cf_values.length
                      ? v.cf_values.map((obj) => (
                          <Col xxl={8} md={6} key={obj.id}>
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
                                onChange={(e) => handleCFInputChange(e, obj.id)}
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
                                onChange={(e, dateStr) =>
                                  handleCFDateChange(e, dateStr, obj.id)
                                }
                              />
                            )}
                            <div className="form-text">Enter {obj.name}</div>
                          </Col>
                        ))
                      : null}

                    {/* ── Logo Upload ──────────────────────────────────── */}
                    <Col xxl={8} md={12}>
                      <Row>
                        <Col xxl={6} md={6}>
                          <Label className="form-label">Logo</Label>
                          {/* <Dropzone
                            multiple={false}
                            onDrop={(acceptedFiles) =>
                              handleAcceptedFiles(acceptedFiles, "light")
                            }
                          > */}

                          <Dropzone
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
                            {({ getRootProps }) => (
                              <div className="dropzone dz-clickable">
                                <div
                                  className="dz-message needsclick"
                                  {...getRootProps()}
                                >
                                  <div className="mb-3">
                                    <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                                  </div>
                                  <h5>
                                    Drop files here or click to upload Logo.
                                  </h5>
                                </div>
                              </div>
                            )}
                          </Dropzone>
                          {/* {lightLogoFile && ( */}
                          {lightLogoFile ? (
                            <Card className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete">
                              <div className="p-2">
                                <Row className="align-items-center">
                                  <Col className="col-auto">
                                    <img
                                      height="80"
                                      className="avatar-sm rounded bg-light"
                                      alt={lightLogoFile.name}
                                      src={lightLogoFile.preview}
                                    />
                                  </Col>
                                  <Col>
                                    <Link
                                      to="#"
                                      className="text-muted font-weight-bold"
                                    >
                                      {lightLogoFile.name}
                                    </Link>
                                    <p className="mb-0">
                                      <strong>
                                        {lightLogoFile.formattedSize}
                                      </strong>
                                    </p>
                                  </Col>
                                </Row>
                              </div>
                            </Card>
                          ):
                          (v.light_logo_image && (
                            <div className="p-2 m-3">
                              <Row className="align-items-center">
                                <Col className="col-auto">
                                  <img
                                    height="80"
                                    className="avatar-sm rounded bg-light"
                                    alt="logo"
                                    src={v.light_logo_image}
                                  />
                                </Col>
                              </Row>
                            </div>
                          )
                          )}
                        </Col>
                      </Row>
                    </Col>

                    {/* ── Submit ───────────────────────────────────────── */}
                    {showUpdateBtn && (
                      <Col xxl={12} md={12}>
                        <Button
                          type="submit"
                          color="success"
                          className="btn-label"
                        >
                          <i className="ri-check-double-line label-icon align-middle fs-16 me-2" />
                          Update
                        </Button>
                      </Col>
                    )}
                  </Row>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* ── Right Sidebar ─────────────────────────────────────────────── */}
        {/* <Col xl={3} lg={4}>
          <Card>
            <CardBody>
              <h5 className="card-title mb-4">Skills</h5>
              <div className="d-flex flex-wrap gap-2 fs-16">
                {[
                  "UI/UX",
                  "Figma",
                  "HTML",
                  "CSS",
                  "Javascript",
                  "C#",
                  "Nodejs",
                ].map((s) => (
                  <div
                    key={s}
                    className="badge fw-medium bg-secondary-subtle text-secondary"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="align-items-center d-flex border-bottom-dashed">
              <h4 className="card-title mb-0 flex-grow-1">Members</h4>
              <div className="flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-soft-danger btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#inviteMembersModal"
                >
                  <i className="ri-share-line me-1 align-bottom"></i> Invite
                  Member
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <SimpleBar
                data-simplebar
                style={{ height: "235px" }}
                className="mx-n3 px-3"
              >
                <div className="vstack gap-3">
                  {[
                    { img: avatar2, name: "Nancy Martino" },
                    { initials: "HB", color: "danger", name: "Henry Baird" },
                    { img: avatar3, name: "Frank Hook" },
                    { img: avatar4, name: "Jennifer Carter" },
                    { initials: "AC", color: "success", name: "Alexis Clarke" },
                    { img: avatar7, name: "Joseph Parker" },
                  ].map((m) => (
                    <div key={m.name} className="d-flex align-items-center">
                      <div className="avatar-xs flex-shrink-0 me-3">
                        {m.img ? (
                          <img
                            src={m.img}
                            alt=""
                            className="img-fluid rounded-circle"
                          />
                        ) : (
                          <div
                            className={`avatar-title bg-${m.color}-subtle text-${m.color} rounded-circle`}
                          >
                            {m.initials}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="fs-13 mb-0">
                          <Link to="#" className="text-body d-block">
                            {m.name}
                          </Link>
                        </h5>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-light btn-sm"
                          >
                            Message
                          </button>
                          <UncontrolledDropdown>
                            <DropdownToggle
                              tag="button"
                              className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                            >
                              <i className="ri-more-fill"></i>
                            </DropdownToggle>
                            <DropdownMenu>
                              <li>
                                <DropdownItem>
                                  <i className="ri-eye-fill text-muted me-2 align-bottom"></i>
                                  View
                                </DropdownItem>
                              </li>
                              <li>
                                <DropdownItem>
                                  <i className="ri-star-fill text-muted me-2 align-bottom"></i>
                                  Favourite
                                </DropdownItem>
                              </li>
                              <li>
                                <DropdownItem>
                                  <i className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></i>
                                  Delete
                                </DropdownItem>
                              </li>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SimpleBar>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="align-items-center d-flex border-bottom-dashed">
              <h4 className="card-title mb-0 flex-grow-1">Attachments</h4>
              <div className="flex-shrink-0">
                <button type="button" className="btn btn-soft-info btn-sm">
                  <i className="ri-upload-2-fill me-1 align-bottom"></i> Upload
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="vstack gap-2">
                {[
                  {
                    icon: "ri-folder-zip-line",
                    name: "App-pages.zip",
                    size: "2.2MB",
                  },
                  {
                    icon: "ri-file-ppt-2-line",
                    name: "Velzon-admin.ppt",
                    size: "2.4MB",
                  },
                  {
                    icon: "ri-folder-zip-line",
                    name: "Images.zip",
                    size: "1.2MB",
                  },
                  {
                    icon: "ri-image-2-line",
                    name: "bg-pattern.png",
                    size: "1.1MB",
                  },
                ].map((f) => (
                  <div
                    key={f.name}
                    className="border rounded border-dashed p-2"
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0 me-3">
                        <div className="avatar-sm">
                          <div className="avatar-title bg-light text-secondary rounded fs-24">
                            <i className={f.icon}></i>
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <h5 className="fs-13 mb-1">
                          <Link
                            to="#"
                            className="text-body text-truncate d-block"
                          >
                            {f.name}
                          </Link>
                        </h5>
                        <div>{f.size}</div>
                      </div>
                      <div className="flex-shrink-0 ms-2">
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-icon text-muted btn-sm fs-18"
                          >
                            <i className="ri-download-2-line"></i>
                          </button>
                          <UncontrolledDropdown>
                            <DropdownToggle
                              tag="button"
                              className="btn btn-icon text-muted btn-sm fs-18 dropdown"
                              type="button"
                            >
                              <i className="ri-more-fill"></i>
                            </DropdownToggle>
                            <DropdownMenu>
                              <li>
                                <DropdownItem>
                                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>
                                  Rename
                                </DropdownItem>
                              </li>
                              <li>
                                <DropdownItem>
                                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>
                                  Delete
                                </DropdownItem>
                              </li>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-2 text-center">
                  <button type="button" className="btn btn-success">
                    View more
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col> */}
      </Row>
    </React.Fragment>
  );
};

export default OrgInfoTab;
