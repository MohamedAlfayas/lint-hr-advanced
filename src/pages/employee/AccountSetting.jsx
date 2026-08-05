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
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import Flatpickr from "react-flatpickr";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import Select from "react-select";
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
dayjs.extend(customParseFormat);
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useDispatch, useSelector } from "react-redux";
import { account_settings_data } from "../../redux/reducers/ChildReducer/AccountSettingsReducer";
import InputGroupAddon from "rsuite/esm/InputGroup/InputGroupAddon";
import "../../common/css/lc_style.css";
const AccountSettings = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const { account_settings_data } = useSelector(
    (state) => state.AccountSettingsReducer,
  );

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const [employeeObj, setEmployeeObj] = useState({});
  console.log("employeesss", employeeObj);

  const employee_data = GetLocalStorageData("employee");
  const branch_options = GetLocalStorageData("branch") || [];
  var contact_emails = branch_options.map(function (option, index) {
    if (index === 0) {
      return option.contact_email;
    }
  });

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

  const [experienceList, setExperienceList] = useState([]);

  const emptyExperienceForm = {
    id: null,
    job_title: "",
    company_name: "",
    from_date: "",
    to_date: "",
    is_present: false,
    description: "",
  };

  const [experienceForm, setExperienceForm] = useState(emptyExperienceForm);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [experienceFormErrors, setExperienceFormErrors] = useState({});

  const experienceValidationSchema = Yup.object({
    job_title: Yup.string()
      .trim()
      .required("Please Enter Job Title")
      .matches(/^[A-Za-z0-9.,&()'\-\s]+$/, "Please Enter Job Title")
      .max(100, "Job Title must not exceed 100 characters"),
    company_name: Yup.string()
      .trim()
      .required("Please Enter Company Name")
      .matches(/^[A-Za-z0-9.,&()'\-\s]+$/, "Please Enter Company Name")
      .max(100, "Company Name must not exceed 100 characters"),
    from_date: Yup.string().trim().required("Please Select From Date"),
  });

  const getExperienceDuration = (from_date, to_date, is_present) => {
    if (!from_date) return "";
    const start = dayjs(from_date);
    const end = is_present ? dayjs() : dayjs(to_date || dayjs());
    let years = end.diff(start, "year");
    start.add(years, "year");
    let months = end.diff(start.add(years, "year"), "month");
    if (months < 0) months = 0;
    let text = "";
    if (years > 0) text += `${years} Year${years > 1 ? "s" : ""} `;
    if (months > 0) text += `${months} Month${months > 1 ? "s" : ""}`;
    return text.trim() || "0 Months";
  };

  const handleExperienceInputChange = (e) => {
    const { name, value } = e.target;
    setExperienceForm({ ...experienceForm, [name]: value });
  };

  const handleExperienceFromDateChange = (date, dateStr) => {
    setExperienceForm({
      ...experienceForm,
      from_date: date ? dayjs(date).format("YYYY-MM-DD") : "",
    });
  };

  const handleExperienceToDateChange = (date, dateStr) => {
    setExperienceForm({
      ...experienceForm,
      to_date: date ? dayjs(date).format("YYYY-MM-DD") : "",
    });
  };

  const handleExperiencePresentToggle = (e) => {
    setExperienceForm({
      ...experienceForm,
      is_present: e.target.checked,
      to_date: e.target.checked ? "" : experienceForm.to_date,
    });
  };

  const handleAddExperienceClick = () => {
    setExperienceForm(emptyExperienceForm);
    setIsEditingExperience(false);
    setShowExperienceForm(true);
  };

  const handleEditExperience = (exp) => {
    setExperienceForm(exp);
    setIsEditingExperience(true);
    setShowExperienceForm(true);
  };

  const handleDeleteExperience = (id) => {
    setExperienceList(experienceList.filter((exp) => exp.id !== id));
  };

  const handleCancelExperienceForm = () => {
    setExperienceForm(emptyExperienceForm);
    setExperienceFormErrors({});
    setIsEditingExperience(false);
    setShowExperienceForm(false);
  };

  const handleSaveExperience = async () => {
    try {
      await experienceValidationSchema.validate(experienceForm, {
        abortEarly: false,
      });
      setExperienceFormErrors({});
    } catch (validationError) {
      const errors = {};
      validationError.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
      setExperienceFormErrors(errors);
      return;
    }

    if (isEditingExperience) {
      setExperienceList(
        experienceList.map((exp) =>
          exp.id === experienceForm.id ? experienceForm : exp,
        ),
      );
    } else {
      setExperienceList([
        { ...experienceForm, id: Date.now() },
        ...experienceList,
      ]);
    }
    handleCancelExperienceForm();
  };

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
    // Guard: on hard refresh Redux resets, so account_settings_data can be
    // {} or undefined. Bail out until it's actually populated.
    if (!account_settings_data || !Object.keys(account_settings_data).length) {
      return;
    }

    setEmployeeObj({
      ...account_settings_data,
      role_id: account_settings_data?.role?.id,
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
        employeeImage !== null &&
          form_data.append("profile", employeeImage, employeeImage.name);
        Object.entries(employeeObj).map((key, value) => {
          if (
            key[0] === "cf_values" ||
            key[0] === "allowed_attendance_methods"
          ) {
            form_data.append(key[0], JSON.stringify(key[1]));
          } else {
            form_data.append(key[0], key[1]);
          }
        });

        const Api = await PostApi("employee/add-new/", form_data, true);

        if (Api.status && Api.status === 200) {
          // employeeObj.id === 0
          //   ? dispatch(addEmployee(Api?.data.data))
          //   : dispatch(editEmployee(Api?.data?.data));

          if (employeeObj.id !== 0) {
            dispatch(editEmployee(Api?.data?.data));
            SetLocalStorage("employee", Api?.data.data, 3);
          }

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
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="position-relative mx-n4 mt-n4">
            <div className="profile-wid-bg profile-setting-img">
              <div className="overlay-content">
                <div className="text-end p-3">
                  {/* <div className="p-0 ms-auto rounded-circle profile-photo-edit">
                                        <Input id="profile-foreground-img-file-input" type="file"
                                            className="profile-foreground-img-file-input" />
                                        <Label htmlFor="profile-foreground-img-file-input"
                                            className="profile-photo-edit btn btn-light">
                                            <i className="ri-image-edit-line align-bottom me-1"></i> Change Cover
                                        </Label>
                                    </div> */}
                </div>
                <div
                  className="flex-shrink-0"
                  style={{ marginRight: "30px", marginTop: "120px" }}
                >
                  <Button
                    className="btn btn-success"
                    onClick={() =>
                      navigate(`/employee/view/${employeeObj.emp_uuid}`)
                    }
                  >
                    <i className="ri-arrow-left-line align-bottom"></i> Back To
                    Employee Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Row>
            <Col xxl={3} sm={3} md={3} lg={3}>
              <Card className="mt-n5">
                <CardBody className="p-4">
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
                    <h5 className="fs-16 mb-1">{employeeObj.first_name}</h5>
                    <p className="text-muted mb-0">
                      {employeeObj?.role?.id
                        ? role_id_option.length
                          ? role_id_option.find(
                              (d) => d.id === employeeObj?.role?.id,
                            )?.name
                          : ""
                        : ""}
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="d-flex align-items-center mb-5">
                    <div className="flex-grow-1">
                      <h5 className="card-title mb-0">Complete Your Profile</h5>
                    </div>
                    <div className="flex-shrink-0">
                      <Link
                        to="#"
                        className="badge bg-light text-primary fs-12"
                      >
                        <i className="ri-edit-box-line align-bottom me-1"></i>{" "}
                        Edit
                      </Link>
                    </div>
                  </div>
                  <div className="progress animated-progress custom-progress progress-label">
                    <div
                      className="progress-bar bg-danger"
                      role="progressbar"
                      style={{ width: "30%" }}
                      aria-valuenow="30"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <div className="label">30%</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="d-flex align-items-center mb-4">
                    <div className="flex-grow-1">
                      <h5 className="card-title mb-0">Portfolio</h5>
                    </div>
                    <div className="flex-shrink-0">
                      <Link
                        to="#"
                        className="badge bg-light text-primary fs-12"
                      >
                        <i className="ri-add-fill align-bottom me-1"></i> Add
                      </Link>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="avatar-xs d-block flex-shrink-0 me-3">
                      <span className="avatar-title rounded-circle fs-16 bg-dark text-light">
                        <i className="ri-github-fill"></i>
                      </span>
                    </div>
                    <Input
                      type="email"
                      className="form-control"
                      id="gitUsername"
                      placeholder="Username"
                      defaultValue={contact_emails}
                    />
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="avatar-xs d-block flex-shrink-0 me-3">
                      <span className="avatar-title rounded-circle fs-16 bg-primary">
                        <i className="ri-global-fill"></i>
                      </span>
                    </div>
                    <Input
                      type="text"
                      className="form-control"
                      id="websiteInput"
                      placeholder="www.example.com"
                      defaultValue={contact_emails}
                    />
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="avatar-xs d-block flex-shrink-0 me-3">
                      <span className="avatar-title rounded-circle fs-16 bg-success">
                        <i className="ri-dribbble-fill"></i>
                      </span>
                    </div>
                    <Input
                      type="text"
                      className="form-control"
                      id="dribbleName"
                      placeholder="Username"
                      defaultValue={contact_emails}
                    />
                  </div>
                  <div className="d-flex">
                    <div className="avatar-xs d-block flex-shrink-0 me-3">
                      <span className="avatar-title rounded-circle fs-16 bg-danger">
                        <i className="ri-pinterest-fill"></i>
                      </span>
                    </div>
                    <Input
                      type="text"
                      className="form-control"
                      id="pinterestName"
                      placeholder="Username"
                      defaultValue={contact_emails}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xxl={9} sm={9} md={9} lg={9}>
              <Card className="mt-n5">
                <CardHeader>
                  <Nav
                    className="nav-tabs-custom rounded card-header-tabs border-bottom-0"
                    role="tablist"
                  >
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => {
                          tabChange("1");
                        }}
                        type="button"
                      >
                        <i className="fas fa-home"></i>
                        Personal Details
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        to="#"
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => {
                          tabChange("2");
                        }}
                        type="button"
                      >
                        <i className="far fa-user"></i>
                        Change Password
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        to="#"
                        className={classnames({ active: activeTab === "3" })}
                        onClick={() => {
                          tabChange("3");
                        }}
                        type="button"
                      >
                        <i className="far fa-envelope"></i>
                        Experience
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        to="#"
                        className={classnames({ active: activeTab === "4" })}
                        onClick={() => {
                          tabChange("4");
                        }}
                        type="button"
                      >
                        <i className="far fa-envelope"></i>
                        Privacy Policy
                      </NavLink>
                    </NavItem>
                  </Nav>
                </CardHeader>
                <CardBody className="p-4">
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                      <Form
                        onSubmit={FormikForm.handleSubmit}
                        action="javascript:void(0)"
                      >
                        <Row>
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
                                  (employeeObj.gender &&
                                    gender_options.find(
                                      (e) => e.value === employeeObj.gender,
                                    )) ||
                                  []
                                }
                                onChange={(e) => {
                                  setEmployeeObj({
                                    ...employeeObj,
                                    gender: e.value,
                                  });
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
                              <Label htmlFor="reporting_manager_id">
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
                              <Label htmlFor="empWs">Work Schedule</Label>
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
                            <div className="text-end">
                              <button type="submit" className="btn btn-success">
                                Save
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
                                  // style={{
                                  //   cursor: "pointer",
                                  //   marginLeft: "10px",
                                  // }}
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
                              <button type="submit" className="btn btn-success">
                                Change Password
                              </button>
                            </div>
                          </Col>
                        </Row>
                      </Form>
                      <div className="mt-4 mb-3 border-bottom pb-2">
                        <div className="float-end">
                          <Link to="#" className="link-primary">
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
                          <Link to="#">Logout</Link>
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
                          <Link to="#">Logout</Link>
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
                          <Link to="#">Logout</Link>
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
                          <Link to="#">Logout</Link>
                        </div>
                      </div>
                    </TabPane>

                    <TabPane tabId="3">
                      <div className="d-flex align-items-center mb-4">
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-1">Experience</h5>
                          <p className="text-muted mb-0">
                            Your career journey in our company
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            color="success"
                            onClick={handleAddExperienceClick}
                          >
                            <i className="ri-add-line align-bottom me-1"></i>{" "}
                            Add Experience
                          </Button>
                        </div>
                      </div>

                      <div className="d-flex">
                        <div
                          className="position-relative me-3"
                          style={{ width: "16px" }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              left: "7px",
                              top: "22px",
                              bottom: "22px",
                              width: "2px",
                              background: "#dcdcdc",
                            }}
                          ></div>
                          <div
                            className="d-flex flex-column"
                            style={{ gap: "0" }}
                          >
                            {experienceList.map((exp) => (
                              <div
                                key={exp.id}
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                  height: "144px",
                                  position: "relative",
                                  zIndex: 1,
                                }}
                              >
                                <div
                                  className="bg-primary"
                                  style={{
                                    width: "11px",
                                    height: "11px",
                                    transform: "rotate(45deg)",
                                  }}
                                ></div>
                              </div>
                            ))}
                            <div
                              className="d-flex align-items-center justify-content-center bg-white"
                              style={{
                                height: "20px",
                                position: "relative",
                                zIndex: 1,
                              }}
                            >
                              <div
                                className="border border-secondary bg-white"
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  transform: "rotate(45deg)",
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-grow-1">
                          {experienceList.map((exp) => (
                            <Card key={exp.id} className="border mb-3">
                              <CardBody className="d-flex">
                                <div className="flex-shrink-0 me-3">
                                  <div
                                    className="avatar-sm rounded-circle bg-light d-flex align-items-center justify-content-center"
                                    style={{ width: "45px", height: "45px" }}
                                  >
                                    <i className="ri-briefcase-line fs-18"></i>
                                  </div>
                                </div>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">
                                    {exp.job_title}
                                    {exp.is_present && (
                                      <span className="badge bg-light text-dark ms-2 fw-normal">
                                        Current
                                      </span>
                                    )}
                                  </h6>
                                  <p className="text-muted mb-1">
                                    <i className="ri-building-line me-1"></i>
                                    {exp.company_name}
                                  </p>
                                  <p className="text-muted mb-2 fs-13">
                                    <i className="ri-calendar-line me-1"></i>
                                    {dayjs(exp.from_date).format(
                                      "MMM YYYY",
                                    )} -{" "}
                                    {exp.is_present
                                      ? "Present"
                                      : exp.to_date
                                        ? dayjs(exp.to_date).format("MMM YYYY")
                                        : ""}
                                    <span className="badge bg-light text-dark ms-2 fw-normal">
                                      {getExperienceDuration(
                                        exp.from_date,
                                        exp.to_date,
                                        exp.is_present,
                                      )}
                                    </span>
                                  </p>
                                  {exp.description && (
                                    <p className="text-muted mb-0 fs-13">
                                      {exp.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex-shrink-0 d-flex align-items-start gap-3">
                                  <Link
                                    to="#"
                                    className="text-success"
                                    onClick={() => handleEditExperience(exp)}
                                  >
                                    <i className="ri-pencil-line align-bottom me-1"></i>
                                    Edit
                                  </Link>
                                  <Link
                                    to="#"
                                    className="text-danger"
                                    onClick={() =>
                                      handleDeleteExperience(exp.id)
                                    }
                                  >
                                    <i className="ri-delete-bin-line align-bottom me-1"></i>
                                    Delete
                                  </Link>
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                          <div className="text-muted fs-13">
                            <i className="ri-flag-line me-1"></i>
                            Joined the company
                          </div>
                        </div>
                      </div>

                      {showExperienceForm && (
                        <Card className="border mt-4">
                          <CardHeader className="bg-light">
                            <h6 className="mb-0">
                              <i className="ri-edit-2-line align-bottom me-1"></i>{" "}
                              Add / Edit Experience
                            </h6>
                            <p className="text-muted mb-0 fs-13">
                              Enter experience details
                            </p>
                          </CardHeader>
                          <CardBody>
                            <Row className="g-3">
                              <Col md={6}>
                                <Label className="form-label">
                                  Job Title <span>*</span>
                                </Label>
                                <Input
                                  type="text"
                                  name="job_title"
                                  placeholder="Enter job title"
                                  value={experienceForm.job_title}
                                  onChange={(e) => {
                                    const value = e.target.value
                                      .replace(/^[ ]+/, "")
                                      .replace(/[^A-Za-z0-9.,&()'\-\s]/g, "");

                                    setExperienceForm({
                                      ...experienceForm,
                                      job_title: value,
                                    });

                                    if (value.length > 100) {
                                      setExperienceFormErrors((prev) => ({
                                        ...prev,
                                        job_title:
                                          "Job Title must not exceed 100 characters",
                                      }));
                                    } else {
                                      setExperienceFormErrors((prev) => ({
                                        ...prev,
                                        job_title: "",
                                      }));
                                    }
                                  }}
                                  autoComplete="off"
                                  invalid={!!experienceFormErrors.job_title}
                                />
                                {experienceFormErrors.job_title && (
                                  <div className="lc_form_error_text">
                                    {experienceFormErrors.job_title}
                                  </div>
                                )}
                              </Col>
                              <Col md={6}>
                                <Label className="form-label">
                                  Company Name <span>*</span>
                                </Label>
                                <Input
                                  type="text"
                                  name="company_name"
                                  placeholder="Enter company name"
                                  value={experienceForm.company_name}
                                  onChange={(e) => {
                                    const value = e.target.value
                                      .replace(/^[ ]+/, "")
                                      .replace(/[^A-Za-z0-9.,&()'\-\s]/g, "");

                                    setExperienceForm({
                                      ...experienceForm,
                                      company_name: value,
                                    });

                                    if (value.length > 100) {
                                      setExperienceFormErrors((prev) => ({
                                        ...prev,
                                        company_name:
                                          "Company Name must not exceed 100 characters",
                                      }));
                                    } else {
                                      setExperienceFormErrors((prev) => ({
                                        ...prev,
                                        company_name: "",
                                      }));
                                    }
                                  }}
                                  autoComplete="off"
                                  invalid={!!experienceFormErrors.company_name}
                                />
                                {experienceFormErrors.company_name && (
                                  <div className="lc_form_error_text">
                                    {experienceFormErrors.company_name}
                                  </div>
                                )}
                              </Col>
                              <Col md={6}>
                                <Label className="form-label">
                                  From Date <span>*</span>
                                </Label>
                                <DatePicker
                                  className="form-control"
                                  placeholder="Select start date"
                                  format="DD-MM-YYYY"
                                  value={
                                    experienceForm.from_date
                                      ? dayjs(experienceForm.from_date)
                                      : null
                                  }
                                  onChange={handleExperienceFromDateChange}
                                  style={{ width: "100%" }}
                                  status={
                                    experienceFormErrors.from_date
                                      ? "error"
                                      : ""
                                  }
                                />
                                {experienceFormErrors.from_date && (
                                  <div className="lc_form_error_text">
                                    {experienceFormErrors.from_date}
                                  </div>
                                )}
                              </Col>
                              <Col md={6}>
                                <Label className="form-label">To Date</Label>
                                <div className="d-flex align-items-center gap-2">
                                  <DatePicker
                                    className="form-control"
                                    placeholder="Select end date"
                                    format="DD-MM-YYYY"
                                    disabled={experienceForm.is_present}
                                    value={
                                      experienceForm.to_date
                                        ? dayjs(experienceForm.to_date)
                                        : null
                                    }
                                    onChange={handleExperienceToDateChange}
                                    style={{ width: "100%" }}
                                  />
                                  <div className="form-check text-nowrap">
                                    <Input
                                      type="checkbox"
                                      className="form-check-input"
                                      id="is_present"
                                      checked={experienceForm.is_present}
                                      onChange={handleExperiencePresentToggle}
                                    />
                                    <Label
                                      className="form-check-label"
                                      htmlFor="is_present"
                                    >
                                      Present
                                    </Label>
                                  </div>
                                </div>
                              </Col>
                              <Col md={12}>
                                <Label className="form-label">
                                  Job Description
                                </Label>
                                <Input
                                  type="textarea"
                                  name="description"
                                  rows="3"
                                  placeholder="Describe your role, responsibilities and achievements..."
                                  value={experienceForm.description}
                                  onChange={handleExperienceInputChange}
                                  autoComplete="off"
                                />
                              </Col>
                              <Col md={12}>
                                <div className="hstack gap-2">
                                  <Button
                                    color="success"
                                    onClick={handleSaveExperience}
                                  >
                                    <i className="ri-save-line align-bottom me-1"></i>{" "}
                                    {isEditingExperience ? "Update" : "Save"}
                                  </Button>
                                  <Button
                                    color="light"
                                    onClick={handleCancelExperienceForm}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      )}
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
                            <Link to="#" className="btn btn-sm btn-primary">
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
                            <Link to="#" className="btn btn-sm btn-primary">
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
                            <Link to="#" className="btn btn-sm btn-primary">
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
                          <Link to="#" className="btn btn-soft-danger">
                            Close & Delete This Account
                          </Link>
                          <Link to="#" className="btn btn-light">
                            Cancel
                          </Link>
                        </div>
                      </div>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AccountSettings;
