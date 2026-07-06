import React, { useEffect, useRef, useState } from "react";
import {
  Col,
  Form,
  FormFeedback,
  Input,
  Label,
  Row,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  addClient,
  editClient,
} from "../../../redux/reducers/ChildReducer/ClientReducer";
import { toast } from "react-toastify";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../../common/api/PostApi";
import { PutApi } from "../../../common/api/PutApi";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import Select from "react-select";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import { timzone_options } from "../../../common/constant/Constants";
import CountryList from "../../../common/data/CountryList";
import LocationSearch from "../../../pages/organization/LocationSearch";
import no_image from "../../../assets/images/users/no_img.jpg";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";

defineElement(loadAnimation);

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

// ─── Custom Option renderer ───────────────────────────────────────────────────

const ClientForm = () => {
  const dispatch = useDispatch();
  const inputRef = useRef();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const isEdit = !!(form_obj?.id && form_obj.id !== 0);

  const [clientData, setClientData] = useState({});

  // ─── Location modal state ─────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [locationObj, setLocationObj] = useState(initialLocationObj);
  const [locationStateOptions, setLocationStateOptions] = useState([]);
  const [CountryListOptions, setCountryListOptions] = useState([]);
  const [entityLocations, setEntityLocations] = useState([]);

  const [stateListOptions, setStateListOptions] = useState([]);

  // ─── Build employee options ───────────────────────────────────────────────
  const EmployeeData = GetLocalStorageData("employee") || [];
  const employeeOptions = EmployeeData.map((emp) => ({
    ...emp,
    value: emp.id,
    label:
      `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
      emp.name ||
      `Employee ${emp.id}`,
  }));

  // ─── Sync form_obj ────────────────────────────────────────────────────────
  useEffect(() => {
    if (form_obj) {
      setClientData(form_obj);
      // Load existing locations for this client if present
      setEntityLocations(form_obj?.entity_location_details || []);
    }
  }, [form_obj]);

  // ─── Country list ─────────────────────────────────────────────────────────
  useEffect(() => {
    const list = CountryList.filter((c) => c.show === true).map((d) => ({
      ...d,
      label: d.countryName,
      value: d.countryName,
    }));
    setCountryListOptions(list);
  }, []);

  // ─── State options when location country changes ──────────────────────────
  useEffect(() => {
    if (locationObj?.country) {
      const found = CountryList.find(
        (d) => d.countryName === locationObj.country,
      );
      setLocationStateOptions(found?.states || []);
    }
  }, [locationObj?.country]);

  useEffect(() => {
    if (form_obj) {
      setClientData(form_obj);
      setEntityLocations(form_obj?.entity_location_details || []);

      const selectedCountry = CountryList.find(
        (d) => d.countryName === form_obj.country,
      );

      setStateListOptions(selectedCountry?.states || []);
    }
  }, [form_obj?.id]);

  // ─── Client input handler ─────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberOnly = (e) => {
    const { name } = e.target;
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);

    setClientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTextOnly = (e) => {
    const { name, value } = e.target;

    setClientData((prev) => ({
      ...prev,
      [name]: value.replace(/[^a-zA-Z\s]/g, ""),
    }));
  };

  const handlePincodeOnly = (e) => {
    const { name } = e.target;
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);

    setClientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneNumberOnly = (e) => {
    const { name } = e.target;
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);

    setClientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ─── Location helpers ─────────────────────────────────────────────────────
  const updateLocationObj = (e) => {
    const { name, value } = e.target;
    setLocationObj((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationTextOnly = (e) => {
    const { name, value } = e.target;
    setLocationObj((prev) => ({
      ...prev,
      [name]: value.replace(/[^a-zA-Z\s\-_]/g, ""),
    }));
  };

  const handleLocationCountryChange = (e) => {
    const found = CountryList.find((d) => d.countryName === e?.value);
    setLocationObj((prev) => ({ ...prev, country: e?.value || "", state: "" }));
    setLocationStateOptions(found?.states || []);
  };

  const handleLocationStateChange = (e) => {
    setLocationObj((prev) => ({ ...prev, state: e?.value || "" }));
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
      setLocationObj((prev) => ({
        ...prev,
        image: file,
        image_url: readerEvent.target.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleAddClick = () => {
    setLocationObj({
      ...initialLocationObj,
      type_id: form_obj?.id,
      type: "client",
    });
    setModalOpen(true);
  };

  const handleEditLocation = (location) => {
    setLocationObj({
      ...location,
      type_id: form_obj?.id,
      type: "client",
    });
    setModalOpen(true);
  };

  const handleCountryChange = (e) => {
    setClientData((prev) => ({
      ...prev,
      country: e.value,
      country_code: e.countryCode,
      state: "",
    }));

    setStateListOptions(
      CountryListOptions.find((d) => d.value === e.value)?.states || [],
    );
  };

  const handleGSTNumberOnly = (e) => {
    const { name, value } = e.target;

    setClientData((prev) => ({
      ...prev,
      [name]: value
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 15),
    }));
  };

  const handleModalClose = () => setModalOpen(false);

  // ─── Main client formik ───────────────────────────────────────────────────
  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: clientData,
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .matches(/^[A-Za-z\s]+$/, "Client name should contain only letters")
        .required("Please Enter the Client name"),
      phone_number: Yup.string()
        .required("Please Enter Phone Number")
        .matches(/^[0-9]+$/, "Phone number must contain digits only")
        .length(10, "Phone number must be 10 digits"),
      city: Yup.string()
        .trim()
        .matches(/^[A-Za-z\s]+$/, "City should contain only letters")
        .required("Please Enter City"),
      state: Yup.string().required("Please Enter State"),
      country: Yup.string().required("Please Enter Country"),
      pincode: Yup.string()
        .trim()
        .matches(/^[0-9]+$/, "Pincode should contain only numbers")
        .length(6, "Please Enter Valid 6 Digit Pincode")
        .required("Please Enter Pincode"),
      website: Yup.string()
        .trim()
        .required("Please enter website")
        .max(500, "Website URL must not exceed 500 characters")
        .test(
          "website-validation",
          "Enter a valid website URL with a supported domain extension",
          (value) => validateWebsite(value),
        ),
      gst_number: Yup.string()
        .matches(
          /^\d{2}[A-Z0-9]{5}[A-Z0-9]{4}\d{1}\d{1}[A-Z0-9]{2}$/,
          "Enter a valid 15-character GST Number (e.g. 27AABFR5055K1Z0)",
        )
        .length(15, "GST Number must be exactly 15 characters"),
      address: Yup.string().trim().required("Address is required"),
    }),
    onSubmit: async () => {
      dispatch(setLoaderVisible(true));
      try {
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
      dispatch(setLoaderVisible(false));
    },
  });
  // ─── Location formik ──────────────────────────────────────────────────────
  const locationFormik = useFormik({
    enableReinitialize: true,
    initialValues: locationObj,
    validationSchema: Yup.object({
      name: Yup.string()
        .matches(
          /^[A-Za-z\s\-_]+$/,
          "Location name should contain only letters, spaces, hyphens or underscores",
        )
        .required("Please Enter Location Name")
        .test(
          "not-only-spaces",
          "Please Enter Location Name",
          (value) => !value || value.trim().length > 0,
        ),
      address: Yup.string().trim().required("Please Enter Address"),
      country: Yup.string().required("Please Select Country"),
      state: Yup.string().required("Please Select State"),
      city: Yup.string()
        .trim()
        .matches(/^[A-Za-z\s]+$/, "City should contain only letters")
        .required("Please Enter City"),
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

        let Api;

        if (isNewLocation) {
          Api = await PostApi("location/add-entity-location/", formData, true);
        } else {
          Api = await PostApi("location/add-entity-location/", formData, true);
        }

        if ([200, 201].includes(Api?.status)) {
          // Handle both flat and nested response shapes
          const response = Api?.data?.data ?? Api?.data;

          const updatedLocations = isNewLocation
            ? [...entityLocations, response]
            : entityLocations.map((loc) =>
                loc.id === response.id ? response : loc,
              );

          // 1. Local table state
          setEntityLocations(updatedLocations);

          // 2. Keep form_obj-backed clientData in sync (so re-render uses fresh data)
          setClientData((prev) => ({
            ...prev,
            entity_location_details: updatedLocations,
          }));

          // 3. localStorage "clients"
          const oldClients = GetLocalStorageData("clients") || [];
          const updatedClients = oldClients.map((client) =>
            client.id === form_obj?.id
              ? { ...client, entity_location_details: updatedLocations }
              : client,
          );
          SetLocalStorage("clients", updatedClients, 1);

          // 4. redux
          dispatch(
            editClient({
              ...clientData,
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
            Api?.data?.message ||
              Api?.data?.detail ||
              "Failed to save location.",
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
        dispatch(setLoaderVisible(false));
      }
    },
  });

  // ─── Focus first error field in location modal ────────────────────────────
  useEffect(() => {
    if (
      locationFormik.submitCount > 0 &&
      Object.keys(locationFormik.errors).length > 0
    ) {
      const firstErrorField = Object.keys(locationFormik.errors)[0];
      locationFormik.setFieldTouched(firstErrorField);
      const errorField = document.querySelector(`[name=${firstErrorField}]`);
      if (errorField) errorField.focus();
    }
  }, [locationFormik.submitCount, locationFormik.errors]);

  // ─── Derived select values ────────────────────────────────────────────────
  const ownerSelectValue =
    employeeOptions.find((e) => e.id === clientData.owner) || null;
  const managerSelectValue = employeeOptions.filter((e) =>
    (clientData.manager_id_list || []).includes(e.id),
  );

  const selectStyles = (touched, error) => ({
    control: (provided, state) => ({
      ...provided,
      borderColor:
        !state.isFocused && touched && error
          ? "red !important"
          : provided.borderColor,
    }),
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <React.Fragment>
      <Row>
        <Col xl={40}>
          <Form onSubmit={FormikForm.handleSubmit}>
            <Row>
              {/* ── Client Name ── */}
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="name" className="form-label">
                    Client Name *
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      className="form-control"
                      placeholder="Client Name"
                      value={clientData.name || ""}
                      onChange={handleTextOnly}
                      invalid={
                        FormikForm.touched.name && FormikForm.errors.name
                          ? true
                          : false
                      }
                    />
                    {!FormikForm.touched.name && !FormikForm.errors.name && (
                      <i className="ri-building-line" />
                    )}
                    {FormikForm.touched.name && FormikForm.errors.name ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.name}
                      </FormFeedback>
                    ) : null}
                  </div>
                  {!FormikForm.errors.name && (
                    <div className="form-text">Enter Client Name.</div>
                  )}
                </div>
              </Col>

              {/* ── Owner ── */}
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="owner" className="form-label">
                    Owner
                  </Label>
                  <Select
                    id="owner"
                    name="owner"
                    isClearable
                    isMulti={false}
                    options={employeeOptions}
                    components={{ Option: EmployeeDisplayInSelect }}
                    className="basic-single-select"
                    classNamePrefix="lc-select"
                    placeholder="Select Owner"
                    styles={selectStyles(
                      FormikForm.touched.owner,
                      FormikForm.errors.owner,
                    )}
                    value={ownerSelectValue}
                    onChange={(selectedOption) => {
                      setClientData((prev) => ({
                        ...prev,
                        owner: selectedOption ? selectedOption.id : null,
                      }));
                    }}
                  />
                  <div className="form-text">Select the client owner.</div>
                </div>
              </Col>

              {/* ── Managers ── */}
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="manager_id_list" className="form-label">
                    Managers
                  </Label>
                  <Select
                    id="manager_id_list"
                    name="manager_id_list"
                    isClearable
                    isMulti={true}
                    options={employeeOptions}
                    components={{ Option: EmployeeDisplayInSelect }}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
                    placeholder="Select Managers"
                    styles={selectStyles(
                      FormikForm.touched.manager_id_list,
                      FormikForm.errors.manager_id_list,
                    )}
                    value={managerSelectValue}
                    onChange={(selectedOptions) => {
                      setClientData((prev) => ({
                        ...prev,
                        manager_id_list: selectedOptions
                          ? selectedOptions.map((o) => o.id)
                          : [],
                        _manager_raw: undefined,
                      }));
                    }}
                  />
                  <div className="form-text">Select one or more managers.</div>
                </div>
              </Col>

              {/* ── Address ── */}

              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="address" className="form-label">
                    Address *
                  </Label>
                  <Input
                    type="textarea"
                    name="address"
                    id="address"
                    className="form-control"
                    placeholder="Address"
                    value={clientData.address || ""}
                    onChange={handleInputChange}
                    onBlur={() => FormikForm.setFieldTouched("address", true)}
                    invalid={
                      FormikForm.touched.address && FormikForm.errors.address
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.address && FormikForm.errors.address ? (
                    <FormFeedback type="invalid">
                      {FormikForm.errors.address}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>

              {/* ── City / State ── */}
              <Col md={6} lg={6} xxl={6}>
                <div className="mb-3">
                  <Label htmlFor="city" className="form-label">
                    City *
                  </Label>
                  <Input
                    type="text"
                    name="city"
                    id="city"
                    className="form-control"
                    placeholder="City"
                    value={clientData.city || ""}
                    onChange={handleTextOnly}
                    onBlur={() => FormikForm.setFieldTouched("city", true)}
                    invalid={
                      FormikForm.touched.city && FormikForm.errors.city
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.city && FormikForm.errors.city ? (
                    <FormFeedback type="invalid">
                      {FormikForm.errors.city}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
              <Col md={6} lg={6} xxl={6}>
                <div className="mb-3">
                  <Label htmlFor="state" className="form-label">
                    State *
                  </Label>
                  <Select
                    id="state"
                    name="state"
                    isMulti={false}
                    options={stateListOptions}
                    value={
                      stateListOptions.find(
                        (d) => d.value === clientData.state,
                      ) || null
                    }
                    onChange={(e) =>
                      setClientData((prev) => ({
                        ...prev,
                        state: e.value,
                      }))
                    }
                  />
                  {FormikForm.touched.state && FormikForm.errors.state ? (
                    <FormFeedback type="invalid">
                      {FormikForm.errors.state}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>

              {/* ── Pincode / Country ── */}
              <Col md={6} lg={6} xxl={6}>
                <div className="mb-3">
                  <Label htmlFor="pincode" className="form-label">
                    Pincode *
                  </Label>
                  <Input
                    type="text"
                    name="pincode"
                    id="pincode"
                    className="form-control"
                    placeholder="Pincode"
                    inputMode="numeric"
                    maxLength={6}
                    value={clientData.pincode || ""}
                    onChange={handlePincodeOnly}
                    onBlur={() => FormikForm.setFieldTouched("pincode", true)}
                    invalid={
                      FormikForm.touched.pincode && FormikForm.errors.pincode
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.pincode && FormikForm.errors.pincode ? (
                    <FormFeedback type="invalid">
                      {FormikForm.errors.pincode}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>
              <Col md={6} lg={6} xxl={6}>
                <div className="mb-3">
                  <Label htmlFor="country" className="form-label">
                    Country *
                  </Label>
                  <Select
                    id="country"
                    name="country"
                    isMulti={false}
                    options={CountryListOptions}
                    value={
                      CountryListOptions.find(
                        (d) => d.value === clientData.country,
                      ) || null
                    }
                    onChange={handleCountryChange}
                  />
                  {FormikForm.touched.country && FormikForm.errors.country ? (
                    <FormFeedback type="invalid">
                      {FormikForm.errors.country}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>

              {/* ── Country Code / Phone ── */}
              <Col md={6} lg={6} xxl={6}>
                <div className="mb-3">
                  <Label htmlFor="country_code" className="form-label">
                    Country Code
                  </Label>
                  <Input
                    type="text"
                    name="country_code"
                    id="country_code"
                    className="form-control"
                    placeholder="e.g. IN"
                    value={clientData.country_code || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>
              <Col md={6} lg={6} xxl={6}>
                <div className="mb-3">
                  <Label htmlFor="phone_number" className="form-label">
                    Phone Number *
                  </Label>
                  <Input
                    type="text"
                    name="phone_number"
                    id="phone_number"
                    className="form-control"
                    placeholder="9876543210"
                    value={clientData.phone_number || ""}
                    onChange={handlePhoneNumberOnly}
                    onBlur={() =>
                      FormikForm.setFieldTouched("phone_number", true)
                    }
                    invalid={
                      FormikForm.touched.phone_number &&
                      FormikForm.errors.phone_number
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.phone_number &&
                  FormikForm.errors.phone_number ? (
                    <FormFeedback type="invalid">
                      {FormikForm.errors.phone_number}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>

              {/* ── Website ── */}
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="website" className="form-label">
                    Website
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="website"
                      id="website"
                      className="form-control form-control-icon"
                      placeholder="www.company.com"
                      value={clientData.website || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9:/.-]/g, "");

                        setClientData((prev) => ({
                          ...prev,
                          website: value,
                        }));
                      }}
                      onBlur={() => FormikForm.setFieldTouched("website", true)}
                      invalid={
                        FormikForm.touched.website && FormikForm.errors.website
                          ? true
                          : false
                      }
                    />

                    {!FormikForm.touched.website &&
                      !FormikForm.errors.website && (
                        <i className="ri-global-line" />
                      )}

                    {FormikForm.touched.website && FormikForm.errors.website ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.website}
                      </FormFeedback>
                    ) : null}
                  </div>

                  {!FormikForm.errors.website && (
                    <div className="form-text">Enter Client Website.</div>
                  )}
                </div>
              </Col>

              {/* ── VAT / GST ── */}
              {/* <Col md={6} lg={6} xxl={6}>
                <div className="mb-3">
                  <Label htmlFor="vat_number" className="form-label">
                    VAT Number
                  </Label>
                  <Input
                    type="text"
                    name="vat_number"
                    id="vat_number"
                    className="form-control"
                    placeholder="VAT Number"
                    value={clientData.vat_number || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </Col> */}
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="gst_number" className="form-label">
                    GST Number
                  </Label>
                  <Input
                    type="text"
                    name="gst_number"
                    id="gst_number"
                    className="form-control"
                    placeholder="GST Number"
                    maxLength={15}
                    value={clientData.gst_number || ""}
                    onChange={handleGSTNumberOnly}
                    onBlur={() =>
                      FormikForm.setFieldTouched("gst_number", true)
                    }
                    invalid={
                      FormikForm.touched.gst_number &&
                      FormikForm.errors.gst_number
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.gst_number &&
                  FormikForm.errors.gst_number ? (
                    <FormFeedback type="invalid">
                      {FormikForm.errors.gst_number}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>

              {/* ── Locations Table (edit mode only) ── */}
              {isEdit && entityLocations.length > 0 && (
                <Col lg={12}>
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
                      {entityLocations.map((location, index) => (
                        <tr key={index}>
                          <td>{location.name}</td>
                          <td>{location.accurate_address}</td>
                          <td>{location.radius_range} m</td>
                          <td>
                            <img
                              src={
                                location.image_url
                                  ? location.image_url
                                  : no_image
                              }
                              alt="location"
                              style={{ height: "50px", objectFit: "cover" }}
                            />
                          </td>
                          <td>
                            <a
                              onClick={() => handleEditLocation(location)}
                              className="text-primary d-inline-block edit-item-btn ms-2"
                              href="javascript:void(0)"
                            >
                              <i className="ri-pencil-fill fs-16"></i>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Col>
              )}

              {/* ── Bottom row: Add Location + Save ── */}
              <Col lg={12}>
                <Row className="mt-2">
                  <Col lg={6} className="text-start">
                    {isEdit && (
                      <Button
                        color="primary"
                        type="button"
                        onClick={handleAddClick}
                      >
                        Add Location <i className="ri-map-pin-line ms-1"></i>
                      </Button>
                    )}
                  </Col>
                  <Col lg={6} className="text-end">
                    <Button color="success" className="btn-label" type="submit">
                      <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                      {isEdit ? "Update" : "Save"}
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>

      {/* ── Location Modal ── */}
      <Modal isOpen={modalOpen} toggle={handleModalClose} size="md">
        <ModalHeader toggle={handleModalClose}>
          {locationObj.id === 0 ? "Add New Location" : "Edit Location"}
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={locationFormik.handleSubmit}>
            <Row className="gy-4">
              {/* Location Name */}
              <Col lg={12}>
                <Label className="form-label">Location Name</Label>
                <div className="form-icon right">
                  <Input
                    type="text"
                    name="name"
                    id="location_name"
                    innerRef={inputRef}
                    className="form-control"
                    placeholder="Enter Location Name"
                    value={locationObj.name || ""}
                    onChange={handleLocationTextOnly}
                    onBlur={() => locationFormik.setFieldTouched("name", true)}
                    invalid={
                      locationFormik.touched.name && locationFormik.errors.name
                        ? true
                        : false
                    }
                  />
                  {!locationFormik.touched.name &&
                    !locationFormik.errors.name && (
                      <i className="ri-building-2-line" />
                    )}
                  {locationFormik.touched.name && locationFormik.errors.name ? (
                    <FormFeedback type="invalid">
                      {locationFormik.errors.name}
                    </FormFeedback>
                  ) : null}
                </div>
                {!locationFormik.errors.name && (
                  <div className="form-text">Enter Location Name.</div>
                )}
              </Col>

              {/* Map / Accurate Address Search */}
              <LocationSearch
                locationObj={locationObj}
                setLocationObj={setLocationObj}
                LocationFormikForm={locationFormik}
              />

              {/* Address */}
              <Col lg={12}>
                <Label className="form-label">Address</Label>
                <Input
                  type="textarea"
                  name="address"
                  rows="2"
                  value={locationObj.address || ""}
                  onChange={updateLocationObj}
                  invalid={
                    locationFormik.touched.address &&
                    !!locationFormik.errors.address
                  }
                />
                {locationFormik.touched.address &&
                  locationFormik.errors.address && (
                    <FormFeedback>{locationFormik.errors.address}</FormFeedback>
                  )}
              </Col>

              {/* Country */}
              <Col lg={12}>
                <Label className="form-label">Country</Label>
                <Select
                  options={CountryListOptions}
                  value={
                    CountryListOptions.find(
                      (d) => d.value === locationObj?.country,
                    ) || null
                  }
                  onChange={handleLocationCountryChange}
                />
                {locationFormik.touched.country &&
                  locationFormik.errors.country && (
                    <div className="lc_form_error_text">
                      {locationFormik.errors.country}
                    </div>
                  )}
              </Col>

              {/* State */}
              <Col lg={12}>
                <Label className="form-label">State</Label>
                <Select
                  options={locationStateOptions}
                  value={
                    locationStateOptions.find(
                      (d) => d.value === locationObj?.state,
                    ) || null
                  }
                  onChange={handleLocationStateChange}
                />
                {locationFormik.touched.state &&
                  locationFormik.errors.state && (
                    <div className="lc_form_error_text">
                      {locationFormik.errors.state}
                    </div>
                  )}
              </Col>

              {/* City */}
              <Col lg={12}>
                <Label className="form-label">City</Label>
                <div className="form-icon right">
                  <Input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={locationObj.city || ""}
                    onChange={handleLocationTextOnly}
                    invalid={
                      locationFormik.touched.city &&
                      !!locationFormik.errors.city
                    }
                  />
                  {!locationFormik.touched.city &&
                    !locationFormik.errors.city && (
                      <i className="ri-map-pin-line"></i>
                    )}
                  {locationFormik.touched.city &&
                    locationFormik.errors.city && (
                      <FormFeedback>{locationFormik.errors.city}</FormFeedback>
                    )}
                </div>
              </Col>

              {/* Pincode */}
              <Col lg={12}>
                <Label className="form-label">Pincode</Label>
                <div className="form-icon right">
                  <Input
                    type="text"
                    name="pincode"
                    placeholder="600001"
                    inputMode="numeric"
                    maxLength={6}
                    value={locationObj.pincode || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 6);
                      setLocationObj((prev) => ({
                        ...prev,
                        pincode: value,
                      }));
                    }}
                    invalid={
                      locationFormik.touched.pincode &&
                      !!locationFormik.errors.pincode
                    }
                  />
                  {!locationFormik.touched.pincode &&
                    !locationFormik.errors.pincode && (
                      <i className="ri-mail-line"></i>
                    )}
                  {locationFormik.touched.pincode &&
                    locationFormik.errors.pincode && (
                      <FormFeedback>
                        {locationFormik.errors.pincode}
                      </FormFeedback>
                    )}
                </div>
              </Col>

              {/* Image */}
              <Col lg={12}>
                <Label className="form-label">Image</Label>
                <Input
                  type="file"
                  name="image"
                  id="image"
                  className="form-control"
                  onChange={handleLocationImageUpdate}
                />
                {locationObj.image_url && (
                  <img
                    src={locationObj.image_url}
                    alt="preview"
                    className="mt-2"
                    style={{
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                )}
              </Col>

              {/* Timezone */}
              <Col lg={12}>
                <Label className="form-label">Time Zone</Label>
                <Select
                  name="timezone"
                  value={
                    locationObj.timezone
                      ? timzone_options.find(
                          (e) => e.value === locationObj.timezone,
                        )
                      : null
                  }
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor:
                        !state.isFocused &&
                        locationFormik.touched.timezone &&
                        locationFormik.errors.timezone
                          ? "red"
                          : provided.borderColor,
                    }),
                  }}
                  onChange={(e) =>
                    setLocationObj((prev) => ({ ...prev, timezone: e.value }))
                  }
                  options={timzone_options}
                  placeholder="Select a time zone"
                />
                {locationFormik.touched.timezone &&
                  locationFormik.errors.timezone && (
                    <div className="lc_form_error_text">
                      {locationFormik.errors.timezone}
                    </div>
                  )}
              </Col>

              {/* Modal Save */}
              <Col lg={12} className="text-end">
                <Button color="success" type="submit" className="btn-label">
                  <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                  Save Location
                </Button>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter />
      </Modal>
    </React.Fragment>
  );
};

export default ClientForm;
