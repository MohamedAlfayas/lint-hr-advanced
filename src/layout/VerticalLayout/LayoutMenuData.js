import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VIEW_ALL_EMPLOYEE_ACCESS_KEY, VIEW_TEAM_EMPLOYEE_ACCESS_KEY } from "../../common/constant/RoleConstants";

const Navdata = () => {
  const history = useNavigate();
  //state data
  const [isDashboard, setIsDashboard] = useState(false);
  const [isApps, setIsApps] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isPages, setIsPages] = useState(false);
  const [isBaseUi, setIsBaseUi] = useState(false);
  const [isAttendance, setIsAttendance] = useState(false);
  const [isAdvanceUi, setIsAdvanceUi] = useState(false);
  const [isForms, setIsForms] = useState(false);
  const [isTables, setIsTables] = useState(false);
  const [isCharts, setIsCharts] = useState(false);
  const [isIcons, setIsIcons] = useState(false);
  const [isMaps, setIsMaps] = useState(false);
  const [isMultiLevel, setIsMultiLevel] = useState(false);

  // Apps
  const [isEmail, setEmail] = useState(false);
  const [isSubEmail, setSubEmail] = useState(false);
  const [isEcommerce, setIsEcommerce] = useState(false);
  const [isProjects, setIsProjects] = useState(false);
  const [isTasks, setIsTasks] = useState(false);
  const [isCRM, setIsCRM] = useState(false);
  const [isCrypto, setIsCrypto] = useState(false);
  const [isInvoices, setIsInvoices] = useState(false);
  const [isSupportTickets, setIsSupportTickets] = useState(false);
  const [isNFTMarketplace, setIsNFTMarketplace] = useState(false);
  const [isJobs, setIsJobs] = useState(false);
  const [isJobList, setIsJobList] = useState(false);
  const [isCandidateList, setIsCandidateList] = useState(false);

  // Authentication
  const [isSignIn, setIsSignIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isPasswordCreate, setIsPasswordCreate] = useState(false);
  const [isLockScreen, setIsLockScreen] = useState(false);
  const [isLogout, setIsLogout] = useState(false);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [isVerification, setIsVerification] = useState(false);
  const [isError, setIsError] = useState(false);

  // Pages
  const [isProfile, setIsProfile] = useState(false);
  const [isLanding, setIsLanding] = useState(false);

  // Charts
  const [isApex, setIsApex] = useState(false);

  // Multi Level
  const [isLevel1, setIsLevel1] = useState(false);
  const [isLevel2, setIsLevel2] = useState(false);

  const [iscurrentState, setIscurrentState] = useState("Dashboard");

  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute("subitems")) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("subitems");
        if (document.getElementById(id))
          document.getElementById(id).classList.remove("show");
      });
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "Dashboard") {
      setIsDashboard(false);
    }
    if (iscurrentState !== "Apps") {
      setIsApps(false);
    }
    if (iscurrentState !== "Auth") {
      setIsAuth(false);
    }
    if (iscurrentState !== "Pages") {
      setIsPages(false);
    }
    if (iscurrentState !== "BaseUi") {
      setIsBaseUi(false);
    }
    if (iscurrentState !== "Attendance") {
      setIsAttendance(false);
    }
    if (iscurrentState !== "AdvanceUi") {
      setIsAdvanceUi(false);
    }
    if (iscurrentState !== "Forms") {
      setIsForms(false);
    }
    if (iscurrentState !== "Tables") {
      setIsTables(false);
    }
    if (iscurrentState !== "Charts") {
      setIsCharts(false);
    }
    if (iscurrentState !== "Icons") {
      setIsIcons(false);
    }
    if (iscurrentState !== "Maps") {
      setIsMaps(false);
    }
    if (iscurrentState !== "MuliLevel") {
      setIsMultiLevel(false);
    }
    if (iscurrentState === "Widgets") {
      history("/widgets");
      document.body.classList.add("twocolumn-panel");
    }
    if (iscurrentState !== "Landing") {
      setIsLanding(false);
    }
  }, [
    history,
    iscurrentState,
    isDashboard,
    isApps,
    isAuth,
    isPages,
    isBaseUi,
    isAttendance,
    isAdvanceUi,
    isForms,
    isTables,
    isCharts,
    isIcons,
    isMaps,
    isMultiLevel,
  ]);

  const menuItems = () => {

    const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data"));

    let menuList = [
      {
        label: "Menu",
        isHeader: true,
      },
      {
        id: "dashboard",
        label: "Dashboards",
        icon: "ri-dashboard-2-line",
        link: "/dashboard",
        parentId: "dashboard",
        perm: "all",
        stateVariables: isDashboard,
      },
      {
        label: "General",
        isHeader: true,
      },
      {
        id: "employee",
        label: "Employee",
        link: "/employee",
        parentId: "baseUi",
        perm: [VIEW_ALL_EMPLOYEE_ACCESS_KEY, VIEW_TEAM_EMPLOYEE_ACCESS_KEY],
        icon: "ri-account-circle-line",
      },
      {
        id: "attendance",
        label: "Atttendance",
        icon: " ri-user-follow-line",
        perm: "all",
        link: "/#",
        click: function (e) {
          e.preventDefault();
          setIsAttendance(!isAttendance);
          setIscurrentState("Attendance");
          updateIconSidebar(e);
        },
        stateVariables: isAttendance,
        subItems: [
          {
            id: "attendance",
            label: "Att.Overview",
            link: "/attendance",
            parentId: "baseUi",
            perm: "all",
          },
          {
            id: "holidays",
            label: "Holidays",
            link: "/holidays",
            parentId: "baseUi",
            perm: "all",
          },
          {
            id: "leaves",
            label: "Leave",
            link: "/leaves",
            parentId: "baseUi",
            perm: "all",
          },
          {
            id: "approval",
            label: "Approval",
            link: "/approval",
            parentId: "baseUi",
            perm: [
              "8d33a155-2d7e-4a5d-8608-35431a44662c",
              "2ebd3c5d-dca8-45cc-8334-5a32f2451893",
              "1b5d106f-f3e8-41f3-8041-d3f71a19d27d",
              "08cd201a-d20d-45d3-8b60-3a6fb7e4acc0"
            ],
          },
          // {
          //   id: "leaveapproval",
          //   label: "Leave Approval",
          //   link: "/leave-approval",
          //   parentId: "baseUi",
          //   perm: "leave_apporval",
          // },
          {
            id: "leavetype",
            label: "Leave Type",
            link: "/leavetype",
            parentId: "baseUi",
            perm: [],
          },
          {
            id: "workschedule",
            label: "WorkSchedule",
            link: "/workschedule",
            parentId: "baseUi",
            perm: [],
          },

          // {
          //   id: "customfield",
          //   label: "Custom Field",
          //   link: "/custom-field",
          //   parentId: "baseUi",
          //   perm: "custom_field",
          // },

          // {
          //   id: "attendanceconfig",
          //   label: "Attendance Configuration",
          //   link: "/attendanceconfig",
          //   parentId: "baseUi",
          //   perm: "attendance_config",
          // },

          // {
          //   id: "payrollconfig",
          //   label: "Pay Roll Configuration",
          //   link: "/payrollconfig",
          //   parentId: "baseUi",
          //   perm: "payroll_config",
          // },
        ],
      },
      {
        id: "payroll",
        label: "Pay Roll",
        link: "/payroll",
        parentId: "payroll",
        perm: "all",
        icon: " ri-currency-line",
      },
      {
        id: "attendancereport",
        label: "Report",
        link: "/attendancereport",
        parentId: "baseUi",
        perm: ["c77528b2-5d9f-49ad-b6d1-5f95e61a66a0"],
        icon: "ri-file-chart-line",
      },
      {
        id: "baseUi",
        label: "Configuration",
        icon: "ri-settings-3-line",
        link: "/organization",
        perm: ["dac690d1-6712-4aa6-9b4f-7d71bc4f8eb1"],
        click: function (e) {
          e.preventDefault();
          setIsBaseUi(!isBaseUi);
          setIscurrentState("BaseUi");
          updateIconSidebar(e);
        },
      },
    ]


    if (!!profile_data && !!profile_data.is_admin && profile_data?.is_admin === true) {
      return menuList
    }
    else if (!!profile_data && !!profile_data.permission_list) {
      let updated_menu = [];
      menuList.map((route) => {
        if (
          (Array.isArray(route?.perm) &&
            (route?.perm).some((d) =>
              profile_data?.permission_list.includes(d)
            )) ||
          (typeof route?.perm === "string" && route?.perm === "all") ||
          (route.isHeader === true)
        ) {
          let thisSubMenu = route.subItems;
          let updatedSubMenu = [];

          if (!!thisSubMenu) {
            thisSubMenu.map((ts) => {
              if (
                (Array.isArray(ts?.perm) &&
                  (ts?.perm).some((d) =>
                    profile_data?.permission_list.includes(d)
                  )) ||
                (typeof ts?.perm === "string" && ts?.perm === "all")
              ) {
                updatedSubMenu.push(ts);
              }
            });

            route.subItems = updatedSubMenu;
          }

          updated_menu.push(route);
        }
      });

      return updated_menu
    }
    else {
      return menuList
    }
  }


  return <React.Fragment>{menuItems()}</React.Fragment>;
};
export default Navdata;
