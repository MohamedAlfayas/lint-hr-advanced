import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import { SweetAlert } from "../../common/sweetAlert/SweetAlert";
import Swal from "sweetalert2";
import "../../../pages/payroll/SalaryPoliciesModal.css";
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
  editDeduction,
  editAllowance,
} from "../../../redux/reducers/ChildReducer/SalaryComponentsReducer";
import {
  allowances_module_name,
  deductions_module_name,
  earnings_module_name,
  payroll_policy_calculation_type,
  payroll_policy_period,
} from "../../../common/constant/Constants";

const salaryPloiciesForm = () => {
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const { earnings_data, allowances_data, deductions_data } = useSelector(
    (state) => state.SalaryComponentsReducer
  );

  const [EarningsData, setEarningsData] = useState([]);
  const [AllowanceData, setAlowanceData] = useState([]);
  const [DeductionData, setDeductionData] = useState([]);

  // console.log("kkk",deductions_data);selectedItems
  const [customFieldObj, setCustomFieldObj] = useState(form_obj);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedAllowanceItems, setSelectedAlowanceItems] = useState([]);
  const [selectedDeductionItems, setSelectedDeductionItems] = useState([]);
  const [calculationType, setCalculationType] = useState("earn-1");
  const [selectField, setSelectField] = useState("earn-1");

  const GetModuleData = (module) => {
    let module_data =
      module === earnings_module_name
        ? earnings_data
        : module === allowances_module_name
        ? allowances_data
        : deductions_data;
    return module_data;
  };

  const DispatchModuleData = (module, changed_obj) => {
    module === earnings_module_name
      ? dispatch(editEarnings(changed_obj))
      : module === allowances_module_name
      ? dispatch(editAllowance(changed_obj))
      : dispatch(editDeduction(changed_obj));
  };

  const handleCalculationTypeChange = (e, id, module) => {
    console.log("ID = ", id);
    console.log("MODULE = ", module);
    let changed_data = GetModuleData(module);
    console.log("Changed Data = ", changed_data);
    let changed_obj = {
      ...changed_data.find((d) => d.id === id),
      calculation_type: e.value,
      time_period: 0,
    };
    DispatchModuleData(module, changed_obj);
  };

  const handleTimePeriodChange = (e, id, module) => {
    let changed_data = GetModuleData(module);
    let changed_obj = {
      ...changed_data.find((d) => d.id === id),
      time_period: e.value,
    };
    DispatchModuleData(module, changed_obj);
  };

  const handleRemove = (id, module) => {
    let changed_data = GetModuleData(module);
    let changed_obj = {
      ...changed_data.find((d) => d.id === id),
      selected: false,
    };
    DispatchModuleData(module, changed_obj);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomFieldObj({
      ...customFieldObj,
      [name]: value,
    });
  };

  const dispatch = useDispatch();

  const handleModuleCB = (id, checked, module) => {
    console.log("Checked = ", checked);
    let module_data =
      module === earnings_module_name
        ? EarningsData
        : module === allowances_module_name
        ? AllowanceData
        : DeductionData;
    let updatedData = [];
    if (id === 0) {
      updatedData = [...module_data].map((d) => {
        return { ...d, selected: checked, calculation_type: 1, time_period: 0 };
      });
    } else {
      updatedData = [...module_data].map((d) => {
        if (d.id === id) {
          return {
            ...d,
            selected: checked,
            calculation_type: 1,
            time_period: 0,
          };
        } else {
          return d;
        }
      });
    }
    module === earnings_module_name
      ? setEarningsData(updatedData)
      : module === allowances_module_name
      ? setAlowanceData(updatedData)
      : setDeductionData(updatedData);
  };

  //   Modal

  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const CloseEarningsModal = () => setShowEarningsModal(false);

  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const CloseAllowanceModal = () => setShowAllowanceModal(false);

  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const CloseDeductionModal = () => setShowDeductionModal(false);

  useEffect(() => {
    setCustomFieldObj(form_obj);
  }, [form_obj]);

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
                                  htmlFor={`selectedComponent_${earnings_module_name}_${index}`}
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
                                  htmlFor={`calculationType_${earnings_module_name}_${index}`}
                                  className="form-label"
                                >
                                  Calculation Type
                                </label>
                                <Select
                                  id={`calculationType_${earnings_module_name}_${index}`}
                                  name={`calculationType_${earnings_module_name}_${index}`}
                                  className="basic-multi-select"
                                  options={payroll_policy_calculation_type}
                                  value={
                                    (item?.calculation_type &&
                                      payroll_policy_calculation_type.find(
                                        (d) => d.id === item?.calculation_type
                                      )) ||
                                    []
                                  }
                                  onChange={(e) =>
                                    handleCalculationTypeChange(
                                      e,
                                      item?.id,
                                      earnings_module_name
                                    )
                                  }
                                />
                              </div>
                              <div className="col-md-2">
                                <label
                                  htmlFor={`additionalInput_${earnings_module_name}_${index}`}
                                  className="form-label"
                                ></label>
                                <input
                                  type="number"
                                  id={`additionalInput_${earnings_module_name}_${index}`}
                                  name={`additionalInput_${earnings_module_name}_${index}`}
                                  className="form-control"
                                />
                              </div>
                              <div className="col-md-3">
                                <label
                                  htmlFor={`selectField_${earnings_module_name}_${index}`}
                                  className="form-label"
                                ></label>
                                <Select
                                  id={`selectField_${earnings_module_name}_${index}`}
                                  name={`selectField_${earnings_module_name}_${index}`}
                                  className="basic-multi-select"
                                  options={
                                    (item?.calculation_type &&
                                      payroll_policy_period.filter(
                                        (d) =>
                                          d.calculation_type ===
                                          item?.calculation_type
                                      )) ||
                                    []
                                  }
                                  value={
                                    (item?.time_period &&
                                      payroll_policy_period.find(
                                        (d) => d.id === item?.time_period
                                      )) ||
                                    []
                                  }
                                  onChange={(e) =>
                                    handleTimePeriodChange(
                                      e,
                                      item?.id,
                                      earnings_module_name
                                    )
                                  }
                                />
                              </div>
                              <div className="col-md-2">
                                <button
                                  type="button"
                                  className="btn  remove-item-btn"
                                  onClick={() =>
                                    handleRemove(item?.id, earnings_module_name)
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
                                  htmlFor={`selectedComponent_${allowances_module_name}_${index}`}
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
                                  htmlFor={`calculationType_${allowances_module_name}_${index}`}
                                  className="form-label"
                                >
                                  Calculation Type
                                </label>
                                <Select
                                  id={`calculationType_${allowances_module_name}_${index}`}
                                  name={`calculationType_${allowances_module_name}_${index}`}
                                  className="basic-multi-select"
                                  options={payroll_policy_calculation_type}
                                  value={
                                    (item?.calculation_type &&
                                      payroll_policy_calculation_type.find(
                                        (d) => d.id === item?.calculation_type
                                      )) ||
                                    []
                                  }
                                  onChange={(e) =>
                                    handleCalculationTypeChange(
                                      e,
                                      item?.id,
                                      allowances_module_name
                                    )
                                  }
                                />
                              </div>
                              <div className="col-md-2">
                                <label
                                  htmlFor={`additionalInput_${allowances_module_name}_${index}`}
                                  className="form-label"
                                ></label>
                                <input
                                  type="text"
                                  id={`additionalInput_${allowances_module_name}_${index}`}
                                  name={`additionalInput_${allowances_module_name}_${index}`}
                                  className="form-control"
                                />
                              </div>
                              <div className="col-md-3">
                                <label
                                  htmlFor={`selectField_${allowances_module_name}_${index}`}
                                  className="form-label"
                                ></label>
                                <Select
                                  id={`selectField_${allowances_module_name}_${index}`}
                                  name={`selectField_${allowances_module_name}_${index}`}
                                  className="basic-multi-select"
                                  options={
                                    (item?.calculation_type &&
                                      payroll_policy_period.filter(
                                        (d) =>
                                          d.calculation_type ===
                                          item?.calculation_type
                                      )) ||
                                    []
                                  }
                                  value={
                                    (item?.time_period &&
                                      payroll_policy_period.find(
                                        (d) => d.id === item?.time_period
                                      )) ||
                                    []
                                  }
                                  onChange={(e) =>
                                    handleTimePeriodChange(
                                      e,
                                      item?.id,
                                      allowances_module_name
                                    )
                                  }
                                />
                              </div>
                              <div className="col-md-2">
                                <button
                                  type="button"
                                  className="btn  remove-item-btn"
                                  onClick={() =>
                                    handleRemove(
                                      item?.id,
                                      allowances_module_name
                                    )
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
                                <Select
                                  id={`calculationType_${deductions_module_name}_${index}`}
                                  name={`calculationType_${deductions_module_name}_${index}`}
                                  className="basic-multi-select"
                                  options={payroll_policy_calculation_type}
                                  value={
                                    (item?.calculation_type &&
                                      payroll_policy_calculation_type.find(
                                        (d) => d.id === item?.calculation_type
                                      )) ||
                                    []
                                  }
                                  onChange={(e) =>
                                    handleCalculationTypeChange(
                                      e,
                                      item?.id,
                                      deductions_module_name
                                    )
                                  }
                                />
                              </div>
                              <div className="col-md-2">
                                <label
                                  htmlFor={`additionalInput_${deductions_module_name}_${index}${index}`}
                                  className="form-label"
                                ></label>
                                <input
                                  type="text"
                                  id={`additionalInput_${deductions_module_name}_${index}${index}`}
                                  name={`additionalInput_${deductions_module_name}_${index}${index}`}
                                  className="form-control"
                                />
                              </div>
                              <div className="col-md-3">
                                <label
                                  htmlFor={`selectField_${deductions_module_name}_${index}${index}`}
                                  className="form-label"
                                ></label>
                                <Select
                                  id={`selectField_${deductions_module_name}_${index}${index}`}
                                  name={`selectField_${deductions_module_name}_${index}${index}`}
                                  className="basic-multi-select"
                                  options={
                                    (item?.calculation_type &&
                                      payroll_policy_period.filter(
                                        (d) =>
                                          d.calculation_type ===
                                          item?.calculation_type
                                      )) ||
                                    []
                                  }
                                  value={
                                    (item?.time_period &&
                                      payroll_policy_period.find(
                                        (d) => d.id === item?.time_period
                                      )) ||
                                    []
                                  }
                                  onChange={(e) =>
                                    handleTimePeriodChange(
                                      e,
                                      item?.id,
                                      deductions_module_name
                                    )
                                  }
                                />
                              </div>
                              <div className="col-md-2">
                                <button
                                  type="button"
                                  className="btn  remove-item-btn"
                                  onClick={() =>
                                    handleRemove(
                                      item?.id,
                                      deductions_module_name
                                    )
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
        <ModalTitle className="modal-title">
          Select Earning Components
        </ModalTitle>
        <ModalBody className="py-3 px-10">
          <div className="mt-2 text-center">
            <table class="table-cmpnt">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      id="selectAll"
                      onChange={(e) =>
                        handleModuleCB(
                          0,
                          e.target.checked,
                          earnings_module_name
                        )
                      }
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
                          handleModuleCB(
                            item.id,
                            e.target.checked,
                            earnings_module_name
                          )
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
        <ModalTitle className="modal-title">
          Select Alowances Components
        </ModalTitle>
        <ModalBody className="py-3 px-10">
          <div className="mt-2 text-center">
            <table class="table-cmpnt">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      id="selectAll"
                      onChange={(e) =>
                        handleModuleCB(
                          0,
                          e.target.checked,
                          allowances_module_name
                        )
                      }
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
                          handleModuleCB(
                            item.id,
                            e.target.checked,
                            allowances_module_name
                          )
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
        <ModalTitle className="modal-title">
          Select Deduction Components
        </ModalTitle>
        <ModalBody className="py-3 px-10">
          <div className="mt-2 text-center">
            <table class="table-cmpnt">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      id="selectAll"
                      onChange={(e) =>
                        handleModuleCB(
                          0,
                          e.target.checked,
                          deductions_module_name
                        )
                      }
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
                          handleModuleCB(
                            item.id,
                            e.target.checked,
                            deductions_module_name
                          )
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
