import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
  FormFeedback,
  Input,
  Row,
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

const RoleForm = () => {
  const [roleObj, setRoleObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const dispatch = useDispatch();

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
      Name: "Company",
      priority: 1,
      note: "COmpany FUll Access",
      permission: [
        {
          id: 1,
          notes: "User Can View All Role",
          element: "per_company_view",
        },
        {
          id: 2,
          notes: "User Can Create New Role",
          element: "per_company_create",
        },
        {
          id: 3,
          notes: "User Can Edit Role",
          element: "per_company_edit",
        },
        {
          id: 4,
          notes: "User Can Delete Role",
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

  return (
    <React.Fragment>
      <Row className="g-4 mb-3">
        {/* <Col md={2}>
          <label htmlFor="roleName" className="form-label">
            Role Name
          </label>
        </Col> */}
        <Col md={10}>
          <Input
            type="text"
            name="name"
            className="form-control"
            id="roleName"
            placeholder="Enter Role Name"
            required
            value={roleObj.name || ""}
            onChange={(e) => setRoleObj({ ...roleObj, name: e.target.value })}
            invalid={
              FormikForm.touched.name && FormikForm.errors.name ? true : false
            }
          />
          {FormikForm.touched.name && FormikForm.errors.name ? (
            <FormFeedback type="invalid">{FormikForm.errors.name}</FormFeedback>
          ) : null}
          {!FormikForm.errors.name && (
            <div id="roleNameHelpBlock" className="form-text mb-3">
              Enter Role Name.
            </div>
          )}
        </Col>
        <Col md={2}>
          <Button
            color="success"
            className="btn-label"
            onClick={FormikForm.handleSubmit}
          >
            {" "}
            <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
            {roleObj.id === 0 ? "Create" : "Save"}{" "}
          </Button>{" "}
        </Col>
        {/* <div className="col-sm">
          <div className="d-flex">
            
            
          </div>
        </div>
        <div className="col-sm-auto">
          <div>
            <div className="text-end">
              
            </div>
          </div>
        </div> */}
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
            <React.Fragment key={idx}>
              <Card className="team-box ribbon-box">
                <CardBody className="px-4">
                  <div
                    className={`ribbon-two ribbon-two-${
                      RibbonData[data.priority].class
                    }`}
                  >
                    <span>{RibbonData[data.priority].label}</span>
                  </div>
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
                        {data.permission.length &&
                          data.permission.map((obj) => (
                            <Col
                              xs={3}
                              className="border-end border-end-dashed"
                            >
                              <div
                                className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                                dir="ltr"
                              >
                                <Input
                                  id={obj.element}
                                  name={obj.element}
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={
                                    "roles" in roleObj &&
                                    roleObj.roles.includes(obj.element)
                                      ? true
                                      : false
                                  }
                                  onChange={(e) =>
                                    handleCBChange(
                                      obj.element,
                                      e.target.checked
                                    )
                                  }
                                />
                              </div>
                              <p className="text-muted mb-0">{obj.notes}</p>
                            </Col>
                          ))}
                      </Row>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </React.Fragment>
          ))}
        </div>
      </Row>
    </React.Fragment>
  );
};

export default RoleForm;
