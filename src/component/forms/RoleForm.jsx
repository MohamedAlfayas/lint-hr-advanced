import React, { useEffect, useMemo, useState, useRef } from "react";
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
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css"
/>;

const RoleForm = () => {
  const [roleObj, setRoleObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const dispatch = useDispatch();

  const [activeTab, setactiveTab] = useState(1);
  const [activeArrowTab, setactiveArrowTab] = useState(4);
  const [activeVerticalTab, setactiveVerticalTab] = useState(1);
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
      Name: "Organization",
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
        {
          id: 4,
          notes: "User Can View All Departments",
          element: "per_department_view",
          dependency: [],
        },
        {
          id: 5,
          notes: "User Can Create New Departments",
          element: "per_department_create",
          dependency: ["per_department_view"],
        },
        {
          id: 6,
          notes: "User Can Edit Departments",
          element: "per_department_edit",
          dependency: ["per_department_view"],
        },
        {
          id: 7,
          notes: "User Can View All Roles",
          element: "per_role_view",
          dependency: [],
        },
        {
          id: 8,
          notes: "User Can Create New Role",
          element: "per_role_create",
          dependency: ["per_role_view"],
        },
        {
          id: 9,
          notes: "User Can Edit Role",
          element: "per_role_edit",
          dependency: ["per_role_view"],
        },
      ],
    },

    // {
    //   id: 2,
    //   Name: "Employee",
    //   priority: 3,
    //   note: "",
    //   icon: "mdi mdi-account-supervisor-outline",

    //   permission: [
    //     {
    //       id: 5,
    //       notes: "User Can View All Employee With in The Branches & Deartments",
    //       element: "per_employee_view",
    //       dependency: [],
    //     },
    //     {
    //       id: 6,
    //       notes: "User Can Create Employee With in The Branches & Deartments",
    //       element: "per_employee_create",
    //       dependency: ["per_employee_view"],
    //     },
    //     {
    //       id: 7,
    //       notes: "User Can Edit Employee With in The Branches & Deartments",
    //       element: "per_employee_edit",
    //       dependency: ["per_employee_view"],
    //     },
    //     {
    //       id: 8,
    //       notes:
    //         "User Can Deactivate Employee With in The Branches & Deartments",
    //       element: "per_employee_dectivate",
    //       dependency: ["per_employee_view"],
    //     },
    //     {
    //       id: 8,
    //       notes:
    //         "User Can Reset Employee Password With in The Branches & Deartments",
    //       element: "per_employee_password_reset",
    //       dependency: ["per_employee_view"],
    //     },
    //   ],
    // },

    // {
    //   id: 4,
    //   Name: "Holiday",
    //   priority: 2,
    //   note: "",
    //   permission: [
    //     {
    //       id: 17,
    //       notes: "User Can View All Holiday",
    //       element: "per_holiday_view",
    //       dependency: [],
    //     },
    //     {
    //       id: 18,
    //       notes: "User Can Create New Holiday",
    //       element: "per_holiday_create",
    //       dependency: ["per_holiday_view"],
    //     },
    //     {
    //       id: 19,
    //       notes: "User Can Edit Holiday",
    //       element: "per_holiday_edit",
    //       dependency: ["per_holiday_view"],
    //     },
    //     {
    //       id: 20,
    //       notes: "User Can Delete Holiday",
    //       element: "per_department_delete",
    //       dependency: ["per_holiday_view"],
    //     },
    //   ],
    // },
    {
      id: 2,
      Name: "Attendance",
      priority: 2,
      note: "",
      permission: [
        {
          id: 21,
          notes: "User Can Configure Attendance",
          element: "per_configure_attendance",
          dependency: [],
        },
        {
          id: 22,
          notes: "User Can Create Leave Types",
          element: "per_create_leave_type",
          dependency: [],
        },
        {
          id: 23,
          notes: "User Can Create/Delete Holidays",
          element: "per_holiday_create_delete",
          dependency: [],
        },
        {
          id: 24,
          notes: "User Can View Team Attendance",
          element: "per_view_team_attendance",
          dependency: [],
        },
        {
          id: 25,
          notes: "User Can View All Employee Attendance",
          element: "per_view_employee_attendance",
          dependency: [],
        },
        {
          id: 26,
          notes: "User Can Edit Paid/OT Hours",
          element: "per_edit_paid_ot_hours",
          dependency: ["per_view_team_attendance"],
        },
        {
          id: 27,
          notes: "User Can View Work Schedule",
          element: "per_ws_view",
          dependency: [],
        },
        {
          id: 28,
          notes: "Can Create Work Schedule",
          element: "per_ws_create",
          dependency: ["per_ws_view"],
        },
        {
          id: 29,
          notes: "Can Edit Work Schedule",
          element: "per_ws_edit",
          dependency: ["per_ws_view"],
        },
        {
          id: 30,
          notes: "Can Delete Work Schedule",
          element: "per_ws_delete",
          dependency: ["per_ws_view"],
        },
      ],
    },
    {
      id: 3,
      Name: "Payroll",
      note: "Payroll",
      priority: 3,
      permission: [
        {
          id: 31,
          notes: "User Can Configure Payroll",
          element: "per_configure_payroll",
          dependency: [],
        },
      ],
    },
    {
      id: 4,
      Name: "Customization",
      note: "Custom Fields",
      priority: 4,
      permission: [
        {
          id: 41,
          notes: "User Can Control Custom Fields",
          element: "per_create_custom_fields",
          dependency: [],
        },
      ],
    },

    {
      id: 5,
      Name: "Reports",
      note: "Reports",
      priority: 5,
      permission: [
        {
          id: 51,
          notes: "View Employee Reports",
          element: "per_employee_report",
          dependency: [],
        },
        {
          id: 52,
          notes: " View Branch Reports",
          element: "per_branch_report",
          dependency: [],
        },
        {
          id: 53,
          notes: "View Daily Attendance Reports",
          element: "per_attendance_report",
          dependency: [],
        },
        {
          id: 54,
          notes: "View Payroll Reports",
          element: "per_payroll_report",
          dependency: [],
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

      if (tab >= 1 && tab <= 5) {
        setactiveVerticalTab(tab);
        setPassedverticalSteps(modifiedSteps);
      }
    }
  }

  const maxTabs = rolelist.length;

  const isPreviousDisabled = activeVerticalTab === 1;
  const isNextDisabled = activeVerticalTab === maxTabs;
  const handlePrevious = () => {
    if (!isPreviousDisabled) {
      toggleVerticalTab(activeVerticalTab - 1);
    }
  };

  const handleNext = () => {
    if (!isNextDisabled) {
      toggleVerticalTab(activeVerticalTab + 1);
    }
  };

  const sectionRefs = rolelist.reduce((acc, role) => {
    acc[role.id] = useRef(null);
    return acc;
  }, {});

  const scrollToSection = (roleId) => {
    sectionRefs[roleId].current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const getCheckedCount = (roleId) => {
    const roleCheckboxes = checkboxes[roleId] || {};
    return Object.values(roleCheckboxes).filter(Boolean).length;
  };

  const [checkboxes, setCheckboxes] = useState({});
  const [disabledCheckboxes, setDisabledCheckboxes] = useState({});

  const checkDependencies = (role, element, isChecked) => {
    const handleDependencies = (dependencies, isChecked, prevCheckboxes) => {
      dependencies.forEach((dep) => {
        setCheckboxes((prevCheckboxes) => ({
          ...prevCheckboxes,
          [role.id]: {
            ...prevCheckboxes[role.id],
            [dep]: isChecked,
          },
        }));

        setDisabledCheckboxes((prevDisabledCheckboxes) => {
          const updatedDisabledCheckboxes = {
            ...prevDisabledCheckboxes,
            [role.id]: {
              ...prevDisabledCheckboxes[role.id],
              [dep]: isChecked,
            },
          };

          if (
            isChecked &&
            Object.values(checkboxes).every((checkedRole) =>
              dependencies.every((d) => !checkedRole[d])
            )
          ) {
            updatedDisabledCheckboxes[role.id][element] = false;
          }

          const depPermission = role.permission.find((p) => p.element === dep);
          if (depPermission && depPermission.dependency.length > 0) {
            handleDependencies(
              depPermission.dependency,
              isChecked,
              prevCheckboxes
            );
          }
          console.log("depPermission", depPermission);

          return updatedDisabledCheckboxes;
        });
      });
    };

    const selectedPermission = role.permission.find(
      (p) => p.element === element
    );

    if (selectedPermission && selectedPermission.dependency.length > 0) {
      const checkedCounts = { ...(disabledCheckboxes[role.id] || {}) };
      const prevCheckboxes = checkboxes;
      handleDependencies(
        selectedPermission.dependency,
        isChecked,
        checkedCounts,
        prevCheckboxes
      );
    }
  };

  const handleCheckboxChange = (roleId, element) => {
    setCheckboxes((prevCheckboxes) => {
      const updatedCheckboxes = {
        ...prevCheckboxes,
        [roleId]: {
          ...prevCheckboxes[roleId],
          [element]: !prevCheckboxes[roleId]?.[element],
        },
      };

      const role = rolelist.find((r) => r.id === roleId);

      if (updatedCheckboxes[roleId][element]) {
        checkDependencies(role, element, true);
      } else {
        checkDependencies(role, element, false);
      }

      return updatedCheckboxes;
    });
  };

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
                  placeholder="Enter Role"
                  // value={"HR"}
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
                  // value={
                  //   "HR can manage recruitment, then manage employee profiles, time-off, assigned checklists and reports."
                  // }
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
                {rolelist.map((role) => (
                  <NavItem key={role.id}>
                    <NavLink
                      href="#"
                      onClick={() => scrollToSection(role.id)}
                      style={{
                        display: "flex",
                        borderColor:
                          getCheckedCount(role.id) > 0 ? "#28a745" : "#ccc",
                      }}
                      className={`nav-link ${
                        checkboxes[role.id]?.selected ? "selected" : ""
                      }`}
                    >
                      <span className="step-title me-1">
                        <i
                          className={`ri ${
                            getCheckedCount(role.id) > 0
                              ? "ri-check-fill text-success"
                              : "ri-close-fill text-danger"
                          }`}
                        ></i>{" "}
                      </span>

                      <div>
                        <h5>{role.Name}</h5>
                      </div>

                      <Badge
                        pill
                        color="success"
                        className="position-absolute top-0 start-100 translate-middle"
                      >
                        {getCheckedCount(role.id)}/{role.permission.length}
                        <span className="visually-hidden">unread messages</span>
                      </Badge>
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>
            </Col>

            <Col lg={9}>
              <div className="px-lg-4">
                {rolelist.map((role) => (
                  <div key={role.id} ref={sectionRefs[role.id]}>
                    <div className="mt-4">
                      <h5>{role.Name}</h5>
                    </div>
                    <ListGroup>
                      {role.permission.map((permission) => (
                        <ListGroupItem key={permission.id}>
                          <label>
                            <Input
                              className="form-check-input me-1"
                              type="checkbox"
                              disabled={
                                disabledCheckboxes[role.id]?.[
                                  permission.element
                                ]
                              }
                              checked={
                                checkboxes[role.id]?.[permission.element] ||
                                false
                              }
                              onChange={() =>
                                handleCheckboxChange(
                                  role.id,
                                  permission.element
                                )
                              }
                            />
                            {permission.notes}
                          </label>
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </div>
                ))}
              </div>
            </Col>
            <Col lg={12} className="mt-5">
              <div className="text-end">
                <Button color="success" type="submit" className="btn-label">
                  {" "}
                  <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                  Save{" "}
                </Button>{" "}
              </div>
            </Col>
          </Row>
        </Col>
      </form>
    </React.Fragment>
  );
};

export default RoleForm;
