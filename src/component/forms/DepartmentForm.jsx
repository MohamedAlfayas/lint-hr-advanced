import axios from "axios";
import { FilePond } from "filepond";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Input,
  Label,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const DepartmentForm = () => {
  let globalData = JSON.parse(localStorage.getItem("lcEdu_GlobalData"));

  const [hdDropDown, setHdDropDown] = useState(false);
  const toggleHd = () => setHdDropDown((prevState) => !prevState);


  const [departmentData, setDepartmentData] = useState({});
  const [selectedHeadDepartment, setSelectedHeadDepartment] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const DepartmentList = useMemo(() =>GetLocalStorageData('department'),[]);  

  useEffect(() => {
    console.log("UseEffect Running !!!!");
    setDepartmentData(form_obj);
    setSelectedHeadDepartment(form_obj);
    //setParentDep({ label: "Madrid", value: 2 });
  }, [form_obj]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDepartmentData({
      ...departmentData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    console.log("department data = ", departmentData);
    Api({
      method: 'POST',
      url: 'department/create/',
      data: departmentData
    })
      .then(res => {
        console.log("REs = ", res);
      })
      .catch(err => {
        console.log("ERr == ", err);
      })
  };


  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form onSubmit={handleSubmit} action="javascript:void(0)">
            <Row className="g-3">
              <Col lg={12}>
                <label htmlFor="departmentName" className="form-label">
                  Department Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  id="departmentName"
                  placeholder="Enter department name"
                  value={departmentData.name || ""}
                  onChange={handleInputChange}
                  required
                />
              </Col>
              <Col lg={12}>
                <label htmlFor="parentDepartment" className="form-label">
                  Parent Department
                </label>

                <Dropdown isOpen={hdDropDown} toggle={toggleHd}>
                  <DropdownToggle
                    tag="div"
                    className="form-control rounded-end flag-input form-select"
                    required
                    style={{ cursor: "pointer" }}>
                    {selectedHeadDepartment.name || "Select Parent Department"}
                  </DropdownToggle>
                  <DropdownMenu
                    as="ul"
                    className="list-unstyled w-100 dropdown-menu-list mb-0">
                    <SimpleBar style={{ maxHeight: "220px" }} className="px-3">
                      {(
                        DepartmentList.filter(
                          (obj) => obj !== parseInt(departmentData.id)
                        ).sort((a, b) => a.name.localeCompare(b.name)) || []
                      ).map((item, key) => (
                        <DropdownItem
                          as="li"
                          onClick={() => {
                            setSelectedHeadDepartment(item);
                            setDepartmentData({
                              ...departmentData,
                              pid: item.id,
                            });
                          }}
                          key={key}
                          className="dropdown-item d-flex">
                          <div className="flex-grow-1">
                            <div className="d-flex">
                              <div className="country-name me-1">
                                {item.name}
                              </div>
                            </div>
                          </div>
                        </DropdownItem>
                      ))}
                    </SimpleBar>
                  </DropdownMenu>
                </Dropdown>
              </Col>
              <Col lg={12}>
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  className="form-control"
                  id="description"
                  placeholder="Enter description"
                  value={departmentData.description || ""}
                  onChange={handleInputChange}
                />
              </Col>

              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label">
                    {" "}
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Save{" "}
                  </Button>{" "}
                </div>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default DepartmentForm;
