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
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import {
  custom_field_input_types,
  custom_field_module_lists,
} from "../../common/constant/Constants";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";

const CustomFieldForm = () => {
  const dispatch = useDispatch();
  const [customFieldObj, setCustomFieldObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  useEffect(() => {
    setCustomFieldObj(form_obj);
  }, [form_obj]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      if (value.length > 100) return;

      const regex = /^[A-Za-z0-9 .,&()'_-]*$/;

      if (!regex.test(value)) return;
    }

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
      (option) => option.id !== id,
    );
    setCustomFieldObj({
      ...customFieldObj,
      options: updatedOptions,
    });
  };

  const handleFieldTypeChange = (e) => {
    let options = [];
    if (e.value === "option") {
      options = [{ id: 1, label: "", value: "" }];
    }
    setCustomFieldObj({
      ...customFieldObj,
      type: e.value,
      options: options,
      max_size: 1,
    });
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: customFieldObj,
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required("Please Enter Display Name")
        .max(100, "Display Name cannot exceed 100 characters")
        .matches(
          /^[A-Za-z0-9 .,&()'_-]+$/,
          "Only letters, numbers, spaces, ., ,, -, &, (, ), ', and _ are allowed",
        ),
      type: Yup.string().required("Select Field Type"),
      applicable_for_modules: Yup.array()
        .required("Select Applicable For")
        .min(1, "Select Applicable For"),
    }),
    onSubmit: async (values) => {
      let invalid_form_value = false;

      values.options.map((d) => {
        if (d.label.trim().length === 0 || d.value.trim().length === 0) {
          invalid_form_value = true;
        }
      });

      if (invalid_form_value === true) {
        toast.error("Please Enter Label Value For Option");
      } else {
        dispatch(setLoaderVisible(true));
        const Api = await PostApi(
          "fields/custom-field/create/",
          customFieldObj,
          false,
        );
        if (Api.status && Api.status === 200) {
          // customFieldObj.id === 0
          //   ? dispatch(addCustomField(Api?.data.data))
          //   : dispatch(editCustomField(Api?.data?.data));

          if (customFieldObj.id === 0) {
            dispatch(addCustomField(Api?.data.data));
            SetLocalStorage("custom_fields", Api?.data.data, 2);
          } else {
            dispatch(editCustomField(Api?.data?.data));
            SetLocalStorage("custom_fields", Api?.data.data, 3);
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
                    options={custom_field_input_types || []}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
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
                        custom_field_input_types.find(
                          (e) => e.value === customFieldObj.type,
                        )) ||
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
                          />
                        </div>
                        <div className="flex-grow-1">
                          <input
                            type="text"
                            name="options"
                            className="form-control"
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
                          />
                        </div>
                        {customFieldObj.options.length > 1 &&
                          index === customFieldObj.options.length - 1 && (
                            <button
                              type="button"
                              className="btn btn-danger ms-2"
                              onClick={() => removeRepeaterValue(data.id)}
                            >
                              <i class="bx bx-bx bx-trash"></i>
                            </button>
                          )}
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
                  <Col sm={6}>
                    <div>
                      <h5 className="fs-13 fw-medium text-muted">
                        Maximum Size
                      </h5>
                      <div className="input-step">
                        <button
                          type="button"
                          className="minus"
                          onClick={() => {
                            setCustomFieldObj((prev) => {
                              return {
                                ...prev,
                                max_size:
                                  prev.max_size === 1 ? 1 : prev.max_size - 1,
                              };
                            });
                          }}
                        >
                          –
                        </button>
                        <Input
                          type="text"
                          style={{ width: "7em" }}
                          className="product-quantity"
                          value={customFieldObj.max_size + " MB"}
                          readOnly
                        />
                        <button
                          type="button"
                          className="plus"
                          onClick={() => {
                            setCustomFieldObj((prev) => {
                              return {
                                ...prev,
                                max_size: prev.max_size + 1,
                              };
                            });
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </Col>
                </Col>
              )}
              <Col lg={12}>
                <div className="">
                  <Label>Applicable For</Label>
                  <Select
                    name="applicable_for_modules"
                    isMulti={true}
                    options={custom_field_module_lists || []}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
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
                      custom_field_module_lists.filter((e) =>
                        customFieldObj.applicable_for_modules.includes(e.value),
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
                    closeMenuOnSelect={false}
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
