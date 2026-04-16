import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Col,
  Form,
  Label,
  Row,
} from "reactstrap";
import Select from "react-select";
import { DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { Api } from "../../common/api/Api";
import { PostApi } from "../../common/api/PostApi";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import {
  addLeaveApplication,
  editLeaveApplication,
  setLeaveApplication,
} from "../../redux/reducers/ChildReducer/LeaveApplyReducer";
import { setLeaveTypeForCurrentEmployee } from "../../redux/reducers/ChildReducer/LeaveTypeReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
  timeConvert,
} from "../../common/js/ConvertDateFormat";
import {
  ConvertToDateTimeFormat,
  ConvertToISODateTimeFormat,
} from "../../common/js/ConvertDateTimeFormat";
import {
  day_type,
  leave_type_day_unit,
  leave_type_hour_unit,
  DateFormat,
  DateTimeFormat,
} from "../../common/constant/Constants";

dayjs.extend(customParseFormat);

const MySwal = withReactContent(Swal);

// ─────────────────────────────────────────────────────────────────────────────
// LeaveChangeModal
// Props:
//   isOpen      bool
//   onClose     () => void
//   leaveRecord the row object from the table
// ─────────────────────────────────────────────────────────────────────────────
const LeaveChangeModal = ({ isOpen, onClose, leaveRecord }) => {
  const dispatch = useDispatch();

  const { leave_type_for_current_employee } = useSelector(
    (state) => state.LeaveTypeReducer
  );

  const workScheduleData = GetLocalStorageData("work_schedule") || [];
  const profileData      = GetLocalStorageData("my_profile")    || [];
  const holidayData      = GetLocalStorageData("holiday")        || [];

  // ── local state ────────────────────────────────────────────────────────────
  const [leaveapplyObj,        setLeaveApplyObj]        = useState({});
  const [selectedLeaveTypeObj, setSelectedLeaveTypeObj] = useState({});
  const [WeekOffDays,          setWeekOffDays]          = useState([]);
  const [HolidayDays,          setHolidayDays]          = useState([]);
  const [daysCount,            setDaysCount]            = useState("");
  const [hourDiff,             setHourDiff]             = useState(null);
  const [inBetweenDays,        setInBetweenDays]        = useState([]);
  const [leaveBalanceCount,    setLeaveBalanceCount]    = useState(0);
  const [fromDate,             setFromDate]             = useState(null);
  const [toDate,               setToDate]               = useState(null);
  const [halfDayStartTime,     setHalfDayStartTime]     = useState(null);
  const [halfDayEndTime,       setHalfDayEndTime]       = useState(null);
  const [timeError,            setTimeError]            = useState("");
  const [cancelLoading,        setCancelLoading]        = useState(false);

  const { RangePicker } = DatePicker;
  const initialTime = dayjs("00:00", "HH:mm");

  // ── Build select options — mirrors ApplyLeaveForm exactly ─────────────────
  // value = leave_type.id, full_obj = the full leave_type_for_employee record
  const leaveTypeOptions = leave_type_for_current_employee.map((item) => ({
    value:               item.leave_type.id,
    label:               item.leave_type.name,
    balance_leave_count: item.available_count,
    unit:                item.leave_type.unit,
    full_obj:            item,
  }));

  // ── populate form when record / open changes ───────────────────────────────
  useEffect(() => {
    if (!leaveRecord || !isOpen) return;

    // ── Work schedule week-off days ────────────────────────────────────────
    const thisEmpWS = workScheduleData?.find(
      (val) => val.id === profileData.work_schedule_id
    );
    if (thisEmpWS) {
      setWeekOffDays(
        thisEmpWS.workday
          .map((d) => (d.is_day_on === false ? d.day_id : null))
          .filter((id) => id !== null)
      );
    }
    setHolidayDays(holidayData.map((d) => d?.date));

    // ── Leave type object + balance ────────────────────────────────────────
    // Match by leave_type.id (same as ApplyLeaveForm's form_obj.leave_type_id)
    if (leaveRecord.leave_type_id !== 0) {
      const leaveTypeRecord = leave_type_for_current_employee.find(
        (d) => d.leave_type?.id === leaveRecord.leave_type_id
      );
      if (leaveTypeRecord) {
        setLeaveBalanceCount(leaveTypeRecord.available_count);
        // Pass full record so weekend/holiday flags are read correctly
        handleStartEndDatesChange(leaveTypeRecord, true);
        setSelectedLeaveTypeObj(leaveTypeRecord);
      }
    }

    // ── Core leave object ─────────────────────────────────────────────────
    setLeaveApplyObj({
      ...leaveRecord,
      start: leaveRecord?.start,
      end:   leaveRecord?.end,
    });

    setDaysCount(leaveRecord.requested_leave_count);
    setInBetweenDays(leaveRecord.in_between_dates || []);
    setHourDiff(timeConvert(leaveRecord.requested_leave_count));
    setTimeError("");

    // ── Half-day pre-fill ─────────────────────────────────────────────────
    // Only populate half-day times for day-unit leaves with day_type=2 (Half Day).
    // For hour-unit leaves clear these states so the half-day section never renders.
    const leaveTypeRecordForUnit = leave_type_for_current_employee.find(
      (d) => d.leave_type?.id === leaveRecord.leave_type_id
    );
    if (
      leaveRecord.day_type === 2 &&
      leaveTypeRecordForUnit?.leave_type?.unit === leave_type_day_unit
    ) {
      setHalfDayStartTime(leaveRecord.start ?? null);
      setHalfDayEndTime(leaveRecord.end   ?? null);
    } else {
      setHalfDayStartTime(null);
      setHalfDayEndTime(null);
    }

    // ── Hour-unit pre-fill ────────────────────────────────────────────────
    if (leaveRecord?.unit === 2) {
      if (leaveRecord.start)
        setFromDate(
          ConvertToDateTimeFormat(ConvertToISODateTimeFormat(leaveRecord.start))
        );
      if (leaveRecord.end)
        setToDate(
          ConvertToDateTimeFormat(ConvertToISODateTimeFormat(leaveRecord.end))
        );
    } else {
      setFromDate(null);
      setToDate(null);
    }
  }, [leaveRecord, isOpen]);

  // ── Hour diff recalculation ────────────────────────────────────────────────
  useEffect(() => {
    if (!toDate || !fromDate) return;

    const parseDs = (ds) => {
      const [d, m, y, h, min] = ds.split(/\D+/);
      return new Date(y, m - 1, d, h, min);
    };
    const s = parseDs(fromDate);
    const e = parseDs(toDate);

    if (e < s) {
      toast.error("Selected end date cannot be less than the start date");
      return;
    }
    calculateHourDiff(fromDate, toDate);
  }, [toDate, fromDate]);

  // ── helpers ────────────────────────────────────────────────────────────────

  /**
   * Mirrors ApplyLeaveForm's handleStartEndDatesChange.
   * leave_type_record = full leave_type_for_employee record (has .leave_type sub-object).
   * skipReset = true when called from useEffect (editing) so we don't clear start/end.
   */
  const handleStartEndDatesChange = (leave_type_record, skipReset = false) => {
    const localEmpWS = workScheduleData?.find(
      (val) => val.id === profileData.work_schedule_id
    );

    // Support both shapes: record.leave_type.* OR record.*
    const leaveTypeData = leave_type_record?.leave_type || leave_type_record;

    leaveTypeData?.weekend_between_leave === true
      ? setWeekOffDays([])
      : !!localEmpWS &&
        setWeekOffDays(
          localEmpWS.workday
            .map((d) => (d.is_day_on === false ? d.day_id : null))
            .filter((id) => id !== null)
        );

    leaveTypeData?.holiday_between_leave === true
      ? setHolidayDays([])
      : setHolidayDays(holidayData.map((d) => d?.date));

    // Store full record so unit/flags are accessible in the UI
    setSelectedLeaveTypeObj(leave_type_record);

    if (!skipReset) {
      // New selection — clear dates, counts, times
      setLeaveApplyObj((prev) => ({
        ...prev,
        leave_type_id:         leaveTypeData?.id,
        unit:                  leaveTypeData?.unit,
        start:                 null,
        end:                   null,
        in_between_dates:      [],
        day_type:              null,
        requested_leave_count: 0,
      }));
      setHourDiff("");
      setDaysCount("");
      setInBetweenDays([]);
      setHalfDayStartTime(null);
      setHalfDayEndTime(null);
      setFromDate(null);
      setToDate(null);
    }
  };

  const disabledDate = (current) =>
    WeekOffDays.includes(current.day()) ||
    HolidayDays.map((d) => ConvertDateFormat(d)).includes(
      current.format("DD-MM-YYYY")
    );

  // Called when user picks a leave type from the Select dropdown
  // selectedOption shape: { value, label, balance_leave_count, unit, full_obj }
  const handleLeaveTypeChange = (selectedOption) => {
    if (!selectedOption) return;

    // selectedOption.full_obj is the full leave_type_for_employee record
    const fullRecord = selectedOption.full_obj;

    setLeaveBalanceCount(selectedOption.balance_leave_count);

    // Pass full record — skipReset=false so dates are cleared
    handleStartEndDatesChange(fullRecord, false);
  };

  const handleMultiDayChange = (dates, dateStrings, daysCountArg) => {
    const startDate =
      dateStrings[0] === "" || dateStrings[0] == null ? null : dateStrings[0];
    const endDate =
      dateStrings[1] === "" || dateStrings[1] == null ? null : dateStrings[1];

    const generateIntermediaryDates = () => {
      const s = startDate
        ? new Date(ConvertISODateFormat(ConvertDateFormat(startDate)))
        : null;
      const e = endDate
        ? new Date(ConvertISODateFormat(ConvertDateFormat(endDate)))
        : null;
      const result = [];
      if (s && e) {
        while (s <= e) {
          result.push(s.toISOString().split("T")[0]);
          s.setDate(s.getDate() + 1);
        }
      }
      return result;
    };

    const intermediateDates = generateIntermediaryDates();
    const validDays = intermediateDates.filter(
      (d) =>
        !WeekOffDays.includes(new Date(d).getDay()) &&
        !HolidayDays.includes(d)
    );

    setInBetweenDays(validDays);
    const validDaysCount = validDays.length;
    setDaysCount(validDaysCount);

    setLeaveApplyObj((prev) => ({
      ...prev,
      start: startDate
        ? ConvertISODateFormat(ConvertDateFormat(startDate))
        : null,
      end: endDate
        ? ConvertISODateFormat(ConvertDateFormat(endDate))
        : null,
      requested_leave_count: validDaysCount,
      day_type:              1,
      in_between_dates:      validDaysCount < 1 ? [] : validDays,
    }));
  };

  const handleDayType = (e) => {
    const value = e?.value || null;
    const count = value === 1 ? 1 : value === 2 ? 0.5 : 0;
    // Reset times when day type changes
    setHalfDayStartTime(null);
    setHalfDayEndTime(null);
    setLeaveApplyObj((prev) => ({
      ...prev,
      day_type:              value,
      requested_leave_count: count,
      in_between_dates:      value === 1 ? [prev.start] : [],
    }));
    setDaysCount(count);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveApplyObj((prev) => ({ ...prev, [name]: value }));
  };

  const handleFromDateChange = (_, dateStr) => {
    setFromDate(dateStr);
    setLeaveApplyObj((prev) => ({
      ...prev,
      start: dateStr
        ? ConvertToISODateTimeFormat(ConvertToDateTimeFormat(dateStr))
        : null,
    }));
  };

  const handleToDateChange = (_, dateStr) => {
    setToDate(dateStr);
    setLeaveApplyObj((prev) => ({
      ...prev,
      end: dateStr
        ? ConvertToISODateTimeFormat(ConvertToDateTimeFormat(dateStr))
        : null,
    }));
  };

  const calculateHourDiff = (start, end) => {
    const parseDs = (ds) => {
      const [d, m, y, h, min] = ds.split(/\D+/);
      return new Date(y, m - 1, d, h, min);
    };
    const s = parseDs(start);
    const e = parseDs(end);

    let diffMs;
    if (s > e) {
      const midnight = new Date(s);
      midnight.setHours(24, 0, 0, 0);
      diffMs = midnight - s + (e - new Date(0));
    } else {
      diffMs = e - s;
    }

    const hrs           = diffMs / (1000 * 60 * 60);
    const roundedMins   = Math.round((hrs * 60) / 30) * 30;
    const roundedHours  = Math.floor(roundedMins / 60);
    const remainingMins = roundedMins % 60;

    setHourDiff(
      `${String(roundedHours).padStart(2, "0")}:${String(remainingMins).padStart(2, "0")}`
    );
    setLeaveApplyObj((prev) => ({
      ...prev,
      requested_leave_count: roundedHours + remainingMins / 60,
      day_type:              1,
    }));
  };

  // ── Derive unit from selectedLeaveTypeObj (supports both shapes) ──────────
  // Mirrors ApplyLeaveForm's `currentUnit` derivation
  const currentUnit =
    selectedLeaveTypeObj?.leave_type?.unit || selectedLeaveTypeObj?.unit;

  // ── SweetAlert2 cancel confirmation ───────────────────────────────────────
  const handleCancelLeaveConfirm = () => {
    MySwal.fire({
      title: "Cancel Leave?",
      html: `
        <p style="margin:0">
          Are you sure you want to <strong>cancel</strong> this leave application?<br/>
          <span style="color:#d33;font-size:13px;">This action cannot be undone.</span>
        </p>
      `,
      icon: "warning",
      showCancelButton:    true,
      confirmButtonColor:  "#d33",
      cancelButtonColor:   "#6c757d",
      confirmButtonText:   "Yes, Cancel Leave",
      cancelButtonText:    "No, Keep It",
      reverseButtons:      true,
      focusCancel:         true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      setCancelLoading(true);
      dispatch(setLoaderVisible(true));

      try {
        const res = await PostApi(
          "leave/cancel-leave/",
          { id: leaveRecord?.id },
          false
        );

        if (res.status === 200) {
          const listRes = await Api({
            method: "GET",
            url:    "leave/get-my-leave-application/",
          });
          dispatch(setLeaveApplication(listRes?.data?.data || []));

          MySwal.fire({
            title:             "Cancelled!",
            text:              res?.data?.message || "Leave has been cancelled successfully.",
            icon:              "success",
            timer:             2000,
            showConfirmButton: false,
          });

          onClose();
        } else {
          toast.error(res?.data?.message || "Failed to cancel leave");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while cancelling!");
      } finally {
        setCancelLoading(false);
        dispatch(setLoaderVisible(false));
      }
    });
  };

  // ── Formik ────────────────────────────────────────────────────────────────
  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues:      leaveapplyObj,
    validationSchema:   Yup.object({
      leave_type_id: Yup.number()
        .required("Select Leave Type")
        .min(1, "Please Select Leave Type"),
      reason: Yup.string().required("Reason is required"),
    }),
    onSubmit: async (values) => {
      // Half-day validation
      if (values.day_type === 2) {
        if (!halfDayStartTime) { toast.error("Please select Start Time"); return; }
        if (!halfDayEndTime)   { toast.error("Please select End Time");   return; }
      }

      const startValue = values.day_type === 2 ? halfDayStartTime : values.start;
      const endValue   = values.day_type === 2 ? halfDayEndTime   : values.end;

      if (!values.requested_leave_count || values.requested_leave_count === 0) {
        toast.error("Selected Hour Can't Be Zero");
        return;
      }
      if (values.requested_leave_count > leaveBalanceCount) {
        toast.error("Selected Leave Exceeds Balance Leave");
        return;
      }

      // ── Payload matches raise-request-for-reapproval API exactly ──────────
      const reApprovalPayload = {
        id:                    leaveRecord?.id,
        leave_type_id:         values.leave_type_id,
        start:                 startValue,
        end:                   endValue,
        requested_leave_count: values.requested_leave_count,
        reason:                values.reason,
        day_type:              values.day_type,
        is_cancel_request:     false,
      };

      dispatch(setLoaderVisible(true));

      try {
        // ── Changed: endpoint is now raise-request-for-reapproval ────────────
        const res = await PostApi(
          "leave/raise-request-for-reapproval/",
          reApprovalPayload,
          false
        );

        if (res.status === 200) {
          // Re-approval always edits an existing record — use editLeaveApplication
          dispatch(editLeaveApplication(res?.data?.data));

          dispatch(
            setLeaveTypeForCurrentEmployee(
              res?.data?.leave_type_for_employee || []
            )
          );

          toast.success(res?.data?.message || "Re-approval request raised successfully");
          dispatch(toggleRSBView(false));
          onClose();
        } else {
          toast.error(res?.data?.error_message || res?.data?.detail || "Something went wrong");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
      } finally {
        dispatch(setLoaderVisible(false));
      }
    },
  });

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Modal isOpen={isOpen} toggle={onClose} centered size="lg" zIndex={1050}>
      <ModalHeader toggle={onClose}>Change Leave Application</ModalHeader>

      <ModalBody>
        <Form onSubmit={FormikForm.handleSubmit} action="javascript:void(0)">
          <Row className="g-3">

            {/* ── Leave Type ── */}
            <Col lg={12}>
              <div className="mb-3">
                <Label>Type *</Label>
                <Select
                  name="leave_type_id"
                  isMulti={false}
                  options={leaveTypeOptions}
                  isOptionDisabled={(option) => option.balance_leave_count === 0}
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
                      ? leaveTypeOptions.find(
                          (d) => d.value === leaveapplyObj.leave_type_id
                        ) || null
                      : null
                  }
                  onChange={handleLeaveTypeChange}
                  placeholder="Select Leave Type"
                  className="basic-multi-select"
                  classNamePrefix="lc-select"
                />
                {FormikForm.touched.leave_type_id &&
                  FormikForm.errors.leave_type_id && (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.leave_type_id}
                    </div>
                  )}
                {!!leaveBalanceCount && (
                  <small className="text-muted d-block mt-1">
                    {leaveBalanceCount}{" "}
                    {currentUnit === leave_type_day_unit ? "Days" : "Hours"}{" "}
                    Remaining
                  </small>
                )}
              </div>
            </Col>

            {/* ── Day-unit: date range + day type ── */}
            {!!currentUnit && currentUnit === leave_type_day_unit && (
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
                                ConvertISODateFormat(leaveapplyObj.start)
                              ),
                              DateFormat
                            ),
                            dayjs(
                              ConvertDateFormat(
                                ConvertISODateFormat(leaveapplyObj.end)
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
                  Please select Start &amp; End Date
                </div>

                {/* Day type – shown only for single-day selection */}
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
                        classNamePrefix="lc-select"
                        value={
                          leaveapplyObj?.day_type
                            ? day_type.find(
                                (d) => d.value === leaveapplyObj.day_type
                              ) || null
                            : null
                        }
                        onChange={handleDayType}
                      />
                    </Col>
                  </div>
                )}
              </Col>
            )}

            {/* ── Half-day time pickers ── */}
            {leaveapplyObj?.day_type === 2 &&
              currentUnit === leave_type_day_unit && (
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
                        setHalfDayStartTime(newDateTime.format("YYYY-MM-DD HH:mm:00"));
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
                        const datePart = dayjs(leaveapplyObj.start).format("YYYY-MM-DD");
                        const end = dayjs(`${datePart} ${time.format("HH:mm:ss")}`);
                        if (end.isBefore(dayjs(halfDayStartTime))) {
                          setTimeError("End time cannot be before start time!");
                          return;
                        }
                        setTimeError("");
                        setHalfDayEndTime(end.format("YYYY-MM-DD HH:mm:00"));
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

                  {timeError && (
                    <Col md={12}>
                      <div className="text-danger mt-2">{timeError}</div>
                    </Col>
                  )}
                </div>
              )}

            {/* ── Hour-unit: datetime pickers ── */}
            {!!currentUnit && currentUnit === leave_type_hour_unit && (
              <Col lg={12}>
                <div className="row">
                  <Col md={4} lg={4} xxl={4}>
                    <DatePicker
                      name="start"
                      placeholder="Select Start Time"
                      showTime={{
                        minuteStep:   30,
                        defaultValue: initialTime,
                        format:       "HH:mm",
                      }}
                      format={DateTimeFormat}
                      onChange={handleFromDateChange}
                      value={
                        !!leaveapplyObj?.start
                          ? dayjs(
                              ConvertToDateTimeFormat(
                                ConvertToISODateTimeFormat(leaveapplyObj.start)
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
                        minuteStep:   30,
                        defaultValue: initialTime,
                        format:       "HH:mm",
                      }}
                      format={DateTimeFormat}
                      onChange={handleToDateChange}
                      value={
                        !!leaveapplyObj?.end
                          ? dayjs(
                              ConvertToDateTimeFormat(
                                ConvertToISODateTimeFormat(leaveapplyObj.end)
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

            {/* ── Reason ── */}
            <Col lg={12}>
              <label htmlFor="modal_reason" className="form-label">
                Reason *
              </label>
              <textarea
                name="reason"
                className="form-control"
                id="modal_reason"
                placeholder="Enter Reason"
                rows={3}
                value={leaveapplyObj?.reason || ""}
                onChange={handleInputChange}
              />
              {FormikForm.touched.reason && FormikForm.errors.reason && (
                <div className="lc_form_error_text">
                  {FormikForm.errors.reason}
                </div>
              )}
            </Col>
          </Row>

          {/* ── Footer ── */}
          <div className="d-flex justify-content-between mt-4">
            <Button
              color="danger"
              outline
              type="button"
              disabled={cancelLoading}
              onClick={handleCancelLeaveConfirm}
            >
              {cancelLoading ? "Cancelling…" : "Cancel Leave"}
            </Button>

            <div className="d-flex gap-2">
              <Button color="secondary" type="button" onClick={onClose}>
                Close
              </Button>
              <Button color="success" className="btn-label" type="submit">
                <i className="ri-check-double-line label-icon align-middle fs-16 me-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default LeaveChangeModal;