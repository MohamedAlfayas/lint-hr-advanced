import React, { Fragment, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DatePicker } from "antd";
import { Api } from "../../common/api/Api";
import { EmployeeDisplayInSelect } from "../../common/js/EmployeeDisplayInSelect";
dayjs.extend(customParseFormat);

// Register the plugins
// registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);
const EmployeeForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  // console.log("fgdf",form_obj);
  const [employeeObj, setEmployeeObj] = useState({});

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
  const inputRef = useRef();

  const showFileNameIfSelected = () => {
    const idProofUrl = form_obj.id_proof_url;
    const fileName = idProofUrl ? idProofUrl.split("/").pop() : "";
    setSelectedFileName(fileName);
  };
  const handleClearFile = () => {
    setSelectedFileName("");
  };
  const handleClearFile1 = () => {
    setSelectedFileName1("");
  };
  const handleClearFile2 = () => {
    setSelectedFileName2("");
  };
  const handleClearFile3 = () => {
    setSelectedFileName3("");
  };
  const handleClearFile4 = () => {
    setSelectedFileName4("");
  };
  const handleClearFile5 = () => {
    setSelectedFileName5("");
  };

  const showFile1NameIfSelected = () => {
    const file1Url = form_obj.file_1_url;
    const fileName1 = file1Url ? file1Url.split("/").pop() : "";
    setSelectedFileName1(fileName1);
  };

  const showFile2NameIfSelected = () => {
    const file2Url = form_obj.file_2_url;
    const fileName2 = file2Url ? file2Url.split("/").pop() : "";
    setSelectedFileName2(fileName2);
  };

  const showFile3NameIfSelected = () => {
    const file3Url = form_obj.file_3_url;
    const fileName3 = file3Url ? file3Url.split("/").pop() : "";
    setSelectedFileName3(fileName3);
  };
  const showFile4NameIfSelected = () => {
    const file4Url = form_obj.file_4_url;
    const fileName4 = file4Url ? file4Url.split("/").pop() : "";
    setSelectedFileName4(fileName4);
  };
  const showFile5NameIfSelected = () => {
    const file5Url = form_obj.file_5_url;
    const fileName5 = file5Url ? file5Url.split("/").pop() : "";
    setSelectedFileName5(fileName5);
  };

  useEffect(() => {
    console.log("Form Obj = ", form_obj);
    setEmployeeObj({
      ...form_obj,
      dob: ConvertISODateFormat(form_obj.dob),
      joining_date: ConvertISODateFormat(form_obj.joining_date),
    });
    setDob(ConvertDateFormat(ConvertISODateFormat(form_obj.dob)));
    setJoinDate(ConvertDateFormat(ConvertISODateFormat(form_obj.joining_date)));

    if (
      form_obj.country_code !== "" &&
      form_obj.country_code !== null &&
      form_obj.country_code !== undefined
    ) {
      setContactCountry(
        CountryList.find((d) => d.countryCode === form_obj.country_code)
      );
    }

    showFileNameIfSelected();
    showFile1NameIfSelected();
    showFile2NameIfSelected();
    showFile3NameIfSelected();
    showFile4NameIfSelected();
    showFile5NameIfSelected();
  }, [form_obj]);

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
    console.log("Branch Change ID List = ", branch_id_list);
    setEmployeeObj({
      ...employeeObj,
      branch_id_list: branch_id_list,
    });
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

    console.log("valid_dep_ids = ", valid_dep_ids);

    if (valid_dep_ids.length) {
      const Api = await PostApi(
        "employee/get-employee-list-for-reporting-manager/",
        { dep_id: valid_dep_ids },
        false
      );
      console.log("API RES = ", Api);
      if (Api.status && Api.status === 200) {
        const response = Api?.data?.data;
        console.log("employee id List = ", response);
        console.log("emp Data = ", employee_data);
        console.log(
          "employee Obj = ",
          employee_data.filter((d) => response.includes(d.id))
        );
        setReportingManagerOptions(
          employee_data.filter((d) => response.includes(d.id))
        );
      } else {
        console.log("ERRR = ", Api?.data?.message);
      }
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
        item.id === cf_id ? { ...item, value: e.target.value } : item
      ),
    });
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: employeeObj,
    validationSchema: Yup.object({
      fname: Yup.string().trim().required("Please Enter First Name"),
      lname: Yup.string().trim().required("Please Enter Last Name"),
      email: Yup.string()
        .email("Please Enter Valid Email")
        .required("Please Enter Email"),
      gender: Yup.number()
        .required("Select Gender")
        .min(1, "Please Select Gender"),
      dob: Yup.string().trim().required("Please Select Date"),
      contact_number: Yup.string().required("Please Enter Phone Number"),
      role_id: Yup.number()
        .required("Select Role")
        .min(1, "Please Select Role"),
      branch_id_list: Yup.array().min(1, "Please Select Branch"),
      primary_department_id_list: Yup.array().min(
        1,
        "Please Select Department"
      ),
      work_schedule_id: Yup.number()
        .required("Select Work Schedule")
        .min(1, "Please Select Work Schedule"),
    }),
    onSubmit: async (values) => {
      console.log("SUCCESSSS !!!! Formik Values = ", values);
      dispatch(setLoaderVisible(true));

      console.log("emp Obj = ", employeeObj);
      let form_data = new FormData();
      employeeImage !== null &&
        form_data.append("profile", employeeImage, employeeImage.name);
      Object.entries(employeeObj).map((key, idx) => {
        if (key[0] === "cf_values") {
          form_data.append(key[0], JSON.stringify(key[1]));
        } else {
          form_data.append(key[0], key[1]);
        }
      });

      // const Api = await PostApi("employee/add-new/", form_data, true);
      // console.log("API RES = ", Api);
      // if (Api.status && Api.status === 200) {
      //   employeeObj.id === 0
      //     ? dispatch(addEmployee(Api?.data.data))
      //     : dispatch(editEmployee(Api?.data?.data));
      //   dispatch(toggleRSBView(false));
      //   toast.success(Api?.data?.message);
      // } else {
      //   toast.error(Api?.data?.message || Api?.data?.detail);
      // }

      dispatch(setLoaderVisible(false));
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
          : item
      ),
    });
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form onSubmit={FormikForm.handleSubmit} action="javascript:void(0)">
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
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="emailid" className="form-label">
                    Employee ID
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="emp_id"
                      id="employeeid"
                      className="form-control"
                      placeholder="Employee ID"
                      value={employeeObj.emp_id || ""}
                      onChange={handleInputChange}
                    />
                    <i className="ri-user-line"></i>
                  </div>
                  <div id="passwordHelpBlock" className="form-text mb-3">
                    Enter Employee ID.
                  </div>
                </div>
              </Col>
              <Col md={6} lg={6} xxl={6}>
                <div>
                  <Label htmlFor="fname" className="form-label">
                    First Name
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="fname"
                      id="fname"
                      className="form-control"
                      placeholder="Elon"
                      value={employeeObj.fname || ""}
                      onChange={handleInputChange}
                      invalid={
                        FormikForm.touched.fname && FormikForm.errors.fname
                          ? true
                          : false
                      }
                    />
                    {!FormikForm.touched.fname && !FormikForm.errors.fname && (
                      <i className="ri-user-line"></i>
                    )}
                    {FormikForm.touched.fname && FormikForm.errors.fname ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.fname}
                      </FormFeedback>
                    ) : null}
                  </div>
                  {!FormikForm.errors.fname && (
                    <div id="passwordHelpBlock" className="form-text mb-3">
                      Enter First Name.
                    </div>
                  )}
                </div>
              </Col>
              <Col md={6} lg={6} xxl={6}>
                <div>
                  <Label htmlFor="lname" className="form-label">
                    Last Name
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="lname"
                      id="lname"
                      className="form-control"
                      placeholder="Musk"
                      value={employeeObj.lname || ""}
                      onChange={handleInputChange}
                      invalid={
                        FormikForm.touched.lname && FormikForm.errors.lname
                          ? true
                          : false
                      }
                    />
                    {!FormikForm.touched.lname && !FormikForm.errors.lname && (
                      <i className="ri-user-2-line"></i>
                    )}
                    {FormikForm.touched.lname && FormikForm.errors.lname ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.lname}
                      </FormFeedback>
                    ) : null}
                  </div>
                  {!FormikForm.errors.lname && (
                    <div id="passwordHelpBlock" className="form-text mb-3">
                      Enter last Name.
                    </div>
                  )}
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
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
                      invalid={
                        FormikForm.touched.email && FormikForm.errors.email
                          ? true
                          : false
                      }
                    />
                    {!FormikForm.touched.email && !FormikForm.errors.email && (
                      <i className="ri-at-line"></i>
                    )}
                    {FormikForm.touched.email && FormikForm.errors.email ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.email}
                      </FormFeedback>
                    ) : null}
                  </div>
                  {!FormikForm.errors.email && (
                    <div id="passwordHelpBlock" className="form-text mb-3">
                      Enter Email.
                    </div>
                  )}
                </div>
              </Col>
              <Col lg={12}>
                <div>
                  <Label htmlFor="emp_gender" className="form-label">
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
                          (e) => e.value === employeeObj.gender
                        )) ||
                      []
                    }
                    onChange={(e) => {
                      setEmployeeObj({ ...employeeObj, gender: e.value });
                    }}
                    invalid={
                      FormikForm.touched.gender && FormikForm.errors.gender
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.gender && FormikForm.errors.gender ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.gender}
                    </div>
                  ) : null}
                  {!FormikForm.errors.gender && (
                    <div id="passwordHelpBlock" className="form-text mb-3">
                      Select Gender.
                    </div>
                  )}
                </div>
              </Col>
              <Col lg={12}>
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
                  <div id="passwordHelpBlock" className="form-text mb-3">
                    Select DOB.
                  </div>
                </div>
              </Col>

              <Col lg={12}>
                <div>
                  <Label className="form-label">Contact Number*</Label>
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
                      type="number"
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
                      value={employeeObj.contact_number || ""}
                      onChange={(e) =>
                        updateProfileData("contact_number", e.target.value)
                      }
                      invalid={
                        FormikForm.touched.contact_number &&
                        FormikForm.errors.contact_number
                          ? true
                          : false
                      }
                    />
                    {FormikForm.touched.contact_number &&
                    FormikForm.errors.contact_number ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.contact_number}
                      </FormFeedback>
                    ) : null}
                    <DropdownMenu
                      as="ul"
                      className="list-unstyled w-100 dropdown-menu-list mb-0"
                    >
                      <SimpleBar
                        style={{ maxHeight: "220px" }}
                        className="px-3"
                      >
                        {(
                          CountryList.filter((obj) => obj.show).sort((a, b) =>
                            a.countryName.localeCompare(b.countryName)
                          ) || []
                        ).map((item, key) => (
                          <DropdownItem
                            as="li"
                            onClick={() => {
                              updateProfileData(
                                "country_code",
                                item.countryCode
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
                    <div id="passwordHelpBlock" className="form-text mb-3">
                      Enter Your Contact number with country code.
                    </div>
                  )}
                </div>
              </Col>

              <Col lg={12}>
                <div>
                  <Label htmlFor="branch" className="form-label">
                    Branch
                  </Label>
                  <Select
                    id="branch"
                    name="branch"
                    innerRef={inputRef}
                    isMulti={true}
                    options={branch_options || []}
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
                            (employeeObj?.branch_id_list).includes(d.id)
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
                    <div id="passwordHelpBlock" className="form-text mb-3">
                      Select Branch
                    </div>
                  )}
                </div>
              </Col>

              <Col lg={12}>
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
                    className="basic-multi-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          FormikForm.touched.primary_department_id_list &&
                          FormikForm.errors.primary_department_id_list
                            ? "red !important"
                            : provided.borderColor,
                      }),
                    }}
                    placeholder={"Select Primary Department"}
                    value={
                      employeeObj?.primary_department_id_list
                        ? dep_options.filter((d) =>
                            (employeeObj?.primary_department_id_list).includes(
                              d.id
                            )
                          )
                        : []
                    }
                    onChange={handlePrimaryDepChange}
                    invalid={
                      FormikForm.touched.primary_department_id_list &&
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
                  {!FormikForm.errors.primary_department_id_list && (
                    <div id="passwordHelpBlock" className="form-text mb-3">
                      Select Primary Department
                    </div>
                  )}
                </div>
              </Col>

              <Col lg={12}>
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
                      (employeeObj.role_id &&
                        role_id_option.find(
                          (e) => e.id === employeeObj.role_id
                        )) ||
                      []
                    }
                    onChange={(e) => {
                      setEmployeeObj({ ...employeeObj, role_id: e.id });
                    }}
                    invalid={
                      FormikForm.touched.role_id && FormikForm.errors.role_id
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.role_id && FormikForm.errors.role_id ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.role_id}
                    </div>
                  ) : null}
                  {!FormikForm.errors.role_id && (
                    <div id="passwordHelpBlock" className="form-text mb-3">
                      Select Role
                    </div>
                  )}
                </div>
              </Col>

              {/* {employeeObj.primary_department_id !== 0 ? (
                <Col md={12} lg={12} xxl={12}>
                  <div>
                    <Label htmlFor="isManager" className="form-label">
                      Is Manager
                    </Label>
                    <div className="mb-2">
                      <div
                        className="form-check form-switch form-switch-md form-switch-success"
                        dir="ltr"
                      >
                        {" "}
                        <Input
                          id="isManager"
                          name="is_manager"
                          type="checkbox"
                          className="form-check-input"
                          checked={employeeObj.is_manager}
                          onChange={(e) =>
                            setEmployeeObj({
                              ...employeeObj,
                              is_manager: e.target.checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  {dep_options.length && (
                    <div id="passwordHelpBlock" className="form-text mb-3">
                      Check if{" "}
                      <b>
                        <i>{employeeObj.fname}</i>
                      </b>{" "}
                      is Manager of{" "}
                      <b>
                        <i>
                          {dep_options.find(
                            (obj) =>
                              obj.id === employeeObj.primary_department_id
                          )?.name || ""}
                        </i>
                      </b>{" "}
                      Department ?
                    </div>
                  )}
                </Col>
              ) : (
                ""
              )}               */}

              <Col lg={12}>
                <div>
                  <Label htmlFor="reporting_manager_id">
                    Reporting Manager
                  </Label>
                  <Select
                    id="reporting_manager_id"
                    name="reporting_manager_id"
                    innerRef={inputRef}
                    isMulti={false}
                    options={reportingManagerOptions || []}
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
                          (e) => e.id === employeeObj.reporting_manager_id
                        )) ||
                      []
                    }
                    onChange={(e) =>
                      setEmployeeObj({
                        ...employeeObj,
                        reporting_manager_id: e.id,
                      })
                    }
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
                  <div id="passwordHelpBlock" className="form-text mb-3">
                    Select Reporting Manager
                  </div>
                )}
              </Col>

              <Col lg={12}>
                <div>
                  <Label htmlFor="empWs">Work Schedule</Label>
                  <Select
                    id="empWs"
                    name="work_schedule_id"
                    innerRef={inputRef}
                    isMulti={false}
                    options={ws_options || []}
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
                          (e) => e.id === employeeObj.work_schedule_id
                        )) ||
                      []
                    }
                    onChange={(e) =>
                      setEmployeeObj({ ...employeeObj, work_schedule_id: e.id })
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
                  <div id="passwordHelpBlock" className="form-text mb-3">
                    Select Work Schedule
                  </div>
                )}
              </Col>
              <Col lg={12}>
                <div>
                  <Label htmlFor="joindate" className="form-label">
                    Joining Date
                  </Label>
                  <DatePicker
                    className="form-control"
                    id="joining_date"
                    value={dayjs(joining_date, DateFormat)}
                    format={"DD/MM/YYYY"}
                    allowClear={false}
                    onChange={handleJoinDateChange}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Your Joining Date.
                </div>
              </Col>
              {/* <Col>
                <div>
                  <Label htmlFor="formFile" className="form-label">
                    ID Proof
                  </Label>
                  <Input
                    className="form-control"
                    type="file"
                    accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                    id="formFile"
                    onChange={(e) => handleFileUpload(e, "id_proof")}
                  />
                </div>
              </Col> */}

              {/* <div>{selectedFileName && `Selected File Name: ${selectedFileName}`}</div> */}

              {selectedFileName ? (
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
                    {/* You can add more rows for other files if needed */}
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
                      accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "id_proof")}
                    />
                  </div>
                </Col>
              )}
              <div id="passwordHelpBlock" className="form-text mb-3">
                {!selectedFileName && <p>Select ID Proof.</p>}
              </div>

              {/* <Col>
                <div>
                  <Label htmlFor="formFile" className="form-label">
                    File 1
                  </Label>
                  <Input
                    className="form-control"
                    type="file"
                    accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                    id="formFile"
                    onChange={(e) => handleFileUpload(e, "file_1")}
                  />
                </div>
              </Col> */}

              {selectedFileName1 ? (
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
                      <td>File 1</td>
                      <td>{selectedFileName1}</td>
                      <td>
                        <button onClick={handleClearFile1}>
                          <i className="ri-close-line fs-16"></i>
                        </button>
                      </td>
                    </tr>
                    {/* You can add more rows for other files if needed */}
                  </tbody>
                </table>
              ) : (
                <Col>
                  <div>
                    <Label htmlFor="formFile" className="form-label">
                      File 1
                    </Label>
                    <Input
                      className="form-control"
                      type="file"
                      accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "file_1")}
                    />
                  </div>
                </Col>
              )}
              <div id="passwordHelpBlock" className="form-text mb-3">
                {!selectedFileName1 && <p>Select File 1.</p>}
              </div>
              {/* <Col>
                <div>
                  <Label htmlFor="formFile" className="form-label">
                    File 2
                  </Label>
                  <Input
                    className="form-control"
                    type="file"
                    accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                    id="formFile"
                    onChange={(e) => handleFileUpload(e, "file_2")}
                  />
                </div>
              </Col> */}

              {selectedFileName2 ? (
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
                      <td>File 2</td>
                      <td>{selectedFileName2}</td>
                      <td>
                        <button onClick={handleClearFile2}>
                          <i className="ri-close-line fs-16"></i>
                        </button>
                      </td>
                    </tr>
                    {/* You can add more rows for other files if needed */}
                  </tbody>
                </table>
              ) : (
                <Col>
                  <div>
                    <Label htmlFor="formFile" className="form-label">
                      File 2
                    </Label>
                    <Input
                      className="form-control"
                      type="file"
                      accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "file_2")}
                    />
                  </div>
                </Col>
              )}
              <div id="passwordHelpBlock" className="form-text mb-3">
                {!selectedFileName2 && <p>Select File 2.</p>}
              </div>
              {/* <Col>
                <div>
                  <Label htmlFor="formFile" className="form-label">
                    File 3
                  </Label>
                  <Input
                    className="form-control"
                    type="file"
                    accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                    id="formFile"
                    onChange={(e) => handleFileUpload(e, "file_3")}
                  />
                </div>
              </Col> */}
              {selectedFileName3 ? (
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
                      <td>File 3</td>
                      <td>{selectedFileName3}</td>
                      <td>
                        <button onClick={handleClearFile3}>
                          <i className="ri-close-line fs-16"></i>
                        </button>
                      </td>
                    </tr>
                    {/* You can add more rows for other files if needed */}
                  </tbody>
                </table>
              ) : (
                <Col>
                  <div>
                    <Label htmlFor="formFile" className="form-label">
                      File 3
                    </Label>
                    <Input
                      className="form-control"
                      type="file"
                      accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "file_3")}
                    />
                  </div>
                </Col>
              )}
              <div id="passwordHelpBlock" className="form-text mb-3">
                {!selectedFileName3 && <p>Select File 3.</p>}
              </div>
              {/* <Col>
                <div>
                  <Label htmlFor="formFile" className="form-label">
                    File 4
                  </Label>
                  <Input
                    className="form-control"
                    type="file"
                    accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                    id="formFile"
                    onChange={(e) => handleFileUpload(e, "file_4")}
                  />
                </div>
              </Col> */}
              {selectedFileName4 ? (
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
                      <td>File 4</td>
                      <td>{selectedFileName4}</td>
                      <td>
                        <button onClick={handleClearFile4}>
                          <i className="ri-close-line fs-16"></i>
                        </button>
                      </td>
                    </tr>
                    {/* You can add more rows for other files if needed */}
                  </tbody>
                </table>
              ) : (
                <Col>
                  <div>
                    <Label htmlFor="formFile" className="form-label">
                      File 4
                    </Label>
                    <Input
                      className="form-control"
                      type="file"
                      accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "file_4")}
                    />
                  </div>
                </Col>
              )}
              <div id="passwordHelpBlock" className="form-text mb-3">
                {!selectedFileName4 && <p>Select File 4.</p>}
              </div>
              {/* <Col>
                <div>
                  <Label htmlFor="formFile" className="form-label">
                    File 5
                  </Label>
                  <Input
                    className="form-control"
                    type="file"
                    accept=".doc, .docx,.xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                    id="formFile"
                    onChange={(e) => handleFileUpload(e, "file_5")}
                  />
                </div>
              </Col> */}
              {selectedFileName5 ? (
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
                      <td>File 5</td>
                      <td>{selectedFileName5}</td>
                      <td>
                        <button onClick={handleClearFile5}>
                          <i className="ri-close-line fs-16"></i>
                        </button>
                      </td>
                    </tr>
                    {/* You can add more rows for other files if needed */}
                  </tbody>
                </table>
              ) : (
                <Col>
                  <div>
                    <Label htmlFor="formFile" className="form-label">
                      File 5
                    </Label>
                    <Input
                      className="form-control"
                      type="file"
                      accept=".doc, .docx, .xls, .xlsx, .pdf, .txt, image/*, .gif, .bmp, .svg"
                      id="formFile"
                      onChange={(e) => handleFileUpload(e, "file_5")}
                    />
                  </div>
                </Col>
              )}
              <div id="passwordHelpBlock" className="form-text mb-3">
                {!selectedFileName5 && <p>Select File 5.</p>}
              </div>
              {/* <Col lg={12}>
              <Label htmlFor="formFile" className="form-label"> Other Documents</Label>
                <FilePond
                  files={files}
                  onupdatefiles={handleFileUpdate}
                  allowMultiple={true}
                  maxFiles={3}
                  name="filepond"
                  className="filepond filepond-input-multiple mb-0"
                />
              </Col>
              <div id="passwordHelpBlock" className="form-text mb-3">
                Select Other Documents.
              </div> */}
              <Col lg={12}>
                <div>
                  <Label htmlFor="profile_timezone" className="form-label">
                    Time Zone
                  </Label>
                  <div className="form-icon right">
                    <Select
                      name="profile_timezone"
                      id="profile_timezone"
                      value={
                        employeeObj.profile_timezone &&
                        timzone_options.find(
                          (e) => e.value === employeeObj.profile_timezone
                        )
                      }
                      onChange={handleTimeZoneChange}
                      options={timzone_options}
                      placeholder="Select a time zone"
                    />
                  </div>
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Time Zone
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="isActive" className="form-label">
                    Is Active
                  </Label>

                  <div className="mb-2">
                    <div
                      className="form-check form-switch form-switch-md form-switch-success"
                      dir="ltr"
                    >
                      {" "}
                      <Input
                        id="isActive"
                        name="is_active"
                        type="checkbox"
                        className="form-check-input"
                        checked={employeeObj.is_active}
                        onChange={(e) =>
                          setEmployeeObj({
                            ...employeeObj,
                            is_active: e.target.checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Check if{" "}
                  <b>
                    <i>{employeeObj.fname}</i>
                  </b>{" "}
                  is Active State.
                </div>
              </Col>

              <hr></hr>
              {employeeObj.cf_values && employeeObj.cf_values.length
                ? employeeObj.cf_values.map((obj) => (
                    <Col lg={12}>
                      <div className="mb-3">
                        <Label htmlFor="obj.input_name" className="form-label">
                          {obj.name}
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
                              />
                              <i className="ri-user-2-line"></i>
                            </div>
                            <div id="passwordHelpBlock" className="form-text">
                              Enter {obj.name}
                            </div>
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
                                    DateFormat
                                  )
                            }
                            allowClear={false}
                            onChange={(e, dateStr) =>
                              handleCFDateChange(e, dateStr, obj.id)
                            }
                          />
                        )}
                        {obj.type === form_select_type && (
                          <Select
                            name={obj.input_name}
                            id={obj.input_name}
                            options={obj.options}
                            placeholder={`Select ${obj.name}`}
                          />
                        )}
                      </div>
                    </Col>
                  ))
                : null}

              <Col lg={12}>
                <div className="text-end">
                  <Button type="submit" color="success" className="btn-label">
                    {" "}
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Save{" "}
                  </Button>{" "}
                </div>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default EmployeeForm;
