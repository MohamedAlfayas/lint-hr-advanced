import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import { OrganizationChart } from "primereact/organizationchart";
import { useDispatch } from "react-redux";
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

const DepartmentsTab = () => {
  let globalData = JSON.parse(localStorage.getItem("lcEdu_GlobalData"));

  const DepartmentData = GetLocalStorageData('department')

  const dispatch = useDispatch();

  const newDepObj = useMemo(() =>{
    return {
      id : 0,
      name : "",
      description : "",
      pid : 0
    }
  },[])

  const handleDepartmentEdit = ($id) => {
    console.log($id);

    const depObj = $id === 0 ? newDepObj : DepartmentData.find((p) => p.id === parseInt($id));

    console.log("Dep Obj = ",depObj);

    //dispatch(setDepartmentData($id));
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

  const data2 = useMemo(() => GetLocalStorageData('department_details'),[])

  // const [data2] = useState([
  //   {
  //     label: "Lintcloud IT Service Private Limited",
  //     id: 1,
  //     pid: 0,
  //     expanded: true,
  //     data: {
  //       manager: [1],
  //       employee: [1, 2, 3, 4, 5, 6, 7, 8],
  //     },
  //     children: [
  //       {
  //         expanded: true,
  //         label: "Sales and marketing (Business development)",
  //         id: 2,
  //         pid: 1,
  //         data: {
  //           manager: [4],
  //           employee: [5, 6],
  //         },
  //         children: [
  //           {
  //             label: "Pre Sales",
  //             id: 3,
  //             pid: 1,
  //             data: {
  //               manager: [],
  //               employee: [],
  //             },
  //           },
  //         ],
  //       },
  //       {
  //         expanded: true,
  //         label: "Development",
  //         id: 4,
  //         pid: 1,
  //         data: {
  //           manager: [2, 3],
  //           employee: [7, 8],
  //         },
  //         children: [
  //           {
  //             label: "UI/UX Design",
  //             id: 5,
  //             pid: 1,
  //             data: {
  //               manager: [],
  //               employee: [],
  //             },
  //           },
  //           {
  //             label: "Backend (DB)",
  //             id: 6,
  //             pid: 1,
  //             data: {
  //               manager: [],
  //               employee: [],
  //             },
  //           },
  //         ],
  //       },
  //       {
  //         expanded: true,
  //         label: "Accounts",
  //         id: 7,
  //         pid: 1,
  //         data: {
  //           id: 8,
  //           pid: 1,
  //           manager: [4],
  //           employee: [5, 6],
  //         },
  //         children: [
  //           {
  //             label: "Acc & Finance",
  //             id: 9,
  //             pid: 1,
  //             data: {
  //               manager: [],
  //               employee: [],
  //             },
  //           },
  //         ],
  //       },
  //       {
  //         expanded: true,
  //         label: "Back Office",
  //         id: 10,
  //         pid: 1,
  //         data: {
  //           manager: [1, 2],
  //           employee: [3, 4],
  //         },
  //         children: [
  //           {
  //             label: "Carpet Sweeper",
  //             id: 12,
  //             pid: 1,
  //             data: {
  //               manager: [],
  //               employee: [],
  //             },
  //           },
  //           {
  //             label: "Cab Driver",
  //             id: 13,
  //             pid: 1,
  //             data: {
  //               manager: [],
  //               employee: [],
  //             },
  //           },
  //           {
  //             label: "Document Keeper",
  //             id: 14,
  //             pid: 1,
  //             data: {
  //               manager: [],
  //               employee: [],
  //             },
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // ]);

  const item = {
    subItem: [
      { id: 1, img: avatar1, name: "ELan" },
      { id: 2, img: avatar2, name: "ELan1" },
      // { id: 3, img: avatar3 },

      { id: 3, imgNumber: "7", bgcolor: "bg-info" },
    ],
  };

  const [showOrgModal, setShowOrgModal] = useState(false);
  function toggleOrgModal() {
    setShowOrgModal(!showOrgModal);
  }

  const [teamMembersID, setTeamMembersID] = useState([]);

  const setDataForTable = (obj) => {
    console.log("Node Data == ", obj);
    let team_members_id = obj.data.manager.concat(obj.data.employee);
    console.log("Team Members Id = ", team_members_id);
    setTeamMembersID(team_members_id);
  };

  const nodeTemplate1 = (node) => {
    console.log("nodfde");
    console.log(node);
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
                      setDataForTable(node);
                    }}
                    className="text-body  text-truncate d-block">
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
                              id={item.targetId}>
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
                                  }>
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
                    type="button"
                    className="btn btn-icon text-muted btn-sm fs-18">
                    <i className="ri-eye-line"></i>
                  </button>
                  <button
                    onClick={() => handleDepartmentEdit(node.id)}
                    type="button"
                    className="btn btn-icon text-muted btn-sm fs-18">
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
        <CardBody>
          <h5 className="card-title">Department</h5>
          <Button onClick={() => handleDepartmentEdit(0)}>
            New Department
          </Button>
          <div className="card overflow-x-auto">
            <OrganizationChart value={data2} nodeTemplate={nodeTemplate1} />
          </div>
        </CardBody>
      </Card>

      <OrgModal
        showOrgModal={showOrgModal}
        toggleOrgModal={toggleOrgModal}
        teamMembersID={teamMembersID}
      />
    </React.Fragment>
  );
};

export default DepartmentsTab;
