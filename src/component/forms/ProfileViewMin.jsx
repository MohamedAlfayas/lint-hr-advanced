import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { format } from "date-fns";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../common/js/ConvertDateFormat";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { Api } from "../../common/api/Api";
import { ConvertSecondsToTime } from "../../common/js/ConvertSecondsToTime";
import { ParseTime } from "../../common/js/ParseTime";
import { setEmployeeLeaveType } from "../../redux/reducers/ChildReducer/EmployeeLeaveReducer";
import { testId, itemTestKey } from "../../shared/testing/testId";

const FILE_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "gif", "xlsx", "xls", "doc", "docx"];
const isFileValue = (value) =>
  typeof value === "string" &&
  FILE_EXTENSIONS.includes(value.split(".").pop().toLowerCase());

const formatTime = (value) => (value ? format(ParseTime(value), "h:mm a") : null);

const dayStatus = (item) => {
  if (item?.last_check_out || item?.first_check_in) return null;
  if (item?.is_week_off) return { label: "Week Off", color: "default" };
  if (item?.is_holiday) return { label: "Holiday", color: "info" };
  if (item?.is_leave_approved) return { label: "Leave", color: "warning" };
  if (item?.leave_taken_without_approval) return { label: "Absent", color: "error" };
  return null;
};

const SectionTitle = ({ children }) => (
  <Typography
    variant="overline"
    sx={{ fontWeight: 600, letterSpacing: 0.6, color: "text.secondary", lineHeight: 1.6 }}
  >
    {children}
  </Typography>
);

const DetailItem = ({ icon, label, children }) => (
  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
    <Avatar
      variant="rounded"
      sx={(theme) => ({
        width: 32,
        height: 32,
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        color: "primary.main",
        "& svg": { fontSize: 18 },
      })}
    >
      {icon}
    </Avatar>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" component="div">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} component="div" noWrap>
        {children || "—"}
      </Typography>
    </Box>
  </Stack>
);

