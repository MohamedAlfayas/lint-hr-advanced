import * as Yup from "yup";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DateFormat } from "../../../common/constant/Constants";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";

dayjs.extend(customParseFormat);

export const API_DATE_FORMAT = "YYYY-MM-DD";
export const MIN_DATE = dayjs("1900-01-01");

export const EMP_ID_MAX = 50;
export const NAME_MAX = 50;
export const EMAIL_MAX = 100;

export const EMP_ID_HINT =
  "Uppercase letters and numbers only. Hyphen (-) or underscore (_) allowed only in the middle, not at start/end.";
export const NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
export const NAME_ERROR_MSG =
  "Name cannot start or end with a hyphen (-) or apostrophe ('). Only alphabets, spaces, hyphens, and apostrophes are allowed.";

export const sanitizeEmpId = (v) =>
  v
    .toUpperCase()
    .replace(/[^A-Z0-9_ -]/g, "")
    .replace(/^\s+/, "");
export const sanitizeName = (v) => v.replace(/[^A-Za-z\s'-]/g, "");
export const sanitizePhone = (v) => v.replace(/[^0-9]/g, "").slice(0, 10);

export const EMPLOYMENT_TYPE = { PROBATION: 1, FULL_TIME: 2 };

export const getRootDepartment = (depOptions) =>
  (depOptions || []).find((d) => d.is_root === true);

/** Root/top-level department → Reporting Manager optional and Role locked to Admin. */
export const includesRootDepartment = (deptIds, depOptions) => {
  const root = getRootDepartment(depOptions);
  return !!root && Array.isArray(deptIds) && deptIds.includes(root.id);
};

// Read on every validation so the schema always sees the current departments.
const isReportingManagerOptional = (deptIds) =>
  includesRootDepartment(deptIds, GetLocalStorageData("department") || []);

const nameSchema = (label, testName) =>
  Yup.string()
    .trim()
    .required(`Please enter ${label}`)
    .nullable()
    .test(
      testName,
      `${label.charAt(0).toUpperCase()}${label.slice(1)} can contain spaces, hyphens (-), and apostrophes (') only between letters.`,
      (value) => {
        if (!value || value.trim() === "") return true;
        return NAME_REGEX.test(value);
      },
    )
    .min(1, `Please enter ${label}`)
    .max(
      NAME_MAX,
      `${label.charAt(0).toUpperCase()}${label.slice(1)} cannot exceed ${NAME_MAX} characters`,
    );

const parseIso = (value) => dayjs(value, API_DATE_FORMAT, true);

export const employeeSchema = Yup.object({
  emp_id: Yup.string()
    .trim()
    .matches(
      /^[A-Z0-9](?:[A-Z0-9_-]*[A-Z0-9])?$/,
      "Employee ID can contain hyphens (-) and underscores (_) only between letters or numbers.",
    )
    .required("Please enter employee ID")
    .max(EMP_ID_MAX, "Employee ID cannot exceed 50 characters"),

  first_name: nameSchema("first name", "first-name-validation"),
  last_name: nameSchema("last name", "last-name-validation"),

  email: Yup.string()
    .trim()
    .required("Please enter email")
    .transform((value) => (value ? value.trim().toLowerCase() : value))
    .max(EMAIL_MAX, "Email must not exceed 100 characters")
    .matches(
      /^[a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,13}$/,
      "Enter a valid email address.",
    ),

  gender: Yup.number()
    .required("Please select gender")
    .min(1, "Please select gender"),

  dob: Yup.string()
    .trim()
    .required("Please select date of birth")
    .test("dob-min-year", "Year must be 1900 or later", (value) => {
      if (!value) return false;
      const d = parseIso(value);
      return !d.isValid() || d.year() >= 1900;
    })
    .test("dob-not-future", "Date of birth cannot be a future date", (value) => {
      if (!value) return false;
      const d = parseIso(value);
      return d.isValid() && !d.isAfter(dayjs(), "day");
    })
    .test("dob-min-age-15", "Employee must be at least 15 years old", (value) => {
      if (!value) return false;
      const d = parseIso(value);
      return d.isValid() && !d.isAfter(dayjs().subtract(15, "year"), "day");
    }),

  joining_date: Yup.string()
    .trim()
    .required("Please select joining date")
    .test("joining-min-year", "Year must be 1900 or later", (value) => {
      if (!value) return true;
      const d = parseIso(value);
      return !d.isValid() || d.year() >= 1900;
    })
    .test(
      "joining-within-range",
      "Joining date cannot be more than 1 year from today",
      (value) => {
        if (!value) return true;
        let d = parseIso(value);
        if (!d.isValid()) d = dayjs(value, DateFormat, true);
        if (!d.isValid()) return false;
        if (d.year() < 1900) return true;

        const min = MIN_DATE.startOf("day");
        const max = dayjs().add(1, "year").endOf("day");
        return !d.isBefore(min, "day") && !d.isAfter(max, "day");
      },
    )
    .test(
      "minimum-age-at-joining",
      "Employee must be at least 15 years old on joining date",
      function (joiningDate) {
        const { dob } = this.parent;
        if (!dob || !joiningDate) return true;

        const dobDate = parseIso(dob);
        const dojDate = parseIso(joiningDate);
        if (!dobDate.isValid() || !dojDate.isValid()) return true;

        const minimumJoiningDate = dobDate.add(15, "year");
        return (
          dojDate.isSame(minimumJoiningDate, "day") ||
          dojDate.isAfter(minimumJoiningDate, "day")
        );
      },
    ),

  contact_number: Yup.string()
    .required("Please Enter Phone Number")
    .matches(/^[0-9]+$/, "Phone number must contain digits only")
    .length(10, "Phone number must be 10 digits"),

  role_id: Yup.number().required("Please select role").min(1, "Please select role"),

  branch_id_list: Yup.array().min(1, "Please select branch"),

  primary_department_id_list: Yup.array().min(1, "Please select department"),

  work_schedule_id: Yup.number()
    .required("Please select work schedule")
    .min(1, "Please select work schedule"),

  reporting_manager_id: Yup.number()
    .nullable()
    .test(
      "reporting-manager-required",
      "Please select reporting manager",
      function (value) {
        if (isReportingManagerOptional(this.parent.primary_department_id_list)) return true;
        return !!value;
      },
    ),

  allowed_attendance_methods: Yup.object().test(
    "at-least-one-method",
    "Please select at least one attendance method",
    (value) => !!value && Object.values(value).some((v) => v === true),
  ),

  cf_values: Yup.array().of(
    Yup.object().shape({
      value: Yup.mixed().when("is_required", {
        is: true,
        then: (schema) =>
          schema.test(
            "cf-required",
            "This field is required",
            (value) =>
              value !== undefined && value !== null && String(value).trim() !== "",
          ),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
  ),
});

/** Accepts `YYYY-MM-DD` or `DD-MM-YYYY` and returns `YYYY-MM-DD` (or ""). */
export const toIsoOrEmpty = (val) => {
  if (!val || val === "-") return "";
  const asIso = dayjs(val, API_DATE_FORMAT, true);
  if (asIso.isValid()) return asIso.format(API_DATE_FORMAT);
  const asDisplay = dayjs(val, DateFormat, true);
  if (asDisplay.isValid()) return asDisplay.format(API_DATE_FORMAT);
  return "";
};

/** Employee object as the original form kept it: dates normalised, role resolved. */
export const toEmployeeObj = (obj, { depOptions, adminRole }) => {
  const thisRoleId =
    obj?.role !== null && obj?.role !== undefined && obj?.role !== ""
      ? obj?.role?.id
      : 0;
  const roleId =
    includesRootDepartment(obj?.primary_department_id_list, depOptions) && adminRole
      ? adminRole.id
      : thisRoleId;

  return {
    ...obj,
    dob: toIsoOrEmpty(obj?.dob),
    joining_date: toIsoOrEmpty(obj?.joining_date),
    role_id: roleId,
    employment_type: obj?.employment_type || EMPLOYMENT_TYPE.FULL_TIME,
    probation_end_date: toIsoOrEmpty(obj?.probation_end_date),
  };
};

/** Editable subset of the employee object held by react-hook-form. */
export const toFormValues = (emp) => ({
  emp_id: emp?.emp_id ?? "",
  first_name: emp?.first_name ?? "",
  last_name: emp?.last_name ?? "",
  email: emp?.email ?? "",
  gender: emp?.gender ?? 0,
  dob: emp?.dob ?? "",
  contact_number:
    emp?.contact_number !== null && emp?.contact_number !== undefined
      ? String(emp.contact_number)
      : "",
  branch_id_list: emp?.branch_id_list ?? [],
  primary_department_id_list: emp?.primary_department_id_list ?? [],
  reporting_manager_id: emp?.reporting_manager_id,
  role_id: emp?.role_id ?? 0,
  work_schedule_id: emp?.work_schedule_id ?? 0,
  joining_date: emp?.joining_date ?? "",
  employment_type: emp?.employment_type ?? EMPLOYMENT_TYPE.FULL_TIME,
  probation_end_date: emp?.probation_end_date ?? "",
  profile_timezone: emp?.profile_timezone,
  allow_attendance_outside_the_range: emp?.allow_attendance_outside_the_range,
  outside_range_notes_required: emp?.outside_range_notes_required,
  can_web_checkin: emp?.can_web_checkin,
  allowed_attendance_methods: emp?.allowed_attendance_methods,
  cf_values: emp?.cf_values,
});

/**
 * Overlays submitted form values on the employee object. Keys the form never
 * had and the user never set stay absent, so the payload keeps its old shape.
 */
export const mergeEmployeeValues = (emp, values) => {
  const merged = { ...emp };
  Object.entries(values || {}).forEach(([key, val]) => {
    if (val !== undefined || key in merged) merged[key] = val;
  });
  return merged;
};
