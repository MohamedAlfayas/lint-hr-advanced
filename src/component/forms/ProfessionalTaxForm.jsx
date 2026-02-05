import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
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
} from "reactstrap";

const ProfessionalTaxForm = () => {
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [tableData, setTableData] = useState(form_obj.range);
  const [cycleOption, setCycleOption] = useState(form_obj);

  const deduction_cycle_option = useMemo(
    () => [
      { id: "1", label: "Monthly", value: "Monthly" },
      { id: "2", label: "Quarterly", value: "Quarterly" },
      { id: "3", label: "Half-Yearly", value: "Half-Yearly" },
      { id: "4", label: "Annually", value: "Annually" },
    ],
    []
  );

  const addRow = () => {
    const newRow = {
      id: tableData.length + 1,
      s: 0,
      e: 0,
      tax: 0,
    };
    setTableData([...tableData, newRow]);
  };
  const deleteRow = () => {
    if (tableData.length > 1) {
      setTableData((prevData) => prevData.slice(0, -1));
    }
  };
  const saveData = () => {
    
  };
  return (
    <React.Fragment>
      <Row>
        <Col md={12} lg={12} xxl={12} className="folder-card" key={1}>
          <Form action="javascript:void(0)">
            <Col md={12} lg={12} xxl={12}>
              <div className="mb-3">
                <Label htmlFor="tax_state" className="form-label">
                  Location
                </Label>
                <div className="form-icon right">
                  <Input
                    type="text"
                    name="tax_state"
                    id="tax_state"
                    className="form-control"
                    placeholder="Tax State"
                    value={form_obj.state}
                    disabled
                  />
                  <i className="ri-map-pin-user-line"></i>
                </div>
              </div>
            </Col>
            <Col md={12} lg={12} xxl={12}>
              <div className="mb-3">
                <Label>Deduction Cycle</Label>
                <Select
                  required
                  isMulti={false}
                  options={deduction_cycle_option || []}
                  value={
                    cycleOption
                      ? deduction_cycle_option.find(
                          (d) => d.id === cycleOption.cycle_id
                        )
                      : []
                  }
                  placeholder="Select Leave Type"
                  className="basic-multi-select"
                  classNamePrefix="lc-select"
                />
              </div>
              <div id="passwordHelpBlock" className="form-text">
                Please select Deduction Cycle.
              </div>
            </Col>
            <Table>
              <thead>
                <tr>
                  <th>Start</th>
                  <th>End</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={row.id}>
                    <td>
                      <Input
                        type="number"
                        value={row.s}
                        onChange={(e) =>
                          setTableData((prevData) =>
                            prevData.map((prevRow) =>
                              prevRow.id === row.id
                                ? { ...prevRow, s: e.target.value }
                                : prevRow
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={row.e}
                        onChange={(e) =>
                          setTableData((prevData) =>
                            prevData.map((prevRow) =>
                              prevRow.id === row.id
                                ? { ...prevRow, e: e.target.value }
                                : prevRow
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={row.tax}
                        onChange={(e) =>
                          setTableData((prevData) =>
                            prevData.map((prevRow) =>
                              prevRow.id === row.id
                                ? { ...prevRow, tax: e.target.value }
                                : prevRow
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      {index !== 0 && index === tableData.length - 1 && (
                        <Button
                          color="danger"
                          onClick={() => deleteRow(row.id)}
                          style={{ padding: "0.2rem 0.5rem", fontSize: "12px" }}
                        >
                          <i className="ri-delete-bin-5-fill fs-16"></i>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button color="primary" onClick={addRow}>
              <i className="ri-add-line align-bottom me-1"></i>
              Add
            </Button>{" "}
            <Button
              type="submit"
              color="success"
              className="btn-label"
              onClick={saveData}
            >
              {" "}
              <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
              Save{" "}
            </Button>{" "}
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ProfessionalTaxForm;
