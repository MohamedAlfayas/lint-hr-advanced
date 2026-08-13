import React, { Fragment, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { Modal, ModalBody } from "reactstrap";
import {
  Button,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormFeedback,
  Input,
  Label,
  Row,
  UncontrolledTooltip,
} from "reactstrap";

import Select from "react-select";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import DummyUserImg from "../../assets/images/users/user.png";

import Flatpickr from "react-flatpickr";
import { useFormik } from "formik";
import * as Yup from "yup";

import { toast } from "react-toastify";
import {
  addEmployee,
  editEmployee,
} from "../../redux/reducers/ChildReducer/EmployeeReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../common/js/ConvertDateFormat";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import indflag from "../../assets/images/flags/in.svg";
import SimpleBar from "simplebar-react";
import CountryList from "../../common/data/CountryList";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { PostApi } from "../../common/api/PostApi";
import {
  gender_options,
  form_default_input_types,
  form_select_type,
  timzone_options,
  form_date_type,
  DateFormat,
  form_file_type,
} from "../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DatePicker } from "antd";
import { Api } from "../../common/api/Api";
import { EmployeeDisplayInSelect } from "../../common/js/EmployeeDisplayInSelect";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";
import LocationModal from "../../pages/employee/LocationModal";
dayjs.extend(customParseFormat);

import no_image from "../../assets/images/users/no_img.jpg";

const EmployeeForm = () => {
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [employeeObj, setEmployeeObj] = useState({});

  const dispatch = useDispatch();

  const employee_data = GetLocalStorageData("employee");
  const branch_options = GetLocalStorageData("branch") || [];
  const dep_options = GetLocalStorageData("department") || [];
  const ws_options = GetLocalStorageData("work_schedule") || [];
  const role_id_option = GetLocalStorageData("role") || [];

  const [reportingManagerOptions, setReportingManagerOptions] = useState([]);
  const [employeeImage, setEmployeeImage] = useState(null);
  const [contactCountry, setContactCountry] = useState({
    id: 240,
    flagImg: indflag,
    countryName: "India",
    countryCode: "+91",
  });
  const [dropdownOpen4, setDropdownOpen4] = useState(false);
  const toggle4 = () => setDropdownOpen4((prevState) => !prevState);

  const [dob, setDob] = useState([]);
  const [joining_date, setJoinDate] = useState([]);
  const [selectedFileName, setSelectedFileName] = React.useState("");
  const [selectedFileName1, setSelectedFileName1] = React.useState("");
  const [selectedFileName2, setSelectedFileName2] = React.useState("");
  const [selectedFileName3, setSelectedFileName3] = React.useState("");
  const [selectedFileName4, setSelectedFileName4] = React.useState("");
  const [selectedFileName5, setSelectedFileName5] = React.useState("");
  const [errors, setErrors] = useState("");
  const [nameTouched, setNameTouched] = useState({
    first_name: false,
    last_name: false,
  });
  const [emailTouched, setEmailTouched] = useState(false);

  const [lengthWarnings, setLengthWarnings] = useState({
    emp_id: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  const MAX_LENGTHS = {
    emp_id: 50,
    first_name: 50,
    last_name: 50,
    email: 50,
  };

  const checkMaxLength = (field, rawValue) => {
    const max = MAX_LENGTHS[field];
    const msg =
      rawValue.length > max
        ? `${field
            .replace("_", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())} cannot exceed ${max} characters`
        : "";
    setLengthWarnings((prev) => ({ ...prev, [field]: msg }));
  };

  const inputRef = useRef(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const fieldRefs = useRef({});
  // ── Location Modal State ──────────────────────────────────────────────────
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState(null);
  const isExistingEmployee = !!(form_obj?.id && form_obj.id !== 0);
  const [defaultProbationMonths, setDefaultProbationMonths] = useState(0);
  const [probation_end_date, setProbationEndDate] = useState(null);

  const handleAddLocationClick = () => {
    setLocationToEdit(null);
    setLocationModalOpen(true);
  };
  const handleEditLocation = (location) => {
    setLocationToEdit(location);
    setLocationModalOpen(true);
  };

  // ── Date helpers ──────────────────────────────────────────────────────────
  const today = dayjs().startOf("day");
  const minDobDate = dayjs("1900-01-01");
  // const oneMonthLater = dayjs().add(1, "month").endOf("day");
  const minJoiningDate = dayjs("1900-01-01");
  const maxJoiningDate = dayjs().add(1, "year").endOf("day");
  // DOB: must be in the past (before today)
  // const disableDobDates = (current) => current && current >= today;
  const disableDobDates = (current) => {
    return (
      current &&
      (current.isBefore(minDobDate, "day") || current.isAfter(today, "day"))
    );
  };
  // Joining date: from past up to 1 month in future
  // const disableJoiningDates = (current) => current && current > oneMonthLater;
  const disableJoiningDates = (current) => {
    return (
      current &&
      (current.isBefore(minJoiningDate, "day") ||
        current.isAfter(maxJoiningDate, "day"))
    );
  };

  const showFileNameIfSelected = () => {
    const idProofUrl = form_obj.id_proof_url;
    const fileName = idProofUrl ? idProofUrl.split("/").pop() : "";
    setSelectedFileName(fileName);
  };
  const handleClearFile = () => setSelectedFileName("");
  const handleClearFile1 = () => setSelectedFileName1("");
  const handleClearFile2 = () => setSelectedFileName2("");
  const handleClearFile3 = () => setSelectedFileName3("");
  const handleClearFile4 = () => setSelectedFileName4("");
  const handleClearFile5 = () => setSelectedFileName5("");

  const showFile1NameIfSelected = () => {
    const file1Url = form_obj.file_1_url;
    setSelectedFileName1(file1Url ? file1Url.split("/").pop() : "");
  };
  const showFile2NameIfSelected = () => {
    const file2Url = form_obj.file_2_url;
    setSelectedFileName2(file2Url ? file2Url.split("/").pop() : "");
  };
  const showFile3NameIfSelected = () => {
    const file3Url = form_obj.file_3_url;
    setSelectedFileName3(file3Url ? file3Url.split("/").pop() : "");
  };
  const showFile4NameIfSelected = () => {
    const file4Url = form_obj.file_4_url;
    setSelectedFileName4(file4Url ? file4Url.split("/").pop() : "");
  };
  const showFile5NameIfSelected = () => {
    const file5Url = form_obj.file_5_url;
    setSelectedFileName5(file5Url ? file5Url.split("/").pop() : "");
  };

  useEffect(() => {
    console.clear();
    let this_role_id = 0;
    if (
      form_obj?.role !== null &&
      form_obj?.role !== undefined &&
      form_obj?.role !== ""
    ) {
      this_role_id = form_obj?.role?.id;
    }
    setEmployeeObj({
      ...form_obj,
      dob: ConvertISODateFormat(form_obj.dob),
      joining_date: ConvertISODateFormat(form_obj.joining_date),
      role_id: this_role_id,
      employment_type: form_obj.employment_type || 2,
      probation_end_date: ConvertISODateFormat(form_obj.probation_end_date),
    });
    setProbationEndDate(
      form_obj.probation_end_date
        ? ConvertDateFormat(ConvertISODateFormat(form_obj.probation_end_date))
        : null,
    );
    console.log("form_obj.dob:", form_obj.dob);
    console.log("form_obj.joining_date:", form_obj.joining_date);
    setDob(
      form_obj.dob
        ? ConvertDateFormat(ConvertISODateFormat(form_obj.dob))
        : null,
    );
    console.log("form_obj:", form_obj);
    setJoinDate(
      form_obj.joining_date
        ? ConvertDateFormat(ConvertISODateFormat(form_obj.joining_date))
        : null,
    );
    form_obj?.primary_department_id_list?.length
      ? GetReportingManager(form_obj?.primary_department_id_list)
      : setReportingManagerOptions([]);

    if (
      form_obj.country_code !== "" &&
      form_obj.country_code !== null &&
      form_obj.country_code !== undefined
    ) {
      setContactCountry(
        CountryList.find((d) => d.countryCode === form_obj.country_code),
      );
    }

    showFileNameIfSelected();
    showFile1NameIfSelected();
    showFile2NameIfSelected();
    showFile3NameIfSelected();
    showFile4NameIfSelected();
    showFile5NameIfSelected();

    setNameTouched({ first_name: false, last_name: false });
    setEmailTouched(false);
    setHasAttemptedSubmit(false);
  }, [form_obj]);

  useEffect(() => {
    if (employeeObj?.id === 0) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [employeeObj?.id]);

  // Load the active probation policy default (for auto-filling end date).
  useEffect(() => {
    Api({ method: "GET", url: "payroll/probation-policy/" })
      .then((res) => {
        const latest = (res?.data?.data || [])[0];
        setDefaultProbationMonths(
          latest ? (latest.default_probation_months || 0) : 0,
        );
      })
      .catch(() => setDefaultProbationMonths(0));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeObj({ ...employeeObj, [name]: value });
  };

  // ── Name input: strip numbers and special chars on change ─────────────────
  const handleNameInput = (e, field) => {
    const val = e.target.value.replace(/[^A-Za-z\s'-]/g, "");

    setEmployeeObj((prev) => ({
      ...prev,
      [field]: val,
    }));

    setNameTouched((prev) => ({ ...prev, [field]: true }));
    checkMaxLength(field, val);
    FormikForm.setFieldValue(field, val);
    FormikForm.setFieldTouched(field, true, false);


  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/svg+xml",
      "image/webp",
    ];

    if (!allowedImageTypes.includes(file.type)) {
      toast.error("Only image files are allowed");

      setEmployeeImage(null);

      setEmployeeObj({
        ...employeeObj,
        profile_url: "",
      });

      e.target.value = "";

      return;
    }

    setEmployeeImage(file);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      setEmployeeObj({
        ...employeeObj,
        profile_url: readerEvent.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleBranchChange = (e) => {
    setEmployeeObj({ ...employeeObj, branch_id_list: e.map((d) => d.value) });
  };

  const GetReportingManager = async (valid_dep_ids) => {
    const ApiRes = await PostApi(
      "employee/get-employee-list-for-reporting-manager/",
      { dep_id: valid_dep_ids },
      false,
    );
    if (ApiRes.status && ApiRes.status === 200) {
      const response = ApiRes?.data?.data;
      setReportingManagerOptions(
        employee_data.filter(
          (d) => d.id !== form_obj.id && response.includes(d.id),
        ),
      );
    }
  };

  const handlePrimaryDepChange = async (e) => {
    let valid_dep_obj = [];
    let valid_dep_ids = [];
    for (var i = 0; i < e.length; i++) {
      var is_child = false;
      for (var j = 0; j < e.length; j++) {
        if (i !== j && e[j].child_id_list.includes(e[i].id)) {
          is_child = true;
        }
      }
      if (!is_child) {
        valid_dep_obj.push(e[i]);
        valid_dep_ids.push(e[i].id);
      }
    }
    valid_dep_ids.length
      ? GetReportingManager(valid_dep_ids)
      : setReportingManagerOptions([]);
    setEmployeeObj({
      ...employeeObj,
      primary_department_id_list: valid_dep_ids,
      reporting_manager_id: 0,
    });
  };

  const handleDateChange = (selectedDates, dateStr, instance) => {
    setDob(dateStr);
    setEmployeeObj({
      ...employeeObj,
      dob: ConvertISODateFormat(ConvertDateFormat(dateStr)),
    });
    FormikForm.setFieldValue(
      "dob",
      ConvertISODateFormat(ConvertDateFormat(dateStr)),
    );
    // FormikForm.setFieldTouched("dob", true);
  };

  const handleEmploymentTypeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setEmployeeObj((prev) => ({ ...prev, employment_type: val }));
    // Switching to Full Time clears the probation end date.
    if (val === 2) {
      setProbationEndDate(null);
      setEmployeeObj((prev) => ({ ...prev, probation_end_date: "" }));
      return;
    }
    // Switching to Probation: auto-fill end = joining + default months (if empty).
    // Parse the joining date from the DISPLAY state using DateFormat (same safe
    // pattern the picker binding uses at lines ~786/1505). Do NOT use
    // employeeObj.joining_date with bare dayjs() — that value is in the app ISO
    // format and dayjs misparses it, swapping month/day (May-04 + 3mo produced
    // 2026-04-08 instead of 2026-08-04).
    if (val === 1 && !probation_end_date && joining_date && defaultProbationMonths) {
      const joinDayjs = dayjs(joining_date, DateFormat);
      if (joinDayjs.isValid()) {
        const endObj = joinDayjs.add(defaultProbationMonths, "month");
        const endDisplay = endObj.format(DateFormat);     // for the picker
        const endIso = endObj.format("YYYY-MM-DD");         // for the backend
        // Do NOT round-trip through ConvertISODateFormat/ConvertDateFormat:
        // that path goes YYYY-MM-DD -> DD-MM-YYYY -> new Date() misparses as
        // MM-DD-YYYY and swaps month/day (Aug-04 -> Apr-08). dayjs formats the
        // real date object directly.
        setProbationEndDate(endDisplay);
        setEmployeeObj((prev) => ({ ...prev, probation_end_date: endIso }));
        FormikForm.setFieldValue("probation_end_date", endIso);
      }
    }
  };

  const handleProbationEndDateChange = (d, dateStr) => {
    setProbationEndDate(dateStr);   // display string, in DateFormat
    // dateStr is in DateFormat -> parse with dayjs, emit YYYY-MM-DD for backend.
    // Avoids ConvertISODateFormat(ConvertDateFormat(...)) which swaps month/day.
    const iso = dayjs(dateStr, DateFormat).isValid()
      ? dayjs(dateStr, DateFormat).format("YYYY-MM-DD")
      : "";
    setEmployeeObj((prev) => ({ ...prev, probation_end_date: iso }));
    FormikForm.setFieldValue("probation_end_date", iso);
    FormikForm.setFieldTouched("probation_end_date", true);
  };

  const handleJoinDateChange = (selectedJoinDate, dateStr, instance) => {
    setJoinDate(dateStr);
    setEmployeeObj({
      ...employeeObj,
      joining_date: ConvertISODateFormat(ConvertDateFormat(dateStr)),
    });
    FormikForm.setFieldValue(
      "joining_date",
      ConvertISODateFormat(ConvertDateFormat(dateStr)),
    );
    FormikForm.setFieldTouched("joining_date", true);
  };

  const handleTimeZoneChange = (selectedTimezone) => {
    setEmployeeObj({
      ...employeeObj,
      profile_timezone: selectedTimezone.value,
    });
  };

  const updateProfileData = (name, value) => {
    setEmployeeObj({ ...employeeObj, [name]: value });
  };

  const handleFileUpload = (e, name) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PDF, DOC and DOCX files are allowed.");
      e.target.value = "";
      return;
    }

    setEmployeeObj((oldObj) => ({
      ...oldObj,
      [name]: file,
    }));
  };

  const handleCFInputChange = (e, cf_id) => {
    setEmployeeObj({
      ...employeeObj,
      cf_values: [...employeeObj.cf_values].map((item) =>
        item.id === cf_id ? { ...item, value: e.target.value } : { ...item },
      ),
    });
  };

  const handleCFSelectChange = (e, cf_id) => {
    setEmployeeObj({
      ...employeeObj,
      cf_values: [...employeeObj.cf_values].map((item) =>
        item.id === cf_id ? { ...item, value: e.value } : item,
      ),
    });
  };

  const handleCFFileChange = async (e, cf_id) => {
    const file = e.target.files[0];
    let img_url = "";
    let cf_form_data = new FormData();
    cf_form_data.append("cf_file", file);
    const ApiRes = await PostApi(
      "fields/upload-custom-field-file/",
      cf_form_data,
      true,
    );
    img_url = ApiRes.status === 200 ? String(ApiRes?.data?.data) : "";
    if (ApiRes.status !== 200)
      toast.error(ApiRes?.data?.message || ApiRes?.data?.detail);
    setEmployeeObj({
      ...employeeObj,
      cf_values: [...employeeObj.cf_values].map((item) =>
        item.id === cf_id ? { ...item, value: img_url } : item,
      ),
    });
  };

  const handleCFDateChange = (e, dateStr, cf_id) => {
    setEmployeeObj({
      ...employeeObj,
      cf_values: [...employeeObj.cf_values].map((item) =>
        item.id === cf_id
          ? { ...item, value: ConvertISODateFormat(ConvertDateFormat(dateStr)) }
          : item,
      ),
    });
  };

  // ── Yup schema ────────────────────────────────────────────────────────────
  const todayStr = dayjs().format("YYYY-MM-DD");
  const maxJoinStr = dayjs().add(1, "month").format("YYYY-MM-DD");

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: employeeObj,
    validationSchema: Yup.object({
      emp_id: Yup.string()
        .trim()
        .matches(
          /^[A-Z0-9_-]+$/,
          "Employee ID must contain only uppercase letters, numbers, hyphens (-), and underscores (_).",
        )
        .required("Please enter employee ID")
        .max(50, "Employee ID cannot exceed 50 characters"),

      first_name: Yup.string()
        .trim()
        .required("Please enter first name")
        .nullable()
        .test(
          "first-name-validation",
          "Only alphabets, spaces, hyphens (-), and apostrophes (') are allowed",
          (value) => {
            if (!value || value.trim() === "") return true;

            return /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(value);
          },
        )
        .min(1, "Please enter first name")
        .max(50, "First name cannot exceed 50 characters"),

      last_name: Yup.string()
        .trim()
        .required("Please enter last name")
        .nullable()
        .test(
          "last-name-validation",
          "Only alphabets, spaces, hyphens (-), and apostrophes (') are allowed",
          (value) => {
            if (!value || value.trim() === "") return true;

            return /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(value);
          },
        )
        .min(1, "Please enter last name")
        .max(50, "Last name cannot exceed 50 characters"),

      email: Yup.string()
        .trim()
        .required("Please enter email")
        .transform((value) => (value ? value.trim().toLowerCase() : value))
        .max(50, "Email must not exceed 50 characters")
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
        .test(
          "dob-not-future",
          "Date of birth cannot be a future date",
          (value) => {
            if (!value) return false;
            // return dayjs(value).isBefore(dayjs());
            return (
              dayjs(value).isSame(dayjs(), "day") ||
              dayjs(value).isBefore(dayjs(), "day")
            );
          },
        ),

      joining_date: Yup.string()
        .trim()
        .required("Please select joining date")
        .test(
          "joining-within-range",
          "Joining date must be within the next 1 month",
          (value) => {
            if (!value) return false;
            const d = dayjs(value);
            // return d.isBefore(dayjs().add(1, "month").add(1, "day"));
            return (
              d.isSame(dayjs("1900-01-01"), "day") ||
              (d.isAfter(dayjs("1900-01-01"), "day") &&
                d.isBefore(dayjs().add(1, "year").add(1, "day")))
            );
          },
        )
        // New validation for minimum age 15
        .test(
          "minimum-age-at-joining",
          "Employee must be at least 15 years old on joining date",
          function (joiningDate) {
            const { dob } = this.parent;

            if (!dob || !joiningDate) return true;

            const dobDate = dayjs(dob);
            const dojDate = dayjs(joiningDate);

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

      role_id: Yup.number()
        .required("Please select role")
        .min(1, "Please select role"),

      branch_id_list: Yup.array().min(1, "Please select branch"),

      primary_department_id_list: Yup.array().min(
        1,
        "Please select department",
      ),

      work_schedule_id: Yup.number()
        .required("Please select work schedule")
        .min(1, "Please select work schedule"),

      reporting_manager_id: Yup.number()
        .nullable()
        .test(
          "reporting-manager-required",
          "Please select reporting manager",
          function (value) {
            // mirror your HandleEmployeeSaveAPI rule: only required
            // if primary dept isn't the root department
            return !!value; // or your conditional logic if you want it optional for root dept
          }
        ),
      allowed_attendance_methods: Yup.object()
        .test(
          "at-least-one-method",
          "Please select at least one attendance method",
          (value) =>
            !!value && Object.values(value).some((v) => v === true),
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
                  value !== undefined &&
                  value !== null &&
                  String(value).trim() !== "",
              ),
            otherwise: (schema) => schema.notRequired(),
          }),
        }),
      ),
    }),
    onSubmit: async (values) => {
      values.first_name = values.first_name?.trim() || "";
      values.last_name = values.last_name?.trim() || "";
      const hasAtLeastOneTrue = Object.values(
        values.allowed_attendance_methods,
      ).some((v) => v === true);
      if (!hasAtLeastOneTrue) {
        setErrors("Please select at least one attendance method!");
        return;
      } else if (
        Number(employeeObj?.employment_type) === 1 &&
        !employeeObj?.probation_end_date
      ) {
        toast.error("Probation employees require an end date.");
        return;
      } else {
        setErrors("");
        await HandleEmployeeSaveAPI(values);
      }
    },
  });

  const HandleEmployeeSaveAPI = async (values) => {
    let root_department = dep_options.find((d) => d.is_root === true);
    let root_department_id = !!root_department && root_department.id;

    if (employeeImage && !employeeImage.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    if (
      !(values?.primary_department_id_list).includes(root_department_id) &&
      values?.reporting_manager_id === 0
    ) {
      toast.error("Please select reporting manager");
    } else {
      dispatch(setLoaderVisible(true));
      let form_data = new FormData();
      employeeImage !== null &&
        form_data.append("profile", employeeImage, employeeImage.name);
      Object.entries(employeeObj).forEach(([key, val]) => {
        if (key === "cf_values" || key === "allowed_attendance_methods") {
          form_data.append(key, JSON.stringify(val));
        } else {
          form_data.append(key, val);
        }
      });

      const ApiRes = await PostApi("employee/add-new/", form_data, true);
      if (ApiRes.status && ApiRes.status === 200) {
        if (employeeObj.id === 0) {
          dispatch(addEmployee(ApiRes?.data.data));
          SetLocalStorage("employee", ApiRes?.data.data, 2);
        } else {
          dispatch(editEmployee(ApiRes?.data?.data));
          SetLocalStorage("employee", ApiRes?.data.data, 3);
        }
        dispatch(toggleRSBView(false));
        toast.success(ApiRes?.data?.message);
      } else {
        if (
          !!ApiRes?.data?.is_rep_man_error &&
          ApiRes?.data?.is_rep_man_error === true
        ) {
          setTeamsToBeUpdated(ApiRes?.data?.team_employees_to_be_updated);
          setShowRMModal(true);
        } else {
          toast.error(ApiRes?.data?.message || ApiRes?.data?.detail);
        }
      }
      dispatch(setLoaderVisible(false));
    }
  };

  // useEffect(() => {
  //   if (
  //     hasAttemptedSubmit &&
  //     Object.keys(FormikForm.errors).length > 0
  //   ) {
  //     const firstErrorField = Object.keys(FormikForm.errors)[0];
  //     FormikForm.setFieldTouched(firstErrorField, true, false);
  //     const errorField = document.querySelector(`[name="${firstErrorField}"]`);
  //     if (errorField) errorField.focus();
  //   }
  // }, [FormikForm.errors, hasAttemptedSubmit]);

  useEffect(() => {
    // if (hasAttemptedSubmit && Object.keys(FormikForm.errors).length > 0)
    if (
        hasAttemptedSubmit &&
        FormikForm.submitCount > 0 &&
        Object.keys(FormikForm.errors).length > 0
      ) 
      {
      const firstErrorField = Object.keys(FormikForm.errors)[0];
      FormikForm.setFieldTouched(firstErrorField, true, false);

      const node = fieldRefs.current[firstErrorField];
      if (node) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
        const focusable = node.querySelector("input, select, textarea");
        if (focusable) focusable.focus();
      }
    }
  }, [FormikForm.errors, hasAttemptedSubmit]);

  const [showRMModal, setShowRMModal] = useState(false);
  const onRMModalCloseClick = () => setShowRMModal(false);
  const [TeamsToBeUpdated, setTeamsToBeUpdated] = useState([]);

  const handleNewReportingManager = (e, d_id) => {
    const { value } = e;
    setTeamsToBeUpdated(
      [...TeamsToBeUpdated].map((d) =>
        d.id === d_id ? { ...d, new_reporting_manager_id: value } : d,
      ),
    );
  };

  const assignNewReportingManager = async () => {
    const f = TeamsToBeUpdated.filter(
      (d) => parseInt(d.new_reporting_manager_id) === 0,
    );
    if (f.length > 0) {
      toast.error("Please select new reporting manager");
    } else {
      const Payload = TeamsToBeUpdated.map((d) => ({
        employee_id: d?.employee_id,
        new_reporting_manager_id: d?.new_reporting_manager_id,
        sub_child_details: d?.employee_details,
      }));
      const ApiRes = await PostApi(
        "employee/assign-new-reporting-manager/",
        Payload,
        false,
      );
      if (ApiRes.status && ApiRes.status === 200) {
        HandleEmployeeSaveAPI(employeeObj);
        setShowRMModal(false);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  console.log("joining_date:", joining_date);
  console.log(
    "dayjs value:",
    joining_date ? dayjs(joining_date, DateFormat) : null,
  );
  console.log(
    "isValid:",
    joining_date ? dayjs(joining_date, DateFormat).isValid() : null,
  );

  return (
    <React.Fragment>
      <Row>
        <Col>
          {/* <Form
            // onSubmit={FormikForm.handleSubmit}
            onSubmit={(e) => {
              setHasAttemptedSubmit(true);
              FormikForm.handleSubmit(e);
            }}
            noValidate
            action="javascript:void(0)"
          > */}
          <Form
            onSubmit={async (e) => {
              e.preventDefault();

              setHasAttemptedSubmit(true);

              // Touch all fields so Formik validates every required field
              const touchedFields = {};

              Object.keys(FormikForm.initialValues).forEach((key) => {
                touchedFields[key] = true;
              });

              FormikForm.setTouched(touchedFields, true);

              // Wait until validation completes
              const errors = await FormikForm.validateForm();

              if (Object.keys(errors).length > 0) {
                const firstErrorField = Object.keys(errors)[0];

                requestAnimationFrame(() => {
                  const node = fieldRefs.current[firstErrorField];

                  if (!node) return;

                  node.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });

                  const input = node.querySelector(
                    "input, textarea, select"
                  );

                  input?.focus();
                });

                return;
              }

              FormikForm.handleSubmit();
            }}
            noValidate
            action="javascript:void(0)"
          >
            <div className="text-center">
              <div className="profile-user position-relative d-inline-block mx-auto mb-4">
                <img
                  src={
                    employeeObj.profile_url
                      ? employeeObj.profile_url
                      : DummyUserImg
                  }
                  className="rounded-circle avatar-xl img-thumbnail user-profile-image"
                  alt="user-profile"
                />
                <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                  <Input
                    id="profile-img-file-input"
                    type="file"
                    accept="image/*"
                    className="profile-img-file-input"
                    onChange={handleProfileChange}
                  />
                  <Label
                    htmlFor="profile-img-file-input"
                    className="profile-photo-edit avatar-xs"
                  >
                    <span className="avatar-title rounded-circle bg-light text-body">
                      <i className="ri-camera-fill"></i>
                    </span>
                  </Label>
                </div>
              </div>
            </div>

            <Row>
              {/* ── Employee ID ──────────────────────────────────────────── */}
              <Col md={12} lg={12} xxl={12}>
                <div  ref={(el) => (fieldRefs.current.emp_id = el)}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Label
                      htmlFor="employeeid"
                      className="form-label"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <span style={{ marginRight: "5px" }}>Employee ID</span>
                      <i
                        id="empIdInfo"
                        className="ri-information-line"
                        style={{ verticalAlign: "middle" }}
                      ></i>
                      <UncontrolledTooltip
                        placement="right"
                        target="empIdInfo"
                        hideArrow={true}
                        autohide={false}
                        delay={{ show: 0, hide: 0 }}
                        style={{
                          fontSize: "12px",
                          backgroundColor: "transparent",
                          color: "black",
                          fontStyle: "italic",
                          border: "1px solid black",
                          borderRadius: "4px",
                          padding: "3px",
                        }}
                      >
                        Uppercase letters and numbers only
                      </UncontrolledTooltip>
                    </Label>
                  </div>
                  <div className="form-icon right">
                    <Input
                      innerRef={inputRef}
                      type="text"
                      name="emp_id"
                      id="employeeid"
                      className="form-control"
                      placeholder="LC001"
                      value={employeeObj.emp_id || ""}
                      onChange={(e) => {
                        const val = e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9_-]/g, "");

                       
                        setEmployeeObj((prev) => ({
                          ...prev,
                          emp_id: val,
                        }));
                        checkMaxLength("emp_id", val);

                        FormikForm.setFieldValue("emp_id", val);
                        FormikForm.setFieldTouched("emp_id", true, false);

                     
                      }}
                      // onBlur={() => FormikForm.setFieldTouched("emp_id", true)}
                      onBlur={() => {
                        if (employeeObj.emp_id && employeeObj.emp_id.trim() !== "") {
                          FormikForm.setFieldTouched("emp_id", true);
                        }
                      }}
                      invalid={
                        // !!FormikForm.errors.emp_id
                        !!((FormikForm.touched.emp_id || hasAttemptedSubmit) &&
                          FormikForm.errors.emp_id)
                      }
                    />
                    {
                    // !FormikForm.errors.emp_id && (
                      !(
                        (FormikForm.touched.emp_id || hasAttemptedSubmit) &&
                        FormikForm.errors.emp_id
                      ) &&
                      <i className="ri-user-line"></i>
                    }
                    {
                    // FormikForm.errors.emp_id && (
                    (FormikForm.touched.emp_id || hasAttemptedSubmit) &&
                      FormikForm.errors.emp_id && 
                      !lengthWarnings.emp_id &&(
                      <FormFeedback type="invalid">
                        {FormikForm.errors.emp_id}
                      </FormFeedback>
                    )}
                    {lengthWarnings.emp_id && (
                      <div className="lc_form_error_text">{lengthWarnings.emp_id}</div>
                    )}
                  </div>
                  {
                  // !FormikForm.errors.emp_id && (
                  !(
                      (FormikForm.touched.emp_id || hasAttemptedSubmit) &&
                      FormikForm.errors.emp_id
                    ) && 
                    <div className="form-text mb-3">Enter employee ID</div>
                  }
                </div>
              </Col>

              {/* ── First Name ───────────────────────────────────────────── */}
              <Col md={6} lg={6} xxl={6}>
                <div ref={(el) => (fieldRefs.current.first_name = el)}>
                  <Label htmlFor="first_name" className="form-label">
                    First Name <span>*</span>
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="first_name"
                      id="first_name"
                      className="form-control"
                      placeholder="Elon"
                      value={employeeObj.first_name || ""}
                      onChange={(e) => handleNameInput(e, "first_name")}
                      onBlur={() => {
                        if (employeeObj.first_name && employeeObj.first_name.trim() !== "") {
                          FormikForm.setFieldTouched("first_name", true);
                          setNameTouched((prev) => ({
                            ...prev,
                            first_name: true,
                          }));
                        }
                      }}
                      invalid={
                        // !!(
                        //   nameTouched.first_name && FormikForm.errors.first_name
                        // )
                        !!((nameTouched.first_name || hasAttemptedSubmit) &&
                          FormikForm.errors.first_name)
                      }
                    />
                    {!(
                      // nameTouched.first_name && FormikForm.errors.first_name
                      (nameTouched.first_name || hasAttemptedSubmit) &&
                        FormikForm.errors.first_name
                    ) && <i className="ri-user-line"></i>}
                    {/* {nameTouched.first_name && FormikForm.errors.first_name && ( */}
                    {(nameTouched.first_name || hasAttemptedSubmit) &&
                      FormikForm.errors.first_name && 
                      !lengthWarnings.first_name && (

                      <FormFeedback type="invalid">
                        {FormikForm.errors.first_name}
                      </FormFeedback>
                    )}
                    {lengthWarnings.first_name && (
                      <div className="lc_form_error_text">{lengthWarnings.first_name}</div>
                    )}
                  </div>
                  {!(
                    // nameTouched.first_name && FormikForm.errors.first_name
                      (nameTouched.first_name || hasAttemptedSubmit) &&
                        FormikForm.errors.first_name
                  ) && <div className="form-text mb-3">Enter first name.</div>}
                </div>
              </Col>

              {/* ── Last Name ────────────────────────────────────────────── */}
              <Col md={6} lg={6} xxl={6}>
                <div ref={(el) => (fieldRefs.current.last_name = el)}>
                  <Label htmlFor="last_name" className="form-label">
                    Last Name <span>*</span>
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="last_name"
                      id="last_name"
                      className="form-control"
                      placeholder="Musk"
                      value={employeeObj.last_name || ""}
                      onChange={(e) => handleNameInput(e, "last_name")}
                      onBlur={() => {
                          if (employeeObj.last_name && employeeObj.last_name.trim() !== "") {
                            FormikForm.setFieldTouched("last_name", true);
                            setNameTouched((prev) => ({
                              ...prev,
                              last_name: true,
                            }));
                          }
                      }}
                      invalid={
                        // !!(nameTouched.last_name && FormikForm.errors.last_name)
                         !!((nameTouched.last_name || hasAttemptedSubmit) &&
                          FormikForm.errors.last_name)
                      }
                    />
                    {!(
                      // nameTouched.last_name && FormikForm.errors.last_name
                      (nameTouched.last_name || hasAttemptedSubmit) &&
                        FormikForm.errors.last_name
                    ) && <i className="ri-user-2-line"></i>}
                    {/* {nameTouched.last_name && FormikForm.errors.last_name && ( */}
                    {(nameTouched.last_name || hasAttemptedSubmit) &&
                      FormikForm.errors.last_name &&
                      !lengthWarnings.last_name && (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.last_name}
                      </FormFeedback>
                    )}
                    {lengthWarnings.last_name && (
                      <div className="lc_form_error_text">{lengthWarnings.last_name}</div>
                    )}
                  </div>
                  {!(
                    // nameTouched.last_name && FormikForm.errors.last_name
                      (nameTouched.last_name || hasAttemptedSubmit) &&
                      FormikForm.errors.last_name
                  )  && (
                    <div className="form-text mb-3">Enter last name.</div>
                  )}
                </div>
              </Col>

              {/* ── Email ────────────────────────────────────────────────── */}
              <Col md={12} lg={12} xxl={12}>
                <div ref={(el) => (fieldRefs.current.email = el)}>
                  <Label htmlFor="emailid" className="form-label">
                    Email <span>*</span>
                  </Label>
                  <div className="form-icon right">
                    <Input
                      name="email"
                      id="emailid"
                      className="form-control"
                      placeholder="name@company.com"
                      value={employeeObj.email || ""}
                      onChange={(e) => {
                      const val = e.target.value;
                     
                      setEmployeeObj({
                      ...employeeObj,
                      email: val,
                      });

                      setEmailTouched(true);
                      checkMaxLength("email", val);
                      FormikForm.setFieldValue("email", val);
                      FormikForm.setFieldTouched("email", true, false);
                      }}
                      onBlur={(e) => {
                      const value = e.target.value.trim().toLowerCase();

                      setEmployeeObj({
                      ...employeeObj,
                      email: value,
                      });

                     
                      FormikForm.setFieldValue("email", value);
                      FormikForm.handleBlur(e);

                      if (value !== "") {
                        setEmailTouched(true);
                      }
                      }}
                      invalid={
                        // !!(emailTouched && FormikForm.errors.email)
                          !!((emailTouched || hasAttemptedSubmit) &&
                          FormikForm.errors.email)
                      }
                      />
                      {
                      // !(emailTouched && FormikForm.errors.email)
                      !((emailTouched || hasAttemptedSubmit) && FormikForm.errors.email)
                       && 
                      <i className="ri-at-line"></i>
                      }
                      {/* {emailTouched && FormikForm.errors.email && ( */}
                       {(emailTouched || hasAttemptedSubmit) &&
                      FormikForm.errors.email &&
                      !lengthWarnings.email && (
                      <FormFeedback type="invalid">
                      {FormikForm.errors.email}
                      </FormFeedback>
                      )}
                      {lengthWarnings.email && (
                        <div className="lc_form_error_text">{lengthWarnings.email}</div>
                      )}
                      </div>
                      {!(
                        // emailTouched && FormikForm.errors.email
                          (emailTouched || hasAttemptedSubmit) &&
                          FormikForm.errors.email
                      ) && 
                      <div className="form-text mb-3">Enter email.</div>
                      }
                </div>
              </Col>

              {/* ── Gender ───────────────────────────────────────────────── */}
              <Col lg={12}>
                <div ref={(el) => (fieldRefs.current.gender = el)}>
                  <Label htmlFor="gender" className="form-label">
                    Gender <span>*</span>
                  </Label>
                  <Select
                    id="gender"
                    name="gender"
                    isMulti={false}
                    options={gender_options || []}
                    className="basic-multi-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          // FormikForm.touched.gender &&
                          (FormikForm.touched.gender || hasAttemptedSubmit) &&
                          FormikForm.errors.gender
                            ? "red"
                            : provided.borderColor,
                      }),
                    }}
                    value={
                      (employeeObj.gender &&
                        gender_options.find(
                          (e) => e.value === employeeObj.gender,
                        )) ||
                      []
                    }
                    onChange={(e) => {
                      console.log("Gender Selected:", e);
                      console.log("Gender Value:", e.value, typeof e.value);

                      setEmployeeObj({ ...employeeObj, gender: e.value });
                      FormikForm.setFieldValue("gender", e.value);
                      // FormikForm.setFieldTouched("gender", true);
                    }}
                    // onBlur={() => FormikForm.setFieldTouched("gender", true)}
                    onBlur={() => {
                      if (employeeObj.gender) {
                        FormikForm.setFieldTouched("gender", true);
                      }
                    }}
                  />
                  {(FormikForm.touched.gender || hasAttemptedSubmit) && FormikForm.errors.gender && (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.gender}
                    </div>
                  )}
                  {!(
                    (FormikForm.touched.gender || hasAttemptedSubmit) &&
                    FormikForm.errors.gender )&& 
                    <div className="form-text mb-3">Select gender.</div>
                  }
                </div>
              </Col>

              {/* ── DOB ──────────────────────────────────────────────────── */}
              <Col lg={12}>
                <div ref={(el) => (fieldRefs.current.dob = el)}>
                  <Label htmlFor="dob" className="form-label">
                    Date of Birth <span>*</span>
                  </Label>
                  <DatePicker
                    className={`form-control${(FormikForm.touched.dob || hasAttemptedSubmit) && FormikForm.errors.dob ? " border-danger" : ""}`}
                    placeholder="DD-MM-YYYY"
                    id="dob"
                    name="dob"
                    value={dob ? dayjs(dob, DateFormat) : null}
                    format={DateFormat}
                    onChange={handleDateChange}
                    allowClear={false}
                    disabledDate={disableDobDates}
                    inputReadOnly={true}
                  />
                  {(FormikForm.touched.dob || hasAttemptedSubmit) && FormikForm.errors.dob && (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.dob}
                    </div>
                  )}
                  {!(
                  (FormikForm.touched.dob || hasAttemptedSubmit) &&
                  FormikForm.errors.dob) && (
                    <div className="form-text mb-3">
                      Select a valid date of birth.
                    </div>
                  )}
                </div>
              </Col>

              {/* ── Contact Number ───────────────────────────────────────── */}
              <Col lg={12}>
                <div ref={(el) => (fieldRefs.current.contact_number = el)}>
                  <Label className="form-label">
                    Contact Number <span>*</span>
                  </Label>
                  <Dropdown
                    className="input-group"
                    isOpen={dropdownOpen4}
                    toggle={toggle4}
                  >
                    <DropdownToggle
                      as="button"
                      className="btn btn-light border arrow-none"
                    >
                      <img
                        src={contactCountry.flagImg}
                        alt="country flag"
                        className="options-flagimg"
                        height="20"
                      />
                      <span className="countrylist-codeno text-muted">
                        {contactCountry.countryCode}
                      </span>
                    </DropdownToggle>
                    <Input
                      type="text"
                      name="contact_number"
                      inputMode="numeric"
                      maxLength={10}
                      className="form-control rounded-end flag-input"
                      placeholder="Enter number"
                      value={employeeObj.contact_number || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 10);

                        updateProfileData("contact_number", value);
                        FormikForm.setFieldValue("contact_number", value);
                      }}
                      onBlur={() =>{
                        // FormikForm.setFieldTouched("contact_number", true)
                        if (employeeObj.contact_number && employeeObj.contact_number.trim() !== "") {
                          FormikForm.setFieldTouched("contact_number", true);
                      }
                    }}
                      invalid={
                        !!((FormikForm.touched.contact_number || hasAttemptedSubmit) &&
                          FormikForm.errors.contact_number)
                      }
                    />
                    {(FormikForm.touched.contact_number || hasAttemptedSubmit) &&
                      FormikForm.errors.contact_number && (
                        <FormFeedback type="invalid">
                          {FormikForm.errors.contact_number}
                        </FormFeedback>
                      )}
                    <DropdownMenu
                      as="ul"
                      className="list-unstyled w-100 dropdown-menu-list mb-0"
                    >
                      <SimpleBar
                        style={{ maxHeight: "220px" }}
                        className="px-3"
                      >
                        {CountryList.filter((obj) => obj.show)
                          .sort((a, b) =>
                            a.countryName.localeCompare(b.countryName),
                          )
                          .map((item, key) => (
                            <DropdownItem
                              as="li"
                              onClick={() => {
                                updateProfileData(
                                  "country_code",
                                  item.countryCode,
                                );
                                setContactCountry(item);
                              }}
                              key={key}
                              className="dropdown-item d-flex"
                            >
                              <div className="flex-shrink-0 me-2">
                                <img
                                  src={item.flagImg}
                                  alt="country flag"
                                  className="options-flagimg"
                                  height="20"
                                />
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex">
                                  <div className="country-name me-1">
                                    {item.countryName}
                                  </div>
                                  <span className="countrylist-codeno text-muted">
                                    {item.countryCode}
                                  </span>
                                </div>
                              </div>
                            </DropdownItem>
                          ))}
                      </SimpleBar>
                    </DropdownMenu>
                  </Dropdown>
                  {
                    !(
                        (FormikForm.touched.contact_number || hasAttemptedSubmit) &&
                        FormikForm.errors.contact_number
                      ) && (
                    <div className="form-text mb-3">
                      Enter contact number (10 digits only).
                    </div>
                  )}
                </div>
              </Col>

              {/* ── Branch ───────────────────────────────────────────────── */}
              <Col lg={12}>
                <div ref={(el) => (fieldRefs.current.branch_id_list = el)}>
                  <Label htmlFor="branch" className="form-label">
                    Branch <span>*</span>
                  </Label>
                  <Select
                    id="branch"
                    name="branch_id_list"
                    isMulti
                    closeMenuOnSelect={false}
                    options={branch_options || []}
                    className="basic-multi-select lc_multi_select"
                    classNamePrefix="lc-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          (FormikForm.touched.branch_id_list  || hasAttemptedSubmit)  &&
                          FormikForm.errors.branch_id_list
                            ? "red"
                            : provided.borderColor,
                      }),
                    }}
                    placeholder="Select Branch"
                    value={
                      employeeObj?.branch_id_list
                        ? branch_options.filter((d) =>
                            employeeObj?.branch_id_list.includes(d.id),
                          )
                        : []
                    }
                    onChange={(e) => {
                      handleBranchChange(e);
                      FormikForm.setFieldValue(
                        "branch_id_list",
                        e.map((d) => d.value),
                      );
                      // FormikForm.setFieldTouched("branch_id_list", true);
                    }}
                    onBlur={() =>{
                      if (employeeObj.branch_id_list && employeeObj.branch_id_list.length > 0) {
                        FormikForm.setFieldTouched("branch_id_list", true);
                      }
                    }}
                  />
                  {(FormikForm.touched.branch_id_list || hasAttemptedSubmit) &&
                    FormikForm.errors.branch_id_list && (
                      <div className="lc_form_error_text">
                        {FormikForm.errors.branch_id_list}
                      </div>
                    )}
                  {!(
                    (FormikForm.touched.branch_id_list || hasAttemptedSubmit) &&
                    FormikForm.errors.branch_id_list ) && 
                    <div className="form-text mb-3">Select branch.</div>
                  }
                </div>
              </Col>

              {/* ── Primary Department ───────────────────────────────────── */}
              <Col lg={12}>
                <div ref={(el) => (fieldRefs.current.primary_department_id_list = el)}>
                  <Label
                    htmlFor="primary_department_id_list"
                    className="form-label"
                  >
                    Primary Department <span>*</span>
                  </Label>
                  <Select
                    id="primary_department_id_list"
                    name="primary_department_id_list"
                    isMulti
                    options={dep_options || []}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
                    closeMenuOnSelect={false}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          (FormikForm.touched.primary_department_id_list  || hasAttemptedSubmit)&&
                          FormikForm.errors.primary_department_id_list
                            ? "red"
                            : provided.borderColor,
                      }),
                    }}
                    placeholder="Select Primary Department"
                    value={
                      employeeObj?.primary_department_id_list
                        ? dep_options.filter((d) =>
                            employeeObj?.primary_department_id_list.includes(
                              d.id,
                            ),
                          )
                        : []
                    }
                    onChange={(e) => {
                      handlePrimaryDepChange(e);
                      FormikForm.setFieldValue(
                        "primary_department_id_list",
                        e.map((d) => d.id),
                      );
                      // FormikForm.setFieldTouched(
                      //   "primary_department_id_list",
                      //   true,
                      // );
                    }}
                    onBlur={() =>{
                        if (
                            employeeObj.primary_department_id_list &&
                            employeeObj.primary_department_id_list.length > 0
                          )
                       {
                         FormikForm.setFieldTouched(
                        "primary_department_id_list",
                        true,
                      )
                      }
                    } 
                    }
                  />
                  {(FormikForm.touched.primary_department_id_list  || hasAttemptedSubmit)  &&
                    FormikForm.errors.primary_department_id_list && (
                      <div className="lc_form_error_text">
                        {FormikForm.errors.primary_department_id_list}
                      </div>
                    )}
                  {!(
                  (FormikForm.touched.primary_department_id_list || hasAttemptedSubmit) &&
                  FormikForm.errors.primary_department_id_list ) && 
                    <div className="form-text mb-3">
                      Select primary department.
                    </div>
                  }
                </div>
              </Col>

              {/* ── Reporting Manager ────────────────────────────────────── */}
              <Col lg={12}>
                <div ref={(el) => (fieldRefs.current.reporting_manager_id = el)}>
                  <Label htmlFor="reporting_manager_id">
                    Reporting Manager <span>*</span>
                  </Label>
                  <Select
                    id="reporting_manager_id"
                    name="reporting_manager_id"
                    isMulti={false}
                    isClearable={true}
                    options={reportingManagerOptions || []}
                    components={{ Option: EmployeeDisplayInSelect }}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
                     styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          (FormikForm.touched.reporting_manager_id || hasAttemptedSubmit) &&
                          FormikForm.errors.reporting_manager_id
                            ? "red"
                            : provided.borderColor,
                      }),
                    }}
                    value={
                      (employeeObj.reporting_manager_id &&
                        reportingManagerOptions.find(
                          (e) => e.id === employeeObj.reporting_manager_id,
                        )) ||
                      null
                    }
                  //   onChange={(selectedOption) => {
                  //     setEmployeeObj({
                  //       ...employeeObj,
                  //       reporting_manager_id: selectedOption
                  //         ? selectedOption.id
                  //         : null,
                  //     });
                  //   }}
                  // />
                  onChange={(selectedOption) => {
                    const val = selectedOption ? selectedOption.id : 0;
                    setEmployeeObj({ ...employeeObj, reporting_manager_id: val });
                    FormikForm.setFieldValue("reporting_manager_id", val);
                    // FormikForm.setFieldTouched("reporting_manager_id", true);
                  }}
                  onBlur={() => {
                    if (employeeObj.reporting_manager_id) {
                      FormikForm.setFieldTouched("reporting_manager_id", true)}
                  }}
                />
                {(FormikForm.touched.reporting_manager_id || hasAttemptedSubmit) &&
                  FormikForm.errors.reporting_manager_id && (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.reporting_manager_id}
                    </div>
                )}
                </div>
                {!(
                  (FormikForm.touched.reporting_manager_id || hasAttemptedSubmit) &&
                  FormikForm.errors.reporting_manager_id
                )&&
                <div className="form-text mb-3">Select reporting manager.</div>}
              </Col>

              {/* ── Role ─────────────────────────────────────────────────── */}
              <Col lg={12}>
                <div ref={(el) => (fieldRefs.current.role_id = el)}>
                  <Label htmlFor="role_id" className="form-label">
                    Role <span>*</span>
                  </Label>
                  <Select
                    id="role_id"
                    name="role_id"
                    isMulti={false}
                    options={role_id_option || []}
                    className="basic-multi-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          (FormikForm.touched.role_id || hasAttemptedSubmit)&&
                          FormikForm.errors.role_id
                            ? "red"
                            : provided.borderColor,
                      }),
                    }}
                    value={
                      (employeeObj.role_id &&
                        role_id_option.find(
                          (e) => e.id === employeeObj?.role_id,
                        )) ||
                      []
                    }
                    onChange={(e) => {
                      setEmployeeObj({ ...employeeObj, role_id: e.id });
                      FormikForm.setFieldValue("role_id", e.id);
                      // FormikForm.setFieldTouched("role_id", true);
                    }}
                    onBlur={() =>
                      {
                        if (employeeObj.role_id) {
                          FormikForm.setFieldTouched("role_id", true);
                        }
                      } }
                  />
                  {(FormikForm.touched.role_id || hasAttemptedSubmit) && FormikForm.errors.role_id && (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.role_id}
                    </div>
                  )}
                  {
                  !(
                  (FormikForm.touched.role_id || hasAttemptedSubmit) &&
                  FormikForm.errors.role_id ) && 
                    <div className="form-text mb-3">Select role.</div>
                  }
                </div>
              </Col>

              {/* ── Work Schedule ────────────────────────────────────────── */}
              <Col lg={12}>
                <div ref={(el) => (fieldRefs.current.work_schedule_id = el)}>
                  <Label htmlFor="empWs" className="form-label">
                    Work Schedule <span>*</span>
                  </Label>
                  <Select
                    id="empWs"
                    name="work_schedule_id"
                    isMulti={false}
                    options={ws_options || []}
                    className="basic-multi-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          (FormikForm.touched.work_schedule_id || hasAttemptedSubmit) &&
                          FormikForm.errors.work_schedule_id
                            ? "red"
                            : provided.borderColor,
                      }),
                    }}
                    value={
                      (employeeObj.work_schedule_id &&
                        Array.isArray(ws_options) &&
                        ws_options.find(
                          (e) => e.id === employeeObj.work_schedule_id,
                        )) ||
                      []
                    }
                    onChange={(e) => {
                      setEmployeeObj({
                        ...employeeObj,
                        work_schedule_id: e.id,
                      });
                      FormikForm.setFieldValue("work_schedule_id", e.id);
                      // FormikForm.setFieldTouched("work_schedule_id", true);
                    }}
                    onBlur={() =>
                      {
                        if (employeeObj.work_schedule_id) {
                          FormikForm.setFieldTouched("work_schedule_id", true);
                        }
                      }
                    }
                  />
                  {(FormikForm.touched.work_schedule_id || hasAttemptedSubmit) &&
                    FormikForm.errors.work_schedule_id && (
                      <div className="lc_form_error_text">
                        {FormikForm.errors.work_schedule_id}
                      </div>
                    )}
                  {!(
                  (FormikForm.touched.work_schedule_id || hasAttemptedSubmit) &&
                  FormikForm.errors.work_schedule_id ) && 
                    <div className="form-text mb-3">Select work schedule.</div>
                  }
                </div>
              </Col>

              {/* ── Joining Date ─────────────────────────────────────────── */}
              <Col lg={12}>
                <div ref={(el) => (fieldRefs.current.joining_date = el)}>
                  <Label htmlFor="joining_date" className="form-label">
                    Joining Date <span>*</span>
                  </Label>
                  <DatePicker
                    className={`form-control${(FormikForm.touched.joining_date || hasAttemptedSubmit) && FormikForm.errors.joining_date ? " border-danger" : ""}`}
                    id="joining_date"
                    name="joining_date"
                    value={
                      joining_date ? dayjs(joining_date, DateFormat) : null
                    }
                    format={DateFormat}
                    allowClear={false}
                    onChange={handleJoinDateChange}
                    disabledDate={disableJoiningDates}
                    inputReadOnly={true}
                  />
                  {(FormikForm.touched.joining_date || hasAttemptedSubmit) &&
                    FormikForm.errors.joining_date && (
                      <div className="lc_form_error_text">
                        {FormikForm.errors.joining_date}
                      </div>
                    )}
                  {!(
                    (FormikForm.touched.joining_date || hasAttemptedSubmit) &&
                    FormikForm.errors.joining_date
                  ) && (
                    <div className="form-text mb-3">
                      Select a valid joining date (up to 1 year in the future).
                    </div>
                  )}
                </div>
              </Col>

              {/* ── Employment Type ──────────────────────────────────────── */}
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlFor="employment_type" className="form-label">
                    Employment Type <span>*</span>
                  </Label>
                  <select
                    className="form-control"
                    id="employment_type"
                    name="employment_type"
                    value={employeeObj?.employment_type || 2}
                    onChange={handleEmploymentTypeChange}
                  >
                    <option value={1}>Probation</option>
                    <option value={2}>Full Time</option>
                  </select>
                </div>
              </Col>

              {/* ── Probation End Date (only when Probation) ─────────────── */}
              {Number(employeeObj?.employment_type) === 1 && (
                <Col lg={12}>
                  <div>
                    <Label htmlFor="probation_end_date" className="form-label">
                      Probation End Date <span>*</span>
                    </Label>
                    <DatePicker
                      className="form-control"
                      id="probation_end_date"
                      name="probation_end_date"
                      value={
                        probation_end_date
                          ? dayjs(probation_end_date, DateFormat)
                          : null
                      }
                      format={DateFormat}
                      allowClear={false}
                      onChange={handleProbationEndDateChange}
                      inputReadOnly={true}
                    />
                    <div className="form-text mb-3">
                      {defaultProbationMonths
                        ? `Auto-filled to ${defaultProbationMonths} month(s) from joining; adjust if needed.`
                        : "No probation policy configured — please set the end date manually."}
                    </div>
                  </div>
                </Col>
              )}

              {/* ── ID Proof ─────────────────────────────────────────────── */}
              {/* {selectedFileName ? (
                <table>
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Selected File Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>ID Proof</td>
                      <td>{selectedFileName}</td>
                      <td>
                        <button onClick={handleClearFile}>
                          <i className="ri-close-line fs-16"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <Col>
                  <div>
                    <Label htmlFor="formFile" className="form-label">
                      ID Proof
                    </Label>
                    <Input
                      className="form-control"
                      type="file"
                      accept=".jpg,.jpeg,.pdf,.doc,.docx"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "id_proof")}
                    />
                  </div>
                </Col>
              )}
              <div className="form-text mb-3">
                {!selectedFileName && <p>Select ID proof.</p>}
              </div> */}

              {/* ── Time Zone ────────────────────────────────────────────── */}
              <Col lg={12}>
                <div>
                  <Label htmlFor="profile_timezone" className="form-label">
                    Time Zone
                  </Label>
                  <Select
                    name="profile_timezone"
                    id="profile_timezone"
                    value={
                      employeeObj.profile_timezone &&
                      timzone_options.find(
                        (e) => e.value === employeeObj.profile_timezone,
                      )
                    }
                    onChange={handleTimeZoneChange}
                    options={timzone_options}
                    placeholder="Select a time zone"
                  />
                </div>
                <div className="form-text mb-3">Select time zone.</div>
              </Col>

              {/* ── Toggle Fields ─────────────────────────────────────────── */}
              {[
                {
                  id: "allow_attendance_outside_the_range",
                  label: "Allow Check In/Out Outside the Range",
                  field: "allow_attendance_outside_the_range",
                  hint: `Check if <b><i>${employeeObj.first_name}</i></b> is allowed to check in/out outside the branch range.`,
                },
                {
                  id: "outside_range",
                  label: "Outside Range Notes Required",
                  field: "outside_range_notes_required",
                  hint: `Check if <b><i>${employeeObj.first_name}</i></b> is required to add notes when outside range.`,
                },
                {
                  id: "can_web_checkin",
                  label: "Allow Web Check In/Out",
                  field: "can_web_checkin",
                  hint: `Check if <b><i>${employeeObj.first_name}</i></b> is allowed to web check in/out.`,
                },
              ].map(({ id, label, field, hint }) => (
                <Col md={12} lg={12} xxl={12} key={id}>
                  <div>
                    <Label htmlFor={id} className="form-label">
                      {label}
                    </Label>
                    <div className="mb-2">
                      <div
                        className="form-check form-switch form-switch-md form-switch-success"
                        dir="ltr"
                      >
                        <Input
                          id={id}
                          type="checkbox"
                          className="form-check-input"
                          checked={!!employeeObj[field]}
                          onChange={(e) =>
                            setEmployeeObj({
                              ...employeeObj,
                              [field]: e.target.checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="form-text mb-3"
                    dangerouslySetInnerHTML={{ __html: hint }}
                  />
                </Col>
              ))}

              {/* ── Attendance Methods ───────────────────────────────────── */}
              <Col md={12} lg={12} xxl={12}>
                <div ref={(el) => (fieldRefs.current.allowed_attendance_methods = el)}>
                  <Label htmlFor="auth_types" className="form-label">
                    Allowed Attendance Methods <span>*</span>
                  </Label>
                  <div className="d-flex gap-4 mb-2">
                    {[
                      {
                        id: "face_lock",
                        label: "Face Recognition",
                        key: "requires_face_verification",
                      },
                      {
                        id: "fingerprint",
                        label: "Fingerprint",
                        key: "requires_biometric_authentication",
                      },
                      {
                        id: "manual_checkin",
                        label: "Manual Check-In",
                        key: "allow_manual_checkin",
                      },
                    ].map(({ id, label, key }) => (
                      <div className="form-check" key={id}>
                        <Input
                          id={id}
                          name={id}
                          type="checkbox"
                          className="form-check-input"
                          checked={
                            employeeObj.allowed_attendance_methods?.[key] ||
                            false
                          }
                          onChange={(e) =>
                            setEmployeeObj({
                              ...employeeObj,
                              allowed_attendance_methods: {
                                ...employeeObj?.allowed_attendance_methods,
                                [key]: e.target.checked,
                              },
                            })
                          }
                        />
                        <Label className="form-check-label" htmlFor={id}>
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {hasAttemptedSubmit &&
                    FormikForm.errors.allowed_attendance_methods && (
                      <div className="lc_form_error_text">
                        {FormikForm.errors.allowed_attendance_methods}
                      </div>
                  )}
                  {errors && (
                    <div style={{ color: "red", marginTop: "4px" }}>
                      {errors}
                    </div>
                  )}
                </div>
              </Col>

              <hr />

              {/* ── Custom Fields ────────────────────────────────────────── */}
              {employeeObj.cf_values && employeeObj.cf_values.length
                ? employeeObj.cf_values.map((obj) => (
                    <Col lg={12} key={obj.id}>
                      <div className="mb-3">
                        <Label htmlFor={obj.input_name} className="form-label">
                          {obj.name} {obj.is_required && <span>*</span>}
                        </Label>
                        {form_default_input_types.includes(obj.type) && (
                          <Fragment>
                            <div className="form-icon right">
                              <Input
                                type={obj.type || "text"}
                                name={obj.input_name}
                                id={obj.input_name}
                                className="form-control"
                                placeholder={`Enter ${obj.name}`}
                                value={obj.value || ""}
                                onChange={(e) => handleCFInputChange(e, obj.id)}
                                invalid={
                                  !!(
                                    obj.is_required &&
                                    hasAttemptedSubmit &&
                                    (!obj.value ||
                                      String(obj.value).trim() === "")
                                  )
                                }
                              />
                              <i className="ri-user-2-line"></i>
                            </div>
                            {obj.is_required &&
                            hasAttemptedSubmit &&
                            (!obj.value || String(obj.value).trim() === "") ? (
                              <div className="lc_form_error_text">
                                This field is required
                              </div>
                            ) : (
                              <div className="form-text">Enter {obj.name}</div>
                            )}
                          </Fragment>
                        )}
                        {obj.type === form_file_type && (
                          <Fragment>
                            <div className="form-icon right">
                              <Input
                                type="file"
                                name={obj.input_name}
                                id={obj.input_name}
                                className="form-control"
                                onChange={(e) => handleCFFileChange(e, obj.id)}
                                invalid={
                                  !!(
                                    obj.is_required &&
                                    hasAttemptedSubmit &&
                                    (!obj.value ||
                                      String(obj.value).trim() === "")
                                  )
                                }
                              />
                              <i className="ri-user-2-line"></i>
                            </div>
                            {obj.is_required &&
                            hasAttemptedSubmit &&
                            (!obj.value || String(obj.value).trim() === "") ? (
                              <div className="lc_form_error_text">
                                This field is required
                              </div>
                            ) : (
                              <div className="form-text">Choose {obj.name}</div>
                            )}
                            {!!obj.value && obj.value !== "" && (
                              <Fragment>{obj.name} Uploaded</Fragment>
                            )}
                          </Fragment>
                        )}
                        {obj.type === form_date_type && (
                          <DatePicker
                            name={obj.input_name}
                            id={obj.input_name}
                            className="form-control"
                            format={DateFormat}
                            value={
                              obj.value === ""
                                ? null
                                : dayjs(
                                    ConvertDateFormat(obj.value),
                                    DateFormat,
                                  )
                            }
                            allowClear={false}
                            onChange={(e, dateStr) =>
                              handleCFDateChange(e, dateStr, obj.id)
                            }
                          />
                        )}
                        {obj.type === form_select_type && (
                          <Fragment>
                            <Select
                              name={obj.input_name}
                              id={obj.input_name}
                              options={obj.options}
                              styles={{
                                control: (provided, state) => ({
                                  ...provided,
                                  borderColor:
                                    !state.isFocused &&
                                    obj.is_required &&
                                    hasAttemptedSubmit &&
                                    (!obj.value ||
                                      String(obj.value).trim() === "")
                                      ? "red"
                                      : provided.borderColor,
                                }),
                              }}
                              value={
                                obj.options.find(
                                  (d) => d.value === obj.value,
                                ) || []
                              }
                              onChange={(e) => handleCFSelectChange(e, obj.id)}
                              placeholder={`Select ${obj.name}`}
                            />
                            {obj.is_required &&
                              hasAttemptedSubmit &&
                              (!obj.value ||
                                String(obj.value).trim() === "") && (
                                <div className="lc_form_error_text">
                                  This field is required
                                </div>
                              )}
                          </Fragment>
                        )}
                      </div>
                    </Col>
                  ))
                : null}
              <Col md={12} lg={12} xxl={12}>
                <div className="text-end mb-3">
                  <Button type="submit" color="success" className="btn-label">
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                    Save
                  </Button>
                </div>
              </Col>
              {/* ── Add Location Button — only shown for existing employees ──── */}
              {isExistingEmployee && (
                <Col lg={12} className="mb-3">
                  {/* Save Button */}

                  <Label className="form-label mb-0">Custom Locations</Label>
                  <div className="form-text mt-1">
                    Add or manage employee locations.
                  </div>
                </Col>
              )}

              {(isExistingEmployee &&
                employeeObj?.entity_location_details &&
                employeeObj?.entity_location_details.length > 0 && (
                  <Col lg={12}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Address</th>
                          <th>Radius</th>
                          <th>Image</th>
                          <th>Edit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeObj?.entity_location_details?.filter(
                          (location) => location.type === "employee",
                        ).length > 0 ? (
                          employeeObj?.entity_location_details
                            ?.filter((location) => location.type === "employee")
                            .map((location, index) => (
                              <tr key={index}>
                                <td>{location.name}</td>
                                <td>{location.accurate_address}</td>
                                <td>{location.radius_range} m</td>
                                <td>
                                  <img
                                    src={
                                      location.image_url
                                        ? location.image_url
                                        : no_image
                                    }
                                    alt="location"
                                    style={{
                                      height: "50px",
                                      objectFit: "cover",
                                    }}
                                  />
                                </td>
                                <td>
                                  <a
                                    onClick={() => handleEditLocation(location)}
                                    className="text-primary d-inline-block edit-item-btn ms-2"
                                    href="javascript:void(0)"
                                  >
                                    <i className="ri-pencil-fill fs-16"></i>
                                  </a>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">
                              No Custom Location
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </Col>
                )) ||
                null}

              {isExistingEmployee && (
                <Col lg={12}>
                  <div className="text-end mt-3">
                    <Button
                      color="primary"
                      type="button"
                      onClick={handleAddLocationClick}
                    >
                      Add Location <i className="ri-map-pin-line"></i>
                    </Button>
                  </div>
                </Col>
              )}

              {/* ── Save button for new employees ─────────────────────────── */}
              {/* {!isExistingEmployee && (
                <Col lg={12}>
                  <div className="text-end mt-3">
                    <Button type="submit" color="success" className="btn-label">
                      <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                      Save
                    </Button>
                  </div>
                </Col>
              )} */}
            </Row>
          </Form>
        </Col>
      </Row>

      {/* ── Location Modal ───────────────────────────────────────────────────── */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        employeeObj={employeeObj}
        setEmployeeObj={setEmployeeObj}
        locationToEdit={locationToEdit}
      />

      {/* ── Reporting Manager Reassignment Modal ─────────────────────────────── */}
      <Modal
        fade={true}
        isOpen={showRMModal}
        toggle={onRMModalCloseClick}
        centered={true}
      >
        <ModalBody className="py-2 px-3">
          <div className="mt-2 text-center">
            <div className="mt-4 pt-2 fs-15 mx-4">
              <h4>Assign New Reporting Manager</h4>
            </div>
            <div className="mt-3 pt-1">
              <p>
                <b>{employeeObj?.first_name}</b> is the reporting manager for
                the following employees
              </p>
            </div>
            <div className="mt-3 pt-1">
              {TeamsToBeUpdated &&
                TeamsToBeUpdated.map((d) => (
                  <React.Fragment key={d.id}>
                    <Row className="mt-2">
                      <Col lg={12} style={{ textAlign: "left" }}>
                        <h5>{d?.name}</h5>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={6}>
                        <Select
                          name={`rep_man_select_${d.id}`}
                          id={`rep_man_id_${d.id}`}
                          options={d.rep_man_options}
                          components={{ Option: EmployeeDisplayInSelect }}
                          value={
                            d.rep_man_options.find(
                              (e) =>
                                e.id === parseInt(d.new_reporting_manager_id),
                            ) || []
                          }
                          onChange={(e) => handleNewReportingManager(e, d?.id)}
                          className="basic-multi-select"
                        />
                      </Col>
                      <Col lg={6}>
                        <h5>Employees</h5>
                        {d?.employee_details?.map((m) => (
                          <h6 key={m?.id}>{m?.name}</h6>
                        ))}
                      </Col>
                    </Row>
                  </React.Fragment>
                ))}
            </div>
          </div>
          <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
            <button
              type="button"
              className="btn w-sm btn-light"
              onClick={() => setShowRMModal(false)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn w-sm btn-danger"
              onClick={assignNewReportingManager}
            >
              Assign
            </button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default EmployeeForm;