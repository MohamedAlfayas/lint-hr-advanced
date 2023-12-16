import axios from "axios";
import { FilePond } from "filepond";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Col, Form, Input, FormFeedback, Label, Row } from "reactstrap";
import Select from "react-select";
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  addLeaveApplication,
  editLeaveApplication,
} from "../../redux/reducers/ChildReducer/LeaveApplyReducer";
import { toast } from "react-toastify";
import { ConvertISODateFormat } from "../../common/js/ConvertDateFormat";
import Flatpickr from "react-flatpickr";
import {
  leave_type_day_unit,
  leave_type_hour_unit,
} from "../../common/constant/Constants";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";

const ApplyLeaveForm = () => {
  const dispatch = useDispatch();
  const [leaveapplyObj, setLeaveApplyObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [selectedLeaveType, setSelectedLeaveType] = useState([]);
  const [leaveDaysCount, setLeaveDaysCount] = useState(0);
  const [leaveHoursCount, setLeaveHoursCount] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startHour, setStartHour] = useState(null);
  const [endHour, setEndHour] = useState(null);
  const [startMinute, setStartMinute] = useState(null);
  const [endMinute, setEndMinute] = useState(null);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartHour, setSelectedStartHour] = useState("09");
  const [selectedStartMinute, setSelectedStartMinute] = useState("30");
  const [selectedEndHour, setSelectedEndHour] = useState("18");
  const [selectedEndMinute, setSelectedEndMinute] = useState("00");

  useEffect(() => {
    setLeaveApplyObj(form_obj);
    console.log("...............");
    console.log(form_obj);
    setCurrentUnit(form_obj.unit);
    setSelectedLeaveType(
      (form_obj.leavetype &&
        lt_option.find((e) => e.id === form_obj.leavetype).unit) ||
        (form_obj.id && lt_option.find((e) => e.id === form_obj.id).unit) ||
        []
    );
    setStartDate(form_obj.start);
    setEndDate(form_obj.end);
  }, [form_obj]);

  const handleDateSelected = (selectedDates, dateStr, instance) => {
    const selectedDate = new Date(selectedDates[0]);
    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    console.log("Selected day: " + dayName);
    setSelectedDate(selectedDate);
    getHourMinData(dayName);
  };

  const workScheduleData = GetLocalStorageData("work_schedule") || [];
  const profileData = GetLocalStorageData("my_profile") || [];
  // const MyWorkID = ProfileData.find(work_schedule_id);

  // console.log(MyWorkID);
  const myWork = workScheduleData?.find(
    (val) => val.id === profileData.work_schedule_id
  );

  const getHourMinData = (dayName) => {
    const scheduleWeek = myWork.workday.find((d) => d.weekday === dayName);
    console.log("====================================");
    console.log("scheduleWeek === ", scheduleWeek);
    console.log("SHR === ", scheduleWeek.s_hr, " SMIN = ", scheduleWeek.s_min);
    console.log("EHR === ", scheduleWeek.e_hr, " EMIN = ", scheduleWeek.e_min);
    console.log("====================================");
    if (scheduleWeek) {
      setSelectedStartHour(scheduleWeek.s_hr);
      setSelectedEndHour(scheduleWeek.e_hr);
      setSelectedStartMinute(scheduleWeek.s_min);
      setSelectedEndMinute(scheduleWeek.e_min);
    }
  };

  console.log(workScheduleData);
  console.log(myWork);
  console.log(profileData);
  console.log("*********");

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: leaveapplyObj,
    validationSchema: Yup.object({
      leavetype: Yup.number()
        .required("Select Leave Type")
        .min(1, "Please Select Leave Type"),
      reason: Yup.string().required("Please enter reason for leave."),
    }),
    onSubmit: async (values) => {
      console.log("SUCCESSSS !!!! Formik Values = ", values);
      dispatch(setLoaderVisible(true));

      const Api = await PostApi(
        "leave/leave-application/create/",
        values,
        false
      );
      console.log("API RES = ", Api);
      if (Api.status && Api.status === 200) {
        leaveapplyObj.id === 0
          ? dispatch(addLeaveApplication(Api?.data.data))
          : dispatch(editLeaveApplication(Api?.data?.data));
        dispatch(toggleRSBView(false));
        toast.success(Api?.data?.message);
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail);
      }

      dispatch(setLoaderVisible(false));
    },
  });

  // const handleSubmit = async () => {
  //   Api({
  //     method: "POST",
  //     url: "holiday/create/",
  //     data: holidayObj,
  //   })
  //     .then((res) => {
  //       console.log("REs = ", res);
  //       holidayObj.id === 0
  //         ? dispatch(addHoliday(res?.data.data))
  //         : dispatch(editHoliday(res?.data?.data));
  //       dispatch(toggleRSBView(false));
  //       toast.success(res?.data?.message);
  //     })
  //     .catch((err) => {
  //       console.log("ERr == ", err);
  //       toast.success(err?.response?.data?.message);
  //     });
  // };

  const lt_option = [
    {
      id: 1,
      label: "Casual Leave (CL)",
      value: 1,
      type: 1,
      unit: 1,
      leave_count: 12,
      available_count: 12,
      status: 1,
    },
    {
      id: 2,
      label: "Earned Leave (EL)",
      value: 2,
      type: 1,
      unit: 1,
      leave_count: 12,
      available_count: 12,
      status: 1,
    },
    {
      id: 3,
      label: "Sick Leave (SL)",
      value: 3,
      type: 2,
      unit: 1,
      leave_count: 12,
      available_count: 5,
      status: 1,
    },
    {
      id: 4,
      label: "Maternity Leave (ML)",
      value: 4,
      type: 1,
      unit: 1,
      leave_count: 60,
      available_count: 30,
      status: 1,
    },
    {
      id: 5,
      label: "Marriage Leave",
      value: 5,
      type: 1,
      unit: 1,
      leave_count: 15,
      available_count: 15,
      status: 1,
    },
    {
      id: 6,
      label: "Compensatory Off",
      value: 6,
      type: 1,
      unit: 1,
      leave_count: 12,
      available_count: 12,
      status: 1,
    },
    {
      id: 7,
      label: "Loss Of Pay Leave",
      value: 7,
      type: 1,
      unit: 1,
      leave_count: 12,
      available_count: 12,
      status: 1,
    },
    {
      id: 8,
      label: "Permission",
      value: 8,
      type: 1,
      unit: 2,
      leave_count: 48,
      available_count: 32,
      status: 1,
    },
  ];
  const [daysCount, setDaysCount] = useState(0);
  const handleDateChange = (selectedDates) => {
    if (selectedDates.length === 2) {
      const startDate = selectedDates[0];
      const endDate = selectedDates[1];

      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (24 * 60 * 60 * 1000)) + 1;

      setDaysCount(daysDiff);
    } else {
      setDaysCount(0);
    }

    // console.log(leaveapplyObj);
    // if (startDate != null && endDate != null) {
    //   setLeaveApplyObj({
    //     ...leaveapplyObj,
    //     start: ConvertISODateFormat(startDate),
    //   });
    //   setLeaveApplyObj({
    //     ...leaveapplyObj,
    //     end: ConvertISODateFormat(endDate),
    //   });
    //   console.log(startDate);
    //   console.log(endDate);
    //   var diff = new Date(endDate) - new Date(startDate);
    //   console.log(diff);
    //   if (!isNaN(diff)) {
    //     var diffCount = diff / 1000 / 60 / 60 / 24 + 1;
    //     setLeaveDaysCount(diffCount);
    //     if (diffCount <= 0) {
    //       setEndDate(startDate);
    //       setLeaveDaysCount(0);
    //       toast.warning("Date Range Error");
    //     } else if (diffCount > leaveapplyObj.available_count) {
    //       toast.warning("Date Range is Exceed Your Limit");
    //       setEndDate(null);
    //     } else {
    //       setLeaveDaysCount(diffCount);
    //     }
    //     console.log(diffCount);
    //   }
    // }
  };

  const handleHourChange = () => {
    if (
      selectedStartHour &&
      selectedStartMinute &&
      selectedEndHour &&
      selectedEndMinute
    ) {
      const startTime = new Date(
        0,
        0,
        0,
        parseInt(selectedStartHour),
        parseInt(selectedStartMinute)
      );
      const endTime = new Date(
        0,
        0,
        0,
        parseInt(selectedEndHour),
        parseInt(selectedEndMinute)
      );
      const endofDay = new Date(0, 0, 0, 24, 0);
      const startofDay = new Date(0, 0, 0, 0, 0);

      if (startTime > endTime) {
        const firstDHour = endofDay - startTime;
        const secondDHour = endTime - startofDay;
        const totalDiff = firstDHour + secondDHour;
        const hourDiff = Math.floor(totalDiff / (1000 * 60 * 60));
        const minuteDiff = Math.floor(
          (totalDiff % (1000 * 60 * 60)) / (1000 * 60)
        );
        return `${hourDiff}:${minuteDiff}`;
      } else {
        const timeDiff = endTime - startTime;
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesDiff = Math.floor(
          (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
        );
        return `${hoursDiff}:${minutesDiff}`;
      }
    }
    // if (selectedStartHour != null && selectedEndHour != null) {
    //   setLeaveApplyObj({
    //     ...leaveapplyObj,
    //     start: selectedStartHour,
    //   });
    //   setLeaveApplyObj({
    //     ...leaveapplyObj,
    //     end: selectedEndHour,
    //   });

    //   var diff = new Date(selectedEndHour) - new Date(selectedStartHour);
    //   console.log(diff);

    //   if (!isNaN(diff)) {
    //     //var diffCount = diff / 1000 / 60 / 60 / 24 + 1;

    //     var seconds = Math.floor(diff / 1000);
    //     var minutes =
    //       Math.floor((seconds % 3600) / 60) < 10
    //         ? "0" + Math.floor((seconds % 3600) / 60)
    //         : Math.floor((seconds % 3600) / 60);
    //     var hour =
    //       Math.floor(seconds / 3600) < 10
    //         ? "0" + Math.floor(seconds / 3600)
    //         : Math.floor(seconds / 3600);
    //     var TotalDiff = hour + " : " + minutes;

    //     console.log(TotalDiff);

    //     setLeaveHoursCount(TotalDiff);

    //     if (TotalDiff <= 0) {
    //       setSelectedEndHour(selectedStartHour);
    //       setLeaveHoursCount(0);
    //       toast.warning("Hour Range Error");
    //     } else if (TotalDiff > leaveapplyObj.available_count) {
    //       toast.warning("Hour Range is Exceed Your Limit");

    //       setSelectedEndHour(null);
    //     } else {
    //       setLeaveHoursCount(TotalDiff);
    //     }
    //     console.log(TotalDiff);
    //   }
    // }
  };

  // useEffect(() => {
  //   handleDateChange(startDate, endDate);
  // }, [startDate, endDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveApplyObj({
      ...leaveapplyObj,
      [name]: value,
    });
  };

  const hours = Array.from({ length: 24 }, (_, index) => ({
    label: index < 10 ? `0${index}` : `${index}`,
    value: index < 10 ? `0${index}` : `${index}`,
  }));

  const minutes = Array.from({ length: 60 }, (_, index) => ({
    label: index < 10 ? `0${index}` : `${index}`,
    value: index < 10 ? `0${index}` : `${index}`,
  }));

  const handleStartTimeChange = (e) => {
    const value = e.value;
    setSelectedStartHour(value);
  };
  const handleEndTimeChange = (e) => {
    const value = e.value;
    setSelectedEndHour(value);
  };

  const handleStartMinuteChange = (e) => {
    const value = e.value;
    setSelectedStartMinute(value);
  };

  const handleEndMinuteChange = (e) => {
    const value = e.value;
    setSelectedEndMinute(value);
  };
  const handleUnitChange = (e) => {
    console.log("Unit Change = ", e);
    if (e === leave_type_day_unit) {
      setLeaveApplyObj({
        leaveapplyObj,
        unit: e,
        day_value: "",
      });
    } else {
      setLeaveApplyObj({
        leaveapplyObj,
        unit: e,
        hour_value: "",
      });
    }
    setCurrentUnit(e);
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form onSubmit={FormikForm.handleSubmit} action="javascript:void(0)">
            <Row className="g-3">
              <Col lg={12}>
                <div className="mb-3">
                  <Label>Type *</Label>
                  <Select
                    name="leavetype"
                    isMulti={false}
                    options={lt_option || []}
                    //value={leaveapplyObj.leavetype || []}
                    //onChange={handleGenderChange}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          FormikForm.touched.leavetype &&
                          FormikForm.errors.leavetype
                            ? "red !important"
                            : provided.borderColor,
                      }),
                    }}
                    value={
                      (leaveapplyObj.leavetype &&
                        lt_option.find(
                          (e) => e.id === leaveapplyObj.leavetype
                        )) ||
                      (leaveapplyObj.id &&
                        lt_option.find((e) => e.id === leaveapplyObj.id)) ||
                      []
                    }
                    onChange={(e) => {
                      // console.log("====================================");
                      // console.log("Unit ---- ", e);
                      // console.log("====================================");
                      // setSelectedLeaveType(e.unit);
                      // console.log(leaveDaysCount);
                      setLeaveApplyObj({
                        ...leaveapplyObj,
                        leavetype: e.id,
                        available_count: e.available_count,
                      });
                    }}
                    placeholder="Select Leave Type"
                    className="basic-multi-select"
                    invalid={
                      FormikForm.touched.leavetype &&
                      FormikForm.errors.leavetype
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.leavetype &&
                  FormikForm.errors.leavetype ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.leavetype}
                    </div>
                  ) : null}
                </div>
                {!FormikForm.errors.leavetype && (
                  <div id="passwordHelpBlock" className="form-text">
                    Please select type of leave.
                  </div>
                )}
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="unit" className="form-label">
                    Select Day
                  </Label>
                  <div className="">
                    <div className="form-check form-check-inline">
                      <Input
                        id="single"
                        name="single"
                        type="radio"
                        className="form-check-input"
                        checked={
                          leaveapplyObj.unit && leaveapplyObj.unit === 2
                            ? true
                            : false
                        }
                        onChange={() => handleUnitChange(leave_type_hour_unit)}
                      />
                      <Label className="form-check-label" htmlFor="single">
                        Single Day
                      </Label>
                    </div>
                    <div className="form-check form-check-inline">
                      <Input
                        id="multiple"
                        name="multiple"
                        type="radio"
                        className="form-check-input"
                        checked={
                          leaveapplyObj.unit && leaveapplyObj.unit === 1
                            ? true
                            : false
                        }
                        onChange={() => handleUnitChange(leave_type_day_unit)}
                      />
                      <Label className="form-check-label" htmlFor="multiple">
                        Multiple Days
                      </Label>
                    </div>
                  </div>
                </div>
                {/* <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Leave Type Unit.
                </div> */}
              </Col>

              {currentUnit && currentUnit === leave_type_hour_unit && (
                <Col lg={12}>
                  <div className="input-group">
                    <Flatpickr
                      name="selecteDate"
                      className="form-control"
                      placeholder="Select Date"
                      value={startDate}
                      disable={["2023-12-12"]}
                      options={{
                        dateFormat: "d M, Y",
                      }}
                      onChange={handleDateSelected}
                    />

                    <Select
                      name="s_hr"
                      value={
                        hours.find((d) => d.value === selectedStartHour) || []
                      }
                      onChange={handleStartTimeChange}
                      options={hours || []}
                      autosize={true}
                      placeholder="09"
                    ></Select>

                    <Select
                      name="s_min"
                      value={
                        minutes.find((d) => d.value === selectedStartMinute) ||
                        []
                      }
                      onChange={handleStartMinuteChange}
                      options={minutes || []}
                      placeholder="30"
                      autosize={true}
                    ></Select>
                    <span className="input-group-text">To</span>

                    <Select
                      name="e_hr"
                      value={
                        hours.find((d) => d.value === selectedEndHour) || []
                      }
                      onChange={handleEndTimeChange}
                      options={hours || []}
                      autosize={true}
                      placeholder="18"
                    ></Select>

                    <Select
                      name="e_min"
                      value={
                        minutes.find((d) => d.value === selectedEndMinute) || []
                      }
                      onChange={handleEndMinuteChange}
                      options={minutes || []}
                      autosize={true}
                      placeholder="00"
                    ></Select>

                    <span className="input-group-text">
                      {handleHourChange()}h
                    </span>
                  </div>

                  <div id="passwordHelpBlock" className="form-text">
                    Please select Date and Time
                  </div>
                </Col>
              )}

              {currentUnit && currentUnit === leave_type_day_unit && (
                <Col lg={12}>
                  {/* <label htmlFor="holidayName" className="form-label">
                  Select Hour *
                </label> */}
                  <div className="input-group">
                    <Flatpickr
                      className="form-control"
                      placeholder="Select Date"
                      options={{
                        mode: "range",
                      }}
                      onChange={handleDateChange}
                      // onChange={(selectedDates, dateStr, instance) => {
                      //   setLeaveApplyObj({ ...leaveapplyObj, end: dateStr });
                      //   setSelectedStartHour(dateStr);

                      //   handleDateChange(selectedDates, dateStr, instance);
                      // }}
                    />
                    <span className="input-group-text">{daysCount} Days</span>
                    {/* <Flatpickr
                    className="form-control"
                    placeholder="End Hour"
                    value={endHour}
                    options={{
                      mode: "range",
                    }}
                    onChange={(selectedDates, dateStr, instance) => {
                      //setLeaveApplyObj({ ...leaveapplyObj, end: dateStr });
                      setEndHour(dateStr);

                      // handleDateChange(selectedDates, dateStr, instance);
                    }}
                  /> */}
                  </div>
                  <div id="passwordHelpBlock" className="form-text">
                    Please select Start & End Date
                  </div>
                </Col>
              )}

              <Col lg={12}>
                <label htmlFor="reason" className="form-label">
                  Reason *
                </label>
                <Input
                  type="textarea"
                  name="reason"
                  className="form-control"
                  id="description"
                  placeholder="Enter Reason"
                  value={leaveapplyObj.reason || ""}
                  onChange={handleInputChange}
                  invalid={
                    FormikForm.touched.reason && FormikForm.errors.reason
                      ? true
                      : false
                  }
                />
                {FormikForm.touched.reason && FormikForm.errors.reason ? (
                  <FormFeedback type="invalid">
                    {FormikForm.errors.reason}
                  </FormFeedback>
                ) : null}

                {!FormikForm.errors.reason && (
                  <div id="passwordHelpBlock" className="form-text">
                    Please enter reason for leave.
                  </div>
                )}
              </Col>

              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label" type="submit">
                    {" "}
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Apply{" "}
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

export default ApplyLeaveForm;
