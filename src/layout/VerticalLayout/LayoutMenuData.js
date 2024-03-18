import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const menuItems = [
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
      // click: function (e) {
      //   e.preventDefault();
      //   setIsDashboard(!isDashboard);
      //   setIscurrentState("Dashboard");
      //   updateIconSidebar(e);
      //   // history('/')
      // },
      // subItems: [
      //   {
      //     id: "analytics",
      //     label: "Analytics",
      //     link: "/dashboard",
      //     parentId: "dashboard",
      //     perm: "all",
      //   },
      // ],
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
      perm: "employee",
      icon:"ri-account-circle-line"
    },
    {
      id: "attendance",
      label: "Atttendance",
      icon: " ri-user-follow-line",
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
          perm: "attendance",
        },
        {
          id: "holidays",
          label: "Holidays",
          link: "/holidays",
          parentId: "baseUi",
          perm: "holidays",
        },
        {
          id: "leaves",
          label: "Leave",
          link: "/leaves",
          parentId: "baseUi",
          perm: "leaves",
        },
        {
          id: "attendanceapproval",
          label: "Attendance Approval",
          link: "/attendanceapproval",
          parentId: "baseUi",
          perm: "attendance_approval",
        },
        {
          id: "leaveapproval",
          label: "Leave Approval",
          link: "/leave-approval",
          parentId: "baseUi",
          perm: "leave_apporval",
        },
        {
          id: "leavetype",
          label: "Leave Type",
          link: "/leavetype",
          parentId: "baseUi",
          perm: "leave_type",
        },
        {
          id: "workschedule",
          label: "WorkSchedule",
          link: "/workschedule",
          parentId: "baseUi",
          perm: "work_schedule",
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
      perm: "payroll",
      icon: " ri-currency-line",
    },
    {
      id: "attendancereport",
      label: "Report",
      link: "/attendancereport",
      parentId: "baseUi",
      perm: "attendance_report",
      icon:"ri-file-chart-line"
    },
    {
      id: "baseUi",
      label: "Configuration",
      icon: "ri-settings-3-line",
      link: "/organization",
      click: function (e) {
        e.preventDefault();
        setIsBaseUi(!isBaseUi);
        setIscurrentState("BaseUi");
        updateIconSidebar(e);
      },
      // stateVariables: isBaseUi,
      // subItems: [
      //   {
      //     id: "organization",
      //     label: "Organization",
      //     link: "/organization",
      //     parentId: "baseUi",
      //     perm: "organization",
      //   },
      //   // {
      //   //   id: "roles",
      //   //   label: "Roles",
      //   //   link: "/roles",
      //   //   parentId: "baseUi",
      //   //   perm: "roles",
      //   // },
      
      
        
      // ],
    },
    //     {
    //         id: "advanceUi",
    //         label: "Advance UI",
    //         icon: "ri-stack-line",
    //         link: "/#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsAdvanceUi(!isAdvanceUi);
    //             setIscurrentState('AdvanceUi');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isAdvanceUi,
    //         subItems: [
    //             { id: "nestablelist", label: "Nestable List", link: "#", parentId: "advanceUi" },
    //             { id: "scrollbar", label: "Scrollbar", link: "#", parentId: "advanceUi" },
    //             { id: "animation", label: "Animation", link: "#", parentId: "advanceUi" },
    //             { id: "tour", label: "Tour", link: "#", parentId: "advanceUi" },
    //             { id: "swiperslider", label: "Swiper Slider", link: "#", parentId: "advanceUi" },
    //             { id: "ratings", label: "Ratings", link: "#", parentId: "advanceUi" },
    //             { id: "highlight", label: "Highlight", link: "#", parentId: "advanceUi" },
    //         ],
    //     },
    //     {
    //         id: "widgets",
    //         label: "Widgets",
    //         icon: "ri-honour-line",
    //         link: "#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIscurrentState('Widgets');
    //         }
    //     },
    //     {
    //         id: "forms",
    //         label: "Forms",
    //         icon: "ri-file-list-3-line",
    //         link: "/#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsForms(!isForms);
    //             setIscurrentState('Forms');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isForms,
    //         subItems: [
    //             { id: "basicelements", label: "Basic Elements", link: "#", parentId: "forms" },
    //             { id: "formselect", label: "Form Select", link: "#", parentId: "forms" },
    //             { id: "checkboxsradios", label: "Checkboxs & Radios", link: "#", parentId: "forms" },
    //             { id: "pickers", label: "Pickers", link: "#", parentId: "forms" },
    //             { id: "inputmasks", label: "Input Masks", link: "#", parentId: "forms" },
    //             { id: "advanced", label: "Advanced", link: "#", parentId: "forms" },
    //             { id: "rangeslider", label: "Range Slider", link: "#", parentId: "forms" },
    //             { id: "validation", label: "Validation", link: "#", parentId: "forms" },
    //             { id: "wizard", label: "Wizard", link: "#", parentId: "forms" },
    //             { id: "editors", label: "Editors", link: "#", parentId: "forms" },
    //             { id: "fileuploads", label: "File Uploads", link: "#", parentId: "forms" },
    //             { id: "formlayouts", label: "Form Layouts", link: "#", parentId: "forms" },
    //             { id: "select2", label: "Select2", link: "#", parentId: "forms" },
    //         ],
    //     },
    //     {
    //         id: "tables",
    //         label: "Tables",
    //         icon: "ri-layout-grid-line",
    //         link: "/#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsTables(!isTables);
    //             setIscurrentState('Tables');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isTables,
    //         subItems: [
    //             { id: "basictables", label: "Basic Tables", link: "#", parentId: "tables" },
    //             { id: "listjs", label: "List Js", link: "#", parentId: "tables" },
    //             { id: "reactdatatables", label: "React Datatables", link: "#", parentId: "tables" },
    //         ],
    //     },
    //     {
    //         id: "charts",
    //         label: "Charts",
    //         icon: "ri-pie-chart-line",
    //         link: "/#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsCharts(!isCharts);
    //             setIscurrentState('Charts');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isCharts,
    //         subItems: [
    //             {
    //                 id: "apexcharts",
    //                 label: "Apexcharts",
    //                 link: "/#",
    //                 isChildItem: true,
    //                 click: function (e) {
    //                     e.preventDefault();
    //                     setIsApex(!isApex);
    //                 },
    //                 stateVariables: isApex,
    //                 childItems: [
    //                     { id: 1, label: "Line", link: "#" },
    //                     { id: 2, label: "Area", link: "#" },
    //                     { id: 3, label: "Column", link: "#" },
    //                     { id: 4, label: "Bar", link: "#" },
    //                     { id: 5, label: "Mixed", link: "#" },
    //                     { id: 6, label: "Timeline", link: "#" },
    //                     { id: 7, label: "Range Area", link: "#", parentId: "apexcharts", badgeColor: "success", badgeName: "New" },
    //                     { id: 8, label: "Funnel", link: "#", parentId: "apexcharts", badgeColor: "success", badgeName: "New" },
    //                     { id: 9, label: "Candlstick", link: "#" },
    //                     { id: 10, label: "Boxplot", link: "#" },
    //                     { id: 11, label: "Bubble", link: "#" },
    //                     { id: 12, label: "Scatter", link: "#" },
    //                     { id: 13, label: "Heatmap", link: "#" },
    //                     { id: 14, label: "Treemap", link: "#" },
    //                     { id: 15, label: "Pie", link: "#" },
    //                     { id: 16, label: "Radialbar", link: "#" },
    //                     { id: 17, label: "Radar", link: "#" },
    //                     { id: 18, label: "Polar Area", link: "#" },
    //                 ]
    //             },
    //             { id: "chartjs", label: "Chartjs", link: "#", parentId: "charts" },
    //             { id: "echarts", label: "Echarts", link: "#", parentId: "charts" },

    //         ],
    //     },
    //     {
    //         id: "icons",
    //         label: "Icons",
    //         icon: "ri-compasses-2-line",
    //         link: "/#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsIcons(!isIcons);
    //             setIscurrentState('Icons');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isIcons,
    //         subItems: [
    //             { id: "remix", label: "Remix", link: "#", parentId: "icons" },
    //             { id: "boxicons", label: "Boxicons", link: "#", parentId: "icons" },
    //             { id: "materialdesign", label: "Material Design", link: "#", parentId: "icons" },
    //             { id: "lineawesome", label: "Line Awesome", link: "#", parentId: "icons" },
    //             { id: "feather", label: "Feather", link: "#", parentId: "icons" },
    //             { id: "crypto", label: "Crypto SVG", link: "#", parentId: "icons" },
    //         ],
    //     },
    //     {
    //         id: "maps",
    //         label: "Maps",
    //         icon: "ri-map-pin-line",
    //         link: "/#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsMaps(!isMaps);
    //             setIscurrentState('Maps');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isMaps,
    //         subItems: [
    //             { id: "google", label: "Google", link: "#", parentId: "maps" },
    //             { id: "vector", label: "Vector", link: "#", parentId: "maps" },
    //             { id: "leaflet", label: "Leaflet", link: "#", parentId: "maps" },
    //         ],
    //     },
    //     {
    //         id: "multilevel",
    //         label: "Multi Level",
    //         icon: "ri-share-line",
    //         link: "#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsMultiLevel(!isMultiLevel);
    //             setIscurrentState('MuliLevel');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isMultiLevel,
    //         subItems: [
    //             { id: "level1.1", label: "Level 1.1", link: "#", parentId: "multilevel" },
    //             {
    //                 id: "level1.2",
    //                 label: "Level 1.2",
    //                 link: "#",
    //                 isChildItem: true,
    //                 click: function (e) {
    //                     e.preventDefault();
    //                     setIsLevel1(!isLevel1);
    //                 },
    //                 stateVariables: isLevel1,
    //                 childItems: [
    //                     { id: 1, label: "Level 2.1", link: "#" },
    //                     {
    //                         id: "level2.2",
    //                         label: "Level 2.2",
    //                         link: "#",
    //                         isChildItem: true,
    //                         click: function (e) {
    //                             e.preventDefault();
    //                             setIsLevel2(!isLevel2);
    //                         },
    //                         stateVariables: isLevel2,
    //                         childItems: [
    //                             { id: 1, label: "Level 3.1", link: "#" },
    //                             { id: 2, label: "Level 3.2", link: "#" },
    //                         ]
    //                     },
    //                 ]
    //             },
    //         ],
    //     },
  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
