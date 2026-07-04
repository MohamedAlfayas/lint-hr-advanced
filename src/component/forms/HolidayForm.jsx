import axios from "axios";
import { FilePond } from "filepond";
import React, { useEffect, useMemo, useState } from "react";
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
  const [dateError, setDateError] = useState("");
  const minDate = dayjs("01-01-1900", "DD-MM-YYYY");
  const maxDate = dayjs().add(1, "year");
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  console.log("form_obj Holiday FORM", form_obj);
  const ws_options = GetLocalStorageData("work_schedule") || [];
  const [selectedWS, setSelectedWS] = useState([]);

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
  }, [form_obj]);

  const FormikForm = useFormik({
    enableReinitialize: true,
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
    setHolidayObj({
      ...holidayObj,
      work_schedule_id_list: obj.map((d) => d.id),
    });
  };

  const handleDateChange = (selectedDates, dateStr) => {
    setDate(dateStr);
    setHolidayObj({
      ...holidayObj,
      date: ConvertISODateFormat(ConvertDateFormat(dateStr)),
    });
  };

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
          <Form onSubmit={FormikForm.handleSubmit}>
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
                  value={holidayObj.name || ""}
                  // onChange={handleInputChange}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/[^A-Za-z\s'-]/g, "")
                      .slice(0, 150);

                    setHolidayObj({
                      ...holidayObj,
                      name: value,
                    });
                  }}
                  invalid={
                    FormikForm.touched.name && FormikForm.errors.name
                      ? true
                      : false
                  }
                />
                {FormikForm.touched.name && FormikForm.errors.name ? (
                  <FormFeedback type="invalid">
                    {FormikForm.errors.name}
                  </FormFeedback>
                ) : null}
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <Label htmlfor="date">Date <span>*</span></Label>
                  <DatePicker
                    name="date"
                    id="date"
                    className={`form-control ${dateError ? "border-danger" : ""}`}
                    format="DD-MM-YYYY"
                    value={date ? dayjs(date, "DD-MM-YYYY") : null}
                    allowClear={false}
                    disabledDate={disableHolidayDates}
                    inputReadOnly={true}
                    onChange={(selectedDate, dateString) => {
                      if (!selectedDate) {
                        setDateError("Enter the valid date");
                        return;
                      }

                      setDateError("");

                      setDate(dateString);

                      setHolidayObj({
                        ...holidayObj,
                        date: ConvertISODateFormat(ConvertDateFormat(dateString)),
                      });
                    }}
                    onBlur={(e) => {
                      const value = e.target.value?.trim();

                      const parsedDate = dayjs(value, "DD-MM-YYYY", true);

                      if (
                        !parsedDate.isValid() ||
                        parsedDate.isBefore(dayjs("01-01-1900", "DD-MM-YYYY"), "day") ||
                        parsedDate.isAfter(dayjs().add(1, "year"), "day")
                      ) {
                        setDateError("Enter the valid date");
                      } else {
                        setDateError("");
                      }
                    }}
                  />
                  {dateError && (
                      <div className="lc_form_error_text">
                        {dateError}
                      </div>
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
                  value={holidayObj.description || ""}
                  onChange={handleInputChange}
                ></textarea>
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
