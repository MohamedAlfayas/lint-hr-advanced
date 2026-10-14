import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Col, Container, Row, TabContent, TabPane } from "reactstrap";

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
import EmployeePayslip from "../payroll/EmployeePayslip";
import { ConvertDateFormat } from "../../common/js/ConvertDateFormat";
import { initialsOf } from "../../component/common/approval/ApprovalCells";
import { testId } from "../../shared/testing/testId";
import "../Crm/Projects/ProjectDetail.scss";

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

const EMPLOYEE_TABS = [
  { id: "1", label: "Overview", icon: "ri-dashboard-line" },
  { id: "2", label: "Attendance", icon: "ri-calendar-check-line" },
  { id: "3", label: "Payroll", icon: "ri-wallet-3-line" },
  { id: "4", label: "Documents", icon: "ri-folder-4-line" },
];

const EmpHeroAvatar = ({ url, name, active }) => {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [url]);
  return (
    <span className="emp-hero-avatar">
      {url && !broken ? (
        <img src={url} alt={name} onError={() => setBroken(true)} />
      ) : (
        <span className="emp-hero-initials">{initialsOf(name) || "?"}</span>
      )}
      <span className={`emp-hero-dot${active ? " is-on" : ""}`} />
    </span>
  );
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

  const fullName = [profileObj?.first_name, profileObj?.last_name].filter(Boolean).join(" ");
  const roleName = profileObj?.role?.id
    ? RoleData.find((d) => d.id === profileObj.role.id)?.name || ""
    : "";
  const departmentNames = (profileObj?.primary_department_id_list || [])
    .map((deptId) => DepartmentData.find((dept) => dept.id === deptId)?.name)
    .filter(Boolean)
    .join(" / ");

  document.title = `Employee View | ${MetaTitle}`;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="pdx-hero emp-hero">
            <div className="pdx-hero-main">
              <EmpHeroAvatar
                url={profileObj?.profile_url}
                name={fullName}
                active={profileObj?.is_active !== false}
              />

              <div className="pdx-hero-text">
                <div className="pdx-hero-title">
                  <h4 title={fullName}>{fullName || "—"}</h4>
                  {profileObj?.emp_id && (
                    <span className="apv-status is-secondary">
                      <i className="ri-hashtag"></i>
                      {profileObj.emp_id}
                    </span>
                  )}
                  <span className={`apv-status is-${profileObj?.is_active === false ? "secondary" : "success"}`}>
                    <i className={profileObj?.is_active === false ? "ri-forbid-line" : "ri-checkbox-circle-line"}></i>
                    {profileObj?.is_active === false ? "Inactive" : "Active"}
                  </span>
                </div>

                <div className="pdx-hero-meta">
                  {roleName && (
                    <span>
                      <i className="ri-shield-user-line"></i>
                      <b>{roleName}</b>
                    </span>
                  )}
                  {departmentNames && (
                    <span>
                      <i className="ri-building-line"></i>
                      {departmentNames}
                    </span>
                  )}
                  {profileObj?.email && (
                    <a href={`mailto:${profileObj.email}`} data-testid="employee-view-email-link">
                      <i className="ri-mail-line"></i>
                      {profileObj.email}
                    </a>
                  )}
                  {profileObj?.contact_number && (
                    <a href={`tel:${profileObj.contact_number}`} data-testid="employee-view-phone-link">
                      <i className="ri-phone-line"></i>
                      {profileObj.contact_number}
                    </a>
                  )}
                  {profileObj?.joining_date && (
                    <span>
                      <i className="ri-calendar-check-line"></i>
                      Joined <b>{ConvertDateFormat(profileObj.joining_date)}</b>
                    </span>
                  )}
                </div>
              </div>

              <div className="pdx-hero-actions">
                {accSettingsAccess && (
                  <button
                    type="button"
                    className="pdx-cta"
                    data-testid="employee-view-account-settings-button"
                    onClick={() => {
                      dispatch(setEmployeeAccountSettingsData(employeeAccountData));
                      navigate(`/account-settings/`);
                    }}
                  >
                    <span className="pdx-cta-icon">
                      <i className="ri-user-settings-line"></i>
                    </span>
                    <span className="pdx-cta-text">
                      <b>Account Settings</b>
                      <small>Profile, password &amp; more</small>
                    </span>
                    <i className="ri-arrow-right-line pdx-cta-arrow"></i>
                  </button>
                )}
                {otherEmpViewAccess === true && (
                  <Link to="/employee" className="pdx-ghost" data-testid="employee-view-back-link">
                    <i className="ri-arrow-left-line"></i>
                    Employees
                  </Link>
                )}
              </div>
            </div>

            <div className="pdx-hero-foot">
              <div className="pdx-tabs" role="tablist">
                {EMPLOYEE_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === t.id}
                    className={`pdx-tab${activeTab === t.id ? " is-active" : ""}`}
                    onClick={() => toggleTab(t.id)}
                    data-testid={testId("employee-view-tab", t.label)}
                  >
                    <i className={t.icon}></i>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Row>
            <Col lg={12}>
              <div>

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
