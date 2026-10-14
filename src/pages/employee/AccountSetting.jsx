import React, { useEffect, useRef, useState } from "react";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormFeedback,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { Link, useNavigate, useParams } from "react-router-dom";
import { testId } from "../../shared/testing/testId";
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
import DummyUserImg from "../../assets/images/users/user.png";
import avatar from "../../assets/images/users/avatar-1.jpg";
import { DatePicker } from "antd";
import Select from "../../shared/ui/TestableSelect";
import {
  gender_options,
  form_default_input_types,
  form_select_type,
  timzone_options,
  form_date_type,
  DateFormat,
  form_file_type,
} from "../../common/constant/Constants";
import { EmployeeDisplayInSelect } from "../../common/js/EmployeeDisplayInSelect";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { useDispatch, useSelector } from "react-redux";
// FIX: this reducer only exports the action creator "setEmployeeAccountSettingsData"
// (and the default reducer). There is no "account_settings_data" export, so the
// old import below resolved to undefined and was also being shadowed by the
// useSelector destructure of the same name a few lines down — meaning redux's
// AccountSettingsReducer slice was NEVER updated after a successful save.
// That's why the old image came back after a refresh.
import { setEmployeeAccountSettingsData } from "../../redux/reducers/ChildReducer/AccountSettingsReducer";
import InputGroupAddon from "rsuite/esm/InputGroup/InputGroupAddon";
import "../../common/css/lc_style.css";
import "./accountSetting.scss";

const PROFILE_FIELDS = [
  "profile_url",
  "first_name",
  "last_name",
  "emp_id",
  "gender",
  "contact_number",
  "email",
  "dob",
  "joining_date",
  "reporting_manager_id",
  "work_schedule_id",
];

const SETTINGS_TABS = [
  { id: "1", label: "Personal details", icon: "ri-user-3-line" },
  { id: "2", label: "Change password", icon: "ri-lock-password-line" },
  { id: "4", label: "Privacy policy", icon: "ri-shield-check-line" },
];

