import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  hourOptions,
  minuteOptions,
  graceBreakMinuteOptions,
  maxBreakHourOptions,
  graceHourOptions,
  week_list,
} from "../../common/constant/Constants";
import {
  addWorkSchedule,
  editWorkSchedule,
} from "../../redux/reducers/ChildReducer/WorkScheduleReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { PostApi } from "../../common/api/PostApi";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";
import SidebarFormLayout from "../../shared/ui/SidebarFormLayout";
import {
  FormSection,
  FormSwitch,
  FormTextField,
  FormTimePicker,
  FormToggleGroup,
} from "../../shared/ui/form";

const NAME_MAX = 100;
const DESCRIPTION_MAX = 200;
const NAME_CHARS = /[^a-zA-Z0-9\s.,'_\-()&:;/]/g;
const DESCRIPTION_CHARS = /[^a-zA-Z0-9\s.,?!"'_\-()&:;/\\]/g;

const PARTIAL_HOURS = 1;
const TWENTY_FOUR_HOURS = 2;

const workScheduleOptions = [
  { label: "Partial Hours", value: PARTIAL_HOURS },
  { label: "24 Hours", value: TWENTY_FOUR_HOURS },
];

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_OFF = {
  e_day: "",
  s_hr: "00",
  s_min: "00",
  e_hr: "00",
  e_min: "00",
  is_day_on: false,
  total_work_duration: 0,
  break_duration: 0,
  total_work_duration_without_break: 0,
};

const pad2 = (v) => String(v ?? "00").padStart(2, "0");

// `start` / `end` exist only in form state (bound to the time pickers);
// the API receives s_hr / s_min / e_hr / e_min.
const withTimes = (d) => ({
  ...d,
  start: `${pad2(d.s_hr)}:${pad2(d.s_min)}`,
  end: `${pad2(d.e_hr)}:${pad2(d.e_min)}`,
});

const stripTimes = ({ start, end, ...d }) => d;

const initialWorkday = () =>
  WEEK_DAYS.map((day) =>
    withTimes({ id: 0, s_day: day, weekday: day, ...DAY_OFF }),
  );

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .matches(
      /^[A-Za-z0-9\s.,'_\-()&:;/]+$/,
      "Only alphabets, numbers, spaces and . , ' - _ ( ) & : ; / are allowed",
    )
    .min(1, "Work Schedule Name must be at least 1 characters")
    .max(NAME_MAX, "Work Schedule Name must not exceed 100 characters")
    .required("Please Enter Work Schedule Name")
    .test(
      "not-only-spaces",
      "Please Enter Work Schedule Name",
      (value) => !value || value.trim().length > 0,
    ),
  description: Yup.string()
    .trim()
    .max(DESCRIPTION_MAX, "Description must not exceed 200 characters")
    .matches(
      /^[A-Za-z0-9\s.,!?'"\-_()&:;/]*$/,
      "Only alphabets, numbers, spaces and . , ! ? ' \" - _ ( ) & : ; / are allowed",
    )
    .test(
      "not-only-spaces",
      "Description cannot contain only spaces",
      (value) => !value || value.trim().length > 0,
    ),
});

const toFormValues = (obj) => ({
  ...obj,
  name: obj?.name ?? "",
  description: obj?.description ?? "",
  workday: obj?.workday?.map(withTimes),
});

const getNextDay = (currentDay) => {
  const daysOfWeek = week_list.map((day) => day.label);
  const currentIndex = daysOfWeek.indexOf(currentDay);
  return daysOfWeek[(currentIndex + 1) % 7];
};

const calculateTotalWorkDuration = (wd_obj, break_duration) => {
  let startHour = parseInt(wd_obj.s_hr, 10);
  let startMinute = parseInt(wd_obj.s_min, 10);
  let endHour = parseInt(wd_obj.e_hr, 10);
  let endMinute = parseInt(wd_obj.e_min, 10);

  let e_day_name;

  // Night shift: end time on the next day
  if (
    endHour < startHour ||
    (endHour === startHour && endMinute < startMinute)
  ) {
    endHour += 24;
    e_day_name = getNextDay(wd_obj?.weekday);
  } else {
    e_day_name = wd_obj?.weekday;
  }

  const total_work_duration =
    endHour * 3600 + endMinute * 60 - (startHour * 3600 + startMinute * 60);

  return {
    ...wd_obj,
    e_day: e_day_name,
    total_work_duration,
    break_duration,
    total_work_duration_without_break:
      parseInt(total_work_duration) - parseInt(break_duration),
  };
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

const formatHrs = (seconds) =>
  `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(
    Math.floor((seconds % 3600) / 60),
  ).padStart(2, "0")} Hrs`;

/** Hours + minutes selects for a duration stored in seconds. */
const DurationField = ({ name, control, label, hint, hours, minutes }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => {
      const seconds = field.value || 0;
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const update = (nextH, nextM) =>
        field.onChange(parseInt(nextH, 10) * 3600 + parseInt(nextM, 10) * 60);

      return (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            {label}
            {hint && (
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                {hint}
              </Typography>
            )}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <TextField
              select
              label="Hours"
              value={hours.some((o) => o.value === h) ? h : ""}
              onChange={(e) => update(e.target.value, m)}
              onBlur={field.onBlur}
            >
              {hours.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Minutes"
              value={minutes.some((o) => o.value === m) ? m : ""}
              onChange={(e) => update(h, e.target.value)}
              onBlur={field.onBlur}
            >
              {minutes.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>
      );
    }}
  />
);

const WorkScheduleForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, watch, setValue, getValues } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  useEffect(() => {
    document.title = "WorkSchedule | Lint HR";
  }, []);

  // Side effects of user edits (type switch, shift time changes).
  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      if (type !== "change" || !name) return;

      if (name === "type") {
        setValue("workday", initialWorkday(), { shouldDirty: true });
        setValue("fullday_work_duration", 0, { shouldDirty: true });
        setValue("halfday_work_duration", 0, { shouldDirty: true });
        setValue("grace_time_duration", 0, { shouldDirty: true });
        setValue("maximum_break_duration", 0, { shouldDirty: true });
        setValue("has_ot", false, { shouldDirty: true });
        return;
      }

      const match = name.match(/^workday\.(\d+)\.(start|end)$/);
      if (match) {
        const index = Number(match[1]);
        const row = values.workday?.[index];
        if (!row) return;
        const [hr = "00", min = "00"] = (row[match[2]] || "00:00").split(":");
        const prefix = match[2] === "start" ? "s" : "e";
        setValue(
          `workday.${index}`,
          calculateTotalWorkDuration(
            { ...row, [`${prefix}_hr`]: hr, [`${prefix}_min`]: min },
            values.maximum_break_duration,
          ),
          { shouldDirty: true },
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const scheduleType = useWatch({ control, name: "type" });
  const scheduleName = useWatch({ control, name: "name" });
  const scheduleId = useWatch({ control, name: "id" });
  const status = useWatch({ control, name: "status" });
  const fulldayDuration = useWatch({ control, name: "fullday_work_duration" });
  const workday = useWatch({ control, name: "workday" }) || [];

  const handleDayToggle = (index, checked) => {
    const row = getValues(`workday.${index}`);
    setValue(
      `workday.${index}`,
      checked ? { ...row, is_day_on: true } : withTimes({ ...row, ...DAY_OFF }),
      { shouldDirty: true },
    );
  };

  const handleBulkSelect = (checked) => {
    setValue(
      "workday",
      (getValues("workday") || []).map((d) =>
        checked ? { ...d, is_day_on: true } : withTimes({ ...d, ...DAY_OFF }),
      ),
      { shouldDirty: true },
    );
  };

  const onSubmit = async (formValues) => {
    const values = {
      ...formValues,
      workday: (formValues.workday || []).map(stripTimes),
    };

    if (!validateDurations(values)) return;

    const filteredWorkdays = values.workday.filter(
      (d) => d.is_day_on === true && d.total_work_duration === 0,
    );
    const filteredDayon = values.workday.filter((d) => d.is_day_on === true);

    if (
      values.type == 1 &&
      (values.fullday_work_duration === 0 ||
        filteredWorkdays.length > 0 ||
        filteredDayon.length === 0)
    ) {
      toast.error("WorkSchedule Hour Can't Be Zero");
    } else if (values.type == 2 && values.fullday_work_duration == 0) {
      toast.error("WorkSchedule Hour Can't Be Zero");
    } else if (values.type == 2 && filteredDayon.length === 0) {
      toast.error("Please select at least one working day");
    } else {
      setIsSubmitting(true);
      const payload = { ...form_obj, ...values };
      const Api = await PostApi("/work-schedule/create/", payload, false);
      setIsSubmitting(false);
      if (Api.status && Api.status === 200) {
        if (payload.id === 0) {
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
    }
  };

  const isPartial = scheduleType === PARTIAL_HOURS;
  const allDaysOn = workday.length > 0 && workday.every((d) => d.is_day_on);
  const someDaysOn = workday.some((d) => d.is_day_on);

  const renderShiftHours = (day) => {
    if (day.is_day_on === false) {
      return (
        <Typography variant="body2" color="info.main" fontWeight={600}>
          W/O
        </Typography>
      );
    }
    if (scheduleType === TWENTY_FOUR_HOURS) {
      return (
        <Typography variant="body2" color="success.main" fontWeight={600}>
          24:00 Hrs
        </Typography>
      );
    }
    const mismatch =
      fulldayDuration > day.total_work_duration ||
      day.total_work_duration > fulldayDuration;
    return (
      <Typography
        variant="body2"
        fontWeight={600}
        color={mismatch ? "error.main" : "success.main"}
      >
        {formatHrs(day.total_work_duration)}
      </Typography>
    );
  };

  const renderShiftWarning = (day) => {
    if (!day.is_day_on || scheduleType === TWENTY_FOUR_HOURS) return null;
    let message = null;
    if (fulldayDuration > day.total_work_duration) {
      message = "Shift is less than Full Day duration";
    } else if (day.total_work_duration > fulldayDuration) {
      message = "Shift exceeds Full Day duration";
    }
    if (!message) return null;
    return (
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
        <WarningAmberRoundedIcon sx={{ fontSize: 16 }} color="warning" />
        <Typography variant="caption" color="warning.main">
          {message}
        </Typography>
      </Stack>
    );
  };

  return (
    <SidebarFormLayout
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={scheduleId > 0 ? "Update" : "Save"}
    >
      <FormSection title="Basic details">
        <FormTextField
          name="name"
          control={control}
          label="Name"
          placeholder="Enter Work Schedule Name"
          required
          autoFocus
          maxLength={NAME_MAX}
          sanitize={(v) => v.replace(NAME_CHARS, "")}
          startIcon={<EventNoteOutlinedIcon fontSize="small" color="action" />}
        />
        <FormTextField
          name="description"
          control={control}
          label="Description"
          placeholder="Add a short note (optional)"
          multiline
          minRows={3}
          maxRows={6}
          maxLength={DESCRIPTION_MAX}
          sanitize={(v) => v.replace(DESCRIPTION_CHARS, "")}
        />
        <FormToggleGroup
          name="type"
          control={control}
          label="Work Schedule Type"
          options={workScheduleOptions}
          color="success"
        />
      </FormSection>

      {isPartial ? (
        <FormSection title="Work duration">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DurationField
                name="fullday_work_duration"
                control={control}
                label="Work Duration"
                hint="Full Day"
                hours={hourOptions}
                minutes={minuteOptions}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DurationField
                name="halfday_work_duration"
                control={control}
                label="Work Duration"
                hint="Half Day"
                hours={hourOptions}
                minutes={minuteOptions}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DurationField
                name="grace_time_duration"
                control={control}
                label="Grace Period"
                hours={graceHourOptions}
                minutes={graceBreakMinuteOptions}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DurationField
                name="maximum_break_duration"
                control={control}
                label="Maximum Total Break Duration"
                hours={maxBreakHourOptions}
                minutes={graceBreakMinuteOptions}
              />
            </Grid>
          </Grid>
          <FormSwitch
            name="has_ot"
            control={control}
            label="Enable OT"
            description="Track overtime for this work schedule"
          />
          {scheduleId > 0 && (
            <FormSwitch
              name="status"
              control={control}
              label="Status"
              description={status ? "Active" : "Inactive"}
            />
          )}
        </FormSection>
      ) : (
        <FormSection title="Work duration">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DurationField
                name="fullday_work_duration"
                control={control}
                label="Maximum Working Hours"
                hint="Full Day"
                hours={hourOptions}
                minutes={minuteOptions}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DurationField
                name="halfday_work_duration"
                control={control}
                label="Half Day Duration"
                hint="Half Day"
                hours={hourOptions}
                minutes={minuteOptions}
              />
            </Grid>
          </Grid>
        </FormSection>
      )}

      <FormSection
        title="Working days"
        description={
          <>
            When do your <i>{scheduleName}</i> employees work?
          </>
        }
        action={
          <FormControlLabel
            label="Select all"
            slotProps={{ typography: { fontSize: 13 } }}
            control={
              <Checkbox
                size="small"
                checked={allDaysOn}
                indeterminate={!allDaysOn && someDaysOn}
                onChange={(e) => handleBulkSelect(e.target.checked)}
              />
            }
          />
        }
        spacing={1.5}
      >
        {workday.map((day, index) => (
          <Paper
            key={day.weekday ?? index}
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
              ...(day.is_day_on && { borderColor: "success.main" }),
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <FormControlLabel
                label={
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {day.s_day}
                  </Typography>
                }
                control={
                  <Checkbox
                    size="small"
                    color="success"
                    checked={!!day.is_day_on}
                    onChange={(e) => handleDayToggle(index, e.target.checked)}
                  />
                }
              />
              {renderShiftHours(day)}
            </Stack>

            {day.is_day_on && scheduleType !== TWENTY_FOUR_HOURS && (
              <Grid container spacing={1.5} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormTimePicker
                    name={`workday.${index}.start`}
                    control={control}
                    label="Start time"
                    valueFormat="HH:mm"
                    minutesStep={10}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormTimePicker
                    name={`workday.${index}.end`}
                    control={control}
                    label="End time"
                    valueFormat="HH:mm"
                    minutesStep={10}
                  />
                </Grid>
              </Grid>
            )}
            {renderShiftWarning(day)}
          </Paper>
        ))}
      </FormSection>
    </SidebarFormLayout>
  );
};

export default WorkScheduleForm;
