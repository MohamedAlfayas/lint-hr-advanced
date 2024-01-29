import React, { useState, useEffect, useCallback } from "react";
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
import { week_list } from "../../common/constant/Constants";

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

// register lottie and define custom element
defineElement(loadAnimation);

const WorkScheduleForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [workScheduleData, setWorkScheduleData] = useState({});
  const [activeArrowTab, setactiveArrowTab] = useState(4);
  useEffect(() => {
    setWorkScheduleData(form_obj);
  }, [form_obj]);

  // const [workScheduleDatas, setWorkScheduleDatas] = useState({
  //   id: 0,
  //   name: "",
  //   description: "",
  //   timezone: "Asia/Kolkata",
  //   auto_clock_out: false,
  //   status: true,
  //   is_default: false,
  //   fullday_hr: 0,
  //   fullday_min: 0,
  //   fullday_work_duration: 0,
  //   grace_in_time_hr: 0,
  //   grace_in_time_min: 0,
  //   grace_time_duration: 0,
  //   halfday_hr: 0,
  //   halfday_min: 0,
  //   halfday_work_duration: 0,
  //   maximum_break_hr: 0,
  //   maximum_break_min: 0,
  //   maximum_break_duration: 0,
  //   workday: [
  //     {
  //       day_id: 1,
  //       weekday: "monday",
  //       s_day: "monday",
  //       e_day: "",
  //       s_hr: "00",
  //       s_min: "00",
  //       e_hr: "00",
  //       e_min: "00",
  //       is_day_on: false,
  //       total_work_duration: 0,
  //       break_duration: 0,
  //       total_work_duration_without_break: 0,
  //     },
  //     {
  //       day_id: 2,
  //       weekday: "tuesday",
  //       s_day: "tuesday",
  //       e_day: "",
  //       s_hr: "00",
  //       s_min: "00",
  //       e_hr: "00",
  //       e_min: "00",
  //       is_day_on: false,
  //       total_work_duration: 0,
  //       break_duration: 0,
  //       total_work_duration_without_break: 0,
  //     },
  //     {
  //       day_id: 3,
  //       weekday: "wednesday",
  //       s_day: "wednesday",
  //       e_day: "",
  //       s_hr: "00",
  //       s_min: "00",
  //       e_hr: "00",
  //       e_min: "00",
  //       is_day_on: false,
  //       total_work_duration: 0,
  //       break_duration: 0,
  //       total_work_duration_without_break: 0,
  //     },
  //     {
  //       day_id: 4,
  //       weekday: "thursday",
  //       s_day: "thursday",
  //       e_day: "",
  //       s_hr: "00",
  //       s_min: "00",
  //       e_hr: "00",
  //       e_min: "00",
  //       is_day_on: false,
  //       total_work_duration: 0,
  //       break_duration: 0,
  //       total_work_duration_without_break: 0,
  //     },
  //     {
  //       day_id: 5,
  //       weekday: "friday",
  //       s_day: "friday",
  //       e_day: "",
  //       s_hr: "00",
  //       s_min: "00",
  //       e_hr: "00",
  //       e_min: "00",
  //       is_day_on: false,
  //       total_work_duration: 0,
  //       break_duration: 0,
  //       total_work_duration_without_break: 0,
  //     },
  //     {
  //       day_id: 6,
  //       weekday: "saturday",
  //       s_day: "saturday",
  //       e_day: "",
  //       s_hr: "00",
  //       s_min: "00",
  //       e_hr: "00",
  //       e_min: "00",
  //       is_day_on: false,
  //       total_work_duration: 0,
  //       break_duration: 0,
  //       total_work_duration_without_break: 0,
  //     },
  //     {
  //       day_id: 0,
  //       weekday: "sunday",
  //       s_day: "sunday",
  //       e_day: "",
  //       s_hr: "00",
  //       s_min: "00",
  //       e_hr: "00",
  //       e_min: "00",
  //       is_day_on: false,
  //       total_work_duration: 0,
  //       break_duration: 0,
  //       total_work_duration_without_break: 0,
  //     },
  //   ],
  // });

  const [passedarrowSteps, setPassedarrowSteps] = useState([1]);
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i.toString().padStart(2, "0"),
  }));

  const minuteOptions = Array.from({ length: 6 }, (_, i) => ({
    label: (i * 10).toString().padStart(2, "0"),
    value: (i * 10).toString().padStart(2, "0"),
  }));

  function toggleArrowTab(tab) {
    if (activeArrowTab !== tab) {
      var modifiedSteps = [...passedarrowSteps, tab];

      if (tab >= 4 && tab <= 7) {
        setactiveArrowTab(tab);
        setPassedarrowSteps(modifiedSteps);
      }
    }
  }

  const handleChange = useCallback((event) => {
    const { name } = event.target;
    setWorkScheduleData((prevWorkScheduleData) => ({
      ...prevWorkScheduleData,
      [name]: event.target.checked,
    }));
  }, []);

  const calculateTime = (obj, i, isWeekOff) => {
    if (!isWeekOff) {
      var StartTime = obj.workday[i].s_hr + ":" + obj.workday[i].s_min;
      var EndTime = obj.workday[i].e_hr + ":" + obj.workday[i].e_min;

      var Temp1 = new Date("2020-01-01" + " " + StartTime).getTime();
      var Temp2 = new Date("2020-01-01" + " " + EndTime).getTime();
      var DiffSec = Temp2 - Temp1;
      console.log("DiffSec", DiffSec);

      const startDate = new Date(
        2020,
        0,
        1,
        obj.workday[i].s_hr,
        obj.workday[i].s_min
      );

      const endDate = new Date(
        2020,
        0,
        1,
        obj.workday[i].e_hr,
        obj.workday[i].e_min
      );
      const secondDifference =
        endDate >= startDate
          ? (endDate - startDate) / 1000
          : (endDate - new Date(2020, 0, 1, 0, 0).getTime()) / 1000 +
            (new Date(2020, 0, 2, 0, 0) - startDate) / 1000;

      workScheduleData.workday[i].total_work_duration = secondDifference;
      workScheduleData.workday[i].total_work_duration_without_break =
        workScheduleData.workday[i].total_work_duration -
        workScheduleData.maximum_break_duration;

      // setWorkScheduleData((prevData) => {
      //   const updatedWorkdays = prevData.workday.map((workday, index) => {
      //     if (index === i) {
      //       // Update the properties for the specified index
      //       return {
      //         ...workday,
      //         total_work_duration: secondDifference,
      //         total_work_duration_without_break:
      //           secondDifference - prevData.maximum_break_duration,
      //       };
      //     }
      //     return workday; // For other indexes, keep the original workday
      //   });

      //   return {
      //     ...prevData,
      //     workday: updatedWorkdays,
      //   };
      // });

      // setWorkScheduleData({
      //   ...workScheduleData,
      //   total_work_duration: secondDifference,
      // });
      // total_work_duration: 0,
      //   (obj.workday[i].total_work_duration = secondDifference);

      // let updatedWorkDay = [...workScheduleData?.workday].map((d, idx) => {
      //   if (i === idx) {
      //     return {
      //       ...d,
      //       total_work_duration: secondDifference,
      //     };
      //   } else {
      //     return d;
      //   }
      // });

      // setWorkScheduleData({
      //   ...workScheduleData,
      //   total_work_duration: secondDifference,
      // });

      // var mins = Math.floor(DiffSec / 60000);
      // var hrs = Math.floor(mins / 60);
      // var sec = Math.floor(mins * 60);
      // console.log("Seconds", sec);

      var mins = Math.floor(secondDifference / 60);
      var hrs = Math.floor(mins / 60);
      mins = mins % 60;
      var ws_hr = obj.fullday_hr;
      var ws_min = obj.fullday_min;

      // if (parseInt(obj.workday[i].s_hr) > parseInt(obj.workday[i].e_hr)) {
      //   hrs = Math.abs(hrs) - 24;
      // }

      let colorCLass =
        Math.abs(hrs) - ws_hr == 0 && Math.abs(mins) - ws_min == 0
          ? "text-success"
          : "text-danger";

      var actualHr = pad(Math.abs(hrs)) + ":" + pad(Math.abs(mins));

      console.log("calculateTime.apply.........workScheduleData");
      console.log(workScheduleData);

      return (
        <span className={colorCLass}>
          {actualHr} <small>Hr</small>
        </span>
      );
    } else {
      return (
        <span className="text-info">
          <small>W/O</small>
        </span>
      );
    }
  };

  function pad(d) {
    return d < 10 ? "0" + d.toString() : d.toString();
  }

  function toHrSeconds({ h: hours, m: minutes, s: seconds }) {
    return hours * 3600 + minutes * 60 + seconds;
  }

  function toSecondsHr(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);

    var hDisplay = h < 10 ? "0" + h : "";
    var mDisplay = m < 10 ? "0" + m : "";
    var sDisplay = s < 10 ? "0" + s : "";

    let data = {
      hr: hDisplay,
      min: mDisplay,
      sec: sDisplay,
    };
    console.log(data);

    return data;
  }
  const getNextDay = (currentDay) => {
    const daysOfWeek = week_list.map((day) => day.label);
    const currentIndex = daysOfWeek.indexOf(currentDay);
    return daysOfWeek[(currentIndex + 1) % 7];
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: workScheduleData,
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Please Enter Work Schedule Name"),
    }),
    onSubmit: async (values) => {
      console.log("employee data = ", workScheduleData);
      console.log("SUCCESSSS !!!! Formik Values = ", values);
      toggleArrowTab(activeArrowTab + 1);
      // dispatch(setLoaderVisible(true));

      // const Api = await PostApi(
      //   "/work-schedule/create/",
      //   workScheduleData,
      //   false
      // );
      // console.log("API RES = ", Api);
      // if (Api.status && Api.status === 200) {
      //   workScheduleData.id === 0
      //     ? dispatch(addWorkSchedule(Api?.data.data))
      //     : dispatch(editWorkSchedule(Api?.data?.data));
      //   dispatch(toggleRSBView(false));
      //   toast.success(Api?.data?.message);
      // } else {
      //   toast.error(Api?.data?.message || Api?.data?.detail);
      // }

      // dispatch(setLoaderVisible(false));
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
                <NavItem>
                  <NavLink
                    href="#"
                    id="steparrow-gen-info-tab"
                    className={classnames({
                      active: activeArrowTab === 6,
                      done: activeArrowTab <= 6 && activeArrowTab > 5,
                    })}
                    onClick={() => {
                      toggleArrowTab(6);
                    }}
                  >
                    3)Finish
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
                          Name
                        </Label>
                        <Input
                          type="text"
                          name="name"
                          className="form-control"
                          id="ws_name"
                          placeholder="Enter Work Schedule Name"
                          value={workScheduleData.name || ""}
                          onChange={(e) =>
                            setWorkScheduleData({
                              ...workScheduleData,
                              name: e.target.value,
                            })
                          }
                          invalid={
                            FormikForm.touched.name && FormikForm.errors.name
                              ? true
                              : false
                          }
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
                          className="form-control"
                          id="ws_desc"
                          value={workScheduleData.description || ""}
                          onChange={(e) =>
                            setWorkScheduleData({
                              ...workScheduleData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col xxl={3} md={6}>
                      <div>
                        <Label htmlFor="ws_full_hr" className="form-label">
                          Work Duration
                        </Label>
                        <br></br>
                        <span class="form-text text-muted ms-3">Full Day</span>
                        <div style={{ display: "flex" }}>
                          <b className="mt-2 me-1">H</b>

                          <Select
                            id="ws_full_hr"
                            name="wsFullDayHr"
                            placeholder={"00"}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value ===
                                String(
                                  Math.floor(
                                    workScheduleData.fullday_work_duration /
                                      3600
                                  )
                                ).padStart(2, "0")
                            )}
                            onChange={(e) => {
                              setWorkScheduleData({
                                ...workScheduleData,
                                fullday_hr: e.value,

                                fullday_work_duration: toHrSeconds({
                                  h: e.value,
                                  m: workScheduleData.fullday_min,
                                  s: 0,
                                }),
                              });
                            }}
                          />
                          <b className="mt-2 me-1 ms-2">M</b>
                          <Select
                            id="ws_full_mi"
                            name="wsFullDayMin"
                            placeholder={"00"}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value ===
                                String(
                                  Math.floor(
                                    (workScheduleData.fullday_work_duration %
                                      3600) /
                                      60
                                  )
                                ).padStart(2, "0")
                            )}
                            onChange={(e) =>
                              setWorkScheduleData({
                                ...workScheduleData,
                                fullday_min: e.value,
                                fullday_work_duration: toHrSeconds({
                                  h: workScheduleData.fullday_hr,
                                  m: e.value,
                                  s: 0,
                                }),
                              })
                            }
                          />
                        </div>
                      </div>
                    </Col>

                    <Col xxl={3} md={6}>
                      <div>
                        <Label
                          htmlFor="basiInput"
                          className="form-label mb-3"
                        ></Label>
                        <br></br>
                        <span class="form-text text-muted ms-3">Half Day</span>
                        <div style={{ display: "flex" }}>
                          <b className="mt-2 me-1">H</b>
                          <Select
                            id="ws_half_hr"
                            name="wsHalfDayHr"
                            placeholder={"00"}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value ===
                                String(
                                  Math.floor(
                                    workScheduleData.halfday_work_duration /
                                      3600
                                  )
                                ).padStart(2, "0")
                            )}
                            onChange={(e) => {
                              setWorkScheduleData({
                                ...workScheduleData,
                                halfday_hr: e.value,

                                halfday_work_duration: toHrSeconds({
                                  h: e.value,
                                  m: workScheduleData.halfday_min,
                                  s: 0,
                                }),
                              });
                            }}
                          />
                          <b className="mt-2 me-1 ms-2">M</b>
                          <Select
                            id="ws_half_min"
                            name="wsHalfDayMin"
                            placeholder={"00"}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value ===
                                String(
                                  Math.floor(
                                    (workScheduleData.halfday_work_duration %
                                      3600) /
                                      60
                                  )
                                ).padStart(2, "0")
                            )}
                            onChange={(e) =>
                              setWorkScheduleData({
                                ...workScheduleData,
                                halfday_min: e.value,
                                halfday_work_duration: toHrSeconds({
                                  h: workScheduleData.halfday_hr,
                                  m: e.value,
                                  s: 0,
                                }),
                              })
                            }
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col xxl={3} md={6}>
                      <div>
                        <Label htmlFor="basiInput" className="form-label">
                          Grace Period
                        </Label>
                        <br></br>
                        <div style={{ display: "flex" }}>
                          <b className="mt-2 me-1">H</b>

                          <Select
                            id="gracePeriodInHours"
                            name="gracePeriodInHours"
                            placeholder={"00"}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value ===
                                String(
                                  Math.floor(
                                    workScheduleData.grace_time_duration / 3600
                                  )
                                ).padStart(2, "0")
                            )}
                            onChange={(e) => {
                              setWorkScheduleData({
                                ...workScheduleData,
                                grace_in_time_hr: e.value,

                                grace_time_duration: toHrSeconds({
                                  h: e.value,
                                  m: workScheduleData.grace_in_time_min,
                                  s: 0,
                                }),
                              });
                            }}
                          />
                          <b className="mt-2 me-1 ms-2">M</b>
                          <Select
                            id="gracePeriodInMinutes"
                            name="gracePeriodInMinutes"
                            placeholder={"00"}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value ===
                                String(
                                  Math.floor(
                                    (workScheduleData.grace_time_duration %
                                      3600) /
                                      60
                                  )
                                ).padStart(2, "0")
                            )}
                            onChange={(e) =>
                              setWorkScheduleData({
                                ...workScheduleData,
                                grace_in_time_min: e.value,
                                grace_time_duration: toHrSeconds({
                                  h: workScheduleData.grace_in_time_hr,
                                  m: e.value,
                                  s: 0,
                                }),
                              })
                            }
                          />
                        </div>
                      </div>
                    </Col>

                    <Col xxl={3} md={6}>
                      <div>
                        <Label htmlFor="basiInput" className="form-label">
                          Maximum Total Break Duration
                        </Label>
                        <br></br>
                        <div style={{ display: "flex" }}>
                          <b className="mt-2 me-1">H</b>

                          <Select
                            id="maximum_break_hr"
                            name="maximum_break_hr"
                            placeholder={"00"}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value ===
                                String(
                                  Math.floor(
                                    workScheduleData.maximum_break_duration /
                                      3600
                                  )
                                ).padStart(2, "0")
                            )}
                            onChange={(e) => {
                              setWorkScheduleData({
                                ...workScheduleData,
                                maximum_break_hr: e.value,
                                maximum_break_duration: toHrSeconds({
                                  h: e.value,
                                  m: workScheduleData.maximum_break_min,
                                  s: 0,
                                }),
                              });
                            }}
                          />
                          <b className="mt-2 me-1 ms-2">M</b>
                          <Select
                            id="maximum_break_min"
                            name="maximum_break_min"
                            placeholder={"00"}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value ===
                                String(
                                  Math.floor(
                                    (workScheduleData.maximum_break_duration %
                                      3600) /
                                      60
                                  )
                                ).padStart(2, "0")
                            )}
                            onChange={(e) =>
                              setWorkScheduleData({
                                ...workScheduleData,
                                maximum_break_min: e.value,
                                maximum_break_duration: toHrSeconds({
                                  h: workScheduleData.maximum_break_hr,
                                  m: e.value,
                                  s: 0,
                                }),
                              })
                            }
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Col lg={12}>
                    <div>
                      <Label for="auto_clock_out_cb" className="form-label">
                        Auto Clock Out
                      </Label>
                      <div
                        className="form-check form-switch form-switch-md form-switch-success"
                        dir="ltr"
                      >
                        <Input
                          name="auto_clock_out"
                          id="auto_clock_out_cb"
                          type="checkbox"
                          className="form-check-input"
                          checked={workScheduleData.auto_clock_out}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </Col>

                  <Col lg={12}>
                    <div>
                      <Label for="has_ot" className="form-label">
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
                </div>
                <div className="d-flex align-items-start gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-success btn-label right ms-auto nexttab nexttab"
                    onClick={() => {
                      FormikForm.validateForm().then((errors) => {
                        if (Object.keys(errors).length === 0) {
                          // No validation errors, move to the next step
                          toggleArrowTab(activeArrowTab + 1);
                        } else {
                          // Validation errors, display an error message or handle accordingly
                          console.log("Validation errors:", errors);
                          toast.error("Please Enter Work Schedule");
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
                      <th> </th>
                      <th>Day </th>
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
                              onChange={(e) => {
                                calculateTime(
                                  workScheduleData,
                                  index,
                                  !workday.is_day_on
                                );
                                let global_wd = [...workScheduleData.workday];

                                let this_wd = e.target.checked
                                  ? { ...workday, is_day_on: e.target.checked }
                                  : {
                                      ...workday,
                                      is_day_on: e.target.checked,
                                      s_hr: "00",
                                      s_min: "00",
                                      e_hr: "00",
                                      e_min: "00",
                                      total_work_duration: 0,
                                      break_duration: 0,
                                      total_work_duration_without_break: 0,
                                    };

                                let res = global_wd.map((obj, idx) =>
                                  idx === index ? this_wd : obj
                                );
                                setWorkScheduleData({
                                  ...workScheduleData,
                                  workday: res,
                                });
                              }}
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
                              isDisabled={!workday.is_day_on}
                              placeholder={"00"}
                              options={hourOptions}
                              value={hourOptions.find(
                                (option) => option.value === workday.s_hr
                              )}
                              onChange={(e) => {
                                let global_wd = [...workScheduleData.workday];
                                let this_wd = {
                                  ...workday,
                                  s_hr: e.value,
                                };
                                let res = global_wd.map((obj, idx) =>
                                  idx === index ? this_wd : obj
                                );
                                setWorkScheduleData({
                                  ...workScheduleData,
                                  workday: res,
                                });
                                console.log(res);
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
                              isDisabled={!workday.is_day_on}
                              value={minuteOptions.find(
                                (option) => option.value === workday.s_min
                              )}
                              onChange={(e) => {
                                let global_wd = [...workScheduleData.workday];
                                let this_wd = {
                                  ...workday,
                                  s_min: e.value,
                                };
                                let res = global_wd.map((obj, idx) =>
                                  idx === index ? this_wd : obj
                                );
                                setWorkScheduleData({
                                  ...workScheduleData,
                                  workday: res,
                                });
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
                              isDisabled={!workday.is_day_on}
                              value={hourOptions.find(
                                (option) => option.value === workday.e_hr
                              )}
                              onChange={(e) => {
                                console.log("Type of e.value:", typeof e.value);
                                console.log("Value of e.value:", e.value);

                                let global_wd = [...workScheduleData.workday];
                                let this_wd = {
                                  ...workday,
                                  e_hr: e.value,
                                };
                                if (
                                  e.value.trim() === "00" ||
                                  e.value < workday.s_hr
                                ) {
                                  this_wd.e_day = getNextDay(workday.s_day);
                                } else if (
                                  e.value === workday.s_hr &&
                                  workday.e_min < workday.s_min
                                ) {
                                  this_wd.e_day = getNextDay(workday.s_day);
                                } else {
                                  this_wd.e_day = workday.s_day;
                                }
                                let res = global_wd.map((obj, idx) =>
                                  idx === index ? this_wd : obj
                                );
                                setWorkScheduleData({
                                  ...workScheduleData,
                                  workday: res,
                                });
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
                              isDisabled={!workday.is_day_on}
                              value={minuteOptions.find(
                                (option) => option.value === workday.e_min
                              )}
                              onChange={(e) => {
                                let global_wd = [...workScheduleData.workday];
                                let this_wd = {
                                  ...workday,
                                  e_min: e.value,
                                };
                                let res = global_wd.map((obj, idx) =>
                                  idx === index ? this_wd : obj
                                );
                                setWorkScheduleData({
                                  ...workScheduleData,
                                  workday: res,
                                });
                              }}
                            />
                          </th>
                          <th>
                            <span className="mb-2">
                              {calculateTime(
                                workScheduleData,
                                index,
                                !workday.is_day_on
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
                    <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                    Submit
                  </button>
                </div>
              </TabPane>

              <TabPane id="pills-experience" tabId={6}>
                <div className="text-center">
                  <div className="avatar-md mt-5 mb-4 mx-auto">
                    <div className="avatar-title bg-light text-success display-4 rounded-circle">
                      <i className="ri-checkbox-circle-fill"></i>
                    </div>
                  </div>
                  <h5>Well Done !</h5>
                  <p className="text-muted">You have Successfully Signed Up</p>
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
