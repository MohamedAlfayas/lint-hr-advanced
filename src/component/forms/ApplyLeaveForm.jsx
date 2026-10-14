import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormHelperText,
  Grid,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { TimePicker as MuiTimePicker } from "@mui/x-date-pickers/TimePicker";
import withFieldClickOpen from "../../shared/ui/form/withFieldClickOpen";
import { alpha } from "@mui/material/styles";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  addLeaveApplication,
  editLeaveApplication,
} from "../../redux/reducers/ChildReducer/LeaveApplyReducer";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
  timeConvert,
} from "../../common/js/ConvertDateFormat";
import {
  leave_type_day_unit,
  leave_type_hour_unit,
  day_type,
} from "../../common/constant/Constants";
import { PostApi } from "../../common/api/PostApi";
import { toast } from "react-toastify";
import { DatePicker, Tooltip } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DateFormat, DateTimeFormat } from "../../common/constant/Constants";
import {
  ConvertToDateTimeFormat,
  ConvertToISODateTimeFormat,
} from "../../common/js/ConvertDateTimeFormat";
import { setLeaveTypeForCurrentEmployee } from "../../redux/reducers/ChildReducer/LeaveTypeReducer";
import { setHoliday } from "../../redux/reducers/ChildReducer/HolidayReducer";
import SidebarFormLayout from "../../shared/ui/SidebarFormLayout";
import { FormTextField } from "../../shared/ui/form";

dayjs.extend(customParseFormat);

