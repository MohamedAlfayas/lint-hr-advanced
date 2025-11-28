import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  Table,
  TabPane,
  UncontrolledDropdown,
} from "reactstrap";

import classnames from "classnames";
import DummyUserImg from "../../assets/images/users/user.png";

import { MetaTitle } from "../../common/data/MetaTitle";
import { useEffect } from "react";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import EmployeeOverview from "./EmployeeOverview";
import EmployeeAttendance from "./EmployeeAttendance";
import AccountSettings from "./AccountSetting";
import { setEmployeeAccountSettingsData } from "../../redux/reducers/ChildReducer/AccountSettingsReducer";
import { useDispatch } from "react-redux";
import { Api } from "../../common/api/Api";
import { setEmployeeLeaveType } from "../../redux/reducers/ChildReducer/EmployeeLeaveReducer";
import { setIndividualAttendanceReportData } from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import { toast } from "react-toastify";
import { BuildAttendanceReportChart } from "../../common/js/BuildAttendanceReportChart";
import EmployeeDocument from "./EmployeeDocument";

const EmployeeView = () => {
  const { id } = useParams();
  const DepartmentData = GetLocalStorageData("department") || [];
  const RoleData = GetLocalStorageData("role") || [];
  const EmployeeData = GetLocalStorageData("employee") || [];

  const employeeAccountData = EmployeeData.find((d) => d.emp_uuid === id);

  const dispatch = useDispatch();

  const [profileObj, setProfileObj] = useState({});

  const navigate = useNavigate();

  const [filterKeys, setFilterKeys] = useState({
    thisMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
    hr_status: "0",
    record: "0",
    type: "2",
    employee: "0",
  });

  useEffect(() => {
    !!id && GetInitialApi(id);
  }, [id]);

  const GetInitialApi = async (id) => {
    dispatch(setLoaderVisible(true));
    const EmployeeData = GetLocalStorageData("employee") || [];
    if (id && EmployeeData.length) {
      const thisEmployeeData = EmployeeData.find((d) => d.emp_uuid === id);

      if (
        thisEmployeeData !== undefined &&
        thisEmployeeData !== null &&
        Object.keys(thisEmployeeData).length > 0
      ) {
        setProfileObj(thisEmployeeData);

        const att_api_payload = {
          thisMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
            .toString()
            .padStart(2, "0")}`,
          hr_status: "0",
          record: "0",
          type: "2",
          employee: thisEmployeeData.id,
        };

        setFilterKeys(att_api_payload);

        const Att_Report_Api = await PostApi(
          "report/get-attendance-report/",
          att_api_payload,
          false
        );
        if (Att_Report_Api.status && Att_Report_Api.status === 200) {
          dispatch(
            setIndividualAttendanceReportData(
              Att_Report_Api?.data?.data?.individual_attendance_report
            )
          );

          BuildAttendanceReportChart(
            Att_Report_Api?.data?.data?.individual_attendance_report,
            dispatch
          );

          Api({
            type: "GET",
            url: `leave/get-leave-type-details-for-employee/?employee_id=${thisEmployeeData.id}`,
          })
            .then((res) => {
              dispatch(setEmployeeLeaveType(res?.data?.data));
              dispatch(setLoaderVisible(false));
            })
            .catch((err) => {
              dispatch(setEmployeeLeaveType([]));
             
              dispatch(setLoaderVisible(false));
            });
        } else {
          toast.error(
            Att_Report_Api?.data?.message || Att_Report_Api?.data?.detail
          );
          dispatch(setLoaderVisible(false));
        }
      } else {
        dispatch(setLoaderVisible(false));
        navigate("/dashboard");
      }
    }
  };

  const [activeTab, setActiveTab] = useState("1");

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  document.title = `Employee View | ${MetaTitle}`;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="profile-foreground position-relative mx-n4 mt-n4">
            <div className="profile-wid-bg">
              <img
                src={
                  profileObj.profile_url ? profileObj.profile_url : DummyUserImg
                }
                style={{ objectFit: "cover" }}
                alt=""
                className="profile-wid-img"
              />
            </div>
          </div>
          <div className="pt-4 mb-4 mb-lg-3 pb-lg-4">
            <Row className="g-4">
              <div className="col-auto">
                <div className="avatar-lg">
                  <img
                    src={
                      profileObj.profile_url
                        ? profileObj.profile_url
                        : DummyUserImg
                    }
                    style={{ objectFit: "cover" }}
                    alt="Available"
                    className="avatar-lg img-thumbnail rounded-circle mx-auto border-success"
                  />
                </div>
              </div>

              <Col>
                <div className="p-2">
                  <h3 className="text-white mb-1">
                    {profileObj?.first_name} {profileObj?.last_name}
                  </h3>
                  <p className="text-white text-opacity-75">
                    {profileObj?.role?.id
                      ? RoleData.length
                        ? RoleData.find((d) => d.id === profileObj?.role?.id)
                            ?.name
                        : ""
                      : ""}{" "}
                    /{" "}
                    {profileObj?.primary_department_id_list
                      ? profileObj.primary_department_id_list
                          .map(
                            (deptId) =>
                              DepartmentData.find((dept) => dept.id === deptId)
                                ?.name
                          )
                          .join(" / ")
                      : ""}
                  </p>
                  <div className="hstack text-white-50 gap-1">
                    <div className="me-2">
                      <i className="ri-at-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
                      <Link
                        to={`mailto:${profileObj?.email || ""}`}
                        className="link-light"
                      >
                        {profileObj?.email || ""}
                      </Link>{" "}
                    </div>
                    <div>
                      <i className="ri-phone-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
                      <Link
                        to={`tel:${profileObj?.contact_number || ""}`}
                        className="link-light"
                      >
                        {profileObj?.contact_number || ""}
                      </Link>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <Row>
            <Col lg={12}>
              <div>
                <div className="d-flex">
                  <Nav
                    pills
                    className="animation-nav profile-nav gap-2 gap-lg-3 flex-grow-1"
                    role="tablist"
                  >
                    <NavItem className="fs-14">
                      <Button
                        className={classnames("nav-link", {
                          active: activeTab === "1",
                        })}
                        onClick={() => {
                          toggleTab("1");
                        }}
                      >
                        <i className="ri-airplay-fill d-inline-block d-md-none"></i>{" "}
                        <span className="d-none d-md-inline-block">
                          Overview
                        </span>
                      </Button>
                    </NavItem>
                    <NavItem className="fs-14">
                      <Button
                        className={classnames("nav-link", {
                          active: activeTab === "2",
                        })}
                        onClick={() => {
                          toggleTab("2");
                        }}
                      >
                        <i className="ri-list-unordered d-inline-block d-md-none"></i>{" "}
                        <span className="d-none d-md-inline-block">
                          Attendance
                        </span>
                      </Button>
                    </NavItem>
                    <NavItem className="fs-14">
                      <Button
                        className={classnames("nav-link", {
                          active: activeTab === "3",
                        })}
                        onClick={() => {
                          toggleTab("3");
                        }}
                      >
                        <i className="ri-price-tag-line d-inline-block d-md-none"></i>{" "}
                        <span className="d-none d-md-inline-block">
                          Payroll
                        </span>
                      </Button>
                    </NavItem>
                    <NavItem className="fs-14">
                      <Button
                        className={classnames("nav-link", {
                          active: activeTab === "4",
                        })}
                        onClick={() => {
                          toggleTab("4");
                        }}
                      >
                        <i className="ri-folder-4-line d-inline-block d-md-none"></i>{" "}
                        <span className="d-none d-md-inline-block">
                          Documents
                        </span>
                      </Button>
                    </NavItem>
                  </Nav>
                  <div className="flex-shrink-0">
                    <Link to="/employee" className="btn w-sm btn-warning">
                      <i className="ri-arrow-left-line align-bottom"></i> Back
                      to Employee
                    </Link>
                  </div>

                  <div className="flex-shrink-0" style={{ marginLeft: "10px" }}>
                    <Button
                      className="btn btn-success"
                      onClick={() => {
                        dispatch(
                          setEmployeeAccountSettingsData(employeeAccountData)
                        );
                        navigate(`/account-settings/`);
                      }}
                    >
                      <i className="ri-edit-box-line align-bottom"></i> Account
                      Settings
                    </Button>
                  </div>
                </div>

                <TabContent activeTab={activeTab} className="pt-4">
                  {!!activeTab && activeTab === "1" && (
                    <TabPane tabId="1">
                      <EmployeeOverview profileObj={profileObj} />
                    </TabPane>
                  )}
                  {!!activeTab && activeTab === "2" && (
                    <TabPane tabId="2">
                      <EmployeeAttendance
                        profileObj={profileObj}
                        filterKeys={filterKeys}
                        setFilterKeys={setFilterKeys}
                      />
                    </TabPane>
                  )}

                  {!!activeTab && activeTab === "3" && (
                    <TabPane tabId="3">
                      <Card>
                        <CardBody>
                          <div className="d-flex align-items-center mb-4">
                            <h5 className="card-title flex-grow-1 mb-0">
                              Documents
                            </h5>
                            <div className="flex-shrink-0">
                              <Input
                                className="form-control d-none"
                                type="file"
                                id="formFile"
                              />
                              <Label
                                htmlFor="formFile"
                                className="btn btn-danger"
                              >
                                <i className="ri-upload-2-fill me-1 align-bottom"></i>{" "}
                                Upload File
                              </Label>
                            </div>
                          </div>
                          <Row>
                            <Col lg={12}>
                              <div className="table-responsive">
                                <Table className="table-borderless align-middle mb-0">
                                  <thead className="table-light">
                                    <tr>
                                      <th scope="col">File Name</th>
                                      <th scope="col">Type</th>
                                      <th scope="col">Size</th>
                                      <th scope="col">Upload Date</th>
                                      <th scope="col">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr key="1">
                                      <td>
                                        <div className="d-flex align-items-center">
                                          <div className="avatar-sm">
                                            <div className="avatar-title bg-danger-subtle text-danger rounded fs-20">
                                              <i className="ri-image-2-fill"></i>
                                            </div>
                                          </div>
                                          <div className="ms-3 flex-grow-1">
                                            <h6 className="fs-15 mb-0">
                                              <Link to="#">Passport</Link>
                                            </h6>
                                          </div>
                                        </div>
                                      </td>
                                      <td>PNG File </td>
                                      <td>879 KB</td>
                                      <td>02 Nov 2021</td>
                                      <td>
                                        <UncontrolledDropdown direction="start">
                                          <DropdownToggle
                                            tag="a"
                                            className="btn btn-light btn-icon"
                                            id="dropdownMenuLink15"
                                            role="button"
                                          >
                                            <i className="ri-equalizer-fill"></i>
                                          </DropdownToggle>
                                          <DropdownMenu>
                                            <DropdownItem>
                                              <i className="ri-eye-fill me-2 align-middle text-muted" />
                                              View
                                            </DropdownItem>
                                            <DropdownItem>
                                              <i className="ri-download-2-fill me-2 align-middle text-muted" />
                                              Download
                                            </DropdownItem>
                                            <DropdownItem divider />
                                            <DropdownItem>
                                              <i className="ri-delete-bin-5-line me-2 align-middle text-muted" />
                                              Delete
                                            </DropdownItem>
                                          </DropdownMenu>
                                        </UncontrolledDropdown>
                                      </td>
                                    </tr>
                                  </tbody>
                                </Table>
                              </div>
                              <div className="text-center mt-3">
                                <Link to="#" className="text-success ">
                                  <i className="mdi mdi-loading mdi-spin fs-20 align-middle me-2"></i>
                                  Load more{" "}
                                </Link>
                              </div>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>
                    </TabPane>
                  )}
                  {!!activeTab && activeTab === "4" && (
                    <TabPane tabId="4">
                     <EmployeeDocument  profileObj={profileObj} />
                    </TabPane>
                  )}
                </TabContent>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default EmployeeView;
