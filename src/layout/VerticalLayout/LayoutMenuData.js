import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  EMPLOYEE_VIEW_ACCESS_KEY,
  VIEW_HIERARCHY_EMPLOYEE_ACCESS_KEY,
  VIEW_TEAM_EMPLOYEE_ACCESS_KEY,
  CLIENT_VIEW_ACCESS_KEY,
  CREATE_CLIENT_ACCESS_KEY,
  EDIT_CLIENT_ACCESS_KEY,
  COMPANY_PROFILE_VIEW_ACCESS_KEY,
  UPDATE_COMPANY_PROFILE_ACCESS_KEY,
  DEPARTMENT_VIEW_ACCESS_KEY,
  CREATE_DEPARTMENT_ACCESS_KEY,
  BRANCH_VIEW_ACCESS_KEY,
  CUSTOM_FIELD_VIEW_ACCESS_KEY,
  ROLES_VIEW_ACCESS_KEY,
  FORMS_VIEW_ACCESS_KEY,
  LOCATION_GROUP_VIEW_ACCESS_KEY,
} from "../../common/constant/RoleConstants";

const Navdata = () => {
  const history = useNavigate();
  const location = useLocation();
  //state data
  const [isDashboard, setIsDashboard] = useState(false);
  const [isApps, setIsApps] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isPages, setIsPages] = useState(false);
  const [isBaseUi, setIsBaseUi] = useState(false);
  const [isAttendance, setIsAttendance] = useState(false);
  const [isControlPanel, setIsControlPanel] = useState(false);
  const [isReport, setIsReport] = useState(false);
  const [isAdvanceUi, setIsAdvanceUi] = useState(false);
  const [isForms, setIsForms] = useState(false);
  const [isTables, setIsTables] = useState(false);
  const [isCharts, setIsCharts] = useState(false);
  const [isIcons, setIsIcons] = useState(false);
  const [isMaps, setIsMaps] = useState(false);
  const [isMultiLevel, setIsMultiLevel] = useState(false);
  const [isContact, setIsContact] = useState(false);

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

  // ── Sync open menu with the active route (prevents Report opening by default)
  useEffect(() => {
    const path = location.pathname;

    const reportPaths = ["/attendancereport"];
    const crmPaths = ["/clients", "/projects", "/tasks", "/task-settings"];
    const attendancePaths = [
      "/attendance",
      "/holidays",
      "/leaves",
      "/approval",
      "/leavetype",
      "/workschedule",
    ];

    if (reportPaths.includes(path)) {
      setIsReport(true);
      setIscurrentState("Report");
    } else if (crmPaths.includes(path)) {
      setIsControlPanel(true);
      setIscurrentState("Control Panel");
    } else if (attendancePaths.includes(path)) {
      setIsAttendance(true);
      setIscurrentState("Attendance");
    } else {
      // not on any collapse route → keep all collapse menus closed
      setIsReport(false);
      setIsControlPanel(false);
      setIsAttendance(false);
    }
  }, [location.pathname]);

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
    if (iscurrentState !== "Control Panel") {
      setIsControlPanel(false);
    }
    if (iscurrentState !== "Report") {
      setIsReport(false);
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
    if (iscurrentState !== "Contact") {
      setIsContact(false);
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
    isControlPanel,
    isReport,
    isAdvanceUi,
    isForms,
    isTables,
    isCharts,
    isIcons,
    isMaps,
    isMultiLevel,
  ]);

  const menuItems = () => {
    const profile_data = JSON.parse(
      localStorage.getItem("lint_hr_profile_data"),
    );

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
        perm: [
          EMPLOYEE_VIEW_ACCESS_KEY,
          VIEW_HIERARCHY_EMPLOYEE_ACCESS_KEY,
          VIEW_TEAM_EMPLOYEE_ACCESS_KEY,
        ],
        icon: "ri-account-circle-line",
      },
      {
        id: "attendance",
        label: "Attendance",
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
              "08cd201a-d20d-45d3-8b60-3a6fb7e4acc0",
            ],
          },
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
        ],
      },
      {
        id: "reimbursement",
        label: "Reimbursement",
        link: "/my-reimbursements",
        parentId: "baseUi",
        perm: "all",
        icon: "ri-wallet-3-line",
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
        id: "report",
        label: "Report",
        parentId: "baseUi",
        perm: ["c77528b2-5d9f-49ad-b6d1-5f95e61a66a0"],
        icon: "ri-file-chart-line",
        link: "/#",
        click: function (e) {
          e.preventDefault();
          setIsReport(!isReport);
          setIscurrentState("Report");
          updateIconSidebar(e);
        },
        stateVariables: isReport,
        subItems: [
          {
            id: "attendancereport",
            label: "Attendance Report",
            link: "/attendancereport",
            parentId: "baseUi",
            perm: "all",
          },
          {
            id: "leavereport",
            label: "Leave Report",
            link: "/leavereport",
            parentId: "baseUi",
            perm: "all",
          },
          {
            id: "breakreport",
            label: "Break Report",
            link: "/breakreport",
            parentId: "baseUi",
            perm: "all",
          },
        ],
      },
      {
        id: "configuration",
        label: "Configuration",
        icon: "ri-settings-3-line",
        link: "/organization",
        parentId: "baseUi",
        perm: [
          COMPANY_PROFILE_VIEW_ACCESS_KEY,
          DEPARTMENT_VIEW_ACCESS_KEY,
          BRANCH_VIEW_ACCESS_KEY,
          CUSTOM_FIELD_VIEW_ACCESS_KEY,
          ROLES_VIEW_ACCESS_KEY,
          FORMS_VIEW_ACCESS_KEY,
          LOCATION_GROUP_VIEW_ACCESS_KEY,
        ],
        click: function (e) {
          e.preventDefault();
          setIsBaseUi(!isBaseUi);
          setIscurrentState("BaseUi");
          updateIconSidebar(e);
        },
        stateVariables: isBaseUi,
      },
      {
        id: "control-panel",
        label: "CRM",
        icon: " ri-list-settings-line",
        perm: "all",
        link: "/#",
        click: function (e) {
          e.preventDefault();
          setIsControlPanel(!isControlPanel);
          setIscurrentState("Control Panel");
          updateIconSidebar(e);
        },
        stateVariables: isControlPanel,
        subItems: [
          {
            id: "clients",
            label: "Clients",
            link: "/clients",
            parentId: "baseUi",
            // perm: "all",
            perm: [
              CLIENT_VIEW_ACCESS_KEY,
              CREATE_CLIENT_ACCESS_KEY,
              EDIT_CLIENT_ACCESS_KEY,
            ],
          },
          {
            id: "projects",
            label: "Projects",
            link: "/projects",
            parentId: "baseUi",
            perm: "all",
          },
          {
            id: "tasks",
            label: "Tasks",
            link: "/tasks",
            parentId: "baseUi",
            perm: "all",
          },
          {
            id: "settings",
            label: "Settings",
            link: "/task-settings",
            parentId: "baseUi",
            perm: "all",
          },
        ],
      },
    ];

    if (
      !!profile_data &&
      !!profile_data.is_admin &&
      profile_data?.is_admin === true
    ) {
      return menuList;
    } else if (!!profile_data && !!profile_data.permission_list) {
      let updated_menu = [];
      menuList.map((route) => {
        const hasEmployeePermission =
          Array.isArray(route?.perm) &&
          route.perm.some((d) => {
            console.log("d =", d);
            return profile_data?.permission_list.includes(d);
          });

        const isAllPermission =
          typeof route?.perm === "string" && route?.perm === "all";

        const isHeader = route.isHeader === true;

        console.log("Route:", route.label);
        console.log("hasEmployeePermission:", hasEmployeePermission);
        console.log("isAllPermission:", isAllPermission);
        console.log("isHeader:", isHeader);
        if (
          (Array.isArray(route?.perm) &&
            (route?.perm).some((d) =>
              profile_data?.permission_list.includes(d),
            )) ||
          (typeof route?.perm === "string" && route?.perm === "all") ||
          route.isHeader === true
        ) {
          let thisSubMenu = route.subItems;
          let updatedSubMenu = [];

          if (!!thisSubMenu) {
            thisSubMenu.map((ts) => {
              if (
                (Array.isArray(ts?.perm) &&
                  (ts?.perm).some((d) =>
                    profile_data?.permission_list.includes(d),
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

      return updated_menu;
    } else {
      return menuList;
    }
  };

  return <React.Fragment>{menuItems()}</React.Fragment>;
};
export default Navdata;