const REASON_MAX = 250;
const REASON_CHARS = /[^A-Za-z0-9\s.,!?'"\-_()&:;]/g;

const schema = Yup.object({
  leave_type_id: Yup.number()
    .typeError("Select Leave Type")
    .required("Select Leave Type")
    .min(1, "Please Select Leave Type"),
  reason: Yup.string()
    .trim()
    .required("Reason is required")
    .min(2, "Reason must be at least 2 characters")
    .max(REASON_MAX, "Reason cannot exceed 250 characters")
    .matches(
      /^[A-Za-z0-9\s.,!?'"\-_()&:;]+$/,
      "Only alphabets, numbers, spaces and . , ! ? ' \" - _ ( ) & : ; are allowed",
    )
    .test(
      "not-empty-space",
      "Reason cannot contain only spaces",
      (value) => value && value.trim().length > 0,
    ),
});

const toFormValues = (obj) => ({
  leave_type_id: obj?.leave_type_id ?? null,
  reason: obj?.reason ?? "",
});

// antd pickers sized to match the small MUI inputs
const ANT_PICKER_STYLE = { width: "100%", height: 44 };
const TimePicker = withFieldClickOpen(MuiTimePicker);

const TIME_PICKER_PROPS = {
  format: "HH:mm",
  ampm: false,
  timeSteps: { minutes: 1 },
};
const timeFieldSlotProps = (clearable) => ({
  textField: { size: "small", fullWidth: true },
  ...(clearable && { field: { clearable: true } }),
});

const FieldLabel = ({ children, required }) => (
  <Typography
    variant="body2"
    color="text.secondary"
    sx={{ mb: 0.75, fontSize: 13 }}
  >
    {children}
    {required && " *"}
  </Typography>
);

const FieldHint = ({ children, error }) => (
  <FormHelperText error={error} sx={{ mx: 0.25 }}>
    {children}
  </FormHelperText>
);

const ReadOnlyField = ({ label, value, helperText }) => (
  <TextField
    label={label}
    value={value}
    helperText={helperText}
    slotProps={{ input: { readOnly: true } }}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// Helper: derive shift start/end from work-schedule workday array
// Returns { shiftStart: "HH:mm", shiftEnd: "HH:mm", crossesMidnight: bool }
// ─────────────────────────────────────────────────────────────────────────────
const getShiftTimings = (workScheduleData, profileData) => {
  if (!Array.isArray(workScheduleData)) {
    console.error("workScheduleData is not an array:", workScheduleData);
    return null;
  }

  const thisEmpWS = workScheduleData.find(
    (val) => val.id === profileData?.work_schedule_id,
  );

  if (!thisEmpWS) return null;

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

  return {
    shiftStart,
    shiftEnd,
    crossesMidnight: endH <= startH,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: given a date string (YYYY-MM-DD) + shift info,
// compute half-day boundaries that respect night-shift crossing midnight.
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

  if (crossesMidnight) {
    endDT = endDT.add(1, "day");
  }

  const totalMinutes = endDT.diff(startDT, "minute");
  const halfMinutes = Math.floor(totalMinutes / 2);
  const midpointDT = startDT.add(halfMinutes, "minute");

  return {
    firstHalfStart: startDT,
    firstHalfEnd: midpointDT,
    secondHalfStart: midpointDT,
    secondHalfEnd: endDT,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: check whether a permission/time-off request is allowed
// ─────────────────────────────────────────────────────────────────────────────
const checkPermissionAllowed = (leaveTypeObj, requestedStart, requestedEnd) => {
  if (!requestedStart || !requestedEnd) return { allowed: true };
  if (dayjs(requestedEnd).isBefore(dayjs(requestedStart))) {
    return { allowed: false, reason: "End time cannot be before start time." };
  }
  return { allowed: true };
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
//
// Props:
//   lockedDate (optional) — a date (YYYY-MM-DD). When provided (e.g. when the
//   form is opened from an attendance row), the leave date is fixed to it and
//   cannot be changed. Only the time (hour-unit leave) / day duration can be
//   adjusted. When omitted, the form behaves exactly as before.
//   onCancel (optional) — Cancel button handler; defaults to closing the
//   right sidebar.
// ─────────────────────────────────────────────────────────────────────────────
const ApplyLeaveForm = ({ lockedDate = null, onCancel }) => {
  const dispatch = useDispatch();
  const [leaveapplyObj, setLeaveApplyObj] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const balanceTone = Number(leaveBalanceCount) > 0 ? "success" : "error";
  const [timeError, setTimeError] = useState("");

  const [isRestrictedLeave, setIsRestrictedLeave] = useState(false);
  const [selectedRestrictedHoliday, setSelectedRestrictedHoliday] =
    useState(null);

  const [isCompOffLeave, setIsCompOffLeave] = useState(false);
  const [compOffWorkDate, setCompOffWorkDate] = useState(null);
  const [compOffDateError, setCompOffDateError] = useState("");

  const [halfDayStartTime, setHalfDayStartTime] = useState(null);
  const [halfDayEndTime, setHalfDayEndTime] = useState(null);

  const [halfDayBoundaries, setHalfDayBoundaries] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  // ── Locked date (fixed leave date when opened from an attendance row) ────
  // lockedISO         -> "YYYY-MM-DD" (used for comparisons / in_between_dates)
  // lockedStoredDate  -> same value in the exact format the RangePicker flow
  //                      stores in leaveapplyObj.start / end
  const lockedISO = useMemo(
    () => (lockedDate ? dayjs(lockedDate).format("YYYY-MM-DD") : null),
    [lockedDate],
  );
  const lockedStoredDate = useMemo(
    () =>
      lockedISO
        ? ConvertISODateFormat(
            ConvertDateFormat(dayjs(lockedISO).format(DateFormat)),
          )
        : null,
    [lockedISO],
  );

  const rawWorkScheduleData = GetLocalStorageData("work_schedule");
  const workScheduleData = Array.isArray(rawWorkScheduleData)
    ? rawWorkScheduleData
    : rawWorkScheduleData
      ? [rawWorkScheduleData]
      : [];
  const profileData = GetLocalStorageData("my_profile") || [];

  const { holiday_data } = useSelector((state) => state.HolidayReducer);
  const holidayData = holiday_data || [];

  const { leave_application_data } = useSelector(
    (state) => state.LeaveApplyReducer,
  );

  // ── Applied-leave lookup: date -> label (e.g. leave type name) ───────────
  const appliedLeaveMap = useMemo(() => {
    const map = {};
    (leave_application_data || []).forEach((app) => {
      console.log("leave_application_data", leave_application_data);

      if (app.status !== 2) return;

      if (app.is_deleted) return;
      const leaveLabel =
        app.leave_type_name ||
        app.leave_type?.name ||
        app.leave_type_obj?.name ||
        "Applied Leave";

      if (Array.isArray(app.in_between_dates) && app.in_between_dates.length) {
        app.in_between_dates.forEach((d) => {
          map[d] = leaveLabel;
        });
      } else if (app.start) {
        map[dayjs(app.start).format("YYYY-MM-DD")] = leaveLabel;
      }
    });
    return map;
  }, [leave_application_data]);

  const appliedDates = useMemo(
    () => Object.keys(appliedLeaveMap),
    [appliedLeaveMap],
  );

  // ── Holiday lookup: date -> holiday name ──────────────────────────────────
  const holidayMap = useMemo(() => {
    const map = {};
    (holidayData || []).forEach((h) => {
      if (h?.date) map[h.date] = h.name?.trim() || "Holiday";
    });
    return map;
  }, [holidayData]);

  // Returns { style, tooltip } for a given ISO date, or null if no highlight needed
  const getDateCellInfo = (currentISO) => {
    if (holidayMap[currentISO]) {
      return { kind: "holiday", tooltip: holidayMap[currentISO] };
    }
    if (appliedLeaveMap[currentISO]) {
      return { kind: "applied", tooltip: appliedLeaveMap[currentISO] };
    }
    return null;
  };

  const pickerLegend = () => (
    <div className="lv-legend">
      <span>
        <i className="is-holiday" />
        Holiday
      </span>
      <span>
        <i className="is-applied" />
        Already applied
      </span>
      <span>
        <i className="is-today" />
        Today
      </span>
      <span>
        <i className="is-selected" />
        Selected
      </span>
    </div>
  );

  // antd cellRender that colours holidays / already-applied dates with a tooltip
  const renderDateCell =
    (extraStyle = {}) =>
    (current, info) => {
      if (info.type !== "date" || !current?.format) {
        return info.originNode;
      }
      const currentISO = current.format("YYYY-MM-DD");
      const cellInfo = getDateCellInfo(currentISO);
      if (cellInfo) {
        return (
          <Tooltip title={cellInfo.tooltip}>
            <div
              className={`ant-picker-cell-inner lv-mark is-${cellInfo.kind}`}
              style={extraStyle}
            >
              {current.date()}
            </div>
          </Tooltip>
        );
      }
      return info.originNode;
    };

  const { leave_type_for_current_employee } = useSelector(
    (state) => state.LeaveTypeReducer,
  );

  const leaveTypeOptions = leave_type_for_current_employee.map((item) => ({
    value: item.leave_type.id,
    label: item.leave_type.name,
    balance_leave_count: item.paid_balance_count ?? item.available_count,
    unit: item.leave_type.unit,
    full_obj: item,
  }));

  const shiftInfo = useMemo(
    () => getShiftTimings(workScheduleData, profileData),
    [], // eslint-disable-line
  );

  const restrictedHolidayOptions = useMemo(() => {
    return (holidayData || [])
      .filter(
        (h) =>
          h.is_restricted === true &&
          h.work_schedule_id_list?.includes(profileData?.work_schedule_id) &&
          // when the date is locked, only a restricted holiday on that date is valid
          (!lockedISO || dayjs(h.date).format("YYYY-MM-DD") === lockedISO),
      )
      .map((h) => ({
        value: h.id,
        label: h.name?.trim(),
        date: h.date,
      }));
  }, [holidayData, profileData, lockedISO]);

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
            setLeaveBalanceCount(
              leave_type_record.paid_balance_count ?? leave_type_record.available_count,
            );
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
  ); // eslint-disable-line

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
      // With a locked date, day-unit leave keeps the locked date instead of
      // being cleared. (Restricted-holiday leave picks its own date; hour-unit
      // leave keeps the date fixed through disabledDate and only asks for time.)
      const lockDayUnit =
        !!lockedISO &&
        leaveTypeData?.type !== 1 &&
        leaveTypeData?.unit === leave_type_day_unit;

      setLeaveApplyObj((prev) => ({
        ...prev,
        leave_type_id: leaveTypeData?.id,
        unit: leaveTypeData?.unit,
        start: lockDayUnit ? lockedStoredDate : null,
        end: lockDayUnit ? lockedStoredDate : null,
        in_between_dates: lockDayUnit ? [lockedISO] : [],
        day_type: lockDayUnit ? 1 : null,
        requested_leave_count: lockDayUnit ? 1 : 0,
      }));
      setHourDiff("");
      setDaysCount(lockDayUnit ? 1 : "");
      setInBetweenDays(lockDayUnit ? [lockedISO] : []);
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

    // Locked date: every other date is disabled
    if (lockedISO) {
      return current.format("YYYY-MM-DD") !== lockedISO;
    }

    const minDate = dayjs().startOf("day").subtract(60, "day");
    const maxDate = dayjs().startOf("day").add(60, "day");

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

  const disabledDateForCompOff = (current) => {
    if (!current) return false;

    const minDate = dayjs().startOf("day").subtract(60, "day");
    const maxDate = dayjs().startOf("day").add(60, "day");

    if (current < minDate.startOf("day") || current > maxDate.endOf("day")) {
      return true;
    }

    const dayOfWeek = current.day();
    const currentISO = current.format("YYYY-MM-DD");

    return (
      WeekOffDays.includes(dayOfWeek) || appliedDates.includes(currentISO)
      // holidays NOT included here, so holidays remain selectable
    );
  };

  const handleDayType = (e) => {
    const value = e?.value || null;
    const updatedDaysCount = value === 1 ? 1 : value === 2 ? 0.5 : 0;

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

  // Locked date + hour-unit leave (permission): only the time is picked.
  // Builds the same DateTimeFormat string the DatePicker would emit so the
  // existing from/to handlers and hour-diff calculation are reused as-is.
  const handleLockedTimeChange = (time, which) => {
    const dateStr = time
      ? dayjs(
          `${lockedISO} ${time.format("HH:mm")}`,
          "YYYY-MM-DD HH:mm",
        ).format(DateTimeFormat)
      : "";
    if (which === "start") {
      handleFromDateChange(null, dateStr);
    } else {
      handleToDateChange(null, dateStr);
    }
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

  const handleHalfDayStartTimeChange = (time) => {
    if (!time) {
      setHalfDayStartTime(null);
      setHalfDayEndTime(null);
      return;
    }
    const datePart = leaveapplyObj?.start
      ? dayjs(leaveapplyObj.start).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");

    let startDT = dayjs(
      `${datePart} ${time.format("HH:mm")}`,
      "YYYY-MM-DD HH:mm",
    );

    setHalfDayStartTime(startDT);
    setHalfDayEndTime(null);
    setTimeError("");
  };

  const handleHalfDayEndTimeChange = (time) => {
    if (!time || !halfDayStartTime) return;

    const datePart = halfDayStartTime.format("YYYY-MM-DD");
    let endDT = dayjs(
      `${datePart} ${time.format("HH:mm")}`,
      "YYYY-MM-DD HH:mm",
    );

    if (endDT.isBefore(halfDayStartTime) || endDT.isSame(halfDayStartTime)) {
      if (shiftInfo?.crossesMidnight) {
        endDT = endDT.add(1, "day");
      } else {
        setTimeError("End time cannot be before or equal to start time.");
        return;
      }
    }

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

  const computedHalfDayHours = useMemo(() => {
    if (!halfDayStartTime || !halfDayEndTime) return "0.00";
    const diffMinutes = halfDayEndTime.diff(halfDayStartTime, "minute");
    if (diffMinutes <= 0) return "0.00";
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }, [halfDayStartTime, halfDayEndTime]);

  const shiftBoundaryHint = useMemo(() => {
    if (!shiftInfo) return null;
    const label = shiftInfo.crossesMidnight
      ? `Night shift: ${shiftInfo.shiftStart} → next day ${shiftInfo.shiftEnd}`
      : `Shift: ${shiftInfo.shiftStart} – ${shiftInfo.shiftEnd}`;
    return label;
  }, [shiftInfo]);

  const currentUnit =
    selectedLeaveTypeObj?.leave_type?.unit || selectedLeaveTypeObj?.unit;

  const onSubmit = async (formValues) => {
    const values = { ...leaveapplyObj, reason: formValues.reason.trim() };
    if (isCompOffLeave && !compOffWorkDate) {
      setCompOffDateError("Please select the Work Date");
      toast.error("Please select the Work Date for Comp-Off leave");
      return;
    }
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

    setIsSubmitting(true);

    if (
      !finalLeaveObj.requested_leave_count ||
      finalLeaveObj.requested_leave_count === 0
    ) {
      toast.error("Selected Hour Can't Be Zero");
      setIsSubmitting(false);
      return;
    }

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
      setIsSubmitting(false);
    }
  };

  const toPickerDate = (value) =>
    value
      ? dayjs(ConvertDateFormat(ConvertISODateFormat(value)), DateFormat)
      : null;

  const toPickerDateTime = (value) =>
    value
      ? dayjs(
          ConvertToDateTimeFormat(ConvertToISODateTimeFormat(value)),
          DateTimeFormat,
        )
      : null;

  const renderDayDuration = () => (
    <Box>
      <FieldLabel>Day Duration</FieldLabel>
      <ToggleButtonGroup
        exclusive
        size="small"
        color="primary"
        value={leaveapplyObj?.day_type ?? null}
        onChange={(_, next) => {
          if (next === null) return;
          handleDayType({ value: next });
        }}
        sx={{ "& .MuiToggleButton-root": { px: 2, py: 0.75, fontSize: 13 } }}
      >
        {(day_type || []).map((o) => (
          <ToggleButton key={o.value} value={o.value}>
            {o.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );

  const showDayUnitPicker =
    !!currentUnit && currentUnit === leave_type_day_unit && !isRestrictedLeave;
  const showHourUnitPicker =
    !!currentUnit && currentUnit === leave_type_hour_unit;
  // Restricted leave takes its date from the chosen holiday, so it has no duration fields.
  const showDurationSection =
    !isRestrictedLeave &&
    (showDayUnitPicker || showHourUnitPicker || leaveapplyObj?.day_type === 2);

  const reasonField = (
    <FormTextField
      name="reason"
      control={control}
      label="Reason"
      placeholder="Enter Reason"
      required
      multiline
      minRows={3}
      maxRows={6}
      maxLength={REASON_MAX}
      sanitize={(v) => v.replace(/^\s+/, "").replace(REASON_CHARS, "")}
    />
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SidebarFormLayout
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel="Apply"
      onCancel={onCancel}
    >
      <Stack spacing={2.5}>
        <Controller
          name="leave_type_id"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Autocomplete
              options={leaveTypeOptions}
              value={
                leaveTypeOptions.find((o) => o.value === field.value) || null
              }
              getOptionLabel={(o) => o?.label ?? ""}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              noOptionsText="No records found"
              disableClearable
              onChange={(_, selected) => {
                field.onChange(selected ? selected.value : null);
                handleLeaveTypeChange(selected);
              }}
              onBlur={field.onBlur}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={field.ref}
                  label="Leave Type"
                  placeholder="Select Leave Type"
                  required
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          )}
        />

        {!!currentUnit && !isRestrictedLeave && !isCompOffLeave && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: 3,
              border: 1,
              borderColor: (t) => alpha(t.palette[balanceTone].main, 0.3),
              bgcolor: (t) => alpha(t.palette[balanceTone].main, 0.08),
            }}
          >
            <EventAvailableRoundedIcon fontSize="small" color={balanceTone} />
            <Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }}>
              Available balance
              {balanceTone === "error" && " · further leave will be unpaid"}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: `${balanceTone}.main` }}>
              {leaveBalanceCount === null || leaveBalanceCount === undefined
                ? "—"
                : `${leaveBalanceCount} ${currentUnit === leave_type_hour_unit ? "hrs" : "days"}`}
            </Typography>
          </Stack>
        )}

        {/* ── Restricted Holiday Selection ── */}
        {isRestrictedLeave && (
          <>
            <Autocomplete
              options={restrictedHolidayOptions}
              value={selectedRestrictedHoliday}
              getOptionLabel={(o) => o?.label ?? ""}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              disableClearable
              onChange={(_, selected) =>
                handleRestrictedHolidayChange(selected)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Restricted Holiday"
                  placeholder="Select Restricted Holiday"
                  required
                  helperText={
                    restrictedHolidayOptions.length === 0
                      ? lockedISO
                        ? "No restricted holiday falls on the selected date."
                        : "No restricted holidays available for your work schedule."
                      : undefined
                  }
                  slotProps={{
                    ...params.slotProps,
                    formHelperText: { sx: { color: "warning.main" } },
                  }}
                />
              )}
            />

            {leaveapplyObj?.start && (
              <TextField
                label="Date"
                value={ConvertDateFormat(leaveapplyObj.start)}
                disabled
              />
            )}
          </>
        )}
      </Stack>

      {showDurationSection && (
        <Stack spacing={2.5}>
          {/* ── Day-unit: date pickers ── */}
          {showDayUnitPicker &&
            (isCompOffLeave ? (
              <>
                <Box>
                  <FieldLabel>Leave Start Date / Leave End Date</FieldLabel>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DatePicker
                        name="start_date"
                        format={DateFormat}
                        placeholder="Start Date"
                        disabled={!!lockedISO}
                        disabledDate={disabledDate}
                        inputReadOnly={true}
                        // pointerEvents re-enables hover even though the disabled <td> ancestor has pointer-events: none
                        cellRender={renderDateCell({ pointerEvents: "auto" })}
                        style={ANT_PICKER_STYLE}
                        value={toPickerDate(leaveapplyObj?.start)}
                        onChange={(date, dateStr) => {
                          const isoDate = !dateStr
                            ? null
                            : ConvertISODateFormat(ConvertDateFormat(dateStr));
                          setLeaveApplyObj((prev) => ({
                            ...prev,
                            start: isoDate,
                            end: isoDate,
                            day_type: 1,
                            requested_leave_count: isoDate ? 1 : 0,
                            in_between_dates: isoDate ? [isoDate] : [],
                          }));
                          setDaysCount(isoDate ? 1 : "");
                          setCompOffWorkDate(null);
                          setCompOffDateError("");
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DatePicker
                        name="end_date"
                        format={DateFormat}
                        placeholder="End Date"
                        disabled={true}
                        style={ANT_PICKER_STYLE}
                        value={toPickerDate(leaveapplyObj?.end)}
                      />
                    </Grid>
                  </Grid>
                  <FieldHint>
                    {lockedISO
                      ? "Leave date is fixed to the selected attendance date"
                      : "End Date auto-selects same as Start Date"}
                  </FieldHint>
                </Box>

                {leaveapplyObj?.start && (
                  <Box>
                    <FieldLabel>Worked On (Comp-Off Day)</FieldLabel>
                    <DatePicker
                      name="comp_off_work_date"
                      format={DateFormat}
                      placeholder="Select Work Date"
                      disabledDate={disabledDateForCompOff}
                      inputReadOnly={true}
                      cellRender={renderDateCell()}
                      renderExtraFooter={pickerLegend}
                      style={ANT_PICKER_STYLE}
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
                      <FieldHint error>{compOffDateError}</FieldHint>
                    ) : (
                      <FieldHint>
                        Please select the Work Date (day you worked for this
                        comp-off)
                      </FieldHint>
                    )}
                  </Box>
                )}

                {leaveapplyObj?.start && compOffWorkDate && renderDayDuration()}
              </>
            ) : (
              <>
                <Box>
                  <FieldLabel>Select Date</FieldLabel>
                  <RangePicker
                    name="multiple_date"
                    format={DateFormat}
                    placeholder={["Start Date", "End Date"]}
                    disabled={!!lockedISO}
                    disabledDate={disabledDate}
                    inputReadOnly={true}
                    cellRender={renderDateCell()}
                    renderExtraFooter={pickerLegend}
                    style={ANT_PICKER_STYLE}
                    onChange={handleMultiDayChange}
                    value={
                      !!leaveapplyObj?.start && !!leaveapplyObj?.end
                        ? [
                            toPickerDate(leaveapplyObj?.start),
                            toPickerDate(leaveapplyObj?.end),
                          ]
                        : null
                    }
                  />
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mt: 0.75 }}
                  >
                    <FieldHint>
                      {lockedISO
                        ? "Leave date is fixed to the selected attendance date"
                        : "Please select Start & End Date"}
                    </FieldHint>
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={`${daysCount || 0} Days`}
                    />
                  </Stack>
                </Box>

                {(daysCount === 1 || daysCount === 0.5) && renderDayDuration()}
              </>
            ))}

          {/* ── Half-day time pickers (day_type === 2) ── */}
          {leaveapplyObj?.day_type === 2 && (
            <Stack spacing={2}>
              {shiftBoundaryHint && (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <AccessTimeRoundedIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {shiftBoundaryHint}
                  </Typography>
                </Stack>
              )}

              {halfDayBoundaries && (
                <Box>
                  <FieldLabel>Quick Select Half</FieldLabel>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Button
                      data-testid="leave-application-first-half-button"
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setHalfDayStartTime(halfDayBoundaries.firstHalfStart);
                        setHalfDayEndTime(halfDayBoundaries.firstHalfEnd);
                        setTimeError("");
                      }}
                    >
                      First Half (
                      {halfDayBoundaries.firstHalfStart.format("HH:mm")}
                      &nbsp;–&nbsp;
                      {halfDayBoundaries.firstHalfEnd.format("HH:mm")})
                    </Button>
                    <Button
                      data-testid="leave-application-second-half-button"
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        setHalfDayStartTime(halfDayBoundaries.secondHalfStart);
                        setHalfDayEndTime(halfDayBoundaries.secondHalfEnd);
                        setTimeError("");
                      }}
                    >
                      Second Half (
                      {halfDayBoundaries.secondHalfStart.format("HH:mm")}
                      &nbsp;–&nbsp;
                      {halfDayBoundaries.secondHalfEnd.format("HH:mm")}
                      {shiftInfo?.crossesMidnight ? " +1d" : ""})
                    </Button>
                  </Stack>
                </Box>
              )}

              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <TimePicker
                    {...TIME_PICKER_PROPS}
                    label="Start Time"
                    value={halfDayStartTime || null}
                    onChange={(time) => {
                      if (time && !time.isValid()) return;
                      handleHalfDayStartTimeChange(time);
                    }}
                    slotProps={timeFieldSlotProps(true)}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <TimePicker
                    {...TIME_PICKER_PROPS}
                    label={
                      shiftInfo?.crossesMidnight
                        ? "End Time (may be next day)"
                        : "End Time"
                    }
                    value={
                      halfDayEndTime
                        ? dayjs(halfDayEndTime.format("HH:mm"), "HH:mm")
                        : null
                    }
                    disabled={!halfDayStartTime}
                    onChange={(time) => {
                      if (time && !time.isValid()) return;
                      handleHalfDayEndTimeChange(time);
                    }}
                    slotProps={timeFieldSlotProps(false)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <ReadOnlyField
                    label="Total Hours"
                    value={`${computedHalfDayHours} h`}
                    helperText={
                      shiftInfo?.crossesMidnight &&
                      halfDayStartTime &&
                      halfDayEndTime &&
                      halfDayEndTime.date() !== halfDayStartTime.date()
                        ? "(next day)"
                        : undefined
                    }
                  />
                </Grid>
              </Grid>

              {timeError && <FieldHint error>{timeError}</FieldHint>}

              {halfDayBoundaries && (
                <Typography variant="caption" color="text.secondary">
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
                </Typography>
              )}
            </Stack>
          )}

          {/* ── Hour-unit + locked date: fixed date, time-only pickers ── */}
          {showHourUnitPicker && !!lockedISO && (
            <Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Date"
                    value={dayjs(lockedISO).format(DateFormat)}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <ReadOnlyField
                    label="Total Hours"
                    value={`${hourDiff || "00:00"} h`}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TimePicker
                    {...TIME_PICKER_PROPS}
                    label="Start Time"
                    value={toPickerDateTime(leaveapplyObj?.start)}
                    onChange={(time) => {
                      if (time && !time.isValid()) return;
                      handleLockedTimeChange(time, "start");
                    }}
                    slotProps={timeFieldSlotProps(true)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TimePicker
                    {...TIME_PICKER_PROPS}
                    label="End Time"
                    value={toPickerDateTime(leaveapplyObj?.end)}
                    onChange={(time) => {
                      if (time && !time.isValid()) return;
                      handleLockedTimeChange(time, "end");
                    }}
                    slotProps={timeFieldSlotProps(true)}
                  />
                </Grid>
              </Grid>
              <FieldHint>
                Date is fixed to the selected attendance date. Please select
                the time
              </FieldHint>
            </Box>
          )}

          {/* ── Hour-unit: datetime pickers ── */}
          {showHourUnitPicker && !lockedISO && (
            <Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Start</FieldLabel>
                  <DatePicker
                    name="start"
                    placeholder="Select Start Time"
                    showTime={{
                      minuteStep: 1,
                      format: "HH:mm",
                    }}
                    format={DateTimeFormat}
                    disabledDate={disabledDate}
                    defaultPickerValue={
                      lockedISO ? dayjs(lockedISO) : undefined
                    }
                    inputReadOnly={true}
                    cellRender={renderDateCell()}
                    style={ANT_PICKER_STYLE}
                    onChange={handleFromDateChange}
                    value={toPickerDateTime(leaveapplyObj?.start)}
                    showNow={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>End</FieldLabel>
                  <DatePicker
                    name="end"
                    placeholder="Select End Time"
                    showTime={{
                      minuteStep: 1,
                      format: "HH:mm",
                    }}
                    format={DateTimeFormat}
                    disabledDate={disabledDate}
                    defaultPickerValue={
                      lockedISO ? dayjs(lockedISO) : undefined
                    }
                    inputReadOnly={true}
                    cellRender={renderDateCell()}
                    style={ANT_PICKER_STYLE}
                    onChange={handleToDateChange}
                    value={toPickerDateTime(leaveapplyObj?.end)}
                    showNow={false}
                  />
                </Grid>
              </Grid>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{ mt: 0.75 }}
              >
                <FieldHint>
                  {lockedISO
                    ? "Date is fixed to the selected attendance date. Please select the time"
                    : "Please select Date and Hour"}
                </FieldHint>
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={`${hourDiff || "00:00"} h`}
                />
              </Stack>
            </Box>
          )}
        </Stack>
      )}

      {reasonField}
    </SidebarFormLayout>
  );
};

export default ApplyLeaveForm;
