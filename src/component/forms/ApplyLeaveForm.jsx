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
import { setHoliday } from "../../redux/reducers/ChildReducer/HolidayReducer";

dayjs.extend(customParseFormat);

// ─────────────────────────────────────────────────────────────────────────────
// Helper: derive shift start/end from work-schedule workday array
// Returns { shiftStart: "HH:mm", shiftEnd: "HH:mm", crossesMidnight: bool }
// ─────────────────────────────────────────────────────────────────────────────
const getShiftTimings = (workScheduleData, profileData) => {
  const thisEmpWS = workScheduleData?.find(
    (val) => val.id === profileData?.work_schedule_id,
  );
  if (!thisEmpWS) return null;

  // Try common field names – adjust to your actual API shape
  const shiftStart =
    thisEmpWS.shift_start_time ||
    thisEmpWS.start_time ||
    thisEmpWS.from_time ||
    null;
  const shiftEnd =
    thisEmpWS.shift_end_time || thisEmpWS.end_time || thisEmpWS.to_time || null;

  if (!shiftStart || !shiftEnd) return null;

  const startH = parseInt(shiftStart.split(":")[0], 10);
  const endH = parseInt(shiftEnd.split(":")[0], 10);

  // Night shift: end hour is numerically less than start hour → crosses midnight
  const crossesMidnight = endH < startH || endH === startH;

  return {
    shiftStart, // "HH:mm"
    shiftEnd, // "HH:mm"
    crossesMidnight,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: given a date string (YYYY-MM-DD) + shift info,
// compute half-day boundaries that respect night-shift crossing midnight.
//
//   First half  → shiftStart … midpoint
//   Second half → midpoint   … shiftEnd (possibly next day)
//
// Returns { firstHalfStart, firstHalfEnd, secondHalfStart, secondHalfEnd }
// all as dayjs objects so callers can format freely.
// ─────────────────────────────────────────────────────────────────────────────
const computeHalfDayBoundaries = (dateStr, shiftInfo) => {
  if (!shiftInfo || !dateStr) return null;
  const { shiftStart, shiftEnd, crossesMidnight } = shiftInfo;

  const baseDate = dayjs(dateStr, "YYYY-MM-DD");
  const startDT = baseDate
    .hour(parseInt(shiftStart.split(":")[0], 10))
    .minute(parseInt(shiftStart.split(":")[1], 10))
    .second(0);

  let endDT = baseDate
    .hour(parseInt(shiftEnd.split(":")[0], 10))
    .minute(parseInt(shiftEnd.split(":")[1], 10))
    .second(0);

  // If night shift, end is on the NEXT calendar day
  if (crossesMidnight) {
    endDT = endDT.add(1, "day");
  }

  const totalMinutes = endDT.diff(startDT, "minute");
  const halfMinutes = Math.floor(totalMinutes / 2);
  const midpointDT = startDT.add(halfMinutes, "minute");

  return {
    firstHalfStart: startDT, // shift start
    firstHalfEnd: midpointDT, // midpoint
    secondHalfStart: midpointDT, // midpoint
    secondHalfEnd: endDT, // shift end (possibly next day)
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: check whether a permission/time-off request is allowed
// (plug your real permission rules here)
// ─────────────────────────────────────────────────────────────────────────────
const checkPermissionAllowed = (leaveTypeObj, requestedStart, requestedEnd) => {
  // Example rule: permission unit leaves must be within shift hours
  // Return { allowed: bool, reason: string }
  if (!requestedStart || !requestedEnd) return { allowed: true };
  if (dayjs(requestedEnd).isBefore(dayjs(requestedStart))) {
    return { allowed: false, reason: "End time cannot be before start time." };
  }
  return { allowed: true };
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const ApplyLeaveForm = () => {
  const dispatch = useDispatch();
  const [leaveapplyObj, setLeaveApplyObj] = useState({});

  useEffect(() => {
    dispatch(setHoliday(GetLocalStorageData("holiday")));
  }, []);
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

  const [isRestrictedLeave, setIsRestrictedLeave] = useState(false);
  const [selectedRestrictedHoliday, setSelectedRestrictedHoliday] =
    useState(null);

  const [isCompOffLeave, setIsCompOffLeave] = useState(false);
  const [compOffWorkDate, setCompOffWorkDate] = useState(null);
  const [compOffDateError, setCompOffDateError] = useState("");

  // Half-day & permission times stored as dayjs objects (null when unset)
  const [halfDayStartTime, setHalfDayStartTime] = useState(null);
  const [halfDayEndTime, setHalfDayEndTime] = useState(null);

  // Computed half-day boundaries for the selected date
  const [halfDayBoundaries, setHalfDayBoundaries] = useState(null);

  const workScheduleData = GetLocalStorageData("work_schedule") || [];
  const profileData = GetLocalStorageData("my_profile") || [];

  const { holiday_data } = useSelector((state) => state.HolidayReducer);
  const holidayData = holiday_data || [];

  const { leave_application_data } = useSelector(
    (state) => state.LeaveApplyReducer,
  );

  const appliedDates = useMemo(() => {
    const dates = [];
    (leave_application_data || []).forEach((app) => {
      if (app.is_deleted) return;
      if (Array.isArray(app.in_between_dates) && app.in_between_dates.length) {
        app.in_between_dates.forEach((d) => dates.push(d));
      } else if (app.start) {
        dates.push(dayjs(app.start).format("YYYY-MM-DD"));
      }
    });
    return dates;
  }, [leave_application_data]);

  const holidayISODates = useMemo(() => {
    return (holidayData || []).map((h) => h?.date).filter(Boolean);
  }, [holidayData]);

  const getDateCellStyle = (currentISO) => {
    if (holidayISODates.includes(currentISO)) {
      return { backgroundColor: "#fff3cd", color: "#856404" }; // yellow = holiday
    }
    if (appliedDates.includes(currentISO)) {
      return { backgroundColor: "#f8d7da", color: "#842029" }; // red = already applied
    }
    return null;
  };

  const { leave_type_for_current_employee } = useSelector(
    (state) => state.LeaveTypeReducer,
  );

  // Build select options
  const leaveTypeOptions = leave_type_for_current_employee.map((item) => ({
    value: item.leave_type.id,
    label: item.leave_type.name,
    balance_leave_count: item.available_count,
    unit: item.leave_type.unit,
    full_obj: item,
  }));

  // ── Shift info derived once ──────────────────────────────────────────────
  const shiftInfo = useMemo(
    () => getShiftTimings(workScheduleData, profileData),
    [], // eslint-disable-line
  );

  const restrictedHolidayOptions = useMemo(() => {
    return (holidayData || [])
      .filter(
        (h) =>
          h.is_restricted === true &&
          h.work_schedule_id_list?.includes(profileData?.work_schedule_id),
      )
      .map((h) => ({
        value: h.id,
        label: h.name?.trim(),
        date: h.date,
      }));
  }, [holidayData, profileData]);

  // ── Recompute half-day boundaries whenever the selected date changes ─────
  useEffect(() => {
    const dateStr = leaveapplyObj?.start
      ? dayjs(leaveapplyObj.start).format("YYYY-MM-DD")
      : null;
    if (dateStr && shiftInfo) {
      setHalfDayBoundaries(computeHalfDayBoundaries(dateStr, shiftInfo));
    } else {
      setHalfDayBoundaries(null);
    }
  }, [leaveapplyObj?.start, shiftInfo]);

  // ── Populate form when editing ───────────────────────────────────────────
  useEffect(
    () => {
      if (!!form_obj) {
        const thisEmpWS = workScheduleData?.find(
          (val) => val.id === profileData.work_schedule_id,
        );
        !!thisEmpWS &&
          setWeekOffDays(
            thisEmpWS.workday
              .map((d) => (d.is_day_on === false ? d.day_id : null))
              .filter(Boolean),
          );

        setHolidayDays(holidayData.map((d) => d?.date));

        if (form_obj?.leave_type_id !== 0) {
          let leave_type_record = leave_type_for_current_employee.find(
            (d) => d.leave_type?.id === form_obj.leave_type_id,
          );
          if (leave_type_record) {
            setLeaveBalanceCount(leave_type_record.available_count);
            handleStartEndDatesChange(leave_type_record, true);
            setSelectedLeaveTypeObj(leave_type_record);

            setIsCompOffLeave(leave_type_record?.leave_type?.type === 2);

            const isRestricted = leave_type_record?.leave_type?.type === 1;
            setIsRestrictedLeave(isRestricted);

            if (isRestricted && form_obj?.start) {
              const matchedHoliday = restrictedHolidayOptions.find(
                (h) => h.date === form_obj.start,
              );
              setSelectedRestrictedHoliday(matchedHoliday || null);
            } else {
              setSelectedRestrictedHoliday(null);
            }
          }
        }

        setLeaveApplyObj({
          ...form_obj,
          start: form_obj?.start,
          end: form_obj?.end,
        });

        if (form_obj?.comp_off_work_date) {
          setCompOffWorkDate(dayjs(form_obj.comp_off_work_date));
        } else {
          setCompOffWorkDate(null);
        }
        setCompOffDateError("");

        // Restore half-day times on edit — stored as dayjs objects
        if (form_obj?.day_type === 2 && form_obj.unit === leave_type_day_unit) {
          if (form_obj.start) setHalfDayStartTime(dayjs(form_obj.start));
          if (form_obj.end) setHalfDayEndTime(dayjs(form_obj.end));
        }

        setHourDiff(timeConvert(form_obj.requested_leave_count));
        setDaysCount(form_obj.requested_leave_count);
        setInBetweenDays(form_obj.in_between_dates);

        if (form_obj?.unit === 2 && form_obj?.start !== null) {
          setFromDate(
            ConvertToDateTimeFormat(ConvertToISODateTimeFormat(form_obj.start)),
          );
        }
        if (form_obj?.unit === 2 && form_obj?.end !== null) {
          setToDate(
            ConvertToDateTimeFormat(ConvertToISODateTimeFormat(form_obj.end)),
          );
        }
      }
    },
    [form_obj],
    restrictedHolidayOptions,
  ); // eslint-disable-line

  // ── Leave type change ────────────────────────────────────────────────────
  const handleLeaveTypeChange = (selectedOption) => {
    if (!selectedOption) return;
    const fullRecord = selectedOption.full_obj;
    setLeaveBalanceCount(selectedOption.balance_leave_count);

    const compOff = fullRecord?.leave_type?.type === 2;
    setIsCompOffLeave(compOff);
    setCompOffWorkDate(null);
    setCompOffDateError("");

    const isRestricted = fullRecord?.leave_type?.type === 1;
    setIsRestrictedLeave(isRestricted);
    setSelectedRestrictedHoliday(null);

    handleStartEndDatesChange(fullRecord, false);
  };

  const handleStartEndDatesChange = (leave_type_record, skipReset = false) => {
    const localThisEmpWS = workScheduleData?.find(
      (val) => val.id === profileData.work_schedule_id,
    );
    const leaveTypeData = leave_type_record?.leave_type || leave_type_record;

    leaveTypeData?.weekend_between_leave === true
      ? setWeekOffDays([])
      : !!localThisEmpWS &&
        setWeekOffDays(
          localThisEmpWS.workday
            .map((d) => (d.is_day_on === false ? d.day_id : null))
            .filter(Boolean),
        );

    leaveTypeData?.holiday_between_leave === true
      ? setHolidayDays([])
      : setHolidayDays(holidayData.map((d) => d?.date));

    setSelectedLeaveTypeObj(leave_type_record);

    if (!skipReset) {
      setLeaveApplyObj((prev) => ({
        ...prev,
        leave_type_id: leaveTypeData?.id,
        unit: leaveTypeData?.unit,
        start: null,
        end: null,
        in_between_dates: [],
        day_type: null,
        requested_leave_count: 0,
      }));
      setHourDiff("");
      setDaysCount("");
      setInBetweenDays([]);
      setHalfDayStartTime(null);
      setHalfDayEndTime(null);
      setFromDate(null);
      setToDate(null);
      setHalfDayBoundaries(null);
      setCompOffWorkDate(null);
      setCompOffDateError("");
    }
  };

  const handleRestrictedHolidayChange = (selectedOption) => {
    if (!selectedOption) {
      setSelectedRestrictedHoliday(null);
      setLeaveApplyObj((prev) => ({
        ...prev,
        start: null,
        end: null,
        requested_leave_count: 0,
        in_between_dates: [],
      }));
      setDaysCount("");
      return;
    }
    setSelectedRestrictedHoliday(selectedOption);

    const isoDate = selectedOption.date;

    setLeaveApplyObj((prev) => ({
      ...prev,
      start: isoDate,
      end: isoDate,
      day_type: 1,
      requested_leave_count: 1,
      in_between_dates: [isoDate],
    }));
    setDaysCount(1);
  };

  // ── Multi-day range picker ───────────────────────────────────────────────
  const handleMultiDayChange = (dates, dateStrings, daysCount) => {
    let startDate =
      !dateStrings[0] || dateStrings[0] === "" ? null : dateStrings[0];
    let endDate =
      !dateStrings[1] || dateStrings[1] === "" ? null : dateStrings[1];

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
    const ValidDays = intermediateDates.filter(
      (d) =>
        !WeekOffDays.includes(new Date(d).getDay()) &&
        !HolidayDays.includes(d) &&
        !appliedDates.includes(d),
    );

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

  const disabledDate = (current) => {
    if (!current) return false;

    const minDate = dayjs("1900-01-01", "YYYY-MM-DD");
    const maxDate = dayjs().add(1, "year");

    if (current < minDate.startOf("day") || current > maxDate.endOf("day")) {
      return true;
    }

    const dayOfWeek = current.day();
    const currentISO = current.format("YYYY-MM-DD");

    return (
      WeekOffDays.includes(dayOfWeek) ||
      HolidayDays.map((d) => ConvertDateFormat(d)).includes(
        current.format("DD-MM-YYYY"),
      ) ||
      appliedDates.includes(currentISO)
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "reason") {
      const filteredValue = value
        .replace(/^\s+/, "")
        .replace(/[^A-Za-z0-9\s.,!?'"\-_()&:;\/\n\r]/g, "");

      setLeaveApplyObj({
        ...leaveapplyObj,
        reason: filteredValue,
      });

      FormikForm.setFieldValue("reason", filteredValue);
    } else {
      setLeaveApplyObj({
        ...leaveapplyObj,
        [name]: value,
      });

      FormikForm.setFieldValue(name, value);
    }
  };

  // ── Day-type change (Full / Half) ────────────────────────────────────────
  const handleDayType = (e) => {
    const value = e?.value || null;
    const updatedDaysCount = value === 1 ? 1 : value === 2 ? 0.5 : 0;

    // Reset half-day times and auto-populate from shift if switching to half-day
    setHalfDayStartTime(null);
    setHalfDayEndTime(null);
    setTimeError("");

    setLeaveApplyObj({
      ...leaveapplyObj,
      day_type: value,
      requested_leave_count: updatedDaysCount,
      in_between_dates:
        value === 1 ? [leaveapplyObj.start] : value === 2 ? [] : [],
    });
    setDaysCount(updatedDaysCount);
  };

  // ── Hour-unit DatePicker (with datetime) ─────────────────────────────────
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
        fromDateTime,
      );
      const toDateObj = new Date(
        toDateYear,
        toDateMonth - 1,
        toDateDay,
        toDateTime,
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
      start: !dateStr
        ? null
        : ConvertToISODateTimeFormat(ConvertToDateTimeFormat(dateStr)),
    });
  };

  const handleToDateChange = (date, dateStr) => {
    setToDate(dateStr);
    setLeaveApplyObj({
      ...leaveapplyObj,
      end: !dateStr
        ? null
        : ConvertToISODateTimeFormat(ConvertToDateTimeFormat(dateStr)),
    });
  };

  const calculateHourDiff = (start, end) => {
    if (!start || !end) return;
    const parseDateString = (dateString) => {
      const [day, month, year, hours, minutes] = dateString.split(/\D+/);
      return new Date(year, month - 1, day, hours, minutes);
    };
    const startDate = parseDateString(start);
    const endDate = parseDateString(end);
    let diffInMilliseconds =
      startDate > endDate
        ? (() => {
            const midnight = new Date(startDate);
            midnight.setHours(24, 0, 0, 0);
            return midnight - startDate + (endDate - new Date(0));
          })()
        : endDate - startDate;

    const hours = diffInMilliseconds / (1000 * 60 * 60);
    // Round to nearest minute (no 30-min snapping here)
    const totalMinutes = Math.round(hours * 60);
    const roundedHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const formattedResult = `${String(roundedHours).padStart(2, "0")}:${String(
      remainingMinutes,
    ).padStart(2, "0")}`;
    const formattedResultForSetting = roundedHours + remainingMinutes / 60;

    setHourDiff(formattedResult);
    setLeaveApplyObj((prev) => ({
      ...prev,
      requested_leave_count: formattedResultForSetting,
      day_type: 1,
    }));
  };

  // ── Half-day time change handlers ────────────────────────────────────────
  // FIX: minuteStep removed (set to 1) → any time is selectable.
  // FIX: night-shift aware — end time may be on the next calendar day.

  const handleHalfDayStartTimeChange = (time) => {
    if (!time) {
      setHalfDayStartTime(null);
      setHalfDayEndTime(null);
      return;
    }
    // Combine with the leave date to get a full datetime
    const datePart = leaveapplyObj?.start
      ? dayjs(leaveapplyObj.start).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");

    let startDT = dayjs(
      `${datePart} ${time.format("HH:mm")}`,
      "YYYY-MM-DD HH:mm",
    );

    // Night shift: if the chosen start hour is >= shift start on the same day but
    // we're in night shift, keep same day. If chosen hour is early morning (after
    // midnight) it could be the next day — the user sees the calendar date they
    // picked so we always anchor to datePart for start.
    setHalfDayStartTime(startDT);
    setHalfDayEndTime(null); // reset end whenever start changes
    setTimeError("");
  };

  const handleHalfDayEndTimeChange = (time) => {
    if (!time || !halfDayStartTime) return;

    const datePart = halfDayStartTime.format("YYYY-MM-DD");
    let endDT = dayjs(
      `${datePart} ${time.format("HH:mm")}`,
      "YYYY-MM-DD HH:mm",
    );

    // Night-shift fix: if end time is numerically before start time on the
    // SAME calendar day, the shift crosses midnight → end is on the next day.
    if (endDT.isBefore(halfDayStartTime) || endDT.isSame(halfDayStartTime)) {
      if (shiftInfo?.crossesMidnight) {
        // Advance to next calendar day
        endDT = endDT.add(1, "day");
      } else {
        setTimeError("End time cannot be before or equal to start time.");
        return;
      }
    }

    // Permission check
    const permCheck = checkPermissionAllowed(
      selectedLeaveTypeObj,
      halfDayStartTime,
      endDT,
    );
    if (!permCheck.allowed) {
      setTimeError(permCheck.reason);
      return;
    }

    setTimeError("");
    setHalfDayEndTime(endDT);
  };

  // ── Compute total half-day hours (handles cross-midnight) ────────────────
  const computedHalfDayHours = useMemo(() => {
    if (!halfDayStartTime || !halfDayEndTime) return "0.00";
    const diffMinutes = halfDayEndTime.diff(halfDayStartTime, "minute");
    if (diffMinutes <= 0) return "0.00";
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }, [halfDayStartTime, halfDayEndTime]);

  // ── Shift boundary display helpers ───────────────────────────────────────
  const shiftBoundaryHint = useMemo(() => {
    if (!shiftInfo) return null;
    const label = shiftInfo.crossesMidnight
      ? `Night shift: ${shiftInfo.shiftStart} → next day ${shiftInfo.shiftEnd}`
      : `Shift: ${shiftInfo.shiftStart} – ${shiftInfo.shiftEnd}`;
    return label;
  }, [shiftInfo]);

  // ── Derive unit ──────────────────────────────────────────────────────────
  const currentUnit =
    selectedLeaveTypeObj?.leave_type?.unit || selectedLeaveTypeObj?.unit;

  // ── Formik ───────────────────────────────────────────────────────────────
  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: leaveapplyObj,
    validationSchema: Yup.object({
      leave_type_id: Yup.number()
        .required("Select Leave Type")
        .min(1, "Please Select Leave Type"),
      reason: Yup.string()
        .trim()
        .required("Reason is required")
        .min(2, "Reason must be at least 2 characters")
        .max(500, "Reason cannot exceed 500 characters")
        .matches(
          /^[A-Za-z0-9\s.,!?'"\-_()&:;\/]+$/,
          "Only alphabets, numbers, spaces and standard punctuation are allowed",
        )
        .test(
          "not-empty-space",
          "Reason cannot contain only spaces",
          (value) => value && value.trim().length > 0,
        ),
    }),
    onSubmit: async (values) => {
      values.reason = values.reason.trim();
      if (isCompOffLeave && !compOffWorkDate) {
        setCompOffDateError("Please select the Work Date");
        toast.error("Please select the Work Date for Comp-Off leave");
        return;
      }
      // ── Half-day validation ──
      if (values.day_type === 2) {
        if (!halfDayStartTime) {
          toast.error("Please select Start Time");
          return;
        }
        if (!halfDayEndTime) {
          toast.error("Please select End Time");
          return;
        }
        if (timeError) {
          toast.error(timeError);
          return;
        }
      }

      // Build final object — store times in ISO format (YYYY-MM-DD HH:mm:00)
      const finalLeaveObj = {
        ...values,
        ...(isCompOffLeave && {
          comp_off_work_date: compOffWorkDate.format("YYYY-MM-DD"),
        }),
        start:
          values.day_type === 2
            ? halfDayStartTime.format("YYYY-MM-DD HH:mm:00")
            : values.start,
        end:
          values.day_type === 2
            ? halfDayEndTime.format("YYYY-MM-DD HH:mm:00")
            : values.end,
      };

      if (isRestrictedLeave) {
        delete finalLeaveObj.in_between_dates;
      }

      dispatch(setLoaderVisible(true));

      if (
        !finalLeaveObj.requested_leave_count ||
        finalLeaveObj.requested_leave_count === 0
      ) {
        toast.error("Selected Hour Can't Be Zero");
        dispatch(setLoaderVisible(false));
        return;
      }

      // if (finalLeaveObj.requested_leave_count > leaveBalanceCount) {
      //   toast.error("Selected Leave Exceeds Balance Leave");
      //   dispatch(setLoaderVisible(false));
      //   return;
      // }

      try {
        const ApiRes = await PostApi(
          "leave/leave-application/create/",
          finalLeaveObj,
          false,
        );

        if (ApiRes.status === 200) {
          if (leaveapplyObj.id === 0) {
            dispatch(addLeaveApplication(ApiRes?.data.data));
          } else {
            dispatch(editLeaveApplication(ApiRes?.data?.data));
          }
          dispatch(
            setLeaveTypeForCurrentEmployee(
              ApiRes?.data?.leave_type_for_employee || [],
            ),
          );
          dispatch(toggleRSBView(false));
          toast.success(ApiRes?.data?.message);
        } else {
          toast.error(ApiRes?.data?.message || ApiRes?.data?.detail);
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong!");
      } finally {
        dispatch(setLoaderVisible(false));
      }
    },
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <React.Fragment>
      <Row>
        <Col>
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
                    isSearchable={true}
                    filterOption={(option, inputValue) =>
                      option.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    }
                    noOptionsMessage={() => "No records found"}
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
                            (d) => d.value === leaveapplyObj.leave_type_id,
                          ) || null
                        : null
                    }
                    onChange={handleLeaveTypeChange}
                    placeholder="Select Leave Type"
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
                  />
                  {FormikForm.touched.leave_type_id &&
                  FormikForm.errors.leave_type_id ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.leave_type_id}
                    </div>
                  ) : null}
                </div>
              </Col>

              {/* ── Restricted Holiday Selection ── */}
              {isRestrictedLeave && (
                <Col lg={12}>
                  <div className="mb-3">
                    <Label>Select Restricted Holiday *</Label>
                    <Select
                      name="restricted_holiday"
                      isMulti={false}
                      options={restrictedHolidayOptions}
                      value={selectedRestrictedHoliday}
                      onChange={handleRestrictedHolidayChange}
                      placeholder="Select Restricted Holiday"
                      className="basic-multi-select"
                      classNamePrefix="lc-select"
                    />
                    {restrictedHolidayOptions.length === 0 && (
                      <div className="form-text text-warning">
                        No restricted holidays available for your work schedule.
                      </div>
                    )}
                  </div>

                  {leaveapplyObj?.start && (
                    <div className="mb-3">
                      <Label>Date</Label>
                      <Input
                        type="text"
                        value={ConvertDateFormat(leaveapplyObj.start)}
                        disabled
                      />
                    </div>
                  )}
                </Col>
              )}

              {/* ── Day-unit: date range picker ── */}
              {!!currentUnit &&
                currentUnit === leave_type_day_unit &&
                !isRestrictedLeave && (
                  <Col lg={12}>
                    {isCompOffLeave ? (
                      <>
                        <Label className="form-label">Select Date</Label>
                        <div className="row g-2 mb-3">
                          <Col md={6}>
                            <DatePicker
                              name="start_date"
                              format={DateFormat}
                              placeholder="Start Date"
                              disabledDate={disabledDate}
                              inputReadOnly={true}
                              cellRender={(current, info) => {
                                if (info.type !== "date" || !current?.format) {
                                  return info.originNode;
                                }
                                const currentISO = current.format("YYYY-MM-DD");
                                const cellStyle = getDateCellStyle(currentISO);
                                if (cellStyle) {
                                  return (
                                    <div
                                      className="ant-picker-cell-inner"
                                      style={{
                                        ...cellStyle,
                                        borderRadius: "4px",
                                      }}
                                    >
                                      {current.date()}
                                    </div>
                                  );
                                }
                                return info.originNode;
                              }}
                              style={{ width: "100%" }}
                              value={
                                leaveapplyObj?.start
                                  ? dayjs(
                                      ConvertDateFormat(
                                        ConvertISODateFormat(
                                          leaveapplyObj.start,
                                        ),
                                      ),
                                      DateFormat,
                                    )
                                  : null
                              }
                              onChange={(date, dateStr) => {
                                const isoDate = !dateStr
                                  ? null
                                  : ConvertISODateFormat(
                                      ConvertDateFormat(dateStr),
                                    );
                                setLeaveApplyObj((prev) => ({
                                  ...prev,
                                  start: isoDate,
                                  end: isoDate,
                                  day_type: 1,
                                  requested_leave_count: isoDate ? 1 : 0,
                                  in_between_dates: isoDate ? [isoDate] : [],
                                }));
                                setDaysCount(isoDate ? 1 : "");
                                // NEW: reset dependent fields when start date changes
                                setCompOffWorkDate(null);
                                setCompOffDateError("");
                              }}
                            />
                          </Col>

                          <Col md={6}>
                            <DatePicker
                              name="end_date"
                              format={DateFormat}
                              placeholder="End Date"
                              disabled={true}
                              style={{ width: "100%" }}
                              value={
                                leaveapplyObj?.end
                                  ? dayjs(
                                      ConvertDateFormat(
                                        ConvertISODateFormat(leaveapplyObj.end),
                                      ),
                                      DateFormat,
                                    )
                                  : null
                              }
                            />
                          </Col>
                        </div>
                        <div id="passwordHelpBlock" className="form-text mb-3">
                          End Date auto-selects same as Start Date
                        </div>

                        {/* NEW: Work Date shows only after Start Date is selected */}
                        {leaveapplyObj?.start && (
                          <>
                            <Label className="form-label">Work Date</Label>
                            <DatePicker
                              name="comp_off_work_date"
                              format={DateFormat}
                              placeholder="Select Work Date"
                              disabledDate={disabledDate}
                              inputReadOnly={true}
                              cellRender={(current, info) => {
                                if (info.type !== "date" || !current?.format) {
                                  return info.originNode;
                                }
                                const currentISO = current.format("YYYY-MM-DD");
                                const cellStyle = getDateCellStyle(currentISO);
                                if (cellStyle) {
                                  return (
                                    <div
                                      className="ant-picker-cell-inner"
                                      style={{
                                        ...cellStyle,
                                        borderRadius: "4px",
                                      }}
                                    >
                                      {current.date()}
                                    </div>
                                  );
                                }
                                return info.originNode;
                              }}
                              style={{ width: "100%" }}
                              value={compOffWorkDate}
                              onChange={(date, dateStr) => {
                                if (!dateStr) {
                                  setCompOffWorkDate(null);
                                  return;
                                }
                                setCompOffWorkDate(dayjs(dateStr, DateFormat));
                                setCompOffDateError("");
                              }}
                            />
                            {compOffDateError ? (
                              <div className="lc_form_error_text">
                                {compOffDateError}
                              </div>
                            ) : (
                              <div id="passwordHelpBlock" className="form-text">
                                Please select the Work Date (day you worked for
                                this comp-off)
                              </div>
                            )}
                          </>
                        )}

                        {/* NEW: Day Type shows only after Work Date is selected */}
                        {leaveapplyObj?.start && compOffWorkDate && (
                          <div className="input-group mt-3">
                            <Col lg={12}>
                              <Label className="form-label">
                                Select Day Type
                              </Label>
                            </Col>
                            <Col lg={6}>
                              <Select
                                name="day_type"
                                isMulti={false}
                                options={day_type || []}
                                isSearchable={true}
                                filterOption={(option, inputValue) =>
                                  option.label
                                    .toLowerCase()
                                    .includes(inputValue.toLowerCase())
                                }
                                noOptionsMessage={() => "No records found"}
                                placeholder="Select Day Type"
                                className="basic-multi-select"
                                classNamePrefix="lc-select"
                                value={
                                  leaveapplyObj?.day_type
                                    ? day_type.find(
                                        (d) =>
                                          d.value === leaveapplyObj?.day_type,
                                      )
                                    : null
                                }
                                onChange={handleDayType}
                              />
                            </Col>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="input-group">
                          <div className="input-group">
                            <Label className="form-label">Select Date</Label>
                          </div>
                          <RangePicker
                            name="multiple_date"
                            format={DateFormat}
                            placeholder={["Start Date", "End Date"]}
                            disabledDate={disabledDate}
                            inputReadOnly={true}
                            cellRender={(current, info) => {
                              if (info.type !== "date" || !current?.format) {
                                return info.originNode;
                              }
                              const currentISO = current.format("YYYY-MM-DD");
                              const cellStyle = getDateCellStyle(currentISO);
                              if (cellStyle) {
                                return (
                                  <div
                                    className="ant-picker-cell-inner"
                                    style={{
                                      ...cellStyle,
                                      borderRadius: "4px",
                                    }}
                                  >
                                    {current.date()}
                                  </div>
                                );
                              }
                              return info.originNode;
                            }}
                            onChange={handleMultiDayChange}
                            value={
                              !!leaveapplyObj?.start && !!leaveapplyObj?.end
                                ? [
                                    dayjs(
                                      ConvertDateFormat(
                                        ConvertISODateFormat(
                                          leaveapplyObj?.start,
                                        ),
                                      ),
                                      DateFormat,
                                    ),
                                    dayjs(
                                      ConvertDateFormat(
                                        ConvertISODateFormat(
                                          leaveapplyObj?.end,
                                        ),
                                      ),
                                      DateFormat,
                                    ),
                                  ]
                                : null
                            }
                          />
                          <span className="input-group-text">
                            {daysCount} Days
                          </span>
                        </div>
                        <div id="passwordHelpBlock" className="form-text">
                          Please select Start &amp; End Date
                        </div>

                        {(daysCount === 1 || daysCount === 0.5) && (
                          <div className="input-group mt-3">
                            <Col lg={12}>
                              <Label className="form-label">
                                Select Day Type
                              </Label>
                            </Col>
                            <Col lg={6}>
                              <Select
                                name="day_type"
                                isMulti={false}
                                options={day_type || []}
                                isSearchable={true}
                                filterOption={(option, inputValue) =>
                                  option.label
                                    .toLowerCase()
                                    .includes(inputValue.toLowerCase())
                                }
                                noOptionsMessage={() => "No records found"}
                                placeholder="Select Day Type"
                                className="basic-multi-select"
                                classNamePrefix="lc-select"
                                value={
                                  leaveapplyObj?.day_type
                                    ? day_type.find(
                                        (d) =>
                                          d.value === leaveapplyObj?.day_type,
                                      )
                                    : null
                                }
                                onChange={handleDayType}
                              />
                            </Col>
                          </div>
                        )}
                      </>
                    )}
                  </Col>
                )}

              {/* ── Half-day time pickers (day_type === 2) ── */}
              {leaveapplyObj?.day_type === 2 && (
                <Col lg={12}>
                  <div className="row mt-3 align-items-end">
                    {/* Shift hint */}
                    {shiftBoundaryHint && (
                      <Col md={12} className="mb-2">
                        <small className="text-muted">
                          <i className="ri-time-line me-1" />
                          {shiftBoundaryHint}
                        </small>
                      </Col>
                    )}

                    {/* Half-day boundary quick-select buttons */}
                    {halfDayBoundaries && (
                      <Col md={12} className="mb-3">
                        <Label className="form-label d-block">
                          Quick Select Half
                        </Label>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              setHalfDayStartTime(
                                halfDayBoundaries.firstHalfStart,
                              );
                              setHalfDayEndTime(halfDayBoundaries.firstHalfEnd);
                              setTimeError("");
                            }}
                          >
                            First Half (
                            {halfDayBoundaries.firstHalfStart.format("HH:mm")}
                            &nbsp;–&nbsp;
                            {halfDayBoundaries.firstHalfEnd.format("HH:mm")})
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                              setHalfDayStartTime(
                                halfDayBoundaries.secondHalfStart,
                              );
                              setHalfDayEndTime(
                                halfDayBoundaries.secondHalfEnd,
                              );
                              setTimeError("");
                            }}
                          >
                            Second Half (
                            {halfDayBoundaries.secondHalfStart.format("HH:mm")}
                            &nbsp;–&nbsp;
                            {halfDayBoundaries.secondHalfEnd.format("HH:mm")}
                            {shiftInfo?.crossesMidnight ? " +1d" : ""})
                          </button>
                        </div>
                      </Col>
                    )}

                    {/* Start Time — ANY time (minuteStep={1}, no restriction) */}
                    <Col md={4}>
                      <Label className="form-label">Start Time</Label>
                      <TimePicker
                        value={halfDayStartTime || null}
                        format="HH:mm"
                        minuteStep={1}
                        showSecond={false}
                        onChange={handleHalfDayStartTimeChange}
                        style={{ width: "100%" }}
                        placeholder="Select start time"
                        needConfirm={false}
                      />
                    </Col>

                    {/* End Time — ANY time, night-shift aware */}
                    <Col md={4}>
                      <Label className="form-label">
                        End Time
                        {shiftInfo?.crossesMidnight && (
                          <small className="text-muted ms-1">
                            (may be next day)
                          </small>
                        )}
                      </Label>
                      <TimePicker
                        value={
                          halfDayEndTime
                            ? // Show only the time portion even if day rolled over
                              dayjs(halfDayEndTime.format("HH:mm"), "HH:mm")
                            : null
                        }
                        format="HH:mm"
                        minuteStep={1}
                        showSecond={false}
                        disabled={!halfDayStartTime}
                        onChange={handleHalfDayEndTimeChange}
                        style={{ width: "100%" }}
                        placeholder="Select end time"
                        needConfirm={false}
                      />
                    </Col>

                    {/* Total Hours */}
                    <Col md={3}>
                      <Label className="form-label">Total Hours</Label>
                      <span className="form-control text-center">
                        {computedHalfDayHours} h
                        {shiftInfo?.crossesMidnight &&
                          halfDayStartTime &&
                          halfDayEndTime &&
                          halfDayEndTime.date() !== halfDayStartTime.date() && (
                            <small className="text-info ms-1">(next day)</small>
                          )}
                      </span>
                    </Col>

                    {/* Time error */}
                    {timeError && (
                      <Col md={12}>
                        <div className="text-danger mt-2">{timeError}</div>
                      </Col>
                    )}

                    {/* Shift boundary info (detailed) */}
                    {halfDayBoundaries && (
                      <Col md={12} className="mt-2">
                        <small className="text-muted">
                          Shift total:{" "}
                          {halfDayBoundaries.secondHalfEnd.diff(
                            halfDayBoundaries.firstHalfStart,
                            "minute",
                          )}{" "}
                          mins &nbsp;|&nbsp; Each half ≈{" "}
                          {halfDayBoundaries.firstHalfEnd.diff(
                            halfDayBoundaries.firstHalfStart,
                            "minute",
                          )}{" "}
                          mins
                        </small>
                      </Col>
                    )}
                  </div>
                </Col>
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
                          minuteStep: 1,
                          format: "HH:mm",
                        }}
                        format={DateTimeFormat}
                        disabledDate={disabledDate}
                        inputReadOnly={true}
                        cellRender={(current, info) => {
                          if (info.type !== "date" || !current?.format) {
                            return info.originNode;
                          }
                          const currentISO = current.format("YYYY-MM-DD");
                          const cellStyle = getDateCellStyle(currentISO);
                          if (cellStyle) {
                            return (
                              <div
                                className="ant-picker-cell-inner"
                                style={{ ...cellStyle, borderRadius: "4px" }}
                              >
                                {current.date()}
                              </div>
                            );
                          }
                          return info.originNode;
                        }}
                        onChange={handleFromDateChange}
                        value={
                          !!leaveapplyObj?.start
                            ? dayjs(
                                ConvertToDateTimeFormat(
                                  ConvertToISODateTimeFormat(
                                    leaveapplyObj?.start,
                                  ),
                                ),
                                DateTimeFormat,
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
                          minuteStep: 1,
                          format: "HH:mm",
                        }}
                        format={DateTimeFormat}
                        disabledDate={disabledDate}
                        inputReadOnly={true}
                        cellRender={(current, info) => {
                          if (info.type !== "date" || !current?.format) {
                            return info.originNode;
                          }
                          const currentISO = current.format("YYYY-MM-DD");
                          const cellStyle = getDateCellStyle(currentISO);
                          if (cellStyle) {
                            return (
                              <div
                                className="ant-picker-cell-inner"
                                style={{ ...cellStyle, borderRadius: "4px" }}
                              >
                                {current.date()}
                              </div>
                            );
                          }
                          return info.originNode;
                        }}
                        onChange={handleToDateChange}
                        value={
                          !!leaveapplyObj?.end
                            ? dayjs(
                                ConvertToDateTimeFormat(
                                  ConvertToISODateTimeFormat(
                                    leaveapplyObj?.end,
                                  ),
                                ),
                                DateTimeFormat,
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

              {/* ── Submit ── */}
              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label" type="submit">
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2" />
                    Apply
                  </Button>
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
