import React, { useEffect, useState } from "react";
import { Col, Row, TabContent, TabPane } from "reactstrap";
import { Avatar, Box, Card, Chip, Stack, Tab, Tabs, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";

//import images
import slack from "../../assets/images/brands/slack.png";
import DepartmentsTab from "./DepartmentsTab";
import Branch from "./Branch";
import TeamTab from "./TeamTab";
import OrgInfoTab from "./OrgInfoTab";
import AttendanceConfig from "./../attendanceConfig/AttendanceConfig";
import CustomField from "../customField/CustomField";
import Roles from "../roles/Roles";
import { useSelector } from "react-redux";
import CustomFormTable from "../CustomForms/CustomFormTable";
import LocationGroup from "./LocationGroup";
import CustomStatus from "./CustomStatus";
import {
  CONFIGURATION_VIEW_ACCESS_KEY,
  COMPANY_PROFILE_VIEW_ACCESS_KEY,
  DEPARTMENT_VIEW_ACCESS_KEY,
  BRANCH_VIEW_ACCESS_KEY,
  CUSTOM_FIELD_VIEW_ACCESS_KEY,
  ATTENDANCE_CONFIGURATION_VIEW_ACCESS_KEY,
  ROLES_VIEW_ACCESS_KEY,
  FORMS_VIEW_ACCESS_KEY,
  LOCATION_GROUP_VIEW_ACCESS_KEY,
} from "../../common/constant/RoleConstants";
import CustomFormConfig from "../CustomFormConfig/CustomFormConfig";

const Section = () => {
  // const [departmentView, SetDepartmentView] = useState(false);
  // const [branchView, SetBranchView] = useState(false);

  // useEffect(() =>{
  //   let profile_data = JSON.parse(localStorage.getItem('lint_hr_profile_data'));

  //   if(profile_data){
  //     let permission_list = profile_data?.permission_list
  //     console.log("Permission List = ",permission_list);

  //     if(permission_list.includes(DEPARTMENT_VIEW_ACCESS_KEY)){
  //       SetDepartmentView(true)
  //     }
  //     else{
  //       SetDepartmentView(false)
  //     }

  //     if(permission_list.includes(BRANCH_VIEW_ACCESS_KEY)){
  //       SetBranchView(true)
  //     }
  //     else{
  //       SetBranchView(false)
  //     }
  //   }

  // },[])

  const [permissions, setPermissions] = useState({
    companyInfo: false,
    department: false,
    branch: false,
    attendance: false,
    customField: false,
    roles: false,
    forms: false,
    locationGroup: false,
    customStatus: false,
  });

  useEffect(() => {
    const profileData = JSON.parse(
      localStorage.getItem("lint_hr_profile_data") || "null",
    );
    if (!profileData) return;

    const isAdmin = profileData.is_admin === true;
    const permissionList = Array.isArray(profileData.permission_list)
      ? profileData.permission_list
      : [];
    const has = (key) => isAdmin || permissionList.includes(key);

    setPermissions({
      companyInfo: has(COMPANY_PROFILE_VIEW_ACCESS_KEY),
      department: has(DEPARTMENT_VIEW_ACCESS_KEY),
      branch: has(BRANCH_VIEW_ACCESS_KEY),
      customField: has(CUSTOM_FIELD_VIEW_ACCESS_KEY),
      attendance: has(ATTENDANCE_CONFIGURATION_VIEW_ACCESS_KEY),
      roles: has(ROLES_VIEW_ACCESS_KEY),
      forms: has(FORMS_VIEW_ACCESS_KEY),
      locationGroup: has(LOCATION_GROUP_VIEW_ACCESS_KEY),
      customStatus: has(CONFIGURATION_VIEW_ACCESS_KEY),
    });
  }, []);

  //Tab
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("activeTab");
    return savedTab && savedTab !== "5" ? savedTab : "1";
  });
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      localStorage.setItem("activeTab", tab); // ✅ save tab
    }
  };
  useEffect(() => {
    return () => {
      localStorage.removeItem("activeTab");
    };
  }, []);
  const { company_detail } = useSelector((state) => state.CompanyReducer);

  const tabs = [
    { value: "1", label: "Company Info", icon: <BusinessRoundedIcon />, show: permissions.companyInfo },
    { value: "2", label: "Departments", icon: <AccountTreeRoundedIcon />, show: permissions.department },
    { value: "3", label: "Branch", icon: <StoreRoundedIcon />, show: permissions.branch },
    { value: "4", label: "Attendance", icon: <EventAvailableRoundedIcon />, show: permissions.attendance },
    { value: "5", label: "Payroll", icon: <PaymentsRoundedIcon />, show: permissions.payroll },
    { value: "6", label: "Custom Field", icon: <TuneRoundedIcon />, show: permissions.customField },
    { value: "7", label: "Roles", icon: <AdminPanelSettingsRoundedIcon />, show: permissions.roles },
    { value: "8", label: "Forms", icon: <DescriptionRoundedIcon />, show: permissions.forms },
    { value: "9", label: "Location Group", icon: <PlaceRoundedIcon />, show: permissions.locationGroup },
  ].filter((t) => t.show);
  // Roles without the default tab's permission land on their first allowed tab.
  const currentTab = tabs.some((t) => t.value === activeTab)
    ? activeTab
    : tabs[0]?.value || false;
  const companyName = company_detail?.full_name || "Organization";

  return (
    <React.Fragment>
      <Card
        sx={{
          mt: -3,
          mx: { xs: -1.5, md: -3 },
          mb: 3,
          borderRadius: 0,
          borderLeft: 0,
          borderRight: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={(theme) => ({
            px: { xs: 2, md: 4 },
            pt: { xs: 2.5, md: 3 },
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`,
          })}
        >
          <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 2 }}>
            <Avatar
              variant="rounded"
              src={company_detail?.light_logo_image || slack}
              alt={companyName}
              slotProps={{
                img: {
                  onError: (ev) => {
                    ev.currentTarget.onerror = null;
                    ev.currentTarget.src = slack;
                  },
                },
              }}
              sx={{
                width: 72,
                height: 72,
                flexShrink: 0,
                bgcolor: "background.paper",
                borderRadius: "50%",
                border: 1,
                borderColor: "divider",
                boxShadow: "0 4px 14px rgba(56, 65, 74, 0.12)",
                "& img": { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" },
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" fontWeight={700} noWrap>
                {companyName}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                <Chip
                  size="small"
                  icon={<ApartmentRoundedIcon />}
                  label="Headquarter"
                  sx={{ bgcolor: "background.paper", fontWeight: 500 }}
                />
                <Chip
                  size="small"
                  icon={<CalendarMonthRoundedIcon />}
                  label="Created 15 Sep, 2021"
                  sx={{ bgcolor: "background.paper", fontWeight: 500 }}
                />
                {company_detail?.website && (
                  <Chip
                    size="small"
                    icon={<LanguageRoundedIcon />}
                    label={company_detail.website}
                    component="a"
                    href={/^https?:\/\//.test(company_detail.website) ? company_detail.website : `https://${company_detail.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    sx={{ bgcolor: "background.paper", fontWeight: 500 }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          <Tabs
            value={currentTab}
            onChange={(_, v) => toggleTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                minHeight: 48,
                textTransform: "none",
                fontWeight: 600,
                fontSize: 14,
                gap: 0.75,
              },
              "& .MuiTab-root svg": { fontSize: 18 },
              "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
            }}
          >
            {tabs.map((t) => (
              <Tab key={t.value} value={t.value} label={t.label} icon={t.icon} iconPosition="start" />
            ))}
          </Tabs>
        </Box>
      </Card>
      <Row>
        <Col lg={12}>
          <TabContent activeTab={currentTab || activeTab} className="text-muted">
            {(permissions.companyInfo && (
              <TabPane tabId="1">
                <OrgInfoTab />
              </TabPane>
            )) ||
              null}
            {(permissions.department && (
              <TabPane tabId="2">
                <DepartmentsTab />
              </TabPane>
            )) ||
              null}

            {(permissions.branch && (
              <TabPane tabId="3">
                <Branch />
              </TabPane>
            )) ||
              null}
            {(permissions.attendance && (
              <TabPane tabId="4">
                <AttendanceConfig />
              </TabPane>
            )) ||
              null}
          
            {(permissions.customField && (
              <TabPane tabId="6">
                <CustomField />
              </TabPane>
            )) ||
              null}
            {(permissions.roles && (
              <TabPane tabId="7">
                <Roles />
              </TabPane>
            )) ||
              null}
            {(permissions.forms && (
              <TabPane tabId="8">
                <CustomFormConfig />
              </TabPane>
            )) ||
              null}
            {(permissions.locationGroup && (
              <TabPane tabId="9">
                <LocationGroup />
              </TabPane>
            )) ||
              null}
            {(permissions.customStatus && (
              <TabPane tabId="10">
                <CustomStatus />
              </TabPane>
            )) ||
              null}
          </TabContent>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Section;
