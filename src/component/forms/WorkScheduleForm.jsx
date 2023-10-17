import React, { useState, useEffect } from "react";
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
  TabPane,
  Progress,
} from "reactstrap";
import Select from "react-select";
import { Api } from "../../common/api/Api";

import classnames from "classnames";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import {
  addWorkSchedule,
  editWorkSchedule,
} from "../../redux/reducers/ChildReducer/WorkScheduleReducer";
import { toast } from "react-toastify";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";

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

  const [passedarrowSteps, setPassedarrowSteps] = useState([1]);
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i.toString().padStart(2, "0"),
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i.toString().padStart(2, "0"),
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

  const handleCBChange = (elm, ck) => {
    console.log(elm);
    console.log(ck);
  };

  const calculateTime = (obj, i, isWeekOff) => {
    if (!isWeekOff) {
      var StartTime = obj.workday[i].s_hr + ":" + obj.workday[i].s_min;
      var EndTime = obj.workday[i].e_hr + ":" + obj.workday[i].e_min;

      var Temp1 = new Date("2020-01-01" + " " + StartTime).getTime();
      var Temp2 = new Date("2020-01-01" + " " + EndTime).getTime();
      var DiffSec = Temp2 - Temp1;

      var mins = Math.floor(DiffSec / 60000);
      var hrs = Math.floor(mins / 60);

      mins = mins % 60;

      var ws_hr = obj.fullday_hr;
      var ws_min = obj.fullday_min;

      if (parseInt(obj.workday[i].s_hr) > parseInt(obj.workday[i].e_hr)) {
        hrs = Math.abs(hrs) - 24;
      }

      let colorCLass =
        Math.abs(hrs) - ws_hr == 0 && Math.abs(mins) - ws_min == 0
          ? "text-success"
          : "text-danger";

      var actualHr = pad(Math.abs(hrs)) + ":" + pad(Math.abs(mins));

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("employee data = ", workScheduleData);
    toggleArrowTab(activeArrowTab + 1);
    dispatch(setLoaderVisible(true));
    Api({
      method: "POST",
      url: "/work-schedule/create/",
      data: workScheduleData,
    })
      .then((res) => {
        console.log("Res = ", res);
        workScheduleData.id === 0
          ? dispatch(addWorkSchedule(res?.data.data))
          : dispatch(editWorkSchedule(res?.data?.data));
        dispatch(setLoaderVisible(false));
        dispatch(toggleRSBView(false));
        toast.success(res?.data?.message);
      })
      .catch((err) => {
        dispatch(setLoaderVisible(false));
        console.log("Err = ", err);
        toast.error(err?.response?.data?.message);
      });
  };

  document.title = "WorkSchedule | Lint HR";

  return (
    <React.Fragment>
      <Row>
        <Col xl={40}>
          <Form onSubmit={handleSubmit} className="form-steps">
            <div className="step-arrow-nav mb-4">
              <Nav
                className="nav-pills custom-nav nav-justified"
                role="tablist">
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
                    }}>
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
                    }}>
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
                    }}>
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
                          className="form-control"
                          id="ws_name"
                          placeholder="Enter Work Schedule Name"
                          required
                          value={workScheduleData.name || ""}
                          onChange={(e) =>
                            setWorkScheduleData({
                              ...workScheduleData,
                              name: e.target.value,
                            })
                          }
                        />
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
                                option.value === workScheduleData.fullday_hr
                            )}
                            onChange={(e) =>
                              setWorkScheduleData({
                                ...workScheduleData,
                                fullday_hr: e.value,
                              })
                            }
                          />
                          <b className="mt-2 me-1 ms-2">M</b>
                          <Select
                            id="ws_full_mi"
                            name="wsFullDayMin"
                            placeholder={"00"}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === workScheduleData.fullday_min
                            )}
                            onChange={(e) =>
                              setWorkScheduleData({
                                ...workScheduleData,
                                fullday_min: e.value,
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
                          className="form-label mb-3"></Label>
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
                                option.value === workScheduleData.halfday_hr
                            )}
                            onChange={(e) =>
                              setWorkScheduleData({
                                ...workScheduleData,
                                halfday_hr: e.value,
                              })
                            }
                          />
                          <b className="mt-2 me-1 ms-2">M</b>
                          <Select
                            id="ws_half_min"
                            name="wsHalfDayMin"
                            placeholder={"00"}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === workScheduleData.halfday_min
                            )}
                            onChange={(e) =>
                              setWorkScheduleData({
                                ...workScheduleData,
                                halfday_min: e.value,
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
                                workScheduleData.grace_in_time_hr
                            )}
                            onChange={(e) =>
                              setWorkScheduleData({
                                ...workScheduleData,
                                grace_in_time_hr: e.value,
                              })
                            }
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
                                workScheduleData.grace_in_time_min
                            )}
                            onChange={(e) =>
                              setWorkScheduleData({
                                ...workScheduleData,
                                grace_in_time_min: e.value,
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
                                workScheduleData.maximum_break_hr
                            )}
                            onChange={(e) =>
                              setWorkScheduleData({
                                ...workScheduleData,
                                maximum_break_hr: e.value,
                              })
                            }
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
                                workScheduleData.maximum_break_min
                            )}
                            onChange={(e) =>
                              setWorkScheduleData({
                                ...workScheduleData,
                                maximum_break_min: e.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col xxl={9} md={9}>
                      <div className="form-check form-check-success mb-3 mt-3 w-50">
                        <Label
                          className="form-check-label"
                          for="auto_clock_out_cb">
                          Auto Clock Out
                        </Label>
                        <Input
                          className="form-check-input"
                          type="checkbox"
                          name="auto_clock_out_cb"
                          id="auto_clock_out_cb"
                          checked={workScheduleData.auto_clock_out}
                          onChange={(e) => {
                            console.log(e);
                            setWorkScheduleData({
                              ...workScheduleData,
                              auto_clock_out: e.target.checked,
                            });
                          }}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
                <div className="d-flex align-items-start gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-success btn-label right ms-auto nexttab nexttab"
                    onClick={() => {
                      toggleArrowTab(activeArrowTab + 1);
                    }}>
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
                      <th>Shift Hourse</th>
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
                              htmlFor={`is_day_on_${workday.s_day}`}>
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
                              value={minuteOptions.find(
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
                                let global_wd = [...workScheduleData.workday];
                                let this_wd = {
                                  ...workday,
                                  e_hr: e.value,
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
                    }}>
                    <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Back to Basic Details
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success btn-label right ms-auto nexttab nexttab">
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
