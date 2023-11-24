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
import { setTaxSlab } from "../../redux/reducers/ChildReducer/RightSideBarReducer";

const ProfessionalTaxForm = () => {
  const dispatch = useDispatch();
  const { tax_slab} = useSelector((state) => state.RightSideBarReducer);
  console.log("fghj",tax_slab);
  const [tableData, setTableData] = useState([]);

  const deduction_cycle_option = useMemo(
    () => [
      { id: "1", label: "Monthly", value: "Monthly" },
      { id: "2", label: "Quarterly", value: "Quarterly" },
      { id: "3", label: "Half-Yearly", value: "Half-Yearly" },
      { id: "4", label: "Annually", value: "Annually" },
    ],
    []
  );
  
  // const [tableData, setTableData] = useState([
  //   { id: 1, start: 0, end: 21000, amount: 0 },
  //   { id: 2, start: 21001, end: 30000, amount: 135 },
  //   { id: 3, start: 30001, end: 45000, amount: 315 },
  //   { id: 4, start: 45001, end: 60000, amount: 690 },
  //   { id: 5, start: 60001, end: 75000, amount: 1025 },
  //   { id: 6, start: 75001, end: 999999999, amount: 1250 },
  // ]);

  // Function to handle adding a new row
  const addRow = () => {
    const newRow = {
      id: tableData.length + 1,
      start: 0,
      end: 0,
      amount: 0,
    };
    setTableData([...tableData, newRow]);
  };
  const deleteRow = () => {
    if (tableData.length > 1) {
      setTableData((prevData) => prevData.slice(0, -1));
    }
  };
  const saveData = () => {

    console.log('Saving data:', tableData);
  };
  return (
    <React.Fragment>
      <Row>
        <Col md={12} lg={12} xxl={12} className="folder-card" key={1}>
          <Form action="javascript:void(0)">
            <Col md={12} lg={12} xxl={12}>
              <div className="mb-3">
                <Label htmlFor="emailid" className="form-label">
                  Location
                </Label>
                <div className="form-icon right">
                  <Input
                    type="text"
                    name="emp_id"
                    id="employeeid"
                    className="form-control"
                    placeholder="Employee ID"
                    value="Tamil Nadu"
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
                  placeholder="Select Leave Type"
                  className="basic-multi-select"
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
                        value={row.start}
                        onChange={(e) =>
                          setTableData((prevData) =>
                            prevData.map((prevRow) =>
                              prevRow.id === row.id
                                ? { ...prevRow, start: e.target.value }
                                : prevRow
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={row.end}
                        onChange={(e) =>
                          setTableData((prevData) =>
                            prevData.map((prevRow) =>
                              prevRow.id === row.id
                                ? { ...prevRow, end: e.target.value }
                                : prevRow
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={row.amount}
                        onChange={(e) =>
                          setTableData((prevData) =>
                            prevData.map((prevRow) =>
                              prevRow.id === row.id
                                ? { ...prevRow, amount: e.target.value }
                                : prevRow
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      {index === tableData.length - 1 && ( // Only render delete button for the last row
                        <Button color="danger" onClick={() => deleteRow(row.id)}>
                          <i className="ri-delete-bin-5-fill fs-16"></i>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Add Row and Save buttons */}
            <Button color="primary" onClick={addRow}>
              <i className="ri-add-line align-bottom me-1"></i>
              Add
            </Button>{' '}
            <Button type="submit" color="success" className="btn-label" onClick={saveData}>
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
