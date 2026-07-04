import React, { useRef, useState, useEffect } from "react";
import {
  Button,
  Col,
  Form,
  Label,
  Input,
  FormFeedback,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Select from "react-select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { PostApi } from "../../common/api/PostApi";
import { PutApi } from "../../common/api/PutApi";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  addLocationGroup,
  editLocationGroup,
  setLocationGroup,
} from "../../redux/reducers/ChildReducer/LocationGroupReducer";
import { timzone_options } from "../../common/constant/Constants";
import CountryList from "../../common/data/CountryList";
import LocationSearch from "../../pages/organization/LocationSearch";
import no_image from "../../assets/images/users/no_img.jpg";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

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

const LocationGroupForm = () => {
  const dispatch = useDispatch();
  const inputRef = useRef();

  // ─── Redux ───────────────────────────────────────────────────────────────────
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const entityLocations = useSelector(
    (state) =>
      state.LocationGroupReducer.location_group_data.find(
        (g) => g.id === form_obj?.id,
      )?.entity_location_details || [],
  );

  const isEdit = parseInt(form_obj?.id) > 0;

  // ─── Location modal state ────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [locationObj, setLocationObj] = useState(initialLocationObj);
  const [locationStateOptions, setLocationStateOptions] = useState([]);
  const [CountryListOptions, setCountryListOptions] = useState([]);

  useEffect(() => {
    const list = CountryList.filter((c) => c.show === true).map((d) => ({
      ...d,
      label: d.countryName,
      value: d.countryName,
    }));
    setCountryListOptions(list);
  }, []);

  // ─── Main group formik ────────────────────────────────────────────────────────
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: form_obj?.name || "",
      description: form_obj?.description || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please enter a location group name"),
    }),
    onSubmit: async (values) => {
      dispatch(setLoaderVisible(true));
      try {
        let Api;
        if (isEdit) {
          Api = await PutApi(
            `location/location-groups/${form_obj.id}/`,
            values,
          );
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
          toast.error(
            Api?.data?.message || Api?.data?.detail || "Update failed.",
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

  // ─── Location formik (Formik = single source of truth) ────────────────────────
  const locationFormik = useFormik({
    enableReinitialize: true,
    initialValues: locationObj,
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Location Name"),
      address: Yup.string().required("Please Enter Address"),
      country: Yup.string().required("Please Select Country"),
      state: Yup.string().required("Please Select State"),
      city: Yup.string()
        .required("Please Enter City")
        .matches(/^[a-zA-Z\s]+$/, "City must contain letters only"),
      pincode: Yup.string()
        .required("Please Enter Pincode")
        .matches(/^[0-9]+$/, "Pincode must contain digits only"),
      timezone: Yup.string().required("Please Select Time Zone"),
      accurate_address: Yup.string().required("Please Enter Accurate Address"),
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

        // ─── Build multipart FormData ─────────────────────────────────────────
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
        // nested object must be stringified for FormData
        fd.append("map_data", JSON.stringify(map_data));

        // Append the actual File ONLY when a new image was selected.
        // Guarding with instanceof File avoids sending null/base64 and
        // avoids overwriting an existing image on edit when unchanged.
        if (values.image instanceof File) {
          fd.append("image", values.image);
        }

        let Api;
        if (isNewLocation) {
          Api = await PostApi("location/add-entity-location/", fd, true);
        } else {
          // Send id in body
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

  // ─── Auto-focus first error ───────────────────────────────────────────────────
  useEffect(() => {
    if (
      locationFormik.submitCount > 0 &&
      Object.keys(locationFormik.errors).length > 0
    ) {
      const firstErrorField = Object.keys(locationFormik.errors)[0];
      locationFormik.setFieldTouched(firstErrorField, true, false);
      const errorField = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorField) errorField.focus();
    }
  }, [locationFormik.submitCount]);

  // ─── Location helpers (update BOTH state + Formik) ────────────────────────────
  const setLocField = (name, value) => {
    setLocationObj((prev) => ({ ...prev, [name]: value }));
    locationFormik.setFieldValue(name, value);
  };

  const lv = locationFormik.values;
  const le = locationFormik.errors;
  const lt = locationFormik.touched;
  const isLocInvalid = (field) => !!(lt[field] && le[field]);
  const showLocHint = (field) => !le[field];

  const handleLocationCountryChange = (e) => {
    setLocField("country", e?.value || "");
    setLocField("state", "");
    const found = CountryList.find((d) => d.countryName === e?.value);
    setLocationStateOptions(found?.states || []);
  };

  const handleLocationImageUpdate = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setLocField("image_url", readerEvent.target.result); // base64 preview
      };
      reader.readAsDataURL(file);
      setLocField("image", file); // keep real File for FormData
    }
  };

  const handleAddClick = () => {
    setLocationObj({
      ...initialLocationObj,
      type_id: form_obj?.id,
      type: "location_group",
    });
    locationFormik.resetForm();
    setLocationStateOptions([]);
    setModalOpen(true);
  };

  const handleEditLocation = (location) => {
    setLocationObj({
      ...location,
      type_id: form_obj?.id,
      type: "location_group",
      image: null, // reset File; existing image stays via image_url unless re-selected
    });
    if (location?.country) {
      const found = CountryList.find((d) => d.countryName === location.country);
      setLocationStateOptions(found?.states || []);
    }
    setModalOpen(true);
  };

  const handleModalClose = () => setModalOpen(false);

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <React.Fragment>
      {/* ── Main Group Form ── */}
      <Form onSubmit={formik.handleSubmit}>
        <Row className="gy-4 p-3">
          {/* Name */}
          <Col lg={12}>
            <Label className="form-label">
              Location Group Name <span className="text-danger">*</span>
            </Label>
            <div className="form-icon right">
              <Input
                type="text"
                name="name"
                innerRef={inputRef}
                placeholder="e.g. Chennai Offices"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={formik.touched.name && !!formik.errors.name}
              />
              {!(formik.touched.name && formik.errors.name) && (
                <i className="ri-building-2-line" />
              )}
              {formik.touched.name && formik.errors.name && (
                <FormFeedback>{formik.errors.name}</FormFeedback>
              )}
            </div>
          </Col>

          {/* Description */}
          <Col lg={12}>
            <Label className="form-label">Description</Label>
            <Input
              type="textarea"
              name="description"
              rows="3"
              placeholder="e.g. All branches in Chennai region"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </Col>

          {/* ── Locations Table — driven by Redux ── */}
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
                          src={location.image_url || no_image}
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
                <Button color="success" type="submit">
                  {isEdit ? "Update" : "Save"}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>

      {/* ── Location Modal ── */}
      <Modal isOpen={modalOpen} toggle={handleModalClose} size="md">
        <ModalHeader toggle={handleModalClose}>
          {lv.id === 0 ? "Add New Location" : "Edit Location"}
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={locationFormik.handleSubmit} noValidate>
            <Row className="gy-4">
              {/* Location Name */}
              <Col lg={12}>
                <Label htmlFor="loc_name" className="form-label">
                  Location Name <span>*</span>
                </Label>
                <div className="form-icon right">
                  <Input
                    type="text"
                    id="loc_name"
                    name="name"
                    placeholder="Enter Location Name"
                    value={lv.name || ""}
                    onChange={(ev) => setLocField("name", ev.target.value)}
                    onBlur={() => locationFormik.setFieldTouched("name", true)}
                    invalid={isLocInvalid("name")}
                  />
                  {!isLocInvalid("name") && (
                    <i className="ri-building-2-line"></i>
                  )}
                  {isLocInvalid("name") && (
                    <FormFeedback>{le.name}</FormFeedback>
                  )}
                </div>
                {showLocHint("name") && (
                  <div className="form-text">Enter location name.</div>
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
                <Label htmlFor="loc_address" className="form-label">
                  Address <span>*</span>
                </Label>
                <Input
                  type="textarea"
                  id="loc_address"
                  name="address"
                  rows="2"
                  value={lv.address || ""}
                  onChange={(ev) => setLocField("address", ev.target.value)}
                  onBlur={() => locationFormik.setFieldTouched("address", true)}
                  invalid={isLocInvalid("address")}
                />
                {isLocInvalid("address") && (
                  <FormFeedback>{le.address}</FormFeedback>
                )}
                {showLocHint("address") && (
                  <div className="form-text">Enter address.</div>
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
                    CountryListOptions.find((d) => d.value === lv.country) ||
                    null
                  }
                  onChange={handleLocationCountryChange}
                  onBlur={() => locationFormik.setFieldTouched("country", true)}
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
                  <div className="lc_form_error_text">{le.country}</div>
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
                  name="state"
                  options={locationStateOptions}
                  value={
                    locationStateOptions.find((d) => d.value === lv.state) ||
                    null
                  }
                  onChange={(opt) => {
                    setLocField("state", opt?.value || "");
                    locationFormik.setFieldTouched("state", true);
                  }}
                  onBlur={() => locationFormik.setFieldTouched("state", true)}
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
                    id="loc_city"
                    name="city"
                    placeholder="City"
                    value={lv.city || ""}
                    onChange={(ev) => {
                      const val = ev.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setLocField("city", val);
                    }}
                    onBlur={() => locationFormik.setFieldTouched("city", true)}
                    invalid={isLocInvalid("city")}
                  />
                  {!isLocInvalid("city") && <i className="ri-map-pin-line"></i>}
                  {isLocInvalid("city") && (
                    <FormFeedback>{le.city}</FormFeedback>
                  )}
                </div>
                {showLocHint("city") && (
                  <div className="form-text">Enter city (letters only).</div>
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
                    id="loc_pincode"
                    name="pincode"
                    placeholder="600001"
                    inputMode="numeric"
                    value={lv.pincode || ""}
                    onChange={(ev) => {
                      const val = ev.target.value.replace(/[^0-9]/g, "");
                      setLocField("pincode", val);
                    }}
                    onBlur={() =>
                      locationFormik.setFieldTouched("pincode", true)
                    }
                    invalid={isLocInvalid("pincode")}
                  />
                  {!isLocInvalid("pincode") && (
                    <i className="ri-map-2-line"></i>
                  )}
                  {isLocInvalid("pincode") && (
                    <FormFeedback>{le.pincode}</FormFeedback>
                  )}
                </div>
                {showLocHint("pincode") && (
                  <div className="form-text">Enter pincode (digits only).</div>
                )}
              </Col>

              {/* Image */}
              <Col lg={12}>
                <Label htmlFor="loc_image" className="form-label">
                  Image
                </Label>
                <Input
                  type="file"
                  name="image"
                  id="loc_image"
                  accept="image/*"
                  className="form-control"
                  onChange={handleLocationImageUpdate}
                />
                {lv.image_url && (
                  <img
                    src={lv.image_url}
                    alt="preview"
                    className="mt-2"
                    style={{
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                )}
                <div className="form-text">Choose image.</div>
              </Col>

              {/* Timezone */}
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
                      ? timzone_options.find((opt) => opt.value === lv.timezone)
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
                  onChange={(opt) => setLocField("timezone", opt.value)}
                  onBlur={() =>
                    locationFormik.setFieldTouched("timezone", true)
                  }
                />
                {lt.timezone && le.timezone && (
                  <div className="lc_form_error_text">{le.timezone}</div>
                )}
                {showLocHint("timezone") && (
                  <div className="form-text">Select time zone.</div>
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

export default LocationGroupForm;
