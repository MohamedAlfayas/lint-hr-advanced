import React, { useEffect, useRef, useState } from "react";
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
import { timzone_options } from "../../common/constant/Constants";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { PostApi } from "../../common/api/PostApi";
import { PutApi } from "../../common/api/PutApi";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { setBranch } from "../../redux/reducers/ChildReducer/BranchReducer";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import CountryList from "../../common/data/CountryList";
import LocationSearch from "../../pages/organization/LocationSearch";
import { setEmployee } from "../../redux/reducers/ChildReducer/EmployeeReducer";

// ── Initial state — type_id is set dynamically when modal opens ──────────────
const initialEmployeeLocationObj = {
  type: "employee",
  type_id: 0,
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

/**
 * LocationModal Props:
 * - isOpen         {boolean}   - controls modal visibility
 * - onClose        {function}  - called when modal should close
 * - employeeObj      {object}    - current employee object (needs id & location_details)
 * - setEmployeeObj   {function}  - update parent object
 * - locationToEdit {object}    - if editing, pass the location object; null for new
 */
const LocationModal = ({
  isOpen,
  onClose,
  employeeObj,
  setEmployeeObj,
  locationToEdit = null,
}) => {
  const dispatch = useDispatch();
  const inputRef = useRef();

  // ── State ────────────────────────────────────────────────────────────────
  const [employeeLocationObj, setEmployeeLocationObj] = useState({
    ...initialEmployeeLocationObj,
  });
  const [CountryListOptions, setCountryListOptions] = useState([]);
  const [locationStateOptions, setLocationStateOptions] = useState([]);

  // ── Seed country list once ───────────────────────────────────────────────
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

  // ── When modal opens, seed form data ─────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      if (locationToEdit) {
        // Edit mode — pre-fill with existing location, set type & type_id
        setEmployeeLocationObj({
          ...locationToEdit,
          type: "employee",
          type_id: employeeObj.id,
        });
      } else {
        // Add mode — reset to blank with correct type_id
        setEmployeeLocationObj({
          ...initialEmployeeLocationObj,
          type: "employee",
          type_id: employeeObj.id,
        });
      }
    }
  }, [isOpen, locationToEdit, employeeObj.id]);

  // ── Sync state options when country changes ───────────────────────────────
  useEffect(() => {
    if (employeeLocationObj?.country) {
      const found = CountryList.find(
        (d) => d.countryName === employeeLocationObj.country,
      );
      setLocationStateOptions(found?.states || []);
    } else {
      setLocationStateOptions([]);
    }
  }, [employeeLocationObj?.country]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  // ── Handlers ──────────────────────────────────────────────────────────────
  const setLocField = (name, value) => {
    setEmployeeLocationObj((prev) => ({ ...prev, [name]: value }));
    LocationFormikForm.setFieldValue(name, value);
  };

  const updateLocationEmployeeObj = (e) => {
    const { name, value } = e.target;
    setLocField(name, value);
  };

  const handleLocationNameChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-z0-9\s.,&()'-]/g, "");
    setLocField("name", value);
    LocationFormikForm.setFieldTouched("name", true, false);
    if (value.length > 100) {
      LocationFormikForm.setFieldError(
        "name",
        "Location name cannot exceed 100 characters",
      );
    } else {
      LocationFormikForm.setFieldError("name", undefined);
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-z0-9\s.,\-#/'&]/g, "");
    setLocField("address", value);
    if (value.length > 200) {
      LocationFormikForm.setFieldError(
        "address",
        "Address cannot exceed 200 characters",
      );
    } else {
      LocationFormikForm.setFieldError("address", undefined);
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-z\s.'-]/g, "");
    setLocField("city", value);
    if (value.length > 100) {
      LocationFormikForm.setFieldError(
        "city",
        "City cannot exceed 100 characters",
      );
    } else {
      LocationFormikForm.setFieldError("city", undefined);
    }
  };

  const handleLocationCountryChange = (e) => {
    const found = CountryList.find((d) => d.countryName === e?.value);
    setEmployeeLocationObj((prev) => ({
      ...prev,
      country: e?.value || "",
      state: "",
    }));
    setLocationStateOptions(found?.states || []);
  };

  const handleLocationStateChange = (e) => {
    setEmployeeLocationObj((prev) => ({ ...prev, state: e?.value || "" }));
  };
  const handleLocationImageUpdate = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedImageTypes.includes(file.type)) {
      toast.error("Only PNG, JPG, JPEG and WEBP image formats are allowed.");

      e.target.value = "";

      setEmployeeLocationObj((prev) => ({
        ...prev,
        image: null,
        image_url: null,
      }));

      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      setEmployeeLocationObj((prev) => ({
        ...prev,
        image: file,
        image_url: readerEvent.target.result,
      }));
    };

    reader.readAsDataURL(file);
  };
  // ── Helper: sync location_details in localStorage for a given key ─────────
  const syncLocationDetailsToLocalStorage = (
    GlobalMetaData,
    storageKey,
    typeId,
    locationId,
    response,
    isNew,
  ) => {
    const storageData = GlobalMetaData[storageKey];
    if (!Array.isArray(storageData)) return;

    GlobalMetaData[storageKey] = storageData.map((d) => {
      if (d.id === typeId) {
        const existingDetails = d.location_details || [];
        return {
          ...d,
          location_details: isNew
            ? [...existingDetails, response]
            : existingDetails.map((loc) =>
                loc.id === locationId ? response : loc,
              ),
        };
      }
      return d;
    });
  };

  // ── Formik ────────────────────────────────────────────────────────────────
  const LocationFormikForm = useFormik({
    enableReinitialize: true,
    initialValues: employeeLocationObj,
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .matches(/^[A-Za-z0-9\s.,&()'-]+$/, "Please Enter Location Name")
        .max(100, "Location name cannot exceed 100 characters")
        .required("Please Enter Location Name")
        .test(
          "not-only-spaces",
          "Please Enter Location Name",
          (value) => !value || value.trim().length > 0,
        ),
      address: Yup.string()
        .trim()
        .matches(/^[A-Za-z0-9\s.,\-#/'&]+$/, "Please Enter Address")
        .max(200, "Address cannot exceed 200 characters")
        .required("Please Enter Address"),
      country: Yup.string().required("Please Select Country"),
      state: Yup.string().required("Please Select State"),
      city: Yup.string()
        .trim()
        .matches(/^[A-Za-z\s.'-]+$/, "Please Enter City")
        .max(100, "City cannot exceed 100 characters")
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
        // ── Clean map_data (mirrors LocationGroupForm logic) ──────────
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

        // ── Payload mirrors LocationGroupForm exactly, type = "employee" ──
        const payload = {
          type: "employee",
          type_id: employeeObj.id,
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

        if (isNewLocation) {
          // ── ADD ───────────────────────────────────────────────────
          Api = await PostApi("location/entity-locations/", payload);
        } else {
          // ── EDIT ──────────────────────────────────────────────────
          Api = await PutApi(
            `location/entity-locations/${values.id}/`,
            payload,
          );
        }

        if ([200, 201].includes(Api?.status)) {
          const response = Api?.data;
          console.log("RES = ", response);
          const localStorageLocationGroupData = GetLocalStorageData("employee");

          // if (isNewLocation) {
          //   dispatch(addEntityLocation(locationWithGroup));
          // } else {
          //   dispatch(editEntityLocation(locationWithGroup));
          // }

          let updatedLocation = null;

          if (isNewLocation) {
            console.log("Form Obj while add - ", employeeObj);

            setEmployeeObj({
              ...employeeObj,
              entity_location_details: [
                ...employeeObj.entity_location_details,
                response,
              ],
            });

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
            console.log("Form Obj while edit - ", employeeObj);
            const existing_entity_location_details =
              [...employeeObj.entity_location_details] || [];
            console.log(
              "existing_entity_location_details = ",
              existing_entity_location_details,
            );
            const new_entity_location_details =
              existing_entity_location_details.map((d) => {
                if (d.id === response.id) {
                  return response;
                } else {
                  return d;
                }
              });

            setEmployeeObj({
              ...employeeObj,
              entity_location_details: new_entity_location_details,
            });

            console.log(
              "new_entity_location_details = ",
              new_entity_location_details,
            );

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
          GlobalMetaData["employee"] = updatedLocation;
          localStorage.setItem(
            "lint_hr_globaldata",
            JSON.stringify(GlobalMetaData),
          );

          dispatch(setEmployee(updatedLocation));

          toast.success(
            isNewLocation
              ? "Location added successfully."
              : "Location updated successfully.",
          );
          onClose();
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

  // ── Auto-focus first error field ──────────────────────────────────────────
  useEffect(() => {
    if (
      LocationFormikForm.submitCount > 0 &&
      Object.keys(LocationFormikForm.errors).length > 0
    ) {
      const firstErrorField = Object.keys(LocationFormikForm.errors)[0];
      LocationFormikForm.setFieldTouched(firstErrorField);
      const errorField = document.querySelector(`[name=${firstErrorField}]`);
      if (errorField) {
        errorField.focus();
      } else if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [
    LocationFormikForm.submitCount,
    LocationFormikForm.errors,
    LocationFormikForm.setFieldTouched,
  ]);

  // ── Shorthand ─────────────────────────────────────────────────────────────
  const f = LocationFormikForm;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal isOpen={isOpen} toggle={onClose} size="md">
      <ModalHeader toggle={onClose}>
        {locationToEdit ? "Edit Location" : "Add New Location"}
      </ModalHeader>

      <ModalBody>
        <Form onSubmit={f.handleSubmit}>
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
                  value={employeeLocationObj.name || ""}
                  onChange={handleLocationNameChange}
                  invalid={!!f.errors.name}
                />
                {!f.errors.name && <i className="ri-building-2-line" />}
                {f.errors.name && <FormFeedback>{f.errors.name}</FormFeedback>}
              </div>
            </Col>

            {/* Map / Accurate Address Search */}
            {/* Location Search (Google Maps autocomplete) */}
            <LocationSearch
              locationObj={employeeLocationObj}
              setLocationObj={setEmployeeLocationObj}
              LocationFormikForm={f}
            />

            {/* Address */}
            <Col lg={12}>
              <Label className="form-label">Address</Label>
              <Input
                type="textarea"
                name="address"
                rows="2"
                value={employeeLocationObj.address || ""}
                onChange={handleAddressChange}
                invalid={!!f.errors.address}
              />
              {f.errors.address && (
                <FormFeedback>{f.errors.address}</FormFeedback>
              )}
            </Col>

            {/* Country */}
            <Col lg={12}>
              <Label className="form-label">Country</Label>
              <Select
                options={CountryListOptions}
                value={
                  CountryListOptions.find(
                    (d) => d.value === employeeLocationObj?.country,
                  ) || null
                }
                onChange={handleLocationCountryChange}
              />
              {f.touched.country && f.errors.country && (
                <div className="lc_form_error_text">{f.errors.country}</div>
              )}
            </Col>

            {/* State */}
            <Col lg={12}>
              <Label className="form-label">State</Label>
              <Select
                options={locationStateOptions}
                value={
                  locationStateOptions.find(
                    (d) => d.value === employeeLocationObj?.state,
                  ) || null
                }
                onChange={handleLocationStateChange}
              />
              {f.touched.state && f.errors.state && (
                <div className="lc_form_error_text">{f.errors.state}</div>
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
                  value={employeeLocationObj.city || ""}
                  onChange={handleCityChange}
                  invalid={!!f.errors.city}
                />
                {!f.errors.city && <i className="ri-map-pin-line" />}
                {f.errors.city && <FormFeedback>{f.errors.city}</FormFeedback>}
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
                  value={employeeLocationObj.pincode || ""}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 6);
                    setLocField("pincode", value);
                  }}
                  invalid={!!f.errors.pincode}
                />
                {!f.errors.pincode && <i className="ri-mail-line" />}
                {f.errors.pincode && (
                  <FormFeedback>{f.errors.pincode}</FormFeedback>
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
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleLocationImageUpdate}
              />
              {employeeLocationObj.image_url && (
                <img
                  src={employeeLocationObj.image_url}
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
                  employeeLocationObj.timezone
                    ? timzone_options.find(
                        (e) => e.value === employeeLocationObj.timezone,
                      )
                    : null
                }
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    borderColor:
                      !state.isFocused &&
                      f.touched.timezone &&
                      f.errors.timezone
                        ? "red"
                        : provided.borderColor,
                  }),
                }}
                onChange={(e) =>
                  setEmployeeLocationObj((prev) => ({
                    ...prev,
                    timezone: e.value,
                  }))
                }
                options={timzone_options}
                placeholder="Select a time zone"
              />
              {f.touched.timezone && f.errors.timezone && (
                <div className="lc_form_error_text">{f.errors.timezone}</div>
              )}
            </Col>

            {/* Save Button */}
            <Col lg={12} className="text-end">
              <Button color="success" type="submit" className="btn-label">
                <i className="ri-check-double-line label-icon align-middle fs-16 me-2" />
                {locationToEdit ? "Update Location" : "Save Location"}
              </Button>
            </Col>
          </Row>
        </Form>
      </ModalBody>

      <ModalFooter />
    </Modal>
  );
};

export default LocationModal;
