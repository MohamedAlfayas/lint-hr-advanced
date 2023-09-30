import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Input,
  Label,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../assets/images/users/avatar-5.jpg";
import avatar6 from "../../assets/images/users/avatar-6.jpg";
import avatar7 from "../../assets/images/users/avatar-7.jpg";
import avatar8 from "../../assets/images/users/avatar-8.jpg";
import { Link } from "react-router-dom";

const BranchForm = () => {
  const initialData = useMemo(() => {
    return {
      id: "0",
      name: "",
      total_branches: 1,
      description: "",
    };
  }, []);

  const [branchData, setBranchData] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  useEffect(() => {
    console.log("UseEffect Running !!!!");
    setBranchData(form_obj);
  }, [form_obj]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBranchData({
      ...branchData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    console.log("branch data = ", branchData);
  };

  const [rolelist, setListData] = useState([
    {
      id: 1,
      Name: "Company",
      priority: 1,
      note: "COmpany FUll Access",
      permission: [
        {
          id: 1,
          notes: "User Can View All Branch",
          element: "per_company_view",
        },
        {
          id: 2,
          notes: "User Can Create New Branch",
          element: "per_company_create",
        },
        {
          id: 3,
          notes: "User Can Edit Branch",
          element: "per_company_edit",
        },
        {
          id: 4,
          notes: "User Can Delete Branch",
          element: "per_company_delete",
        },
      ],
    },

    {
      id: 2,
      Name: "Employee",
      priority: 3,
      note: "",
      permission: [
        {
          id: 5,
          notes: "User Can View All Employee",
          element: "per_employee_view",
        },
        {
          id: 6,
          notes: "User Can Create Employee",
          element: "per_employee_create",
        },
        {
          id: 7,
          notes: "User Can Edit Employee",
          element: "per_employee_edit",
        },
        {
          id: 8,
          notes: "User Can Delete Employee",
          element: "per_employee_delete",
        },
      ],
    },
    {
      id: 2,
      Name: "Roles",
      priority: 1,
      note: "",
      permission: [
        {
          id: 9,
          notes: "User Can View All Roles",
          element: "per_role_view",
        },
        {
          id: 10,
          notes: "User Can Create New Role",
          element: "per_role_create",
        },
        {
          id: 11,
          notes: "User Can Edit Role",
          element: "per_role_edit",
        },
        {
          id: 12,
          notes: "User Can Delete Role",
          element: "per_role_delete",
        },
      ],
    },
    {
      id: 3,
      Name: "Work_Schedule",
      priority: 1,
      note: "",
      permission: [
        {
          id: 13,
          notes: "Can View Work Schedule",
          element: "per_ws_view",
        },
        {
          id: 14,
          notes: "Can Create Work Schedule",
          element: "per_ws_create",
        },
        {
          id: 15,
          notes: "Can Edit Work Schedule",
          element: "per_ws_edit",
        },
        {
          id: 16,
          notes: "Can Delete Work Schedule",
          element: "per_ws_delete",
        },
      ],
    },
    {
      id: 4,
      Name: "Holiday",
      priority: 2,
      note: "",
      permission: [
        {
          id: 17,
          notes: "User Can View All Holiday",
          element: "per_holiday_view",
        },
        {
          id: 18,
          notes: "User Can Create New Holiday",
          element: "per_holiday_create",
        },
        {
          id: 19,
          notes: "User Can Edit Holiday",
          element: "per_holiday_edit",
        },
        {
          id: 20,
          notes: "User Can Delete Holiday",
          element: "per_department_delete",
        },
      ],
    },
    {
      id: 5,
      Name: "Department",
      priority: 2,
      note: "",
      permission: [
        {
          id: 21,
          notes: "User Can View All Departments",
          element: "per_department_view",
        },
        {
          id: 22,
          notes: "User Can Create New Departments",
          element: "per_department_create",
        },
        {
          id: 23,
          notes: "User Can Edit Departments",
          element: "per_department_edit",
        },
        {
          id: 24,
          notes: "User Can Delete Departments",
          element: "per_department_delete",
        },
      ],
    },
    {
      id: 0,
      Name: "Attendance Report",
      note: "Attendance",
      priority: 4,
      permission: [
        {
          id: 1,
          notes: "View Daily Attendance Reports",
          element: "per_attendance_report",
        },
      ],
    },
  ]);

  return (
    <React.Fragment>
      <Row className="g-4 mb-3">
        <div className="col-sm">
          <div className="d-flex">
            <label htmlFor="roleName" className="form-label">
              Role Name
            </label>
            <input
              type="text"
              name="name"
              className="form-control"
              id="roleName"
              placeholder="Enter Role Name"
              required
            />
          </div>
        </div>
        <div className="col-sm-auto">
          <div>
            <div className="text-end">
              <Button color="success" className="btn-label">
                {" "}
                <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                Save{" "}
              </Button>{" "}
            </div>
          </div>
        </div>
      </Row>

      <Row>
        <div className="team-list list-view-filter">
          <Card className="overflow-hidden shadow-none">
            <CardBody className="bg-secondary-subtle">
              <Row className="align-items-center team-row text-center">
                <Col lg={3} className="ml-2">
                  <b>Access</b>
                </Col>
                <Col lg={9} className="ml-2">
                  <Row className="align-items-center team-row text-center">
                    <Col lg={3} className="ml-2">
                      <b> View</b>
                    </Col>
                    <Col lg={3} className="ml-2">
                      <b>Create</b>
                    </Col>
                    <Col lg={3} className="ml-2">
                      <b>Edit</b>
                    </Col>
                    <Col lg={3} className="ml-2">
                      <b> Delete</b>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {rolelist.map((data, idx) => (
            //const priority = data.priority === 1 ? "Primary" : "Secondary";
            <>
              <Card className="team-box ribbon-box">
                <CardBody className="px-4">
                  {data.priority === 1 ? (
                    <div className="ribbon-two ribbon-two-warning">
                      <span>Master</span>
                    </div>
                  ) : data.priority === 2 ? (
                    <div className="ribbon-two ribbon-two-info">
                      <span>Access</span>
                    </div>
                  ) : data.priority === 3 ? (
                    ""
                  ) : data.priority === 4 ? (
                    <div className="ribbon-two ribbon-two-success">
                      <span>Report</span>
                    </div>
                  ) : (
                    ""
                  )}

                  <Row className="align-items-center team-row ">
                    <Col lg={3} className="ml-2">
                      <div className="team-profile-img">
                        <div className="team-content">
                          <Link to="#" className="d-block">
                            <h5 className="fs-16 mb-1">{data.Name}</h5>
                          </Link>
                          <p className="text-muted mb-0">{data.note}</p>
                        </div>
                      </div>
                    </Col>
                    <Col lg={9}>
                      <Row className="text-muted text-center align-items-center">
                        {data.permission.length === 1 ? (
                          <Col xs={3} className="border-end border-end-dashed">
                            <div
                              className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                              dir="ltr">
                              <Input
                                id={data.permission[0].element}
                                name={data.permission[0].element}
                                type="checkbox"
                                className="form-check-input"
                                defaultChecked
                              />
                            </div>
                            <p className="text-muted mb-0">
                              {data.permission[0].notes}
                            </p>
                          </Col>
                        ) : data.permission.length === 4 ? (
                          <>
                            <Col
                              xs={3}
                              className="border-end border-end-dashed">
                              <div
                                className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                                dir="ltr">
                                <Input
                                  id={data.permission[0].element}
                                  name={data.permission[0].element}
                                  type="checkbox"
                                  className="form-check-input"
                                  defaultChecked
                                />
                              </div>
                              <p className="text-muted mb-0">
                                {data.permission[0].notes}
                              </p>
                            </Col>
                            <Col
                              xs={3}
                              className="border-end border-end-dashed">
                              <div
                                className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                                dir="ltr">
                                <Input
                                  id={data.permission[1].element}
                                  name={data.permission[1].element}
                                  type="checkbox"
                                  className="form-check-input"
                                  defaultChecked
                                />
                              </div>
                              <p className="text-muted mb-0">
                                {data.permission[1].notes}
                              </p>
                            </Col>

                            <Col
                              xs={3}
                              className="border-end border-end-dashed">
                              <div
                                className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                                dir="ltr">
                                <Input
                                  id={data.permission[2].element}
                                  name={data.permission[2].element}
                                  type="checkbox"
                                  className="form-check-input"
                                  defaultChecked
                                />
                              </div>
                              <p className="text-muted mb-0">
                                {data.permission[2].notes}
                              </p>
                            </Col>
                            <Col xs={3} className=" ">
                              <div
                                className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                                dir="ltr">
                                <Input
                                  id={data.permission[3].element}
                                  name={data.permission[3].element}
                                  type="checkbox"
                                  className="form-check-input"
                                  defaultChecked
                                />
                              </div>
                              <p className="text-muted mb-0">
                                {data.permission[3].notes}
                              </p>
                            </Col>
                          </>
                        ) : (
                          ""
                        )}
                      </Row>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </>
          ))}
        </div>
      </Row>
    </React.Fragment>
  );
};

export default BranchForm;
