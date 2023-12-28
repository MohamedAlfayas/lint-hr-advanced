import React, { useState } from "react";
import { useDispatch } from "react-redux";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Row,
} from "reactstrap";
// import { Table } from 'rsuite';
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { Link } from "react-router-dom";

// const { Column, HeaderCell, Cell } = Table;

//import images

const Branch = () => {
  const dispatch = useDispatch();

  const [data] = useState([
    {
      id: 1,
      first_name: "Alwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 2,
      first_name: "Blwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 3,
      first_name: "Clwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 4,
      first_name: "Dlwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 5,
      first_name: "Elwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 6,
      first_name: "Flwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 7,
      first_name: "Glwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 8,
      first_name: "Hlwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 9,
      first_name: "Ilwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 10,
      first_name: "Jlwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 11,
      first_name: "Klwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
    {
      id: 12,
      first_name: "Llwyn",
      last_name: "Kris",
      gender: "Female",
      age: "22",
      address: "Vallioor",
      city: "Tirunelveli",
      state: "Tamilnadu",
      country: "India",
      continent: "Asia",
    },
  ]);

  const [rolelist, setListData] = useState([
    {
      id: 1,
      Name: "Company",
      priority: 1,
      note: "",
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
      priority: 2,
      note: "",
      permission: [
        {
          id: 5,
          notes: "User Can View All Employee In his Department",
          element: "per_employee_view",
        },
        {
          id: 6,
          notes: "User Can Create New Employee",
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
          notes: "User Can View All Work Schedule",
          element: "per_ws_view",
        },
        {
          id: 14,
          notes: "User Can Create New Work Schedule",
          element: "per_ws_create",
        },
        {
          id: 15,
          notes: "User Can Edit Work Schedule",
          element: "per_ws_edit",
        },
        {
          id: 16,
          notes: "User Can Delete Work Schedule",
          element: "per_ws_delete",
        },
      ],
    },
    {
      id: 4,
      Name: "Holiday",
      priority: 1,
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
  ]);

  const handleBranchEdit = () => {
    dispatch(setFormTitle("Branch Form"));
    dispatch(
      setFormObj({
        id: "0",
        name: "",
        total_branches: 1,
        description: "",
      })
    );
    dispatch(setFormWidthPercentage("35%"));
    dispatch(setComponentToShow("BranchForm"));
    dispatch(toggleRSBView(true));
  };

  return (
    <React.Fragment>
      <Card>
        <CardHeader>
          <span className="float-end">
            <button
              type="button"
              className="btn btn-success add-btn"
              id="create-btn"
              style={{ textTransform: "capitalize" }}
              onClick={() => {
                handleBranchEdit(0);
              }}
            >
              <i className="ri-add-line align-bottom me-1"></i>New Branch{" "}
            </button>
          </span>

          <h4 className="card-title mb-0">Branch</h4>
        </CardHeader>
        <CardBody>
          <Row>
            <Col xxl={6}>
              <Card key={1} className="border card-border-success">
                <CardBody>
                  <div
                    className={`p-3 mt-n3 mx-n3 bg-success-subtle rounded-top`}
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h5 className="mb-0 fs-14">
                          <Link to="#" className="text-body">
                            Lintcloud It Service Pvt Ltd
                            <span className="badge border border-dark text-body ms-2">
                              HEADQUARTER
                            </span>
                          </Link>
                        </h5>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="d-flex gap-1 align-items-center my-n2">
                          <div className="form-check form-switch form-switch-success  ">
                            <Input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="enableEPF"
                              checked="true"
                            />
                            <Label className="form-check-label" for="enableEPF">
                              Active
                            </Label>
                          </div>
                          <a
                            //onClick={() => handleTaxEdit(item.slabs)}
                            className="text-primary d-inline-block edit-item-btn ms-2"
                            href="javascript:void(0)"
                          >
                            <i class="ri-pencil-fill fs-16"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-3">
                    <Row className="gy-3">
                      <Col xs={12}>
                        <div>
                          <p className="text-muted mb-1">Address </p>
                          <h5 className="fs-14">
                            694, C/10, SAHAR COMPLEX, NEAR MATHUMITHA HOSPITAL,
                            OPP BUS STAND, VALLIOOR - 627117
                          </h5>
                        </div>
                        <hr />
                      </Col>
                    </Row>
                    <Row className="gy-3">
                      <Col xs={2}>
                        <div>
                          <p className="text-muted mb-1">Employees</p>
                          <h5 className="fs-14">25</h5>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div>
                          <p className="text-muted mb-1">Timezone</p>
                          <h5 className="fs-14">GMT +05:30 Asia/Kolkata</h5>
                        </div>
                      </Col>
                      <Col xs={3}>
                        <div>
                          <p className="text-muted mb-1">Contact Number</p>
                          <h5 className="fs-14">+91 999999999</h5>
                        </div>
                      </Col>
                      <Col xs={3}>
                        <div>
                          <p className="text-muted mb-1">Contact Email</p>
                          <h5 className="fs-14">elan@lintcloud.com</h5>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xxl={6}>
              <Card key={1} className="border card-border-success">
                <CardBody>
                  <div
                    className={`p-3 mt-n3 mx-n3 bg-success-subtle rounded-top`}
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h5 className="mb-0 fs-14">
                          <Link to="#" className="text-body">
                            Lintcloud It Service Pvt Ltd
                            <span className="badge border border-dark text-body ms-2">
                              HEADQUARTER
                            </span>
                          </Link>
                        </h5>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="d-flex gap-1 align-items-center my-n2">
                          <div className="form-check form-switch form-switch-success  ">
                            <Input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="enableEPF"
                              checked="true"
                            />
                            <Label className="form-check-label" for="enableEPF">
                              Active
                            </Label>
                          </div>
                          <a
                            //onClick={() => handleTaxEdit(item.slabs)}
                            className="text-primary d-inline-block edit-item-btn ms-2"
                            href="javascript:void(0)"
                          >
                            <i class="ri-pencil-fill fs-16"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-3">
                    <Row className="gy-3">
                      <Col xs={12}>
                        <div>
                          <p className="text-muted mb-1">Address </p>
                          <h5 className="fs-14">
                            694, C/10, SAHAR COMPLEX, NEAR MATHUMITHA HOSPITAL,
                            OPP BUS STAND, VALLIOOR - 627117
                          </h5>
                        </div>{" "}
                        <hr />
                      </Col>
                    </Row>
                    <Row className="gy-3">
                      <Col xs={2}>
                        <div>
                          <p className="text-muted mb-1">Employees</p>
                          <h5 className="fs-14">25</h5>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div>
                          <p className="text-muted mb-1">Timezone</p>
                          <h5 className="fs-14">GMT +05:30 Asia/Kolkata</h5>
                        </div>
                      </Col>
                      <Col xs={3}>
                        <div>
                          <p className="text-muted mb-1">Contact Number</p>
                          <h5 className="fs-14">+91 999999999</h5>
                        </div>
                      </Col>
                      <Col xs={3}>
                        <div>
                          <p className="text-muted mb-1">Contact Email</p>
                          <h5 className="fs-14">elan@lintcloud.com</h5>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default Branch;
