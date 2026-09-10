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
  const [initialFormValues, setInitialFormValues] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [hasAttemptedLocationSubmit, setHasAttemptedLocationSubmit] =
    useState(false);

  const [lengthWarnings, setLengthWarnings] = useState({
    name: "",
    city: "",
    address: "",
    website: "",
  });

  const [locationLengthWarnings, setLocationLengthWarnings] = useState({
    name: "",
    city: "",
    address: "",
  });

  const MAX_LENGTHS = {
    name: 100,
    city: 100,
    address: 250,
    website: 500,
  };

  const LOCATION_MAX_LENGTHS = {
    name: 100,
    city: 100,
    address: 250,
  };

  const checkMaxLength = (field, rawValue) => {
    const max = MAX_LENGTHS[field];
    if (!max) return;
    const labels = {
      name: "Client Name",
      city: "City",
      address: "Address",
      website: "Website URL",
    };
    const msg =
      rawValue.length > max
        ? field === "website"
          ? `Website URL must not exceed ${max} characters`
          : `${labels[field] || field} cannot exceed ${max} characters`
        : "";
    setLengthWarnings((prev) => ({ ...prev, [field]: msg }));
  };

  const checkLocationMaxLength = (field, rawValue) => {
    const max = LOCATION_MAX_LENGTHS[field];
    if (!max) return;
    const labels = {
      name: "Location Name",
      city: "City",
      address: "Address",
    };
    const msg =
      rawValue.length > max
        ? `${labels[field] || field} cannot exceed ${max} characters`
        : "";
    setLocationLengthWarnings((prev) => ({ ...prev, [field]: msg }));
  };

  // ─── Location modal state ─────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [locationObj, setLocationObj] = useState(initialLocationObj);
  const [initialLocationFormValues, setInitialLocationFormValues] =
    useState(initialLocationObj);
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
      setInitialFormValues(form_obj);
      // Load existing locations for this client if present
      setEntityLocations(form_obj?.entity_location_details || []);
      setHasAttemptedSubmit(false);
      setLengthWarnings({
        name: "",
        city: "",
        address: "",
        website: "",
      });
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
      setInitialFormValues(form_obj);
      setEntityLocations(form_obj?.entity_location_details || []);

      const selectedCountry = CountryList.find(
        (d) => d.countryName === form_obj.country,
      );

      setStateListOptions(selectedCountry?.states || []);
      setHasAttemptedSubmit(false);
      setLengthWarnings({
        name: "",
        city: "",
        address: "",
        website: "",
      });
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
    const { name } = e.target;
    let value = e.target.value;

    if (name === "name") {
      value = value.replace(/[^A-Za-z0-9\s.,&()'-]/g, "");
    } else if (name === "city") {
      value = value.replace(/[^A-Za-z\s.'-]/g, "");
    } else {
      value = value.replace(/[^A-Za-z\s]/g, "");
    }

    setClientData((prev) => ({
      ...prev,
      [name]: value,
    }));

    FormikForm.setFieldValue(name, value);

    if (name === "name" || name === "city") {
      checkMaxLength(name, value);
    }
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
    const { name } = e.target;

    let value = e.target.value;

    if (name === "city") {
      value = value.replace(/[^A-Za-z\s.'-]/g, "");
    } else if (name === "name") {
      value = value.replace(/[^A-Za-z0-9\s.,&()'_-]/g, "");
    } else {
      value = value.replace(/[^a-zA-Z\s\-_]/g, "");
    }

    setLocationObj((prev) => ({
      ...prev,
      [name]: value,
    }));

    locationFormik.setFieldValue(name, value);

    if (name === "city" || name === "name") {
      checkLocationMaxLength(name, value);
    }
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
    const freshLocation = {
      ...initialLocationObj,
      type_id: form_obj?.id,
      type: "client",
    };
    setLocationObj(freshLocation);
    setInitialLocationFormValues(freshLocation);
    setHasAttemptedLocationSubmit(false);
    setLocationLengthWarnings({ name: "", city: "", address: "" });
    setModalOpen(true);
  };

  const handleEditLocation = (location) => {
    const editLocation = {
      ...location,
      type_id: form_obj?.id,
      type: "client",
    };
    setLocationObj(editLocation);
    setInitialLocationFormValues(editLocation);
    setHasAttemptedLocationSubmit(false);
    setLocationLengthWarnings({ name: "", city: "", address: "" });
    setModalOpen(true);
  };

  // const handleCountryChange = (e) => {
  //   setClientData((prev) => ({
  //     ...prev,
  //     country: e?.value || "",
  //     country_code: e?.countryCode || "",
  //     state: "",
  //   }));

  //   FormikForm.setFieldValue("country", e?.value || "");
  //   FormikForm.setFieldTouched("country", true, false);

  //   FormikForm.setFieldValue("country_code", e?.countryCode || "");
  //   FormikForm.setFieldTouched("country_code", true, false);

  //   FormikForm.setFieldValue("state", "");
  //   FormikForm.setFieldTouched("state", false, false);

  //   setStateListOptions(
  //     CountryListOptions.find((d) => d.value === e?.value)?.states || [],
  //   );
  // };

  const handleCountryChange = (e) => {
    const selectedCountry = CountryListOptions.find((d) => d.value === e?.value);

    const updatedClientData = {
      ...clientData,
      country: e?.value || "",
      country_code: e?.countryCode || "",
      state: "",
    };

    setClientData(updatedClientData);
    setStateListOptions(selectedCountry?.states || []);

    // Single merged update + single validation pass — no race condition
    FormikForm.setValues(updatedClientData).then(() => {
      FormikForm.setTouched({
        ...FormikForm.touched,
        country: true,
        country_code: true,
        state: false,
      });
    });
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

  const handleStatusToggle = (e) => {
    setClientData((prev) => ({
      ...prev,
      status: e.target.checked,
    }));
  };

  // ─── Main client formik ───────────────────────────────────────────────────
  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: initialFormValues,
    validationSchema: Yup.object({
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
          (value) => !value || value.length <= 100,
        ),
      owner: Yup.string()
        .typeError("Please Select Owner")
        .required("Please Select Owner"),
      phone_number: Yup.string()
        .required("Please Enter Phone Number")
        .matches(/^[0-9]+$/, "Phone number must contain digits only")
        .length(10, "Phone number must be 10 digits"),
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
          (value) => !value || value.length <= 100,
        ),
      state: Yup.string().required("Please Enter State"),
      country: Yup.string().required("Please Enter Country"),
      country_code: Yup.string()
        .required("Country code is required"),
      pincode: Yup.string()
        .trim()
        .matches(/^[0-9]+$/, "Pincode should contain only numbers")
        .length(6, "Please Enter Valid 6 Digit Pincode")
        .required("Please Enter Pincode"),
      website: Yup.string()
        .trim()
        .test(
          "website-length",
          "Website URL must not exceed 500 characters",
          (value) => !value || value.length <= 500,
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
        .matches(
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/,
          "Enter a valid GST Number (e.g. 27AABFR5055K1Z0)",
        )
        .length(15, "GST Number must be exactly 15 characters")
        .nullable(),
      address: Yup.string()
        .trim()
        .required("Address is required")
        .matches(
          /^[A-Za-z0-9\s.,\-#/'&]+$/,
          "Address contains invalid characters",
        )
        .test(
          "address-length",
          "Address cannot exceed 250 characters",
          (value) => !value || value.length <= 250,
        ),
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
    initialValues: initialLocationFormValues,
    validationSchema: Yup.object({
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
          (value) => !value || value.length <= 100,
        ),
      address: Yup.string()
        .trim()
        .required("Please Enter Address")
        .matches(
          /^[A-Za-z0-9\s.,\-#/'&]+$/,
          "Address should contain only letters, numbers, spaces, periods (.), commas (,), hyphens (-), hash (#), slash (/), apostrophes ('), and ampersands (&)",
        )
        .max(250, "Address cannot exceed 250 characters"),
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
          (value) => !value || value.length <= 100,
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

  const showClientError = (field) =>
    (FormikForm.touched[field] || hasAttemptedSubmit) &&
    FormikForm.errors[field];

  const showLocationError = (field) =>
    (locationFormik.touched[field] || hasAttemptedLocationSubmit) &&
    locationFormik.errors[field];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <React.Fragment>
      <Row>
        <Col xl={40}>
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              setHasAttemptedSubmit(true);

              await FormikForm.setValues(clientData, false);

              const touchedFields = {};
              Object.keys(FormikForm.initialValues || {}).forEach((key) => {
                touchedFields[key] = true;
              });
              FormikForm.setTouched(touchedFields, false);

              const errors = await FormikForm.validateForm(clientData);
              if (Object.keys(errors).length === 0) {
                FormikForm.handleSubmit();
              }
            }}
          >
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
                      onBlur={() => {
                        if (clientData.name && clientData.name.trim() !== "") {
                          FormikForm.setFieldTouched("name", true);
                        }
                      }}
                      invalid={
                        !!(showClientError("name") || lengthWarnings.name)
                      }
                    />
                    {!(showClientError("name") || lengthWarnings.name) && (
                      <i className="ri-building-line" />
                    )}
                    {showClientError("name") && !lengthWarnings.name ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.name}
                      </FormFeedback>
                    ) : null}
                    {lengthWarnings.name && (
                      <div className="lc_form_error_text">
                        {lengthWarnings.name}
                      </div>
                    )}
                  </div>
                  {!(showClientError("name") || lengthWarnings.name) && (
                    <div className="form-text">Enter Client Name.</div>
                  )}
                </div>
              </Col>

              {/* ── Owner ── */}
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="owner" className="form-label">
                    Owner *
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
                    noOptionsMessage={() => "No options"}
                    filterOption={(option, inputValue) =>
                      option.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    }
                    styles={selectStyles(
                      FormikForm.touched.owner || hasAttemptedSubmit,
                      FormikForm.errors.owner,
                    )}
                    value={ownerSelectValue}
                    onBlur={() => {
                        if (clientData.owner) {
                          FormikForm.setFieldTouched("owner", true);
                        }
                      }}
                    onChange={(selectedOption) => {
                      const value = selectedOption ? selectedOption.id : null;
                      setClientData((prev) => ({
                        ...prev,
                        owner: value,
                      }));
                      FormikForm.setFieldValue("owner", value);
                      FormikForm.setFieldTouched("owner", true, false);
                    }}
                  />
                  {showClientError("owner") && (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.owner}
                    </div>
                  )}
                  {!showClientError("owner") && (
                    <div className="form-text">Select the client owner.</div>
                  )}
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
                    noOptionsMessage={() => "No options"}
                    filterOption={(option, inputValue) =>
                      option.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    }
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

              {/* ── Contry / State ── */}
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
                    styles={selectStyles(
                      FormikForm.touched.country || hasAttemptedSubmit,
                      FormikForm.errors.country,
                    )}
                    // onBlur={() => FormikForm.setFieldTouched("country", true)}
                    onBlur={() => {
                      if (clientData.country && clientData.country.trim() !== "") {
                        FormikForm.setFieldTouched("country", true);
                      }
                    }}
                    value={
                      CountryListOptions.find(
                        (d) => d.value === clientData.country,
                      ) || null
                    }
                    onChange={handleCountryChange}
                  />
                  <div className="lc_form_error_text">
                    {showClientError("country") ? FormikForm.errors.country : "\u00A0"}
                  </div>
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
                    styles={selectStyles(
                      FormikForm.touched.state || hasAttemptedSubmit,
                      FormikForm.errors.state,
                    )}
                    // onBlur={() => FormikForm.setFieldTouched("state", true)}
                    
                    onBlur={() => {
                      if (clientData.state && clientData.state.trim() !== "") {
                        FormikForm.setFieldTouched("state", true);
                      }
                    }}

                    value={
                      stateListOptions.find(
                        (d) => d.value === clientData.state,
                      ) || null
                    }
                    onChange={(e) => {
                      setClientData((prev) => ({
                        ...prev,
                        state: e?.value || "",
                      }));

                      FormikForm.setFieldValue("state", e?.value || "");
                      FormikForm.setFieldTouched("state", true, false);
                    }}
                  />
                  <div className="lc_form_error_text">
                    {showClientError("state") ? FormikForm.errors.state : "\u00A0"}
                  </div>
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
                    onChange={(e) => {
                      const value = e.target.value.replace(
                        /[^A-Za-z0-9\s.,\-#/'&]/g,
                        "",
                      );

                      setClientData((prev) => ({
                        ...prev,
                        address: value,
                      }));

                      FormikForm.setFieldValue("address", value);
                      checkMaxLength("address", value);
                    }}
                    onBlur={() => {
                      if (
                        clientData.address &&
                        clientData.address.trim() !== ""
                      ) {
                        FormikForm.setFieldTouched("address", true);
                      }
                    }}
                    invalid={
                      !!(
                        showClientError("address") || lengthWarnings.address
                      )
                    }
                  />
                  <div className="lc_form_error_text">
                    {showClientError("address") && !lengthWarnings.address
                      ? FormikForm.errors.address
                      : lengthWarnings.address || "\u00A0"}
                  </div>
                </div>
              </Col>

              {/* ── city / pincode ── */}
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
                    onBlur={() => {
                      if (clientData.city && clientData.city.trim() !== "") {
                        FormikForm.setFieldTouched("city", true);
                      }
                    }}
                    invalid={
                      !!(showClientError("city") || lengthWarnings.city)
                    }
                  />
                  <div className="lc_form_error_text">
                    {showClientError("city") && !lengthWarnings.city
                      ? FormikForm.errors.city
                      : lengthWarnings.city || "\u00A0"}
                  </div>
                </div>
              </Col>

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
                    onChange={(e) => {
                      handlePincodeOnly(e);
                      const value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 6);
                      FormikForm.setFieldValue("pincode", value);
                    }}
                    onBlur={() => {
                      if (
                        clientData.pincode &&
                        String(clientData.pincode).trim() !== ""
                      ) {
                        FormikForm.setFieldTouched("pincode", true);
                      }
                    }}
                    invalid={!!showClientError("pincode")}
                  />
                  <div className="lc_form_error_text">
                    {showClientError("pincode") ? FormikForm.errors.pincode : "\u00A0"}
                  </div>
                </div>
              </Col>

              {/* ── country / Phone ── */}
              <Col md={6} lg={6} xxl={6}>
                <div className="mb-3">
                  <Label htmlFor="country_code" className="form-label">
                    Country Code *
                  </Label>
                  <Input
                    type="text"
                    name="country_code"
                    id="country_code"
                    className="form-control"
                    placeholder="e.g. IN"
                    value={clientData.country_code || ""}
                    readOnly
                    invalid={!!(hasAttemptedSubmit && FormikForm.errors.country_code)}
                  />
                   {hasAttemptedSubmit && FormikForm.errors.country_code ? (
                    <FormFeedback type="invalid">
                      {FormikForm.errors.country_code}
                    </FormFeedback>
                  ) : (
                    <div className="form-text">Auto-filled based on selected country.</div>
                  )}
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
                    onChange={(e) => {
                      handlePhoneNumberOnly(e);
                      const value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 10);
                      FormikForm.setFieldValue("phone_number", value);
                    }}
                    onBlur={() => {
                      if (
                        clientData.phone_number &&
                        String(clientData.phone_number).trim() !== ""
                      ) {
                        FormikForm.setFieldTouched("phone_number", true);
                      }
                    }}
                    invalid={!!showClientError("phone_number")}
                  />
                  <div className="lc_form_error_text">
                    {showClientError("phone_number") ? FormikForm.errors.phone_number : "\u00A0"}
                  </div>
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

                        FormikForm.setFieldValue("website", value);
                        checkMaxLength("website", value);
                      }}
                      onBlur={() => {
                        if (
                          clientData.website &&
                          clientData.website.trim() !== ""
                        ) {
                          FormikForm.setFieldTouched("website", true);
                        }
                      }}
                      invalid={
                        !!(
                          showClientError("website") || lengthWarnings.website
                        )
                      }
                    />

                    {!(
                      showClientError("website") || lengthWarnings.website
                    ) && <i className="ri-global-line" />}

                    {showClientError("website") && !lengthWarnings.website ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.website}
                      </FormFeedback>
                    ) : null}
                    {lengthWarnings.website && (
                      <div className="lc_form_error_text">
                        {lengthWarnings.website}
                      </div>
                    )}
                  </div>

                  {!(showClientError("website") || lengthWarnings.website) && (
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
                    onChange={(e) => {
                      handleGSTNumberOnly(e);
                      const value = e.target.value
                        .replace(/[^a-zA-Z0-9]/g, "")
                        .toUpperCase()
                        .slice(0, 15);
                      FormikForm.setFieldValue("gst_number", value);
                    }}
                    onBlur={() => {
                      if (
                        clientData.gst_number &&
                        String(clientData.gst_number).trim() !== ""
                      ) {
                        FormikForm.setFieldTouched("gst_number", true);
                      }
                    }}
                    invalid={!!showClientError("gst_number")}
                  />
                  <div className="lc_form_error_text">
                    {showClientError("gst_number") ? FormikForm.errors.gst_number : "\u00A0"}
                  </div>
                </div>
              </Col>

              {/* STATUS - SHOW ONLY IN EDIT MODE */}
              {isEdit && (
                <Col md={12}>
                  <div className="mb-3">
                    <Label htmlFor="status_toggle" className="form-label">
                      Status
                    </Label>

                    <div
                      className="form-check form-switch form-switch-md form-switch-success"
                      dir="ltr"
                    >
                      <Input
                        type="checkbox"
                        id="status_toggle"
                        className="form-check-input"
                        checked={clientData.status || false}
                        onChange={(e) =>
                          setClientData((prev) => ({
                            ...prev,
                            status: e.target.checked,
                          }))
                        }
                      />
                    </div>

                    <div className="form-text">
                      {clientData.status ? "Active" : "Inactive"}
                    </div>
                  </div>
                </Col>
              )}

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
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              setHasAttemptedLocationSubmit(true);

              await locationFormik.setValues(locationObj, false);

              const touchedFields = {};
              Object.keys(locationFormik.initialValues || {}).forEach((key) => {
                touchedFields[key] = true;
              });
              locationFormik.setTouched(touchedFields, false);

              const errors = await locationFormik.validateForm(locationObj);
              if (Object.keys(errors).length === 0) {
                locationFormik.handleSubmit();
              }
            }}
          >
            <Row className="gy-4">
              {/* Location Name */}
              <Col lg={12}>
                <Label className="form-label">
                  Location Name <span>*</span>
                </Label>
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
                    onBlur={() => {
                      if (locationObj.name && locationObj.name.trim() !== "") {
                        locationFormik.setFieldTouched("name", true);
                      }
                    }}
                    invalid={
                      !!(
                        showLocationError("name") ||
                        locationLengthWarnings.name
                      )
                    }
                  />
                  {!(
                    showLocationError("name") || locationLengthWarnings.name
                  ) && <i className="ri-building-2-line" />}
                  {showLocationError("name") &&
                  !locationLengthWarnings.name ? (
                    <FormFeedback type="invalid">
                      {locationFormik.errors.name}
                    </FormFeedback>
                  ) : null}
                  {locationLengthWarnings.name && (
                    <div className="lc_form_error_text">
                      {locationLengthWarnings.name}
                    </div>
                  )}
                </div>
                {!(
                  showLocationError("name") || locationLengthWarnings.name
                ) && (
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
                <Label className="form-label">
                  Address <span>*</span>
                </Label>
                <Input
                  type="textarea"
                  name="address"
                  rows="2"
                  value={locationObj.address || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(
                      /[^A-Za-z0-9\s.,\-#/'&]/g,
                      "",
                    );

                    setLocationObj((prev) => ({
                      ...prev,
                      address: value,
                    }));

                    locationFormik.setFieldValue("address", value);
                    checkLocationMaxLength("address", value);
                  }}
                  onBlur={() => {
                    if (
                      locationObj.address &&
                      locationObj.address.trim() !== ""
                    ) {
                      locationFormik.setFieldTouched("address", true);
                    }
                  }}
                  invalid={
                    !!(
                      showLocationError("address") ||
                      locationLengthWarnings.address
                    )
                  }
                />
                {showLocationError("address") &&
                  !locationLengthWarnings.address && (
                    <FormFeedback>
                      {locationFormik.errors.address}
                    </FormFeedback>
                  )}
                {locationLengthWarnings.address && (
                  <div className="lc_form_error_text">
                    {locationLengthWarnings.address}
                  </div>
                )}
              </Col>

              {/* Country */}
              <Col lg={12}>
                <Label className="form-label">
                  Country <span>*</span>
                </Label>
                <Select
                  options={CountryListOptions}
                  value={
                    CountryListOptions.find(
                      (d) => d.value === locationObj?.country,
                    ) || null
                  }
                  onChange={(e) => {
                    handleLocationCountryChange(e);
                    locationFormik.setFieldValue("country", e?.value || "");
                    locationFormik.setFieldTouched("country", true, false);
                    locationFormik.setFieldValue("state", "");
                    locationFormik.setFieldTouched("state", false, false);
                  }}
                  styles={selectStyles(
                    locationFormik.touched.country ||
                      hasAttemptedLocationSubmit,
                    locationFormik.errors.country,
                  )}
                />
                {showLocationError("country") && (
                  <div className="lc_form_error_text">
                    {locationFormik.errors.country}
                  </div>
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
                      (d) => d.value === locationObj?.state,
                    ) || null
                  }
                  onChange={(e) => {
                    handleLocationStateChange(e);
                    locationFormik.setFieldValue("state", e?.value || "");
                    locationFormik.setFieldTouched("state", true, false);
                  }}
                  styles={selectStyles(
                    locationFormik.touched.state || hasAttemptedLocationSubmit,
                    locationFormik.errors.state,
                  )}
                />
                {showLocationError("state") && (
                  <div className="lc_form_error_text">
                    {locationFormik.errors.state}
                  </div>
                )}
              </Col>

              {/* City */}
              <Col lg={12}>
                <Label className="form-label">
                  City <span>*</span>
                </Label>
                <div className="form-icon right">
                  <Input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={locationObj.city || ""}
                    onChange={handleLocationTextOnly}
                    onBlur={() => {
                      if (locationObj.city && locationObj.city.trim() !== "") {
                        locationFormik.setFieldTouched("city", true);
                      }
                    }}
                    invalid={
                      !!(
                        showLocationError("city") ||
                        locationLengthWarnings.city
                      )
                    }
                  />
                  {!(
                    showLocationError("city") || locationLengthWarnings.city
                  ) && <i className="ri-map-pin-line"></i>}
                  {showLocationError("city") &&
                    !locationLengthWarnings.city && (
                      <FormFeedback>{locationFormik.errors.city}</FormFeedback>
                    )}
                  {locationLengthWarnings.city && (
                    <div className="lc_form_error_text">
                      {locationLengthWarnings.city}
                    </div>
                  )}
                </div>
              </Col>

              {/* Pincode */}
              <Col lg={12}>
                <Label className="form-label">
                  Pincode <span>*</span>
                </Label>
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
                      locationFormik.setFieldValue("pincode", value);
                    }}
                    onBlur={() => {
                      if (
                        locationObj.pincode &&
                        String(locationObj.pincode).trim() !== ""
                      ) {
                        locationFormik.setFieldTouched("pincode", true);
                      }
                    }}
                    invalid={!!showLocationError("pincode")}
                  />
                  {!showLocationError("pincode") && (
                    <i className="ri-mail-line"></i>
                  )}
                  {showLocationError("pincode") && (
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
                  styles={selectStyles(
                    locationFormik.touched.timezone ||
                      hasAttemptedLocationSubmit,
                    locationFormik.errors.timezone,
                  )}
                  onChange={(e) => {
                    setLocationObj((prev) => ({ ...prev, timezone: e.value }));
                    locationFormik.setFieldValue("timezone", e.value);
                    locationFormik.setFieldTouched("timezone", true, false);
                  }}
                  options={timzone_options}
                  placeholder="Select a time zone"
                />
                {showLocationError("timezone") && (
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
