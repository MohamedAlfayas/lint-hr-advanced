import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormFeedback,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Progress,
  Button,
} from "reactstrap";
import Select from "react-select";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

import classnames from "classnames";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import {
  addLeaveType,
  editLeaveType,
} from "../../redux/reducers/ChildReducer/LeaveTypeReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { Api } from "../../common/api/Api";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import {
  gender_options,
  leave_reset_options,
  leave_type_day_unit,
  leave_type_hour_unit,
  leave_types_options,
} from "../../common/constant/Constants";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";

// register lottie and define custom element
defineElement(loadAnimation);

const LeaveTypeForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [leaveTypeData, setLeaveTypeData] = useState({});
  const [currentUnit, setCurrentUnit] = useState(null);
  const ws_options = GetLocalStorageData("work_schedule") || [];
  const [selectedWS, setSelectedWS] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);

  useEffect(() => {
    console.log("form_obj = ", form_obj);
    setLeaveTypeData(form_obj);
    setCurrentUnit(form_obj.unit);
    setSelectedWS(
      ws_options.filter((data) => form_obj.ws_id.includes(data.id))
    );
    setSelectedGenders(
      gender_options.filter((data) => form_obj.genders.includes(data.id))
    );
  }, [form_obj]);

  // useEffect(() =>{
  //   if(unit){
  //     if(unit === 1){
  //       setLeaveTypeData({
  //         ...leaveTypeData,
  //         unit : unit,
  //         hour_value : ""
  //       })
  //     }
  //     else{
  //       setLeaveTypeData({
  //         ...leaveTypeData,
  //         unit : unit,
  //         day_value : ""
  //       })
  //     }
  //   }
  // },[unit])

  const handleWSChange = (obj) => {
    setSelectedWS(obj);
    setLeaveTypeData({
      ...leaveTypeData,
      ws_id: obj.map((d) => d.id),
    });
  };

  const handleGenderChange = (obj) => {
    setSelectedGenders(obj);
    setLeaveTypeData({
      ...leaveTypeData,
      genders: obj.map((d) => d.id),
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // const numericText = value.replace(/[^0-9]/g, "");
    console.log("name = ", name, "   value = ", value);
    setLeaveTypeData({
      ...leaveTypeData,
      [name]: value,
    });
  };
  const handleInputChangeLeaveCount = (e) => {
    const { name, value } = e.target;
    const numericText = value.replace(/[^0-9]/g, "");

    setLeaveTypeData({
      ...leaveTypeData,
      [name]: isNaN(parseInt(numericText)) ? 0 : parseInt(numericText),
    });
  };

  const handleUnitChange = (e) => {
    console.log("Unit Change = ", e);

    let newLeaveTypeData = {
      ...leaveTypeData,
      unit: e,
      hour_allowed_in_day: 0,
      allowed_count: 0,
    };

    if (e === 2) {
      newLeaveTypeData["weekend_between_leave"] = true;
      newLeaveTypeData["holiday_between_leave"] = true;
    }

    setLeaveTypeData(newLeaveTypeData);
    setCurrentUnit(e);
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: leaveTypeData,
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Leave Type Name"),
      type: Yup.number()
        .required("Select Role")
        .min(1, "Please Select Leave Type"),
      genders: Yup.array()
        .required("Please Select Gender")
        .min(1, "Please Select Gender"),
      ws_id: Yup.array()
        .required("Please Select Work Schedeule")
        .min(1, "Please Select Work Schedeule"),
    }),
    onSubmit: async (values) => {
      console.log("SUCCESSSS !!!! Formik Values = ", values);
      dispatch(setLoaderVisible(true));
      if (values.allowed_count === 0) {
        toast.error("Leave Days Must not be 0");
      } else if (values.unit === 2 && values.hour_allowed_in_day === 0) {
        toast.error("Leave Hour Must not be 0");
      } else {
        const Api = await PostApi(
          "/leave/leave_type/create/",
          leaveTypeData,
          false
        );
        console.log("API RES = ", Api);
        if (Api.status && Api.status === 200) {
          // leaveTypeData.id === 0
          //   ? dispatch(addLeaveType(Api?.data.data))
          //   : dispatch(editLeaveType(Api?.data?.data));

          if (leaveTypeData.id === 0) {
            dispatch(addLeaveType(Api?.data.data));
            SetLocalStorage("leave_types", Api?.data.data, 2);
          } else {
            dispatch(editLeaveType(Api?.data?.data));
            SetLocalStorage("leave_types", Api?.data.data, 3);
          }

          dispatch(toggleRSBView(false));
          toast.success(Api?.data?.message);
        } else {
          toast.error(Api?.data?.message || Api?.data?.detail);
        }
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
      console.log(firstErrorField);
      if (errorField) {
        errorField.focus();
      }
    }
  }, [FormikForm.submitCount, FormikForm.errors, FormikForm.setFieldTouched]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   console.log("Leave Type data = ", leaveTypeData);
  //   dispatch(setLoaderVisible(true));
  //   const Api = await PostApi(
  //     "/leave/leave_type/create/",
  //     leaveTypeData,
  //     false
  //   );
  //   console.log("API RES = ", Api);
  //   if (Api.status && Api.status === 200) {
  //     leaveTypeData.id === 0
  //       ? dispatch(addLeaveType(Api?.data.data))
  //       : dispatch(editLeaveType(Api?.data?.data));
  //     dispatch(toggleRSBView(false));
  //     toast.success(Api?.data?.message);
  //   } else {
  //     toast.error(Api?.data?.message || Api?.data?.detail);
  //   }
  //   dispatch(setLoaderVisible(false));
  // };

  return (
    <React.Fragment>
      <Row>
        <Col xl={40}>
          <Form className="form-steps" onSubmit={FormikForm.handleSubmit}>
            <Row>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="lName" className="form-label">
                    Name *
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="name"
                      id="lName"
                      className="form-control"
                      placeholder="Casual"
                      value={leaveTypeData.name || ""}
                      onChange={handleInputChange}
                      invalid={
                        FormikForm.touched.name && FormikForm.errors.name
                          ? true
                          : false
                      }
                    />
                    {!FormikForm.touched.name && !FormikForm.errors.name && (
                      <i className="ri-chat-new-line" />
                    )}
                    {FormikForm.touched.name && FormikForm.errors.name ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.name}
                      </FormFeedback>
                    ) : null}
                  </div>
                  {!FormikForm.errors.name && (
                    <div id="passwordHelpBlock" className="form-text">
                      Enter Leave Type Name.
                    </div>
                  )}
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="gender" className="form-label">
                    Type *
                  </Label>

                  <Select
                    name="type"
                    isMulti={false}
                    options={leave_types_options || []}
                    className="basic-multi-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          FormikForm.touched.type &&
                          FormikForm.errors.type
                            ? "red !important"
                            : provided.borderColor,
                      }),
                    }}
                    value={
                      (leaveTypeData.type &&
                        leave_types_options.find(
                          (e) => e.value === leaveTypeData.type
                        )) ||
                      []
                    }
                    onChange={(e) => {
                      setLeaveTypeData({ ...leaveTypeData, type: e.value });
                    }}
                    invalid={
                      FormikForm.touched.type && FormikForm.errors.type
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.type && FormikForm.errors.type ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.type}
                    </div>
                  ) : null}
                </div>
                {!FormikForm.errors.type && (
                  <div id="passwordHelpBlock" className="form-text mb-3">
                    Select Leave Type.
                  </div>
                )}
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="unit" className="form-label">
                    Unit *
                  </Label>
                  <div className="">
                    <div className="form-check form-check-inline">
                      <Input
                        id="lt_day"
                        name="Unit"
                        type="radio"
                        className="form-check-input"
                        checked={
                          leaveTypeData.unit && leaveTypeData.unit === 1
                            ? true
                            : false
                        }
                        onChange={() => handleUnitChange(leave_type_day_unit)}
                      />
                      <Label className="form-check-label" htmlFor="lt_day">
                        Days
                      </Label>
                    </div>
                    <div className="form-check form-check-inline">
                      <Input
                        id="lt_hour"
                        name="Unit"
                        type="radio"
                        className="form-check-input"
                        checked={
                          leaveTypeData.unit && leaveTypeData.unit === 2
                            ? true
                            : false
                        }
                        onChange={() => handleUnitChange(leave_type_hour_unit)}
                      />
                      <Label className="form-check-label" htmlFor="lt_hour">
                        Hour
                      </Label>
                    </div>
                  </div>
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Leave Type Unit.
                </div>
              </Col>

              {currentUnit && currentUnit === leave_type_day_unit && (
                <Col md={12} lg={12} xxl={12}>
                  <div className="mb-3">
                    <Label htmlFor="lt_days_allow" className="form-label">
                      Leave Days Count{" "}
                      <small>
                        <i>Allowed in a year</i>
                      </small>
                    </Label>
                    <div className="form-icon right">
                      <Input
                        type="number"
                        name="allowed_count"
                        id="lt_days_allow"
                        className="form-control"
                        placeholder="Year"
                        value={leaveTypeData.allowed_count || 0}
                        onChange={handleInputChangeLeaveCount}
                      />
                      <i className="ri-calendar-2-line"></i>
                    </div>
                    <div id="passwordHelpBlock" className="form-text">
                      Please Enter Leave Days Allowed in a year.
                    </div>
                  </div>
                </Col>
              )}

              {currentUnit && currentUnit === leave_type_hour_unit && (
                <Col md={12} lg={12} xxl={12}>
                  <div className="mb-3">
                    <Label htmlFor="lt_hour_allow_year" className="form-label">
                      Leave Hour{" "}
                      <small>
                        <i>Allowed in a Year</i>
                      </small>
                    </Label>
                    <div className="form-icon right">
                      <Input
                        type="number"
                        name="allowed_count"
                        id="lt_hour_allow_year"
                        className="form-control"
                        placeholder="Year"
                        value={leaveTypeData.allowed_count || 0}
                        onChange={handleInputChangeLeaveCount}
                      />
                      <i className="ri-time-line"></i>
                    </div>
                    <div id="passwordHelpBlock" className="form-text">
                      Please Enter Leave Hour Allowed in a year.
                    </div>
                  </div>
                  <div className="mb-3">
                    <Label htmlFor="lt_hour_allow_day" className="form-label">
                      Leave Hour{" "}
                      <small>
                        <i>Allowed in a Day</i>
                      </small>
                    </Label>
                    <div className="form-icon right">
                      <Input
                        type="number"
                        name="hour_allowed_in_day"
                        id="lt_hour_allow_day"
                        className="form-control"
                        placeholder="Day"
                        value={leaveTypeData.hour_allowed_in_day || 0}
                        onChange={handleInputChangeLeaveCount}
                      />
                      <i className="ri-time-line"></i>
                    </div>
                    <div id="passwordHelpBlock" className="form-text">
                      Please Enter Leave Hour Allowed in a day.
                    </div>
                  </div>
                </Col>
              )}

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="lt_reset" className="form-label">
                    Reset *
                  </Label>

                  <Select
                    isMulti={false}
                    options={leave_reset_options || []}
                    id="lt_reset"
                    className="basic-multi-select"
                    value={
                      (leaveTypeData.reset_type &&
                        leave_reset_options.find(
                          (e) => e.value === leaveTypeData.reset_type
                        )) ||
                      []
                    }
                    onChange={(e) => {
                      setLeaveTypeData({
                        ...leaveTypeData,
                        reset_type: e.value,
                      });
                    }}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Please Select Reset Leave.
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="lt_ws" className="form-label">
                    Applicable For *
                  </Label>

                  <Select
                    name="ws_id"
                    isMulti={true}
                    options={ws_options || []}
                    className="basic-multi-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          FormikForm.touched.ws_id &&
                          FormikForm.errors.ws_id
                            ? "red !important"
                            : provided.borderColor,
                      }),
                    }}
                    value={selectedWS || []}
                    onChange={handleWSChange}
                    invalid={
                      FormikForm.touched.ws_id && FormikForm.errors.ws_id
                        ? true
                        : false
                    }
                    closeMenuOnSelect={false}
                  />
                  {FormikForm.touched.ws_id && FormikForm.errors.ws_id ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.ws_id}
                    </div>
                  ) : null}
                </div>
                {!FormikForm.errors.ws_id && (
                  <div id="passwordHelpBlock" className="form-text mb-3">
                    Please select associate work schedule.
                  </div>
                )}
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="unit" className="form-label">
                    Gender *
                  </Label>
                  <Select
                    name="genders"
                    isMulti={true}
                    options={gender_options || []}
                    className="basic-multi-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          FormikForm.touched.genders &&
                          FormikForm.errors.genders
                            ? "red !important"
                            : provided.borderColor,
                      }),
                    }}
                    value={selectedGenders || []}
                    onChange={handleGenderChange}
                    invalid={
                      FormikForm.touched.genders && FormikForm.errors.genders
                        ? true
                        : false
                    }
                    closeMenuOnSelect={false}
                  />
                  {FormikForm.touched.genders && FormikForm.errors.genders ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.genders}
                    </div>
                  ) : null}
                </div>
                {!FormikForm.errors.genders && (
                  <div id="passwordHelpBlock" className="form-text mb-3">
                    Please select applicable Gender.
                  </div>
                )}
              </Col>
              {currentUnit && currentUnit === leave_type_day_unit && (
                <>
                  <Col md={12} lg={12} xxl={12}>
                    <div>
                      <Label htmlFor="lt_weekend" className="form-label">
                        Weekend Between Leave
                      </Label>
                      <div className="mb-2">
                        <div
                          className="form-check form-switch form-switch-md form-switch-success"
                          dir="ltr"
                        >
                          <Input
                            type="checkbox"
                            className="form-check-input form-switch-md"
                            id="lt_weekend"
                            checked={leaveTypeData.weekend_between_leave}
                            onChange={(e) =>
                              setLeaveTypeData({
                                ...leaveTypeData,
                                weekend_between_leave: e.target.checked,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col md={12} lg={12} xxl={12}>
                    <div>
                      <Label htmlFor="lt_holiday" className="form-label">
                        Holiday Between Leave
                      </Label>
                      <div className="mb-2">
                        <div
                          className="form-check form-switch form-switch-md form-switch-success"
                          dir="ltr"
                        >
                          <Input
                            type="checkbox"
                            className="form-check-input form-switch-md"
                            id="lt_holiday"
                            checked={leaveTypeData.holiday_between_leave}
                            onChange={(e) =>
                              setLeaveTypeData({
                                ...leaveTypeData,
                                holiday_between_leave: e.target.checked,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </Col>
                </>
              )}
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label className="form-label" htmlFor="lt_desc">
                    Description
                  </Label>
                  <Input
                    type="textarea"
                    className="form-control"
                    id="lt_desc"
                    name="description"
                    value={leaveTypeData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>
              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label">
                    {" "}
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Save{" "}
                  </Button>{" "}
                </div>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default LeaveTypeForm;
