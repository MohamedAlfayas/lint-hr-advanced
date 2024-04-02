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
  Form,
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
import { default_roles_list } from "../../common/constant/Constants";
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css"
/>;

const RoleForm = () => {
  const [roleObj, setRoleObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const dispatch = useDispatch();

  const [activeVerticalTab, setactiveVerticalTab] = useState(1);
  const [passedverticalSteps, setPassedverticalSteps] = useState([1]);
  const inputRef = useRef();

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
      let total_roles_checked = 0;

      roleObj.roles_list.map((d) => {
        let this_dep_role = d.permission.filter(
          (p) => p.checked === true
        ).length;
        total_roles_checked += this_dep_role;
      });

      if (total_roles_checked === 0) {
        toast.error("Select Atleast One Permission");
      } else {
        dispatch(setLoaderVisible(true));

        const Api = await PostApi("/role/create-role/", roleObj, false);
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

  useEffect(() => {
    if (
      FormikForm.submitCount > 0 &&
      Object.keys(FormikForm.errors).length > 0
    ) {
      const firstErrorField = Object.keys(FormikForm.errors)[0];
      FormikForm.setFieldTouched(firstErrorField);
      const errorField = document.querySelector(`[name=${firstErrorField}]`);
      if (errorField) {
        errorField.focus();

        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
  }, [
    FormikForm.submitCount,
    FormikForm.errors,
    FormikForm.setFieldTouched,
    inputRef,
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

  const [focusedRole, setFocusedRole] = useState(null);
  const [focusedPermission, setFocusedPermission] = useState(null);
  const handleNavLinkClick = (role) => {
    setFocusedRole(role.id);
    setFocusedPermission(
      role.permission.length > 0 ? role.permission[0].id : null
    );
  };
  useEffect(() => {
    if (focusedRole !== null && focusedPermission !== null) {
      const listGroupItem = document.getElementById(
        `permission_${focusedRole}_${focusedPermission}`
      );
      if (listGroupItem) {
        listGroupItem.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [focusedPermission, focusedRole]);

  const getCheckedCount = (role_id) => {
    let this_permission_list = !!roleObj?.roles_list
      ? roleObj?.roles_list?.find((d) => d.id === role_id).permission
      : [];

    return this_permission_list.filter((d) => d.checked === true).length;
  };

  const handleCheckboxChange = (role_id, perm_id) => {
    let roles_list = [...roleObj?.roles_list];

    let updated_roles_list = roles_list.map((d) => {
      if (d.id === role_id) {
        let this_perm_list = [...d?.permission];
        let result = [];
        let dep_id = [];
        let status_to_be_changed = false;

        result = this_perm_list.map((obj) => {
          if (obj.id === perm_id) {
            status_to_be_changed = !obj.checked;
            let dep_list = obj.dependency;
            dep_id = dep_list.map(
              (d) => this_perm_list.find((dl) => dl.element === d).id
            );
            return {
              ...obj,
              checked: !obj.checked,
            };
          } else {
            return obj;
          }
        });

        let final_result = result.map((res) => {
          if (dep_id.includes(res?.id)) {
            let disabled = false;
            if (status_to_be_changed === true) {
              disabled = true;
            } else {
              let has_active_dep = false;
              result.map((r) => {
                if (r.dependency.includes(res?.element) && r.checked === true) {
                  has_active_dep = true;
                }
              });
              if (has_active_dep === true) {
                disabled = true;
                status_to_be_changed = true;
              } else {
                disabled = false;
                status_to_be_changed = false;
              }
            }
            return {
              ...res,
              checked: status_to_be_changed,
              disabled: disabled,
            };
          } else {
            return res;
          }
        });

        return {
          ...d,
          permission: final_result,
        };
      } else {
        return d;
      }
    });

    setRoleObj({
      ...roleObj,
      roles_list: updated_roles_list,
    });
  };

  return (
    <React.Fragment>
      <Form
        onSubmit={FormikForm.handleSubmit}
        className="vertical-navs-step form-steps"
      >
        <Row>
          <Col lg={6} xl={6} className="mb-2">
            <div>
              <Label htmlFor="roleName" className="form-label">
                Role Name
              </Label>
              <div className="form-icon right">
                <Input
                  type="text"
                  name="name"
                  className="form-control form-control-icon"
                  id="roleName"
                  innerRef={inputRef}
                  placeholder="Enter Role"
                  value={roleObj?.name || ""}
                  onChange={(e) =>
                    setRoleObj({ ...roleObj, name: e.target.value })
                  }
                  // value={"HR"}
                  invalid={
                    FormikForm.touched.name && FormikForm.errors.name
                      ? true
                      : false
                  }
                />
                {!FormikForm.touched.name && !FormikForm.errors.name && (
                  <i className="ri-building-2-line"></i>
                )}
                {FormikForm.touched.name && FormikForm.errors.name ? (
                  <FormFeedback type="invalid">
                    {FormikForm.errors.name}
                  </FormFeedback>
                ) : null}
              </div>
              {!FormikForm.errors.name && (
                <div id="passwordHelpBlock" className="form-text">
                  Enter Your Role Name.
                </div>
              )}
            </div>
          </Col>

          <Col lg={6} xl={6} className="mb-2">
            <div>
              <Label htmlFor="description" className="form-label">
                Description
              </Label>
              <div className="form-icon right">
                <Input
                  type="text"
                  name="description"
                  className="form-control form-control-icon"
                  id="description"
                  placeholder="Enter Description"
                  value={roleObj?.description || ""}
                  onChange={(e) =>
                    setRoleObj({ ...roleObj, description: e.target.value })
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
                <div className="mt-1"></div>
                {!!roleObj?.roles_list &&
                  roleObj?.roles_list.map((role) => (
                    <NavItem key={role.id}>
                      <NavLink
                        href="#"
                        onClick={() => handleNavLinkClick(role)}
                        className={`nav-link ${
                          getCheckedCount(role.id) > 0 ? "active done" : ""
                        }`}
                      >
                        <div>
                          <span class="step-title me-2">
                            <i class="ri-close-circle-fill step-icon me-2"></i>
                            {role.Name}
                          </span>
                        </div>

                        <Badge
                          pill
                          color="success"
                          className="position-absolute top-0 start-100 translate-middle"
                        >
                          {getCheckedCount(role.id)} / {role.permission.length}
                          <span className="visually-hidden">
                            unread messages
                          </span>
                        </Badge>
                      </NavLink>
                    </NavItem>
                  ))}
              </Nav>
            </Col>

            <Col lg={9}>
              <div className="px-lg-4">
                {!!roleObj?.roles_list &&
                  roleObj?.roles_list.map((role) => (
                    <div key={role.id}>
                      <div className="mt-4">
                        <h5>{role.Name}</h5>
                      </div>
                      <ListGroup>
                        {role.permission.map((permission) => (
                          <ListGroupItem
                            key={permission.id}
                            id={`permission_${role.id}_${permission.id}`}
                            className={
                              focusedRole === role.id &&
                              focusedPermission === permission.id
                                ? "focused"
                                : ""
                            }
                          >
                            <label>
                              <Input
                                className="form-check-input me-1"
                                type="checkbox"
                                disabled={permission?.disabled}
                                checked={permission?.checked}
                                onChange={() =>
                                  handleCheckboxChange(role.id, permission.id)
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
            <Col lg={12} className="mt-5 ">
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
      </Form>
    </React.Fragment>
  );
};

export default RoleForm;
