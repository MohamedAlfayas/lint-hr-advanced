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

  const [data2] = useState([
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
              label: "UI/UX Design",
            },
            {
              label: "Backend (DB)",
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
              label: "Document Keeper",
            },
          ],
        },
      ],
    },
  ]);

  const item = {
    subItem: [
      { id: 1, img: avatar1, name: "ELan" },
      { id: 2, img: avatar2, name: "ELan1" },
      // { id: 3, img: avatar3 },

      { id: 3, imgNumber: "7", bgcolor: "bg-info" },
    ],
  };

  const [modal_positionBottom, setmodal_positionBottom] = useState(false);
  function tog_positionBottom() {
    console.log("Inside .....");
    setmodal_positionBottom(!modal_positionBottom);
  }

  const nodeTemplate1 = (node) => {
    console.log("node");
    if (true) {
      return (
        <Col xxl={12} lg={12}>
          <div className="border rounded border-dashed p-2">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1 ms-2 overflow-hidden">
                <h5 className="fs-13 mb-1">
                  <Link
                    onClick={() => tog_positionBottom()}
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
                    onClick={() => tog_positionBottom()}
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
            <OrganizationChart value={data2} nodeTemplate={nodeTemplate1} />
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default DepartmentsTab;
