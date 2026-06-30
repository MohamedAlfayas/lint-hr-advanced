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
  const role_options = GetLocalStorageData("role") || [];
  console.log(role_options, "option");

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedWS, setSelectedWS] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);

  useEffect(() => {
    setLeaveTypeData(form_obj);
    setCurrentUnit(form_obj.unit);

    setSelectedWS(
      ws_options.filter((data) => form_obj.ws_id?.includes(data.id)),
    );

    setSelectedGenders(
      gender_options.filter((data) => form_obj.genders?.includes(data.id)),
    );

    // ✅ NEW
    setSelectedRoles(
      role_options.filter((data) => form_obj.role_id?.includes(data.id)),
    );
  }, [form_obj]);

  const handleRoleChange = (obj) => {
    setSelectedRoles(obj);
    setLeaveTypeData({
      ...leaveTypeData,
      role_id: obj.map((d) => d.id),
    });
  };

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
    if (name === "name") {
      const textOnly = value.replace(/[^a-zA-Z\s]/g, "");
      setLeaveTypeData({ ...leaveTypeData, [name]: textOnly });
    } else {
      setLeaveTypeData({ ...leaveTypeData, [name]: value });
    }
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
      name: Yup.string()
        .required("Please Enter Leave Type Name")
        .trim()
        .matches(/^[a-zA-Z\s]+$/, "Name must contain letters only")
        .min(2, "Name must be at least 2 characters"),
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
      dispatch(setLoaderVisible(true));
      if (values.allowed_count === 0) {
        toast.error("Leave Days Must not be 0");
      } else if (values.unit === 2 && values.hour_allowed_in_day === 0) {
        toast.error("Leave Hour Must not be 0");
      } else {
        const Api = await PostApi(
          "/leave/leave_type/create/",
          leaveTypeData,
          false,
        );
        if (Api.status && Api.status === 200) {
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
      if (errorField) {
        errorField.focus();
      }
    }
  }, [FormikForm.submitCount, FormikForm.errors, FormikForm.setFieldTouched]);

  return (
    <React.Fragment>
      <Row>
        <Col xl={40}>
          <Form className="form-steps" onSubmit={FormikForm.handleSubmit}>
            <Row>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="last_namename" className="form-label">
                    Name *
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="name"
                      id="last_namename"
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
                    classNamePrefix="lc-select"
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
                          (e) => e.value === leaveTypeData.type,
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
                        value={leaveTypeData.allowed_count ?? 0}
                        onFocus={() => {
                          if (!leaveTypeData.allowed_count) {
                            setLeaveTypeData({
                              ...leaveTypeData,
                              allowed_count: "",
                            });
                          }
                        }}
                        onBlur={() => {
                          if (
                            leaveTypeData.allowed_count === "" ||
                            leaveTypeData.allowed_count === null
                          ) {
                            setLeaveTypeData({
                              ...leaveTypeData,
                              allowed_count: 0,
                            });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "-" ||
                            e.key === "e" ||
                            e.key === "E" ||
                            e.key === "+"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setLeaveTypeData({
                              ...leaveTypeData,
                              allowed_count: "",
                            });
                          } else {
                            const parsed = parseInt(val, 10);
                            setLeaveTypeData({
                              ...leaveTypeData,
                              allowed_count:
                                isNaN(parsed) || parsed < 0 ? 0 : parsed,
                            });
                          }
                        }}
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
                        value={leaveTypeData.allowed_count ?? 0}
                        onFocus={() => {
                          if (!leaveTypeData.allowed_count) {
                            setLeaveTypeData({
                              ...leaveTypeData,
                              allowed_count: "",
                            });
                          }
                        }}
                        onBlur={() => {
                          if (
                            leaveTypeData.allowed_count === "" ||
                            leaveTypeData.allowed_count === null
                          ) {
                            setLeaveTypeData({
                              ...leaveTypeData,
                              allowed_count: 0,
                            });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "-" ||
                            e.key === "e" ||
                            e.key === "E" ||
                            e.key === "+"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setLeaveTypeData({
                              ...leaveTypeData,
                              allowed_count: "",
                            });
                          } else {
                            const parsed = parseInt(val, 10);
                            setLeaveTypeData({
                              ...leaveTypeData,
                              allowed_count:
                                isNaN(parsed) || parsed < 0 ? 0 : parsed,
                            });
                          }
                        }}
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
                        value={leaveTypeData.hour_allowed_in_day ?? 0}
                        onFocus={() => {
                          if (!leaveTypeData.hour_allowed_in_day) {
                            setLeaveTypeData({
                              ...leaveTypeData,
                              hour_allowed_in_day: "",
                            });
                          }
                        }}
                        onBlur={() => {
                          if (
                            leaveTypeData.hour_allowed_in_day === "" ||
                            leaveTypeData.hour_allowed_in_day === null
                          ) {
                            setLeaveTypeData({
                              ...leaveTypeData,
                              hour_allowed_in_day: 0,
                            });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "-" ||
                            e.key === "e" ||
                            e.key === "E" ||
                            e.key === "+"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setLeaveTypeData({
                              ...leaveTypeData,
                              hour_allowed_in_day: "",
                            });
                          } else {
                            const parsed = parseInt(val, 10);
                            setLeaveTypeData({
                              ...leaveTypeData,
                              hour_allowed_in_day:
                                isNaN(parsed) || parsed < 0 ? 0 : parsed,
                            });
                          }
                        }}
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
                    classNamePrefix="lc-select"
                    value={
                      (leaveTypeData.reset_type &&
                        leave_reset_options.find(
                          (e) => e.value === leaveTypeData.reset_type,
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
                    Applicable For Workschedule*
                  </Label>

                  <Select
                    name="ws_id"
                    isMulti
                    options={ws_options || []}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
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
              <Col md={12}>
                <div>
                  <Label className="form-label">Applicable For Role*</Label>

                  <Select
                    isMulti
                    options={role_options || []}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
                    value={selectedRoles || []}
                    onChange={handleRoleChange}
                    closeMenuOnSelect={false}
                  />
                </div>
                <div className="form-text mb-3">Select applicable roles.</div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="unit" className="form-label">
                    Gender *
                  </Label>
                  <Select
                    name="genders"
                    isMulti
                    options={gender_options || []}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
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
                      <Label
                        htmlFor="lt_weekend_between_leave"
                        className="form-label"
                      >
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
                            id="lt_weekend_between_leave"
                            checked={
                              leaveTypeData.weekend_between_leave || false
                            }
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
                      <Label
                        htmlFor="lt_holiday_between_leave"
                        className="form-label"
                      >
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
                            id="lt_holiday_between_leave"
                            checked={
                              leaveTypeData.holiday_between_leave || false
                            }
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
                  {/* ✅ Config Exempt */}
                  <Col md={12}>
                    <Label htmlFor="lt_config_exempt" className="form-label">
                      Config Exempt
                    </Label>
                    <div className="mb-2">
                      <div className="form-check form-switch form-switch-md form-switch-success">
                        <Input
                          type="checkbox"
                          className="form-check-input form-switch-md"
                          id="lt_config_exempt"
                          checked={leaveTypeData.is_config_exempt || false}
                          onChange={(e) =>
                            setLeaveTypeData({
                              ...leaveTypeData,
                              is_config_exempt: e.target.checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </Col>

                  {/* ✅ Allow Employee to Exceed */}
                  {/* <Col md={12}>
                    <Label htmlFor="lt_exceed_limit" className="form-label">
                      Allow Employee to Exceed Limit
                    </Label>
                    <div className="mb-2">
                    <div className="form-check form-switch form-switch-md form-switch-success">
                      <Input
                        type="checkbox"
                        className="form-check-input form-switch-md"
                        id="lt_exceed_limit"
                        checked={
                          leaveTypeData.allow_employee_to_exceed_limit || false
                        }
                        onChange={(e) =>
                          setLeaveTypeData({
                            ...leaveTypeData,
                            allow_employee_to_exceed_limit: e.target.checked,
                          })
                        }
                      />
                    </div>
                    </div>
                  </Col> */}

                  {/* ✅ Carry Forward Toggle */}
                  <Col md={12}>
                    <Label htmlFor="lt_carry_forward" className="form-label">
                      Allow Carry Forward
                    </Label>
                    <div className="mb-2">
                      <div className="form-check form-switch form-switch-md form-switch-success">
                        <Input
                          type="checkbox"
                          className="form-check-input form-switch-md"
                          id="lt_carry_forward"
                          checked={
                            leaveTypeData.allowed_to_carry_forward || false
                          }
                          onChange={(e) =>
                            setLeaveTypeData({
                              ...leaveTypeData,
                              allowed_to_carry_forward: e.target.checked,
                              carry_forward_limit: e.target.checked
                                ? leaveTypeData.carry_forward_limit
                                : 0,
                            })
                          }
                        />
                      </div>
                    </div>
                  </Col>
                  {leaveTypeData.allowed_to_carry_forward && (
                    <Col md={12}>
                      <div className="mb-3">
                        <Label className="form-label">
                          Carry Forward Limit
                        </Label>
                        <Input
                          type="number"
                          name="carry_forward_limit"
                          className="form-control"
                          min={0}
                          value={leaveTypeData.carry_forward_limit ?? 0}
                          onFocus={(e) => {
                            if (
                              leaveTypeData.carry_forward_limit === 0 ||
                              leaveTypeData.carry_forward_limit === "0"
                            ) {
                              setLeaveTypeData({
                                ...leaveTypeData,
                                carry_forward_limit: "",
                              });
                            }
                          }}
                          onBlur={(e) => {
                            if (
                              e.target.value === "" ||
                              e.target.value === null
                            ) {
                              setLeaveTypeData({
                                ...leaveTypeData,
                                carry_forward_limit: 0,
                              });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === "-" ||
                              e.key === "e" ||
                              e.key === "E" ||
                              e.key === "+"
                            ) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            if (e.target.value === "") {
                              setLeaveTypeData({
                                ...leaveTypeData,
                                carry_forward_limit: "",
                              });
                            } else {
                              const val = parseInt(e.target.value);
                              setLeaveTypeData({
                                ...leaveTypeData,
                                carry_forward_limit:
                                  isNaN(val) || val < 0 ? 0 : val,
                              });
                            }
                          }}
                        />
                        <div className="form-text">
                          Enter maximum carry forward limit.
                        </div>
                      </div>
                    </Col>
                  )}
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
