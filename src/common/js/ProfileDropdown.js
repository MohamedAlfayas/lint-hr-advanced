import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setShowTeamTable } from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { PostApi } from "../api/PostApi";
import { generateToken } from "../../firebase";

// Default avatar image (optional)
import avatar1 from "../../assets/images/users/avatar-1.jpg";

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userName, setUserName] = useState("Admin");
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);

  const { profile_data } = useSelector((state) => state.MyProfileReducer);

  useEffect(() => {
    if (profile_data?.first_name) {
      setUserName(profile_data.first_name);
    } else {
      setUserName("Admin");
    }
  }, [profile_data]);

  const toggleProfileDropdown = () => {
    setIsProfileDropdown((prev) => !prev);
  };

  const logout = async () => {
    try {
      const newFCMToken = await generateToken();

      const values = {
        device_type: 1,
        fcm_token: newFCMToken,
      };

      const token = JSON.parse(localStorage.getItem("lint_hr_token"));

      if (token?.refresh) {
        values.refresh_token = token.refresh;
      }

      const Api = await PostApi("employee/auth/logout/", values, false);

      if (Api?.status === 200) {
        // ✅ Clear all relevant localStorage keys
        [
          "lint_hr_token",
          "lint_hr_v",
          "lint_hr_globaldata",
          "lint_hr_profile_data",
          "user_perm_list",
        ].forEach((key) => localStorage.removeItem(key));

        // ✅ Handle multi-tab logout with BroadcastChannel
        if (!window.logoutChannel) {
          window.logoutChannel = new BroadcastChannel("logoutChannel");
        }
        window.logoutChannel.postMessage("logoutEvent");

        dispatch(setShowTeamTable(false));

        toast.success("Logged Out Successfully");
        navigate("/auth/login");
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail || "Logout failed");
      }
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("An unexpected error occurred during logout.");
    }
  };

  return (
    <Dropdown
      isOpen={isProfileDropdown}
      toggle={toggleProfileDropdown}
      className="ms-sm-3 header-item topbar-user"
    >
      <DropdownToggle tag="button" type="button" className="btn">
        <span className="d-flex align-items-center">
          {profile_data?.profile_url ? (
            <img
              className="rounded-circle header-profile-user"
              style={{ objectFit: "cover" }}
              src={profile_data.profile_url}
              alt={profile_data.first_name || "Profile"}
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
              title={userName}
            >
              <span
                className="first_letter"
                style={{ color: "white", fontWeight: 500 }}
              >
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <span className="text-start ms-xl-2">
            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
              {userName}
            </span>
          </span>
        </span>
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu-end">
        <h6 className="dropdown-header">Welcome {userName}!</h6>

        <DropdownItem tag={Link} to="/profile">
          <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
          <span className="align-middle">Profile</span>
        </DropdownItem>

        <DropdownItem>
          <i className="mdi mdi-message-text-outline text-muted fs-16 align-middle me-1"></i>
          <span className="align-middle">Messages</span>
        </DropdownItem>

        <DropdownItem>
          <i className="mdi mdi-calendar-check-outline text-muted fs-16 align-middle me-1"></i>
          <span className="align-middle">Taskboard</span>
        </DropdownItem>

        <DropdownItem>
          <i className="mdi mdi-lifebuoy text-muted fs-16 align-middle me-1"></i>
          <span className="align-middle">Help</span>
        </DropdownItem>

        <div className="dropdown-divider" />

        <DropdownItem>
          <i className="mdi mdi-wallet text-muted fs-16 align-middle me-1"></i>
          <span className="align-middle">
            Balance: <b>$0.00</b>
          </span>
        </DropdownItem>

        <DropdownItem>
          <span className="badge bg-success-subtle text-success mt-1 float-end">
            New
          </span>
          <i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i>
          <span className="align-middle">Settings</span>
        </DropdownItem>

        <DropdownItem>
          <i className="mdi mdi-lock text-muted fs-16 align-middle me-1"></i>
          <span className="align-middle">Lock screen</span>
        </DropdownItem>

        <DropdownItem onClick={logout}>
          <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
          <span className="align-middle" data-key="t-logout">
            Logout
          </span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
