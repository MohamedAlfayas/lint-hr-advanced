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
dayjs.extend(customParseFormat);

const HolidayForm = () => {
  const dispatch = useDispatch();
  const [date, setDate] = useState("");
  const [holidayObj, setHolidayObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const ws_options = GetLocalStorageData("work_schedule") || [];
  const [selectedWS, setSelectedWS] = useState([]);

  useEffect(() => {
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
      name: Yup.string().trim().required("Please Enter Holiday Name"),
      work_schedule_id_list: Yup.array()
        .required("Select Work Schedule")
        .min(1, "Select Work Schedule"),
    }),
    onSubmit: async (values) => {
      console.log("SUCCESSSS !!!! Formik Values = ", values);
      dispatch(setLoaderVisible(true));

      const Api = await PostApi("holiday/create/", values, false);
      console.log("API RES = ", Api);
      if (Api.status && Api.status === 200) {
        holidayObj.id === 0
          ? dispatch(addHoliday(Api?.data.data))
          : dispatch(editHoliday(Api?.data?.data));
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

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form onSubmit={FormikForm.handleSubmit}>
            <Row className="g-3">
              <Col lg={12}>
                <label htmlFor="holidayName" className="form-label">
                  Holiday Name
                </label>
                <Input
                  type="text"
                  name="name"
                  className="form-control"
                  id="holidayName"
                  placeholder="Enter holiday name"
                  value={holidayObj.name || ""}
                  onChange={handleInputChange}
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
                  <Label htmlfor="date">Date</Label>
                  <DatePicker
                    name="date"
                    id="date"
                    className="form-control"
                    format={DateFormat}
                    value={dayjs(date, DateFormat)}
                    allowClear={false}
                    // value={date || ""}
                    onChange={handleDateChange}
                  />
                </div>
              </Col>
              <Col lg={12}>
                <div className={`mb-3`}>
                  <Label>Work Schedule</Label>
                  <Select
                    name="work_schedule_id_list"
                    isMulti={true}
                    options={ws_options || []}
                    className="basic-multi-select"
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
