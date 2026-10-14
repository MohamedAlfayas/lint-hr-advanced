import React, { useEffect, useMemo, useState } from "react";
import Flatpickr from "react-flatpickr";
import { Avatar, Box, Card, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { setHoliday } from "../../redux/reducers/ChildReducer/HolidayReducer";

const MIN_DATE = new Date(1900, 0, 1);
const MAX_DATE = new Date(new Date().getFullYear() + 1, 11, 31);

const Legend = ({ color, label, soft }) => (
  <Stack direction="row" spacing={0.75} alignItems="center">
    <Box
      sx={(theme) => ({
        width: 10,
        height: 10,
        borderRadius: "3px",
        bgcolor: soft ? alpha(theme.palette.primary.main, 0.15) : color,
        border: soft ? `1px solid ${theme.palette.primary.main}` : 0,
      })}
    />
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Stack>
);

// Flatpickr inline calendar restyled to match the MUI theme.
const calendarSx = (theme) => ({
  "& .flatpickr-input": { display: "none" },
  "& .flatpickr-calendar.inline": {
    width: "100% !important",
    boxShadow: "none !important",
    border: 0,
    background: "transparent",
    fontFamily: "inherit",
  },
  "& .flatpickr-months": {
    position: "relative",
    alignItems: "center",
    backgroundColor: "transparent !important",
    borderRadius: 0,
    mb: 1,
    "& .flatpickr-month": { height: 40, color: theme.palette.text.primary, fill: theme.palette.text.primary },
    "& .flatpickr-prev-month, & .flatpickr-next-month": {
      position: "static",
      height: 32,
      width: 32,
      p: "8px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: theme.palette.text.secondary,
      fill: theme.palette.text.secondary,
      "&:hover": { bgcolor: theme.palette.action.hover },
      "&:hover svg": { fill: `${theme.palette.primary.main} !important` },
      "& svg": { width: 12, height: 12, fill: `${theme.palette.text.secondary} !important` },
    },
  },
  "& .flatpickr-current-month": {
    position: "static",
    width: "100%",
    p: 0,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0.5,
    fontSize: 15,
    fontWeight: 600,
    color: theme.palette.text.primary,
    "& .flatpickr-monthDropdown-months, & input.cur-year": { color: theme.palette.text.primary },
    "& .flatpickr-monthDropdown-months option": {
      color: theme.palette.text.primary,
      background: theme.palette.background.paper,
    },
    "& .flatpickr-monthDropdown-months": {
      fontWeight: 600,
      fontSize: 15,
      border: 0,
      borderRadius: 1,
      px: 0.5,
      height: 32,
      background: "transparent",
      "&:hover": { bgcolor: theme.palette.action.hover },
    },
    "& .numInputWrapper": { width: "5ch" },
    "& input.cur-year": { fontWeight: 600, fontSize: 15 },
  },
  "& .flatpickr-innerContainer, & .flatpickr-rContainer, & .flatpickr-days, & .flatpickr-weekdays": {
    width: "100% !important",
  },
  "& .flatpickr-weekdays": {
    background: "transparent !important",
    height: 32,
    "& span.flatpickr-weekday": {
      background: "transparent !important",
      color: theme.palette.text.secondary,
      fontSize: 11.5,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
  },
  "& .dayContainer": {
    width: "100% !important",
    minWidth: "100% !important",
    maxWidth: "100% !important",
    gap: "4px 0",
  },
  "& .flatpickr-day": {
    flexBasis: "14.2857%",
    maxWidth: "none",
    height: 38,
    lineHeight: "38px",
    border: 0,
    borderRadius: "10px",
    margin: 0,
    fontSize: 13.5,
    fontWeight: 500,
    color: theme.palette.text.primary,
    "&:hover": { background: theme.palette.action.hover },
    "&.prevMonthDay, &.nextMonthDay": { color: theme.palette.text.disabled },
    "&.selected, &.selected:hover": {
      background: "transparent",
      color: theme.palette.text.primary,
      boxShadow: `inset 0 0 0 1.5px ${theme.palette.primary.main}`,
    },
    "&.is-holiday": {
      background: alpha(theme.palette.primary.main, 0.12),
      color: theme.palette.primary.main,
      fontWeight: 700,
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: 5,
        left: "50%",
        width: 4,
        height: 4,
        ml: "-2px",
        borderRadius: "50%",
        background: theme.palette.primary.main,
      },
    },
    "&.today": {
      background: `${theme.palette.success.main} !important`,
      color: `${theme.palette.success.contrastText} !important`,
      fontWeight: 700,
      boxShadow: `0 4px 10px ${alpha(theme.palette.success.main, 0.35)}`,
      "&::after": { background: theme.palette.success.contrastText },
    },
  },
});

const HolidayCalenderAPi = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setHoliday(GetLocalStorageData("holiday")));
  }, [dispatch]);

  const { holiday_data } = useSelector((state) => state.HolidayReducer);

  const holidays = holiday_data || [];

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const filteredHolidays = holidays.filter((item) => {
    const holidayDate = new Date(item.date);
    return (
      holidayDate.getMonth() === currentMonth &&
      holidayDate.getFullYear() === currentYear
    );
  });

  const flatpickrOptions = useMemo(
    () => ({
      dateFormat: "d M, Y",
      inline: true,
      minDate: MIN_DATE,
      maxDate: MAX_DATE,

      onMonthChange: (selectedDates, dateStr, instance) => {
        setCurrentMonth(instance.currentMonth);
        setCurrentYear(instance.currentYear);
      },

      onYearChange: (selectedDates, dateStr, instance) => {
        setCurrentMonth(instance.currentMonth);
        setCurrentYear(instance.currentYear);
      },

      onDayCreate: (dObj, dStr, fp, dayElem) => {
        const year = dayElem.dateObj.getFullYear();
        const month = String(dayElem.dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dayElem.dateObj.getDate()).padStart(2, "0");

        const currentDate = `${year}-${month}-${day}`;

        const holiday = holidays.find((item) => item.date === currentDate);

        if (holiday) {
          dayElem.classList.add("is-holiday");
          dayElem.title = holiday.name;
        }
      },
    }),
    [holidays] // only rebuild options when holiday data actually changes
  );


  return (
    <div className="col-xxl-4 col-xl-4">
      <Card sx={{ mb: 3, overflow: "hidden" }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: "divider" }}
        >
          <CalendarMonthRoundedIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Schedules
          </Typography>
        </Stack>

        <Box sx={{ p: 2 }}>
          <Box sx={calendarSx}>
            <Flatpickr className="form-control" options={flatpickrOptions} />
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 1.5, px: 0.5 }}>
            <Legend color="success.main" label="Today" />
            <Legend color="primary.main" label="Holiday" soft />
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 3, mb: 1.5 }}>
            <Typography
              variant="overline"
              sx={{ fontWeight: 600, letterSpacing: 0.6, color: "text.secondary", lineHeight: 1.6 }}
            >
              Holidays · {dayjs().month(currentMonth).format("MMMM")} {currentYear}
            </Typography>
            <Chip size="small" label={filteredHolidays.length} color="primary" sx={{ fontWeight: 600 }} />
          </Stack>

          {filteredHolidays.length > 0 ? (
            <Stack spacing={1}>
              {filteredHolidays.map((holiday) => {
                const d = dayjs(holiday.date);
                const diff = d.startOf("day").diff(dayjs().startOf("day"), "day");
                const status =
                  diff === 0
                    ? { label: "Today", color: "success" }
                    : diff > 0
                      ? { label: `In ${diff} days`, color: "primary" }
                      : { label: "Past", color: "default" };
                return (
                  <Stack
                    key={holiday.id}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      border: 1,
                      borderColor: "divider",
                      transition: "background-color .15s",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 44,
                        height: 44,
                        flexDirection: "column",
                        lineHeight: 1,
                        bgcolor: diff < 0 ? "action.selected" : "primary.main",
                        color: diff < 0 ? "text.secondary" : "primary.contrastText",
                      }}
                    >
                      <Typography sx={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>
                        {d.format("MMM")}
                      </Typography>
                      <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{d.format("DD")}</Typography>
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap title={holiday.name}>
                        {holiday.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.format("dddd")}
                      </Typography>
                    </Box>
                    <Chip size="small" variant="outlined" color={status.color} label={status.label} />
                  </Stack>
                );
              })}
            </Stack>
          ) : (
            <Stack alignItems="center" spacing={0.5} sx={{ py: 3, color: "text.secondary" }}>
              <EventBusyRoundedIcon sx={{ fontSize: 36, opacity: 0.5 }} />
              <Typography variant="body2">No holidays this month</Typography>
            </Stack>
          )}
        </Box>
      </Card>
    </div>
  );
};

export default HolidayCalenderAPi;
