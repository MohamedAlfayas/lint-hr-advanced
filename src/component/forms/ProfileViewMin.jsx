import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import classnames from "classnames";

import {
  Button,
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Input,
  Label,
  Nav,
  NavItem,
  Row,
  TabContent,
  TabPane,
  Table,
  UncontrolledDropdown,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import DummyUserImg from "../../assets/images/users/user.png";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { ConvertDateFormat } from "../../common/js/ConvertDateFormat";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { Api } from "../../common/api/Api";
import { parse, format } from "date-fns";
import Column from "antd/es/table/Column";
import { ConvertSecondsToTime } from "../../common/js/ConvertSecondsToTime";
import { ParseTime } from "../../common/js/ParseTime";
const ProfileViewMin = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const DepartmentData = GetLocalStorageData("department") || [];
  const WorkScheduleData = GetLocalStorageData("work_schedule") || [];
  console.log("WS Data = ", WorkScheduleData);
  const [profileObj, setProfileObj] = useState({});
  const [empId, setEmpId] = useState(0);
  const [individualAttendanceReportData, setIndividualAttendanceReportData] =
    useState([]);

  useEffect(() => {
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    Api({
      type: "GET",
      url: "attendance/get_attendance_entry_log/?thisMonth=" + thisMonth,
    })
      .then((res) => {
        setIndividualAttendanceReportData(res?.data?.data);
        // dispatch(setIndividualAttendanceReportData(res?.data?.data));
      })
      .catch((err) => {
        console.log("Something Went Wrong !!");
      });
  }, []);

  useEffect(() => {
    console.log("Form Obj = ", form_obj);
    if (form_obj) {
      setProfileObj(form_obj);
      setEmpId(form_obj.id);
    }
  }, [form_obj]);

  // Custom Tabs Bordered
  const [customActiveTab, setcustomActiveTab] = useState("1");
  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab);
    }
    console.log(customActiveTab);
  };

  const navigate = useNavigate();

  return (
    <React.Fragment>
      <Row>
        <div className="p-2 text-center">
          <img
            src={profileObj.profile_url ? profileObj.profile_url : DummyUserImg}
            alt="Employee"
            className="avatar-lg img-thumbnail rounded-circle mx-auto border-success"
          />
          <div className="mt-3">
            <h5 className="fs-15 profile-name">
              <Link to="#" className="link-primary">
                {profileObj?.fname || ""}
              </Link>
            </h5>
            <p className="text-muted profile-designation">
              {profileObj?.primary_department
                ? DepartmentData.length
                  ? DepartmentData.find(
                      (d) => d.id === profileObj?.primary_department
                    )?.name
                  : ""
                : ""}
            </p>
            <div className="  mb-3 align-center">
              <span className="text-muted">
                <i className="ri-at-line me-1 align-bottom"></i>{" "}
                <span className="view-companyname">
                  <Link
                    to={`mailto:${profileObj?.email || ""}`}
                    className="link-primary"
                  >
                    {profileObj?.email || ""}
                  </Link>
                </span>
              </span>
              <span className="text-muted">
                <i className="ri-phone-line me-1 ms-2 align-bottom"></i>{" "}
                <span className="view-location">
                  <Link
                    to={`tel:${profileObj?.contact_number || ""}`}
                    className="link-primary"
                  >
                    {profileObj?.contact_number || ""}
                  </Link>
                </span>
              </span>
            </div>
          </div>
        </div>
        <Row className="g-0 text-center">
          <Col xs={4}>
            <div className="p-3 border border-dashed border-start-0">
              <h5 className="mb-1 profile-project">09:00</h5>
              <p className="text-muted mb-0">Check In</p>
            </div>
          </Col>
          <Col xs={4}>
            <div className="p-3 border border-dashed border-start-0">
              <h5 className="mb-1 profile-task">00:00</h5>
              <p className="text-muted mb-0">Check Out</p>
            </div>
          </Col>
          <Col xs={4}>
            <div className="p-3 border border-dashed border-end-0">
              <h5 className="mb-1 profile-task">07:00</h5>
              <p className="text-muted mb-0">Working Hrs</p>
            </div>
          </Col>
        </Row>
        <div className="table-responsive table-card p-3">
          <h5 className="fs-15 mb-2 mt-3 ms-3">Basic Details</h5>

          <Table className="table table-borderless mb-0">
            <tbody>
              <tr>
                <td className="fw-medium">DOB</td>
                <td>
                  {(profileObj?.dob && ConvertDateFormat(profileObj?.dob)) ||
                    ""}
                </td>
              </tr>
              <tr>
                <td className="fw-medium">Gender</td>
                <td>{profileObj?.gender || ""}</td>
              </tr>
              <tr>
                <td className="fw-medium">Work Schedule</td>
                <td>
                  {profileObj?.work_schedule
                    ? WorkScheduleData.length
                      ? WorkScheduleData.find(
                          (w) => w.id === profileObj?.work_schedule
                        ).name
                      : ""
                    : ""}
                </td>
              </tr>
              <tr>
                <td className="fw-medium">Sub Departments</td>
                <td>
                  {profileObj?.sub_department
                    ? profileObj?.sub_department.map((d) => (
                        <span
                          className="badge bg-primary-subtle text-primary me-1"
                          key={1}
                        >
                          {DepartmentData.length
                            ? DepartmentData.find((e) => e.id === d).name
                            : ""}
                        </span>
                      ))
                    : null}
                </td>
              </tr>
              <tr>
                <td className="fw-medium">Joining Date</td>
                <td>
                  <small className="text-muted">
                    {(profileObj?.joining_date &&
                      ConvertDateFormat(profileObj?.joining_date)) ||
                      ""}
                  </small>
                </td>
              </tr>
              {profileObj?.cf_values &&
                (profileObj?.cf_values).map((c) => (
                  <tr>
                    <td className="fw-medium">{c.name}</td>
                    <td>{c.value}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
        <div className="p-3 border border-dashed border-end-0 border-start-0">
          <Nav
            tabs
            className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3"
          >
            <NavItem>
              <NavLink
                to="#"
                style={{ cursor: "pointer" }}
                className={customActiveTab === "1" ? "active nav-link" : "mt-2"}
                onClick={() => {
                  toggleCustom("1");
                }}
              >
                Attendance
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                to="#"
                style={{ cursor: "pointer" }}
                className={customActiveTab === "2" ? "active nav-link" : "mt-2"}
                onClick={() => {
                  toggleCustom("2");
                }}
              >
                Payrol
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                to="#"
                style={{ cursor: "pointer" }}
                className={customActiveTab === "3" ? "active nav-link" : "mt-2"}
                onClick={() => {
                  toggleCustom("3");
                }}
              >
                Activity
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={customActiveTab} className="text-muted">
            <TabPane tabId="1" id="home1">
              <SimpleBar style={{ maxHeight: "215px" }}>
                <Table className="table table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td>
                        <strong>Date</strong>
                      </td>
                      <td>
                        <strong>In</strong>
                      </td>
                      <td>
                        <strong>Out</strong>
                      </td>
                      <td>
                        <strong>Total</strong>
                      </td>
                    </tr>

                    {individualAttendanceReportData.map((item) => (
                      <tr key={item.id}>
                        <td className="fw-medium">
                          {format(new Date(item.date), "dd MMM, yyyy")}
                        </td>
                        <td>
                          {!!item?.first_check_in
                            ? format(ParseTime(item?.first_check_in), "h:mm a")
                            : null}
                        </td>
                        <td>
                          {!!item?.last_check_out
                            ? format(ParseTime(item?.last_check_out), "h:mm a")
                            : null}
                        </td>
                        <td
                          className={item.totalColor}
                        >{` ${ConvertSecondsToTime(
                          item?.total_work_duration
                        )}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </SimpleBar>
            </TabPane>
            <TabPane tabId="2">
              <p>Pending</p>
            </TabPane>
            <TabPane tabId="3">
              <SimpleBar style={{ maxHeight: "215px" }}>
                <Table className="table table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td>
                        <strong>Time</strong>
                      </td>
                      <td>
                        <strong>Event</strong>
                      </td>
                      <td>
                        <strong>Source</strong>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-medium">10 min ago</td>
                      <td>Check Out</td>
                      <td>Door Tap</td>
                    </tr>
                    <tr>
                      <td className="fw-medium">2 hr ago</td>
                      <td>Check In</td>
                      <td>Door Tap</td>
                    </tr>
                    <tr>
                      <td className="fw-medium">2:15 hr ago</td>
                      <td>Check Out</td>
                      <td>Door Tap</td>
                    </tr>
                    <tr>
                      <td className="fw-medium">4:15 hr ago</td>
                      <td>Check In</td>
                      <td>Door Tap</td>
                    </tr>
                    <tr>
                      <td className="fw-medium">4:45 hr ago</td>
                      <td>Check Out</td>
                      <td>Door Tap</td>
                    </tr>
                    <tr>
                      <td className="fw-medium">8:15 hr ago</td>
                      <td>Check In</td>
                      <td>Mobile</td>
                    </tr>
                  </tbody>
                </Table>
              </SimpleBar>
            </TabPane>
          </TabContent>
        </div>

        <div className="offcanvas-foorter border p-3 hstack gap-3 text-center position-relative">
          <button className="btn btn-light w-100">
            <i className="ri-at-line align-bottom ms-1"></i> Send Email
          </button>
          <Button
            // to={`/employee/view/${empId}`}
            onClick={() => {
              dispatch(toggleRSBView(false));
              navigate(`/employee/view/${empId}`);
            }}
            className="btn btn-primary w-100"
          >
            <i className="ri-user-3-line align-bottom ms-1"></i> View Profile
          </Button>
        </div>
      </Row>
    </React.Fragment>
  );
};

export default ProfileViewMin;
