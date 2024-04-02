import React, { useEffect, useMemo, useRef, useState } from "react";
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
  gender_options,
  form_default_input_types,
  form_select_type,
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

//SimpleBar

import CountryList from "../../common/data/CountryList";
import no_image from "../../assets/images/users/no_img.jpg";

import { toast } from "react-toastify";

import { GoogleMap, Marker } from "@react-google-maps/api";
import { useDispatch, useSelector } from "react-redux";
import { CountryCodeDisplayInSelect } from "../../common/js/CountryCodeDisplayInSelect";
import { PostApi } from "../../common/api/PostApi";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import {
  addBranch,
  editBranch,
} from "../../redux/reducers/ChildReducer/BranchReducer";
import {
  toggleRSBView,
  setFormTitle,
  setFormWidthPercentage,
  setComponentToShow,
  setFormObj,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";
import DistanceCalculaterInMap from "../../pages/attendance/DistanceCalculaterInMap";
import LocationSearch from "../../pages/organization/LocationSearch";
// import WebCheckInOutBtn from "../attendance/WebCheckInOutBtn";
import BranchLocationForm from "./Common/BranchLocationForm";

const BranchForm = () => {
  const dispatch = useDispatch();
  const initialBranchLocationObj = {
    id: 0,
    row_id: 0,
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

  const [stateListOptions, setStateListOptions] = useState([]);
  const [CountryCodeListOptions, setCountryCodeListOptions] = useState([]);
  const [branchLocationObj, setBranchLocationObj] = useState(
    initialBranchLocationObj
  );
  useEffect(() => {
    if (!!branchLocationObj?.country && branchLocationObj?.country !== "") {
      setStateListOptions(
        CountryList.find((d) => d.countryName === branchLocationObj?.country)
          .states || []
      );
    }
  }, [branchLocationObj]);

  const [CountryListOptions, setCountryListOptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const handleAddClick = () => {
    setModalOpen(true);
    setBranchLocationObj(initialBranchLocationObj);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };
  useEffect(() => {
    let country_code_list = [];
    let country_list = [];

    CountryList.filter((c) => c.show === true).map((d) => {
      country_code_list.push({
        ...d,
        label: d.countryCode,
        value: d.countryCode,
      });
      country_list.push({
        ...d,
        label: d.countryName,
        value: d.countryName,
      });
    });

    setCountryCodeListOptions(country_code_list);
    setCountryListOptions(country_list);
  }, []);

  const inputRef = useRef();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  useEffect(() => {
    setBranchObj(form_obj);
    if (!!form_obj?.country && form_obj?.country !== "") {
      setStateListOptions(
        CountryList.find((d) => d.countryName === form_obj?.country).states ||
          []
      );
    }
  }, [form_obj]);

  const [branchObj, setBranchObj] = useState({});

  const updateBranchObj = (e) => {
    const { name, value } = e.target;

    setBranchObj({
      ...branchObj,
      [name]: value,
    });
  };
  const updateLocationBranchObj = (e) => {
    const { name, value } = e.target;

    setBranchLocationObj({
      ...branchLocationObj,
      [name]: value,
    });
  };
  const handleCFInputChange = (e, cf_id) => {
    const newPD = {
      ...branchObj,
      cf_values: [...branchObj.cf_values].map((item) =>
        item.id === cf_id ? { ...item, value: e.target.value } : item
      ),
    };
    setBranchObj(newPD);
  };

  const handleCFDateChange = (e, dateStr, cf_id) => {
    setBranchObj({
      ...branchObj,
      cf_values: [...branchObj.cf_values].map((item) =>
        item.id === cf_id
          ? { ...item, value: ConvertISODateFormat(ConvertDateFormat(dateStr)) }
          : item
      ),
    });
  };

  const handleCountryCodeChange = (e) => {
    setBranchObj({
      ...branchObj,
      country_code: e.value,
    });
  };

  const handleCountryChange = (e) => {
    setBranchObj({
      ...branchObj,
      country: e.value,
    });

    setStateListOptions(
      CountryListOptions.find((d) => d.value === e.value).states || []
    );
  };

  const LocationFormikForm = useFormik({
    enableReinitialize: true,
    initialValues: branchLocationObj,
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
      const existing_location_details = [...branchObj?.location_details];

      if (values?.row_id === 0) {
        const new_id =
          existing_location_details.length > 0
            ? existing_location_details[existing_location_details.length - 1]
                .row_id + 1
            : 1;
        values["row_id"] = new_id;

        setBranchObj({
          ...branchObj,
          location_details: [...branchObj.location_details, values],
        });
      } else {
        const new_location_details = existing_location_details.map((d) => {
          if (d.id === values?.id) {
            return values;
          } else {
            return d;
          }
        });

        setBranchObj({
          ...branchObj,
          location_details: new_location_details,
        });
      }

      setShowTable(true);
      setModalOpen(false);
    },
  });
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

        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
  }, [
    LocationFormikForm.submitCount,
    LocationFormikForm.errors,
    LocationFormikForm.setFieldTouched,
    inputRef,
  ]);
  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: branchObj,
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Branch Name"),
      country_code: Yup.string().required("Please Select Country Code"),
      contact_number: Yup.string().required("Please Enter Contact Number"),
      contact_email: Yup.string()
        .email("Please Enter Valid Email")
        .required("Please Enter Email"),
    }),
    onSubmit: async (values) => {
      dispatch(setLoaderVisible(true));

      let form_data = new FormData();

      // Object.entries(values).map((key, value) => {
      //   if (key[0] === "cf_values" || key[0] == "map_data") {
      //     form_data.append(key[0], JSON.stringify(key[1]));
      //   }else {
      //     form_data.append(key[0], key[1]);
      //   }
      // });

      values.location_details.map((d, idx) => {
        if (d.image === null || d.image === undefined) {
          form_data.append(`location_${idx + 1}_image`, null);
        } else {
          form_data.append(`location_${idx + 1}_image`, d.image, d.image.name);
        }
      });

      Object.entries(values).forEach(([key, value]) => {
        // Check if the value is an array and the key is "location_details"
        if (
          key === "cf_values" ||
          key === "map_data" ||
          key === "location_details"
        ) {
          // Handle cf_values array separately
          form_data.append(key, JSON.stringify(value));
        } else {
          // Append other key-value pairs to FormData
          form_data.append(key, value);
        }
      });

      const Api = await PostApi("branch/add-new/", form_data, true);
      if (Api.status && Api.status === 200) {
        if (branchObj.id === 0) {
          dispatch(addBranch(Api?.data.data));
          SetLocalStorage("branch", Api?.data.data, 2);
        } else {
          dispatch(editBranch(Api?.data?.data));
          SetLocalStorage("branch", Api?.data.data, 3);
        }

        dispatch(toggleRSBView(false));
        toast.success(Api?.data?.message);
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail);
      }

      dispatch(setLoaderVisible(false));
    },
  });

  useEffect(() => {
    if (
      FormikForm.submitCount > 0 &&
      Object.keys(FormikForm.errors).length > 0
    ) {
      const firstErrorField = Object.keys(FormikForm.errors)[0];
      FormikForm.setFieldTouched(firstErrorField);
      const errorField = document.querySelector(`[name=${firstErrorField}]`);
      if (errorField) {
        errorField.focus();

        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
  }, [
    FormikForm.submitCount,
    FormikForm.errors,
    FormikForm.setFieldTouched,
    inputRef,
  ]);

  const handleEditLocation = (location, index) => {
    setModalOpen(true);
    setBranchLocationObj(location);
  };

  const handleLocationImageUpdate = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const newImageSrc = readerEvent.target.result;
        setBranchLocationObj({
          ...branchLocationObj,
          image: e.target.files[0],
          image_url: newImageSrc,
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl={12} lg={12}>
          <div>
            <Form onSubmit={FormikForm.handleSubmit}>
              <div className="live-preview">
                <Row className="gy-4">
                  <Col lg={12}>
                    <div>
                      <Label htmlFor="name" className="form-label">
                        Branch Name
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          className="form-control form-control-icon"
                          id="name"
                          name="name"
                          innerRef={inputRef}
                          placeholder="New Branch"
                          value={branchObj.name || ""}
                          onChange={updateBranchObj}
                          invalid={
                            FormikForm.touched.name && FormikForm.errors.name
                              ? true
                              : false
                          }
                        />
                        {!FormikForm.touched.name &&
                          !FormikForm.errors.name && (
                            <i className="ri-building-2-line"></i>
                          )}
                        {FormikForm.touched.name && FormikForm.errors.name ? (
                          <FormFeedback type="invalid">
                            {FormikForm.errors.name}
                          </FormFeedback>
                        ) : null}
                      </div>
                      {!FormikForm.errors.name && (
                        <div id="passwordHelpBlock" className="form-text">
                          Enter Your Branch Name.
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label>Contact Number*</Label>
                      <Row>
                        <Col md={3}>
                          <Select
                            id="country_code"
                            name="country_code"
                            isMulti={false}
                            options={CountryCodeListOptions || []}
                            components={{
                              Option: CountryCodeDisplayInSelect,
                            }}
                            className="basic-multi-select"
                            value={
                              branchObj?.country_code !== ""
                                ? CountryCodeListOptions.find(
                                    (d) =>
                                      d.countryCode === branchObj.country_code
                                  )
                                : []
                            }
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                borderColor:
                                  !state.isFocused &&
                                  FormikForm.touched.country_code &&
                                  FormikForm.errors.country_code
                                    ? "red !important"
                                    : provided.borderColor,
                              }),
                            }}
                            onChange={handleCountryCodeChange}
                            invalid={
                              FormikForm.touched.country_code &&
                              FormikForm.errors.country_code
                                ? true
                                : false
                            }
                          />
                          {FormikForm.touched.country_code &&
                          FormikForm.errors.country_code ? (
                            <div className="lc_form_error_text">
                              {FormikForm.errors.country_code}
                            </div>
                          ) : null}
                        </Col>
                        <Col md={9}>
                          <Input
                            type="number"
                            name="contact_number"
                            innerRef={inputRef}
                            className="form-control rounded-end flag-input"
                            placeholder="Enter number"
                            value={branchObj.contact_number || ""}
                            onChange={updateBranchObj}
                            invalid={
                              FormikForm.touched.contact_number &&
                              FormikForm.errors.contact_number
                                ? true
                                : false
                            }
                          />
                          {FormikForm.touched.contact_number &&
                          FormikForm.errors.contact_number ? (
                            <FormFeedback type="invalid">
                              {FormikForm.errors.contact_number}
                            </FormFeedback>
                          ) : null}
                        </Col>
                      </Row>
                      {!FormikForm.errors.contact_number && (
                        <div id="passwordHelpBlock" className="form-text">
                          Enter Your Contact number with country code.
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label htmlFor="contact_email" className="form-label">
                        Contact Email*
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          name="contact_email"
                          className="form-control form-control-icon"
                          id="contact_email"
                          placeholder="user@company.com"
                          value={branchObj.contact_email || ""}
                          onChange={updateBranchObj}
                          invalid={
                            FormikForm.touched.contact_email &&
                            FormikForm.errors.contact_email
                              ? true
                              : false
                          }
                        />
                        {!FormikForm.touched.contact_email &&
                          !FormikForm.errors.contact_email && (
                            <i className="ri-mail-line"></i>
                          )}
                        {FormikForm.touched.contact_email &&
                        FormikForm.errors.contact_email ? (
                          <FormFeedback type="invalid">
                            {FormikForm.errors.contact_email}
                          </FormFeedback>
                        ) : null}
                      </div>
                      {!FormikForm.errors.contact_email && (
                        <div id="passwordHelpBlock" className="form-text">
                          Enter Your Email.
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label htmlFor="about" className="form-label">
                        Company Overview
                      </Label>
                      <textarea
                        className="form-control"
                        id="about"
                        name="about"
                        rows="3"
                        value={branchObj.about || ""}
                        onChange={updateBranchObj}
                      ></textarea>
                      <div id="passwordHelpBlock" className="form-text">
                        Company Overview.
                      </div>
                    </div>
                  </Col>

                  {branchObj.cf_values && branchObj.cf_values.length
                    ? branchObj.cf_values.map((obj) => (
                        <Col lg={12}>
                          <div>
                            <Label htmlFor="lname" className="form-label">
                              {obj.name}
                            </Label>
                            {form_default_input_types.includes(obj.type) && (
                              <div className="form-icon right">
                                <Input
                                  type={obj.type || "text"}
                                  name={obj.input_name}
                                  id={obj.input_name}
                                  className="form-control"
                                  placeholder={`Enter ${obj.name}`}
                                  value={obj.value || ""}
                                  required={obj.is_required || false}
                                  onChange={(e) =>
                                    handleCFInputChange(e, obj.id)
                                  }
                                />
                              </div>
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
                                        DateFormat
                                      )
                                }
                                allowClear={false}
                                onChange={(e, dateStr) =>
                                  handleCFDateChange(e, dateStr, obj.id)
                                }
                              />
                            )}
                            <div id="passwordHelpBlock" className="form-text">
                              Enter {obj.name}
                            </div>
                          </div>
                        </Col>
                      ))
                    : null}
                  {branchObj?.location_details &&
                  branchObj.location_details.length > 0 ? (
                    <Col>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Radius</th>
                            <th>Image</th>
                            <th>Edit</th>
                            {/* Add more table headers as needed */}
                          </tr>
                        </thead>
                        <tbody>
                          {branchObj.location_details.map((location, index) => (
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
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "-moz-initial",
                                  }}
                                />
                              </td>

                              <td>
                                <a
                                  onClick={() =>
                                    handleEditLocation(location, index)
                                  }
                                  className="text-primary d-inline-block edit-item-btn ms-2"
                                  href="javascript:void(0)"
                                >
                                  <i class="ri-pencil-fill fs-16"></i>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Col>
                  ) : null}

                  <Row>
                    <Col>
                      <Row>
                        <Col lg={6} className="text-start">
                          <Button
                            color="btn btn-primary"
                            type="button"
                            onClick={handleAddClick}
                          >
                            Add{" "}
                            <i className="ri-add-line align-bottom me-1"></i>
                          </Button>
                        </Col>

                        <Col lg={6} className="text-end">
                          <Button
                            color="success"
                            type="submit"
                            className="btn-label"
                          >
                            <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                            Save
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Row>
              </div>
            </Form>

            <Modal isOpen={modalOpen} toggle={handleModalClose}>
              <ModalHeader toggle={handleModalClose}>
                Add New Location
              </ModalHeader>
              <ModalBody>
                <Row>
                  <Col xl={12} lg={12}>
                    <div>
                      <Form onSubmit={LocationFormikForm.handleSubmit}>
                        <div className="live-preview">
                          <Row className="gy-4">
                            <Col lg={12}>
                              <div>
                                <Label htmlFor="name" className="form-label">
                                  Location Name
                                </Label>
                                <div className="form-icon right">
                                  <Input
                                    type="text"
                                    className="form-control form-control-icon"
                                    id="name"
                                    name="name"
                                    innerRef={inputRef}
                                    placeholder="Enter Name"
                                    value={branchLocationObj.name || ""}
                                    onChange={updateLocationBranchObj}
                                    invalid={
                                      LocationFormikForm.touched.name &&
                                      LocationFormikForm.errors.name
                                        ? true
                                        : false
                                    }
                                  />
                                  {!LocationFormikForm.touched.name &&
                                    !LocationFormikForm.errors.name && (
                                      <i className="ri-building-2-line"></i>
                                    )}
                                  {LocationFormikForm.touched.name &&
                                  LocationFormikForm.errors.name ? (
                                    <FormFeedback type="invalid">
                                      {LocationFormikForm.errors.name}
                                    </FormFeedback>
                                  ) : null}
                                </div>
                                {!LocationFormikForm.errors.name && (
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text"
                                  >
                                    Enter Your Location Name.
                                  </div>
                                )}
                              </div>
                            </Col>

                            <LocationSearch
                              branchLocationObj={branchLocationObj}
                              setBranchLocationObj={setBranchLocationObj}
                              LocationFormikForm={LocationFormikForm}
                            />

                            <Col lg={12}>
                              <div>
                                <Label htmlFor="address" className="form-label">
                                  Address
                                </Label>
                                <Input
                                  type="textarea"
                                  className="form-control"
                                  id="address"
                                  name="address"
                                  rows="2"
                                  value={branchLocationObj.address || ""}
                                  onChange={updateLocationBranchObj}
                                  invalid={
                                    LocationFormikForm.touched.address &&
                                    LocationFormikForm.errors.address
                                      ? true
                                      : false
                                  }
                                />
                                {LocationFormikForm.touched.address &&
                                LocationFormikForm.errors.address ? (
                                  <FormFeedback type="invalid">
                                    {LocationFormikForm.errors.address}
                                  </FormFeedback>
                                ) : null}
                                {!LocationFormikForm.errors.address && (
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text"
                                  >
                                    Address.
                                  </div>
                                )}
                              </div>
                            </Col>

                            <Col lg={12}>
                              <div>
                                <Label htmlFor="country" className="form-label">
                                  Country
                                </Label>
                                <Select
                                  id="country"
                                  name="country"
                                  isMulti={false}
                                  options={CountryListOptions || []}
                                  className="basic-multi-select"
                                  value={
                                    branchLocationObj?.country !== ""
                                      ? CountryListOptions.find(
                                          (d) =>
                                            d.value ===
                                            branchLocationObj.country
                                        )
                                      : []
                                  }
                                  styles={{
                                    control: (provided, state) => ({
                                      ...provided,
                                      borderColor:
                                        !state.isFocused &&
                                        LocationFormikForm.touched.country &&
                                        LocationFormikForm.errors.country
                                          ? "red !important"
                                          : provided.borderColor,
                                    }),
                                  }}
                                  onChange={handleCountryChange}
                                  invalid={
                                    LocationFormikForm.touched.country &&
                                    LocationFormikForm.errors.country
                                      ? true
                                      : false
                                  }
                                />
                                {LocationFormikForm.touched.country &&
                                LocationFormikForm.errors.country ? (
                                  <div className="lc_form_error_text">
                                    {LocationFormikForm.errors.country}
                                  </div>
                                ) : null}
                                {!LocationFormikForm.errors.country && (
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text"
                                  >
                                    Enter Country.
                                  </div>
                                )}
                              </div>
                            </Col>

                            <Col lg={12}>
                              <div>
                                <Label
                                  htmlFor="exampleFormControlTextarea5"
                                  className="form-label"
                                >
                                  State
                                </Label>
                                <Select
                                  id="state"
                                  name="state"
                                  isMulti={false}
                                  options={stateListOptions || []}
                                  className="basic-multi-select"
                                  styles={{
                                    control: (provided, state) => ({
                                      ...provided,
                                      borderColor:
                                        !state.isFocused &&
                                        LocationFormikForm.touched.state &&
                                        LocationFormikForm.errors.state
                                          ? "red !important"
                                          : provided.borderColor,
                                    }),
                                  }}
                                  value={
                                    stateListOptions.find(
                                      (d) => d.value === branchLocationObj.state
                                    ) || []
                                  }
                                  onChange={(e) =>
                                    setBranchLocationObj({
                                      ...branchLocationObj,
                                      state: e.value,
                                    })
                                  }
                                  invalid={
                                    LocationFormikForm.touched.state &&
                                    LocationFormikForm.errors.state
                                      ? true
                                      : false
                                  }
                                />
                                {LocationFormikForm.touched.state &&
                                LocationFormikForm.errors.state ? (
                                  <div className="lc_form_error_text">
                                    {LocationFormikForm.errors.state}
                                  </div>
                                ) : null}
                                {!LocationFormikForm.errors.state && (
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text"
                                  >
                                    Select State.
                                  </div>
                                )}
                              </div>
                            </Col>

                            <Col lg={12}>
                              <div>
                                <Label htmlFor="city" className="form-label">
                                  City
                                </Label>
                                <div className="form-icon right">
                                  <Input
                                    type="text"
                                    className="form-control form-control-icon"
                                    id="city"
                                    name="city"
                                    placeholder="City"
                                    value={branchLocationObj.city || ""}
                                    onChange={updateLocationBranchObj}
                                    invalid={
                                      LocationFormikForm.touched.city &&
                                      LocationFormikForm.errors.city
                                        ? true
                                        : false
                                    }
                                  />
                                  {!LocationFormikForm.touched.city &&
                                    !LocationFormikForm.errors.city && (
                                      <i className="ri-mail-line"></i>
                                    )}
                                  {LocationFormikForm.touched.city &&
                                  LocationFormikForm.errors.city ? (
                                    <FormFeedback type="invalid">
                                      {LocationFormikForm.errors.city}
                                    </FormFeedback>
                                  ) : null}
                                </div>
                                {!LocationFormikForm.errors.city && (
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text"
                                  >
                                    Select City.
                                  </div>
                                )}
                              </div>
                            </Col>

                            <Col lg={12}>
                              <div>
                                <Label htmlFor="pincode" className="form-label">
                                  Pincode
                                </Label>
                                <div className="form-icon right">
                                  <Input
                                    type="number"
                                    className="form-control form-control-icon"
                                    id="pincode"
                                    name="pincode"
                                    placeholder="666666"
                                    value={branchLocationObj.pincode || ""}
                                    onChange={updateLocationBranchObj}
                                    invalid={
                                      LocationFormikForm.touched.pincode &&
                                      LocationFormikForm.errors.pincode
                                        ? true
                                        : false
                                    }
                                  />
                                  {!LocationFormikForm.touched.pincode &&
                                    !LocationFormikForm.errors.pincode && (
                                      <i className="ri-mail-line"></i>
                                    )}
                                  {LocationFormikForm.touched.pincode &&
                                  LocationFormikForm.errors.pincode ? (
                                    <FormFeedback type="invalid">
                                      {LocationFormikForm.errors.pincode}
                                    </FormFeedback>
                                  ) : null}
                                </div>
                                {!LocationFormikForm.errors.pincode && (
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text"
                                  >
                                    Pincode.
                                  </div>
                                )}
                              </div>
                            </Col>
                            <Col lg={12}>
                              <div className="form-icon right">
                                <div>
                                  <Label
                                    htmlFor="pincode"
                                    className="form-label"
                                  >
                                    Image
                                  </Label>
                                  <Input
                                    type={"file"}
                                    name="image"
                                    id="image"
                                    className="form-control"
                                    placeholder={`Choose Image`}
                                    onChange={handleLocationImageUpdate}
                                  />
                                  <i className="ri-user-2-line"></i>
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text"
                                  >
                                    Choose Image
                                  </div>
                                </div>
                              </div>
                            </Col>
                            <Col lg={12}>
                              <div>
                                <Label
                                  htmlFor="exampleFormControlTextarea5"
                                  className="form-label"
                                >
                                  Time Zone
                                </Label>
                                <div className="form-icon right">
                                  <Select
                                    name="timezone"
                                    id="timezone"
                                    value={
                                      branchLocationObj.timezone &&
                                      timzone_options.find(
                                        (e) =>
                                          e.value === branchLocationObj.timezone
                                      )
                                    }
                                    styles={{
                                      control: (provided, state) => ({
                                        ...provided,
                                        borderColor:
                                          !state.isFocused &&
                                          LocationFormikForm.touched.timezone &&
                                          LocationFormikForm.errors.timezone
                                            ? "red !important"
                                            : provided.borderColor,
                                      }),
                                    }}
                                    onChange={(e) =>
                                      setBranchLocationObj({
                                        ...branchLocationObj,
                                        timezone: e.value,
                                      })
                                    }
                                    options={timzone_options}
                                    placeholder="Select a time zone"
                                    invalid={
                                      LocationFormikForm.touched.timezone &&
                                      LocationFormikForm.errors.timezone
                                        ? true
                                        : false
                                    }
                                  />
                                  {!LocationFormikForm.touched.timezone &&
                                    !LocationFormikForm.errors.timezone && (
                                      <i className="ri-time-line"></i>
                                    )}
                                  {LocationFormikForm.touched.timezone &&
                                  LocationFormikForm.errors.timezone ? (
                                    <FormFeedback type="invalid">
                                      {LocationFormikForm.errors.timezone}
                                    </FormFeedback>
                                  ) : null}
                                </div>
                                {!LocationFormikForm.errors.timezone && (
                                  <div
                                    id="passwordHelpBlock"
                                    className="form-text"
                                  >
                                    Time Zone.
                                  </div>
                                )}
                              </div>
                            </Col>

                            <Col className="text-end">
                              <Button
                                color="success"
                                type="submit"
                                className="btn-label"
                              >
                                <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                                Save
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      </Form>
                    </div>
                  </Col>
                </Row>
              </ModalBody>
              <ModalFooter>
                {/* <Button color="secondary" onClick={handleModalClose}>Cancel</Button> */}
                {/* <Button color="primary">Save</Button> */}
              </ModalFooter>
            </Modal>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default BranchForm;
