import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import { SweetAlert } from "../../common/sweetAlert/SweetAlert";
import Swal from "sweetalert2";
import '../../../pages/payroll/SalaryPoliciesModal.css'
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
  setAllowances,
  setDeductions,
} from "../../../redux/reducers/ChildReducer/SalaryComponentsReducer";

const salaryPloiciesForm = () => {
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const { earnings_data, allowances_data, deductions_data } = useSelector(
    (state) => state.SalaryComponentsReducer
  );



  const [EarningsData, setEarningsData] = useState([]);
  const [AllowanceData, setAlowanceData] = useState([]);
  const [DeductionData, setDeductionData] = useState([]);

  useEffect(() => {
    console.log("USEEFFECT RUNNING");
    console.log("kkk", earnings_data);
  }, [earnings_data]);

  useEffect(() => {
    console.log("EARRRRRNINGGGS DATA = ", EarningsData);
  }, [EarningsData]);
  useEffect(() => {
    console.log("USEEFFECT RUNNING");
    console.log("kkk", allowances_data);
  }, [allowances_data]);

  useEffect(() => {
    console.log("Allowance DATA = ", AllowanceData);
  }, [AllowanceData]);
  useEffect(() => {
    console.log("USEEFFECT RUNNING");
    console.log("kkk", deductions_data);
  }, [deductions_data]);

  useEffect(() => {
    console.log("Allowance DATA = ", DeductionData);
  }, [DeductionData]);


  // console.log("kkk",deductions_data);selectedItems
  const [customFieldObj, setCustomFieldObj] = useState(form_obj);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedAllowanceItems, setSelectedAlowanceItems] = useState([]);
  const [selectedDeductionItems, setSelectedDeductionItems] = useState([]);
  const [calculationType, setCalculationType] = useState("earn-1");
  const [selectField, setSelectField] = useState("earn-1");

  const handleCalculationTypeChange = (event) => {
    // const selectedValue = event.target.value;
    setCalculationType(event);

    setSelectField("earn-1");
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
  const handleAllowanceCB = (id, checked) => {
    console.log("Checked = ", checked);

    let updatedAllowanceData = [];

    if (id === 0) {
      updatedAllowanceData = [...AllowanceData].map((d) => {
        return { ...d, selected: checked };
      });
    } else {
      updatedAllowanceData = [...AllowanceData].map((d) => {
        if (d.id === id) {
          return { ...d, selected: checked };
        } else {
          return d;
        }
      });
    }

    setAlowanceData(updatedAllowanceData);

    // hanldeEarningComponent(updatedEarningsData);
  };
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const CloseAllowanceModal = () => setShowAllowanceModal(false);

  const handleDeductionCB = (id, checked) => {
    console.log("Checked = ", checked);

    let updatedDeductionData = [];

    if (id === 0) {
      updatedDeductionData = [...DeductionData].map((d) => {
        return { ...d, selected: checked };
      });
    } else {
      updatedDeductionData = [...DeductionData].map((d) => {
        if (d.id === id) {
          return { ...d, selected: checked };
        } else {
          return d;
        }
      });
    }

    setDeductionData(updatedDeductionData);

    // hanldeEarningComponent(updatedEarningsData);
  };
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const CloseDeductionModal = () => setShowDeductionModal(false);

  useEffect(() => {
    setCustomFieldObj(form_obj);
  }, [form_obj]);
  console.log("select", selectedItems);


  const handleRemove = (category, status) => {
    console.log('erarninh', EarningsData);
    const select = { ...category, selected: false }
   
   
    switch (status) {
      case 1:
        const updatedStateArray = earnings_data.map((item) =>
        item.id === category.id ? { ...item, ...select } : item
      );
    
    
  dispatch(setEarnings(updatedStateArray))
        break;
      case 2:
        const updatedStateArray1 = allowances_data.map((item) =>
      item.id === category.id ? { ...item, ...select } : item
    );
  
dispatch(setAllowances(updatedStateArray1))
        break;
      case 3:
        const updatedStateArray2 = deductions_data.map((item) =>
        item.id === category.id ? { ...item, ...select } : item
      );
     
    
  dispatch(setDeductions(updatedStateArray2))
        break;
      default:
        break;
    }
  };

  // const handleEarningCalculationType = (id, val) => {};

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
                                    setEarningsData({ ...EarningsData, earnings_data: e.id })
                                  }
                                >
                                  <option value="earn-1">Flat Amount</option>
                                  <option value="earn-2">Percentage</option>
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
                                  {calculationType === "earn-2" ? (
                                    <option value="earn-1">Per Year</option>
                                  ) : null}
                                  {calculationType === "earn-1" ? (
                                    <React.Fragment>
                                      <option value="earn-2">Monthly</option>
                                      <option value="earn-3">Weekly</option>
                                    </React.Fragment>
                                  ) : null}
                                </select>
                              </div>
                              <div className="col-md-2">
                                <button
                                  type="button"
                                  className="btn  remove-item-btn"
                                  onClick={() =>
                                    handleRemove(item, 1)
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

                    {allowances_data.length > 0 && (
                      <div className="mb-3">
                        {allowances_data
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
                                  <option value="allowance-1">Flat Amount</option>
                                  <option value="allowance-2">Percentage</option>
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
                                  {calculationType === "allowance-2" ? (
                                    <option value="allowance-1">Per Year</option>
                                  ) : null}
                                  {calculationType === "allowance-1" ? (
                                    <React.Fragment>
                                      <option value="allowance-2">Monthly</option>
                                      <option value="allowance-3">Weekly</option>
                                    </React.Fragment>
                                  ) : null}
                                </select>
                              </div>
                              <div className="col-md-2">
                                <button
                                  type="button"
                                  className="btn  remove-item-btn"
                                  onClick={() =>
                                    handleRemove(item, 2)
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
                          setAlowanceData(allowances_data);
                          setShowAllowanceModal(true);
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
                     Deductions
                    </Label>

                    {deductions_data.length > 0 && (
                      <div className="mb-3">
                        {deductions_data
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
                                  <option value="deduction-1">Flat Amount</option>
                                  <option value="deduction-2">Percentage</option>
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
                                  {calculationType === "deduction-2" ? (
                                    <option value="deduction-1">Per Year</option>
                                  ) : null}
                                  {calculationType === "deduction-1" ? (
                                    <React.Fragment>
                                      <option value="deduction-2">Monthly</option>
                                      <option value="deduction-3">Weekly</option>
                                    </React.Fragment>
                                  ) : null}
                                </select>
                              </div>
                              <div className="col-md-2">
                                <button
                                  type="button"
                                  className="btn  remove-item-btn"
                                  onClick={() =>
                                    handleRemove(item, 3)
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
                          setDeductionData(deductions_data);
                          setShowDeductionModal(true);
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
        <ModalTitle className="modal-title">Select Earning Components</ModalTitle>
        <ModalBody className="py-3 px-5">
          <div className="mt-2 text-center">
            <table class="table-cmpnt">
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
      <Modal
        fade={true}
        isOpen={showAllowanceModal}
        toggle={CloseAllowanceModal}
        centered={true}
      >
        <ModalTitle className="modal-title">Select Alowances Components</ModalTitle>
        <ModalBody className="py-3 px-5">
          <div className="mt-2 text-center">
            <table class="table-cmpnt">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      id="selectAll"
                      onChange={(e) => handleAllowanceCB(0, e.target.checked)}
                    />
                  </th>
                  <th>Name</th>
                  <th>Pro-rata</th>
                  <th>Taxable</th>
                  <th>Contribute to insurance&Fund</th>
                </tr>
              </thead>
              <tbody>
                {AllowanceData.map((item, index) => (
                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        class="earning-checkbox"
                        checked={item.selected}
                        onChange={(e) =>
                          handleAllowanceCB(item.id, e.target.checked)
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
              onClick={CloseAllowanceModal}
            >
              Close
            </button>
            <button
              type="button"
              className="btn w-sm btn-success"
              data-bs-dismiss="modal"
              onClick={() => {
                dispatch(setAllowances(AllowanceData));
                CloseAllowanceModal();
              }}
            >
              Save
            </button>
          </div>
        </ModalBody>
      </Modal>
      <Modal
        fade={true}
        isOpen={showDeductionModal}
        toggle={CloseDeductionModal}
        centered={true}
      >
        <ModalTitle className="modal-title">Select Deduction Components</ModalTitle>
        <ModalBody className="py-3 px-5">
          <div className="mt-2 text-center">
            <table class="table-cmpnt">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      id="selectAll"
                      onChange={(e) => handleDeductionCB(0, e.target.checked)}
                    />
                  </th>
                  <th>Name</th>
                  <th>Pro-rata</th>
                  <th>Taxable</th>
                  <th>Contribute to insurance&Fund</th>
                </tr>
              </thead>
              <tbody>
                {DeductionData.map((item, index) => (
                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        class="earning-checkbox"
                        checked={item.selected}
                        onChange={(e) =>
                          handleDeductionCB(item.id, e.target.checked)
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
              onClick={CloseDeductionModal}
            >
              Close
            </button>
            <button
              type="button"
              className="btn w-sm btn-success"
              data-bs-dismiss="modal"
              onClick={() => {
                dispatch(setDeductions(DeductionData));
                CloseDeductionModal();
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
