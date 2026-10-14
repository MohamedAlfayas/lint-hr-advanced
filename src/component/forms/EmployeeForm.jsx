import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";
import { PostApi } from "../../common/api/PostApi";
import { Api } from "../../common/api/Api";
import { gender_options, timzone_options } from "../../common/constant/Constants";
import CountryList from "../../common/data/CountryList";
import indflag from "../../assets/images/flags/in.svg";
import { addEmployee, editEmployee } from "../../redux/reducers/ChildReducer/EmployeeReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import LocationModal from "../../pages/employee/LocationModal";
import SidebarFormLayout from "../../shared/ui/SidebarFormLayout";
import {
  FormAutocomplete,
  FormCheckbox,
  FormDatePicker,
  FormSection,
  FormSwitch,
  FormTextField,
} from "../../shared/ui/form";
import {
  API_DATE_FORMAT,
  EMAIL_MAX,
  EMP_ID_HINT,
  EMP_ID_MAX,
  EMPLOYMENT_TYPE,
  MIN_DATE,
  NAME_ERROR_MSG,
  NAME_MAX,
  NAME_REGEX,
  employeeSchema,
  includesRootDepartment,
  mergeEmployeeValues,
  sanitizeEmpId,
  sanitizeName,
  toEmployeeObj,
  toFormValues,
} from "./employee/employeeFormSchema";
import ProfilePhotoField from "./employee/ProfilePhotoField";
import ContactNumberField from "./employee/ContactNumberField";
import CustomFieldInputs from "./employee/CustomFieldInputs";
import EmployeeLocations from "./employee/EmployeeLocations";
import ReassignManagerDialog from "./employee/ReassignManagerDialog";
import { ReportingManagerField } from "./employee/EmployeeOption";
import { testId } from "../../shared/testing/testId";

const DEFAULT_COUNTRY = {
  id: 240,
  flagImg: indflag,
  countryName: "India",
  countryCode: "+91",
};

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
  "image/webp",
];

const ATTENDANCE_METHODS = [
  { key: "requires_face_verification", label: "Face Recognition" },
  { key: "requires_biometric_authentication", label: "Fingerprint" },
  { key: "allow_manual_checkin", label: "Manual Check-In" },
];

const getOptionName = (o) => o?.label ?? o?.name ?? "";
const getValueField = (o) => o?.value;

const EmployeeForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const { employeeData, branchOptions, depOptions, wsOptions, roleOptions } = useMemo(
    () => ({
      employeeData: GetLocalStorageData("employee") || [],
      branchOptions: GetLocalStorageData("branch") || [],
      depOptions: GetLocalStorageData("department") || [],
      wsOptions: GetLocalStorageData("work_schedule") || [],
      roleOptions: GetLocalStorageData("role") || [],
    }),
    [form_obj],
  );
  const adminRole = useMemo(
    () => roleOptions.find((r) => (r.name || "").toLowerCase() === "admin"),
    [roleOptions],
  );

  // Full employee object (incl. keys the form doesn't edit); the payload is
  // this object overlaid with the submitted form values.
  const [employeeObj, setEmployeeObj] = useState(() =>
    toEmployeeObj(form_obj, { depOptions, adminRole }),
  );
  const [employeeImage, setEmployeeImage] = useState(null);
  const [contactCountry, setContactCountry] = useState(DEFAULT_COUNTRY);
  const [reportingManagerOptions, setReportingManagerOptions] = useState([]);
  const [empIdApiError, setEmpIdApiError] = useState("");
  const [attendanceError, setAttendanceError] = useState("");
  const [defaultProbationMonths, setDefaultProbationMonths] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState(null);
  const [showRMModal, setShowRMModal] = useState(false);
  const [TeamsToBeUpdated, setTeamsToBeUpdated] = useState([]);
  const pendingValuesRef = useRef(null);

  const isExistingEmployee = !!(form_obj?.id && form_obj.id !== 0);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    setError,
    setFocus,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm({
    resolver: yupResolver(employeeSchema),
    mode: "onTouched",
    defaultValues: toFormValues(employeeObj),
  });

  const firstName = useWatch({ control, name: "first_name" });
  const deptIds = useWatch({ control, name: "primary_department_id_list" });
  const employmentType = useWatch({ control, name: "employment_type" });

  const isRoleLocked = includesRootDepartment(deptIds, depOptions);
  const isReportingManagerOptional = includesRootDepartment(deptIds, depOptions);

  const today = dayjs().startOf("day");
  const maxDobForMinAge = today.subtract(15, "year");
  const maxJoiningDate = dayjs().add(1, "year").endOf("day");

  const GetReportingManager = async (valid_dep_ids) => {
    if (!valid_dep_ids || valid_dep_ids.length === 0) {
      setReportingManagerOptions([]);
      return;
    }
    try {
      const ApiRes = await PostApi(
        "employee/get-employee-list-for-reporting-manager/",
        { dep_id: valid_dep_ids },
        false,
      );
      if (ApiRes && ApiRes.status === 200) {
        const response = ApiRes?.data?.data || [];
        setReportingManagerOptions(
          employeeData.filter((d) => d.id !== form_obj.id && response.includes(d.id)),
        );
      } else {
        setReportingManagerOptions([]);
      }
    } catch (err) {
      console.error("GetReportingManager failed:", err);
      setReportingManagerOptions([]);
    }
  };

  useEffect(() => {
    const emp = toEmployeeObj(form_obj, { depOptions, adminRole });
    setEmployeeObj(emp);
    reset(toFormValues(emp));
    setEmployeeImage(null);
    setEmpIdApiError("");
    setAttendanceError("");
    pendingValuesRef.current = null;

    form_obj?.primary_department_id_list?.length
      ? GetReportingManager(form_obj?.primary_department_id_list)
      : setReportingManagerOptions([]);

    setContactCountry(
      (form_obj?.country_code &&
        CountryList.find((d) => d.countryCode === form_obj.country_code)) ||
        DEFAULT_COUNTRY,
    );
  }, [form_obj, depOptions, adminRole, reset]);

  useEffect(() => {
    if (form_obj?.id !== 0) return undefined;
    const timer = setTimeout(() => setFocus("emp_id"), 100);
    return () => clearTimeout(timer);
  }, [form_obj?.id, setFocus]);

  // Active probation policy default, used to auto-fill the probation end date.
  useEffect(() => {
    Api({ method: "GET", url: "payroll/probation-policy/" })
      .then((res) => {
        const latest = (res?.data?.data || [])[0];
        setDefaultProbationMonths(latest ? latest.default_probation_months || 0 : 0);
      })
      .catch(() => setDefaultProbationMonths(0));
  }, []);

  const checkEmpIdExists = (val) => {
    const trimmed = (val || "").trim().toUpperCase();
    if (!trimmed) {
      setEmpIdApiError("");
      return;
    }
    const isDuplicate = employeeData.some(
      (emp) =>
        emp.emp_id && emp.emp_id.toUpperCase() === trimmed && emp.id !== employeeObj.id,
    );
    setEmpIdApiError(isDuplicate ? `Employee ID ${trimmed} already exists` : "");
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only image files are allowed");
      setEmployeeImage(null);
      setEmployeeObj((prev) => ({ ...prev, profile_url: "" }));
      e.target.value = "";
      return;
    }

    setEmployeeImage(file);
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      setEmployeeObj((prev) => ({ ...prev, profile_url: readerEvent.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCountryChange = (item) => {
    setEmployeeObj((prev) => ({ ...prev, country_code: item.countryCode }));
    setContactCountry(item);
  };

  // Drops departments that are children of another selected department.
  const handlePrimaryDepChange = (selected, onChange) => {
    const valid_dep_ids = [];
    for (let i = 0; i < selected.length; i++) {
      let is_child = false;
      for (let j = 0; j < selected.length; j++) {
        if (i !== j && (selected[j].child_id_list || []).includes(selected[i].id)) {
          is_child = true;
        }
      }
      if (!is_child) valid_dep_ids.push(selected[i].id);
    }
    valid_dep_ids.length
      ? GetReportingManager(valid_dep_ids)
      : setReportingManagerOptions([]);

    onChange(valid_dep_ids);
    setValue("reporting_manager_id", 0);
    if (includesRootDepartment(valid_dep_ids, depOptions) && adminRole) {
      setValue("role_id", adminRole.id, { shouldValidate: isSubmitted });
    }
    if (isSubmitted) trigger("reporting_manager_id");
  };

  const handleEmploymentTypeChange = (val, onChange) => {
    onChange(val);
    if (val === EMPLOYMENT_TYPE.FULL_TIME) {
      setValue("probation_end_date", "");
      return;
    }
    const joiningDate = getValues("joining_date");
    if (
      val === EMPLOYMENT_TYPE.PROBATION &&
      !getValues("probation_end_date") &&
      joiningDate &&
      defaultProbationMonths
    ) {
      const joinDayjs = dayjs(joiningDate, API_DATE_FORMAT);
      if (joinDayjs.isValid()) {
        setValue(
          "probation_end_date",
          joinDayjs.add(defaultProbationMonths, "month").format(API_DATE_FORMAT),
        );
      }
    }
  };

  const HandleEmployeeSaveAPI = async (values) => {
    const root_department = depOptions.find((d) => d.is_root === true);
    const root_department_id = !!root_department && root_department.id;

    if (employeeImage && !employeeImage.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    if (
      !(values?.primary_department_id_list).includes(root_department_id) &&
      values?.reporting_manager_id === 0
    ) {
      toast.error("Please select reporting manager");
      return;
    }

    const payloadObj = mergeEmployeeValues(employeeObj, values);
    setIsSubmitting(true);
    dispatch(setLoaderVisible(true));
    try {
      const form_data = new FormData();
      employeeImage !== null && form_data.append("profile", employeeImage, employeeImage.name);
      Object.entries(payloadObj).forEach(([key, val]) => {
        if (key === "cf_values" || key === "allowed_attendance_methods") {
          form_data.append(key, JSON.stringify(val));
        } else if (key === "first_name" || key === "last_name" || key === "emp_id") {
          form_data.append(key, typeof val === "string" ? val.trim() : val);
        } else {
          form_data.append(key, val);
        }
      });

      const ApiRes = await PostApi("employee/add-new/", form_data, true);
      if (ApiRes.status && ApiRes.status === 200) {
        if (payloadObj.id === 0) {
          dispatch(addEmployee(ApiRes?.data.data));
          SetLocalStorage("employee", ApiRes?.data.data, 2);
        } else {
          dispatch(editEmployee(ApiRes?.data?.data));
          SetLocalStorage("employee", ApiRes?.data.data, 3);
        }
        dispatch(toggleRSBView(false));
        toast.success(ApiRes?.data?.message);
      } else if (ApiRes?.data?.is_rep_man_error === true) {
        setTeamsToBeUpdated(ApiRes?.data?.team_employees_to_be_updated);
        setShowRMModal(true);
      } else if (
        ApiRes?.data?.message &&
        /employee id/i.test(ApiRes.data.message) &&
        /already exist/i.test(ApiRes.data.message)
      ) {
        setEmpIdApiError(ApiRes.data.message);
        setFocus("emp_id");
      } else {
        toast.error(ApiRes?.data?.message || ApiRes?.data?.detail);
      }
      dispatch(setLoaderVisible(false));
    } finally {
      setIsSubmitting(false);
    }
  };

  const setAllZerosEmpIdError = (empId) => {
    const trimmed = (empId || "").trim();
    if (trimmed && /^0+$/.test(trimmed)) {
      setError("emp_id", { type: "manual", message: "Employee ID cannot be all zeros." });
      return true;
    }
    return false;
  };

  const onInvalid = () => {
    setAllZerosEmpIdError(getValues("emp_id"));
    ["first_name", "last_name"].forEach((key) => {
      const value = (getValues(key) || "").trim();
      if (value && !NAME_REGEX.test(value)) {
        setError(key, { type: "manual", message: NAME_ERROR_MSG });
      }
    });
  };

  const onSubmit = async (values) => {
    if (setAllZerosEmpIdError(values.emp_id)) {
      setFocus("emp_id");
      return;
    }
    const hasAtLeastOneTrue = Object.values(values.allowed_attendance_methods || {}).some(
      (v) => v === true,
    );
    if (!hasAtLeastOneTrue) {
      setAttendanceError("Please select at least one attendance method!");
      return;
    }
    if (Number(values.employment_type) === EMPLOYMENT_TYPE.PROBATION && !values.probation_end_date) {
      toast.error("Probation employees require an end date.");
      return;
    }
    setAttendanceError("");
    pendingValuesRef.current = values;
    await HandleEmployeeSaveAPI(values);
  };

  const handleNewReportingManager = (e, d_id) => {
    const { value } = e;
    setTeamsToBeUpdated((prev) =>
      prev.map((d) => (d.id === d_id ? { ...d, new_reporting_manager_id: value } : d)),
    );
  };

  const assignNewReportingManager = async () => {
    const f = TeamsToBeUpdated.filter((d) => parseInt(d.new_reporting_manager_id) === 0);
    if (f.length > 0) {
      toast.error("Please select new reporting manager");
      return;
    }
    const Payload = TeamsToBeUpdated.map((d) => ({
      employee_id: d?.employee_id,
      new_reporting_manager_id: d?.new_reporting_manager_id,
      sub_child_details: d?.employee_details,
    }));
    const ApiRes = await PostApi("employee/assign-new-reporting-manager/", Payload, false);
    if (ApiRes.status && ApiRes.status === 200) {
      HandleEmployeeSaveAPI(pendingValuesRef.current || getValues());
      setShowRMModal(false);
    } else {
      toast.error("Something went wrong");
    }
  };

  const nameHint = (text) => (
    <>
      Check if{" "}
      <b>
        <i>{firstName}</i>
      </b>{" "}
      {text}
    </>
  );

  return (
    <>
      <SidebarFormLayout
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        isSubmitting={isSubmitting}
        submitLabel={isExistingEmployee ? "Update" : "Create"}
        testIdModule="employee"
      >
        <ProfilePhotoField src={employeeObj.profile_url} onChange={handleProfileChange} />

        <FormSection title="Basic details">
          <Controller
            name="emp_id"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const value = field.value ?? "";
              const message = error?.message || empIdApiError;
              return (
                <TextField
                  name={field.name}
                  inputRef={field.ref}
                  value={value}
                  label="Employee ID"
                  required
                  placeholder="LC001"
                  onChange={(e) => {
                    const val = sanitizeEmpId(e.target.value);
                    field.onChange(val);
                    checkEmpIdExists(val);
                  }}
                  onBlur={() => {
                    field.onBlur();
                    if (value.trim() !== "") checkEmpIdExists(value);
                  }}
                  error={!!message}
                  helperText={
                    <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span data-testid={message ? "employee-emp-id-error" : "employee-emp-id-helper"}>
                        {message || "Enter employee ID"}
                      </span>
                      <span>{`${value.length} / ${EMP_ID_MAX}`}</span>
                    </span>
                  }
                  slotProps={{
                    htmlInput: { "data-testid": "employee-emp-id-input" },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title={EMP_ID_HINT} placement="top">
                            <InfoOutlinedIcon fontSize="small" color="action" />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              );
            }}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="first_name"
                control={control}
                label="First name"
                placeholder="Elon"
                required
                fullWidth
                helperText="Enter first name."
                maxLength={NAME_MAX}
                sanitize={sanitizeName}
                startIcon={<PersonOutlineOutlinedIcon fontSize="small" color="action" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="last_name"
                control={control}
                label="Last name"
                placeholder="Musk"
                required
                fullWidth
                helperText="Enter last name."
                maxLength={NAME_MAX}
                sanitize={sanitizeName}
              />
            </Grid>
          </Grid>

          <FormTextField
            name="email"
            control={control}
            label="Email"
            type="email"
            placeholder="name@company.com"
            required
            helperText="Enter email."
            maxLength={EMAIL_MAX}
            startIcon={<AlternateEmailOutlinedIcon fontSize="small" color="action" />}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormAutocomplete
                name="gender"
                control={control}
                label="Gender"
                placeholder="Select gender"
                required
                helperText="Select gender."
                options={gender_options}
                getOptionValue={getValueField}
                disableClearable
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormDatePicker
                name="dob"
                control={control}
                label="Date of birth"
                required
                helperText="Select a valid date of birth."
                minDate={MIN_DATE}
                maxDate={maxDobForMinAge}
                referenceDate={maxDobForMinAge}
              />
            </Grid>
          </Grid>

          <ContactNumberField
            control={control}
            country={contactCountry}
            onCountryChange={handleCountryChange}
          />
        </FormSection>

        <FormSection title="Job details">
          <FormAutocomplete
            name="branch_id_list"
            control={control}
            label="Branch"
            placeholder="Select branch"
            required
            multiple
            selectAll={false}
            helperText="Select branch."
            options={branchOptions}
          />

          <Controller
            name="primary_department_id_list"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const selected = depOptions.filter((d) => (field.value || []).includes(d.id));
              return (
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  limitTags={3}
                  options={depOptions}
                  value={selected}
                  getOptionLabel={getOptionName}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  onChange={(_, next) => handlePrimaryDepChange(next, field.onChange)}
                  onBlur={field.onBlur}
                  slotProps={{
                    popupIndicator: { "data-testid": "employee-primary-department-trigger" },
                    clearIndicator: { "data-testid": "employee-primary-department-clear-button" },
                  }}
                  renderOption={(props, option, { selected: isSelected }) => {
                    const { key, ...rest } = props;
                    return (
                      <li
                        key={key}
                        {...rest}
                        data-testid={testId("employee-primary-department-option", getOptionName(option))}
                      >
                        <Checkbox size="small" checked={isSelected} sx={{ mr: 1, p: 0.5 }} />
                        {getOptionName(option)}
                      </li>
                    );
                  }}
                  renderValue={(value, getItemProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getItemProps({ index });
                      return (
                        <Chip
                          key={key}
                          {...tagProps}
                          size="small"
                          color="primary"
                          variant="outlined"
                          label={getOptionName(option)}
                          data-testid={testId("employee-primary-department-selected", getOptionName(option))}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{ ...params.inputProps, "data-testid": "employee-primary-department-select" }}
                      inputRef={field.ref}
                      label="Primary department"
                      required
                      placeholder={selected.length ? undefined : "Select primary department"}
                      error={!!error}
                      helperText={
                        <span
                          data-testid={
                            error ? "employee-primary-department-error" : "employee-primary-department-helper"
                          }
                        >
                          {error?.message || "Select primary department."}
                        </span>
                      }
                    />
                  )}
                />
              );
            }}
          />

          <ReportingManagerField
            name="reporting_manager_id"
            control={control}
            label="Reporting manager"
            placeholder="Select reporting manager"
            required={!isReportingManagerOptional}
            helperText={
              isReportingManagerOptional
                ? "Optional for the Main/Top-Level department."
                : "Select reporting manager."
            }
            options={reportingManagerOptions}
            departments={depOptions}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormAutocomplete
                name="role_id"
                control={control}
                label="Role"
                placeholder="Select role"
                required
                disabled={isRoleLocked}
                disableClearable
                helperText={
                  isRoleLocked
                    ? "Role is Admin for the Main/Top-Level department."
                    : "Select role."
                }
                options={roleOptions}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormAutocomplete
                name="work_schedule_id"
                control={control}
                label="Work schedule"
                placeholder="Select work schedule"
                required
                disableClearable
                helperText="Select work schedule."
                options={wsOptions}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormDatePicker
                name="joining_date"
                control={control}
                label="Joining date"
                required
                helperText="Select a valid joining date (up to 1 year in the future)."
                minDate={MIN_DATE}
                maxDate={maxJoiningDate}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="employment_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required>
                    <FormLabel
                      sx={{
                        mb: "6px",
                        fontSize: 12.5,
                        fontWeight: 600,
                        lineHeight: 1.4,
                        color: (t) => (t.palette.mode === "dark" ? "text.primary" : "#495057"),
                        "&.Mui-focused": {
                          color: (t) => (t.palette.mode === "dark" ? "text.primary" : "#495057"),
                        },
                        "& .MuiFormLabel-asterisk": { color: "error.main" },
                      }}
                    >
                      Employment type
                    </FormLabel>
                    {/* Same 40px box as the small outlined inputs beside it. */}
                    <Box
                      sx={{
                        height: 40,
                        p: "4px",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: (t) =>
                          t.palette.mode === "dark"
                            ? "rgba(255,255,255,0.23)"
                            : "rgba(0,0,0,0.23)",
                        bgcolor: "background.paper",
                        transition: "border-color .15s, box-shadow .15s",
                        "&:hover": { borderColor: (t) => alpha(t.palette.success.main, 0.55) },
                        "&:focus-within": {
                          borderColor: "success.main",
                          boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.success.main, 0.14)}`,
                        },
                      }}
                    >
                      <ToggleButtonGroup
                        exclusive
                        fullWidth
                        size="small"
                        color="success"
                        value={Number(field.value) || EMPLOYMENT_TYPE.FULL_TIME}
                        onChange={(_, next) => {
                          if (next !== null) handleEmploymentTypeChange(next, field.onChange);
                        }}
                        onBlur={field.onBlur}
                        sx={{
                          gap: "4px",
                          height: "100%",
                          "& .MuiToggleButton-root": {
                            height: "100%",
                            py: 0,
                            fontSize: 13,
                            fontWeight: 500,
                            textTransform: "none",
                            border: 0,
                            borderRadius: "6px !important",
                            color: "text.secondary",
                          },
                          "& .MuiToggleButton-root.Mui-selected": {
                            fontWeight: 600,
                          },
                        }}
                      >
                        <ToggleButton
                          value={EMPLOYMENT_TYPE.PROBATION}
                          data-testid="employee-employment-type-option-probation"
                        >
                          Probation
                        </ToggleButton>
                        <ToggleButton
                          value={EMPLOYMENT_TYPE.FULL_TIME}
                          data-testid="employee-employment-type-option-full-time"
                        >
                          Full Time
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                    <FormHelperText data-testid="employee-employment-type-helper">
                      {Number(field.value) === EMPLOYMENT_TYPE.PROBATION
                        ? "Set the probation end date below."
                        : "Select probation or full time."}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          {Number(employmentType) === EMPLOYMENT_TYPE.PROBATION && (
            <FormDatePicker
              name="probation_end_date"
              control={control}
              label="Probation end date"
              required
              helperText={
                defaultProbationMonths
                  ? `Auto-filled to ${defaultProbationMonths} month(s) from joining; adjust if needed.`
                  : "No probation policy configured — please set the end date manually."
              }
            />
          )}

          <FormAutocomplete
            name="profile_timezone"
            control={control}
            label="Time zone"
            placeholder="Select a time zone"
            helperText="Select time zone."
            options={timzone_options}
            getOptionValue={getValueField}
            disableClearable
          />
        </FormSection>

        <FormSection title="Attendance">
          <FormSwitch
            name="allow_attendance_outside_the_range"
            control={control}
            label="Allow Check In/Out Outside the Range"
            description={nameHint("is allowed to check in/out outside the branch range.")}
          />
          <FormSwitch
            name="outside_range_notes_required"
            control={control}
            label="Outside Range Notes Required"
            description={nameHint("is required to add notes when outside range.")}
          />
          <FormSwitch
            name="can_web_checkin"
            control={control}
            label="Allow Web Check In/Out"
            description={nameHint("is allowed to web check in/out.")}
          />

          <Box>
            <FormLabel
              required
              error={!!(errors.allowed_attendance_methods?.message || attendanceError)}
              sx={{ fontSize: 13 }}
            >
              Allowed attendance methods
            </FormLabel>
            <Stack direction="row" flexWrap="wrap" columnGap={2}>
              {ATTENDANCE_METHODS.map(({ key, label }) => (
                <FormCheckbox
                  key={key}
                  name={`allowed_attendance_methods.${key}`}
                  control={control}
                  label={label}
                />
              ))}
            </Stack>
            {(errors.allowed_attendance_methods?.message || attendanceError) && (
              <FormHelperText error data-testid="employee-allowed-attendance-methods-error">
                {errors.allowed_attendance_methods?.message || attendanceError}
              </FormHelperText>
            )}
          </Box>
        </FormSection>

        {employeeObj.cf_values?.length > 0 && (
          <FormSection title="Additional information">
            <CustomFieldInputs control={control} fields={employeeObj.cf_values} />
          </FormSection>
        )}

        {isExistingEmployee && (
          <EmployeeLocations
            locations={employeeObj?.entity_location_details}
            onAdd={() => {
              setLocationToEdit(null);
              setLocationModalOpen(true);
            }}
            onEdit={(location) => {
              setLocationToEdit(location);
              setLocationModalOpen(true);
            }}
          />
        )}
      </SidebarFormLayout>

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        employeeObj={employeeObj}
        setEmployeeObj={setEmployeeObj}
        locationToEdit={locationToEdit}
      />

      <ReassignManagerDialog
        open={showRMModal}
        onClose={() => setShowRMModal(false)}
        employeeName={firstName}
        teams={TeamsToBeUpdated}
        departments={depOptions}
        onManagerChange={handleNewReportingManager}
        onAssign={assignNewReportingManager}
      />
    </>
  );
};

export default EmployeeForm;
