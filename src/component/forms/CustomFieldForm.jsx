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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("employee data = ", customFieldObj);
    // Api({
    //     method: 'POST',
    //     url: 'fields/custom-field/create/',
    //     data: customFieldObj
    // })
    //     .then(res => {
    //         console.log("REs = ", res);
    //         customFieldObj.id === 0 ? dispatch(addCustomField(res?.data.data)) : dispatch(editCustomField(res?.data?.data));
    //         dispatch(toggleRSBView(false));
    //         dispatch(setActiveTableTab("all"))
    //         toast.success(res?.data?.message);
    //     })
    //     .catch(err => {
    //         console.log("ERr == ", err);
    //         toast.success(err?.response?.data?.message);
    //     })
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form onSubmit={handleSubmit} action="javascript:void(0)">
            <Row className="g-3">
              <Col lg={12}>
                <label htmlFor="displayName" className="form-label">
                  Display Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  id="name"
                  placeholder="Display Name"
                  value={customFieldObj.name || ""}
                  onChange={handleInputChange}
                  required
                />
              </Col>

              <Col lg={12}>
                <div className="">
                  <Label>Field Type</Label>
                  <Select
                    required
                    name="type"
                    id="type"
                    isMulti={false}
                    options={types || []}
                    className="basic-multi-select"
                    value={
                      (customFieldObj.type &&
                        types.find((e) => e.value === customFieldObj.type)) ||
                      []
                    }
                    onChange={(e) => {
                      handleFieldTypeChange(e);
                    }}
                  />
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
                    required
                    name="applicable_for_modules"
                    isMulti={true}
                    options={module_lists || []}
                    className="basic-multi-select"
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
                  />
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
