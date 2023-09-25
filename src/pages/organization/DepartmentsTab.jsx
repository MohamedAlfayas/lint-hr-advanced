import React, { useState } from "react";
import { Button, Card, CardBody, Col, Row } from "reactstrap";
import { OrganizationChart } from "primereact/organizationchart";
import { useDispatch } from "react-redux";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { Link } from "react-router-dom";

import avatar1 from "../../assets/images/users/avatar-1.jpg";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";

const DepartmentsTab = () => {
  const dispatch = useDispatch();

  const handleDepartmentEdit = () => {
    dispatch(setFormTitle("Departments"));
    dispatch(
      setFormObj({
        id: "0",
        name: "",
        head_department: 1,
        description: "",
      })
    );
    dispatch(setFormWidthPercentage("50%"));
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

  const item = {
    subItem: [
      { id: 1, img: avatar1 },
      { id: 2, img: avatar2 },
      // { id: 3, img: avatar3 },

      { id: 4, imgNumber: "5", bgcolor: "bg-info" },
    ],
  };

  const nodeTemplate = (node) => {
    if (node.type === "person") {
      return (
        <div className="flex flex-column">
          <div className="flex flex-column align-items-center">
            <img
              alt={node.data.name}
              src={node.data.image}
              className="mb-3 w-3rem h-3rem"
            />
            <span className="font-bold mb-2">{node.data.name}</span>
            <span>{node.data.title}</span>
          </div>
        </div>
      );
    }

    return node.label;
  };

  const nodeTemplate1 = (node) => {
    console.log(node);
    if (true) {
      return (
        <Col xxl={12} lg={12}>
          <div className="border rounded border-dashed p-2">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1 ms-2 overflow-hidden">
                <h5 className="fs-13 mb-1">
                  <Link to="#" className="text-body  text-truncate d-block">
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
                                alt=""
                                className="rounded-circle avatar-xxs"
                              />
                            </Link>
                          </div>
                        ) : (
                          <div className="avatar-group-item">
                            <Link to="#">
                              <div className="avatar-xxs">
                                <span
                                  title="Members"
                                  className={
                                    "avatar-title rounded-circle text-white " +
                                    item.bgcolor
                                  }>
                                  <small>+</small> {item.imgNumber}
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
          <Button onClick={() => handleDepartmentEdit()}>
            Edit Department
          </Button>
          <div className="card overflow-x-auto">
            <OrganizationChart value={data} nodeTemplate={nodeTemplate1} />
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default DepartmentsTab;
