import React, { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

//import images
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setShowTeamTable } from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { PostApi } from "../api/PostApi";
import { generateToken } from "../../firebase";

const ProfileDropdown = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");

  const { profile_data } = useSelector((state) => state.MyProfileReducer);

  useEffect(() => {
    !!profile_data?.fname
      ? setUserName(profile_data?.fname)
      : setUserName("Admin");
  }, [profile_data]);

  const dispatch = useDispatch();

  const logout = async () => {
    const newFCMToken = await generateToken();

    console.log("newFCMToken On Logout = ", newFCMToken);

    const values = {
      device_type: 1,
      fcm_token: newFCMToken,
    };

    const token = JSON.parse(localStorage.getItem("lint_hr_token"));

    if (token) {
      values["refresh_token"] = token?.refresh;
    }

    const Api = await PostApi("employee/auth/logout/", values, false);

    if (Api.status && Api.status === 200) {
      localStorage.removeItem("lint_hr_token");
      localStorage.removeItem("lint_hr_v");
      localStorage.removeItem("lint_hr_globaldata");
      localStorage.removeItem("lint_hr_profile_data");
      localStorage.removeItem("user_perm_list");

      if (window.logoutChannel) {
        window.logoutChannel.close();
      }

      // Create a new broadcast channel
      window.logoutChannel = new BroadcastChannel("logoutChannel");

      // Broadcast logout event to other tabs
      window.logoutChannel.postMessage("logoutEvent");

      dispatch(setShowTeamTable(false));

      toast.success("Logged Out Successfully");
      navigate("/auth/login");
    } else {
      toast.error(Api?.data?.message || Api?.data?.detail);
    }
  };

  //Dropdown Toggle
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const toggleProfileDropdown = () => {
    setIsProfileDropdown(!isProfileDropdown);
  };

  return (
    <React.Fragment>
      <Dropdown
        isOpen={isProfileDropdown}
        toggle={toggleProfileDropdown}
        className="ms-sm-3 header-item topbar-user"
      >
        <DropdownToggle tag="button" type="button" className="btn">
          <span className="d-flex align-items-center">
            {!!profile_data?.profile_url ? (
              <img
                className="rounded-circle header-profile-user"
                style={{ objectFit: "cover" }}
                src={profile_data?.profile_url}
                alt={profile_data?.fname}
              />
            ) : (
              <div
                className="avatar-xs rounded-circle"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#0ab39c",
                }}
                data-bs-toggle="tooltip"
                title={userName}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {userName.charAt(0)}
                </span>
              </div>
            )}

            <span className="text-start ms-xl-2">
              <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                {userName}
              </span>
              {/* <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">Founder</span> */}
            </span>
          </span>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <h6 className="dropdown-header">Welcome {userName}!</h6>
          <DropdownItem className="p-0">
            <Link
              to={"/profile"}
              className="dropdown-item"
            >
              <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
              <span className="align-middle">Profile</span>
            </Link>
          </DropdownItem>
          <DropdownItem className="p-0">
            <Link
              // to={"/apps-chat"}
              className="dropdown-item"
            >
              <i className="mdi mdi-message-text-outline text-muted fs-16 align-middle me-1"></i>{" "}
              <span className="align-middle">Messages</span>
            </Link>
          </DropdownItem>
          <DropdownItem className="p-0">
            <Link
              //  to={"#"}
              className="dropdown-item">
              <i className="mdi mdi-calendar-check-outline text-muted fs-16 align-middle me-1"></i>{" "}
              <span className="align-middle">Taskboard</span>
            </Link>
          </DropdownItem>
          <DropdownItem className="p-0">
            <Link
              // to={"/pages-faqs"}
              className="dropdown-item"
            >
              <i className="mdi mdi-lifebuoy text-muted fs-16 align-middle me-1"></i>{" "}
              <span className="align-middle">Help</span>
            </Link>
          </DropdownItem>
          <div className="dropdown-divider"></div>
          <DropdownItem className="p-0">
            <Link
              // to={"/pages-profile"}
              className="dropdown-item"
            >
              <i className="mdi mdi-wallet text-muted fs-16 align-middle me-1"></i>{" "}
              <span className="align-middle">
                Balance : <b>$0.00</b>
              </span>
            </Link>
          </DropdownItem>
          <DropdownItem className="p-0">
            <Link
              // to={"/pages-profile-settings"}
              className="dropdown-item"
            >
              <span className="badge bg-success-subtle text-success mt-1 float-end">
                New
              </span>
              <i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i>{" "}
              <span className="align-middle">Settings</span>
            </Link>
          </DropdownItem>
          <DropdownItem className="p-0">
            <Link
              // to={"/auth-lockscreen-basic"}
              className="dropdown-item"
            >
              <i className="mdi mdi-lock text-muted fs-16 align-middle me-1"></i>{" "}
              <span className="align-middle">Lock screen</span>
            </Link>
          </DropdownItem>
          <DropdownItem className="p-0">
            <button onClick={logout} className="dropdown-item">
              <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "}
              <span className="align-middle" data-key="t-logout">
                Logout
              </span>
            </button>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default ProfileDropdown;
