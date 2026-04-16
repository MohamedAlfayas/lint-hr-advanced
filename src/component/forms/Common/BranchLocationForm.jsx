import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormGroup,
  FormFeedback,
  Input,
  Label,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import Select from "react-select";
import {
  gender_options,
  form_default_input_types,
  form_select_type,
  timzone_options,
  form_date_type,
  DateFormat,
} from "../../../common/constant/Constants";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../../common/js/ConvertDateFormat";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DatePicker } from "antd";
dayjs.extend(customParseFormat);
import { useFormik } from "formik";
import * as Yup from "yup";

// import indflag from "../../assets/images/flags/in.svg";
//SimpleBar
import SimpleBar from "simplebar-react";
import CountryList from "../../../common/data/CountryList";
import Dropzone from "react-dropzone";
import axios from "axios";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useDispatch, useSelector } from "react-redux";
import { CountryCodeDisplayInSelect } from "../../../common/js/CountryCodeDisplayInSelect";
import { PostApi } from "../../../common/api/PostApi";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import {
  addBranch,
  editBranch,
} from "../../../redux/reducers/ChildReducer/BranchReducer";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import DistanceCalculaterInMap from "../../../pages/attendance/DistanceCalculaterInMap";
import LocationSearch from "../../../pages/organization/LocationSearch";
import { values } from "lodash";

// import WebCheckInOutBtn from "../attendance/WebCheckInOutBtn";

