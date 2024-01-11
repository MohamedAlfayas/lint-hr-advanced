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
import {
  ConvertDateFormat,
  ConvertISODateFormat,
  ConvertDayNameFromISO,
  convertHolidayDateFormat,
} from "../../common/js/ConvertDateFormat";
import Flatpickr from "react-flatpickr";
import {
  single_day_type_leave,
  multiple_day_type_leave,
} from "../../common/constant/Constants";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import { toast } from "react-toastify";
import { DatePicker, Space } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DateFormat } from "../../common/constant/Constants";
dayjs.extend(customParseFormat);

const ApplyLeaveForm = () => {
  const dispatch = useDispatch();
  const [leaveapplyObj, setLeaveApplyObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [multipleDayStartDate, setMultipleDayStartDate] = useState(null);
  const [multipleDayEndDate, setMultipleDayEndDate] = useState(null);
  const [selectedSingleDate, setselectedSingleDate] = useState(null);
  const [selectedStartHour, setSelectedStartHour] = useState("");
  const [selectedStartMinute, setSelectedStartMinute] = useState("");
  const [selectedEndHour, setSelectedEndHour] = useState("");
  const [selectedEndMinute, setSelectedEndMinute] = useState("");
  const { RangePicker } = DatePicker;
  const [hrDiff, setHrDiff] = useState("");
  const [selectedLeave_type, setSelectedLeave_type] = useState("");
  const [totalMinutes, setTotalMinutes] = useState("");
  const [daysCount, setDaysCount] = useState("");

  useEffect(() => {
    let start_date = !!form_obj?.start
      ? ConvertISODateFormat(form_obj.start)
      : null;
    let selectedSingleDate = !!form_obj?.start
      ? ConvertDateFormat(ConvertISODateFormat(form_obj?.start))
      : null;

    setLeaveApplyObj({
      ...form_obj,
      start: start_date,
    });
    setselectedSingleDate(selectedSingleDate);
  }, [form_obj]);

  const handleDateSelected = (date, dateString) => {
    setselectedSingleDate(dateString);
    setLeaveApplyObj({
      ...leaveapplyObj,
      start: ConvertISODateFormat(ConvertDateFormat(dateString)),
      end: ConvertISODateFormat(ConvertDateFormat(dateString)),
    });
    if (leaveapplyObj.available_count <= totalMinutes) {
      toast.error("Selected Leave Exceeding Available Leave Hours ");
    }
  };

  useEffect(() => {
    if (!!selectedSingleDate) {
      const dayName = dayjs(
        ConvertISODateFormat(ConvertDateFormat(selectedSingleDate))
      ).format("dddd");
      getHourMinData(dayName);
    }
  }, [selectedSingleDate]);

  useEffect(() => {
    handleHourChange();
  }, [
    selectedStartHour,
    selectedStartMinute,
    selectedEndHour,
    selectedEndMinute,
  ]);

  const workScheduleData = GetLocalStorageData("work_schedule") || [];
  const profileData = GetLocalStorageData("my_profile") || [];
  const holidayData = GetLocalStorageData("holiday") || [];
  const leaveType = GetLocalStorageData("leave_types_for_employee") || [];

  const thisEmpWS = workScheduleData?.find(
    (val) => val.id === profileData.work_schedule_id
  );

  const WeekOffDays = thisEmpWS.workday
    .map((d) => {
      if (d.is_day_on === false) {
        return d.day_id;
      }
      return null;
    })
    .filter((day_id) => day_id !== null);

  const holiday = holidayData.map((d) => {
    return d.date;
  });

  const holidayDate = holiday.map((date) => convertHolidayDateFormat(date));

  const getHourMinData = (dayName) => {
    const scheduleWeek = thisEmpWS.workday.find((d) => d.weekday === dayName);
    if (scheduleWeek) {
      setSelectedStartHour(scheduleWeek.s_hr);
      setSelectedEndHour(scheduleWeek.e_hr);
      setSelectedStartMinute(scheduleWeek.s_min);
      setSelectedEndMinute(scheduleWeek.e_min);
    }
  };
  console.log("====================================");
  console.log("selectedLeave_type", selectedLeave_type);
  console.log("====================================");
  const handleMultiDayChange = (dates, dateStrings) => {
    const generateIntermediaryDates = () => {
      const start = new Date(
        ConvertISODateFormat(ConvertDateFormat(dateStrings[0]))
      );
      setMultipleDayStartDate(dateStrings[0]);
      const end = new Date(
        ConvertISODateFormat(ConvertDateFormat(dateStrings[1]))
      );
      setMultipleDayEndDate(dateStrings[1]);
      const dates = [];

      while (start <= end) {
        dates.push(start.toISOString().split("T")[0]);
        start.setDate(start.getDate() + 1);
      }

      return dates;
    };

    const intermediateDates = generateIntermediaryDates() || [];

    const ValidDays = intermediateDates.filter((d) => {
      if (!WeekOffDays.includes(new Date(d).getDay()) && !holiday.includes(d)) {
        return d;
      }
    });

    const multipleDayName = ValidDays.map((d) => {
      const date = new Date(d);
      const days = { weekday: "long" };
      const daysName = date.toLocaleDateString("en-US", days);
      return daysName;
    });

    let totalWorkDuration = 0;
    multipleDayName.forEach((dayNames) => {
      if (thisEmpWS && thisEmpWS.workday && Array.isArray(thisEmpWS.workday)) {
        const matchingDay = thisEmpWS.workday.find(
          (day) => day.weekday.toLowerCase() === dayNames.toLowerCase()
        );

        if (matchingDay) {
          totalWorkDuration += matchingDay.total_work_duration;
        }
      }
    });

    console.log("====================================");
    console.log("totalWorkDuration", totalWorkDuration);
    console.log("====================================");

    const ValidDaysCount = ValidDays.length;
    setDaysCount(ValidDaysCount);
    if (leaveapplyObj.available_count <= totalWorkDuration) {
      toast.error("Selected Leave Exceeding Available Leave Hours ");
    }
  };

  const disabledDate = (current) => {
    const dayOfWeek = current.day();
    return (
      WeekOffDays.includes(dayOfWeek) ||
      holidayDate.includes(current.format("DD-MM-YYYY"))
    );
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
        setHrDiff(`${hourDiff}:${minuteDiff}`);
      } else {
        const timeDiff = endTime - startTime;
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesDiff = Math.floor(
          (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
        );
        setHrDiff(`${hoursDiff}:${minutesDiff}`);
      }
    }
  };
  useEffect(() => {
    const [hours, minutes] = hrDiff.split(":");
    const hoursInMinutes = parseInt(hours, 10) * 3600;
    const totalMinutes = hoursInMinutes + parseInt(minutes, 10) * 60;
    setTotalMinutes(totalMinutes);
    console.log("====================================");
    console.log(totalMinutes);
    console.log("====================================");
    if (leaveapplyObj.available_count <= totalMinutes) {
      toast.error("Selected Leave Exceeding Available Leave Hours ");
    }
  }, [hrDiff]);

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

  const minutes = Array.from({ length: 60 }, (_, index) => {
    const paddedIndex = index < 10 ? `0${index}` : `${index}`;
    if (index % 30 === 0) {
      return { label: paddedIndex, value: paddedIndex };
    }
    return null;
  }).filter(Boolean);

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
  const secondsToHours = (seconds) => {
    const hours = seconds / 3600;
    return hours.toFixed(2);
  };
  const handleDayTypeChange = (e) => {
    console.log("Day Type = ", e);
    if (e === multiple_day_type_leave) {
      setLeaveApplyObj({
        ...leaveapplyObj,
        day_type: e,
        s_hr: setSelectedStartHour(""),
        s_min: setSelectedStartMinute(""),
        e_hr: setSelectedEndHour(""),
        e_min: setSelectedEndMinute(""),
      });
    } else {
      setLeaveApplyObj({
        ...leaveapplyObj,
        day_type: e,
      });
      setselectedSingleDate(null);
      setHrDiff("");
    }
  };
  // let hoursStr = 0;
  // let minutesStr = 0;
  // const singleDate = ConvertISODateFormat(selectedSingleDate);
  // const selectedMultipleDayStartDateTime = `${singleDate} ${selectedStartHour}:${selectedStartMinute}`;
  // const selectedMultipleDayEndDateTime = `${singleDate} ${selectedEndHour}:${selectedEndMinute}`;
  // const leaveHours = handleHourChange();
  // const startingDate = multipleDayStartDate;
  // const endingDate = multipleDayEndDate;
  // const leaveCount = daysCount;
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [hourDiff, setHourDiff] = useState(null);

  const handleFromDateChange = (date) => {
    setFromDate(date);
    calculateHourDiff(date, toDate);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    calculateHourDiff(fromDate, date);
  };

  const calculateHourDiff = (start, end) => {
    if (start && end) {
      let diffInMilliseconds;
      if (start > end) {
        const midnight = new Date(start);
        midnight.setHours(24, 0, 0, 0);
        diffInMilliseconds = midnight - start + end - midnight;
      } else {
        diffInMilliseconds = end - start;
      }
      const hours = diffInMilliseconds / (1000 * 60 * 60);
      const roundedMinutes = Math.round((hours * 60) / 30) * 30;
      const roundedHours = Math.floor(roundedMinutes / 60);
      const remainingMinutes = roundedMinutes % 60;
      const formattedResult = `${String(roundedHours).padStart(
        2,
        "0"
      )}:${String(remainingMinutes).padStart(2, "0")}`;
      setHourDiff(formattedResult);
    }
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: leaveapplyObj,
    validationSchema: Yup.object({
      leave_type: Yup.number()
        .required("Select Leave Type")
        .min(1, "Please Select Leave Type"),
      reason: Yup.string().required("Please enter reason for leave."),
    }),
    onSubmit: async (values) => {
      console.log("SUCCESSSS !!!! Formik Values = ", values);
      if (leaveapplyObj.available_count <= totalMinutes) {
        toast.error("Selected Leave Exceeding Available Leave Hours ");
      }
      // dispatch(setLoaderVisible(true));
      // let data;
      // if (values.unit === 2) {
      //   data = {
      //     id: 0,
      //     leave_type: values.leavetype,
      //     start: selectedMultipleDayStartDateTime,
      //     end: selectedMultipleDayEndDateTime,
      //     day_type: 1,
      //     requested_leave_count: leaveHours,
      //     reason: values.reason,
      //     status: 1,
      //   };
      // } else {
      //   data = {
      //     id: 0,
      //     leave_type: values.leavetype,
      //     start: startingDate,
      //     end: endingDate,
      //     day_type: 2,
      //     requested_leave_count: leaveCount,
      //     reason: values.reason,
      //     status: 1,
      //   };
      // }

      // const Api = await PostApi("leave/leave-application/create/", data, false);
      // console.log("API RES = ", Api);
      // if (Api.status && Api.status === 200) {
      //   leaveapplyObj.id === 0
      //     ? dispatch(addLeaveApplication(Api?.data.data))
      //     : dispatch(editLeaveApplication(Api?.data?.data));
      //   dispatch(toggleRSBView(false));
      //   toast.success(Api?.data?.message);
      // } else {
      //   toast.error(Api?.data?.message || Api?.data?.detail);
      // }

      // dispatch(setLoaderVisible(false));
    },
  });

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
                    name="leave_type"
                    isMulti={false}
                    options={leaveType || []}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          FormikForm.touched.leave_type &&
                          FormikForm.errors.leave_type
                            ? "red !important"
                            : provided.borderColor,
                      }),
                    }}
                    value={
                      (leaveapplyObj.leave_type &&
                        leaveType.find(
                          (e) => e.id === leaveapplyObj.leave_type
                        )) ||
                      (leaveapplyObj.id &&
                        leaveType.find((e) => e.id === leaveapplyObj.id)) ||
                      []
                    }
                    onChange={(e) => {
                      setLeaveApplyObj((prevLeaveapplyObj) => {
                        const updatedLeaveapplyObj = {
                          ...prevLeaveapplyObj,
                          leave_type: e.id,
                        };

                        // if (
                        //   updatedLeaveapplyObj.available_count <= totalMinutes
                        // ) {
                        //   toast.error(
                        //     "Selected Leave Exceeding Available Leave Hours"
                        //   );
                        // }

                        setSelectedLeave_type(updatedLeaveapplyObj.leave_type);

                        return updatedLeaveapplyObj;
                      });
                    }}
                    placeholder="Select Leave Type"
                    className="basic-multi-select"
                    invalid={
                      FormikForm.touched.leave_type &&
                      FormikForm.errors.leave_type
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.leave_type &&
                  FormikForm.errors.leave_type ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.leave_type}
                    </div>
                  ) : null}
                </div>
                {!FormikForm.errors.leave_type && selectedLeave_type === "" && (
                  <div id="passwordHelpBlock" className="form-text">
                    Please select type of leave.
                  </div>
                )}

                {selectedLeave_type && (
                  <div id="passwordHelpBlock" className="form-text">
                    {leaveType.find(
                      (leave) => leave.id === selectedLeave_type.id
                    )}{" "}
                    {
                      leaveType.find((leave) => leave.id === selectedLeave_type)
                        ?.balance_leave_count
                    }{" "}
                    Remaining.
                  </div>
                )}
              </Col>
              {leaveType.map((type) => {
                if (type.id === selectedLeave_type) {
                  if (type.unit === 1) {
                    return (
                      <Col lg={12}>
                        <div className="input-group">
                          <Label className="form-label">Select Date</Label>
                          <RangePicker
                            name="select_Dates"
                            format={"DD-MM-YYYY"}
                            placeholder={["Start Date", "End Date"]}
                            disabledDate={disabledDate}
                            onChange={handleMultiDayChange}
                          />
                          <span className="input-group-text">
                            {daysCount} Days
                          </span>
                        </div>

                        <div id="passwordHelpBlock" className="form-text">
                          Please select Start & End Date
                        </div>
                      </Col>
                    );
                  } else if (type.unit === 2) {
                    return (
                      <Col lg={12}>
                        <div className="input-group">
                          <Label className="form-label">Select Hour</Label>
                          <Label className="form-label">From</Label>

                          <DatePicker
                            showTime={{ minuteStep: 30 }}
                            format="DD-MM-YYYY HH:mm"
                            disabledDate={disabledDate}
                            onChange={handleFromDateChange}
                          />
                          <Label className="form-label">To</Label>

                          <DatePicker
                            showTime={{ minuteStep: 30 }}
                            format="DD-MM-YYYY HH:mm"
                            disabledDate={disabledDate}
                            onChange={handleToDateChange}
                          />

                          <span className="input-group-text">{hourDiff} h</span>
                        </div>
                        <div id="passwordHelpBlock" className="form-text">
                          Please select Date and Hour
                        </div>
                      </Col>
                    );
                  }
                }
                return null; // No match found
              })}
              {/* <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="day_type" className="form-label">
                    Select Day
                  </Label>
                  <div className="">
                    <div className="form-check form-check-inline">
                      <Input
                        id="single"
                        name="day_type"
                        type="radio"
                        defaultChecked
                        className="form-check-input"
                        checked={
                          leaveapplyObj.day_type &&
                          leaveapplyObj.day_type === single_day_type_leave
                            ? true
                            : false
                        }
                        onChange={() =>
                          handleDayTypeChange(single_day_type_leave)
                        }
                      />
                      <Label className="form-check-label" htmlFor="single">
                        Single Day
                      </Label>
                    </div>
                    <div className="form-check form-check-inline">
                      <Input
                        id="multiple"
                        name="day_type"
                        type="radio"
                        className="form-check-input"
                        checked={
                          leaveapplyObj.day_type &&
                          leaveapplyObj.day_type === multiple_day_type_leave
                            ? true
                            : false
                        }
                        onChange={() =>
                          handleDayTypeChange(multiple_day_type_leave)
                        }
                      />
                      <Label className="form-check-label" htmlFor="multiple">
                        Multiple Days
                      </Label>
                    </div>
                  </div>
                </div>
              </Col>

              {leaveapplyObj?.day_type &&
                leaveapplyObj?.day_type === single_day_type_leave && (
                  <Col lg={12}>
                    <div className="input-group">
                      <DatePicker
                        name="selectDate"
                        className="form-control"
                        placeholder="Select Date"
                        format={DateFormat}
                        value={
                          !!selectedSingleDate
                            ? dayjs(selectedSingleDate, DateFormat)
                            : selectedSingleDate
                        }
                        allowClear={false}
                        disabledDate={disabledDate}
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
                        placeholder="00"
                      ></Select>

                      <Select
                        name="s_min"
                        value={
                          minutes.find(
                            (d) => d.value === selectedStartMinute
                          ) || []
                        }
                        onChange={handleStartMinuteChange}
                        options={minutes || []}
                        placeholder="00"
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
                        placeholder="00"
                      ></Select>

                      <Select
                        name="e_min"
                        value={
                          minutes.find((d) => d.value === selectedEndMinute) ||
                          []
                        }
                        onChange={handleEndMinuteChange}
                        options={minutes || []}
                        autosize={true}
                        placeholder="00"
                      ></Select>

                      <span className="input-group-text">{hrDiff}h</span>
                    </div>

                    <div id="passwordHelpBlock" className="form-text">
                      Please select Date and Time
                    </div>
                  </Col>
                )}

              {leaveapplyObj?.day_type &&
                leaveapplyObj?.day_type === multiple_day_type_leave && (
                  <Col lg={12}>
                    <div className="input-group">
                      <RangePicker
                        name="select_Dates"
                        format={"DD-MM-YYYY"}
                        allowClear={false}
                        placeholder={["Start Date", "End Date"]}
                        disabledDate={disabledDate}
                        onChange={handleMultiDayChange}
                      />

                      <span className="input-group-text">{daysCount} Days</span>
                    </div>
                    <div id="passwordHelpBlock" className="form-text">
                      Please select Start & End Date
                    </div>
                  </Col>
                )} */}
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
