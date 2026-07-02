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
import { PatchApi } from "../../common/api/PatchApi";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  addLocationGroup,
  editLocationGroup,
  addEntityLocation,
  editEntityLocation,
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

  console.log("Entity Location - ", entityLocations);

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

  useEffect(() => {
    if (locationObj?.country) {
      const found = CountryList.find(
        (d) => d.countryName === locationObj.country,
      );
      setLocationStateOptions(found?.states || []);
    }
  }, [locationObj?.country]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const updateLocationObj = (e) => {
    const { name, value } = e.target;
    setLocationObj((prev) => ({ ...prev, [name]: value }));
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
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setLocationObj((prev) => ({
          ...prev,
          image: e.target.files[0],
          image_url: readerEvent.target.result,
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAddClick = () => {
    setLocationObj({
      ...initialLocationObj,
      type_id: form_obj?.id,
      type: "location_group",
    });
    setModalOpen(true);
  };

  const handleEditLocation = (location) => {
    setLocationObj({
      ...location,
      type_id: form_obj?.id,
      type: "location_group",
    });
    setModalOpen(true);
  };

  const handleModalClose = () => setModalOpen(false);

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

  // ─── Location formik ──────────────────────────────────────────────────────────
  const locationFormik = useFormik({
    enableReinitialize: true,
    initialValues: locationObj,
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Location Name"),
      address: Yup.string().required("Please Enter Address"),
      country: Yup.string().required("Please Select Country"),
      state: Yup.string().required("Please Select State"),
      city: Yup.string().required("Please Enter City"),
      pincode: Yup.string().required("Please Enter Pincode"),
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

        const payload = {
          type: "location_group",
          type_id: form_obj?.id,
          name: values.name,
          address: values.address,
          city: values.city,
          state: values.state,
          country: values.country,
          pincode: values.pincode,
          timezone: values.timezone,
          accurate_address: values.accurate_address,
          radius_range: values.radius_range,
          latitude: values.latitude,
          longitude: values.longitude,
          location_id: values.location_id || null,
          map_data: map_data,
        };

        let Api;

        console.log("Location Payload - ", payload);

        console.log("Location Payload - ", payload);

        if (isNewLocation) {
          Api = await PostApi("location/entity-locations/", payload);
        } else {
          Api = await PutApi(
            `location/entity-locations/${values.id}/`,
            payload,
          );
        }

        if ([200, 201].includes(Api?.status)) {
          const response = Api?.data;
          console.log("RES = ", response);
          const localStorageLocationGroupData =
            GetLocalStorageData("location_groups");

          // if (isNewLocation) {
          //   dispatch(addEntityLocation(locationWithGroup));
          // } else {
          //   dispatch(editEntityLocation(locationWithGroup));
          // }

          let updatedLocation = null;

          if (isNewLocation) {
            console.log("Form Obj while add - ", form_obj);

            updatedLocation = localStorageLocationGroupData.map((d) => {
              if (d.id === values?.type_id) {
                return {
                  ...d,
                  entity_location_details: [
                    ...d.entity_location_details,
                    response,
                  ],
                };
              } else {
                return d;
              }
            });
          } else {
            console.log("Form Obj while edit - ", form_obj);
            const existing_entity_location_details =
              [...form_obj.entity_location_details] || [];
            const new_entity_location_details =
              existing_entity_location_details.map((d) => {
                if (d.id === response.id) {
                  return response;
                } else {
                  return d;
                }
              });

            updatedLocation = localStorageLocationGroupData.map((d) => {
              if (d.id === values?.type_id) {
                let newLD = d.entity_location_details.map((loc) => {
                  if (loc.id === response.id) {
                    return response;
                  } else {
                    return loc;
                  }
                });

                return {
                  ...d,
                  entity_location_details: newLD,
                };
              } else {
                return d;
              }
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
          console.log("Error - ", Api);
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

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <React.Fragment>
      {/* ── Main Group Form ── */}
      <Form onSubmit={formik.handleSubmit}>
        <Row className="gy-4 p-3">
          {/* Name */}
          <Col lg={12}>
            <Label className="form-label">
              Location Group Name <span>*</span>
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
                          src={
                            location.image_url ? location.image_url : no_image
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
                    innerRef={inputRef}
                    placeholder="Enter Location Name"
                    value={locationObj.name || ""}
                    onChange={updateLocationObj}
                    invalid={
                      locationFormik.touched.name &&
                      !!locationFormik.errors.name
                    }
                  />
                  {!locationFormik.touched.name &&
                    !locationFormik.errors.name && (
                      <i className="ri-building-2-line"></i>
                    )}
                  {locationFormik.touched.name &&
                    locationFormik.errors.name && (
                      <FormFeedback>{locationFormik.errors.name}</FormFeedback>
                    )}
                </div>
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
                    onChange={updateLocationObj}
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
                    type="number"
                    name="pincode"
                    placeholder="600001"
                    value={locationObj.pincode || ""}
                    onChange={updateLocationObj}
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

export default LocationGroupForm;
