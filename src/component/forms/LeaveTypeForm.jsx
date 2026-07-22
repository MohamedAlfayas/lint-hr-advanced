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

  const [daysCountError, setDaysCountError] = useState("");
  const [carryForwardError, setCarryForwardError] = useState("");

  const canEditLeaveType = (field) => {
    const isFrozen =
      leaveTypeData?.id > 0 &&
      [1, 2].includes(leaveTypeData?.type);

    if (!isFrozen) return true;

    return ["status", "save"].includes(field);
  };
  

  useEffect(() => {
    // setLeaveTypeData(form_obj);
    // setLeaveTypeData({
    //   ...form_obj,
    //   is_credit_based: form_obj?.is_credit_based ?? false,
    //   monthly_allowed_count: form_obj?.monthly_allowed_count ?? 0,
    // });
    setLeaveTypeData({
      ...form_obj,
      is_credit_based: form_obj?.is_credit_based ?? false,
      allowed_count: form_obj?.allowed_count || "",
      monthly_allowed_count: form_obj?.monthly_allowed_count || "",
    });
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
    if (!canEditLeaveType("role")) return;
    setSelectedRoles(obj);
    const roles = obj.map((d) => d.id);
    setLeaveTypeData({
      ...leaveTypeData,
      role_id: roles,
    });
    FormikForm.setFieldValue("role_id", roles);
  };

  const handleWSChange = (obj) => {
    if (!canEditLeaveType("ws")) return;
    setSelectedWS(obj);
    setLeaveTypeData({
      ...leaveTypeData,
      ws_id: obj.map((d) => d.id),
    });
  };

  const handleGenderChange = (obj) => {
    if (!canEditLeaveType("gender")) return;
    setSelectedGenders(obj);
    setLeaveTypeData({
      ...leaveTypeData,
      genders: obj.map((d) => d.id),
    });
  };

  const handleInputChange = (e) => {
    if (!canEditLeaveType("name")) return;
    const { name, value } = e.target;
    if (name === "name") {
      const textOnly = value.replace(/[^a-zA-Z0-9\s.,?!"'_\-()&:;/\\]/g,
      "");
     
      setLeaveTypeData({ ...leaveTypeData, [name]: textOnly });
      FormikForm.setFieldValue(name, textOnly);
    } 
    
    else if (name === "description") {
      const textOnly = value
        .replace(/[^a-zA-Z0-9\s.,?!"'_\-()&:;/\\]/g, ""); 

      setLeaveTypeData({ ...leaveTypeData, [name]: textOnly });
      FormikForm.setFieldValue(name, textOnly);
      if (textOnly.length > 200) {
        FormikForm.setFieldError(
          "description",
          "Description is too long. Please keep it within 200 characters."
        );
      } else {
        FormikForm.setFieldError("description", undefined);
      }
    }

    else {
      setLeaveTypeData({ ...leaveTypeData, [name]: value });
      FormikForm.setFieldValue(name, value);
    }
  };
  const handleInputChangeLeaveCount = (e) => {
    if (!canEditLeaveType("count")) return;
    const { name, value } = e.target;
    const numericText = value.replace(/[^0-9]/g, "");

    setLeaveTypeData({
      ...leaveTypeData,
      [name]: isNaN(parseInt(numericText)) ? 0 : parseInt(numericText),
    });
  };

  const handleUnitChange = (e) => {
    if (!canEditLeaveType("unit")) return;
    let newLeaveTypeData = {
      ...leaveTypeData,
      unit: e,
      hour_allowed_in_day: 0,
      allowed_count: 0,
    };

    if (e === leave_type_hour_unit) {
      newLeaveTypeData.is_credit_based = false;
    }

    // if (e === 2) {
    if (e === leave_type_hour_unit) {
      newLeaveTypeData["weekend_between_leave"] = true;
      newLeaveTypeData["holiday_between_leave"] = true;
    }

    setLeaveTypeData(newLeaveTypeData);
    setCurrentUnit(e);
  };

  const frozen =
  leaveTypeData?.id > 0 &&
  [1, 2].includes(leaveTypeData?.type);

  const frozenSelectStyles = {
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: frozen ? "#000" : provided.backgroundColor,
    }),

    multiValueLabel: (provided) => ({
      ...provided,
      color: frozen ? "#fff" : provided.color,
    }),

    multiValueRemove: (provided) => ({
      ...provided,
      color: frozen ? "#fff" : provided.color,
    }),
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: leaveTypeData,
    validationSchema: frozen
    ? Yup.object().shape({})
    :Yup.object({
    name: frozen
      ? Yup.string()
      : Yup.string()
          .required("Please Enter Leave Type Name")
          .trim()
          .matches(
            /^[a-zA-Z0-9\s.,?!"'_\-()&:;/\\]+$/,
            "Name can contain only alphabets, numbers, spaces, and . , ? ! \" ' - _ ( ) & : ; / \\"
          )
          .min(2, "Name must be at least 2 characters")
          .max(
            150,
            "Leave Type Name is too long. Maximum 150 characters allowed."
          ),

    genders: frozen
      ? Yup.array()
      : Yup.array()
          .required("Please Select Gender")
          .min(1, "Please Select Gender"),

    ws_id: frozen
      ? Yup.array()
      : Yup.array()
          .required("Please Select Work Schedule")
          .min(1, "Please Select Work Schedule"),

    role_id: frozen
      ? Yup.array()
          : Yup.array()
          .required("Please Select Applicable Role")
          .min(1, "Please Select Applicable Role"),

    // monthly_allowed_count: Yup.number().when([], {
    //   is: () => leaveTypeData.is_credit_based,
    //   then: (schema) =>
    //     schema
    //       .required("Please Enter Monthly Allowed Count")
    //       .min(1, "Monthly Allowed Count must be at least 1"),
    //   otherwise: (schema) => schema.nullable(),
    // }),


    allowed_count: Yup.number().when("unit", {
      is: leave_type_hour_unit,
      then: (schema) =>
        schema
          .nullable()
          .max(
            8760,
            "Leave Hour Allowed in a Year must not exceed 8760"
          ),
      otherwise: (schema) => schema.nullable(),
    }),

    hour_allowed_in_day: Yup.number().when("unit", {
      is: leave_type_hour_unit,
      then: (schema) =>
        schema
          .nullable()
          .max(
            24,
            "Leave Hour Allowed in a Day must not exceed 24"
          ),
      otherwise: (schema) => schema.nullable(),
    }),

    description: Yup.string()
      .trim()
      .matches(
        /^[a-zA-Z0-9\s.,!?'"_\-()&:;/\\]*$/,
        "Description can contain only alphabets, numbers, spaces, and . , ! ? \" ' - _ ( ) & : ; / \\"
      )
      .max(
        200,
        "Description is too long. Please keep it within 200 characters."
      ),
  }),
    onSubmit: async (values) => {
      dispatch(setLoaderVisible(true));
      // if (values.allowed_count === 0) {
      //   toast.error("Leave Days Must not be 0");
      // } 
      // if (values.allowed_count > 365) {
      //   toast.error("Leave Days Count must not exceed 365");
      // }
      if (
        leaveTypeData.is_credit_based &&
        leaveTypeData.monthly_allowed_count > 30
      ) {
        toast.error("Monthly Allowed Count must not exceed 30");
      } else if (
        !leaveTypeData.is_credit_based &&
        values.allowed_count > 365
      ) {
        toast.error("Leave Days Count must not exceed 365");
      }
      
      else if (
        values.allowed_to_carry_forward &&
        // values.carry_forward_limit > values.allowed_count
        values.carry_forward_limit >
        (
          leaveTypeData.is_credit_based
            ? leaveTypeData.monthly_allowed_count
            : values.allowed_count
        )
      ) {
        toast.error("Carry Forward Limit must not exceed Leave Days Count");
      } else if (values.unit === 2 && values.hour_allowed_in_day === 0) {
        toast.error("Leave Hour Must not be 0");
      } else {
        const payload = {
          ...leaveTypeData,
        };

        if (leaveTypeData.is_credit_based) {
          payload.monthly_allowed_count =
            leaveTypeData.monthly_allowed_count;

          payload.allowed_count = 0;
        } else {
          payload.monthly_allowed_count = 0;
        }

        const Api = await PostApi(
          "/leave/leave_type/create/",
          // leaveTypeData,
          payload,
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
                      disabled={frozen}
                      id="last_namename"
                      className="form-control"
                      placeholder="Casual"
                      value={leaveTypeData.name || ""}
                      onChange={handleInputChange}
                      // maxLength={150}
                      invalid={
                        // FormikForm.touched.name && FormikForm.errors.name
                        FormikForm.errors.name
                          ? true
                          : false
                      }
                    />
                    
                    {FormikForm.errors.name ? (
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
                  <Label htmlFor="unit" className="form-label">
                    Unit *
                  </Label>
                  <div className="">
                    <div className="form-check form-check-inline">
                      <Input
                        id="lt_day"
                        name="Unit"
                        type="radio"
                        disabled={frozen}
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
                        disabled={frozen}
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
              {currentUnit === leave_type_day_unit && (
                <Col md={12}>
                  <Label className="form-label">
                    Credit Based Leave
                  </Label>

                  <div className="mb-2">
                    <div className="form-check form-switch form-switch-md form-switch-success">
                      <Input
                        type="checkbox"
                        id="lt_credit_based"
                        className="form-check-input form-switch-md"
                        checked={leaveTypeData.is_credit_based || false}
                        disabled={frozen}
                        onChange={(e) => {
                          setLeaveTypeData({
                            ...leaveTypeData,
                            is_credit_based: e.target.checked,
                            monthly_allowed_count: e.target.checked
                              ? leaveTypeData.monthly_allowed_count || 0
                              : 0,
                          });
                        }}
                      />
                    </div>
                  </div>
                </Col>
              )}
              {currentUnit && currentUnit === leave_type_day_unit && (
                <Col md={12} lg={12} xxl={12}>
                  <div className="mb-3">
                    <Label htmlFor="lt_days_allow" className="form-label">
                      Leave Days Count{" "}
                      <small>
                        {/* <i>Allowed in a year</i> */}
                            <i>
                              {leaveTypeData.is_credit_based
                                ? "Allowed in a month"
                                : "Allowed in a year"}
                            </i>
                      </small>
                    </Label>
                    
                    {/* {leaveTypeData.is_credit_based && (
                    <Col md={12}>
                      <div className="mb-3">
                        <Label
                          htmlFor="monthly_allowed_count"
                          className="form-label"
                        >
                          Monthly Allowed Count
                        </Label>

                        <Input
                          type="number"
                          id="monthly_allowed_count"
                          value={leaveTypeData.monthly_allowed_count ?? 0}
                          disabled={frozen}
                          onChange={(e) =>
                            setLeaveTypeData({
                              ...leaveTypeData,
                              monthly_allowed_count:
                                e.target.value === ""
                                  ? ""
                                  : parseInt(e.target.value, 10) || 0,
                            })
                          }
                        />

                        <div className="form-text">
                          Enter leave credits allocated per month.
                        </div>
                      </div>
                    </Col>
                  )} */}
                    <div className="form-icon right">
                      <Input
                        type="number"
                        name="allowed_count"
                        id="lt_days_allow"
                        className="form-control"
                        // placeholder="Enter the number of leave days allowed in a year"
                        placeholder={
                          leaveTypeData.is_credit_based
                            ? "Enter the number of leave days allowed in a month"
                            : "Enter the number of leave days allowed in a year"
                        }
                        // value={leaveTypeData.allowed_count ?? 0}
                        value={
                          leaveTypeData.is_credit_based
                            ? (leaveTypeData.monthly_allowed_count || "")
                            : (leaveTypeData.allowed_count || "")
                        }
                        disabled={frozen}
                        // onFocus={() => {
                        //   // if (!leaveTypeData.allowed_count) 
                        //   if (
                        //       !(leaveTypeData.is_credit_based
                        //         ? leaveTypeData.monthly_allowed_count
                        //         : leaveTypeData.allowed_count)
                        //     )
                        //     {
                        //     setLeaveTypeData({
                        //       ...leaveTypeData,
                        //       allowed_count: "",
                        //     });
                        //   }
                        // }}
                        onFocus={() => {
                          if (leaveTypeData.is_credit_based) {
                            if (
                              leaveTypeData.monthly_allowed_count === 0
                            ) {
                              setLeaveTypeData({
                                ...leaveTypeData,
                                monthly_allowed_count: "",
                              });
                            }
                          } else {
                            if (
                              leaveTypeData.allowed_count === 0
                            ) {
                              setLeaveTypeData({
                                ...leaveTypeData,
                                allowed_count: "",
                              });
                            }
                          }
                        }}
                        // onBlur={() => {
                        //   if (
                        //     leaveTypeData.allowed_count === "" ||
                        //     leaveTypeData.allowed_count === null
                        //   ) {
                        //     setLeaveTypeData({
                        //       ...leaveTypeData,
                        //       allowed_count: 0,
                        //     });
                        //   }
                        // }}
                        onBlur={() => {
                          if (leaveTypeData.is_credit_based) {
                            if (
                              leaveTypeData.monthly_allowed_count === "" ||
                              leaveTypeData.monthly_allowed_count === null
                            ) {
                              setLeaveTypeData({
                                ...leaveTypeData,
                                monthly_allowed_count: 0,
                              });
                            }
                          } else {
                            if (
                              leaveTypeData.allowed_count === "" ||
                              leaveTypeData.allowed_count === null
                            ) {
                              setLeaveTypeData({
                                ...leaveTypeData,
                                allowed_count: 0,
                              });
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "-" ||
                            e.key === "e" ||
                            e.key === "E" ||
                            e.key === "+" ||
                            e.key === "."
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          if (!canEditLeaveType("count")) return;
                          const val = e.target.value;
                            // Allow only digits
                          if (!/^\d*$/.test(val)) {
                            return;
                          }
                          // if (val === "") {
                          //   setLeaveTypeData({
                          //     ...leaveTypeData,
                          //     allowed_count: "",
                          //   });
                          //   setDaysCountError("");
                          // }
                          if (val === "") {
                            setLeaveTypeData({
                              ...leaveTypeData,
                              ...(leaveTypeData.is_credit_based
                                ? { monthly_allowed_count: "" }
                                : { allowed_count: "" }),
                            });

                            setDaysCountError("");
                            return;
                          }
                           else {
                            const parsed = parseInt(val, 10);
                            const safeVal =
                              isNaN(parsed) || parsed < 0 ? 0 : parsed;

                            // setDaysCountError(
                            //   safeVal > 365
                            //     ? "Leave Days Count must not exceed 365"
                            //     : "",
                            // );

                            // setLeaveTypeData({
                            //   ...leaveTypeData,
                            //   allowed_count: safeVal,
                            //   carry_forward_limit:
                            //     leaveTypeData.carry_forward_limit > safeVal
                            //       ? safeVal
                            //       : leaveTypeData.carry_forward_limit,
                            // });

                            if (leaveTypeData.is_credit_based) {
                              setDaysCountError(
                                safeVal > 30
                                  ? "Monthly Allowed Count must not exceed 30"
                                  : ""
                              );

                              setLeaveTypeData({
                                ...leaveTypeData,
                                monthly_allowed_count: safeVal,
                              });
                            } else {
                              setDaysCountError(
                                safeVal > 365
                                  ? "Leave Days Count must not exceed 365"
                                  : ""
                              );

                              setLeaveTypeData({
                                ...leaveTypeData,
                                allowed_count: safeVal,
                              });
                            }

                            if (leaveTypeData.carry_forward_limit > safeVal) {
                              setCarryForwardError("");
                            }
                          }
                        }}
                        invalid={daysCountError ? true : false}
                      />
                      {/* <i className="ri-calendar-2-line"></i> */}
                    </div>
                    {daysCountError ? (
                      <FormFeedback type="invalid" style={{ display: "block" }}>
                        {daysCountError}
                      </FormFeedback>
                    ) : (
                      <div id="passwordHelpBlock" className="form-text">
                        Please Enter Leave Days Allowed in a year.
                      </div>
                    )}
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
                        invalid={!!FormikForm.errors.allowed_count}
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
                            e.key === "+" ||
                            e.key === "."
                          ) {
                            e.preventDefault();
                          }
                        }}
                        // onChange={(e) => {
                        //  if (!canEditLeaveType("count")) return;
                        //   const val = e.target.value;
                        //   if (val === "") {
                        //     setLeaveTypeData({
                        //       ...leaveTypeData,
                        //       allowed_count: "",
                        //     });
                        //   } else {
                        //     const parsed = parseInt(val, 10);
                        //     setLeaveTypeData({
                        //       ...leaveTypeData,
                        //       allowed_count:
                        //         isNaN(parsed) || parsed < 0 ? 0 : parsed,
                        //     });
                        //   }
                        // }}
                        onChange={(e) => {
                          if (!canEditLeaveType("count")) return;

                          const val = e.target.value;

                          const parsed =
                            val === "" ? "" : Math.max(0, parseInt(val, 10) || 0);

                          setLeaveTypeData({
                            ...leaveTypeData,
                            allowed_count: parsed,
                          });

                          FormikForm.setFieldValue("allowed_count", parsed);
                          FormikForm.validateField("allowed_count");
                        }}
                      />
                      {/* <i className="ri-time-line"></i> */}
                    </div>
                    {FormikForm.errors.allowed_count ? (
                      <FormFeedback type="invalid" style={{ display: "block" }}>
                        {FormikForm.errors.allowed_count}
                      </FormFeedback>
                    ) : (
                    <div id="passwordHelpBlock" className="form-text">
                      Please Enter Leave Hour Allowed in a year.
                    </div>
                    )}
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
                        invalid={!!FormikForm.errors.hour_allowed_in_day}
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
                        // onChange={(e) => {
                        //   if (!canEditLeaveType("hour_allowed_in_day")) return;
                        //   const val = e.target.value;
                        //   if (val === "") {
                        //     setLeaveTypeData({
                        //       ...leaveTypeData,
                        //       hour_allowed_in_day: "",
                        //     });
                        //   } else {
                        //     const parsed = parseInt(val, 10);
                        //     setLeaveTypeData({
                        //       ...leaveTypeData,
                        //       hour_allowed_in_day:
                        //         isNaN(parsed) || parsed < 0 ? 0 : parsed,
                        //     });
                        //   }
                        // }}
                        onChange={(e) => {
                          if (!canEditLeaveType("hour_allowed_in_day")) return;

                          const val = e.target.value;

                          const parsed =
                            val === "" ? "" : Math.max(0, parseInt(val, 10) || 0);

                          setLeaveTypeData({
                            ...leaveTypeData,
                            hour_allowed_in_day: parsed,
                          });

                          FormikForm.setFieldValue("hour_allowed_in_day", parsed);
                          FormikForm.validateField("hour_allowed_in_day");
                        }}
                      />
                      {/* <i className="ri-time-line"></i> */}
                    </div>
                    {FormikForm.errors.hour_allowed_in_day ? (
                      <FormFeedback type="invalid" style={{ display: "block" }}>
                        {FormikForm.errors.hour_allowed_in_day}
                      </FormFeedback>
                    ) : (
                    <div id="passwordHelpBlock" className="form-text">
                      Please Enter Leave Hour Allowed in a day.
                    </div>
                    )}
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
                    isDisabled={frozen}
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
                      if (!canEditLeaveType("reset")) return;
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
                    isDisabled={frozen}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
                    styles={{
                      ...frozenSelectStyles,
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          FormikForm.touched.ws_id &&
                          FormikForm.errors.ws_id
                            ? "red !important"
                            : provided.borderColor,
                        backgroundColor: frozen ? "#f5f5f5" : provided.backgroundColor,
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

                  {/* <Select
                    isMulti
                    options={role_options || []}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
                    value={selectedRoles || []}
                    onChange={handleRoleChange}
                    closeMenuOnSelect={false}
                  />
                </div>
                <div className="form-text mb-3">Select applicable roles.</div> */}
                    <Select
                      name="role_id"
                      isMulti
                      options={role_options || []}
                      isDisabled={frozen}
                      className="basic-multi-select"
                      classNamePrefix="lc-select"
                      value={selectedRoles || []}
                      onChange={handleRoleChange}
                      onBlur={() => FormikForm.setFieldTouched("role_id", true)}
                      closeMenuOnSelect={false}
                      styles={{
                        ...frozenSelectStyles,
                        control: (provided, state) => ({
                          ...provided,
                          borderColor:
                            !state.isFocused &&
                            FormikForm.touched.role_id &&
                            FormikForm.errors.role_id
                              ? "red"
                              : provided.borderColor,
                        }),
                       
                      }}
                    />

                    {FormikForm.touched.role_id && FormikForm.errors.role_id ? (
                      <div className="lc_form_error_text">
                        {FormikForm.errors.role_id}
                      </div>
                    ) : null}
                  </div>

                  {!FormikForm.errors.role_id && (
                    <div className="form-text mb-3">
                      Select applicable roles.
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
                    isMulti
                    options={gender_options || []}
                    isDisabled={frozen}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
                    styles={{
                      ...frozenSelectStyles,
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
                            disabled={frozen}
                            className="form-check-input form-switch-md"
                            id="lt_weekend_between_leave"
                            checked={
                              leaveTypeData.weekend_between_leave || false
                            }
                            onChange={(e) =>{
                              if (!canEditLeaveType("weekend")) return;

                              setLeaveTypeData({
                                ...leaveTypeData,
                                weekend_between_leave: e.target.checked,
                              })
                            }}
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
                            disabled={frozen}
                            className="form-check-input form-switch-md"
                            id="lt_holiday_between_leave"
                            checked={
                              leaveTypeData.holiday_between_leave || false
                            }
                            onChange={(e) =>{
                              if (!canEditLeaveType("holiday")) return;
                              setLeaveTypeData({
                                ...leaveTypeData,
                                holiday_between_leave: e.target.checked,
                              })
                            }}
                          />
                        </div>
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
                          disabled={frozen}
                          className="form-check-input form-switch-md"
                          id="lt_carry_forward"
                          checked={
                            leaveTypeData.allowed_to_carry_forward || false
                          }
                          onChange={(e) =>{
                            if (!canEditLeaveType("carryForward")) return;
                            setLeaveTypeData({
                              ...leaveTypeData,
                              allowed_to_carry_forward: e.target.checked,
                              carry_forward_limit: e.target.checked
                                ? leaveTypeData.carry_forward_limit
                                : 0,
                            })
                          }}
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
                              setCarryForwardError("");
                            } else {
                              const val = parseInt(e.target.value);
                              const safeVal = isNaN(val) || val < 0 ? 0 : val;

                              setCarryForwardError(
                                safeVal > (leaveTypeData.allowed_count || 0)
                                  ? "Carry Forward Limit must not exceed Leave Days Count"
                                  : "",
                              );

                              setLeaveTypeData({
                                ...leaveTypeData,
                                carry_forward_limit: safeVal,
                              });
                            }
                          }}
                          invalid={carryForwardError ? true : false}
                        />
                        {carryForwardError ? (
                          <FormFeedback
                            type="invalid"
                            style={{ display: "block" }}
                          >
                            {carryForwardError}
                          </FormFeedback>
                        ) : (
                          <div className="form-text">
                            Enter maximum carry forward limit.
                          </div>
                        )}
                      </div>
                    </Col>
                  )}
                  {leaveTypeData.id > 0 && (
                    <Col md={12}>
                      <div>
                        <Label
                          htmlFor="leave_type_status"
                          className="form-label"
                        >
                          Status
                        </Label>

                        <div className="mb-2">
                          <div
                            className="form-check form-switch form-switch-md form-switch-success"
                            dir="ltr"
                          >
                            <Input
                              type="checkbox"
                              className="form-check-input form-switch-md"
                              id="leave_type_status"
                              checked={leaveTypeData.status || false}
                              onChange={(e) =>
                                setLeaveTypeData({
                                  ...leaveTypeData,
                                  status: e.target.checked,
                                })
                              }
                            />
                          </div>
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
                    value={leaveTypeData.description || ""}
                    onChange={handleInputChange}
                    invalid={!!FormikForm.errors.description}
                  />
                  {FormikForm.errors.description ? (
                    <FormFeedback type="invalid">
                      {FormikForm.errors.description}
                    </FormFeedback>
                  ) : (
                    <div className="form-text">
                      Description (Optional).
                    </div>
                  )}
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
