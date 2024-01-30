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

const DepartmentsTab = () => {
  const DepartmentData = GetLocalStorageData("department");

  const EmployeeData = GetLocalStorageData("employee");
  console.log("Datas",EmployeeData);

  const dispatch = useDispatch();

  const newDepObj = useMemo(() => {
    return {
      id: 0,
      name: "",
      description: "",
      is_location_required: false,
      pid: 0,
      child_id_list: [],
    };
  }, []);

  const handleDepartmentEdit = ($id, obj) => {
    const depObj = $id === 0 ? newDepObj : obj;
    dispatch(setFormTitle("Departments"));
    dispatch(setFormObj(depObj));
    dispatch(setFormWidthPercentage("30%"));
    dispatch(setComponentToShow("department"));
    dispatch(toggleRSBView(true));
  };

  

  const [data] = useState([
    {
      label: "Lintcloud IT Service Private Limited",
      expanded: true,
      type: "person",
      data: {
        id: 1,
        manager: [1, 2],
        employee: [3, 4],
      },
      children: [
        {
          expanded: true,
          type: "person",
          label: "Sales and marketing (Business development)",
          data: {
            id: 1,
            manager: [1, 2],
            employee: [3, 4],
          },
          children: [
            {
              label: "Pre Sales",
            },
            {
              label: "Post Sales",
            },
            {
              label: "Marketing",
            },
            {
              label: "Customer Success",
            },
          ],
        },
        {
          expanded: true,
          type: "person",
          label: "Development",
          data: {
            id: 1,
            manager: [1, 2],
            employee: [3, 4],
          },
          children: [
            {
              label: "Python Programing",
            },
            {
              label: "UI/UX Design",
            },
            {
              label: "Backend (DB)",
            },
            {
              label: "React (UI/UX)",
            },
            {
              label: "Android",
              expanded: true,
              children: [
                {
                  label: "Unit Testing",
                },
                {
                  label: "Backend Services",
                },
              ],
            },
            {
              label: "Apple Iphone",
            },
          ],
        },
        {
          expanded: true,
          type: "person",
          label: "Accounts",
          data: {
            id: 1,
            manager: [1, 2],
            employee: [3, 4],
          },
          children: [
            {
              label: "Acc & Finance",
            },
            {
              label: "Hr",
              expanded: true,
              children: [
                {
                  label: "Requirement",
                },
                {
                  label: "Selection Team",
                  expanded: true,
                  children: [
                    {
                      label: "Traniee",
                      expanded: true,
                      children: [
                        {
                          label: "Traniee 1",
                          expanded: true,
                          children: [
                            {
                              label: "Traniee 2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          expanded: true,
          type: "person",
          label: "Back Office",
          data: {
            id: 1,
            manager: [1, 2],
            employee: [3, 4],
          },
          children: [
            {
              label: "Carpet Sweeper",
            },
            {
              label: "Cab Driver",
            },
            {
              label: "Watch Man",
            },
            {
              label: "Document Keeper",
            },
            {
              label: "Hospitality Cleaner",
            },
          ],
        },
      ],
    },
  ]);

  const { department_data } = useSelector((state) => state.DepartmentReducer);

  useEffect(() => {
    dispatch(
      setDepartmentDetails(GetLocalStorageData("department_details") || [])
    );
  }, []);

  const item = {
    subItem: [
      { id: 1, img: avatar1, name: "ELan" },
      { id: 2, img: avatar2, name: "ELan1" },
      // { id: 3, img: avatar3 },

      { id: 3, imgNumber: "4", bgcolor: "bg-info" },
    ],
  };

  const [showOrgModal, setShowOrgModal] = useState(false);
  function toggleOrgModal() {
    setShowOrgModal(!showOrgModal);
  }

  const [departmentId, setDepartmentId] = useState(0);
  const [departmemtName, setDepartName] = useState(0);

  const setDataForTable = (obj) => {
    console.log("Node Data == ", obj);
    let team_members_id = obj.data.manager.concat(obj.data.employee);
    setDepartmentId(team_members_id);
  };

  const nodeTemplate1 = (node) => {
    if (true) {
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
                      setDepartName(node.name);
                    }}
                    className="text-body  text-truncate d-block"
                  >
                    {node.label}
                  </Link>
                </h5>
                <div>
                  <div className="avatar-group">
                    {item.subItem.map((item, key) => (
                      <React.Fragment key={key}>
                        {item.img ? (
                          <div className="avatar-group-item">
                            <Link
                              to="#"
                              className="d-inline-block"
                              id={item.targetId}
                            >
                              <img
                                src={item.img}
                                alt={item.name}
                                title={item.name}
                                className="rounded-circle avatar-xxs"
                              />
                            </Link>
                          </div>
                        ) : (
                          <div className="avatar-group-item">
                            <Link to="#">
                              <div className="avatar-xxs">
                                <span
                                  title={item.imgNumber + " Employees"}
                                  className={
                                    "avatar-title rounded-circle text-white " +
                                    item.bgcolor
                                  }
                                >
                                  <small>{item.imgNumber}</small>
                                </span>
                              </div>
                            </Link>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 ms-1">
                <div className="d-flex gap-1">
                  <button
                  onClick={() => {
                    toggleOrgModal();
                    setDepartmentId(node.id);
                    setDepartName(node.name);
                  }}
                    type="button"
                    className="btn btn-icon text-muted btn-sm fs-18"
                  >
                    <i className="ri-eye-line"></i>
                  </button>
                  <button
                    onClick={() => handleDepartmentEdit(node.id, node)}
                    type="button"
                    className="btn btn-icon text-muted btn-sm fs-18"
                  >
                    <i className="ri-pencil-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Col>
      );
    }

    return node.label;
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
                handleDepartmentEdit(0);
              }}
            >
              <i className="ri-add-line align-bottom me-1"></i>New Department{" "}
            </button>
          </span>
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
        organizationName={departmemtName}
      />
    </React.Fragment>
  );
};

export default DepartmentsTab;