const AccountSettings = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const { account_settings_data } = useSelector(
    (state) => state.AccountSettingsReducer,
  );

  // Populated independently at app bootstrap (see EmployeeView.js, which
  // already relies on this surviving a refresh for its own access checks).
  // Used below to re-derive "self" after a cold refresh wipes
  // AccountSettingsReducer back to {}.
  const { profile_data } = useSelector((state) => state.MyProfileReducer);

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const [employeeObj, setEmployeeObj] = useState({});
  console.log("employeesss", employeeObj);

  const employee_data = GetLocalStorageData("employee");
  const branch_options = GetLocalStorageData("branch") || [];
  const dep_options = GetLocalStorageData("department") || [];
  const ws_options = GetLocalStorageData("work_schedule") || [];
  const role_id_option = GetLocalStorageData("role") || [];

  const [reportingManagerOptions, setReportingManagerOptions] = useState([]);
  const inputRef = useRef();

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
  const [activeTab, setActiveTab] = useState("1");
  const [profileObj, setProfileObj] = useState({});

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);
  const [changePassword, setChangePassword] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const tabChange = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  const navigate = useNavigate();

  useEffect(() => {
    // FIX: AccountSettingsReducer only ever gets populated by EmployeeView's
    // one-off dispatch when the "Account Settings" button is clicked. A hard
    // refresh resets redux to {} and there's no route param here to re-fetch
    // by, so without this the page falls back to whatever stale/empty data
    // it can find (hence the dummy image reappearing).
    //
    // Self-heal: once profile_data (fetched independently at app bootstrap)
    // is available, look up "self" directly from the persisted "employee"
    // array in local storage — which SetLocalStorage("employee", ..., 3)
    // keeps correctly patched with the latest profile_url on every save —
    // and push that into AccountSettingsReducer so the effect below can run.
    if (
      (!account_settings_data || !Object.keys(account_settings_data).length) &&
      profile_data?.id
    ) {
      const employeeList = GetLocalStorageData("employee") || [];
      const selfRecord = employeeList.find((d) => d.id === profile_data.id);
      if (selfRecord) {
        dispatch(setEmployeeAccountSettingsData(selfRecord));
      }
    }
  }, [profile_data, account_settings_data]);

  useEffect(() => {
    // Guard: on hard refresh Redux resets, so account_settings_data can be
    // {} or undefined. Bail out until it's actually populated (the effect
    // above will populate it shortly once profile_data is ready).
    if (!account_settings_data || !Object.keys(account_settings_data).length) {
      return;
    }

    setEmployeeObj({
      ...account_settings_data,
      role_id: account_settings_data?.role?.id,
      // FIX: backend/local-storage copies of gender can come back as a
      // string ("1") while gender_options uses numbers (1). The Select's
      // value lookup used a strict === comparison, so 1 !== "1" made the
      // dropdown render empty right after a successful save. Normalizing
      // here keeps gender a Number everywhere it's read from in this file.
      gender: account_settings_data.gender != null
        ? Number(account_settings_data.gender)
        : "",
      dob: ConvertISODateFormat(account_settings_data.dob),
      joining_date: ConvertISODateFormat(account_settings_data.joining_date),
    });
    setDob(ConvertDateFormat(ConvertISODateFormat(account_settings_data.dob)));
    setJoinDate(
      ConvertDateFormat(
        ConvertISODateFormat(account_settings_data.joining_date),
      ),
    );

    account_settings_data?.primary_department_id_list?.length
      ? GetReportingManager(account_settings_data.primary_department_id_list)
      : setReportingManagerOptions([]);

    if (
      account_settings_data.country_code !== "" &&
      account_settings_data.country_code !== null &&
      account_settings_data.country_code !== undefined
    ) {
      const matchedCountry = CountryList.find(
        (d) => d.countryCode === account_settings_data.country_code,
      );
      if (matchedCountry) {
        setContactCountry(matchedCountry);
      }
    }
  }, [account_settings_data]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeObj({
      ...employeeObj,
      [name]: value,
    });
  };

  const handleProfileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEmployeeImage(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const newImageSrc = readerEvent.target.result;
        setEmployeeObj({
          ...employeeObj,
          profile_url: newImageSrc,
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleBranchChange = (e) => {
    let branch_id_list = e.map((d) => d.value);

    setEmployeeObj({
      ...employeeObj,
      branch_id_list: branch_id_list,
    });
  };

  const GetReportingManager = async (valid_dep_ids) => {
    const Api = await PostApi(
      "employee/get-employee-list-for-reporting-manager/",
      { dep_id: valid_dep_ids },
      false,
    );

    if (Api.status && Api.status === 200) {
      const response = Api?.data?.data;

      setReportingManagerOptions(
        employee_data.filter(
          (d) => d.id !== account_settings_data.id && response.includes(d.id),
        ),
      );
    } else {
      console.log("ERRR = ", Api?.data?.message);
    }
  };

  const handlePrimaryDepChange = async (e) => {
    let valid_dep_obj = [];
    let valid_dep_ids = [];

    for (var i = 0; i < e.length; i++) {
      var is_child = false;
      for (var j = 0; j < e.length; j++) {
        if (i !== j) {
          if (e[j].child_id_list.includes(e[i].id)) {
            is_child = true;
          }
        }
      }
      if (is_child === false) {
        valid_dep_obj.push(e[i]);
        valid_dep_ids.push(e[i].id);
      }
    }

    if (valid_dep_ids.length) {
      GetReportingManager(valid_dep_ids);
    } else {
      setReportingManagerOptions([]);
    }

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
  };
  const handleJoinDateChange = (selectedJoinDate, dateStr, instance) => {
    setJoinDate(dateStr);
    setEmployeeObj({
      ...employeeObj,
      joining_date: ConvertISODateFormat(ConvertDateFormat(dateStr)),
    });
  };
  const handleTimeZoneChange = (selectedTimezone) => {
    setEmployeeObj({
      ...employeeObj,
      profile_timezone: selectedTimezone.value,
    });
  };
  const updateProfileData = (name, value) => {
    setEmployeeObj({
      ...employeeObj,
      [name]: value,
    });
  };

  const handleNumberOnly = (e, field) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    updateProfileData(field, val.slice(0, 10));
  };

  const handleFileUpload = (e, name) => {
    const file = e.target.files[0];

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

    const Api = await PostApi(
      "fields/upload-custom-field-file/",
      cf_form_data,
      true,
    );

    if (Api.status && Api.status === 200) {
      img_url = String(Api?.data?.data);
    } else {
      img_url = "";
      toast.error(Api?.data?.message || Api?.data?.detail);
    }

    setEmployeeObj({
      ...employeeObj,
      cf_values: [...employeeObj.cf_values].map((item) =>
        item.id === cf_id ? { ...item, value: img_url } : item,
      ),
    });
  };

  const FormikFormPassword = useFormik({
    // enableReinitialize: true,
    initialValues: changePassword,
    validationSchema: Yup.object({
      old_password: Yup.string()
        .matches(/^\S*$/, "Password cannot contain spaces")
        .required("Old Password is required"),
      new_password: Yup.string()
        .matches(/^\S*$/, "Password cannot contain spaces")
        .min(8, "Minimum 8 characters required")
        .max(20, "Maximum 20 characters allowed")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).*$/,
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.",
        )
        .notOneOf(
          [Yup.ref("old_password"), null],
          "New Password must be different from Old Password",
        )
        .required("New Password is required"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("new_password"), null], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    onSubmit: async (values) => {
      const Api = await PostApi("employee/reset-own-password/", values, false);

      if (Api.status && Api.status === 200) {
        toast.success(Api?.data?.message);
        setChangePassword({
          old_password: "",
          new_password: "",
          confirm_password: "",
        });
        navigate(`/employee/view/${employeeObj.emp_uuid}`);
      } else {
        const backendMessage =
          Api?.data?.message || Api?.data?.detail || "Something Went Wrong";

        FormikFormPassword.setFieldTouched("old_password", true, false);
        FormikFormPassword.setFieldError("old_password", backendMessage);

        toast.error(backendMessage);
      }
    },
  });

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: employeeObj,
    validationSchema: Yup.object({
      first_name: Yup.string().trim().required("Please Enter First Name"),
      last_name: Yup.string().trim().required("Please Enter Last Name"),
      gender: Yup.number()
        .required("Select Gender")
        .min(1, "Please Select Gender"),
      dob: Yup.string().trim().required("Please Select Date"),
      contact_number: Yup.string()
        .required("Please Enter Phone Number")
        .matches(/^[0-9]+$/, "Phone number must contain digits only")
        .length(10, "Phone number must be 10 digits"),
    }),
    onSubmit: async (values) => {
      let root_department = dep_options.find((d) => d.is_root === true);
      let root_department_id = !!root_department && root_department.id;

      if (
        !(values?.primary_department_id_list || []).includes(
          root_department_id,
        ) &&
        values?.reporting_manager_id === 0
      ) {
        toast.error("Please Select Reporting Manager");
      } else {
        dispatch(setLoaderVisible(true));

        let form_data = new FormData();

        if (employeeImage !== null) {
          form_data.append("profile", employeeImage, employeeImage.name);
        }

        form_data.append("first_name", employeeObj.first_name || "");
        form_data.append("last_name", employeeObj.last_name || "");
        form_data.append("email", employeeObj.email || "");
        form_data.append("dob", employeeObj.dob || "");
        form_data.append("contact_number", employeeObj.contact_number || "");
        form_data.append("country_code", employeeObj.country_code || "");
        form_data.append("gender", employeeObj.gender || "");
        form_data.append("joining_date", employeeObj.joining_date || "");
        form_data.append(
          "profile_timezone",
          employeeObj.profile_timezone || "",
        );

        const Api = await PostApi(
          "employee/update-profile/",
          form_data,
          true,
        );

        if (Api.status && Api.status === 200) {
          // employeeObj.id === 0
          //   ? dispatch(addEmployee(Api?.data.data))
          //   : dispatch(editEmployee(Api?.data?.data));

          if (employeeObj.id !== 0) {
            dispatch(editEmployee(Api?.data?.data));
            SetLocalStorage("employee", Api?.data.data, 3);
          }

          // FIX: this is the missing piece. The page reads its state from
          // AccountSettingsReducer's "account_settings_data" (see useSelector
          // above and the useEffect that seeds employeeObj from it). Without
          // this dispatch, that slice — including the new profile_url the
          // server just saved — never gets updated, so a page refresh falls
          // back to the old value still sitting in that slice/local storage.
          dispatch(setEmployeeAccountSettingsData(Api?.data?.data));

          // Clear the pending file now that it has been uploaded and saved,
          // so a future submit without picking a new photo doesn't resend it.
          setEmployeeImage(null);

          dispatch(toggleRSBView(false));
          toast.success(Api?.data?.message);
        } else {
          toast.error(Api?.data?.message || Api?.data?.detail);
        }

        dispatch(setLoaderVisible(false));
      }
    },
  });

  useEffect(() => {
    if (
      FormikForm.submitCount > 0 &&
      Object.keys(FormikForm.errors).length > 0
    ) {
      const firstErrorField = Object.keys(FormikForm.errors)[0];
      FormikForm.setFieldTouched(firstErrorField);
      const errorField = document.querySelector(`[name=${firstErrorField}]`);
      if (errorField) {
        errorField.focus();

        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
  }, [
    FormikForm.submitCount,
    FormikForm.errors,
    FormikForm.setFieldTouched,
    inputRef,
  ]);

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
  const roleName = employeeObj?.role?.id
    ? role_id_option.find((d) => d.id === employeeObj?.role?.id)?.name || ""
    : "";
  const fullName = [employeeObj.first_name, employeeObj.last_name]
    .filter(Boolean)
    .join(" ");
  const filledCount = PROFILE_FIELDS.filter((key) => {
    const value = employeeObj?.[key];
    return value !== undefined && value !== null && `${value}`.trim() !== "";
  }).length;
  const completion = Math.round((filledCount / PROFILE_FIELDS.length) * 100);
  const completionTone =
    completion >= 80 ? "is-good" : completion >= 50 ? "is-mid" : "is-low";

  const namesFrom = (list, ids) =>
    (list || [])
      .filter((d) => (ids || []).map(Number).includes(Number(d.id)))
      .map((d) => d.name || d.label)
      .filter(Boolean)
      .join(", ");
  const reportingManager = reportingManagerOptions.find(
    (e) => e.id === employeeObj.reporting_manager_id,
  );
  const joinedOn = dayjs(joining_date, DateFormat);
  const tenure = (() => {
    if (!joinedOn.isValid() || joinedOn.isAfter(dayjs())) return "";
    const months = dayjs().diff(joinedOn, "month");
    const years = Math.floor(months / 12);
    const rest = months % 12;
    if (!years && !rest) return "Joined this month";
    return [years && `${years} yr${years > 1 ? "s" : ""}`, rest && `${rest} mo`]
      .filter(Boolean)
      .join(" ");
  })();
  const workSnapshot = [
    {
      icon: "ri-building-2-line",
      label: "Department",
      value: namesFrom(dep_options, employeeObj.primary_department_id_list),
    },
    {
      icon: "ri-map-pin-line",
      label: "Branch",
      value: namesFrom(branch_options, employeeObj.branch_id_list),
    },
    {
      icon: "ri-time-line",
      label: "Work schedule",
      value:
        ws_options.find((w) => w.id === employeeObj.work_schedule_id)?.name || "",
    },
    {
      icon: "ri-calendar-check-line",
      label: "Joined",
      value: joinedOn.isValid() ? joinedOn.format("DD MMM YYYY") : "",
    },
  ];

  return (
    <React.Fragment>
      <div className="page-content acs">
        <Container fluid>
          <div className="acs-hero">
            <div className="acs-hero-main">
              <span className="acs-hero-icon">
                <i className="ri-user-settings-line" />
              </span>
              <div>
                <h4 className="acs-hero-title">Account settings</h4>
                <p className="acs-hero-sub">
                  Manage your personal details and password.
                </p>
              </div>
            </div>
            <button
              data-testid="account-settings-back-to-profile-button"
              type="button"
              className="acs-btn"
              onClick={() => navigate(`/employee/view/${employeeObj.emp_uuid}`)}
            >
              <i className="ri-arrow-left-line" />
              Back to profile
            </button>
          </div>

          <Row className="g-3">
            <Col xl={3} lg={4}>
              <div className="acs-side">
              <div className="acs-card acs-profile">
                <div className="acs-profile-cover" />
                <div className="acs-avatar">
                  <img
                    src={employeeObj.profile_url || DummyUserImg}
                    alt={fullName || "Profile"}
                    onError={(e) => {
                      if (e.currentTarget.src !== DummyUserImg) {
                        e.currentTarget.src = DummyUserImg;
                      }
                    }}
                  />
                  <Input
                    data-testid="account-settings-profile-photo-file-input"
                    id="profile-img-file-input"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleProfileChange}
                  />
                  <Label
                    htmlFor="profile-img-file-input"
                    className="acs-avatar-edit"
                    title="Change photo"
                  >
                    <i className="ri-camera-fill" />
                  </Label>
                </div>
                <h5 className="acs-name">{fullName || "—"}</h5>
                {roleName && <span className="acs-role">{roleName}</span>}

                <div className="acs-meta">
                  {employeeObj.emp_id && (
                    <div>
                      <i className="ri-hashtag" />
                      <span>{employeeObj.emp_id}</span>
                    </div>
                  )}
                  {employeeObj.email && (
                    <div>
                      <i className="ri-mail-line" />
                      <span>{employeeObj.email}</span>
                    </div>
                  )}
                  {employeeObj.contact_number && (
                    <div>
                      <i className="ri-phone-line" />
                      <span>
                        {employeeObj.country_code ? `${employeeObj.country_code} ` : ""}
                        {employeeObj.contact_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="acs-card acs-complete">
                <div className="acs-card-head">
                  <div>
                    <h6>Complete your profile</h6>
                    <span>
                      {filledCount} of {PROFILE_FIELDS.length} details added
                    </span>
                  </div>
                  <span className={`acs-pct ${completionTone}`}>{completion}%</span>
                </div>
                <div className={`acs-bar ${completionTone}`}>
                  <span style={{ width: `${completion}%` }} />
                </div>
                {completion < 100 && (
                  <button
                    type="button"
                    className="acs-link"
                    onClick={() => tabChange("1")}
                  >
                    <i className="ri-edit-box-line" />
                    Fill in missing details
                  </button>
                )}
              </div>

              <div className="acs-card acs-work">
                <div className="acs-card-head">
                  <div>
                    <h6>Work snapshot</h6>
                    <span>Your role in the organisation</span>
                  </div>
                  {tenure && (
                    <span className="acs-tenure">
                      <i className="ri-medal-line" />
                      {tenure}
                    </span>
                  )}
                </div>

                <div className="acs-manager">
                  {reportingManager?.profile_url ? (
                    <img src={reportingManager.profile_url} alt="" />
                  ) : (
                    <span className="acs-manager-initial">
                      {reportingManager ? (
                        (reportingManager.first_name || reportingManager.label || "?").charAt(0)
                      ) : (
                        <i className="ri-user-star-line" />
                      )}
                    </span>
                  )}
                  <div>
                    <small>Reporting manager</small>
                    <strong>
                      {reportingManager
                        ? reportingManager.label ||
                          [reportingManager.first_name, reportingManager.last_name]
                            .filter(Boolean)
                            .join(" ")
                        : "Not assigned"}
                    </strong>
                  </div>
                </div>

                <ul className="acs-work-list">
                  {workSnapshot.map((item) => (
                    <li key={item.label}>
                      <i className={item.icon} />
                      <span>{item.label}</span>
                      <strong title={item.value}>{item.value || "—"}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              </div>
            </Col>

            <Col xl={9} lg={8}>
              <div className="acs-card acs-main">
                <div className="acs-tabs" role="tablist">
                  {SETTINGS_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      className={`acs-tab ${activeTab === tab.id ? "is-active" : ""}`}
                      onClick={() => tabChange(tab.id)}
                    >
                      <i className={tab.icon} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
                <div className="acs-body">
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                      <Form
                        onSubmit={FormikForm.handleSubmit}
                        action="javascript:void(0)"
                        className="acs-form"
                      >
                        <Row className="gx-3">
                          <Col xs={12}>
                            <div className="acs-section">
                              <span className="acs-section-icon">
                                <i className="ri-user-3-line" />
                              </span>
                              <div>
                                <h6>Basic information</h6>
                                <p>Your name, contact and personal details</p>
                              </div>
                            </div>
                          </Col>
                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <Label
                                htmlFor="first_name"
                                className="form-label"
                              >
                                First Name
                              </Label>
                              <div className="form-icon right">
                                <Input
                                  type="text"
                                  name="first_name"
                                  id="first_name"
                                  className="form-control"
                                  placeholder="Elon"
                                  value={employeeObj.first_name || ""}
                                  onChange={handleInputChange}
                                  invalid={
                                    FormikForm.touched.first_name &&
                                    FormikForm.errors.first_name
                                      ? true
                                      : false
                                  }
                                />
                                {!FormikForm.touched.first_name &&
                                  !FormikForm.errors.first_name && (
                                    <i className="ri-user-line"></i>
                                  )}
                                {FormikForm.touched.first_name &&
                                FormikForm.errors.first_name ? (
                                  <FormFeedback type="invalid">
                                    {FormikForm.errors.first_name}
                                  </FormFeedback>
                                ) : null}
                              </div>
                              {!FormikForm.errors.first_name && (
                                <div
                                  id="passwordHelpBlock"
                                  className="form-text mb-3"
                                >
                                  Enter First Name.
                                </div>
                              )}
                            </div>
                          </Col>
                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <Label htmlFor="last_name" className="form-label">
                                Last Name
                              </Label>
                              <div className="form-icon right">
                                <Input
                                  type="text"
                                  name="last_name"
                                  id="last_name"
                                  className="form-control"
                                  placeholder="Musk"
                                  value={employeeObj.last_name || ""}
                                  onChange={handleInputChange}
                                  invalid={
                                    FormikForm.touched.last_name &&
                                    FormikForm.errors.last_name
                                      ? true
                                      : false
                                  }
                                />
                                {!FormikForm.touched.last_name &&
                                  !FormikForm.errors.last_name && (
                                    <i className="ri-user-2-line"></i>
                                  )}
                                {FormikForm.touched.last_name &&
                                FormikForm.errors.last_name ? (
                                  <FormFeedback type="invalid">
                                    {FormikForm.errors.last_name}
                                  </FormFeedback>
                                ) : null}
                              </div>
                              {!FormikForm.errors.last_name && (
                                <div
                                  id="passwordHelpBlock"
                                  className="form-text mb-3"
                                >
                                  Enter last Name.
                                </div>
                              )}
                            </div>
                          </Col>
                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Label
                                  htmlFor="emailid"
                                  className="form-label"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <span style={{ marginRight: "5px" }}>
                                    Employee ID
                                  </span>
                                </Label>
                              </div>
                              <div className="form-icon right">
                                <Input
                                  type="text"
                                  name="emp_id"
                                  id="employeeid"
                                  className="form-control"
                                  placeholder="LC001"
                                  value={employeeObj.emp_id || ""}
                                  onChange={handleInputChange}
                                  disabled
                                  invalid={
                                    FormikForm.touched.emp_id &&
                                    FormikForm.errors.emp_id
                                      ? true
                                      : false
                                  }
                                />
                                {!FormikForm.touched.emp_id &&
                                  !FormikForm.errors.emp_id && (
                                    <i className="ri-user-line"></i>
                                  )}
                                {FormikForm.touched.emp_id &&
                                FormikForm.errors.emp_id ? (
                                  <FormFeedback type="invalid">
                                    {FormikForm.errors.emp_id}
                                  </FormFeedback>
                                ) : null}
                                <i className="ri-user-line"></i>
                              </div>
                              {!FormikForm.errors.first_name && (
                                <div
                                  id="passwordHelpBlock"
                                  className="form-text mb-3"
                                >
                                  Enter Employee ID.
                                </div>
                              )}
                            </div>
                          </Col>
                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <Label
                                htmlFor="emp_gender"
                                className="form-label"
                              >
                                Gender
                              </Label>

                              <Select
                                id="gender"
                                name="gender"
                                innerRef={inputRef}
                                isMulti={false}
                                options={gender_options || []}
                                className="basic-multi-select"
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    borderColor:
                                      !state.isFocused &&
                                      FormikForm.touched.gender &&
                                      FormikForm.errors.gender
                                        ? "red !important"
                                        : provided.borderColor,
                                  }),
                                }}
                                value={
                                  gender_options.find(
                                    (e) =>
                                      Number(e.value) ===
                                      Number(employeeObj.gender),
                                  ) || null
                                }
                                onChange={(e) => {
                                  setEmployeeObj({
                                    ...employeeObj,
                                    gender: Number(e.value),
                                  });
                                  FormikForm.setFieldValue(
                                    "gender",
                                    Number(e.value),
                                  );
                                  FormikForm.setFieldTouched(
                                    "gender",
                                    true,
                                    false,
                                  );
                                }}
                                invalid={
                                  FormikForm.touched.gender &&
                                  FormikForm.errors.gender
                                    ? true
                                    : false
                                }
                              />
                              {FormikForm.touched.gender &&
                              FormikForm.errors.gender ? (
                                <div className="lc_form_error_text">
                                  {FormikForm.errors.gender}
                                </div>
                              ) : null}
                              {!FormikForm.errors.gender && (
                                <div
                                  id="passwordHelpBlock"
                                  className="form-text mb-3"
                                >
                                  Select Gender.
                                </div>
                              )}
                            </div>
                          </Col>

                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <Label className="form-label">
                                Contact Number*
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
                                  className="form-control rounded-end flag-input"
                                  styles={{
                                    control: (provided, state) => ({
                                      ...provided,
                                      borderColor:
                                        !state.isFocused &&
                                        FormikForm.touched.contact_number &&
                                        FormikForm.errors.contact_number
                                          ? "red !important"
                                          : provided.borderColor,
                                    }),
                                  }}
                                  placeholder="Enter number"
                                  inputMode="numeric"
                                  value={employeeObj.contact_number || ""}
                                  maxLength={10}
                                  onChange={(e) => {
                                    handleNumberOnly(e, "contact_number");

                                    const value = e.target.value
                                      .replace(/[^0-9]/g, "")
                                      .slice(0, 10);

                                    FormikForm.setFieldValue(
                                      "contact_number",
                                      value,
                                    );
                                    FormikForm.setFieldTouched(
                                      "contact_number",
                                      true,
                                      false,
                                    );

                                    if (value.length !== 10) {
                                      FormikForm.setFieldError(
                                        "contact_number",
                                        "Phone number must be 10 digits",
                                      );
                                    } else {
                                      FormikForm.setFieldError(
                                        "contact_number",
                                        undefined,
                                      );
                                    }
                                  }}
                                  invalid={!!FormikForm.errors.contact_number}
                                />
                                {FormikForm.errors.contact_number && (
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
                                    {(
                                      CountryList.filter(
                                        (obj) => obj.show,
                                      ).sort((a, b) =>
                                        a.countryName.localeCompare(
                                          b.countryName,
                                        ),
                                      ) || []
                                    ).map((item, key) => (
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
                              {!FormikForm.errors.contact_number && (
                                <div
                                  id="passwordHelpBlock"
                                  className="form-text mb-3"
                                >
                                  Enter Your Contact number with country code.
                                </div>
                              )}
                            </div>
                          </Col>
                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <Label htmlFor="emailid" className="form-label">
                                Email
                              </Label>
                              <div className="form-icon right">
                                <Input
                                  name="email"
                                  id="emailid"
                                  className="form-control"
                                  styles={{
                                    control: (provided, state) => ({
                                      ...provided,
                                      borderColor:
                                        !state.isFocused &&
                                        FormikForm.touched.email &&
                                        FormikForm.errors.email
                                          ? "red !important"
                                          : provided.borderColor,
                                    }),
                                  }}
                                  placeholder="name@company.com"
                                  value={employeeObj.email || ""}
                                  onChange={handleInputChange}
                                  disabled
                                  invalid={
                                    FormikForm.touched.email &&
                                    FormikForm.errors.email
                                      ? true
                                      : false
                                  }
                                />
                                {!FormikForm.touched.email &&
                                  !FormikForm.errors.email && (
                                    <i className="ri-at-line"></i>
                                  )}
                                {FormikForm.touched.email &&
                                FormikForm.errors.email ? (
                                  <FormFeedback type="invalid">
                                    {FormikForm.errors.email}
                                  </FormFeedback>
                                ) : null}
                              </div>
                              {!FormikForm.errors.email && (
                                <div
                                  id="passwordHelpBlock"
                                  className="form-text mb-3"
                                >
                                  Enter Email.
                                </div>
                              )}
                            </div>
                          </Col>

                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <Label htmlFor="dob" className="form-label">
                                DOB
                              </Label>
                              <DatePicker
                                className="form-control"
                                placeholder="Select DOB"
                                id="dob"
                                name="dob"
                                value={dayjs(dob, DateFormat)}
                                format={"DD-MM-YYYY"}
                                onChange={handleDateChange}
                                allowClear={false}
                              />
                              <div
                                id="passwordHelpBlock"
                                className="form-text mb-3"
                              >
                                Select DOB.
                              </div>
                            </div>
                          </Col>
                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <Label htmlFor="joindate" className="form-label">
                                Joining Date
                              </Label>
                              <DatePicker
                                className="form-control"
                                id="joining_date"
                                value={dayjs(joining_date, DateFormat)}
                                format={DateFormat}
                                allowClear={false}
                                onChange={handleJoinDateChange}
                                disabled
                              />
                            </div>
                            <div
                              id="passwordHelpBlock"
                              className="form-text mb-3"
                            >
                              Select Your Joining Date.
                            </div>
                          </Col>
                          <Col xs={12}>
                            <div className="acs-section">
                              <span className="acs-section-icon">
                                <i className="ri-briefcase-4-line" />
                              </span>
                              <div>
                                <h6>Work information</h6>
                                <p>Assigned by your organisation</p>
                              </div>
                              <span className="acs-section-badge">
                                <i className="ri-lock-2-line" />
                                Managed by HR
                              </span>
                            </div>
                          </Col>
                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <Label htmlFor="branch" className="form-label">
                                Branch
                              </Label>
                              <Select
                                id="branch"
                                name="branch"
                                innerRef={inputRef}
                                isMulti={true}
                                closeMenuOnSelect={false}
                                options={branch_options || []}
                                isDisabled
                                className="basic-multi-select"
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    borderColor:
                                      !state.isFocused &&
                                      FormikForm.touched.branch_id_list &&
                                      FormikForm.errors.branch_id_list
                                        ? "red !important"
                                        : provided.borderColor,
                                  }),
                                }}
                                placeholder={"Select Branch"}
                                value={
                                  employeeObj?.branch_id_list
                                    ? branch_options.filter((d) =>
                                        (employeeObj?.branch_id_list).includes(
                                          d.id,
                                        ),
                                      )
                                    : []
                                }
                                onChange={handleBranchChange}
                                invalid={
                                  FormikForm.touched.branch_id_list &&
                                  FormikForm.errors.branch_id_list
                                    ? true
                                    : false
                                }
                              />
                              {FormikForm.touched.branch_id_list &&
                              FormikForm.errors.branch_id_list ? (
                                <div className="lc_form_error_text">
                                  {FormikForm.errors.branch_id_list}
                                </div>
                              ) : null}
                              {!FormikForm.errors.branch_id_list && (
                                <div
                                  id="passwordHelpBlock"
                                  className="form-text mb-3"
                                >
                                  Select Branch
                                </div>
                              )}
                            </div>
                          </Col>
                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <Label
                                htmlFor="primary_department_id_list"
                                className="form-label"
                              >
                                Primary Department
                              </Label>
                              <Select
                                id="primary_department_id_list"
                                name="primary_department_id_list"
                                innerRef={inputRef}
                                isMulti={true}
                                options={dep_options || []}
                                isDisabled
                                className="basic-multi-select"
                                closeMenuOnSelect={false}
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    borderColor:
                                      !state.isFocused &&
                                      FormikForm.touched
                                        .primary_department_id_list &&
                                      FormikForm.errors
                                        .primary_department_id_list
                                        ? "red !important"
                                        : provided.borderColor,
                                  }),
                                }}
                                placeholder={"Select Primary Department"}
                                value={
                                  employeeObj?.primary_department_id_list
                                    ? dep_options.filter((d) =>
                                        (employeeObj?.primary_department_id_list).includes(
                                          d.id,
                                        ),
                                      )
                                    : []
                                }
                                onChange={handlePrimaryDepChange}
                                invalid={
                                  FormikForm.touched
                                    .primary_department_id_list &&
                                  FormikForm.errors.primary_department_id_list
                                    ? true
                                    : false
                                }
                              />
                              {FormikForm.touched.primary_department_id_list &&
                              FormikForm.errors.primary_department_id_list ? (
                                <div className="lc_form_error_text">
                                  {FormikForm.errors.primary_department_id_list}
                                </div>
                              ) : null}
                              {!FormikForm.errors
                                .primary_department_id_list && (
                                <div
                                  id="passwordHelpBlock"
                                  className="form-text mb-3"
                                >
                                  Select Primary Department
                                </div>
                              )}
                            </div>
                          </Col>
                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <Label
                                htmlFor="reporting_manager_id"
                                className="form-label"
                              >
                                Reporting Manager
                              </Label>
                              <Select
                                id="reporting_manager_id"
                                name="reporting_manager_id"
                                innerRef={inputRef}
                                isMulti={false}
                                isClearable={true} // Enable clearable feature
                                options={reportingManagerOptions || []}
                                isDisabled
                                components={{ Option: EmployeeDisplayInSelect }}
                                className="basic-multi-select"
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    borderColor:
                                      !state.isFocused &&
                                      FormikForm.touched.reporting_manager_id &&
                                      FormikForm.errors.reporting_manager_id
                                        ? "red !important"
                                        : provided.borderColor,
                                  }),
                                }}
                                value={
                                  (employeeObj.reporting_manager_id &&
                                    reportingManagerOptions.find(
                                      (e) =>
                                        e.id ===
                                        employeeObj.reporting_manager_id,
                                    )) ||
                                  null // Set value to null initially
                                }
                                onChange={(selectedOption) => {
                                  if (selectedOption) {
                                    // Check if an option is selected
                                    setEmployeeObj({
                                      ...employeeObj,
                                      reporting_manager_id: selectedOption.id,
                                    });
                                  } else {
                                    // Clear selection if null (clear button clicked)
                                    setEmployeeObj({
                                      ...employeeObj,
                                      reporting_manager_id: null,
                                    });
                                  }
                                }}
                                invalid={
                                  FormikForm.touched.reporting_manager_id &&
                                  FormikForm.errors.reporting_manager_id
                                    ? true
                                    : false
                                }
                              />
                              {FormikForm.touched.reporting_manager_id &&
                              FormikForm.errors.reporting_manager_id ? (
                                <div className="lc_form_error_text">
                                  {FormikForm.errors.reporting_manager_id}
                                </div>
                              ) : null}
                            </div>
                            {!FormikForm.errors.reporting_manager_id && (
                              <div
                                id="passwordHelpBlock"
                                className="form-text mb-3"
                              >
                                Select Reporting Manager
                              </div>
                            )}
                          </Col>
                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <Label htmlFor="role_id" className="form-label">
                                Role
                              </Label>
                              <Select
                                id="role_id"
                                name="role_id"
                                isMulti={false}
                                innerRef={inputRef}
                                options={role_id_option || []}
                                isDisabled
                                className="basic-multi-select"
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    borderColor:
                                      !state.isFocused &&
                                      FormikForm.touched.role_id &&
                                      FormikForm.errors.role_id
                                        ? "red !important"
                                        : provided.borderColor,
                                  }),
                                }}
                                value={
                                  (employeeObj?.role?.id &&
                                    role_id_option.find(
                                      (e) => e.id === employeeObj?.role?.id,
                                    )) ||
                                  []
                                }
                                onChange={(e) => {
                                  setEmployeeObj({
                                    ...employeeObj,
                                    role_id: e.id,
                                  });
                                }}
                                invalid={
                                  FormikForm.touched.role_id &&
                                  FormikForm.errors.role_id
                                    ? true
                                    : false
                                }
                              />
                              {FormikForm.touched.role_id &&
                              FormikForm.errors.role_id ? (
                                <div className="lc_form_error_text">
                                  {FormikForm.errors.role_id}
                                </div>
                              ) : null}
                              {!FormikForm.errors.role_id && (
                                <div
                                  id="passwordHelpBlock"
                                  className="form-text mb-3"
                                >
                                  Select Role
                                </div>
                              )}
                            </div>
                          </Col>
                          <Col xxl={6} sm={6} lg={6}>
                            <div>
                              <Label htmlFor="empWs" className="form-label">
                                Work Schedule
                              </Label>
                              <Select
                                id="empWs"
                                name="work_schedule_id"
                                innerRef={inputRef}
                                isMulti={false}
                                options={ws_options || []}
                                isDisabled
                                className="basic-multi-select"
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    borderColor:
                                      !state.isFocused &&
                                      FormikForm.touched.work_schedule_id &&
                                      FormikForm.errors.work_schedule_id
                                        ? "red !important"
                                        : provided.borderColor,
                                  }),
                                }}
                                value={
                                  (employeeObj.work_schedule_id &&
                                    ws_options.find(
                                      (e) =>
                                        e.id === employeeObj.work_schedule_id,
                                    )) ||
                                  []
                                }
                                onChange={(e) =>
                                  setEmployeeObj({
                                    ...employeeObj,
                                    work_schedule_id: e.id,
                                  })
                                }
                                invalid={
                                  FormikForm.touched.work_schedule_id &&
                                  FormikForm.errors.work_schedule_id
                                    ? true
                                    : false
                                }
                              />
                              {FormikForm.touched.work_schedule_id &&
                              FormikForm.errors.work_schedule_id ? (
                                <div className="lc_form_error_text">
                                  {FormikForm.errors.work_schedule_id}
                                </div>
                              ) : null}
                            </div>
                            {!FormikForm.errors.work_schedule_id && (
                              <div
                                id="passwordHelpBlock"
                                className="form-text mb-3"
                              >
                                Select Work Schedule
                              </div>
                            )}
                          </Col>
                          <Col xxl={12} sm={12} lg={12}>
                            <div className="acs-form-foot">
                              <span>
                                <i className="ri-information-line" />
                                Locked fields can only be changed by HR.
                              </span>
                              <button type="submit" className="btn btn-success">
                                <i className="ri-save-3-line me-1" />
                                Save changes
                              </button>
                            </div>
                          </Col>
                        </Row>
                      </Form>
                    </TabPane>

                    <TabPane tabId="2">
                      <Form
                        onSubmit={FormikFormPassword.handleSubmit}
                        action="javascript:void(0)"
                      >
                        <Row className="g-2">
                          <Col xxl={4} sm={4} lg={4}>
                            <div>
                              <Label
                                htmlFor="oldpasswordInput"
                                className="form-label"
                              >
                                Old Password*
                              </Label>
                              <div className="position-relative">
                                <Input
                                  name="old_password"
                                  id="old_password"
                                  type={showPassword1 ? "text" : "password"}
                                  className="form-control"
                                  placeholder="Enter current password"
                                  onKeyDown={(e) => {
                                    if (e.key === " ") {
                                      e.preventDefault();
                                    }
                                  }}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    setChangePassword({
                                      ...changePassword,
                                      old_password: value,
                                    });

                                    FormikFormPassword.setFieldValue(
                                      "old_password",
                                      value,
                                      false,
                                    );
                                    FormikFormPassword.setFieldTouched(
                                      "old_password",
                                      true,
                                      false,
                                    );
                                    if (!value) {
                                      FormikFormPassword.setFieldError(
                                        "old_password",
                                        "Old Password is required",
                                      );
                                    } else {
                                      FormikFormPassword.setFieldError(
                                        "old_password",
                                        undefined,
                                      );
                                    }

                                    // Re-check new_password against updated old_password
                                    if (changePassword.new_password) {
                                      const strongPasswordRegex =
                                        /^(?=\S*$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).*$/;
                                      const newPassVal =
                                        changePassword.new_password;

                                      if (newPassVal.length > 20) {
                                        FormikFormPassword.setFieldError(
                                          "new_password",
                                          "Maximum 20 characters allowed",
                                        );
                                      } else if (newPassVal.length < 8) {
                                        FormikFormPassword.setFieldError(
                                          "new_password",
                                          "Minimum 8 characters required",
                                        );
                                      } else if (
                                        !strongPasswordRegex.test(newPassVal)
                                      ) {
                                        FormikFormPassword.setFieldError(
                                          "new_password",
                                          "Must include uppercase, lowercase, number & special character",
                                        );
                                      } else if (newPassVal === value) {
                                        FormikFormPassword.setFieldError(
                                          "new_password",
                                          "New Password must be different from Old Password",
                                        );
                                      } else {
                                        FormikFormPassword.setFieldError(
                                          "new_password",
                                          undefined,
                                        );
                                      }
                                    }
                                  }}
                                  value={changePassword.old_password || ""}
                                  invalid={
                                    FormikFormPassword.touched.old_password &&
                                    FormikFormPassword.errors.old_password
                                      ? true
                                      : false
                                  }
                                />

                                <FormFeedback type="invalid">
                                  {FormikFormPassword.errors.old_password}
                                </FormFeedback>

                                <i
                                  className={`mdi mdi-${
                                    showPassword1
                                      ? "eye-off-outline"
                                      : "eye-outline"
                                  } eye-icon`}
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    setShowPassword1(!showPassword1)
                                  }
                                />
                              </div>
                            </div>
                          </Col>

                          <Col xxl={4} sm={4} lg={4}>
                            <div>
                              <Label
                                htmlFor="newpasswordInput"
                                className="form-label"
                              >
                                New Password*
                              </Label>
                              <div className="position-relative">
                                <Input
                                  name="new_password"
                                  id="new_password"
                                  type={showPassword2 ? "text" : "password"}
                                  className="form-control"
                                  placeholder="Enter new password"
                                  onKeyDown={(e) => {
                                    if (e.key === " ") {
                                      e.preventDefault();
                                    }
                                  }}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    setChangePassword({
                                      ...changePassword,
                                      new_password: value,
                                    });

                                    FormikFormPassword.setFieldValue(
                                      "new_password",
                                      value,
                                      false,
                                    );
                                    FormikFormPassword.setFieldTouched(
                                      "new_password",
                                      true,
                                      false,
                                    );

                                    const strongPasswordRegex =
                                      /^(?=\S*$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).*$/;

                                    if (!value) {
                                      FormikFormPassword.setFieldError(
                                        "new_password",
                                        "New Password is required",
                                      );
                                    } else if (value.length > 20) {
                                      FormikFormPassword.setFieldError(
                                        "new_password",
                                        "Maximum 20 characters allowed",
                                      );
                                    } else if (value.length < 8) {
                                      FormikFormPassword.setFieldError(
                                        "new_password",
                                        "Minimum 8 characters required",
                                      );
                                    } else if (
                                      !strongPasswordRegex.test(value)
                                    ) {
                                      FormikFormPassword.setFieldError(
                                        "new_password",
                                        "Must include uppercase, lowercase, number & special character",
                                      );
                                    } else if (
                                      value === changePassword.old_password
                                    ) {
                                      FormikFormPassword.setFieldError(
                                        "new_password",
                                        "New Password must be different from Old Password",
                                      );
                                    } else {
                                      FormikFormPassword.setFieldError(
                                        "new_password",
                                        undefined,
                                      );
                                    }

                                    // Re-check confirm_password against updated new_password
                                    if (changePassword.confirm_password) {
                                      if (
                                        changePassword.confirm_password.length >
                                        20
                                      ) {
                                        FormikFormPassword.setFieldError(
                                          "confirm_password",
                                          "Maximum 20 characters allowed",
                                        );
                                      } else if (
                                        changePassword.confirm_password !==
                                        value
                                      ) {
                                        FormikFormPassword.setFieldError(
                                          "confirm_password",
                                          "Passwords must match",
                                        );
                                      } else {
                                        FormikFormPassword.setFieldError(
                                          "confirm_password",
                                          undefined,
                                        );
                                      }
                                    }
                                  }}
                                  value={changePassword.new_password || ""}
                                  invalid={
                                    FormikFormPassword.touched.new_password &&
                                    FormikFormPassword.errors.new_password
                                      ? true
                                      : false
                                  }
                                />
                                <FormFeedback>
                                  {FormikFormPassword.errors.new_password}
                                </FormFeedback>
                                <div
                                  onClick={() =>
                                    setShowPassword2(!showPassword2)
                                  }
                                >
                                  <i
                                    className={`mdi mdi-${
                                      showPassword2
                                        ? "eye-off-outline"
                                        : "eye-outline"
                                    } eye-icon`}
                                    style={{ cursor: "pointer" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </Col>

                          <Col xxl={4} sm={4} lg={4}>
                            <div>
                              <Label
                                htmlFor="confirmpasswordInput"
                                className="form-label"
                              >
                                Confirm Password*
                              </Label>
                              <div className="position-relative">
                                <Input
                                  name="confirm_password"
                                  id="confirm_password"
                                  type={showPassword3 ? "text" : "password"}
                                  className="form-control"
                                  placeholder="Confirm password"
                                  onKeyDown={(e) => {
                                    if (e.key === " ") {
                                      e.preventDefault();
                                    }
                                  }}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    setChangePassword({
                                      ...changePassword,
                                      confirm_password: value,
                                    });

                                    FormikFormPassword.setFieldValue(
                                      "confirm_password",
                                      value,
                                      false,
                                    );
                                    FormikFormPassword.setFieldTouched(
                                      "confirm_password",
                                      true,
                                      false,
                                    );

                                    if (!value) {
                                      FormikFormPassword.setFieldError(
                                        "confirm_password",
                                        "Confirm Password is required",
                                      );
                                    } else if (value.length > 20) {
                                      FormikFormPassword.setFieldError(
                                        "confirm_password",
                                        "Maximum 20 characters allowed",
                                      );
                                    } else if (
                                      value !== changePassword.new_password
                                    ) {
                                      FormikFormPassword.setFieldError(
                                        "confirm_password",
                                        "Passwords must match",
                                      );
                                    } else {
                                      FormikFormPassword.setFieldError(
                                        "confirm_password",
                                        undefined,
                                      );
                                    }
                                  }}
                                  value={changePassword.confirm_password || ""}
                                  invalid={
                                    FormikFormPassword.touched
                                      .confirm_password &&
                                    FormikFormPassword.errors.confirm_password
                                      ? true
                                      : false
                                  }
                                />

                                <FormFeedback>
                                  {FormikFormPassword.errors.confirm_password}
                                </FormFeedback>

                                <i
                                  className={`mdi mdi-${
                                    showPassword3
                                      ? "eye-off-outline"
                                      : "eye-outline"
                                  } eye-icon`}
                                  onClick={() =>
                                    setShowPassword3(!showPassword3)
                                  }
                                  style={{ cursor: "pointer" }}
                                />
                              </div>
                            </div>
                          </Col>

                          <Col xxl={12} sm={12} lg={12}>
                            <div className="mb-3">
                              {/* <Link
                                to="#"
                                className="link-primary text-decoration-underline"
                              >
                                Forgot Password ?
                              </Link> */}
                            </div>
                          </Col>

                          <Col xxl={12} sm={12} lg={12}>
                            <div className="text-end">
                              <button data-testid="account-settings-change-password-button" type="submit" className="btn btn-success">
                                Change Password
                              </button>
                            </div>
                          </Col>
                        </Row>
                      </Form>
                      <div className="mt-4 mb-3 border-bottom pb-2">
                        <div className="float-end">
                          <Link data-testid="account-settings-all-logout-link" to="#" className="link-primary">
                            All Logout
                          </Link>
                        </div>
                        <h5 className="card-title">Login History</h5>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="flex-shrink-0 avatar-sm">
                          <div className="avatar-title bg-light text-primary rounded-3 fs-18">
                            <i className="ri-smartphone-line"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6>iPhone 12 Pro</h6>
                          <p className="text-muted mb-0">
                            Los Angeles, United States - March 16 at 2:47PM
                          </p>
                        </div>
                        <div>
                          <Link to="#" data-testid="account-settings-device-iphone-12-pro-logout-link">Logout</Link>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="flex-shrink-0 avatar-sm">
                          <div className="avatar-title bg-light text-primary rounded-3 fs-18">
                            <i className="ri-tablet-line"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6>Apple iPad Pro</h6>
                          <p className="text-muted mb-0">
                            Washington, United States - November 06 at 10:43AM
                          </p>
                        </div>
                        <div>
                          <Link to="#" data-testid="account-settings-device-apple-ipad-pro-logout-link">Logout</Link>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="flex-shrink-0 avatar-sm">
                          <div className="avatar-title bg-light text-primary rounded-3 fs-18">
                            <i className="ri-smartphone-line"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6>Galaxy S21 Ultra 5G</h6>
                          <p className="text-muted mb-0">
                            Conneticut, United States - June 12 at 3:24PM
                          </p>
                        </div>
                        <div>
                          <Link to="#" data-testid="account-settings-device-galaxy-s21-ultra-5g-logout-link">Logout</Link>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 avatar-sm">
                          <div className="avatar-title bg-light text-primary rounded-3 fs-18">
                            <i className="ri-macbook-line"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6>Dell Inspiron 14</h6>
                          <p className="text-muted mb-0">
                            Phoenix, United States - July 26 at 8:10AM
                          </p>
                        </div>
                        <div>
                          <Link to="#" data-testid="account-settings-device-dell-inspiron-14-logout-link">Logout</Link>
                        </div>
                      </div>
                    </TabPane>

                    <TabPane tabId="4">
                      <div className="mb-4 pb-2">
                        <h5 className="card-title text-decoration-underline mb-3">
                          Security:
                        </h5>
                        <div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
                          <div className="flex-grow-1">
                            <h6 className="fs-14 mb-1">
                              Two-factor Authentication
                            </h6>
                            <p className="text-muted">
                              Two-factor authentication is an enhanced security
                              meansur. Once enabled, you'll be required to give
                              two types of identification when you log into
                              Google Authentication and SMS are Supported.
                            </p>
                          </div>
                          <div className="flex-shrink-0 ms-sm-3">
                            <Link data-testid="account-settings-enable-two-facor-authentication-link" to="#" className="btn btn-sm btn-primary">
                              Enable Two-facor Authentication
                            </Link>
                          </div>
                        </div>
                        <div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0 mt-2">
                          <div className="flex-grow-1">
                            <h6 className="fs-14 mb-1">
                              Secondary Verification
                            </h6>
                            <p className="text-muted">
                              The first factor is a password and the second
                              commonly includes a text with a code sent to your
                              smartphone, or biometrics using your fingerprint,
                              face, or retina.
                            </p>
                          </div>
                          <div className="flex-shrink-0 ms-sm-3">
                            <Link data-testid="account-settings-set-up-secondary-method-link" to="#" className="btn btn-sm btn-primary">
                              Set up secondary method
                            </Link>
                          </div>
                        </div>
                        <div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0 mt-2">
                          <div className="flex-grow-1">
                            <h6 className="fs-14 mb-1">Backup Codes</h6>
                            <p className="text-muted mb-sm-0">
                              A backup code is automatically generated for you
                              when you turn on two-factor authentication through
                              your iOS or Android Twitter app. You can also
                              generate a backup code on twitter.com.
                            </p>
                          </div>
                          <div className="flex-shrink-0 ms-sm-3">
                            <Link data-testid="account-settings-generate-backup-codes-link" to="#" className="btn btn-sm btn-primary">
                              Generate backup codes
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h5 className="card-title text-decoration-underline mb-3">
                          Application Notifications:
                        </h5>
                        <ul className="list-unstyled mb-0">
                          <li className="d-flex">
                            <div className="flex-grow-1">
                              <label
                                htmlFor="directMessage"
                                className="form-check-label fs-14"
                              >
                                Direct messages
                              </label>
                              <p className="text-muted">
                                Messages from people you follow
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="form-check form-switch">
                                <Input
                                  data-testid="account-settings-directmessage-checkbox"
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="directMessage"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </li>
                          <li className="d-flex mt-2">
                            <div className="flex-grow-1">
                              <Label
                                className="form-check-label fs-14"
                                htmlFor="desktopNotification"
                              >
                                Show desktop notifications
                              </Label>
                              <p className="text-muted">
                                Choose the option you want as your default
                                setting. Block a site: Next to "Not allowed to
                                send notifications," click Add.
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="form-check form-switch">
                                <Input
                                  data-testid="account-settings-desktopnotification-checkbox"
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="desktopNotification"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </li>
                          <li className="d-flex mt-2">
                            <div className="flex-grow-1">
                              <Label
                                className="form-check-label fs-14"
                                htmlFor="emailNotification"
                              >
                                Show email notifications
                              </Label>
                              <p className="text-muted">
                                {" "}
                                Under Settings, choose Notifications. Under
                                Select an account, choose the account to enable
                                notifications for.{" "}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="form-check form-switch">
                                <Input
                                  data-testid="account-settings-emailnotification-checkbox"
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="emailNotification"
                                />
                              </div>
                            </div>
                          </li>
                          <li className="d-flex mt-2">
                            <div className="flex-grow-1">
                              <Label
                                className="form-check-label fs-14"
                                htmlFor="chatNotification"
                              >
                                Show chat notifications
                              </Label>
                              <p className="text-muted">
                                To prevent duplicate mobile notifications from
                                the Gmail and Chat apps, in settings, turn off
                                Chat notifications.
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="form-check form-switch">
                                <Input
                                  data-testid="account-settings-chatnotification-checkbox"
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="chatNotification"
                                />
                              </div>
                            </div>
                          </li>
                          <li className="d-flex mt-2">
                            <div className="flex-grow-1">
                              <Label
                                className="form-check-label fs-14"
                                htmlFor="purchaesNotification"
                              >
                                Show purchase notifications
                              </Label>
                              <p className="text-muted">
                                Get real-time purchase alerts to protect
                                yourself from fraudulent charges.
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="form-check form-switch">
                                <Input
                                  data-testid="account-settings-purchaesnotification-checkbox"
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="purchaesNotification"
                                />
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="card-title text-decoration-underline mb-3">
                          Delete This Account:
                        </h5>
                        <p className="text-muted">
                          Go to the Data & Privacy section of your profile
                          Account. Scroll to "Your data & privacy options."
                          Delete your Profile Account. Follow the instructions
                          to delete your account :
                        </p>
                        <div>
                          <Input
                            data-testid="account-settings-passwordinput-input"
                            type="password"
                            className="form-control"
                            id="passwordInput"
                            placeholder="Enter your password"
                            defaultValue="make@321654987"
                            style={{ maxWidth: "265px" }}
                            autoComplete="new-password"
                          />
                        </div>
                        <div className="hstack gap-2 mt-3">
                          <Link data-testid="account-settings-close-delete-this-account-link" to="#" className="btn btn-soft-danger">
                            Close & Delete This Account
                          </Link>
                          <Link data-testid="account-settings-cancel-link" to="#" className="btn btn-light">
                            Cancel
                          </Link>
                        </div>
                      </div>
                    </TabPane>
                  </TabContent>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AccountSettings;
