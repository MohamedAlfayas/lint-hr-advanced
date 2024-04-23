import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import { OrganizationChart } from "primereact/organizationchart";
import { useDispatch, useSelector } from "react-redux";
import {
  setDepartmentData,
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { Link } from "react-router-dom";

// Prime React Css
import "primereact/resources/themes/lara-light-indigo/theme.css";

// Prime React Minified Css
import "primereact/resources/primereact.min.css";

import avatar1 from "../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import OrgModal from "./common/OrgModal";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { setDepartmentDetails } from "../../redux/reducers/ChildReducer/DepartmentReducer";
import {
  CREATE_DEPARTMENT_ACCESS_KEY,
  EDIT_DEPARTMENT_ACCESS_KEY,
  department_component_name,
} from "../../common/constant/Constants";
import { CheckRoleAccess } from "../../common/js/CheckRoleAccess";

const DepartmentsTab = () => {
  const EmployeeData = GetLocalStorageData("employee");

  const dispatch = useDispatch();

  const newDepObj = useMemo(() => {
    return {
      id: 0,
      name: "",
      description: "",
      is_location_required: true,
      pid: 0,
      child_id_list: [],
    };
  }, []);

  const handleDepartmentCreateOrEdit = ($id, obj) => {
    const depObj = $id === 0 ? newDepObj : obj;
    dispatch(setFormTitle("Departments"));
    dispatch(setFormObj(depObj));
    dispatch(setFormWidthPercentage("30%"));
    dispatch(setComponentToShow("department"));
    dispatch(toggleRSBView(true));
  };

  const { department_data } = useSelector((state) => state.DepartmentReducer);

  const [showCreateBtn, setShowCreateBtn] = useState(false);
  const [showEditBtn, setShowEditBtn] = useState(false);

  useEffect(() => {
    setShowCreateBtn(CheckRoleAccess(CREATE_DEPARTMENT_ACCESS_KEY));
    setShowEditBtn(CheckRoleAccess(EDIT_DEPARTMENT_ACCESS_KEY));

    dispatch(
      setDepartmentDetails(GetLocalStorageData("department_details") || [])
    );
  }, []);

  const [showOrgModal, setShowOrgModal] = useState(false);
  function toggleOrgModal() {
    setShowOrgModal(!showOrgModal);
  }

  const [departmentId, setDepartmentId] = useState(0);
  const [departmentName, setDepartmentName] = useState(0);

  const nodeTemplate1 = (node) => {
    if (true) {
      let emp_list_for_this_department =
        EmployeeData.filter((d) =>
          d.primary_department_id_list.includes(node.id)
        ) || [];

      return (
        <Col xxl={12} lg={12}>
          <div className="border rounded border-dashed p-2">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1 ms-2 overflow-hidden">
                <h5 className="fs-13 mb-1">
                  <Link
                    onClick={() => {
                      toggleOrgModal();
                      setDepartmentId(node.id);
                      setDepartmentName(node.name);
                    }}
                    className="text-body  text-truncate d-block"
                    style={{ width: "100px" }}
                  >
                    {node.label}
                  </Link>
                </h5>
                <div>
                  <div className="avatar-group">
                    {emp_list_for_this_department
                      .slice(0, 2)
                      .map((item, key) => (
                        <React.Fragment key={key}>
                          {item.profile_url ? (
                            <div className="avatar-group-item">
                              <Link to="#" className="d-inline-block">
                                <div className="d-flex gap-2 align-items-center">
                                  <div className="flex-shrink-0">
                                    <img
                                      src={item.profile_url}
                                      alt=""
                                      className="avatar-xs rounded-circle acitivity-avatar"
                                      style={{ objectFit: "cover" }}
                                      data-bs-toggle="tooltip"
                                      title={item.fname}
                                    />
                                  </div>
                                </div>
                              </Link>
                            </div>
                          ) : (
                            <div className="avatar-group-item">
                              <Link to="#">
                                <div className="d-flex gap-2 align-items-center">
                                  <div className="flex-shrink-0">
                                    <div
                                      className="avatar-xs rounded-circle acitivity-avatar"
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        background: "#0ab39c",
                                      }}
                                      data-bs-toggle="tooltip"
                                      title={item.fname}
                                    >
                                      <span
                                        className="first_letter"
                                        style={{ color: "white" }}
                                      >
                                        {item.fname.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    {emp_list_for_this_department.length > 2 && (
                      <React.Fragment>
                        <div className="avatar-group-item">
                          <Link to="#">
                            <div className="d-flex gap-2 align-items-center">
                              <div className="flex-shrink-0">
                                <div
                                  className="avatar-xs rounded-circle acitivity-avatar bg-info"
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  data-bs-toggle="tooltip"
                                  title={emp_list_for_this_department.length}
                                >
                                  <span
                                    className="first_letter"
                                    style={{ color: "white" }}
                                  >
                                    +{""}
                                    {emp_list_for_this_department.length - 2}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 ms-1">
                <div className="d-flex gap-1">
                  <button
                    onClick={() => {
                      toggleOrgModal();
                      setDepartmentId(node.id);
                      setDepartmentName(node.name);
                    }}
                    type="button"
                    className="btn btn-icon text-muted btn-sm fs-18"
                  >
                    <i className="ri-eye-line"></i>
                  </button>
                  {showEditBtn && (
                    <button
                      onClick={() =>
                        handleDepartmentCreateOrEdit(node.id, node)
                      }
                      type="button"
                      className="btn btn-icon text-muted btn-sm fs-18"
                    >
                      <i className="ri-pencil-fill"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Col>
      );
    }
  };

  return (
    <React.Fragment>
      <Card>
        <CardHeader>
          {showCreateBtn === true && (
            <span className="float-end">
              <button
                type="button"
                className="btn btn-success add-btn"
                id="create-btn"
                style={{ textTransform: "capitalize" }}
                onClick={() => {
                  handleDepartmentCreateOrEdit(0);
                }}
              >
                <i className="ri-add-line align-bottom me-1"></i>New Department{" "}
              </button>
            </span>
          )}
          <h5 className="card-title">Department</h5>
        </CardHeader>
        <CardBody>
          <div className="card overflow-x-auto">
            {department_data.length ? (
              <OrganizationChart
                value={department_data}
                nodeTemplate={nodeTemplate1}
              />
            ) : (
              <React.Fragment>
                <div className="text-center">
                  <h2>No Data</h2>
                </div>
              </React.Fragment>
            )}
          </div>
        </CardBody>
      </Card>

      <OrgModal
        showOrgModal={showOrgModal}
        toggleOrgModal={toggleOrgModal}
        departmentId={departmentId}
        organizationName={departmentName}
      />
    </React.Fragment>
  );
};

export default DepartmentsTab;
