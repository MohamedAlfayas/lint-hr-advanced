import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  FormFeedback,
  TabPane,
  Progress,
} from "reactstrap";
import Select from "react-select";
import { Api } from "../../common/api/Api";

import classnames from "classnames";
import {
  hourOptions,
  minuteOptions,
  graceBreakMinuteOptions,
  maxBreakHourOptions,
  graceHourOptions,
  week_list,
} from "../../common/constant/Constants";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import {
  addWorkSchedule,
  editWorkSchedule,
} from "../../redux/reducers/ChildReducer/WorkScheduleReducer";
import { toast } from "react-toastify";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { diffDates } from "@fullcalendar/core/internal";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";

// register lottie and define custom element
defineElement(loadAnimation);

const WorkScheduleForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [workScheduleData, setWorkScheduleData] = useState({});
  const [activeArrowTab, setactiveArrowTab] = useState(4);
  const initialWorkday = useMemo(
    () => [
      {
        id: 0,
        s_day: "Monday",
        weekday: "Monday",
        e_day: "",
        s_hr: "00",
        s_min: "00",
        e_hr: "00",
        e_min: "00",
        is_day_on: false,
        total_work_duration: 0,
        break_duration: 0,
        total_work_duration_without_break: 0,
      },
      {
        id: 0,
        s_day: "Tuesday",
        weekday: "Tuesday",
        e_day: "",
        s_hr: "00",
        s_min: "00",
        e_hr: "00",
        e_min: "00",
        is_day_on: false,
        total_work_duration: 0,
        break_duration: 0,
        total_work_duration_without_break: 0,
      },
      {
        id: 0,
        s_day: "Wednesday",
        weekday: "Wednesday",
        e_day: "",
        s_hr: "00",
        s_min: "00",
        e_hr: "00",
        e_min: "00",
        is_day_on: false,
        total_work_duration: 0,
        break_duration: 0,
        total_work_duration_without_break: 0,
      },
      {
        id: 0,
        s_day: "Thursday",
        weekday: "Thursday",
        e_day: "",
        s_hr: "00",
        s_min: "00",
        e_hr: "00",
        e_min: "00",
        is_day_on: false,
        total_work_duration: 0,
        break_duration: 0,
        total_work_duration_without_break: 0,
      },
      {
        id: 0,
        s_day: "Friday",
        weekday: "Friday",
        e_day: "",
        s_hr: "00",
        s_min: "00",
        e_hr: "00",
        e_min: "00",
        is_day_on: false,
        total_work_duration: 0,
        break_duration: 0,
        total_work_duration_without_break: 0,
      },
      {
        id: 0,
        s_day: "Saturday",
        weekday: "Saturday",
        e_day: "",
        s_hr: "00",
        s_min: "00",
        e_hr: "00",
        e_min: "00",
        is_day_on: false,
        total_work_duration: 0,
        break_duration: 0,
        total_work_duration_without_break: 0,
      },
      {
        id: 0,
        s_day: "Sunday",
        weekday: "Sunday",
        e_day: "",
        s_hr: "00",
        s_min: "00",
        e_hr: "00",
        e_min: "00",
        is_day_on: false,
        total_work_duration: 0,
        break_duration: 0,
        total_work_duration_without_break: 0,
      },
    ],
    [],
  );
  console.log(initialWorkday, "fdf");

  useEffect(() => {
    setWorkScheduleData(form_obj);
  }, [form_obj]);

  const [passedarrowSteps, setPassedarrowSteps] = useState([1]);

  console.log("DAAAAATA", workScheduleData);

  function toggleArrowTab(tab) {
    if (activeArrowTab !== tab) {
      var modifiedSteps = [...passedarrowSteps, tab];

      if (tab >= 4 && tab <= 7) {
        setactiveArrowTab(tab);
        setPassedarrowSteps(modifiedSteps);
      }
    }
  }

  const getNextDay = (currentDay) => {
    const daysOfWeek = week_list.map((day) => day.label);
    const currentIndex = daysOfWeek.indexOf(currentDay);
    return daysOfWeek[(currentIndex + 1) % 7];
  };

  const handleChange = useCallback((event) => {
    const { name } = event.target;
    setWorkScheduleData((prevWorkScheduleData) => ({
      ...prevWorkScheduleData,
      [name]: event.target.checked,
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const textOnly = value.replace(/[^a-zA-Z0-9\s.,'_\-()&:;/]/g, "");

      setWorkScheduleData({
        ...workScheduleData,
        [name]: textOnly,
      });

      FormikForm.setFieldValue(name, textOnly);

      FormikForm.setFieldTouched("name", true, false);

      if (textOnly.length > 100) {
        FormikForm.setFieldError(
          "name",
          "Work Schedule Name must not exceed 100 characters.",
        );
      } else if (textOnly.trim() === "") {
        FormikForm.setFieldError("name", "Please Enter Work Schedule Name");
      } else {
        FormikForm.setFieldError("name", undefined);
      }

      return;
    }

    if (name === "description") {
      const textOnly = value.replace(/[^a-zA-Z0-9\s.,?!"'_\-()&:;/\\]/g, "");

      setWorkScheduleData({
        ...workScheduleData,
        [name]: textOnly,
      });

      FormikForm.setFieldValue(name, textOnly);

      if (textOnly.length > 200) {
        FormikForm.setFieldError(
          "description",
          "Description is too long. Please keep it within 200 characters.",
        );
      } else {
        FormikForm.setFieldError("description", undefined);
      }
    }
  };

  const handleDurationChange = (selectedHour, selectedMinute, name) => {
    console.log("selectedHour ==== ", selectedHour + ":" + selectedMinute);

    const newDuration =
      parseInt(selectedHour) * 3600 + parseInt(selectedMinute) * 60;

    setWorkScheduleData({
      ...workScheduleData,
      [name]: newDuration,
    });
  };

  const validateDurations = (values) => {
    const fullday = values.fullday_work_duration || 0;

    if (values.type === 1) {
      if (values.halfday_work_duration >= fullday) {
        toast.error("Half Day duration cannot exceed Full Day duration!");
        return false;
      }
      if (values.grace_time_duration >= fullday) {
        toast.error("Grace Period cannot exceed Full Day duration!");
        return false;
      }
      if (values.maximum_break_duration >= fullday) {
        toast.error("Maximum Break Duration cannot exceed Full Day duration!");
        return false;
      }
    }

    if (values.type === 2) {
      if (values.halfday_work_duration >= fullday) {
        toast.error("Half Day duration cannot exceed Full Day duration!");
        return false;
      }
    }

    return true;
  };

  const handleBulkSelect = (checked) => {
    const updated = workScheduleData.workday.map((d) => {
      return checked
        ? { ...d, is_day_on: true }
        : {
            ...d,
            is_day_on: false,
            e_day: "",
            s_hr: "00",
            s_min: "00",
            e_hr: "00",
            e_min: "00",
            total_work_duration: 0,
            break_duration: 0,
            total_work_duration_without_break: 0,
          };
    });

    setWorkScheduleData({ ...workScheduleData, workday: updated });
  };

  const workScheduleOptions = [
    { label: "Partial Hours", value: 1 },
    { label: "24 Hours", value: 2 },
  ];

  const handleDayCB = (e, wd_obj) => {
    const { checked } = e.target;

    var new_wd_obj = wd_obj;

    if (checked === true) {
      new_wd_obj = {
        ...wd_obj,
        is_day_on: checked,
      };
    } else {
      new_wd_obj = {
        ...wd_obj,
        e_day: "",
        s_hr: "00",
        s_min: "00",
        e_hr: "00",
        e_min: "00",
        is_day_on: checked,
        total_work_duration: 0,
        break_duration: 0,
        total_work_duration_without_break: 0,
      };
    }

    let updated_workday = [...workScheduleData?.workday].map((d) => {
      if (d.weekday === wd_obj?.weekday) {
        return new_wd_obj;
      } else {
        return d;
      }
    });

    setWorkScheduleData({
      ...workScheduleData,
      workday: updated_workday,
    });
  };

  const handleWorkDayTimechange = (val, name, wd_obj) => {
    let new_wd_obj = {
      ...wd_obj,
      [name]: val,
    };

    calculateTotalWorkDuration(new_wd_obj);
  };

  const calculateTotalWorkDuration = (wd_obj) => {
    let startHour = parseInt(wd_obj.s_hr, 10);
    let startMinute = parseInt(wd_obj.s_min, 10);
    let endHour = parseInt(wd_obj.e_hr, 10);
    let endMinute = parseInt(wd_obj.e_min, 10);

    let e_day_name = wd_obj?.e_day;

    // Adjust end time for night shift
    if (
      endHour < startHour ||
      (endHour === startHour && endMinute < startMinute)
    ) {
      endHour += 24; // Add 24 hours to handle night shift
      e_day_name = getNextDay(wd_obj?.weekday);
    } else {
      e_day_name = wd_obj?.weekday;
    }

    let startTimeInSeconds = startHour * 3600 + startMinute * 60;
    let endTimeInSeconds = endHour * 3600 + endMinute * 60;
    let total_work_duration = endTimeInSeconds - startTimeInSeconds;
    let break_duration = workScheduleData?.maximum_break_duration;

    let total_work_duration_without_break =
      parseInt(total_work_duration) - parseInt(break_duration);

    let updated_workday = [...workScheduleData?.workday].map((d) => {
      if (d.weekday === wd_obj?.weekday) {
        return {
          ...wd_obj,
          e_day: e_day_name,
          total_work_duration: total_work_duration,
          break_duration: break_duration,
          total_work_duration_without_break: total_work_duration_without_break,
        };
      } else {
        return d;
      }
    });

    setWorkScheduleData({
      ...workScheduleData,
      workday: updated_workday,
    });
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: workScheduleData,
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .matches(
          /^[A-Za-z0-9\s.,'_\-()&:;/]+$/,
          "Only alphabets, numbers, spaces and . , ' - _ ( ) & : ; / are allowed",
        )
        .min(1, "Work Schedule Name must be at least 1 characters")
        .max(100, "Work Schedule Name must not exceed 100 characters")
        .required("Please Enter Work Schedule Name")
        .test(
          "not-only-spaces",
          "Please Enter Work Schedule Name",
          (value) => !value || value.trim().length > 0,
        ),
      description: Yup.string()
        .trim()
        .max(200, "Description must not exceed 200 characters")
        .matches(
          /^[A-Za-z0-9\s.,!?'"\-_()&:;/]*$/,
          "Only alphabets, numbers, spaces and . , ! ? ' \" - _ ( ) & : ; / are allowed",
        )
        .test(
          "not-only-spaces",
          "Description cannot contain only spaces",
          (value) => !value || value.trim().length > 0,
        ),
    }),
    onSubmit: async (values) => {
      const filteredWorkdays = values.workday.filter((workday) => {
        return workday.is_day_on === true && workday.total_work_duration === 0;
      });
      const filteredDayon = values.workday.filter((workday) => {
        return workday.is_day_on === true;
      });
      if (
        values.type == 1 &&
        (values.fullday_work_duration === 0 ||
          filteredWorkdays.length > 0 ||
          filteredDayon.length === 0)
      ) {
        console.log("IFFFF");
        toast.error("WorkSchedule Hour Can't Be Zero");
      } else if (values.type == 2 && values.fullday_work_duration == 0) {
        toast.error("WorkSchedule Hour Can't Be Zero");
      } else if (values.type == 2 && filteredDayon.length === 0) {
        toast.error("Please select at least one working day");
      } else {
        toggleArrowTab(activeArrowTab + 1);
        dispatch(setLoaderVisible(true));

        const Api = await PostApi(
          "/work-schedule/create/",
          workScheduleData,
          false,
        );
        if (Api.status && Api.status === 200) {
          // workScheduleData.id === 0
          //   ? dispatch(addWorkSchedule(Api?.data.data))
          //   : dispatch(editWorkSchedule(Api?.data?.data));

          if (workScheduleData.id === 0) {
            dispatch(addWorkSchedule(Api?.data.data));
            SetLocalStorage("work_schedule", Api?.data.data, 2);
          } else {
            dispatch(editWorkSchedule(Api?.data?.data));
            SetLocalStorage("work_schedule", Api?.data.data, 3);
          }

          dispatch(toggleRSBView(false));
          toast.success(Api?.data?.message);
        } else {
          toast.error(Api?.data?.message || Api?.data?.detail);
        }

        dispatch(setLoaderVisible(false));
      }
    },
  });

  document.title = "WorkSchedule | Lint HR";

  return (
    <React.Fragment>
      <Row>
        <Col xl={40}>
          <Form onSubmit={FormikForm.handleSubmit} className="form-steps">
            <div className="step-arrow-nav mb-4">
              <Nav
                className="nav-pills custom-nav nav-justified"
                role="tablist"
              >
                <NavItem>
                  <NavLink
                    href="#"
                    id="steparrow-gen-info-tab"
                    className={classnames({
                      active: activeArrowTab === 4,
                      done: activeArrowTab <= 6 && activeArrowTab > 3,
                    })}
                    onClick={() => {
                      toggleArrowTab(4);
                    }}
                  >
                    1)Basic Details
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    id="steparrow-gen-info-tab"
                    className={classnames({
                      active: activeArrowTab === 5,
                      done: activeArrowTab <= 6 && activeArrowTab > 4,
                    })}
                    onClick={() => {
                      toggleArrowTab(5);
                    }}
                  >
                    2)Select Working Hours
                  </NavLink>
                </NavItem>
              </Nav>
            </div>

            <TabContent activeTab={activeArrowTab}>
              <TabPane id="steparrow-gen-info" tabId={4}>
                <div>
                  <Row>
                    <Col md={12} lg={12} xxl={12}>
                      <p className="fw-bold text-center">
                        What should be the name of the Work Schedule?
                      </p>

                      <div className="mb-3">
                        <Label className="form-label" htmlFor="ws_name">
                          Name <spa>*</spa>
                        </Label>
                        <Input
                          type="text"
                          name="name"
                          className="form-control"
                          id="ws_name"
                          placeholder="Enter Work Schedule Name"
                          value={workScheduleData.name || ""}
                          onChange={handleInputChange}
                          invalid={!!FormikForm.errors.name}
                          onBlur={FormikForm.handleBlur}
                        />
                        <FormFeedback type="invalid">
                          {FormikForm.errors.name}
                        </FormFeedback>
                      </div>
                    </Col>
                    <Col md={12} lg={12} xxl={12}>
                      <div className="mb-3">
                        <Label className="form-label" htmlFor="ws_desc">
                          Description
                        </Label>
                        <Input
                          type="textarea"
                          name="description"
                          className="form-control"
                          id="ws_desc"
                          value={workScheduleData.description || ""}
                          onChange={handleInputChange}
                          invalid={!!FormikForm.errors.description}
                        />

                        {FormikForm.errors.description ? (
                          <FormFeedback type="invalid">
                            {FormikForm.errors.description}
                          </FormFeedback>
                        ) : null}
                      </div>
                    </Col>
                    <Col md={3} lg={3} xxl={3}>
                      <div className="mb-3">
                        <Label className="form-label" htmlFor="ws_desc">
                          Work Schedule Type
                        </Label>
                        {console.log("Edit Value:", workScheduleData.type)}
                        {console.log("Workschedule Value:", workScheduleData)}
                        {console.log("Options:", workScheduleOptions)}
                        {console.log(
                          "Matched Option:",
                          workScheduleOptions.find(
                            (item) => item.value === workScheduleData.type,
                          ),
                        )}
                        <Select
                          name="type"
                          options={workScheduleOptions}
                          isMulti={false}
                          value={workScheduleOptions.find(
                            (item) => item.value === workScheduleData.type,
                          )}
                          onChange={(option) => {
                            setWorkScheduleData({
                              ...workScheduleData,
                              type: option.value,
                              workday: initialWorkday,
                              fullday_work_duration: 0,
                              halfday_work_duration: 0,
                              grace_time_duration: 0,
                              maximum_break_duration: 0,
                              // twenty_four_hrs_duration: 0,
                              has_ot: false,
                            });
                          }}
                          className="basic-single"
                          classNamePrefix="lc-select"
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              borderColor:
                                FormikForm.touched.type &&
                                FormikForm.errors.type
                                  ? "red"
                                  : provided.borderColor,
                            }),
                          }}
                        />

                        {FormikForm.touched.type && FormikForm.errors.type && (
                          <div className="text-danger mt-1">
                            {FormikForm.errors.type}
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>

                  {workScheduleData
                    ? (workScheduleData?.type === 1 && (
                        <div>
                          <Row className="mb-2">
                            {/* FULL DAY DURATION */}
                            <Col xxl={6} md={6}>
                              <div>
                                <Label
                                  htmlFor="ws_full_hr"
                                  className="form-label"
                                >
                                  Work Duration
                                </Label>
                                <span className="form-text text-muted ms-3">
                                  Full Day
                                </span>

                                <div style={{ display: "flex" }}>
                                  <b className="mt-2 me-1">H</b>

                                  <Select
                                    id="ws_full_hr"
                                    name="wsFullDayHr"
                                    placeholder="00"
                                    options={hourOptions}
                                    value={hourOptions.find(
                                      (option) =>
                                        option.value ===
                                        String(
                                          Math.floor(
                                            workScheduleData.fullday_work_duration /
                                              3600,
                                          ),
                                        ).padStart(2, "0"),
                                    )}
                                    onChange={(selectedOption) => {
                                      handleDurationChange(
                                        selectedOption.value,
                                        Math.floor(
                                          (workScheduleData.fullday_work_duration %
                                            3600) /
                                            60,
                                        ),
                                        "fullday_work_duration",
                                      );
                                    }}
                                  />

                                  <b className="mt-2 me-1 ms-2">M</b>
                                  <Select
                                    id="ws_full_mi"
                                    name="wsFullDayMin"
                                    placeholder="00"
                                    options={minuteOptions}
                                    value={minuteOptions.find(
                                      (option) =>
                                        option.value ===
                                        String(
                                          Math.floor(
                                            (workScheduleData.fullday_work_duration %
                                              3600) /
                                              60,
                                          ),
                                        ).padStart(2, "0"),
                                    )}
                                    onChange={(selectedOption) => {
                                      handleDurationChange(
                                        Math.floor(
                                          workScheduleData.fullday_work_duration /
                                            3600,
                                        ),
                                        selectedOption.value,
                                        "fullday_work_duration",
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            </Col>

                            {/* HALF DAY DURATION */}
                            <Col xxl={6} md={6}>
                              <div>
                                <Label className="form-label mb-3"></Label>
                                <span className="form-text text-muted ms-3">
                                  Half Day
                                </span>

                                <div style={{ display: "flex" }}>
                                  <b className="mt-2 me-1">H</b>

                                  <Select
                                    id="ws_half_hr"
                                    name="wsHalfDayHr"
                                    placeholder="00"
                                    options={hourOptions}
                                    value={hourOptions.find(
                                      (option) =>
                                        option.value ===
                                        String(
                                          Math.floor(
                                            workScheduleData.halfday_work_duration /
                                              3600,
                                          ),
                                        ).padStart(2, "0"),
                                    )}
                                    onChange={(selectedOption) =>
                                      handleDurationChange(
                                        selectedOption.value,
                                        Math.floor(
                                          (workScheduleData.halfday_work_duration %
                                            3600) /
                                            60,
                                        ),
                                        "halfday_work_duration",
                                      )
                                    }
                                  />

                                  <b className="mt-2 me-1 ms-2">M</b>

                                  <Select
                                    id="ws_half_min"
                                    name="wsHalfDayMin"
                                    placeholder="00"
                                    options={minuteOptions}
                                    value={minuteOptions.find(
                                      (option) =>
                                        option.value ===
                                        String(
                                          Math.floor(
                                            (workScheduleData.halfday_work_duration %
                                              3600) /
                                              60,
                                          ),
                                        ).padStart(2, "0"),
                                    )}
                                    onChange={(selectedOption) =>
                                      handleDurationChange(
                                        Math.floor(
                                          workScheduleData.halfday_work_duration /
                                            3600,
                                        ),
                                        selectedOption.value,
                                        "halfday_work_duration",
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </Col>
                          </Row>

                          {/* GRACE PERIOD + MAX BREAK */}
                          <Row>
                            {/* GRACE PERIOD */}
                            <Col xxl={6} md={6}>
                              <div>
                                <Label
                                  htmlFor="gracePeriodInHours"
                                  className="form-label"
                                >
                                  Grace Period
                                </Label>

                                <div style={{ display: "flex" }}>
                                  <b className="mt-2 me-1">H</b>

                                  <Select
                                    id="gracePeriodInHours"
                                    name="gracePeriodInHours"
                                    placeholder="00"
                                    options={graceHourOptions}
                                    value={graceHourOptions.find(
                                      (option) =>
                                        option.value ===
                                        String(
                                          Math.floor(
                                            workScheduleData.grace_time_duration /
                                              3600,
                                          ),
                                        ).padStart(2, "0"),
                                    )}
                                    onChange={(selectedOption) =>
                                      handleDurationChange(
                                        selectedOption.value,
                                        Math.floor(
                                          (workScheduleData.grace_time_duration %
                                            3600) /
                                            60,
                                        ),
                                        "grace_time_duration",
                                      )
                                    }
                                  />

                                  <b className="mt-2 me-1 ms-2">M</b>

                                  <Select
                                    id="gracePeriodInMinutes"
                                    name="gracePeriodInMinutes"
                                    placeholder="00"
                                    options={graceBreakMinuteOptions}
                                    value={graceBreakMinuteOptions.find(
                                      (option) =>
                                        option.value ===
                                        String(
                                          Math.floor(
                                            (workScheduleData.grace_time_duration %
                                              3600) /
                                              60,
                                          ),
                                        ).padStart(2, "0"),
                                    )}
                                    onChange={(selectedOption) =>
                                      handleDurationChange(
                                        Math.floor(
                                          workScheduleData.grace_time_duration /
                                            3600,
                                        ),
                                        selectedOption.value,
                                        "grace_time_duration",
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </Col>

                            {/* MAXIMUM TOTAL BREAK */}
                            <Col xxl={6} md={6}>
                              <div>
                                <Label
                                  htmlFor="maximum_break_hr"
                                  className="form-label"
                                >
                                  Maximum Total Break Duration
                                </Label>

                                <div style={{ display: "flex" }}>
                                  <b className="mt-2 me-1">H</b>

                                  <Select
                                    id="maximum_break_hr"
                                    name="maximum_break_hr"
                                    placeholder="00"
                                    options={maxBreakHourOptions}
                                    value={maxBreakHourOptions.find(
                                      (option) =>
                                        option.value ===
                                        String(
                                          Math.floor(
                                            workScheduleData.maximum_break_duration /
                                              3600,
                                          ),
                                        ).padStart(2, "0"),
                                    )}
                                    onChange={(selectedOption) =>
                                      handleDurationChange(
                                        selectedOption.value,
                                        Math.floor(
                                          (workScheduleData.maximum_break_duration %
                                            3600) /
                                            60,
                                        ),
                                        "maximum_break_duration",
                                      )
                                    }
                                  />

                                  <b className="mt-2 me-1 ms-2">M</b>

                                  <Select
                                    id="maximum_break_min"
                                    name="maximum_break_min"
                                    placeholder="00"
                                    options={graceBreakMinuteOptions}
                                    value={graceBreakMinuteOptions.find(
                                      (option) =>
                                        option.value ===
                                        String(
                                          Math.floor(
                                            (workScheduleData.maximum_break_duration %
                                              3600) /
                                              60,
                                          ),
                                        ).padStart(2, "0"),
                                    )}
                                    onChange={(selectedOption) =>
                                      handleDurationChange(
                                        Math.floor(
                                          workScheduleData.maximum_break_duration /
                                            3600,
                                        ),
                                        selectedOption.value,
                                        "maximum_break_duration",
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </Col>
                          </Row>

                          {/* OT ENABLE SWITCH */}
                          <Col lg={12} className="mt-3">
                            <div>
                              <Label htmlFor="has_ot" className="form-label">
                                Enable OT
                              </Label>

                              <div
                                className="form-check form-switch form-switch-md form-switch-success"
                                dir="ltr"
                              >
                                <Input
                                  id="has_ot"
                                  name="has_ot"
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={workScheduleData.has_ot}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          </Col>

                          {workScheduleData.id > 0 && (
                            <Col lg={12} className="mt-3">
                              <div className="mb-3">
                                <Label className="form-label">Status</Label>

                                <div
                                  className="form-check form-switch form-switch-md form-switch-success"
                                  dir="ltr"
                                >
                                  <Input
                                    type="checkbox"
                                    checked={workScheduleData.status || false}
                                    onChange={(e) =>
                                      setWorkScheduleData((prev) => ({
                                        ...prev,
                                        status: e.target.checked,
                                      }))
                                    }
                                  />
                                </div>

                                <div className="form-text">
                                  {workScheduleData.status
                                    ? "Active"
                                    : "Inactive"}
                                </div>
                              </div>
                            </Col>
                          )}
                        </div>
                      )) || (
                        <Row className="mb-2">
                          {/* FULL DAY */}
                          <Col xxl={6} md={6}>
                            <div>
                              <Label
                                htmlFor="ws_full_hr_24"
                                className="form-label"
                              >
                                Maximum Working Hours
                              </Label>
                              <span className="form-text text-muted ms-3">
                                Full Day
                              </span>
                              <div style={{ display: "flex" }}>
                                <b className="mt-2 me-1">H</b>
                                <Select
                                  id="ws_full_hr_24"
                                  name="wsFullDayHr24"
                                  placeholder="00"
                                  options={hourOptions}
                                  value={hourOptions.find(
                                    (option) =>
                                      option.value ===
                                      String(
                                        Math.floor(
                                          workScheduleData.fullday_work_duration /
                                            3600,
                                        ),
                                      ).padStart(2, "0"),
                                  )}
                                  onChange={(selectedOption) => {
                                    handleDurationChange(
                                      selectedOption.value,
                                      Math.floor(
                                        (workScheduleData.fullday_work_duration %
                                          3600) /
                                          60,
                                      ),
                                      "fullday_work_duration",
                                    );
                                  }}
                                />
                                <b className="mt-2 me-1 ms-2">M</b>
                                <Select
                                  id="ws_full_mi_24"
                                  name="wsFullDayMin24"
                                  placeholder="00"
                                  options={minuteOptions}
                                  value={minuteOptions.find(
                                    (option) =>
                                      option.value ===
                                      String(
                                        Math.floor(
                                          (workScheduleData.fullday_work_duration %
                                            3600) /
                                            60,
                                        ),
                                      ).padStart(2, "0"),
                                  )}
                                  onChange={(selectedOption) => {
                                    handleDurationChange(
                                      Math.floor(
                                        workScheduleData.fullday_work_duration /
                                          3600,
                                      ),
                                      selectedOption.value,
                                      "fullday_work_duration",
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          </Col>

                          {/* HALF DAY */}
                          <Col xxl={6} md={6}>
                            <div>
                              <Label className="form-label">
                                Half Day Duration
                              </Label>
                              <span className="form-text text-muted ms-3">
                                Half Day
                              </span>
                              <div style={{ display: "flex" }}>
                                <b className="mt-2 me-1">H</b>
                                <Select
                                  id="ws_half_hr_24"
                                  name="wsHalfDayHr24"
                                  placeholder="00"
                                  options={hourOptions}
                                  value={hourOptions.find(
                                    (option) =>
                                      option.value ===
                                      String(
                                        Math.floor(
                                          workScheduleData.halfday_work_duration /
                                            3600,
                                        ),
                                      ).padStart(2, "0"),
                                  )}
                                  onChange={(selectedOption) =>
                                    handleDurationChange(
                                      selectedOption.value,
                                      Math.floor(
                                        (workScheduleData.halfday_work_duration %
                                          3600) /
                                          60,
                                      ),
                                      "halfday_work_duration",
                                    )
                                  }
                                />
                                <b className="mt-2 me-1 ms-2">M</b>
                                <Select
                                  id="ws_half_mi_24"
                                  name="wsHalfDayMin24"
                                  placeholder="00"
                                  options={minuteOptions}
                                  value={minuteOptions.find(
                                    (option) =>
                                      option.value ===
                                      String(
                                        Math.floor(
                                          (workScheduleData.halfday_work_duration %
                                            3600) /
                                            60,
                                        ),
                                      ).padStart(2, "0"),
                                  )}
                                  onChange={(selectedOption) =>
                                    handleDurationChange(
                                      Math.floor(
                                        workScheduleData.halfday_work_duration /
                                          3600,
                                      ),
                                      selectedOption.value,
                                      "halfday_work_duration",
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </Col>
                        </Row>
                      )
                    : null}
                </div>
                <div className="d-flex align-items-start gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-success btn-label right ms-auto nexttab nexttab"
                    onClick={() => {
                      FormikForm.validateForm().then((errors) => {
                        if (Object.keys(errors).length === 0) {
                          if (!validateDurations(workScheduleData)) return;
                          toggleArrowTab(activeArrowTab + 1);
                        } else {
                          FormikForm.setTouched({
                            name: true,
                            description: true,
                          });

                          const firstError = Object.values(errors)[0];
                          toast.error(firstError);
                        }
                      });
                    }}
                  >
                    <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                    NEXT STEP
                  </button>
                </div>
              </TabPane>

              <TabPane id="steparrow-description-info" tabId={5}>
                <p className="fw-bold text-center">
                  When do your <i>{workScheduleData.name}</i> employee work?
                </p>
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={workScheduleData.workday?.every(
                            (d) => d.is_day_on,
                          )}
                          onChange={(e) => handleBulkSelect(e.target.checked)}
                        />
                      </th>
                      <th>Day</th>
                      <th>Start Time</th>
                      <th>Minute</th>
                      <th>TO</th>
                      <th>End Time</th>
                      <th>Minute</th>
                      <th>Shift Hours</th>
                    </tr>
                    {workScheduleData.workday?.map((workday, index) => {
                      return (
                        <tr key={index}>
                          <th>
                            {" "}
                            <input
                              type="checkbox"
                              name={`is_day_on_${workday.s_day}`}
                              id={`is_day_on_${workday.s_day}`}
                              className={`mb-2 is_day_on_${workday.s_day}`}
                              checked={workday.is_day_on}
                              onChange={(e) => handleDayCB(e, workday)}
                            />
                          </th>
                          <th style={{ textTransform: "capitalize" }}>
                            <label
                              className="fw-bold"
                              htmlFor={`is_day_on_${workday.s_day}`}
                            >
                              {workday.s_day}
                            </label>
                          </th>
                          <th>
                            <Select
                              name={`s_hr_${workday.s_day}`}
                              id={`s_hr_${workday.s_day}`}
                              className={`s_hr_${workday.s_day}`}
                              isDisabled={
                                workday.is_day_on === false ||
                                workScheduleData?.type === 2
                              }
                              placeholder={"00"}
                              options={hourOptions}
                              value={hourOptions.find(
                                (option) => option.value === workday.s_hr,
                              )}
                              onChange={(e) => {
                                handleWorkDayTimechange(
                                  e.value,
                                  "s_hr",
                                  workday,
                                );
                              }}
                            />
                          </th>
                          <th>
                            {" "}
                            <Select
                              name={`s_min_${workday.s_day}`}
                              id={`s_min_${workday.s_day}`}
                              placeholder={"00"}
                              options={minuteOptions}
                              isDisabled={
                                workday.is_day_on === false ||
                                workScheduleData?.type === 2
                              }
                              value={minuteOptions.find(
                                (option) => option.value === workday.s_min,
                              )}
                              onChange={(e) => {
                                handleWorkDayTimechange(
                                  e.value,
                                  "s_min",
                                  workday,
                                );
                              }}
                            />
                          </th>
                          <th>
                            <i class="ri-arrow-left-right-line"></i>
                          </th>
                          <th>
                            <Select
                              name={`e_hr_${workday.s_day}`}
                              id={`e_hr_${workday.s_day}`}
                              placeholder={"00"}
                              options={hourOptions}
                              isDisabled={
                                workday.is_day_on === false ||
                                workScheduleData?.type === 2
                              }
                              value={hourOptions.find(
                                (option) => option.value === workday.e_hr,
                              )}
                              onChange={(e) => {
                                handleWorkDayTimechange(
                                  e.value,
                                  "e_hr",
                                  workday,
                                );
                              }}
                            />
                          </th>
                          <th>
                            {" "}
                            <Select
                              name={`e_min_${workday.s_day}`}
                              id={`e_min_${workday.s_day}`}
                              placeholder={"00"}
                              options={minuteOptions}
                              isDisabled={
                                workday.is_day_on === false ||
                                workScheduleData?.type === 2
                              }
                              value={minuteOptions.find(
                                (option) => option.value === workday.e_min,
                              )}
                              onChange={(e) => {
                                handleWorkDayTimechange(
                                  e.value,
                                  "e_min",
                                  workday,
                                );
                              }}
                            />
                          </th>
                          <th>
                            <span className="mb-2 text-info">
                              {workday.is_day_on === false ? (
                                "W/O"
                              ) : workScheduleData?.type === 2 ? (
                                <span className="mb-2 text-success">
                                  24:00 Hrs
                                </span>
                              ) : (
                                <>
                                  <span className="mb-2 text-success">
                                    {workScheduleData.fullday_work_duration >
                                      workday.total_work_duration ||
                                    workday.total_work_duration >
                                      workScheduleData.fullday_work_duration ? (
                                      <span className="mb-2 text-danger">
                                        {`${String(
                                          Math.floor(
                                            workday.total_work_duration / 3600,
                                          ),
                                        ).padStart(2, "0")}:${String(
                                          Math.floor(
                                            (workday.total_work_duration %
                                              3600) /
                                              60,
                                          ),
                                        ).padStart(2, "0")} Hrs`}
                                      </span>
                                    ) : (
                                      `${String(
                                        Math.floor(
                                          workday.total_work_duration / 3600,
                                        ),
                                      ).padStart(2, "0")}:${String(
                                        Math.floor(
                                          (workday.total_work_duration % 3600) /
                                            60,
                                        ),
                                      ).padStart(2, "0")} Hrs`
                                    )}
                                  </span>

                                  {workScheduleData.fullday_work_duration >
                                    workday.total_work_duration && (
                                    <div
                                      className="text-warning"
                                      style={{
                                        fontSize: "11px",
                                        marginTop: "2px",
                                      }}
                                    >
                                      ⚠️ Shift is less than Full Day duration
                                    </div>
                                  )}
                                  {workday.total_work_duration >
                                    workScheduleData.fullday_work_duration && (
                                    <div
                                      className="text-warning"
                                      style={{
                                        fontSize: "11px",
                                        marginTop: "2px",
                                      }}
                                    >
                                      ⚠️ Shift exceeds Full Day duration
                                    </div>
                                  )}
                                </>
                              )}
                            </span>
                          </th>
                        </tr>
                      );
                    })}
                  </thead>
                </table>

                <div className="d-flex align-items-start gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-light btn-label previestab"
                    onClick={() => {
                      toggleArrowTab(activeArrowTab - 1);
                    }}
                  >
                    <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Back to Basic Details
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success btn-label right ms-auto nexttab nexttab"
                  >
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                    Save
                  </button>
                </div>
              </TabPane>
            </TabContent>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default WorkScheduleForm;
