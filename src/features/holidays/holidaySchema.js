import * as Yup from "yup";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const HOLIDAY_NAME_MAX = 150;
export const HOLIDAY_DESCRIPTION_MAX = 200;
export const HOLIDAY_MIN_DATE = dayjs("1900-01-01");
export const holidayMaxDate = () => dayjs().add(1, "year");

export const sanitizeHolidayName = (v) =>
  v.replace(/^\s+/, "").replace(/[^A-Za-z\s'-]/g, "");

export const sanitizeHolidayDescription = (v) =>
  v.replace(/^\s+/, "").replace(/[^A-Za-z0-9\s.,!?'"@\-_;:/&()\n]/g, "");

export const holidaySchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Please enter holiday name")
    .max(HOLIDAY_NAME_MAX, `Holiday name must not exceed ${HOLIDAY_NAME_MAX} characters`)
    .matches(
      /^[A-Za-z\s'-]+$/,
      "Only letters, spaces, apostrophes (') and hyphens (-) are allowed",
    ),
  date: Yup.string()
    .required("Select a date")
    .test("valid-date", "Enter a valid date", (value) => {
      const d = dayjs(value, "YYYY-MM-DD", true);
      return d.isValid();
    })
    .test("min-date", "Year must be 1900 or later", (value) =>
      !dayjs(value).isBefore(HOLIDAY_MIN_DATE, "day"),
    )
    .test("max-date", "Date cannot exceed one year from today", (value) =>
      !dayjs(value).isAfter(holidayMaxDate(), "day"),
    ),
  work_schedule_id_list: Yup.array()
    .of(Yup.number())
    .min(1, "Select at least one work schedule"),
  is_restricted: Yup.boolean(),
  description: Yup.string()
    .trim()
    .max(
      HOLIDAY_DESCRIPTION_MAX,
      `Description must not exceed ${HOLIDAY_DESCRIPTION_MAX} characters`,
    ),
});
