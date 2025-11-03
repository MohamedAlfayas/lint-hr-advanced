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
import { default_roles_list } from "../../common/constant/RoleConstants";
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
      let total_roles_checked = roleObj.roles_list.length;

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
    const thisPermissionList =
      default_roles_list.find((d) => d.id === parseInt(role_id)).permission ||
      [];
    const checkedRoles = !!roleObj?.roles_list ? roleObj?.roles_list : [];
    const selectedAccessLength = thisPermissionList.filter((t) =>
      checkedRoles.includes(String(t.role_uuid))
    ).length;
    return selectedAccessLength;
  };

  const handleCheckboxChange = (e, perm) => {
    const { checked } = e.target;

    if (checked === true) {
      let updated_roles_list = [...roleObj?.roles_list, perm?.role_uuid];

      let this_dependency_element_list = perm?.dependency_to_element_list;

      for (var i = 0; i < this_dependency_element_list.length; i++) {
        for (var j = 0; j < default_roles_list.length; j++) {
          let this_permission_list = default_roles_list[j].permission || [];
          let this_role_uuid = this_permission_list.find(
            (r) => r.element === this_dependency_element_list[i]
          );
          if (!!this_role_uuid) {
            if (
              updated_roles_list.includes(this_role_uuid?.role_uuid) === false
            ) {
              updated_roles_list.push(this_role_uuid?.role_uuid);
            }
          }
        }
      }

      setRoleObj({
        ...roleObj,
        roles_list: updated_roles_list,
      });
    } else {
      let updated_roles_list = [...roleObj?.roles_list].filter(
        (d) => d !== perm.role_uuid
      );
      setRoleObj({
        ...roleObj,
        roles_list: updated_roles_list,
      });
    }
  };

  // const handleCheckboxChange = (e, perm, role_id) => {
  //   const { checked } = e.target;

  //   if (checked === true) {
  //     let updated_roles_list = [...roleObj?.roles_list, perm?.role_uuid];

  //     let this_permission_list =
  //       default_roles_list?.find((d) => d.id === role_id).permission || [];

  //     let this_dependency_element_list = perm?.dependency_to_element_list;

  //     for (var i = 0; i < this_dependency_element_list.length; i++) {
  //       let this_role_uuid = this_permission_list.find(
  //         (p) => p.element === this_dependency_element_list[i]
  //       ).role_uuid;

  //       if (!!this_role_uuid) {
  //         if (updated_roles_list.includes(this_role_uuid) === false) {
  //           updated_roles_list.push(this_role_uuid);
  //         }
  //       }
  //     }

  //     setRoleObj({
  //       ...roleObj,
  //       roles_list: updated_roles_list,
  //     });
  //   } else {
  //     let updated_roles_list = [...roleObj?.roles_list].filter(
  //       (d) => d !== perm.role_uuid
  //     );
  //     setRoleObj({
  //       ...roleObj,
  //       roles_list: updated_roles_list,
  //     });
  //   }
  // };

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
                {!!default_roles_list &&
                  default_roles_list.map((role) => (
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
                            {role.name}
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
                {!!default_roles_list &&
                  default_roles_list.map((role_list) => (
                    <div key={role_list.id}>
                      <div className="mt-4">
                        <h5>{role_list.name}</h5>
                      </div>
                      <ListGroup>
                        {role_list.permission.map((role) => (
                          <ListGroupItem
                            key={role.id}
                            id={`permission_${role_list.id}_${role.id}`}
                            className={
                              focusedRole === role_list.id &&
                              focusedPermission === role.id
                                ? "focused"
                                : ""
                            }
                          >
                            <label>
                              <Input
                                className="form-check-input me-1"
                                type="checkbox"
                                disabled={
                                  !!roleObj?.roles_list
                                    ? roleObj?.is_admin === true
                                      ? true
                                      : (role?.dependency_for_uuid_list).some(
                                          (d) => roleObj?.roles_list.includes(d)
                                        )
                                    : false
                                }
                                checked={
                                  !!roleObj?.roles_list
                                    ? roleObj?.is_admin === true
                                      ? true
                                      : roleObj?.roles_list.includes(
                                          role?.role_uuid
                                        )
                                      ? true
                                      : false
                                    : false
                                }
                                onChange={(e) => handleCheckboxChange(e, role)}
                                // onChange={(e) =>
                                //   handleCheckboxChange(e, role, role_list.id)
                                // }
                              />
                              {role.notes}
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
