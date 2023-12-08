import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import { SweetAlert } from "../../common/sweetAlert/SweetAlert";
import Swal from "sweetalert2";
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
  Table,
  Modal,
  ModalBody,
} from "reactstrap";
import ModalTitle from "rsuite/esm/Modal/ModalTitle";
import {
  editEarnings,
  setEarnings,
} from "../../../redux/reducers/ChildReducer/SalaryComponentsReducer";

const salaryPloiciesForm = () => {
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const { earnings_data } = useSelector(
    (state) => state.SalaryComponentsReducer
  );

  const [EarningsData, setEarningsData] = useState([]);

  useEffect(() => {
    console.log("USEEFFECT RUNNING");
    console.log("kkk", earnings_data);
  }, [earnings_data]);

  useEffect(() => {
    console.log("EARRRRRNINGGGS DATA = ", EarningsData);
  }, [EarningsData]);

  const { allowances_data } = useSelector(
    (state) => state.SalaryComponentsReducer
  );
  // console.log("kkk",allowances_data);
  const { deductions_data } = useSelector(
    (state) => state.SalaryComponentsReducer
  );
  // console.log("kkk",deductions_data);selectedItems
  const [customFieldObj, setCustomFieldObj] = useState(form_obj);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedAllowanceItems, setSelectedAlowanceItems] = useState([]);
  const [selectedDeductionItems, setSelectedDeductionItems] = useState([]);
  const [calculationType, setCalculationType] = useState("option1");
  const [selectField, setSelectField] = useState("option1");

  const handleCalculationTypeChange = (event) => {
    // const selectedValue = event.target.value;
    setCalculationType(event);

    setSelectField("option1");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomFieldObj({
      ...customFieldObj,
      [name]: value,
    });
  };

  const dispatch = useDispatch();

  const handleEarningsCB = (id, checked) => {
    console.log("Checked = ", checked);

    let updatedEarningsData = [];

    if (id === 0) {
      updatedEarningsData = [...EarningsData].map((d) => {
        return { ...d, selected: checked };
      });
    } else {
      updatedEarningsData = [...EarningsData].map((d) => {
        if (d.id === id) {
          return { ...d, selected: checked };
        } else {
          return d;
        }
      });
    }

    setEarningsData(updatedEarningsData);

    // hanldeEarningComponent(updatedEarningsData);
  };

  //   Modal

  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const CloseEarningsModal = () => setShowEarningsModal(false);

  //   const hanldeEarningComponent = () => {
  //     setShowEarningsModal(true);
  //   };

  const hanldeAllowancesComponent = () => {
    const tableRows = allowances_data
      .map(
        (item) => `
            <tr>
            <td><input type="checkbox" class="earning-checkbox" data-id="${
              item.id
            }" ${
          selectedAllowanceItems.some(
            (selectedAllowanceItems) =>
              selectedAllowanceItems?.item.id === item.id
          )
            ? "checked"
            : ""
        }></td>
            <td>${item.name}</td>
                <td>${item.pro_rata ? "Yes" : "No"}</td>
                <td>${item.tax ? "Yes" : "No"}</td>
                <td>${item.insurance ? "Yes" : "No"}</td>
            </tr>
        `
      )
      .join("");

    Swal.fire({
      title: "Select Earning Components",
      html: `
                <table class="table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="selectAll"></th>
                            <th>Name</th>
                            <th>Pro-rata</th>
                            <th>Taxable</th>
                            <th>Contribute to insurance&Fund</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            `,
      customClass: {
        container: "custom-modal-container",
      },
      width: "60%",
      showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedCheckboxes = document.querySelectorAll(
          ".earning-checkbox:checked"
        );
        const selectedAllowanceItems = Array.from(selectedCheckboxes).map(
          (checkbox) => ({
            item: allowances_data.find((val) => val.id == checkbox.dataset.id),
          })
        );
        // Update state with selected item names and IDs
        setSelectedAlowanceItems(selectedAllowanceItems);
      }
    });

    // Add event listener for the "Select All" checkbox
    document
      .getElementById("selectAll")
      .addEventListener("change", function () {
        const checkboxes = document.querySelectorAll(".earning-checkbox");
        checkboxes.forEach((checkbox) => {
          checkbox.checked = document.getElementById("selectAll").checked;
        });
      });
  };

  const hanldeDeductionsComponent = () => {
    const tableRows = deductions_data
      .map(
        (item) => `
            <tr>
            <td><input type="checkbox" class="earning-checkbox" data-id="${
              item.id
            }" ${
          selectedDeductionItems.some(
            (selectedDeductionItems) =>
              selectedDeductionItems?.item.id === item.id
          )
            ? "checked"
            : ""
        }></td>
                <td>${item.name}</td>
                <td>${item.pro_rata ? "Yes" : "No"}</td>
                <td>${item.tax ? "Yes" : "No"}</td>
                <td>${item.insurance ? "Yes" : "No"}</td>
            </tr>
        `
      )
      .join("");

    Swal.fire({
      title: "Select Earning Components",
      html: `
                <table class="table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="selectAll"></th>
                            <th>Name</th>
                            <th>Pro-rata</th>
                            <th>Taxable</th>
                            <th>Contribute to insurance&Fund</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            `,
      customClass: {
        container: "custom-modal-container",
      },
      width: "60%",
      showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedCheckboxes = document.querySelectorAll(
          ".earning-checkbox:checked"
        );
        const selectedDeductionItems = Array.from(selectedCheckboxes).map(
          (checkbox) => ({
            item: deductions_data.find((val) => val.id == checkbox.dataset.id),
          })
        );
        // Update state with selected item names and IDs
        setSelectedDeductionItems(selectedDeductionItems);
      }
    });

    // Add event listener for the "Select All" checkbox
    document
      .getElementById("selectAll")
      .addEventListener("change", function () {
        const checkboxes = document.querySelectorAll(".earning-checkbox");
        checkboxes.forEach((checkbox) => {
          checkbox.checked = document.getElementById("selectAll").checked;
        });
      });
  };

  useEffect(() => {
    setCustomFieldObj(form_obj);
  }, [form_obj]);
  const handleRemove = (indexToRemove, category) => {
    // Create a new array excluding the item at the specified index
    const updatedItems = category.filter(
      (item, index) => index !== indexToRemove
    );

    // Update state with the new array based on the category
    switch (category) {
      case selectedItems:
        setSelectedItems(updatedItems);
        break;
      case selectedAllowanceItems:
        setSelectedAlowanceItems(updatedItems);
        break;
      case selectedDeductionItems:
        setSelectedDeductionItems(updatedItems);
        break;

      default:
        break;
    }
  };

  const handleEarningCalculationType = (id, val) => {};

  return (
    <React.Fragment>
      <Row>
        <Col md={12} lg={12} xxl={12} className="folder-card" key={1}>
          <Form action="javascript:void(0)">
            <Col md={12} lg={12} xxl={12}>
              <div className="mb-3">
                <Label htmlFor="tax_state" className="form-label">
                  Name
                </Label>
                <div className="form-icon right">
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    className="form-control"
                    placeholder="Name"
                    value={customFieldObj.name || ""}
                    onChange={handleInputChange}
                  />
                  <div id="passwordHelpBlock" className="form-text mb-3">
                    Enter Name
                  </div>
                  <Col md={12} lg={12} xxl={12}>
                    <div className="mb-3">
                      <Label className="form-label" htmlFor="ws_desc">
                        Description
                      </Label>
                      <Input
                        type="textarea"
                        className="form-control"
                        id="earn_desc"
                        value={customFieldObj.desc || ""}
                        onChange={(e) =>
                          setCustomFieldObj({
                            ...customFieldObj,
                            desc: e.target.value,
                          })
                        }
                      />
                    </div>
                  </Col>
                  <div className="mb-3">
                    <Label htmlFor="tax_state" className="form-label">
                      Earnings
                    </Label>

                    {earnings_data.length > 0 && (
                      <div className="mb-3">
                        {earnings_data
                          .filter((d) => d.selected === true)
                          .map((item, index) => (
                            <div key={index} className="row mb-3">
                              <div className="col-md-2">
                                <label
                                  htmlFor={`selectedComponent${index}`}
                                  className="form-label"
                                >
                                  Components
                                </label>
                                <div className="form-icon right">
                                  <span>{item.name}</span>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <label
                                  htmlFor={`calculationType${index}`}
                                  className="form-label"
                                >
                                  Calculation Type
                                </label>
                                <select
                                  id={`calculationType${index}`}
                                  name={`calculationType${index}`}
                                  className="form-select"
                                  value={item?.calculation_type}
                                  onChange={(e) =>
                                    handleEarningCalculationType(
                                      item.id,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="option1">Flat Amount</option>
                                  <option value="option2">Percentage</option>
                                </select>
                              </div>
                              <div className="col-md-2">
                                <label
                                  htmlFor={`additionalInput${index}`}
                                  className="form-label"
                                ></label>
                                <input
                                  type="text"
                                  id={`additionalInput${index}`}
                                  name={`additionalInput${index}`}
                                  className="form-control"
                                />
                              </div>
                              <div className="col-md-3">
                                <label
                                  htmlFor={`selectField${index}`}
                                  className="form-label"
                                ></label>
                                <select
                                  id={`selectField${index}`}
                                  name={`selectField${index}`}
                                  className="form-select"
                                  value={selectField}
                                  onChange={(e) =>
                                    setSelectField(e.target.value)
                                  }
                                >
                                  {calculationType === "option2" ? (
                                    <option value="option1">Per Year</option>
                                  ) : null}
                                  {calculationType === "option1" ? (
                                    <React.Fragment>
                                      <option value="option2">Monthly</option>
                                      <option value="option3">Weekly</option>
                                    </React.Fragment>
                                  ) : null}
                                </select>
                              </div>
                              <div className="col-md-2">
                                <button
                                  type="button"
                                  className="btn  remove-item-btn"
                                  onClick={() =>
                                    handleRemove(index, selectedItems)
                                  }
                                >
                                  <i className="ri-close-line fs-16"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    <div className="form-icon right">
                      <Button
                        color="primary"
                        onClick={() => {
                          setEarningsData(earnings_data);
                          setShowEarningsModal(true);
                        }}
                      >
                        <i className="ri-add-line align-bottom me-1"></i>
                        Select Components
                      </Button>{" "}
                    </div>
                  </div>
                  <hr></hr>
                  <div className="mb-3">
                    <Label htmlFor="tax_state" className="form-label">
                      Allowances
                    </Label>
                    {selectedAllowanceItems.length > 0 && (
                      <div className="mb-3">
                        {selectedAllowanceItems.map((item, index) => (
                          <div key={index} className="row mb-3">
                            <div className="col-md-2">
                              <label
                                htmlFor={`selectedComponent${index}`}
                                className="form-label"
                              >
                                Components
                              </label>
                              <div className="form-icon right">
                                <span>{item?.item.name}</span>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <label
                                htmlFor={`calculationType${index}`}
                                className="form-label"
                              >
                                Calculation Type
                              </label>
                              <select
                                id={`calculationType${index}`}
                                name={`calculationType${index}`}
                                className="form-select"
                                value={calculationType}
                                onChange={handleCalculationTypeChange}
                              >
                                <option value="option1">Flat Amount</option>
                                <option value="option2">Percentage</option>
                              </select>
                            </div>
                            <div className="col-md-2">
                              <label
                                htmlFor={`additionalInput${index}`}
                                className="form-label"
                              >
                                Additional Input
                              </label>
                              <input
                                type="text"
                                id={`additionalInput${index}`}
                                name={`additionalInput${index}`}
                                className="form-control"
                              />
                            </div>
                            <div className="col-md-3">
                              <label
                                htmlFor={`selectField${index}`}
                                className="form-label"
                              >
                                Select Field
                              </label>
                              <select
                                id={`selectField${index}`}
                                name={`selectField${index}`}
                                className="form-select"
                                value={selectField}
                                onChange={(e) => setSelectField(e.target.value)}
                              >
                                {calculationType === "option2" ? (
                                  <option value="option1">Per Year</option>
                                ) : null}
                                {calculationType === "option1" ? (
                                  <React.Fragment>
                                    <option value="option2">Monthly</option>
                                    <option value="option3">Weekly</option>
                                  </React.Fragment>
                                ) : null}
                              </select>
                            </div>
                            <div className="col-md-2">
                              <button
                                type="button"
                                className="btn remove-item-btn"
                                onClick={() =>
                                  handleRemove(index, selectedAllowanceItems)
                                }
                              >
                                <i className="ri-close-line fs-16"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="form-icon right">
                      <Button
                        color="primary"
                        onClick={() => hanldeAllowancesComponent()}
                      >
                        <i className="ri-add-line align-bottom me-1"></i>
                        Select Components
                      </Button>{" "}
                    </div>
                  </div>
                  <hr></hr>
                  <div className="mb-3">
                    <Label htmlFor="tax_state" className="form-label">
                      Deductions
                    </Label>
                    {selectedDeductionItems.length > 0 && (
                      <div className="mb-3">
                        {selectedDeductionItems.map((item, index) => (
                          <div key={index} className="row mb-3">
                            <div className="col-md-2">
                              <label
                                htmlFor={`selectedComponent${index}`}
                                className="form-label"
                              >
                                Components
                              </label>
                              <div className="form-icon right">
                                <span>{item?.item.name}</span>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <label
                                htmlFor={`calculationType${index}`}
                                className="form-label"
                              >
                                Calculation Type
                              </label>
                              <select
                                id={`calculationType${index}`}
                                name={`calculationType${index}`}
                                className="form-select"
                                value={calculationType}
                                onChange={handleCalculationTypeChange}
                              >
                                <option value="option1">Flat Amount</option>
                                <option value="option2">Percentage</option>
                              </select>
                            </div>
                            <div className="col-md-2">
                              <label
                                htmlFor={`additionalInput${index}`}
                                className="form-label"
                              >
                                Additional Input
                              </label>
                              <input
                                type="text"
                                id={`additionalInput${index}`}
                                name={`additionalInput${index}`}
                                className="form-control"
                              />
                            </div>
                            <div className="col-md-3">
                              <label
                                htmlFor={`selectField${index}`}
                                className="form-label"
                              >
                                Select Field
                              </label>
                              <select
                                id={`selectField${index}`}
                                name={`selectField${index}`}
                                className="form-select"
                                value={selectField}
                                onChange={(e) => setSelectField(e.target.value)}
                              >
                                {calculationType === "option2" ? (
                                  <option value="option1">Per Year</option>
                                ) : null}
                                {calculationType === "option1" ? (
                                  <React.Fragment>
                                    <option value="option2">Monthly</option>
                                    <option value="option3">Weekly</option>
                                  </React.Fragment>
                                ) : null}
                              </select>
                            </div>
                            <div className="col-md-2">
                              <button
                                type="button"
                                className="btn remove-item-btn"
                                onClick={() =>
                                  handleRemove(index, selectedDeductionItems)
                                }
                              >
                                <i className="ri-close-line fs-16"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="form-icon right">
                      <Button
                        color="primary"
                        onClick={() => hanldeDeductionsComponent()}
                      >
                        <i className="ri-add-line align-bottom me-1"></i>
                        Select Components
                      </Button>{" "}
                    </div>
                  </div>
                  <hr></hr>
                  <div className="mb-3">
                    <Label htmlFor="tax_state" className="form-label">
                      Compliances
                    </Label>
                    <div className="">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <i
                          className="ri-information-line"
                          style={{ fontSize: "16px" }}
                        ></i>
                        <h1 className="fs-13" style={{ marginLeft: "5px" }}>
                          Compliances included ESI, EPF
                        </h1>
                      </div>
                      <div className="form-check form-check-inline">
                        <Input
                          id="p-tax"
                          name="Unit"
                          type="checkbox"
                          className="form-check-input"
                          required
                        />
                        <Label className="form-check-label" htmlFor="lt_day">
                          Profession Tax
                        </Label>
                      </div>
                    </div>
                    <div className="">
                      <div className="form-check form-check-inline">
                        <Input
                          id="p-fund"
                          name="Unit"
                          type="checkbox"
                          className="form-check-input"
                          required
                        />
                        <Label className="form-check-label" htmlFor="lt_day">
                          Labour Welfare Fund
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={12}>
              <div className="text-start">
                <Button color="success" type="submit">
                  create
                </Button>{" "}
                <Button color="light" type="submit">
                  Cancel
                </Button>
              </div>
            </Col>
          </Form>
        </Col>
      </Row>

      <Modal
        fade={true}
        isOpen={showEarningsModal}
        toggle={CloseEarningsModal}
        centered={true}
      >
        <ModalTitle>Select Earning Components</ModalTitle>
        <ModalBody className="py-3 px-5">
          <div className="mt-2 text-center">
            <table class="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      id="selectAll"
                      onChange={(e) => handleEarningsCB(0, e.target.checked)}
                    />
                  </th>
                  <th>Name</th>
                  <th>Pro-rata</th>
                  <th>Taxable</th>
                  <th>Contribute to insurance&Fund</th>
                </tr>
              </thead>
              <tbody>
                {EarningsData.map((item, index) => (
                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        class="earning-checkbox"
                        checked={item.selected}
                        onChange={(e) =>
                          handleEarningsCB(item.id, e.target.checked)
                        }
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.pro_rata ? "Yes" : "No"}</td>
                    <td>{item.tac ? "Yes" : "No"}</td>
                    <td>{item.insurance ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
            <button
              type="button"
              className="btn w-sm btn-light"
              data-bs-dismiss="modal"
              onClick={CloseEarningsModal}
            >
              Close
            </button>
            <button
              type="button"
              className="btn w-sm btn-success"
              data-bs-dismiss="modal"
              onClick={() => {
                dispatch(setEarnings(EarningsData));
                CloseEarningsModal();
              }}
            >
              Save
            </button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default salaryPloiciesForm;
