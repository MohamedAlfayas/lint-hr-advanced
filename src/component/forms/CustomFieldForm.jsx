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
  addCustomField,
  editCustomField,
} from "../../redux/reducers/ChildReducer/CustomFieldReducer";
import { toast } from "react-toastify";
import { setActiveTableTab } from "../../redux/reducers/ChildReducer/TableReducer";
import { useFormik } from "formik";
import * as Yup from "yup";

const CustomFieldForm = () => {
  const dispatch = useDispatch();
  const [customFieldObj, setCustomFieldObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  let types = [
    { id: "text", label: "Text", value: "text" },
    { id: "number", label: "Number", value: "number" },
    { id: "date", label: "Date", value: "date" },
    { id: "option", label: "Option", value: "option" },
    { id: "file", label: "File", value: "file" },
  ];
  let module_lists = [
    { id: "employee", label: "Employee", value: "employee" },
    { id: "organization", label: "Organization", value: "organization" },
  ];
  let options = [
    { id: "24", label: "Twenty Four", value: "24" },
    { id: "fayas", label: "FAYAS", value: "fayas" },
  ];
  const labels = options.map((option) => option.label);
  console.log("labels:", labels);

  useEffect(() => {
    setCustomFieldObj(form_obj);
  }, [form_obj]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomFieldObj({
      ...customFieldObj,
      [name]: value,
    });
  };
  const addRepeaterValue = () => {
    const newId = customFieldObj.options.length
      ? customFieldObj.options[customFieldObj.options.length - 1].id + 1
      : 1;
    let newOptions = { id: newId, value: "", label: "" };
    setCustomFieldObj({
      ...customFieldObj,
      options: [...customFieldObj.options, newOptions],
    });
  };

  const removeRepeaterValue = (id) => {
    const updatedOptions = customFieldObj.options.filter(
      (option) => option.id !== id
    );
    setCustomFieldObj({
      ...customFieldObj,
      options: updatedOptions,
    });
  };
  console.log(" data = ", customFieldObj);

  const handleFieldTypeChange = (e) => {
    if (e.value === "option") {
      setCustomFieldObj({
        ...customFieldObj,
        type: e.value,
        options: [{ id: 1, label: "", value: "" }],
      });
    } else {
      setCustomFieldObj({ ...customFieldObj, type: e.value });
    }
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: customFieldObj,
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Please Enter Display Name"),
      type: Yup.string().required("Select Field Type"),
      applicable_for_modules: Yup.array()
        .required("Select Applicable For")
        .min(1, "Select Applicable For"),
      option: Yup.array().required("Required").min(1, "Select Work Schedule"),
    }),
    onSubmit: (values) => {
      console.log("SUCCESSSS !!!! Formik Values = ", values);
    },
  });

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   console.log("employee data = ", customFieldObj);
  //   dispatch(setLoaderVisible(true));
  //   const Api = await PostApi(
  //     "fields/custom-field/create/",
  //     customFieldObj,
  //     false
  //   );
  //   console.log("API RES = ", Api);
  //   if (Api.status && Api.status === 200) {
  //     customFieldObj.id === 0
  //       ? dispatch(addCustomField(Api?.data.data))
  //       : dispatch(editCustomField(Api?.data?.data));
  //     dispatch(toggleRSBView(false));
  //     toast.success(Api?.data?.message);
  //   } else {
  //     toast.error(Api?.data?.message || Api?.data?.detail);
  //   }
  //   dispatch(setLoaderVisible(false));
  // };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form onSubmit={FormikForm.handleSubmit} action="javascript:void(0)">
            <Row className="g-3">
              <Col lg={12}>
                <label htmlFor="displayName" className="form-label">
                  Display Name
                </label>
                <Input
                  type="text"
                  name="name"
                  className="form-control"
                  id="name"
                  placeholder="Display Name"
                  value={customFieldObj.name || ""}
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
                <div className="">
                  <Label>Field Type</Label>
                  <Select
                    name="type"
                    id="type"
                    isMulti={false}
                    options={types || []}
                    className="basic-multi-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          FormikForm.touched.type &&
                          FormikForm.errors.type
                            ? "red !important"
                            : provided.borderColor,
                      }),
                    }}
                    value={
                      (customFieldObj.type &&
                        types.find((e) => e.value === customFieldObj.type)) ||
                      []
                    }
                    onChange={(e) => {
                      handleFieldTypeChange(e);
                    }}
                    invalid={
                      FormikForm.touched.type && FormikForm.errors.type
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.type && FormikForm.errors.type ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.type}
                    </div>
                  ) : null}
                </div>
              </Col>

              {customFieldObj.type === "option" && (
                <Col lg={12}>
                  <div className="">
                    <label htmlFor="displayName" className="form-label">
                      Options
                    </label>
                    {customFieldObj.options.map((data, index) => (
                      <div key={index} className="d-flex mb-2">
                        <div className="flex-grow-1">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Label"
                            name="options"
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                borderColor:
                                  !state.isFocused &&
                                  FormikForm.touched.options &&
                                  FormikForm.errors.options
                                    ? "red !important"
                                    : provided.borderColor,
                              }),
                            }}
                            value={data.label}
                            onChange={(e) => {
                              const updatedOptions = [
                                ...customFieldObj.options,
                              ];
                              updatedOptions[index] = {
                                ...updatedOptions[index],
                                label: e.target.value,
                              };
                              setCustomFieldObj({
                                ...customFieldObj,
                                options: updatedOptions,
                              });
                            }}
                            invalid={
                              FormikForm.touched.options &&
                              FormikForm.errors.options
                                ? true
                                : false
                            }
                          />
                          {FormikForm.touched.options &&
                          FormikForm.errors.options ? (
                            <FormFeedback type="invalid">
                              {FormikForm.errors.options}
                            </FormFeedback>
                          ) : null}
                        </div>
                        <div className="flex-grow-1">
                          <input
                            type="text"
                            name="options"
                            className="form-control"
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                borderColor:
                                  !state.isFocused &&
                                  FormikForm.touched.options &&
                                  FormikForm.errors.options
                                    ? "red !important"
                                    : provided.borderColor,
                              }),
                            }}
                            placeholder="Value"
                            value={data.value}
                            onChange={(e) => {
                              const updatedOptions = [
                                ...customFieldObj.options,
                              ];
                              updatedOptions[index] = {
                                ...updatedOptions[index],
                                value: e.target.value,
                              };

                              setCustomFieldObj({
                                ...customFieldObj,
                                options: updatedOptions,
                              });
                            }}
                            invalid={
                              FormikForm.touched.options &&
                              FormikForm.errors.options
                                ? true
                                : false
                            }
                          />
                          {FormikForm.touched.options &&
                          FormikForm.errors.options ? (
                            <FormFeedback type="invalid">
                              {FormikForm.errors.options}
                            </FormFeedback>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger ms-2"
                          onClick={() => removeRepeaterValue(data.id)}
                        >
                          <i class="bx bx-bx bx-trash"></i>
                        </button>
                      </div>
                    ))}
                    <div className="d-flex mb-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={addRepeaterValue}
                      >
                        <i class="bx bx-plus-circle"></i>
                      </button>
                    </div>
                  </div>
                </Col>
              )}

              {customFieldObj.type === "file" && (
                <Col lg={12}>
                  <div>
                    <Label htmlFor="formFile" className="form-label"></Label>

                    <Input className="form-control" type="number" />
                  </div>
                  <div id="passwordHelpBlock" className="form-text">
                    Maximum Size.
                  </div>
                </Col>
              )}
              <Col lg={12}>
                <div className="">
                  <Label>Applicable For</Label>
                  <Select
                    name="applicable_for_modules"
                    isMulti={true}
                    options={module_lists || []}
                    className="basic-multi-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          FormikForm.touched.applicable_for_modules &&
                          FormikForm.errors.applicable_for_modules
                            ? "red !important"
                            : provided.borderColor,
                      }),
                    }}
                    value={
                      customFieldObj.applicable_for_modules &&
                      module_lists.filter((e) =>
                        customFieldObj.applicable_for_modules.includes(e.value)
                      )
                    }
                    onChange={(e) =>
                      setCustomFieldObj({
                        ...customFieldObj,
                        applicable_for_modules: e.map((obj) => obj.value),
                      })
                    }
                    invalid={
                      FormikForm.touched.applicable_for_modules &&
                      FormikForm.errors.applicable_for_modules
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.applicable_for_modules &&
                  FormikForm.errors.applicable_for_modules ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.applicable_for_modules}
                    </div>
                  ) : null}
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <Label for="is_required" className="form-label">
                    Is Required
                  </Label>
                  <div
                    className="form-check form-switch form-switch-md form-switch-success"
                    dir="ltr"
                  >
                    <Input
                      id="is_required"
                      name="is_required"
                      type="checkbox"
                      className="form-check-input"
                      checked={customFieldObj.is_required}
                      onChange={(e) =>
                        setCustomFieldObj({
                          ...customFieldObj,
                          is_required: e.target.checked,
                        })
                      }
                    />
                  </div>
                </div>
              </Col>

              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label" type="submit">
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

export default CustomFieldForm;
