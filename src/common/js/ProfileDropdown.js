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
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import "./ProfileDropdown.scss";

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { showLoader } = useSelector((state) => state.LoaderReducer);

  const [userName, setUserName] = useState("Admin");
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { profile_data } = useSelector((state) => state.MyProfileReducer);

  useEffect(() => {
    if (profile_data?.first_name) {
      setUserName(profile_data.first_name);
    } else {
      setUserName("Admin");
    }
    setImgError(false);
  }, [profile_data]);

  const toggleProfileDropdown = () => {
    setIsProfileDropdown((prev) => !prev);
  };

  const logout = async () => {
    dispatch(setLoaderVisible(true))
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
        dispatch(setLoaderVisible(false));

        toast.success("Logged Out Successfully");
        navigate("/auth/login", { replace: true });
      } else {
        dispatch(setLoaderVisible(false))
        toast.error(Api?.data?.message || Api?.data?.detail || "Logout failed");
      }
    } catch (error) {
      dispatch(setLoaderVisible(false))
      console.error("Logout Error:", error);
      toast.error("An unexpected error occurred during logout.");
    }
  };


  const goToProfile = () => {
    let emp_uuid = profile_data?.emp_uuid
    if (emp_uuid != null && emp_uuid != undefined && emp_uuid != "") {
      navigate(`/employee/view/${emp_uuid}`)
    }
    else {
      toast.error("Something Went Wrong !!")
    }
  }

  const fullName =
    [profile_data?.first_name, profile_data?.last_name].filter(Boolean).join(" ") || userName;
  const email = profile_data?.email;
  const isAdmin = profile_data?.is_admin === true;

  const avatar = (size) =>
    profile_data?.profile_url && !imgError ? (
      <img
        className={`pdd-avatar ${size}`}
        src={profile_data.profile_url}
        alt={fullName}
        onError={() => setImgError(true)}
      />
    ) : (
      <span className={`pdd-avatar is-text ${size}`} title={fullName}>
        {userName.charAt(0).toUpperCase()}
      </span>
    );

  return (
    <Dropdown
      isOpen={isProfileDropdown}
      toggle={toggleProfileDropdown}
      className="ms-sm-3 header-item topbar-user pdd"
    >
      <DropdownToggle data-testid="profile-menu-administrator-trigger" tag="button" type="button" className="btn pdd-toggle">
        <span className="d-flex align-items-center">
          <span className="pdd-avatar-wrap">
            {avatar("is-sm")}
            <span className="pdd-online" />
          </span>
          <span className="d-none d-xl-flex flex-column text-start ms-2 pdd-toggle-text">
            <span className="pdd-toggle-name">{userName}</span>
            <span className="pdd-toggle-role">{isAdmin ? "Administrator" : "Employee"}</span>
          </span>
          <i className={`ri-arrow-down-s-line d-none d-xl-inline ms-1 pdd-caret ${isProfileDropdown ? "is-open" : ""}`}></i>
        </span>
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu-end pdd-menu">
        <div className="pdd-hero">
          <span className="pdd-avatar-wrap">
            {avatar("is-lg")}
            <span className="pdd-online" />
          </span>
          <div className="pdd-hero-text">
            <span className="pdd-greet">Welcome back 👋</span>
            <h6 className="pdd-name" title={fullName}>{fullName}</h6>
            {email && <span className="pdd-mail" title={email}>{email}</span>}
            <span className={`pdd-role ${isAdmin ? "is-admin" : ""}`}>
              <i className={isAdmin ? "ri-shield-star-line" : "ri-user-line"}></i>
              {isAdmin ? "Administrator" : "Employee"}
            </span>
          </div>
        </div>

        <div className="pdd-list">
          <DropdownItem data-testid="profile-menu-my-profile-view-and-update-option" className="pdd-item" onClick={goToProfile}>
            <span className="pdd-item-icon">
              <i className="ri-user-3-line"></i>
            </span>
            <span className="pdd-item-text">
              <b>My Profile</b>
              <small>View and update your details</small>
            </span>
            <i className="ri-arrow-right-s-line pdd-item-arrow"></i>
          </DropdownItem>
        </div>

        <div className="pdd-foot">
          <DropdownItem data-testid="profile-menu-logout-option" className="pdd-logout" onClick={logout} disabled={showLoader}>
            <i className="ri-logout-box-r-line"></i>
            <span data-key="t-logout">Logout</span>
          </DropdownItem>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
