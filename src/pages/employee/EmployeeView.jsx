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
import { useDispatch, useSelector } from "react-redux";
import { Api } from "../../common/api/Api";
import { setEmployeeLeaveType } from "../../redux/reducers/ChildReducer/EmployeeLeaveReducer";
import { setIndividualAttendanceReportData } from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import { GetApi } from "../../common/api/GetApi";
import { toast } from "react-toastify";
import { BuildAttendanceReportChart } from "../../common/js/BuildAttendanceReportChart";
import EmployeeDocument from "./EmployeeDocument";
import {
  VIEW_HIERARCHY_EMPLOYEE_ACCESS_KEY,
  VIEW_TEAM_EMPLOYEE_ACCESS_KEY,
} from "../../common/constant/RoleConstants";
import { useTable } from "react-table";
import EmployeePayslip from "../payroll/EmployeePayslip";

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const getMonthName = (month) => {
  if (month === null || month === undefined || month === "") return "";
  if (isNaN(month)) return String(month);
  return MONTH_NAMES[parseInt(month, 10)] || String(month);
};

const EmployeeView = () => {
  const { id } = useParams();
  const DepartmentData = GetLocalStorageData("department") || [];
  const RoleData = GetLocalStorageData("role") || [];
  const EmployeeData = GetLocalStorageData("employee") || [];
  const [otherEmpViewAccess, setOtherEmpViewAccess] = useState(false);

  const [accSettingsAccess, setAccSettingsAccess] = useState(false);

  const { profile_data } = useSelector((state) => state.MyProfileReducer);

  useEffect(() => {
    let perm_list = profile_data.permission_list;

    if (perm_list != null && perm_list != undefined) {
      if (
        perm_list.includes(VIEW_TEAM_EMPLOYEE_ACCESS_KEY) ||
        perm_list.includes(VIEW_HIERARCHY_EMPLOYEE_ACCESS_KEY)
      ) {
        setOtherEmpViewAccess(true);
      }
    }
  }, []);

  const employeeAccountData = EmployeeData.find((d) => d.emp_uuid === id);

  useEffect(() => {
    if (profile_data && employeeAccountData) {
      if (profile_data?.id === employeeAccountData?.id) {
        setAccSettingsAccess(true);
      } else {
        setAccSettingsAccess(false);
      }
    }
  }, [profile_data, employeeAccountData]);

  const dispatch = useDispatch();

  const [profileObj, setProfileObj] = useState({});
  const [payrollObj, setPayrollObj] = useState(null);
  const [employeeTasks, setEmployeeTasks] = useState([]);

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

  const GetPayrollSummary = async (empId) => {
    try {
      const res = await GetApi(`payroll/employee-payslip-list-id/${empId}`);
      const data = res?.data ?? res;
      const payslips = data?.data?.payslips ?? [];

      if (!payslips.length) {
        setPayrollObj(null);
        return;
      }

      const sorted = [...payslips].sort((a, b) => {
        if (Number(b.year) !== Number(a.year))
          return Number(b.year) - Number(a.year);
        return Number(b.month) - Number(a.month);
      });
      const latest = sorted[0];

      const currentYear = new Date().getFullYear();
      const totalThisYear = payslips.filter(
        (p) => Number(p.year) === currentYear,
      ).length;

      setPayrollObj({
        latestNetSalary: latest?.net_pay ? `₹ ${latest.net_pay}` : "-",
        latestPayMonth:
          `${getMonthName(latest?.month)} ${latest?.year || ""}`.trim(),
        lastPayDate: latest?.pay_date || "-",
        totalPayslips: totalThisYear,
      });
    } catch (err) {
      console.error("Payroll summary fetch error:", err);
      setPayrollObj(null);
    }
  };

  const GetEmployeeTasks = async (empId) => {
    try {
      const response = await Api.get("/task/");
      const allTasks = response?.data?.data || [];

      const filtered = allTasks.filter((t) => {
        const isAssignee = Number(t.assigned_to) === Number(empId);

        const isCollaboratorViaDetails = Array.isArray(t.collaborator_details)
          ? t.collaborator_details.some((c) => Number(c.id) === Number(empId))
          : false;

        const isCollaboratorViaIds = Array.isArray(t.collaborators_id_list)
          ? t.collaborators_id_list.some((id) => Number(id) === Number(empId))
          : false;

        return isAssignee || isCollaboratorViaDetails || isCollaboratorViaIds;
      });

      const sorted = [...filtered].sort(
        (a, b) => new Date(b.start_time || 0) - new Date(a.start_time || 0),
      );

      setEmployeeTasks(sorted.slice(0, 10));
    } catch (error) {
      console.log("Employee Task Fetch Error:", error);
      setEmployeeTasks([]);
    }
  };

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

        GetPayrollSummary(thisEmployeeData.id);
        GetEmployeeTasks(thisEmployeeData.id);

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
          "report/get-attendance-report/v2/",
          att_api_payload,
          false,
        );
        if (Att_Report_Api.status && Att_Report_Api.status === 200) {
          dispatch(
            setIndividualAttendanceReportData(
              Att_Report_Api?.data?.data?.individual_attendance_report,
            ),
          );

          BuildAttendanceReportChart(
            Att_Report_Api?.data?.data?.individual_attendance_report,
            dispatch,
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
            Att_Report_Api?.data?.message || Att_Report_Api?.data?.detail,
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
          <Card className="border-0 shadow-sm mb-2">
            <CardBody className="p-3">
              <Row className="align-items-center g-4">
                <div
                  className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                    !profileObj.profile_url ? "avatar-outline" : ""
                  }`}
                  style={{
                    width: "96px",
                    height: "96px",
                  }}
                >
                  <img
                    src={
                      profileObj.profile_url
                        ? profileObj.profile_url
                        : DummyUserImg
                    }
                    style={{
                      objectFit: "cover",
                      width: "90px",
                      height: "90px",
                    }}
                    alt=""
                    className="rounded-circle"
                  />
                </div>

                <Col>
                  <h3 className="text-dark fw-bold mb-1">
                    {profileObj?.first_name} {profileObj?.last_name}
                  </h3>
                  <p className="text-muted mb-2">
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
                                ?.name,
                          )
                          .join(" / ")
                      : ""}
                  </p>
                  <div className="hstack gap-4">
                    <div>
                      <i className="ri-at-line me-1 text-muted fs-16 align-middle"></i>
                      <Link
                        to={`mailto:${profileObj?.email || ""}`}
                        className="text-dark text-decoration-none"
                      >
                        {profileObj?.email || ""}
                      </Link>
                    </div>
                    <div>
                      <i className="ri-phone-line me-1 text-muted fs-16 align-middle"></i>
                      <Link
                        to={`tel:${profileObj?.contact_number || ""}`}
                        className="text-dark text-decoration-none"
                      >
                        {profileObj?.contact_number || ""}
                      </Link>
                    </div>
                  </div>
                </Col>

                <div className="col-auto d-flex gap-2">
                  {otherEmpViewAccess === true && (
                    <Link
                      to="/employee"
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="ri-arrow-left-line align-bottom"></i> Back
                      to Employee
                    </Link>
                  )}
                  {accSettingsAccess && (
                    <Button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => {
                        dispatch(
                          setEmployeeAccountSettingsData(employeeAccountData),
                        );
                        navigate(`/account-settings/`);
                      }}
                    >
                      <i className="ri-edit-box-line align-bottom"></i> Account
                      Settings
                    </Button>
                  )}
                </div>
              </Row>
            </CardBody>
          </Card>

          <Row>
            <Col lg={12}>
              <div>
                <div className="d-flex">
                  <Nav
                    className="nav-tabs nav-tabs-custom nav-success gap-2 gap-lg-3 flex-grow-1"
                    role="tablist"
                  >
                    <NavItem className="fs-14">
                      <NavLink
                        className={classnames("fw-semibold", {
                          active: activeTab === "1",
                        })}
                        onClick={() => toggleTab("1")}
                        href="#"
                      >
                        <i className="ri-airplay-fill d-inline-block d-md-none"></i>{" "}
                        <span className="d-none d-md-inline-block">
                          Overview
                        </span>
                      </NavLink>
                    </NavItem>
                    <NavItem className="fs-14">
                      <NavLink
                        className={classnames("fw-semibold", {
                          active: activeTab === "2",
                        })}
                        onClick={() => toggleTab("2")}
                        href="#"
                      >
                        <i className="ri-list-unordered d-inline-block d-md-none"></i>{" "}
                        <span className="d-none d-md-inline-block">
                          Attendance
                        </span>
                      </NavLink>
                    </NavItem>
                    <NavItem className="fs-14">
                      <NavLink
                        className={classnames("fw-semibold", {
                          active: activeTab === "3",
                        })}
                        onClick={() => toggleTab("3")}
                        href="#"
                      >
                        <i className="ri-price-tag-line d-inline-block d-md-none"></i>{" "}
                        <span className="d-none d-md-inline-block">
                          Payroll
                        </span>
                      </NavLink>
                    </NavItem>
                    <NavItem className="fs-14">
                      <NavLink
                        className={classnames("fw-semibold", {
                          active: activeTab === "4",
                        })}
                        onClick={() => toggleTab("4")}
                        href="#"
                      >
                        <i className="ri-folder-4-line d-inline-block d-md-none"></i>{" "}
                        <span className="d-none d-md-inline-block">
                          Documents
                        </span>
                      </NavLink>
                    </NavItem>
                  </Nav>
                </div>

                <TabContent activeTab={activeTab} className="pt-2">
                  {!!activeTab && activeTab === "1" && (
                    <TabPane tabId="1">
                      <EmployeeOverview
                        profileObj={profileObj}
                        payrollObj={payrollObj}
                        employeeTasks={employeeTasks}
                        tasksLink="/tasks"
                        onViewPayslips={() => toggleTab("3")}
                      />
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
                      <EmployeePayslip
                        withTopPadding={false}
                        employeeId={profileObj?.id}
                      />
                    </TabPane>
                  )}
                  {!!activeTab && activeTab === "4" && (
                    <TabPane tabId="4">
                      <EmployeeDocument profileObj={profileObj} />
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
