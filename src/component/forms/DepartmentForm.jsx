import axios from "axios";
import { FilePond } from "filepond";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { setDepartmentDetails } from "../../redux/reducers/ChildReducer/DepartmentReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";

const DepartmentForm = () => {
  const [hdDropDown, setHdDropDown] = useState(false);
  const toggleHd = () => setHdDropDown((prevState) => !prevState);
  const [departmentData, setDepartmentData] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const DepartmentList = GetLocalStorageData('department') || [];

  const dispatch = useDispatch();

  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    setDepartmentData(form_obj);
    setDepartmentOptions(DepartmentList.filter(obj => obj.pid !== form_obj.id));
  }, [form_obj]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDepartmentData({
      ...departmentData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {    
    dispatch(setLoaderVisible(true));
    Api({
      method: 'POST',
      url: 'department/create/',
      data: departmentData
    })
      .then(res => {
        dispatch(setDepartmentDetails(res?.data?.data));
        dispatch(setLoaderVisible(false));
        dispatch(toggleRSBView(false));
        toast.success(res?.data?.message);
      })
      .catch(err => {
        dispatch(setLoaderVisible(false));
        toast.error(err?.response?.data?.message);
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
                <div id="passwordHelpBlock" className="form-text">
                  Select Department.
                </div>
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
                    {(departmentData.pid) && (departmentOptions.find(obj => obj.id === departmentData.pid)).name || "Select Parent Department"}
                  </DropdownToggle>
                  <DropdownMenu
                    as="ul"
                    className="list-unstyled w-100 dropdown-menu-list mb-0">
                    <SimpleBar style={{ maxHeight: "220px" }} className="px-3">
                      {(
                        departmentOptions.filter(
                          (obj) => obj !== parseInt(departmentData.id)
                        ).sort((a, b) => a.name.localeCompare(b.name)) || []
                      ).map((item, key) => (
                        <DropdownItem
                          as="li"
                          onClick={() => {
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
                <div id="passwordHelpBlock" className="form-text">
                  Select Parent Department.
                </div>
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
                <div id="passwordHelpBlock" className="form-text">
                  Description.
                </div>
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
