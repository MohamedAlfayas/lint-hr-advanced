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
  convertFromToDateFormat,
  convertDate,
  timeConvert,
  DateFormated,
  // ConvertDateFormat,
} from "../../common/js/ConvertDateFormat";
import Flatpickr from "react-flatpickr";
import {
  single_day_type_leave,
  multiple_day_type_leave,
  leave_type_day_unit,
  leave_type_hour_unit,
  day_type,
} from "../../common/constant/Constants";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import { toast } from "react-toastify";
import { DatePicker, Space, TimePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DateFormat, DateTimeFormat } from "../../common/constant/Constants";
import {
  ConvertToDateTimeFormat,
  ConvertToISODateTimeFormat,
} from "../../common/js/ConvertDateTimeFormat";
import { setLeaveTypeForCurrentEmployee } from "../../redux/reducers/ChildReducer/LeaveTypeReducer";
dayjs.extend(customParseFormat);

const ApplyLeaveForm = () => {
  const dispatch = useDispatch();
  const [leaveapplyObj, setLeaveApplyObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const { RangePicker } = DatePicker;

  const [daysCount, setDaysCount] = useState("");
  const [selectedLeaveTypeObj, setSelectedLeaveTypeObj] = useState({});

  const [WeekOffDays, setWeekOffDays] = useState([]);

  const [HolidayDays, setHolidayDays] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [hourDiff, setHourDiff] = useState(null);
  const [inBetweenDays, setInBetweenDays] = useState([]);
  const [leaveBalanceCount, setLeaveBalanceCount] = useState(0);
  const [timeError, setTimeError] = useState("");
  const [fullDayStart, setFullDayStart] = useState(null);
  const [fullDayEnd, setFullDayEnd] = useState(null);
  const [halfDayStartTime, setHalfDayStartTime] = useState(null);
  const [halfDayEndTime, setHalfDayEndTime] = useState(null);

  const workScheduleData = GetLocalStorageData("work_schedule") || [];
 
  const profileData = GetLocalStorageData("my_profile") || [];
  const holidayData = GetLocalStorageData("holiday") || [];

  const { leave_type_for_current_employee } = useSelector(
    (state) => state.LeaveTypeReducer
  );

  useEffect(() => {
    if (!!form_obj) {
      const thisEmpWS = workScheduleData?.find(
        (val) => val.id === profileData.work_schedule_id
      );
      !!thisEmpWS &&
        setWeekOffDays(
          thisEmpWS.workday
            .map((d) => {
              if (d.is_day_on === false) {
                return d.day_id;
              }
              return null;
            })
            .filter((day_id) => day_id !== null)
        );

      setHolidayDays(holidayData.map((d) => d?.date));

      if (form_obj?.leave_type_id !== 0) {
        let leave_type_obj = leave_type_for_current_employee.find(
          (d) => d.id === form_obj.leave_type_id
        );
        setLeaveBalanceCount(leave_type_obj.balance_leave_count);
        let thisLeaveTypeObj = leave_type_for_current_employee.find(
          (d) => d.id === form_obj?.leave_type_id
        );
        handleStartEndDatesChange(thisLeaveTypeObj);
      }

      setLeaveApplyObj({
        ...form_obj,
        start: form_obj?.start,
        end: form_obj?.end,
      });

      // ================= FIX START =================
      // When editing, if the leave is a half-day leave, populate the start and end time states.
      if (
        form_obj?.day_type === 2 && // 2 represents 'Half Day'
        form_obj.unit === leave_type_day_unit // Ensure it's a day-based leave
      ) {
        if (form_obj.start) {
          setHalfDayStartTime(form_obj.start); // The state will hold the ISO string from the API
        }
        if (form_obj.end) {
          setHalfDayEndTime(form_obj.end);
        }
      }
      // ================= FIX END =================

      setHourDiff(timeConvert(form_obj.requested_leave_count));
      setDaysCount(form_obj.requested_leave_count);
      setInBetweenDays(form_obj.in_between_dates);

      if (form_obj?.unit === 2 && form_obj?.start !== null) {
        setFromDate(
          ConvertToDateTimeFormat(ConvertToISODateTimeFormat(form_obj.start))
        );
      }
      if (form_obj?.unit === 2 && form_obj?.end !== null) {
        setToDate(
          ConvertToDateTimeFormat(ConvertToISODateTimeFormat(form_obj.end))
        );
      }
    }
  }, [form_obj]);

  const handleLeaveTypeChange = (e) => {
    let leave_type_obj = leave_type_for_current_employee.find(
      (d) => d.id === e.id
    );
    setLeaveBalanceCount(leave_type_obj.balance_leave_count);
    handleStartEndDatesChange(leave_type_obj);
  };

  const thisEmpWS = workScheduleData?.find(
    (val) => val.id === profileData.work_schedule_id
  );

  const handleStartEndDatesChange = (leave_type_obj) => {
    const localThisEmpWS = workScheduleData?.find(
        (val) => val.id === profileData.work_schedule_id
      );

    leave_type_obj?.weekend_between_leave === true
      ? setWeekOffDays([])
      : !!localThisEmpWS &&
        setWeekOffDays(
          localThisEmpWS.workday
            .map((d) => {
              if (d.is_day_on === false) {
                return d.day_id;
              }
              return null;
            })
            .filter((day_id) => day_id !== null)
        );

    leave_type_obj?.holiday_between_leave === true
      ? setHolidayDays([])
      : setHolidayDays(holidayData.map((d) => d?.date));

    setSelectedLeaveTypeObj(leave_type_obj);
    setLeaveApplyObj((prev) => {
      return {
        ...prev,
        leave_type_id: leave_type_obj?.id,
        start: null,
        end: null,
        in_between_dates: [],
      };
    });
    setHourDiff("");
    setDaysCount("");
    setInBetweenDays([]);
  };

  const handleMultiDayChange = (dates, dateStrings, daysCount) => {
    let startDate =
      dateStrings[0] === "" ||
      dateStrings[0] === null ||
      dateStrings[0] === undefined
        ? null
        : dateStrings[0];
    let endDate =
      dateStrings[1] === "" ||
      dateStrings[1] === null ||
      dateStrings[1] === undefined
        ? null
        : dateStrings[1];

    const generateIntermediaryDates = () => {
      const start = !!startDate
        ? new Date(ConvertISODateFormat(ConvertDateFormat(startDate)))
        : null;
      const end = !!endDate
        ? new Date(ConvertISODateFormat(ConvertDateFormat(endDate)))
        : null;
      const dates = [];
      if (!!startDate && !!endDate) {
        while (start <= end) {
          dates.push(start.toISOString().split("T")[0]);
          start.setDate(start.getDate() + 1);
        }
      }
      return dates;
    };

    const intermediateDates = generateIntermediaryDates() || [];
    const ValidDays = intermediateDates.filter((d) => {
      if (
        !WeekOffDays.includes(new Date(d).getDay()) &&
        !HolidayDays.includes(d)
      ) {
        return d;
      }
    });

    setInBetweenDays(ValidDays);
    const ValidDaysCount = ValidDays.length;

    setDaysCount(ValidDaysCount);
    setLeaveApplyObj({
      ...leaveapplyObj,
      start: !!startDate
        ? ConvertISODateFormat(ConvertDateFormat(startDate))
        : null,
      end: !!endDate ? ConvertISODateFormat(ConvertDateFormat(endDate)) : null,
      requested_leave_count: ValidDaysCount,
      day_type: 1,
      in_between_dates: daysCount < 1 ? [] : ValidDays,
    });
  };

  const initialTime = dayjs("00:00", "HH:mm");

  const disabledDate = (current) => {
    const dayOfWeek = current.day();
    return (
      WeekOffDays.includes(dayOfWeek) ||
      HolidayDays.map((d) => ConvertDateFormat(d)).includes(
        current.format("DD-MM-YYYY")
      )
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveApplyObj({
      ...leaveapplyObj,
      [name]: value,
    });
  };

  const handleDayType = (e) => {
    const value = e?.value || null;
    let updatedDaysCount;
    if (value === 1) {
      updatedDaysCount = 1;
    } else if (value === 2) {
      updatedDaysCount = 0.5;
    } else {
      updatedDaysCount = 0;
    }
    // Resetting times when day type changes
    setHalfDayStartTime(null);
    setHalfDayEndTime(null);

    setLeaveApplyObj({
      ...leaveapplyObj,
      day_type: value,
      requested_leave_count: value === 1 ? 1 : value === 2 ? 0.5 : 0,
      in_between_dates:
        value === 1 ? [leaveapplyObj.start] : value === 2 ? [] : [],
    });
    setDaysCount(updatedDaysCount);
  };

  useEffect(() => {
    if (toDate && fromDate) {
      const [fromDateDay, fromDateMonth, fromDateYear, fromDateTime] =
        fromDate.split(/[\s-:]/);
      const [toDateDay, toDateMonth, toDateYear, toDateTime] =
        toDate.split(/[\s-:]/);

      const fromDateObj = new Date(
        fromDateYear,
        fromDateMonth - 1,
        fromDateDay,
        fromDateTime
      );
      const toDateObj = new Date(
        toDateYear,
        toDateMonth - 1,
        toDateDay,
        toDateTime
      );
      if (toDateObj < fromDateObj) {
        toast.error("Selected end date cannot be less than the start date");
      } else {
        calculateHourDiff(fromDate, toDate);
      }
    }
  }, [toDate, fromDate]);

  const handleFromDateChange = (date, dateStr) => {
    setFromDate(dateStr);
    setLeaveApplyObj({
      ...leaveapplyObj,
      start:
        dateStr === "" || dateStr === null || dateStr === undefined
          ? null
          : ConvertToISODateTimeFormat(ConvertToDateTimeFormat(dateStr)),
    });
  };

  const handleToDateChange = (date, dateStr) => {
    setToDate(dateStr);
    setLeaveApplyObj({
      ...leaveapplyObj,
      end:
        dateStr === "" || dateStr === null || dateStr === undefined
          ? null
          : ConvertToISODateTimeFormat(ConvertToDateTimeFormat(dateStr)),
    });
  };

  const calculateHourDiff = (start, end) => {
    if (start && end) {
      const parseDateString = (dateString) => {
        const [day, month, year, hours, minutes] = dateString.split(/\D+/);
        return new Date(year, month - 1, day, hours, minutes);
      };

      const startDate = parseDateString(start);
      const endDate = parseDateString(end);

      let diffInMilliseconds;

      if (startDate > endDate) {
        const midnight = new Date(startDate);
        midnight.setHours(24, 0, 0, 0);
        diffInMilliseconds = midnight - startDate + +(endDate - new Date(0));
      } else {
        diffInMilliseconds = endDate - startDate;
      }

      const hours = diffInMilliseconds / (1000 * 60 * 60);
      const roundedMinutes = Math.round((hours * 60) / 30) * 30;
      const roundedHours = Math.floor(roundedMinutes / 60);
      const remainingMinutes = roundedMinutes % 60;

      const formattedResult = `${String(roundedHours).padStart(
        2,
        "0"
      )}:${String(remainingMinutes).padStart(2, "0")}`;

      const formattedResultForSetting = roundedHours + remainingMinutes / 60;

      setHourDiff(formattedResult);
      setLeaveApplyObj({
        ...leaveapplyObj,
        requested_leave_count: formattedResultForSetting,
        day_type: 1,
      });
    }
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: leaveapplyObj,
    validationSchema: Yup.object({
      leave_type_id: Yup.number()
        .required("Select Leave Type")
        .min(1, "Please Select Leave Type"),
      reason: Yup.string().required("Reason is required"),
    }),
    onSubmit: async (values) => {
      // Merge half-day start/end times before submission
      if (values.day_type === 2) {
    if (!halfDayStartTime) {
      toast.error("Please select Start Time");
      return;
    }
    if (!halfDayEndTime) {
      toast.error("Please select End Time");
      return;
    }
  }
      const finalLeaveObj = {
        ...values,
        start: values.day_type === 2 ? halfDayStartTime : values.start,
        end: values.day_type === 2 ? halfDayEndTime : values.end,
      };

      dispatch(setLoaderVisible(true));

      if (
        !finalLeaveObj.requested_leave_count ||
        finalLeaveObj.requested_leave_count === 0
      ) {
        toast.error("Selected Hour Can't Be Zero");
        dispatch(setLoaderVisible(false));
        return;
      }

      if (finalLeaveObj.requested_leave_count > leaveBalanceCount) {
        toast.error("Selected Leave Exceeds Balance Leave");
        dispatch(setLoaderVisible(false));
        return;
      }
      
      try {
        const Api = await PostApi(
          "leave/leave-application/create/",
          finalLeaveObj,
          false
        );

        if (Api.status === 200) {
          if (leaveapplyObj.id === 0) {
            dispatch(addLeaveApplication(Api?.data.data));
          } else {
            dispatch(editLeaveApplication(Api?.data?.data));
          }

          // Update leave type for employee
          dispatch(
            setLeaveTypeForCurrentEmployee(Api?.data?.leave_type_for_employee || [])
          );

          dispatch(toggleRSBView(false));
          toast.success(Api?.data?.message);
        } else {
          toast.error(Api?.data?.message || Api?.data?.detail);
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong!");
      } finally {
        dispatch(setLoaderVisible(false));
      }
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
                    name="leave_type_id"
                    isMulti={false}
                    options={leave_type_for_current_employee || []}
                    isOptionDisabled={(option) =>
                      option.balance_leave_count === 0
                    }
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          FormikForm.touched.leave_type_id &&
                          FormikForm.errors.leave_type_id
                            ? "red !important"
                            : provided.borderColor,
                      }),
                    }}
                    value={
                      leaveapplyObj?.leave_type_id
                        ? leave_type_for_current_employee.find(
                            (d) => d.id === leaveapplyObj?.leave_type_id
                          )
                        : []
                    }
                    onChange={handleLeaveTypeChange}
                    placeholder="Select Leave Type"
                    className="basic-multi-select"
                    invalid={
                      FormikForm.touched.leave_type_id &&
                      FormikForm.errors.leave_type_id
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.leave_type_id &&
                  FormikForm.errors.leave_type_id ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.leave_type_id}
                    </div>
                  ) : null}
                </div>
                {!FormikForm.errors.leave_type_id &&
                  FormikForm.errors.leave_type_id === "" && (
                    <div id="passwordHelpBlock" className="form-text">
                      Please select type of leave.
                    </div>
                  )}

                {!!selectedLeaveTypeObj?.balance_leave_count && (
                  <>
                    {selectedLeaveTypeObj?.balance_leave_count}{" "}
                    {selectedLeaveTypeObj?.unit === leave_type_day_unit
                      ? "Days"
                      : "Hours"}{" "}
                    Remaining
                  </>
                )}
              </Col>

              {!!selectedLeaveTypeObj?.unit &&
                selectedLeaveTypeObj?.unit === leave_type_day_unit && (
                  <Col lg={12}>
                    <div className="input-group">
                      <div className="input-group">
                        <Label className="form-label">Select Date</Label>
                      </div>
                      <RangePicker
                        name="multiple_date"
                        format={DateFormat}
                        placeholder={["Start Date", "End Date"]}
                        disabledDate={disabledDate}
                        onChange={handleMultiDayChange}
                        value={
                          !!leaveapplyObj?.start && !!leaveapplyObj?.end
                            ? [
                                dayjs(
                                  ConvertDateFormat(
                                    ConvertISODateFormat(leaveapplyObj?.start)
                                  ),
                                  DateFormat
                                ),
                                dayjs(
                                  ConvertDateFormat(
                                    ConvertISODateFormat(leaveapplyObj?.end)
                                  ),
                                  DateFormat
                                ),
                              ]
                            : null
                        }
                      />
                      <span className="input-group-text">{daysCount} Days</span>
                    </div>
                    <div id="passwordHelpBlock" className="form-text">
                      Please select Start & End Date
                    </div>

                    {(daysCount === 1 || daysCount === 0.5) && (
                      <div className="input-group mt-3">
                        <Col lg={12}>
                          <Label className="form-label">Select Day Type</Label>
                        </Col>
                        <Col lg={6}>
                          <Select
                            name="day_type"
                            isMulti={false}
                            options={day_type || []}
                            placeholder="Select Day Type"
                            className="basic-multi-select"
                            value={
                              leaveapplyObj?.day_type
                                ? day_type.find(
                                    (d) => d.value === leaveapplyObj?.day_type
                                  )
                                : []
                            }
                            onChange={handleDayType}
                          />
                        </Col>
                      </div>
                    )}
                  </Col>
                )}
              {leaveapplyObj?.day_type === 2 && (
                <div className="row mt-3 align-items-end">
                  {/* Start Time */}
                  <Col md={4}>
                    <Label className="form-label">Start Time</Label>
                    <TimePicker
                      value={halfDayStartTime ? dayjs(halfDayStartTime) : null}
                      format="HH:mm"
                      minuteStep={30}
                      onChange={(time) => {
                        if (!time) return;
                        const datePart = dayjs(leaveapplyObj.start).format("YYYY-MM-DD");
                        const newDateTime = dayjs(`${datePart} ${time.format("HH:mm:ss")}`);
                        setHalfDayStartTime(newDateTime.format("YYYY-MM-DD HH:mm:ss"));
                      }}
                      style={{ width: "100%" }}
                    />
                  </Col>

                  {/* End Time */}
                  <Col md={4}>
                    <Label className="form-label">End Time</Label>
                    <TimePicker
                      value={halfDayEndTime ? dayjs(halfDayEndTime) : null}
                      format="HH:mm"
                      minuteStep={30}
                      disabled={!halfDayStartTime}
                      onChange={(time) => {
                        if (!time) return;

                        const start = dayjs(halfDayStartTime);
                        const datePart = dayjs(leaveapplyObj.start).format("YYYY-MM-DD");
                        const end = dayjs(`${datePart} ${time.format("HH:mm:ss")}`);


                        if (end.isBefore(start)) {
                          setTimeError("End time cannot be before start time!");
                          return;
                        }
                        setTimeError("");
                        setHalfDayEndTime(end.format("YYYY-MM-DD HH:mm:ss"));
                      }}
                      style={{ width: "100%" }}
                    />
                  </Col>

                  {/* Total Hours */}
                  <Col md={3}>
                    <Label className="form-label">Total Hours</Label>
                    <span className="form-control text-center">
                      {halfDayStartTime && halfDayEndTime
                        ? dayjs(halfDayEndTime)
                            .diff(dayjs(halfDayStartTime), "hours", true)
                            .toFixed(2)
                        : "0.00"}{" "}
                      h
                    </span>
                  </Col>

                  {/* Error */}
                  {timeError && (
                    <Col md={12}>
                      <div className="text-danger mt-2">{timeError}</div>
                    </Col>
                  )}
                </div>
              )}

              {!!selectedLeaveTypeObj?.unit &&
                selectedLeaveTypeObj?.unit === leave_type_hour_unit && (
                  <Col lg={12}>
                    <div className="row">
                      <Col md={4} lg={4} xxl={4}>
                        <DatePicker
                          name="start"
                          placeholder="Select Start Time"
                          showTime={{
                            minuteStep: 30,
                            defaultValue: initialTime,
                            format: "HH:mm",
                          }}
                          format={DateTimeFormat}
                          // disabledDate={disabledDate}
                          onChange={handleFromDateChange}
                          value={
                            !!leaveapplyObj?.start
                              ? dayjs(
                                  ConvertToDateTimeFormat(
                                    ConvertToISODateTimeFormat(
                                      leaveapplyObj?.start
                                    )
                                  ),
                                  DateTimeFormat
                                )
                              : null
                          }
                          showNow={false}
                        />
                      </Col>

                      <Col md={4} lg={4} xxl={4}>
                        <DatePicker
                          name="end"
                          placeholder="Select End Time"
                          showTime={{
                            minuteStep: 30,
                            defaultValue: initialTime,
                            format: "HH:mm",
                          }}
                          format={DateTimeFormat}
                          // disabledDate={disabledDate}
                          onChange={handleToDateChange}
                          value={
                            !!leaveapplyObj?.end
                              ? dayjs(
                                  ConvertToDateTimeFormat(
                                    ConvertToISODateTimeFormat(
                                      leaveapplyObj?.end
                                    )
                                  ),
                                  DateTimeFormat
                                )
                              : null
                          }
                          showNow={false}
                        />
                      </Col>
                      <Col md={2} lg={2} xxl={2}>
                        <span
                          className="input-group-text"
                          style={{ fontSize: "12px" }}
                        >
                          {hourDiff} h
                        </span>
                      </Col>
                      <div id="passwordHelpBlock" className="form-text">
                        Please select Date and Hour
                      </div>
                    </div>
                  </Col>
                )}

              <Col lg={12}>
                <label htmlFor="reason" className="form-label">
                  Reason *
                </label>
                <textarea
                  name="reason"
                  className="form-control"
                  id="reason"
                  placeholder="Enter Reason"
                  value={leaveapplyObj?.reason || ""}
                  onChange={handleInputChange}
                />
                 {FormikForm.touched.reason && FormikForm.errors.reason ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.reason}
                    </div>
                  ) : null}
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