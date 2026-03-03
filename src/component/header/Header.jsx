import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
// import { FaSearch } from "react-icons/fa";
//import images
import logoSm from "../../assets/images/logo-sm.png";
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import Select, { components } from "react-select";
import { changeSidebarVisibilityAction } from "../../redux/reducers/ChildReducer/LayoutReducer";
import { Col, Dropdown, DropdownMenu, DropdownToggle, Form } from "reactstrap";
import LightDark from "../../common/js/LightDark";
import NotificationDropdown from "../../common/js/NotificationDropdown";
import ProfileDropdown from "../../common/js/ProfileDropdown";
import RSBForm from "../common/form/CommonForm";
import Forms from "../common/form/CommonForm";
import CommonForm from "../common/form/CommonForm";
import WebCheckInOut from "../common/timer/WebCheckInOut";
import { leftsidbarSizeTypes } from "../../layout/Constants";
import { path_list_for_timer_hide } from "../../common/constant/Constants";
import {
  VIEW_ALL_EMPLOYEE_ACCESS_KEY,
  VIEW_TEAM_EMPLOYEE_ACCESS_KEY,
} from "../../common/constant/RoleConstants";
import { GetTotalWorkDuration } from "../../common/js/GetTotalWorkDuration";
import { setMyProfileDataReducer } from "../../redux/reducers/ChildReducer/MyProfileReducer";
import { EmployeeDisplayInSelect } from "../../common/js/EmployeeDisplayInSelect";
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { employee_view_component_name } from "../../common/constant/Constants";
import { setEmployeeLeaveType } from "../../redux/reducers/ChildReducer/EmployeeLeaveReducer";
import TimeLineList from "../common/timeLine/TimeLineList";

