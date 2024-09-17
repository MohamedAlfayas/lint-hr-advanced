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
  FormFeedback,
  Form,
  Input,
  Label,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { setDepartmentDetails } from "../../redux/reducers/ChildReducer/DepartmentReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import { useFormik } from "formik";
import * as Yup from "yup";

import Select from "react-select";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";

const DepartmentForm = () => {
  const [hdDropDown, setHdDropDown] = useState(false);
  const toggleHd = () => setHdDropDown((prevState) => !prevState);
  const [departmentData, setDepartmentData] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const DepartmentList = GetLocalStorageData("department") || [];

  const [selectedOption, setSelectedOption] = useState();

  const dispatch = useDispatch();

  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    setDepartmentData(form_obj);
    setDepartmentOptions(
      DepartmentList.filter(
        (obj) =>
          !form_obj?.child_id_list.includes(obj.id) && form_obj?.id !== obj.id
      )
    );
  }, [form_obj]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDepartmentData({
      ...departmentData,
      [name]: value,
    });
  };
  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: departmentData,
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Please Enter Department Name"),
      pid: Yup.number()
        .required("Select Parent Department")
        .min(1, "Please Select Parent Department"),
    }),
    onSubmit: async (values) => {
      dispatch(setLoaderVisible(true));
      const Api = await PostApi("department/create/", departmentData, false);
      if (Api.status && Api.status === 200) {
        dispatch(setDepartmentDetails(Api?.data?.data));
        SetLocalStorage("department_details", Api?.data?.data, 1);
        SetLocalStorage("department", Api?.data?.department_data, 1);
        dispatch(toggleRSBView(false));
        toast.success(Api?.data?.message);
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail);
      }
      dispatch(setLoaderVisible(false));
    },
  });

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form onSubmit={FormikForm.handleSubmit}>
            <Row className="g-3">
              <Col lg={12}>
                <label htmlFor="departmentName" className="form-label">
                  Department Name
                </label>
                <Input
                  type="text"
                  name="name"
                  className="form-control"
                  id="departmentName"
                  placeholder="Enter department name"
                  value={departmentData.name || ""}
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
                <div id="passwordHelpBlock" className="form-text">
                  Select Department.
                </div>
              </Col>
              <Col lg={12}>
                <Label htmlFor="parentDepartment" className="form-label">
                  Parent Department
                </Label>

                <Select
                  name="pid"
                  className={`react-select-container ${
                    FormikForm.touched.pid && FormikForm.errors.pid
                      ? "is-invalid"
                      : ""
                  }`}
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor:
                        !state.isFocused &&
                        FormikForm.touched.pid &&
                        FormikForm.errors.pid
                          ? "red !important"
                          : provided.borderColor,
                    }),
                  }}
                  value={
                    departmentOptions.find(
                      (opt) => opt.id === departmentData.pid
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    setDepartmentData({
                      ...departmentData,
                      pid: selectedOption ? selectedOption.value : null,
                    });
                  }}
                  options={departmentOptions.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  isClearable
                />

                {FormikForm.touched.pid && FormikForm.errors.pid ? (
                  <FormFeedback type="invalid">
                    {FormikForm.errors.pid}
                  </FormFeedback>
                ) : null}

                <div id="passwordHelpBlock" className="form-text">
                  Select Parent Department.
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="is_location_required" className="form-label">
                    Is Location Required
                  </Label>

                  <div className="mb-2">
                    <div
                      className="form-check form-switch form-switch-md form-switch-success"
                      dir="ltr"
                    >
                      {" "}
                      <Input
                        id="is_location_required"
                        name="is_location_required"
                        type="checkbox"
                        className="form-check-input"
                        checked={departmentData.is_location_required}
                        onChange={(e) =>
                          setDepartmentData({
                            ...departmentData,
                            is_location_required: e.target.checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Check if is required location based employee location.
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="allow_only_mobile_checkin" className="form-label">
                    Allow Only Mobile Checkin
                  </Label>

                  <div className="mb-2">
                    <div
                      className="form-check form-switch form-switch-md form-switch-success"
                      dir="ltr"
                    >
                      {" "}
                      <Input
                        id="allow_only_mobile_checkin"
                        name="allow_only_mobile_checkin"
                        type="checkbox"
                        className="form-check-input"
                        checked={departmentData.allow_only_mobile_checkin}
                        onChange={(e) =>
                          setDepartmentData({
                            ...departmentData,
                            allow_only_mobile_checkin: e.target.checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Check if allow only mobile checkin/checkout.
                </div>
              </Col>
              <Col lg={12}>
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <Input
                  type="textarea"
                  name="description"
                  className="form-control"
                  id="description"
                  placeholder="Enter description"
                  value={departmentData.description || ""}
                  onChange={handleInputChange}
                />
                <div id="passwordHelpBlock" className="form-text">
                  Enter Description.
                </div>
              </Col>

              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label">
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

export default DepartmentForm;