const StatTile = ({ icon, label, value, color }) => (
  <Box
    sx={(theme) => ({
      flex: 1,
      p: 1.25,
      borderRadius: 2,
      textAlign: "center",
      bgcolor: alpha(theme.palette[color].main, 0.08),
    })}
  >
    <Box sx={{ color: `${color}.main`, "& svg": { fontSize: 18 } }}>{icon}</Box>
    <Typography variant="subtitle2" fontWeight={700}>
      {value || "—"}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

const ProfileViewMin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const DepartmentData = GetLocalStorageData("department") || [];
  const WorkScheduleData = GetLocalStorageData("work_schedule") || [];
  const [profileObj, setProfileObj] = useState({});
  const [attendanceEmpReport, setAttendanceEmpReport] = useState([]);
  const [activeTab, setActiveTab] = useState("attendance");

  const todayDate = ConvertISODateFormat(new Date());
  const workScheduleName =
    WorkScheduleData.find((s) => s.id === form_obj?.work_schedule_id)?.name || "";
  const departmentName = profileObj?.primary_department
    ? DepartmentData.find((d) => d.id === profileObj.primary_department)?.name
    : "";
  const fullName = `${profileObj?.first_name || ""} ${profileObj?.last_name || ""}`.trim();
  const todayRecord = (attendanceEmpReport || []).find((item) => item.date === todayDate);

  useEffect(() => {
    if (!form_obj) return;
    Api({
      type: "GET",
      url: `report/get-latest-attendance-report-for-employee/?employee_id=${form_obj.id}`,
    })
      .then((res) => setAttendanceEmpReport(res?.data?.data || []))
      .catch(() => console.log("Something Went Wrong !!"));
    setProfileObj(form_obj);
  }, [form_obj]);

  const viewProfile = () => {
    dispatch(toggleRSBView(false));
    navigate(`/employee/view/${profileObj.emp_uuid}`);
    Api({
      type: "GET",
      url: `leave/get-leave-type-details-for-employee/?employee_id=${profileObj.id}`,
    })
      .then((res) => dispatch(setEmployeeLeaveType(res?.data?.data)))
      .catch(() => console.log("Somethong Went Wrong!!"));
  };

  return (
    <Stack spacing={3} sx={{ minHeight: "100%" }}>
      {/* ── Profile header ─────────────────────────────────────────────── */}
      <Box
        sx={(theme) => ({
          mx: -3,
          mt: -3,
          px: 3,
          pt: 3,
          pb: 2.5,
          textAlign: "center",
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0)} 100%)`,
        })}
      >
        <Avatar
          src={profileObj.profile_url || undefined}
          alt={fullName}
          sx={{
            width: 88,
            height: 88,
            mx: "auto",
            fontSize: 32,
            fontWeight: 700,
            bgcolor: "success.main",
            border: "4px solid",
            borderColor: "background.paper",
            boxShadow: "0 6px 18px rgba(56, 65, 74, 0.15)",
          }}
        >
          {profileObj?.first_name?.charAt(0)?.toUpperCase() || "?"}
        </Avatar>
        <Typography variant="h6" fontWeight={700} sx={{ mt: 1.5 }}>
          {fullName || "—"}
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
          {departmentName && <Chip size="small" color="primary" variant="outlined" label={departmentName} />}        </Stack>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 0.5, sm: 2 }}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 1.5 }}
        >
          {profileObj?.email && (
            <Typography
              component="a"
              href={`mailto:${profileObj.email}`}
              variant="body2"
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}
            >
              <EmailOutlinedIcon sx={{ fontSize: 16 }} />
              {profileObj.email}
            </Typography>
          )}
          {profileObj?.contact_number && (
            <Typography
              component="a"
              href={`tel:${profileObj.contact_number}`}
              variant="body2"
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}
            >
              <PhoneOutlinedIcon sx={{ fontSize: 16 }} />
              {profileObj.contact_number}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* ── Today ──────────────────────────────────────────────────────── */}
      {todayRecord && (
        <Box>
          <SectionTitle>Today</SectionTitle>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <StatTile
              icon={<LoginRoundedIcon />}
              label="Check In"
              value={formatTime(todayRecord.first_check_in)}
              color="success"
            />
            <StatTile
              icon={<LogoutRoundedIcon />}
              label="Check Out"
              value={formatTime(todayRecord.last_check_out)}
              color="error"
            />
            <StatTile
              icon={<TimerOutlinedIcon />}
              label="Working Hrs"
              value={
                todayRecord.total_work_duration
                  ? ConvertSecondsToTime(todayRecord.total_work_duration)
                  : null
              }
              color="primary"
            />
          </Stack>
        </Box>
      )}

      {/* ── Basic details ─────────────────────────────────────────────── */}
      <Box>
        <SectionTitle>Basic Details</SectionTitle>
        <Box
          sx={{
            mt: 1,
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <DetailItem icon={<CakeOutlinedIcon />} label="Date of Birth">
            {profileObj?.dob && ConvertDateFormat(profileObj.dob)}
          </DetailItem>
          <DetailItem icon={<WcOutlinedIcon />} label="Gender">
            {profileObj?.gender === 1 ? "Male" : profileObj?.gender === 2 ? "Female" : ""}
          </DetailItem>
          <DetailItem icon={<ScheduleOutlinedIcon />} label="Work Schedule">
            {workScheduleName}
          </DetailItem>
          <DetailItem icon={<EventOutlinedIcon />} label="Joining Date">
            {profileObj?.joining_date && ConvertDateFormat(profileObj.joining_date)}
          </DetailItem>
          {(profileObj?.cf_values || []).map((c) => (
            <DetailItem key={c.name} icon={<InsertDriveFileOutlinedIcon />} label={c.name}>
              {c.value &&
                (isFileValue(c.value) ? (
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
                    <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.value.substring(c.value.lastIndexOf("/") + 1)}
                    </Box>
                    <Tooltip title="Download">
                      <IconButton
                        data-testid={testId("profile-view-download", itemTestKey(c), "button")}
                        size="small"
                        component="a"
                        href={c.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <DownloadRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ) : (
                  c.value
                ))}
            </DetailItem>
          ))}
        </Box>
      </Box>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider", "& .MuiTab-root": { textTransform: "none", fontWeight: 600 } }}
        >
          <Tab value="attendance" label="Attendance" />
          <Tab value="payroll" label="Payroll" />
          <Tab value="activity" label="Activity" />
        </Tabs>

        {activeTab === "attendance" &&
          (attendanceEmpReport.length ? (
            <Stack divider={<Divider flexItem />} sx={{ maxHeight: 280, overflowY: "auto" }}>
              {attendanceEmpReport.map((item) => {
                const d = new Date(item.date);
                const status = dayStatus(item);
                return (
                  <Stack key={item.id || item.date} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.25 }}>
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 40,
                        height: 40,
                        flexDirection: "column",
                        lineHeight: 1,
                        bgcolor: "action.hover",
                        color: "text.primary",
                      }}
                    >
                      <Typography sx={{ fontSize: 9.5, fontWeight: 600, textTransform: "uppercase", color: "text.secondary" }}>
                        {format(d, "MMM")}
                      </Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{format(d, "dd")}</Typography>
                    </Avatar>
                    <Typography variant="body2" fontWeight={600} sx={{ width: 96, flexShrink: 0 }}>
                      {format(d, "EEEE")}
                    </Typography>
                    {status ? (
                      <Box sx={{ flex: 1, textAlign: "right" }}>
                        <Chip size="small" label={status.label} color={status.color} variant="outlined" sx={{ height: 22, fontSize: 11.5, fontWeight: 500 }} />
                      </Box>
                    ) : (
                      <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                        <TimeCell label="In" value={formatTime(item.first_check_in)} color="success.main" />
                        <TimeCell label="Out" value={formatTime(item.last_check_out)} color="error.main" />
                        <TimeCell
                          label="Hours"
                          value={item.total_work_duration ? ConvertSecondsToTime(item.total_work_duration) : null}
                          color="primary.main"
                        />
                      </Box>
                    )}
                  </Stack>
                );
              })}
            </Stack>
          ) : (
            <EmptyTab message="No recent attendance" />
          ))}

        {activeTab === "payroll" && <EmptyTab message="Payroll details coming soon" />}
        {activeTab === "activity" && <EmptyTab message="No recent activity" />}
      </Box>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          position: "sticky",
          bottom: 0,
          mx: -3,
          mb: -3,
          px: 3,
          py: 2,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
          zIndex: 1,
        }}
      >
        <Button
          data-testid="profile-view-send-email-button"
          fullWidth
          variant="outlined"
          startIcon={<EmailOutlinedIcon />}
          component="a"
          href={profileObj?.email ? `mailto:${profileObj.email}` : undefined}
          disabled={!profileObj?.email}
        >
          Send Email
        </Button>
        <Button
          data-testid="profile-view-view-profile-button"
          fullWidth
          variant="contained"
          startIcon={<PersonOutlineRoundedIcon />}
          onClick={viewProfile}
          disabled={!profileObj?.emp_uuid}
        >
          View Profile
        </Button>
      </Stack>
    </Stack>
  );
};

const TimeCell = ({ label, value, color }) => (
  <Box sx={{ textAlign: "right", minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" component="div" sx={{ lineHeight: 1.3 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} noWrap sx={{ color: value ? color : "text.disabled" }}>
      {value || "—"}
    </Typography>
  </Box>
);

const EmptyTab = ({ message }) => (
  <Stack alignItems="center" spacing={0.5} sx={{ py: 4, color: "text.secondary" }}>
    <InboxOutlinedIcon sx={{ fontSize: 36, opacity: 0.5 }} />
    <Typography variant="body2">{message}</Typography>
  </Stack>
);

export default ProfileViewMin;