const Header = ({ onChangeLayoutMode, layoutModeType, headerClass }) => {
  const dispatch = useDispatch();
  const { sidebarVisibilitytype } = useSelector((state) => state.LayoutReducer);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const employee_data = GetLocalStorageData("employee");
  const department_data = GetLocalStorageData("department");
  const { id } = useParams();
  const { show_attendance_timer } = useSelector(
    (state) => ({
      show_attendance_timer: state.ClockReducer.show_attendance_timer,
    }),
    shallowEqual
  );

  useEffect(() => {
    Api({
      type: "GET",
      url: "employee/get-my-team-members/",
    })
      .then((res) => {
        const response = res?.data?.data;

        // Map employee IDs to employee objects
        let emp_options = response
          .map((d) => employee_data.find((e) => e.id === d))
          // Keep only active employees
          .filter((emp) => emp?.is_active === true);

        setEmployeeOptions(emp_options);
      })
      .catch((err) => {
        console.log("Something Went Wrong !!");
      });
  }, []);
  const [showEmpTeam, setShowEmpTeam] = useState(false);
  const [showEmpAll, setShowEmpAll] = useState(false);
  const [hideTimer, setHideTimer] = useState(false);
  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));

  const emp_department = profile_data.primary_department_id_list
    ? department_data.filter((d) =>
        (profile_data?.primary_department_id_list).includes(d.id)
      )
    : [];

  useEffect(() => {
    if (profile_data.permission_list.includes(VIEW_TEAM_EMPLOYEE_ACCESS_KEY)) {
      setShowEmpTeam(true);
    }
    if (profile_data.permission_list.includes(VIEW_ALL_EMPLOYEE_ACCESS_KEY)) {
      setShowEmpAll(true);
    }

    if (profile_data.length > 0) {
      const isMobileCheckinAllowed = profile_data.can_web_checkin || false;

      setHideTimer(isMobileCheckinAllowed);
    }
  }, []);

  const toogleMenuBtn = () => {
    var windowSize = document.documentElement.clientWidth;
    dispatch(changeSidebarVisibilityAction("show"));

    if (windowSize > 767) {
      var myElement = document.querySelector(".hamburger-icon");
      if (myElement.classList.contains("open")) {
        localStorage.setItem("is_menu_open", "");
        localStorage.setItem("left_side_bar_type", leftsidbarSizeTypes.DEFAULT);
      } else {
        localStorage.setItem("is_menu_open", "open");
        localStorage.setItem(
          "left_side_bar_type",
          leftsidbarSizeTypes.SMALLICON
        );
      }
      document.querySelector(".hamburger-icon").classList.toggle("open");
    }

    //For collapse vertical and semibox menu
    if (
      sidebarVisibilitytype === "show" &&
      (document.documentElement.getAttribute("data-layout") === "vertical" ||
        document.documentElement.getAttribute("data-layout") === "semibox")
    ) {
      if (windowSize < 1025 && windowSize > 767) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "sm"
          ? document.documentElement.setAttribute("data-sidebar-size", "")
          : document.documentElement.setAttribute("data-sidebar-size", "sm");
      } else if (windowSize > 1025) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "lg"
          ? document.documentElement.setAttribute("data-sidebar-size", "sm")
          : document.documentElement.setAttribute("data-sidebar-size", "lg");
      } else if (windowSize <= 767) {
        document.body.classList.add("vertical-sidebar-enable");
        document.documentElement.setAttribute("data-sidebar-size", "lg");
      }
    }
  };

  const navigate = useNavigate();

  const handleEmployeeChange = (e) => {
    const emp_uid = employeeOptions.find((f) => f.id === e.value).emp_uuid;

    navigate(`/employee/view/${emp_uid}`);
    Api({
      type: "GET",
      url: `leave/get-leave-type-details-for-employee/?employee_id=${e.value}`,
    })
      .then((res) => {
        dispatch(setEmployeeLeaveType(res?.data?.data));
      })
      .catch((err) => {
        console.log("Something Went Wrong!!!");
      });
  };

  const location = useLocation();

  return (
    <React.Fragment>
      <header id="page-topbar" className={headerClass}>
        <div className="layout-width">
          <div className="navbar-header">
            <div className="d-flex">
              <div className="navbar-brand-box horizontal-logo">
                <Link to="/" className="logo logo-dark">
                  <span className="logo-sm">
                    <img src={logoSm} alt="" height="22" />
                  </span>
                  <span className="logo-lg">
                    <img src={logoDark} alt="" height="17" />
                  </span>
                </Link>

                <Link to="/" className="logo logo-light">
                  <span className="logo-sm">
                    <img src={logoSm} alt="" height="22" />
                  </span>
                  <span className="logo-lg">
                    <img src={logoLight} alt="" height="17" />
                  </span>
                </Link>
              </div>

              <button
                onClick={toogleMenuBtn}
                type="button"
                className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
                id="topnav-hamburger-icon"
              >
                <span className="hamburger-icon ">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
              {location.pathname.includes(employee_view_component_name) &&
                (showEmpAll || showEmpTeam) && (
                  <div
                    className="form-icon right"
                    style={{ marginTop: "17px" }}
                  >
                    <Col lg={12}>
                      <Select
                        name="employee_attendance"
                        id="employee_attendance"
                        options={employeeOptions || []}
                        components={{
                          Option: EmployeeDisplayInSelect,
                        }}
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            width: "200px",
                            margin: 0,
                            padding: 0,
                          }),
                        }}
                        placeholder="Select Employee"
                        value={
                          (id &&
                            employeeOptions.find((e) => e.emp_uuid === id)) ||
                          []
                        }
                        onChange={handleEmployeeChange}
                      />
                    </Col>
                  </div>
                )}
            </div>

            <div
              className="d-flex align-items-center"
              style={{ paddingRight: show_attendance_timer ? "0px" : "55px" }}
            >
              {path_list_for_timer_hide.includes(location.pathname) ? null : (
                <WebCheckInOut showTimer={true} hideTimer={hideTimer} />
              )}

              {/* LanguageDropdown */}
              {/* <LanguageDropdown /> */}

              {/* WebAppsDropdown */}
              {/* <WebAppsDropdown /> */}

              {/* MyCartDropdwon */}
              {/* <MyCartDropdown /> */}

              {/* FullScreenDropdown */}
              {/* <FullScreenDropdown /> */}

              {/* RightSideBar Form View */}
               <CommonForm />

              <TimeLineList />


              {/* Dark/Light Mode set */}
              <LightDark
                layoutMode={layoutModeType}
                onChangeLayoutMode={onChangeLayoutMode}
              />

              {/* NotificationDropdown */}
              <NotificationDropdown />

              {/* ProfileDropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

export default Header;
