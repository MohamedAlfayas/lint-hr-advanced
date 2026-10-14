import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  IconButton,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import AppTable from "../../../shared/ui/table/AppTable";
import PageHeader from "../../../shared/ui/PageHeader";
import PillTabs from "../../../shared/ui/PillTabs";
import { useConfirm } from "../../../shared/ui/ConfirmDialog";
import { usePermission } from "../../../shared/hooks/usePermission";
import { getApiErrorMessage } from "../../../shared/api/axiosBaseQuery";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { MetaTitle } from "../../../common/data/MetaTitle";
import HolidayCalendar from "../../../pages/holidays/Calendar";
import "../../../pages/holidays/holidays.css";

import { useDeleteHolidayMutation, useGetHolidaysQuery } from "../api/holidaysApi";
import { useHolidayColumns } from "../components/useHolidayColumns";
import HolidayFormDrawer from "../components/HolidayFormDrawer";
import HolidayStats from "../components/HolidayStats";

const MONTHS = ["All months", ...Array.from({ length: 12 }, (_, i) => dayjs().month(i).format("MMMM"))];
const TYPE_TABS = [
  { value: "all", label: "All", tone: "primary", icon: "ri-calendar-2-line" },
  { value: "restricted", label: "Restricted", tone: "warning", icon: "ri-lock-line" },
  { value: "non_restricted", label: "Non Restricted", tone: "success", icon: "ri-checkbox-circle-line" },
];

const HolidaysPage = () => {
  document.title = `Holidays | ${MetaTitle || "Lint HR"}`;

  // Holiday create/edit/delete has always been admin-only (see InfoTable).
  const { isAdmin: canManage } = usePermission();
  const [confirm, confirmDialog] = useConfirm();

  const [view, setView] = useState("list");
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(0);
  const [type, setType] = useState("all");
  const [drawer, setDrawer] = useState({ open: false, holiday: null });

  const { data: holidays = [], isLoading, isFetching, isError, error, refetch } =
    useGetHolidaysQuery();
  const [deleteHoliday] = useDeleteHolidayMutation();

  const workSchedules = useMemo(() => GetLocalStorageData("work_schedule") || [], []);
  const columns = useHolidayColumns(workSchedules);

  const yearHolidays = useMemo(
    () => holidays.filter((h) => dayjs(h.date).year() === year),
    [holidays, year],
  );

  const counts = useMemo(
    () => ({
      all: yearHolidays.length,
      restricted: yearHolidays.filter((h) => h.is_restricted).length,
      non_restricted: yearHolidays.filter((h) => !h.is_restricted).length,
    }),
    [yearHolidays],
  );

  const tableData = useMemo(
    () =>
      yearHolidays.filter((h) => {
        if (month && dayjs(h.date).month() + 1 !== month) return false;
        if (type === "restricted") return h.is_restricted;
        if (type === "non_restricted") return !h.is_restricted;
        return true;
      }),
    [yearHolidays, month, type],
  );

  const openForm = (holiday = null) => setDrawer({ open: true, holiday });
  const closeForm = () => setDrawer((d) => ({ ...d, open: false }));

  const handleDelete = async (holiday) => {
    const ok = await confirm({
      title: "Delete holiday?",
      message: `"${holiday.name}" on ${dayjs(holiday.date).format("DD MMM YYYY")} will be removed for all employees.`,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      const res = await deleteHoliday(holiday.id).unwrap();
      toast.success(res?.message || "Holiday deleted successfully");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete holiday"));
    }
  };

  const filters = (
    <>
      <DatePicker
        views={["year"]}
        label="Year"
        value={dayjs().year(year)}
        onChange={(d) => d?.isValid() && setYear(d.year())}
        minDate={dayjs("1900-01-01")}
        maxDate={dayjs().add(1, "year")}
        slotProps={{ textField: { size: "small", sx: { width: 120 } } }}
      />
      <TextField
        select
        size="small"
        label="Month"
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
        sx={{ width: 160 }}
      >
        {MONTHS.map((m, i) => (
          <MenuItem key={m} value={i}>
            {m}
          </MenuItem>
        ))}
      </TextField>
    </>
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <PageHeader
          title="Holidays"
          subtitle="Manage company holidays and the shifts they apply to"
          icon={<EventNoteOutlinedIcon />}
          actions={
            <>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={view}
                onChange={(_, v) => v && setView(v)}
              >
                <ToggleButton value="list">
                  <ViewListRoundedIcon fontSize="small" sx={{ mr: 0.75 }} /> List
                </ToggleButton>
                <ToggleButton value="calendar">
                  <CalendarMonthRoundedIcon fontSize="small" sx={{ mr: 0.75 }} /> Calendar
                </ToggleButton>
              </ToggleButtonGroup>
              {canManage && (
                <Button
                  data-testid="holidays-new-holiday-button"
                  variant="contained"
                  color="success"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => openForm()}
                >
                  New Holiday
                </Button>
              )}
            </>
          }
        />

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }} action={<Button data-testid="holidays-retry-button" color="inherit" size="small" onClick={refetch}>Retry</Button>}>
            {getApiErrorMessage(error, "Could not load holidays")}
          </Alert>
        )}

        {view === "calendar" ? (
          <Box sx={{ "& .page-content": { p: 0 } }}>
            <HolidayCalendar />
          </Box>
        ) : (
          <>
            <HolidayStats holidays={yearHolidays} year={year} />

            <Card sx={{ overflow: "hidden" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
                <PillTabs
                  tabs={TYPE_TABS.map((t) => ({ ...t, count: counts[t.value] }))}
                  value={type}
                  onChange={setType}
                />
              </Box>

              <AppTable
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                isFetching={isFetching}
                onRefresh={refetch}
                exportFileName={`holidays-${year}`}
                toolbarActions={filters}
                emptyMessage="No holidays for the selected filters"
                initialState={{ sorting: [{ id: "date", desc: false }] }}
                muiTablePaperProps={{ elevation: 0, sx: { border: 0, borderRadius: 0 } }}
                enableRowActions={canManage}
                positionActionsColumn="last"
                displayColumnDefOptions={{
                  "mrt-row-actions": { header: "Actions", size: 100 },
                }}
                renderRowActions={({ row }) => (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Edit">
                      <IconButton data-testid="holidays-edit-button" size="small" color="primary" onClick={() => openForm(row.original)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton data-testid="holidays-delete-outline-button" size="small" color="error" onClick={() => handleDelete(row.original)}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              />
            </Card>
          </>
        )}

        <HolidayFormDrawer open={drawer.open} holiday={drawer.holiday} onClose={closeForm} />
        {confirmDialog}
      </div>
    </div>
  );
};

export default HolidaysPage;
