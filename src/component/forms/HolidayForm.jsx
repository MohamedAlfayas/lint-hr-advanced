import axios from "axios";
import { FilePond } from "filepond";
import React, { useEffect, useMemo, useState,useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
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
  UncontrolledDropdown,
} from "reactstrap";
import Select from "react-select";
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  addHoliday,
  editHoliday,
} from "../../redux/reducers/ChildReducer/HolidayReducer";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../common/js/ConvertDateFormat";

import Flatpickr from "react-flatpickr";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PostApi } from "../../common/api/PostApi";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DateFormat } from "../../common/constant/Constants";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";
dayjs.extend(customParseFormat);

const HolidayForm = () => {
  const dispatch = useDispatch();
  const [date, setDate] = useState("");
  const [holidayObj, setHolidayObj] = useState({});
  const minDate = dayjs("01-01-1900", "DD-MM-YYYY");
  const maxDate = dayjs().add(1, "year");
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  console.log("form_obj Holiday FORM", form_obj);
  const ws_options = GetLocalStorageData("work_schedule") || [];
  const [selectedWS, setSelectedWS] = useState([]);

  const [dateTypeError, setDateTypeError] = useState("");
  const [dateRawInvalidText, setDateRawInvalidText] = useState(null);
  const datePickerRef = useRef(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const dateRawTyped = useRef("");
  const [lengthWarnings, setLengthWarnings] = useState({
    name: "",
    description: "",
  });

  const MAX_LENGTHS = {
    name: 150,
    description: 200,
  };

  const checkMaxLength = (field, rawValue) => {
    const max = MAX_LENGTHS[field];
    const msg =
      rawValue.length > max
        ? `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${max} characters`
        : "";
    setLengthWarnings((prev) => ({ ...prev, [field]: msg }));
  };

  useEffect(() => {
    console.log("USEEFFECT CALLED HOLIDAY");
    setHolidayObj({
      ...form_obj,
      date: ConvertISODateFormat(form_obj.date),
    });
    setDate(ConvertDateFormat(ConvertISODateFormat(form_obj?.date)));
    setSelectedWS(
      ws_options.filter((data) =>
        form_obj.work_schedule_id_list.includes(data.id)
      )
    );
    setDateTypeError("");
    setDateRawInvalidText(null);
    dateRawTyped.current = "";
    setLengthWarnings({ name: "", description: "" });
  }, [form_obj]);

  const FormikForm = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: holidayObj,
    validationSchema: Yup.object({
      // name: Yup.string().trim().required("Please Enter Holiday Name"),
      name: Yup.string()
        .trim()
        .required("Please Enter Holiday Name")
        .max(150, "Holiday Name must not exceed 150 characters")
        .matches(
          /^[A-Za-z\s'-]+$/,
          "Holiday Name can contain letters, spaces, apostrophes (') and hyphens (-) only"
        ),

      date: Yup.string()
        .required("Select Date")
        .test(
          "valid-date",
          "Enter the valid date",
          (value) => {
            if (!value) return false;

            const parsedDate = dayjs(value, "YYYY-MM-DD", true);

            return (
              parsedDate.isValid() &&
              !parsedDate.isBefore(dayjs("1900-01-01"), "day") &&
              !parsedDate.isAfter(dayjs().add(1, "year"), "day")
            );
          }
        ),

      description: Yup.string()
        .trim()
        .max(200, "Description must not exceed 200 characters"),

      work_schedule_id_list: Yup.array()
        .required("Select Work Schedule")
        .min(1, "Select Work Schedule"),
    }),
    onSubmit: async (values) => {

      dispatch(setLoaderVisible(true));

      const Api = await PostApi("holiday/create/", values, false);
      if (Api.status && Api.status === 200) {
        if (holidayObj.id === 0) {
          dispatch(addHoliday(Api?.data.data));
          SetLocalStorage("holiday", Api?.data.data, 2);
        } else {
          dispatch(editHoliday(Api?.data?.data));
          SetLocalStorage("holiday", Api?.data.data, 3);
        }
        // holidayObj.id === 0
        //   ? dispatch(addHoliday(Api?.data.data))
        //   : dispatch(editHoliday(Api?.data?.data));
        dispatch(toggleRSBView(false));
        toast.success(Api?.data?.message);
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail);
      }

      dispatch(setLoaderVisible(false));
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHolidayObj({
      ...holidayObj,
      [name]: value,
    });
  };


  const handleWSChange = (obj) => {
    setSelectedWS(obj);

    const ids = obj.map((d) => d.id);

    setHolidayObj({
      ...holidayObj,
      work_schedule_id_list: ids,
    });

    FormikForm.setFieldValue("work_schedule_id_list", ids);
    FormikForm.setFieldTouched("work_schedule_id_list", true, false);
  };

  // const handleDateChange = (selectedDates, dateStr) => {
  //   setDate(dateStr);
  //   setHolidayObj({
  //     ...holidayObj,
  //     date: ConvertISODateFormat(ConvertDateFormat(dateStr)),
  //   });
  // };

  const handleDateChange = (selectedDates, dateStr) => {
    if (!selectedDates || !dateStr) {
      setDateTypeError("");
      return;
    }
    setDate(dateStr);
    if (selectedDates.isBefore(minDate, "day")) {
      setDateTypeError("Year must be 1900 or later");
      FormikForm.setFieldValue("date", "");
      return;
    }
    if (selectedDates.isAfter(maxDate, "day")) {
      setDateTypeError("Date cannot exceed one year from today");
      FormikForm.setFieldValue("date", "");
      return;
    }
    setDateTypeError("");
    const formattedDate = ConvertISODateFormat(ConvertDateFormat(dateStr));
    setHolidayObj({ ...holidayObj, date: formattedDate });
    FormikForm.setFieldValue("date", formattedDate);
    FormikForm.setFieldTouched("date", true, false);
  };

  const handleDateKeyDown = (e) => {
    const controlKeys = ["Backspace","Delete","Tab","ArrowLeft","ArrowRight","Home","End"];
    if (!/^[0-9\-]$/.test(e.key) && !controlKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleDateKeyUp = (e) => {
    const val = e.target.value;
    dateRawTyped.current = val;
    // Try to validate whenever it's plausibly a complete date,
    // not just when it's exactly 10 chars (handles "1-1-1800" too).
    
    if (val.length < 8) { setDateTypeError(""); return; } // still typing, don't flash errors early
    const formatRegex = /^\d{2}-\d{2}-\d{4}$/;

    if (!formatRegex.test(val)) {
      setDateTypeError("Invalid date format. Use DD-MM-YYYY.");
      return;
    }

    const parsed = dayjs(val, DateFormat, true);

    if (!parsed.isValid()) {
      setDateTypeError("Invalid date. Please enter a valid date.");
      return;
    }
    if (parsed.isBefore(minDate, "day")) {
      setDateTypeError("Year must be 1900 or later");
    } else if (parsed.isAfter(maxDate, "day")) {
      setDateTypeError("Date cannot exceed one year from today");
    } else {
      setDateTypeError("");
    }
  };

  const handleDateBlur = (e) => {
    const typed = dateRawTyped.current || e.target.value;
    if (!typed) return;
    const formatRegex = /^\d{2}-\d{2}-\d{4}$/;
    const parsed = dayjs(typed, DateFormat, true);
    let errMsg = "";

    if (!formatRegex.test(typed)) {
      errMsg = "Invalid date format. Use DD-MM-YYYY.";
    } else if (!parsed.isValid()) {
      errMsg = "Invalid date. Please enter a valid date.";
    }
    else if (parsed.isBefore(minDate, "day")) errMsg = "Year must be 1900 or later";
    else if (parsed.isAfter(maxDate, "day")) errMsg = "Date cannot exceed one year from today";

    if (errMsg) {
      setDateTypeError(errMsg);
      setDateRawInvalidText(typed);
      return;
    }
    setDateRawInvalidText(null);
    dateRawTyped.current = "";
    setDateTypeError("");
    handleDateChange(parsed, typed);
  };


  React.useLayoutEffect(() => {
    if (dateTypeError && dateRawTyped.current) {
      const input = datePickerRef.current?.nativeElement?.querySelector("input");
      if (input) input.value = dateRawTyped.current;
    }
  });

  const disableHolidayDates = (current) => {
    if (!current) return false;

    return (
      current.isBefore(dayjs("01-01-1900", "DD-MM-YYYY"), "day") ||
      current.isAfter(dayjs().add(1, "year"), "day")
    );
  };

  const filterWorkSchedule = (option, inputValue) => {
    // Don't show results when numbers or special characters are typed
    if (inputValue && !/^[A-Za-z\s]*$/.test(inputValue)) {
      return false;
    }

    return option.label
      .toLowerCase()
      .includes(inputValue.toLowerCase());
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          {/* <Form onSubmit={FormikForm.handleSubmit}> */}
          <Form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setHasAttemptedSubmit(true);
                  FormikForm.setTouched({
                    name: true,
                    date: true,
                    description: true,
                    work_schedule_id_list: true,
                  });
                  const errors = await FormikForm.validateForm();
                  if (Object.keys(errors).length > 0) return;
                  FormikForm.handleSubmit();
                }}
              >
            <Row className="g-3">
              <Col lg={12}>
                <label htmlFor="holidayName" className="form-label">
                  Holiday Name <span>*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  className="form-control"
                  id="holidayName"
                  placeholder="Enter holiday name"
                  value={FormikForm.values.name || ""}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/^\s+/, "")
                      .replace(/[^A-Za-z\s'-]/g, "");

                    FormikForm.setFieldValue("name", value);
                    FormikForm.setFieldTouched("name", true, false);
                    checkMaxLength("name", value);
                    setHolidayObj({
                      ...holidayObj,
                      name: value,
                    });

                  }}
                  // onBlur={() => FormikForm.setFieldTouched("name", true)}
                  onBlur={() => {
                    if (holidayObj.name && holidayObj.name.trim() !== "") {
                      FormikForm.setFieldTouched("name", true);
                    }
                  }}

                  invalid={!!(FormikForm.touched.name && FormikForm.errors.name)}
                />
                {/* {FormikForm.errors.name && (
                  <div className="lc_form_error_text">
                    {FormikForm.errors.name}
                  </div>
                )} */}

                {(FormikForm.touched.name || hasAttemptedSubmit) &&
                  FormikForm.errors.name &&
                  !lengthWarnings.name && (
                    <div className="lc_form_error_text">{FormikForm.errors.name}</div>
                  )}
                {lengthWarnings.name && (
                  <div className="lc_form_error_text">{lengthWarnings.name}</div>
                )}
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlfor="date">Date <span>*</span></Label>
                  {dateRawInvalidText !== null ? (
                    <Input
                      type="text"
                      className={`form-control${dateTypeError ? " border-danger" : ""}`}
                      placeholder="DD-MM-YYYY"
                      autoFocus
                      value={dateRawInvalidText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDateRawInvalidText(val);
                        dateRawTyped.current = val;
                        handleDateKeyUp({ target: { value: val } });
                      }}
                      onKeyDown={handleDateKeyDown}
                      onBlur={handleDateBlur}
                    />
                  ) : (
                  <DatePicker
                    ref={datePickerRef}
                    name="date"
                    id="date"
                    placeholder="DD-MM-YYYY"
                    className={`form-control ${
                      ((FormikForm.touched.date && FormikForm.errors.date) || dateTypeError)
                        ? "border-danger" : ""
                      }`}
                    format={DateFormat}
                    // value={FormikForm.values.date ? dayjs(FormikForm.values.date, "YYYY-MM-DD") : null}
                    value={date ? dayjs(date, DateFormat) : null}
                    allowClear={false}
                    disabledDate={disableHolidayDates}
                    onKeyDown={handleDateKeyDown}
                    onKeyUp={handleDateKeyUp}
                    onBlur={handleDateBlur}
                    onChange={handleDateChange}
                  />
                )}

                {dateTypeError && (
                  <div className="lc_form_error_text">{dateTypeError}</div>
                )}
                {!dateTypeError && FormikForm.errors.date && (
                  <div className="lc_form_error_text">{FormikForm.errors.date}</div>
                )}
                </div>
              </Col>
              <Col lg={12}>
                <div className={`mb-3`}>
                  <Label>Work Schedule <span>*</span></Label>
                  <Select
                    name="work_schedule_id_list"
                    isMulti
                    options={ws_options || []}
                    filterOption={filterWorkSchedule}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                            FormikForm.touched.work_schedule_id_list &&
                            FormikForm.errors.work_schedule_id_list
                            ? "red !important"
                            : provided.borderColor,
                      }),
                    }}
                    value={selectedWS || []}
                    onChange={handleWSChange}
                    invalid={
                      FormikForm.touched.work_schedule_id_list &&
                        FormikForm.errors.work_schedule_id_list
                        ? true
                        : false
                    }
                    closeMenuOnSelect={false}
                  />
                  {FormikForm.touched.work_schedule_id_list &&
                    FormikForm.errors.work_schedule_id_list ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.work_schedule_id_list}
                    </div>
                  ) : null}
                </div>
              </Col>
              <Col lg={12}>
                <div>
                  <Label for="is_rest" className="form-label">
                    Is Restricted
                  </Label>
                  <div
                    className="form-check form-switch form-switch-md form-switch-success"
                    dir="ltr"
                  >
                    <Input
                      id="is_rest"
                      type="checkbox"
                      className="form-check-input"
                      checked={holidayObj.is_restricted}
                      onChange={(e) =>
                        setHolidayObj({
                          ...holidayObj,
                          is_restricted: e.target.checked,
                        })
                      }
                    />
                  </div>
                </div>
              </Col>
              <Col lg={12}>
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  type="text"
                  name="description"
                  className="form-control"
                  id="description"
                  placeholder="Enter description"
                  value={FormikForm.values.description || ""}
                  onChange={(e) => {
                    const filteredValue = e.target.value
                      .replace(/^\s+/, "")
                      .replace(/[^A-Za-z0-9\s.,!?'"@\-_;:/&()\n]/g, "");

                    FormikForm.setFieldValue("description", filteredValue);
                    FormikForm.setFieldTouched("description", true, false);
                    checkMaxLength("description", filteredValue);
                    setHolidayObj({
                      ...holidayObj,
                      description: filteredValue,
                    });
                  }}
                  onBlur={() => FormikForm.setFieldTouched("description", true)}
                  rows={4}
                >
                </textarea>
                {/* {FormikForm.errors.description && (
                  <div className="lc_form_error_text">
                    {FormikForm.errors.description}
                  </div>
                )} */}

                {(FormikForm.touched.description || hasAttemptedSubmit) &&
                  FormikForm.errors.description &&
                  !lengthWarnings.description && (
                    <div className="lc_form_error_text">{FormikForm.errors.description}</div>
                  )}
                {lengthWarnings.description && (
                  <div className="lc_form_error_text">{lengthWarnings.description}</div>
                )}
              </Col>

              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" type="submit" className="btn-label">
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

export default HolidayForm;
