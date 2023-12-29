import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormFeedback,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";

import { Link } from "react-router-dom";
import { Api } from "../../common/api/Api";
import {
  addRole,
  editRole,
} from "../../redux/reducers/ChildReducer/RoleReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import { useFormik } from "formik";
import * as Yup from "yup";
import classnames from "classnames";

const RoleForm = () => {
  const [roleObj, setRoleObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const dispatch = useDispatch();

  const [activeTab, setactiveTab] = useState(1);
  const [activeArrowTab, setactiveArrowTab] = useState(4);
  const [activeVerticalTab, setactiveVerticalTab] = useState(7);
  const [progressbarvalue, setprogressbarvalue] = useState(0);
  const [passedSteps, setPassedSteps] = useState([1]);
  const [passedarrowSteps, setPassedarrowSteps] = useState([1]);
  const [passedverticalSteps, setPassedverticalSteps] = useState([1]);

  useEffect(() => {
    setRoleObj(form_obj);
  }, [form_obj]);

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: roleObj,
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Please Enter Role Name"),
    }),
    onSubmit: async (values) => {
      console.log("SUCCESSSS !!!! Formik Values = ", values);
      if (values.roles.length === 0) {
        toast.error("Please Choose Any Permission");
      } else {
        dispatch(setLoaderVisible(true));

        const Api = await PostApi("/role/create-role/", roleObj, false);
        console.log("API RES = ", Api);
        if (Api.status && Api.status === 200) {
          roleObj.id === 0
            ? dispatch(addRole(Api?.data.data))
            : dispatch(editRole(Api?.data?.data));
          dispatch(toggleRSBView(false));
          toast.success(Api?.data?.message);
        } else {
          toast.error(Api?.data?.message || Api?.data?.detail);
        }

        dispatch(setLoaderVisible(false));
      }
    },
  });

  const handleSubmit = async () => {
    console.log("role data = ", roleObj);
    if (roleObj.roles.length === 0) {
      window.alert("Please Choose Any Permission");
    } else {
      dispatch(setLoaderVisible(true));

      const Api = await PostApi("/role/create-role/", roleObj, false);
      console.log("API RES = ", Api);
      if (Api.status && Api.status === 200) {
        roleObj.id === 0
          ? dispatch(addRole(Api?.data.data))
          : dispatch(editRole(Api?.data?.data));
        dispatch(toggleRSBView(false));
        toast.success(Api?.data?.message);
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail);
      }

      dispatch(setLoaderVisible(false));
    }
  };

  const [rolelist, setListData] = useState([
    {
      id: 1,
      Name: "Organization Management",
      priority: 1,
      note: "Organization Full Access",
      icon: "mdi mdi-office-building-marker-outline",
      permission: [
        {
          id: 1,
          notes: "User Can View All Branch",
          element: "per_branch_view",
          dependency: [],
        },
        {
          id: 2,
          notes: "User Can Create New Branch",
          element: "per_branch_create",
          dependency: ["per_branch_view"],
        },
        {
          id: 3,
          notes: "User Can Edit Branch",
          element: "per_branch_edit",
          dependency: ["per_branch_view"],
        },
      ],
    },
    {
      id: 5,
      Name: "Department",
      priority: 2,
      note: "",
      icon: " mdi mdi-family-tree",
      permission: [
        {
          id: 21,
          notes: "User Can View All Departments",
          element: "per_department_view",
          dependency: [],
        },
        {
          id: 22,
          notes: "User Can Create New Departments",
          element: "per_department_create",
          dependency: ["per_department_view"],
        },
        {
          id: 23,
          notes: "User Can Edit Departments",
          element: "per_department_edit",
          dependency: ["per_department_view"],
        },
      ],
    },
    ,
    {
      id: 2,
      Name: "Roles",
      priority: 1,
      note: "",
      icon: "mdi mdi-security",

      permission: [
        {
          id: 9,
          notes: "User Can View All Roles",
          element: "per_role_view",
          dependency: [],
        },
        {
          id: 10,
          notes: "User Can Create New Role",
          element: "per_role_create",
          dependency: ["per_role_view"],
        },
        {
          id: 11,
          notes: "User Can Edit Role",
          element: "per_role_edit",
          dependency: ["per_role_view"],
        },
      ],
    },

    {
      id: 2,
      Name: "Employee",
      priority: 3,
      note: "",
      icon: "mdi mdi-account-supervisor-outline",

      permission: [
        {
          id: 5,
          notes: "User Can View All Employee With in The Branches & Deartments",
          element: "per_employee_view",
          dependency: [],
        },
        {
          id: 6,
          notes: "User Can Create Employee With in The Branches & Deartments",
          element: "per_employee_create",
          dependency: ["per_employee_view"],
        },
        {
          id: 7,
          notes: "User Can Edit Employee With in The Branches & Deartments",
          element: "per_employee_edit",
          dependency: ["per_employee_view"],
        },
        {
          id: 8,
          notes:
            "User Can Deactivate Employee With in The Branches & Deartments",
          element: "per_employee_dectivate",
          dependency: ["per_employee_view"],
        },
        {
          id: 8,
          notes:
            "User Can Reset Employee Password With in The Branches & Deartments",
          element: "per_employee_password_reset",
          dependency: ["per_employee_view"],
        },
      ],
    },
    {
      id: 3,
      Name: "Work_Schedule",
      priority: 1,
      note: "",
      icon: "mdi mdi-av-timer",

      permission: [
        {
          id: 13,
          notes: "Can View Work Schedule",
          element: "per_ws_view",
          dependency: [],
        },
        {
          id: 14,
          notes: "Can Create Work Schedule",
          element: "per_ws_create",
          dependency: ["per_ws_view"],
        },
        {
          id: 15,
          notes: "Can Edit Work Schedule",
          element: "per_ws_edit",
          dependency: ["per_ws_view"],
        },
        {
          id: 16,
          notes: "Can Delete Work Schedule",
          element: "per_ws_delete",
          dependency: ["per_ws_view"],
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
          dependency: [],
        },
        {
          id: 18,
          notes: "User Can Create New Holiday",
          element: "per_holiday_create",
          dependency: ["per_holiday_view"],
        },
        {
          id: 19,
          notes: "User Can Edit Holiday",
          element: "per_holiday_edit",
          dependency: ["per_holiday_view"],
        },
        {
          id: 20,
          notes: "User Can Delete Holiday",
          element: "per_department_delete",
          dependency: ["per_holiday_view"],
        },
      ],
    },
    {
      id: 4,
      Name: "Attendance",
      priority: 2,
      note: "",
      permission: [
        {
          id: 17,
          notes: "User Can Configure Attendance",
          element: "per_configure_attendance",
          dependency: [],
        },
        {
          id: 17,
          notes: "User Can Create Leave Types",
          element: "per_create_leave_type",
          dependency: [],
        },
        {
          id: 18,
          notes: "User Can Create/Delete Holidays",
          element: "per_holiday_create_delete",
          dependency: [],
        },
        {
          id: 18,
          notes: "User Can View Team Attendance",
          element: "per_view_team_attendance",
          dependency: [],
        },
        {
          id: 19,
          notes: "User Can View All Employee Attendance",
          element: "per_view_employee_attendance",
          dependency: [],
        },
        {
          id: 20,
          notes: "User Can Edit Paid/OT Hours",
          element: "per_edit_paid_ot_hours",
          dependency: ["per_view_team_attendance"],
        },
      ],
    },
    {
      id: 0,
      Name: "Customization",
      note: "Custom Fields",
      priority: 4,
      permission: [
        {
          id: 1,
          notes: "User Can Control Custom Fields",
          element: "per_create_custom_fields",
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

  const RibbonData = {
    1: {
      label: "Master",
      class: "warning",
    },
    2: {
      label: "Access",
      class: "info",
    },
    3: {
      label: "",
      class: "",
    },
    4: {
      label: "Report",
      class: "success",
    },
  };

  const handleCBChange = (elm, ck) => {
    const role_data = [...roleObj.roles];
    const filtered_role_data = ck
      ? [...role_data, elm]
      : role_data.filter((obj) => obj !== elm);
    setRoleObj({
      ...roleObj,
      roles: filtered_role_data,
    });
  };

  function toggleVerticalTab(tab) {
    if (activeVerticalTab !== tab) {
      var modifiedSteps = [...passedverticalSteps, tab];

      if (tab >= 7 && tab <= 15) {
        setactiveVerticalTab(tab);
        setPassedverticalSteps(modifiedSteps);
      }
    }
  }

  return (
    <React.Fragment>
      <form className="vertical-navs-step form-steps">
        <Row>
          <Col lg={6} xl={6} className="mb-2">
            <div>
              <Label htmlFor="roleName" className="form-label">
                Role Name
              </Label>
              <div className="form-icon right">
                <Input
                  type="text"
                  className="form-control form-control-icon"
                  id="roleName"
                  placeholder="New Role"
                  value={"HR"}
                />
                <i className="ri-building-2-line"></i>
              </div>
              <div id="passwordHelpBlock" className="form-text">
                Enter Your Role Name.
              </div>
            </div>
          </Col>

          <Col lg={6} xl={6} className="mb-2">
            <div>
              <Label htmlFor="Description" className="form-label">
                Description
              </Label>
              <div className="form-icon right">
                <Input
                  type="text"
                  className="form-control form-control-icon"
                  id="Description"
                  placeholder="Enter Description"
                  value={
                    "HR can manage recruitment, then manage employee profiles, time-off, assigned checklists and reports."
                  }
                />
                <i className="ri-building-2-line"></i>
              </div>
              <div id="passwordHelpBlock" className="form-text">
                Enter Description.
              </div>
            </div>
          </Col>
        </Row>
        <hr />

        <Col xl={12}>
          <Row className="gy-5">
            <Col lg={3} className="border-end">
              <Nav className="flex-column custom-nav nav-pills sticky-top">
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeVerticalTab === 7,
                      done: activeVerticalTab <= 15 && activeVerticalTab > 7,
                    })}
                    onClick={() => {
                      toggleVerticalTab(7);
                    }}
                  >
                    <span className="step-title me-1">
                      <i className="ri-close-circle-fill step-icon me-2"></i>
                    </span>
                    Organization
                  </NavLink>
                  <Badge
                    pill
                    color="success"
                    className="position-absolute top-0 start-100 translate-middle"
                  >
                    4/5
                    <span className="visually-hidden">unread messages</span>
                  </Badge>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeVerticalTab === 8,
                      done: activeVerticalTab <= 15 && activeVerticalTab >= 8,
                    })}
                    onClick={() => {
                      toggleVerticalTab(8);
                    }}
                  >
                    <span className="step-title me-2">
                      <i className="ri-close-circle-fill step-icon me-2"></i>
                    </span>
                    Department
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeVerticalTab === 9,
                      done: activeVerticalTab <= 15 && activeVerticalTab >= 9,
                    })}
                    onClick={() => {
                      toggleVerticalTab(9);
                    }}
                  >
                    <span className="step-title me-2">
                      <i className="ri-close-circle-fill step-icon me-2"></i>
                    </span>
                    Roles
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeVerticalTab === 10,
                      done: activeVerticalTab <= 15 && activeVerticalTab >= 10,
                    })}
                    onClick={() => {
                      toggleVerticalTab(10);
                    }}
                  >
                    <span className="step-title me-2">
                      <i className="ri-close-circle-fill step-icon me-2"></i>
                    </span>
                    Employee
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeVerticalTab === 11,
                      done: activeVerticalTab <= 15 && activeVerticalTab >= 11,
                    })}
                    onClick={() => {
                      toggleVerticalTab(11);
                    }}
                  >
                    <span className="step-title me-2">
                      <i className="ri-close-circle-fill step-icon me-2"></i>
                    </span>
                    Work Schedule
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeVerticalTab === 12,
                      done: activeVerticalTab <= 15 && activeVerticalTab >= 12,
                    })}
                    onClick={() => {
                      toggleVerticalTab(12);
                    }}
                  >
                    <span className="step-title me-2">
                      <i className="ri-close-circle-fill step-icon me-2"></i>
                    </span>
                    Holiday
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeVerticalTab === 13,
                      done: activeVerticalTab <= 15 && activeVerticalTab >= 13,
                    })}
                    onClick={() => {
                      toggleVerticalTab(13);
                    }}
                  >
                    <span className="step-title me-2">
                      <i className="ri-close-circle-fill step-icon me-2"></i>
                    </span>
                    Attendance
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeVerticalTab === 14,
                      done: activeVerticalTab <= 15 && activeVerticalTab >= 14,
                    })}
                    onClick={() => {
                      toggleVerticalTab(14);
                    }}
                  >
                    <span className="step-title me-2">
                      <i className="ri-close-circle-fill step-icon me-2"></i>
                    </span>
                    Customization
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeVerticalTab === 15,
                      done: activeVerticalTab <= 15 && activeVerticalTab >= 15,
                    })}
                    onClick={() => {
                      toggleVerticalTab(15);
                    }}
                  >
                    <span className="step-title me-2">
                      <i className="ri-close-circle-fill step-icon me-2"></i>
                    </span>
                    Reports
                  </NavLink>
                </NavItem>
              </Nav>
            </Col>
            <Col lg={9}>
              <div className="px-lg-4">
                <TabContent activeTab={activeVerticalTab}>
                  <TabPane tabId={7}>
                    <div>
                      <h5>Organization Management</h5>
                      <p className="text-muted">Organization Full Access</p>
                    </div>
                    <ListGroup>
                      <ListGroupItem tag="label">
                        <Input
                          className="form-check-input me-1"
                          type="checkbox"
                          value=""
                        />
                        User Can View All Branch
                      </ListGroupItem>
                      <ListGroupItem tag="label">
                        <Input
                          className="form-check-input me-1"
                          type="checkbox"
                          value=""
                          defaultChecked
                        />
                        Delivery Error
                      </ListGroupItem>
                      <ListGroupItem tag="label">
                        <Input
                          className="form-check-input me-1"
                          type="checkbox"
                          value=""
                          defaultChecked
                        />
                        User Can Create New Branch
                      </ListGroupItem>
                      <ListGroupItem tag="label">
                        <Input
                          className="form-check-input me-1"
                          type="checkbox"
                          value=""
                        />
                        User Can Edit Branch
                      </ListGroupItem>
                    </ListGroup>

                    <div className="d-flex align-items-start gap-3 mt-4">
                      <button
                        type="button"
                        className="btn btn-success btn-label right ms-auto nexttab nexttab"
                        onClick={() => {
                          toggleVerticalTab(activeVerticalTab + 1);
                        }}
                      >
                        <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                        Go to Department
                      </button>
                    </div>
                  </TabPane>

                  <TabPane tabId={8}>
                    <div>
                      <h5>Department Management</h5>
                      <p className="text-muted"></p>
                    </div>

                    <ListGroup>
                      <ListGroupItem tag="label">
                        <Input
                          className="form-check-input me-1"
                          type="checkbox"
                          value=""
                        />
                        User Can View All Branch
                      </ListGroupItem>
                      <ListGroupItem tag="label">
                        <Input
                          className="form-check-input me-1"
                          type="checkbox"
                          value=""
                          defaultChecked
                        />
                        Delivery Error
                      </ListGroupItem>
                      <ListGroupItem tag="label">
                        <Input
                          className="form-check-input me-1"
                          type="checkbox"
                          value=""
                          defaultChecked
                        />
                        User Can Create New Branch
                      </ListGroupItem>
                      <ListGroupItem tag="label">
                        <Input
                          className="form-check-input me-1"
                          type="checkbox"
                          value=""
                        />
                        User Can Edit Branch
                      </ListGroupItem>
                    </ListGroup>

                    <div className="d-flex align-items-start gap-3 mt-4">
                      <button
                        type="button"
                        className="btn btn-light btn-label previestab"
                        onClick={() => {
                          toggleVerticalTab(activeVerticalTab - 1);
                        }}
                      >
                        <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                        Back to Organization
                      </button>
                      <button
                        type="button"
                        className="btn btn-success btn-label right ms-auto nexttab"
                        onClick={() => {
                          toggleVerticalTab(activeVerticalTab + 1);
                        }}
                      >
                        <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                        Go to Roles
                      </button>
                    </div>
                  </TabPane>

                  <TabPane tabId={9}>
                    <div>
                      <h5>Payment</h5>
                      <p className="text-muted">Fill all information below</p>
                    </div>

                    <div>
                      <div className="my-3">
                        <div className="form-check form-check-inline">
                          <Input
                            id="credit"
                            name="paymentMethod"
                            type="radio"
                            className="form-check-input"
                            defaultChecked
                            required
                          />
                          <Label className="form-check-label" htmlFor="credit">
                            Credit card
                          </Label>
                        </div>
                        <div className="form-check form-check-inline">
                          <Input
                            id="debit"
                            name="paymentMethod"
                            type="radio"
                            className="form-check-input"
                            required
                          />
                          <Label className="form-check-label" htmlFor="debit">
                            Debit card
                          </Label>
                        </div>
                        <div className="form-check form-check-inline">
                          <Input
                            id="paypal"
                            name="paymentMethod"
                            type="radio"
                            className="form-check-input"
                            required
                          />
                          <Label className="form-check-label" htmlFor="paypal">
                            PayPal
                          </Label>
                        </div>
                      </div>

                      <Row className="gy-3">
                        <Col md={12}>
                          <Label htmlFor="cc-name" className="form-label">
                            Name on card
                          </Label>
                          <Input
                            type="text"
                            className="form-control"
                            id="cc-name"
                            placeholder=""
                            required
                          />
                          <small className="text-muted">
                            Full name as displayed on card
                          </small>
                          <div className="invalid-feedback">
                            Name on card is required
                          </div>
                        </Col>

                        <Col md={6}>
                          <Label htmlFor="cc-number" className="form-label">
                            Credit card number
                          </Label>
                          <Input
                            type="text"
                            className="form-control"
                            id="cc-number"
                            placeholder=""
                            required
                          />
                          <div className="invalid-feedback">
                            Credit card number is required
                          </div>
                        </Col>

                        <Col md={3}>
                          <Label htmlFor="cc-expiration" className="form-label">
                            Expiration
                          </Label>
                          <Input
                            type="text"
                            className="form-control"
                            id="cc-expiration"
                            placeholder=""
                            required
                          />
                          <div className="invalid-feedback">
                            Expiration date required
                          </div>
                        </Col>

                        <Col md={3}>
                          <Label htmlFor="cc-cvv" className="form-label">
                            CVV
                          </Label>
                          <Input
                            type="text"
                            className="form-control"
                            id="cc-cvv"
                            placeholder=""
                            required
                          />
                          <div className="invalid-feedback">
                            Security code required
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <div className="d-flex align-items-start gap-3 mt-4">
                      <button
                        type="button"
                        className="btn btn-light btn-label previestab"
                        onClick={() => {
                          toggleVerticalTab(activeVerticalTab - 1);
                        }}
                      >
                        <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                        Back to Shipping Info
                      </button>
                      <button
                        type="button"
                        className="btn btn-success btn-label right ms-auto nexttab"
                        onClick={() => {
                          toggleVerticalTab(activeVerticalTab + 1);
                        }}
                      >
                        <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>{" "}
                        Order Complete
                      </button>
                    </div>
                  </TabPane>

                  <TabPane tabId={10}>
                    <div className="text-center pt-4 pb-2">
                      <div className="mb-4">
                        <lord-icon
                          src="https://cdn.lordicon.com/lupuorrc.json"
                          trigger="loop"
                          colors="primary:#0ab39c,secondary:#405189"
                          style={{ width: "120px", height: "120px" }}
                        ></lord-icon>
                      </div>
                      <h5>Your Order is Completed !</h5>
                      <p className="text-muted">
                        You Will receive an order confirmation email with
                        details of your order.
                      </p>
                    </div>
                  </TabPane>

                  <TabPane tabId={11}>
                    <div className="text-center pt-4 pb-2">
                      <div className="mb-4">
                        <lord-icon
                          src="https://cdn.lordicon.com/lupuorrc.json"
                          trigger="loop"
                          colors="primary:#0ab39c,secondary:#405189"
                          style={{ width: "120px", height: "120px" }}
                        ></lord-icon>
                      </div>
                      <h5>Your Order is Completed !</h5>
                      <p className="text-muted">
                        You Will receive an order confirmation email with
                        details of your order.
                      </p>
                    </div>
                  </TabPane>

                  <TabPane tabId={12}>
                    <div className="text-center pt-4 pb-2">
                      <div className="mb-4">
                        <lord-icon
                          src="https://cdn.lordicon.com/lupuorrc.json"
                          trigger="loop"
                          colors="primary:#0ab39c,secondary:#405189"
                          style={{ width: "120px", height: "120px" }}
                        ></lord-icon>
                      </div>
                      <h5>Your Order is Completed !</h5>
                      <p className="text-muted">
                        You Will receive an order confirmation email with
                        details of your order.
                      </p>
                    </div>
                  </TabPane>

                  <TabPane tabId={13}>
                    <div className="text-center pt-4 pb-2">
                      <div className="mb-4">
                        <lord-icon
                          src="https://cdn.lordicon.com/lupuorrc.json"
                          trigger="loop"
                          colors="primary:#0ab39c,secondary:#405189"
                          style={{ width: "120px", height: "120px" }}
                        ></lord-icon>
                      </div>
                      <h5>Your Order is Completed !</h5>
                      <p className="text-muted">
                        You Will receive an order confirmation email with
                        details of your order.
                      </p>
                    </div>
                  </TabPane>

                  <TabPane tabId={14}>
                    <div className="text-center pt-4 pb-2">
                      <div className="mb-4">
                        <lord-icon
                          src="https://cdn.lordicon.com/lupuorrc.json"
                          trigger="loop"
                          colors="primary:#0ab39c,secondary:#405189"
                          style={{ width: "120px", height: "120px" }}
                        ></lord-icon>
                      </div>
                      <h5>Your Order is Completed !</h5>
                      <p className="text-muted">
                        You Will receive an order confirmation email with
                        details of your order.
                      </p>
                    </div>
                  </TabPane>

                  <TabPane tabId={15}>
                    <div className="text-center pt-4 pb-2">
                      <div className="mb-4">
                        <lord-icon
                          src="https://cdn.lordicon.com/lupuorrc.json"
                          trigger="loop"
                          colors="primary:#0ab39c,secondary:#405189"
                          style={{ width: "120px", height: "120px" }}
                        ></lord-icon>
                      </div>
                      <h5>Your Order is Completed !</h5>
                      <p className="text-muted">
                        You Will receive an order confirmation email with
                        details of your order.
                      </p>
                    </div>
                  </TabPane>

                  <TabPane tabId={16}>
                    <div className="text-center pt-4 pb-2">
                      <div className="mb-4">
                        <lord-icon
                          src="https://cdn.lordicon.com/lupuorrc.json"
                          trigger="loop"
                          colors="primary:#0ab39c,secondary:#405189"
                          style={{ width: "120px", height: "120px" }}
                        ></lord-icon>
                      </div>
                      <h5>Your Order is Completed !</h5>
                      <p className="text-muted">
                        You Will receive an order confirmation email with
                        details of your order.
                      </p>
                    </div>
                  </TabPane>
                </TabContent>
              </div>
            </Col>
          </Row>
        </Col>
      </form>
    </React.Fragment>
  );
};

export default RoleForm;