const BranchLocationForm = ({ branchLocationObj }) => {
  const dispatch = useDispatch();

  const [stateListOptions, setStateListOptions] = useState([]);

  const [CountryCodeListOptions, setCountryCodeListOptions] = useState([]);
  const [CountryListOptions, setCountryListOptions] = useState([]);
  const [formDataArray, setFormDataArray] = useState([]);
  const [showTable, setShowTable] = useState(false);

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

  // const CountryListOptions1 = CountryList.filter((c) => c.show === true).map(
  //   (d) => {
  //     return {
  //       ...d,
  //       label: d.countryName,
  //       value: d.countryName,
  //     };
  //   }
  // );

  // const CountryCodeListOptions1 = CountryList.filter((c) => c.show === true).map(
  //   (d) => {
  //     return {
  //       ...d,
  //       label: d.countryCode,
  //       value: d.countryCode,
  //     };
  //   }
  // );

  const inputRef = useRef();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  useEffect(() => {
    setBranchObj(form_obj);
    if (!!form_obj?.country && form_obj?.country !== "") {
      setStateListOptions(
        CountryList.find((d) => d.countryName === form_obj?.country).states ||
          [],
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

  const handleCountryChange = (e) => {
    setBranchObj({
      ...branchObj,
      country: e.value,
    });

    setStateListOptions(
      CountryListOptions.find((d) => d.value === e.value).states || [],
    );
  };

  let globalValues;
  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: branchObj,
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
      globalValues = values;
      //     dispatch(setLoaderVisible(true));

      //     const Api = await PostApi("branch/add-new/", branchObj, false);
      //     console.log("API RES = ", Api);
      //     if (Api.status && Api.status === 200) {
      //         setFormDataArray([...formDataArray, values]);
      //         setShowTable(true);
      //         // branchObj.id === 0
      //         //   ? dispatch(addBranch(Api?.data?.data))
      //         //   : dispatch(editBranch(Api?.data?.data));

      //         if (branchObj.id === 0) {
      //             dispatch(addBranch(Api?.data.data));
      //             SetLocalStorage("branch", Api?.data.data, 2);
      //         } else {
      //             dispatch(editBranch(Api?.data?.data));
      //             SetLocalStorage("branch", Api?.data.data, 3);
      //         }

      //         dispatch(toggleRSBView(false));
      //         toast.success(Api?.data?.message);
      //     } else {
      //         toast.error(Api?.data?.message || Api?.data?.detail);
      //     }

      //     dispatch(setLoaderVisible(false));
    },
  });
  console.log("DATA", globalValues);
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
                        Location
                      </Label>
                      <div className="form-icon right">
                        <Input
                          type="text"
                          className="form-control form-control-icon"
                          id="name"
                          name="name"
                          innerRef={inputRef}
                          placeholder="Enter Name"
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
                          Enter Your Location Name.
                        </div>
                      )}
                    </div>
                  </Col>

                  <LocationSearch
                    locationObj={branchObj}
                    setLocationObj={setBranchObj}
                    LocationFormikForm={FormikForm}
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
                        value={branchObj.address || ""}
                        onChange={updateBranchObj}
                        invalid={
                          FormikForm.touched.address &&
                          FormikForm.errors.address
                            ? true
                            : false
                        }
                      />
                      {FormikForm.touched.address &&
                      FormikForm.errors.address ? (
                        <FormFeedback type="invalid">
                          {FormikForm.errors.address}
                        </FormFeedback>
                      ) : null}
                      {!FormikForm.errors.address && (
                        <div id="passwordHelpBlock" className="form-text">
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
                          branchObj?.country !== ""
                            ? CountryListOptions.find(
                                (d) => d.value === branchObj.country,
                              )
                            : []
                        }
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderColor:
                              !state.isFocused &&
                              FormikForm.touched.country &&
                              FormikForm.errors.country
                                ? "red !important"
                                : provided.borderColor,
                          }),
                        }}
                        onChange={handleCountryChange}
                        invalid={
                          FormikForm.touched.country &&
                          FormikForm.errors.country
                            ? true
                            : false
                        }
                      />
                      {FormikForm.touched.country &&
                      FormikForm.errors.country ? (
                        <div className="lc_form_error_text">
                          {FormikForm.errors.country}
                        </div>
                      ) : null}
                      {!FormikForm.errors.country && (
                        <div id="passwordHelpBlock" className="form-text">
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
                              FormikForm.touched.state &&
                              FormikForm.errors.state
                                ? "red !important"
                                : provided.borderColor,
                          }),
                        }}
                        value={
                          stateListOptions.find(
                            (d) => d.value === branchObj.state,
                          ) || []
                        }
                        onChange={(e) =>
                          setBranchObj({ ...branchObj, state: e.value })
                        }
                        invalid={
                          FormikForm.touched.state && FormikForm.errors.state
                            ? true
                            : false
                        }
                      />
                      {FormikForm.touched.state && FormikForm.errors.state ? (
                        <div className="lc_form_error_text">
                          {FormikForm.errors.state}
                        </div>
                      ) : null}
                      {!FormikForm.errors.state && (
                        <div id="passwordHelpBlock" className="form-text">
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
                          value={branchObj.city || ""}
                          onChange={updateBranchObj}
                          invalid={
                            FormikForm.touched.city && FormikForm.errors.city
                              ? true
                              : false
                          }
                        />
                        {!FormikForm.touched.city &&
                          !FormikForm.errors.city && (
                            <i className="ri-mail-line"></i>
                          )}
                        {FormikForm.touched.city && FormikForm.errors.city ? (
                          <FormFeedback type="invalid">
                            {FormikForm.errors.city}
                          </FormFeedback>
                        ) : null}
                      </div>
                      {!FormikForm.errors.city && (
                        <div id="passwordHelpBlock" className="form-text">
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
                          value={branchObj.pincode || ""}
                          onChange={updateBranchObj}
                          invalid={
                            FormikForm.touched.pincode &&
                            FormikForm.errors.pincode
                              ? true
                              : false
                          }
                        />
                        {!FormikForm.touched.pincode &&
                          !FormikForm.errors.pincode && (
                            <i className="ri-mail-line"></i>
                          )}
                        {FormikForm.touched.pincode &&
                        FormikForm.errors.pincode ? (
                          <FormFeedback type="invalid">
                            {FormikForm.errors.pincode}
                          </FormFeedback>
                        ) : null}
                      </div>
                      {!FormikForm.errors.pincode && (
                        <div id="passwordHelpBlock" className="form-text">
                          Pincode.
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
                        Time Zone
                      </Label>
                      <div className="form-icon right">
                        <Select
                          name="timezone"
                          id="timezone"
                          value={
                            branchObj.timezone &&
                            timzone_options.find(
                              (e) => e.value === branchObj.timezone,
                            )
                          }
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              borderColor:
                                !state.isFocused &&
                                FormikForm.touched.timezone &&
                                FormikForm.errors.timezone
                                  ? "red !important"
                                  : provided.borderColor,
                            }),
                          }}
                          onChange={(e) =>
                            setBranchObj({
                              ...branchObj,
                              timezone: e.value,
                            })
                          }
                          options={timzone_options}
                          placeholder="Select a time zone"
                          invalid={
                            FormikForm.touched.timezone &&
                            FormikForm.errors.timezone
                              ? true
                              : false
                          }
                        />
                        {!FormikForm.touched.timezone &&
                          !FormikForm.errors.timezone && (
                            <i className="ri-time-line"></i>
                          )}
                        {FormikForm.touched.timezone &&
                        FormikForm.errors.timezone ? (
                          <FormFeedback type="invalid">
                            {FormikForm.errors.timezone}
                          </FormFeedback>
                        ) : null}
                      </div>
                      {!FormikForm.errors.timezone && (
                        <div id="passwordHelpBlock" className="form-text">
                          Time Zone.
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col className="text-end">
                    <Button color="success" type="submit" className="btn-label">
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
    </React.Fragment>
  );
};

export default BranchLocationForm;
