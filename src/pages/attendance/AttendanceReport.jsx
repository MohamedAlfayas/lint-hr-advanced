import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  Col,
  Row,
  Container,
  Modal,
  ModalBody,
  ModalHeader,
  Button,
  Spinner,
  Input,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import { MetaTitle } from "../../common/data/MetaTitle";
import { ButtonToolbar, IconButton, Table } from "rsuite";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { format, differenceInMinutes } from "date-fns";
import { Link } from "react-router-dom";
import { ApvEmployee } from "../../component/common/approval/ApprovalCells";
import { MonthFormat } from "../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "antd";
import { ConvertSecondsToTime } from "../../common/js/ConvertSecondsToTime";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { Api } from "../../common/api/Api";
import { setTeamDailyAttendanceReport } from "../../redux/reducers/ChildReducer/TeamDailyAttendanceReportReducer";
import { ParseTime } from "../../common/js/ParseTime";
import { TableSkeletonBlock } from "../../component/common/skeleton/Skeleton";
import "../../common/css/lc_style.css";
import "./reports.scss";
import {
  late_entry_display,
  on_time_entry_display,
  earlyin_display,
  earlyout_display,
} from "../../common/constant/Constants";
import { changeLayoutMode } from "../../layout/HtmlLayoutHelpers";
import ModalCloseButton from "../../shared/ui/ModalCloseButton";
import { testId } from "../../shared/testing/testId";

const ExcelJs = require("exceljs");

dayjs.extend(customParseFormat);

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const SEARCH_DEBOUNCE_MS = 400;

// builds [1, "...", 4, 5, 6, "...", 20]
const getPageNumbers = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) {
      result.push("...");
    }
    result.push(p);
  });
  return result;
};

const AttendanceReport = () => {
  const { layoutModeType } = useSelector((state) => state.LayoutReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    if (layoutModeType) {
      dispatch(changeLayoutMode(layoutModeType));
    }
  }, []);

  document.title = `Attendance Report | ${MetaTitle}`;

  const { Column, HeaderCell, Cell, ColumnGroup } = Table;
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [exportType, setExportType] = useState("page"); // "page" | "all"
  const [exportingAll, setExportingAll] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const openExportModal = (type) => {
    setExportType(type);
    setShowModal(true);
  };

  const employee_data = GetLocalStorageData("employee") || [];

  const resolveEmployee = (row) => {
    const id = row?.employee_id ?? row?.employee?.id ?? row?.emp_id;
    const fromStore = (employee_data || []).find(
      (e) => String(e.id) === String(id),
    );
    if (fromStore) return fromStore;
    if (
      row?.employee &&
      typeof row.employee === "object" &&
      (row.employee.first_name || row.employee.id)
    ) {
      return row.employee;
    }
    return null;
  };

  const { team_daily_attendance_report } = useSelector(
    (state) => state.TeamDailyAttendanceReportReducer,
  );

  // ── filter + pagination state ────────────────
  const [filterKeys, setFilterKeys] = useState({
    month: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);

  // search state: searchInput is what the user types (updates instantly),
  // search is the debounced value that actually drives the API call.
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // debounce searchInput -> search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1); // restart from first page on a new search
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // GET /report/get-team-daily-attendance-report/?thisMonth=2026-09&page=1&page_size=10&search=john
  const getReportData = (thisMonth, targetPage, targetPageSize, searchTerm) => {
    setLoading(true);
    dispatch(setLoaderVisible(true));

    let url =
      "report/get-team-daily-attendance-report/?thisMonth=" +
      thisMonth +
      "&page=" +
      targetPage +
      "&page_size=" +
      targetPageSize;

    if (searchTerm) {
      url += "&search=" + encodeURIComponent(searchTerm);
    }

    Api({
      method: "GET",
      url,
    })
      .then((res) => {
        const body = res?.data;

        const list = Array.isArray(body?.data) ? body.data : [];
        const total = body?.count != null ? body.count : 0;

        dispatch(setTeamDailyAttendanceReport(list));
        setTotalCount(total);

        // If current page becomes empty, go back one page
        if (list.length === 0 && targetPage > 1) {
          setPage(targetPage - 1);
        }

        setLoading(false);
        dispatch(setLoaderVisible(false));
      })
      .catch((error) => {
        console.error("Attendance report API error:", error);

        dispatch(setTeamDailyAttendanceReport([]));
        setTotalCount(0);
        setLoading(false);
        dispatch(setLoaderVisible(false));
      });
  };
  // fetch on mount and whenever month / page / page size / search changes
  useEffect(() => {
    getReportData(filterKeys.month, page, pageSize, search);
  }, [filterKeys.month, page, pageSize, search]);

  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys({
      ...filterKeys,
      month: monthStr,
    });
    setPage(1); // restart from first page for a new month
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const clearSearch = () => {
    setSearchInput("");
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const employeeDate = Array.from(
    new Set(
      team_daily_attendance_report.flatMap((employee) =>
        employee.workday_data.map((report) => report.date),
      ),
    ),
  );
  const monthYear = employeeDate.map((dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${month} ${year}`;
  });

  function formatDate(dateString) {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear().toString().substr(2);
    const month = new Intl.DateTimeFormat("en", { month: "short" }).format(
      dateObj,
    );
    const day = dateObj.getDate().toString().padStart(2, "0");
    return `${day} ${month} ${year}`;
  }

  const EditableCell = ({ rowData, dataKey, onChange, ...props }) => {
    const exportindividualExcelFile = () => {
      const workbook = new ExcelJs.Workbook();
      const sheet = workbook.addWorksheet("My Sheet", {
        views: [
          {
            state: "frozen",
            xSplit: 4,
            ySplit: 2,
          },
        ],
      });
      sheet.properties.defaultRowHeight = 20;
      sheet.autoFilter = {
        from: {
          row: 1,
          column: 1,
        },
        to: {
          row: 2,
          column: 2,
        },
      };

      const headers = [
        "Employee Name",
        "Email",
        "Emp ID",
        "#",
        "Status",
        "Activity",
        "Work Schedule",
        "Checked In",
        "OT",
        "Paid Hr",
        "Edited Hours",
        "In Location",
        "Out Location",
        "In",
        "Out",
        "Total",
      ];
      const employeeDatesXls = Array.from(
        new Set(
          team_daily_attendance_report.flatMap((employee) =>
            employee.workday_data.map((report) => report.date),
          ),
        ),
      );

      // const foundEmployee = employee_data.find(
      //   (emp) => rowData.employee_id === emp.id,
      // );

      const foundEmployee = resolveEmployee(rowData);

      const emp_name = foundEmployee ? foundEmployee.first_name : "";
      const employee_id = foundEmployee ? foundEmployee.emp_id : "";

      // Add headers row
      const headerRow = sheet.addRow(["Date", ...headers]);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
      });

      // Add data rows
      employeeDatesXls.forEach((date) => {
        const row = [];
        const attendance_data = rowData.workday_data.find(
          (day) => day.date === date,
        );
        if (attendance_data) {
          const attend_data =
            attendance_data.is_present === true
              ? "P"
              : attendance_data.is_holiday === true
                ? "H"
                : attendance_data.is_day_on === false
                  ? "WO"
                  : attendance_data.is_leave_approved === true
                    ? "L"
                    : "A";

          const total_hour = ConvertSecondsToTime(
            attendance_data.final_paid_hr_in_seconds,
          );
          const workScheduleHr = ConvertSecondsToTime(
            attendance_data.work_schedule_hr_without_break_in_seconds,
          );
          const checkedInHr = ConvertSecondsToTime(
            attendance_data.checked_in_hr_in_seconds,
          );
          const status = attendance_data.hr_status;

          const getStatusText = (hr_status) => {
            switch (hr_status) {
              case 1:
                return "Auto Approval";
              case 2:
                return "Approval";
              case 3:
                return "Pending";
              case 4:
                return "Reject";
              default:
                return "Unknown";
            }
          };

          const statusText = getStatusText(status);
          let entry_status;
          const activity = attendance_data.day_status;

          if (attendance_data.is_present === true && activity === null) {
            entry_status = "N/A";
          } else if (
            activity === null ||
            attendance_data.is_holiday === true ||
            attendance_data.is_leave_approved === true ||
            attendance_data.leave_taken_without_approval === true
          ) {
            entry_status = "-";
          } else if (activity.early_in === true) {
            entry_status = earlyin_display.text;
          } else if (activity.ontime === true) {
            entry_status = on_time_entry_display.text;
          } else if (activity.late === true) {
            entry_status = late_entry_display.text;
          } else if (activity.early_out === true) {
            entry_status = earlyout_display.text;
          } else {
            entry_status = on_time_entry_display.text;
          }

          const otHours = ConvertSecondsToTime(
            attendance_data.final_ot_hr_in_seconds,
          );
          const editedHours = ConvertSecondsToTime(
            attendance_data.final_paid_hr_in_seconds -
              attendance_data.checked_in_hr_in_seconds,
          );

          const entryLogs = attendance_data.entry_log.map((entry) => {
            return {
              time: format(ParseTime(entry.entry_time), "h:mm a"),
              location: entry.location,
              type: entry.entry_type,
            };
          });

          const entryLogIn = entryLogs.filter((entry) => entry.type === 1);
          const entryLogOut = entryLogs.filter((entry) => entry.type === 2);

          const inLength = entryLogIn.length;
          const outLength = entryLogOut.length;
          const maxIterations = Math.max(inLength, outLength);

          const applyFontColor = (
            cell,
            cellNumber,
            attend_data_v,
            statusText_v,
            entry_status_v,
          ) => {
            let fontColor = "000000";
            let isBold = false;
            switch (cellNumber) {
              case 5:
                if (attend_data_v === "P") fontColor = "00FF00";
                else if (attend_data_v === "A") fontColor = "FF0000";
                else if (attend_data_v === "L") fontColor = "FFA500";
                else if (attend_data_v === "WO") fontColor = "888888";
                else fontColor = "000000";
                isBold = true;
                break;
              case 6:
                if (statusText_v === "Auto Approval") fontColor = "87CEEB";
                else if (statusText_v === "Approval") fontColor = "00FF00";
                else if (statusText_v === "Pending") fontColor = "FFA500";
                else if (statusText_v === "Reject") fontColor = "FF0000";
                else fontColor = "000000";
                isBold = true;
                break;
              case 7:
                if (entry_status_v === "Early In") fontColor = "00FF00";
                else if (entry_status_v === "OnTime") fontColor = "00FF00";
                else if (entry_status_v === "Late") fontColor = "FFA500";
                else if (entry_status_v === "Early Out") fontColor = "FFA500";
                else fontColor = "000000";
                isBold = true;
                break;
              default:
                break;
            }
            cell.font = { color: { argb: fontColor }, bold: isBold };
          };

          row.push(formatDate(date));
          row.push(emp_name);
          row.push(foundEmployee ? foundEmployee.email : "");
          row.push(employee_id);
          row.push(attend_data);
          row.push(statusText || "-");
          row.push(entry_status || "-");
          row.push(workScheduleHr);
          row.push(checkedInHr);
          row.push(otHours || "-");
          row.push(total_hour);
          row.push(editedHours || "-");

          let inOutAdded = false;

          // If either entryLogIn or entryLogOut is empty, push a single row
          if (inLength === 0 || outLength === 0) {
            row.push(
              inLength > 0
                ? entryLogIn.map((entry) => entry.location).join(", ")
                : "-",
            );
            row.push(
              outLength > 0
                ? entryLogOut.map((entry) => entry.location).join(", ")
                : "-",
            );
            row.push(inLength > 0 ? entryLogIn[0].time : "-");
            row.push(outLength > 0 ? entryLogOut[0].time : "-");
            row.push("-");
            sheet.addRow(row).eachCell((cell, cellNumber) => {
              applyFontColor(
                cell,
                cellNumber,
                attend_data,
                statusText,
                entry_status,
              );
            });
          } else {
            for (let i = 0; i < maxIterations; i++) {
              const newRow = [...row];
              const inOut = [];
              newRow.push(i < inLength ? entryLogIn[i].location : "-");
              newRow.push(i < outLength ? entryLogOut[i].location : "-");
              newRow.push(i < inLength ? entryLogIn[i].time : "-");
              newRow.push(i < outLength ? entryLogOut[i].time : "-");
              inOut.push(i < inLength ? entryLogIn[i].location : "-");
              inOut.push(i < outLength ? entryLogOut[i].location : "-");
              inOut.push(i < inLength ? entryLogIn[i].time : "-");
              inOut.push(i < outLength ? entryLogOut[i].time : "-");
              if (entryLogIn[i] && entryLogOut[i]) {
                const logInTime = new Date("2000-01-01 " + entryLogIn[i].time);
                const logOutTime = new Date(
                  "2000-01-01 " + entryLogOut[i].time,
                );
                let timeDifferenceMs = logOutTime - logInTime;
                if (timeDifferenceMs < 0) {
                  timeDifferenceMs += 24 * 60 * 60 * 1000;
                }
                const hours = Math.floor(timeDifferenceMs / (1000 * 60 * 60));
                const minutes = Math.floor(
                  (timeDifferenceMs % (1000 * 60 * 60)) / (1000 * 60),
                );
                const differenceFormatted =
                  hours.toString().padStart(2, "0") +
                  ":" +
                  minutes.toString().padStart(2, "0") +
                  " hr";
                newRow.push(differenceFormatted);
                inOut.push(differenceFormatted);
              } else {
                newRow.push("-");
              }

              if (!inOutAdded) {
                sheet.addRow(newRow).eachCell((cell, cellNumber) => {
                  applyFontColor(
                    cell,
                    cellNumber,
                    attend_data,
                    statusText,
                    entry_status,
                  );
                });
              } else {
                const emptyRow = [
                  formatDate(date),
                  "-",
                  "",
                  "-",
                  "-",
                  "-",
                  "-",
                  "-",
                  "-",
                  "-",
                  "-",
                  "-",
                ];
                const inoutRow = [
                  ...emptyRow,
                  inOut[0],
                  inOut[1],
                  inOut[2],
                  inOut[3],
                  inOut[4],
                ];
                sheet.addRow(inoutRow).eachCell((cell, cellNumber) => {
                  applyFontColor(
                    cell,
                    cellNumber,
                    attend_data,
                    statusText,
                    entry_status,
                  );
                });
              }
              inOutAdded = true;
            }
          }
        }
      });

      const maxColumns = sheet.columns.length;
      const maxRows = sheet.rowCount;

      for (let rowIndex = 1; rowIndex <= maxRows; rowIndex++) {
        for (let colIndex = 1; colIndex <= maxColumns; colIndex++) {
          const cell = sheet.getCell(rowIndex, colIndex);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: colIndex % 2 === 0 ? "FFFFFF" : "e6f7ff" },
          };
        }
      }
      // Set column widths and cell borders
      sheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(
            maxLength,
            cell.value ? cell.value.toString().length : 0,
          );
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { horizontal: "center" };
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      });

      const monthYearXls = employeeDatesXls.map((dateString) => {
        const date = new Date(dateString);
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();
        return `${month}${year}`;
      });
      workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        const filename = `${emp_name}_${employee_id}_Attendance_${monthYearXls[0]}.xlsx`;
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        window.URL.revokeObjectURL(url);
      });
    };

    return (
      <Cell
        {...props}
        className="link-group"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ButtonToolbar>
          <IconButton
            data-testid={testId("attendance-report-row", rowData?.emp_id ?? rowData?.employee_id, "download-button")}
            appearance="subtle"
            icon={
              <span className="text-primary d-inline-block edit-item-btn fs-16">
                <i
                  className="ri-download-2-line"
                  onClick={exportindividualExcelFile}
                ></i>
              </span>
            }
          />
        </ButtonToolbar>
      </Cell>
    );
  };

  // Builds the team XLSX from any report list.
  //  - "Export"     -> current page rows (default: team_daily_attendance_report)
  //  - "Export All" -> full month list from the export-all API
  const exportExcelFile = (
    reportData = team_daily_attendance_report,
    fileSuffix = "",
  ) => {
    const workbook = new ExcelJs.Workbook();
    const sheet = workbook.addWorksheet("My Sheet", {
      views: [
        {
          state: "frozen",
          xSplit: 2,
          ySplit: 2,
        },
      ],
    });
    sheet.properties.defaultRowHeight = 20;
    sheet.autoFilter = {
      from: {
        row: 1,
        column: 1,
      },
      to: {
        row: 2,
        column: 2,
      },
    };

    const headers = ["Employee Name", "Email"];
    const subheaders = ["", ""];

    const employeeDatesXls = Array.from(
      new Set(
        reportData.flatMap((employee) =>
          employee.workday_data.map((report) => report.date),
        ),
      ),
    );

    employeeDatesXls.forEach((date) => {
      headers.push("", "", formatDate(date), "");
      subheaders.push("#", "Check-in", "Check-out", "Duration", "Notes");
    });

    headers.push("Total Days", "Present Days");
    subheaders.push("Total Days", "Present Days");
    const headerRow = sheet.addRow(headers);
    const subheaderRow = sheet.addRow(subheaders);

    headerRow.font = { bold: true };
    subheaderRow.font = { bold: true };

    for (let i = 0; i < employeeDatesXls.length; i++) {
      const startCol = i * 5 + 3;
      const endCol = i * 5 + 7;
      const dateHeader = formatDate(employeeDatesXls[i]);

      sheet.mergeCells(1, startCol, 1, endCol);
      const mergedCell = sheet.getCell(1, startCol);
      mergedCell.value = dateHeader;
      mergedCell.alignment = { horizontal: "center" };

      const fillColor = i % 2 === 0 ? "FFFFFF" : "e6f7ff";
      [0, 1, 2, 3, 4].forEach((offset) => {
        const col = startCol + offset;
        sheet.getColumn(col).eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: fillColor },
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { horizontal: "center" };
        });
      });
    }

    reportData.forEach((rowData, rowIndex, colIndex) => {
      const row = [];
      // const foundEmployee = employee_data.find(
      //   (emp) => rowData.employee_id === emp.id,
      // );
      const foundEmployee = resolveEmployee(rowData);
      const emp_name = foundEmployee ? foundEmployee.first_name : "";
      row.push(emp_name);
      row.push(foundEmployee ? foundEmployee.email : "");

      employeeDatesXls.forEach((date) => {
        const attendance_data = rowData.workday_data.find(
          (day) => day.date === date,
        );
        let attend_data = "A";
        if (attendance_data && attendance_data.is_present === true) {
          attend_data = "P";
        } else if (attendance_data && attendance_data.is_holiday === true) {
          attend_data = "H";
        } else if (attendance_data && attendance_data.is_day_on === false) {
          attend_data = "WO";
        } else if (
          attendance_data &&
          attendance_data.is_leave_approved === true
        ) {
          attend_data = "L";
        }
        row.push(attend_data);

        if (attendance_data) {
          const notes = attendance_data.notes;
          let message = "-";
          if (notes && notes.length > 0) {
            message =
              notes.length > 1
                ? `${notes[0].message} (${notes.length - 1})`
                : notes[0].message;
          }

          const checkInLog = attendance_data.entry_log.find(
            (log) => parseInt(log.entry_type) === 1,
          );
          const checkOutLog = attendance_data.entry_log
            .slice()
            .reverse()
            .find((log) => parseInt(log.entry_type) !== 1);
          const firstCheckIn = checkInLog
            ? format(ParseTime(checkInLog.entry_time), "h:mm a")
            : "";
          const lastCheckOut = checkOutLog
            ? format(ParseTime(checkOutLog.entry_time), "h:mm a")
            : "";
          const total_hour = ConvertSecondsToTime(
            attendance_data.final_paid_hr_in_seconds,
          );
          const entryLogLength = attendance_data.entry_log.length;
          const duration =
            entryLogLength === 0
              ? total_hour
              : `${total_hour} (${entryLogLength})`;
          row.push(firstCheckIn);
          row.push(lastCheckOut);
          row.push(duration);
          row.push(message);
        } else {
          row.push("", "", "", "");
        }
      });

      row.push(rowData.total_working_days_count);
      row.push(rowData.total_present_days_count);
      const dataRow = sheet.addRow(row);

      dataRow.eachCell((cell, cellNumber) => {
        const value = cell.value;
        let fontColor = "000000";
        let isBold = false;

        if (value === "P" || value === "A") {
          fontColor = value === "P" ? "00FF00" : "FF0000";
          isBold = true;
        } else if (value === "WO") {
          fontColor = "888888";
          isBold = true;
        } else if (value === "H" || value === "L") {
          fontColor = "000000";
          isBold = true;
        }

        cell.font = {
          color: { argb: fontColor },
          bold: isBold,
        };

        if (cellNumber > 1) {
          cell.alignment = { horizontal: "center" };
        }

        // Background bands: 8-12 uses colIndex, then 5-column blocks
        // from 13 to 152 alternating white / light blue.
        if (cellNumber >= 8 && cellNumber <= 12) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: colIndex % 2 === 0 ? "FFFFFF" : "e6f7ff" },
          };
        } else if (cellNumber >= 13 && cellNumber <= 152) {
          const block = Math.floor((cellNumber - 13) / 5);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: block % 2 === 0 ? "FFFFFF" : "e6f7ff" },
          };
        }
      });
    });

    sheet.eachRow({ includeEmpty: true }, (row) => {
      let maxHeight = 0;
      row.eachCell({ includeEmpty: true }, (cell) => {
        const lines = cell.value ? cell.value.toString().split("\n").length : 1;
        maxHeight = Math.max(maxHeight, lines);
      });
      row.height = maxHeight * 15;
    });

    sheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        maxLength = Math.max(
          maxLength,
          cell.value ? cell.value.toString().length : 0,
        );
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    // Borders + centered alignment on all cells
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center" };
      });
    });

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;

      const monthYearList = employeeDatesXls.map((dateString) => {
        const date = new Date(dateString);
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();
        return `${month}_${year}`;
      });

      anchor.download = `Attendance_${monthYearList[0]}${fileSuffix}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  // GET /report/export-all-attendance-report/?thisMonth=2026-09&search=john
  // Fetches every employee for the selected month (honoring the current
  // search filter), then builds the same XLSX.
  const handleExportAll = () => {
    setExportingAll(true);
    dispatch(setLoaderVisible(true));

    let url =
      "report/export-all-attendance-report/?thisMonth=" + filterKeys.month;
    if (search) {
      url += "&search=" + encodeURIComponent(search);
    }

    Api({
      method: "GET",
      url,
    })
      .then((res) => {
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (list.length === 0) {
          window.alert("No attendance data found for this month.");
          return;
        }
        exportExcelFile(list, "_All");
      })
      .catch((error) => {
        console.error("Export all attendance report API error:", error);
        window.alert("Failed to export the attendance report.");
      })
      .finally(() => {
        setExportingAll(false);
        dispatch(setLoaderVisible(false));
      });
  };

  const [timeline_modal, settimeline_modal] = useState(false);
  const [timelineList, setTimelineList] = useState([]);
  const [timelineDate, setTimeLineDate] = useState("");
  const open_timeline = () => {
    settimeline_modal(!timeline_modal);
  };

  const FixedColumns = ({ rowData, dataKey, ...props }) => {
    const emp_name = resolveEmployee(rowData);

    if (!emp_name) {
      return <Cell {...props} dataKey="id" />;
    }

    const html_tag = <ApvEmployee employee={emp_name} />;

    const rowBg = layoutModeType === "dark" ? "#242933" : "#e6f7ff";

    return (
      <Cell
        {...props}
        dataKey="id"
        style={{
          backgroundColor: rowBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: "10px",
        }}
      >
        {html_tag}
      </Cell>
    );
  };

  const dynamicColumns = () => {
    const allDynamicColumns = [];

    const employeeDates = Array.from(
      new Set(
        team_daily_attendance_report.flatMap((employee) =>
          employee.workday_data.map((report) => report.date),
        ),
      ),
    );

    const AttendanceData = ({ rowData, date, ...props }) => {
      const attendance_data = rowData.workday_data.find(
        (day) => day.date === date,
      );

      let attend_data = "A";
      if (attendance_data) {
        if (attendance_data.is_present === true) attend_data = "P";
        else if (attendance_data.is_leave_approved === true) attend_data = "L";
        else if (attendance_data.is_holiday === true) attend_data = "H";
        else if (attendance_data.is_day_on === false) attend_data = "WO";
      }
      return (
        <Cell {...props} dataKey={"is_present" + date}>
          {attend_data}
        </Cell>
      );
    };

    const DurationData = ({ rowData, date, ...props }) => {
      const durationData = rowData.workday_data.find(
        (day) => day.date === date,
      );

      const total_hour = durationData
        ? ConvertSecondsToTime(durationData.final_paid_hr_in_seconds)
        : "-";

      return (
        <Cell {...props} dataKey={"duration" + date}>
          {total_hour}
        </Cell>
      );
    };

    const InOut = ({ rowData, date, ...props }) => {
      const entryLogForDate = rowData.workday_data.find(
        (day) => day.date === date,
      );
      const entryLogLength = entryLogForDate
        ? entryLogForDate.entry_log.length
        : 0;

      let content;
      if (entryLogLength > 0) {
        content = (
          <div>
            {entryLogLength}{" "}
            <Link
              data-testid="attendance-report-view-link"
              className="link-opacity-75 ms-1"
              to="#"
              style={{ color: "#0AB39C" }}
              onClick={() => {
                setTimelineList(entryLogForDate.entry_log);
                setTimeLineDate(
                  format(new Date(entryLogForDate.date), "dd MMM, yyyy"),
                );
                open_timeline();
              }}
            >
              view
            </Link>
          </div>
        );
      } else {
        content = <span>-</span>;
      }

      return (
        <Cell {...props} dataKey={"entry_log_" + date}>
          {content}
        </Cell>
      );
    };

    employeeDates.forEach((date, index) => {
      const isEven = index % 2 === 0;
      const isDark = layoutModeType === "dark";
      const isLight = layoutModeType === "light";

      let bgColor;
      if (isEven) {
        bgColor = isLight ? "white" : "#1a1d24";
      } else {
        bgColor = isDark ? "#242933" : "#e6f7ff";
      }

      const dynamicColumn = (
        <ColumnGroup
          key={"date_" + date}
          align="center"
          header={
            <span style={{ fontWeight: "bold" }}>{formatDate(date)}</span>
          }
        >
          <Column flexGrow={1} minWidth={100} align="center">
            <HeaderCell
              style={{ fontWeight: "bold", backgroundColor: bgColor }}
            >
              Attendance
            </HeaderCell>
            <AttendanceData date={date} style={{ backgroundColor: bgColor }} />
          </Column>

          <Column flexGrow={1} minWidth={80} align="center" title="In">
            <HeaderCell style={{ fontWeight: "bold", background: bgColor }}>
              In/Out
            </HeaderCell>
            <InOut date={date} style={{ backgroundColor: bgColor }} />
          </Column>

          <Column flexGrow={1} minWidth={80} align="center" title="In">
            <HeaderCell style={{ fontWeight: "bold", background: bgColor }}>
              Duration
            </HeaderCell>
            <DurationData date={date} style={{ backgroundColor: bgColor }} />
          </Column>
        </ColumnGroup>
      );
      allDynamicColumns.push(dynamicColumn);
    });

    return allDynamicColumns;
  };

  const isDarkMode = layoutModeType === "dark";
  const headerBgColor = isDarkMode ? "#1a1d24" : "white";

  const additionalColumns = [
    <Column flexGrow={1} minWidth={130} align="center" key="total-days">
      <HeaderCell
        style={{
          background: headerBgColor,
          borderRadius: "1px",
          padding: "18px",
          fontWeight: "bold",
        }}
      >
        Total Days
      </HeaderCell>
      <Cell
        dataKey="total_working_days_count"
        fullText
        style={{ background: headerBgColor }}
      />
    </Column>,
    <Column flexGrow={1} minWidth={130} align="center" key="present-days">
      <HeaderCell
        style={{
          background: headerBgColor,
          borderRadius: "1px",
          padding: "18px",
          fontWeight: "bold",
        }}
      >
        Present Days
      </HeaderCell>
      <Cell
        dataKey="total_present_days_count"
        fullText
        style={{ background: headerBgColor }}
      />
    </Column>,
    <Column width={80} fixed="right" key="down-column">
      <HeaderCell
        style={{
          borderRadius: "1px",
          padding: "18px",
          fontWeight: "bold",
        }}
      >
        Down
      </HeaderCell>
      <EditableCell style={{ backgroundColor: headerBgColor }} />
    </Column>,
  ];

  const allColumns = [...dynamicColumns(), ...additionalColumns];

  const headerColor = isDarkMode ? "#242933" : "#e6f7ff";

  // ─────────────────────────────────────────────
  // Everything below is computed OUTSIDE the JSX so
  // the return() has no nested ternaries / comparisons.
  // ─────────────────────────────────────────────

  // export modal text
  const isExportAll = exportType === "all";
  const exportMonthLabel = dayjs(filterKeys.month, MonthFormat).format(
    "MMM YYYY",
  );
  const exportMessage = isExportAll ? (
    <>
      Are you sure you want to export the <b>{exportMonthLabel}</b> Attendance
      Report for <b>all employees</b> as a XLSX file?
    </>
  ) : (
    <>
      Are you sure you want to export the <b>{exportMonthLabel}</b> Attendance
      Report (current page) as a XLSX file?
    </>
  );

  // pagination values
  const rowsOnPage = (team_daily_attendance_report || []).length;
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min((page - 1) * pageSize + rowsOnPage, totalCount);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;
  const prevClass = prevDisabled ? "page-item disabled" : "page-item";
  const nextClass = nextDisabled ? "page-item disabled" : "page-item";
  const pageNumbers = getPageNumbers(page, totalPages);

  const pageItems = [];
  pageNumbers.forEach((p, idx) => {
    if (p === "...") {
      pageItems.push(
        <li className="page-item disabled" key={"gap-" + idx}>
          <span className="page-link">...</span>
        </li>,
      );
      return;
    }
    const linkClass = p === page ? "page-link active" : "page-link";
    pageItems.push(
      <li className="page-item" key={"p-" + p}>
        <button
          type="button"
          className={linkClass}
          data-testid={testId("attendance-report-page", p, "button")}
          onClick={() => handlePageChange(p)}
        >
          {p}
        </button>
      </li>,
    );
  });

  const pageSizeOptions = PAGE_SIZE_OPTIONS.map((size) => (
    <option key={size} value={size} data-testid={testId("attendance-report-page-size-option", size)}>
      {"Show " + size}
    </option>
  ));

  // timeline modal helpers
  const renderLocation = (entry) => {
    if (!entry) return null;
    if (entry.location_id !== null) {
      const mapUrl =
        "https://maps.google.com/?q=" + entry.latitude + "," + entry.longitude;
      return (
        <a data-testid="attendance-report-map-url-link" href={mapUrl} target="_blank" rel="noopener noreferrer">
          <i className="mdi mdi-map-marker"></i> {entry.location || ""}
        </a>
      );
    }
    if (entry.location !== "") {
      return (
        <span>
          <i className="mdi mdi-map-marker"></i> {entry.location}
        </span>
      );
    }
    return null;
  };

  const locationStyle = {
    display: "inline-block",
    maxWidth: "100px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const timelineRows = [];
  timelineList.forEach((checkInData, idx) => {
    const checkOutData = timelineList[idx + 1];
    if (!checkInData || parseInt(checkInData.entry_type) !== 1) return;

    const checkInTime = format(ParseTime(checkInData.entry_time), "h:mm a");
    let checkOutTime = "";
    let totalDifference = 0;
    if (checkOutData) {
      checkOutTime = format(ParseTime(checkOutData.entry_time), "h:mm a");
      totalDifference = differenceInMinutes(
        ParseTime(checkOutData.entry_time),
        ParseTime(checkInData.entry_time),
      );
    }
    const hh = String(Math.floor(totalDifference / 60)).padStart(2, "0");
    const mm = String(totalDifference % 60).padStart(2, "0");

    timelineRows.push(
      <tr key={"tl-" + idx}>
        <td>
          <p className="text-muted mb-1" style={{ fontWeight: "bold" }}>
            {checkInTime}
          </p>
          <small className="mb-0 text-muted" style={locationStyle}>
            {renderLocation(checkInData)}
          </small>
        </td>
        <td>
          <p className="text-muted mb-1" style={{ fontWeight: "bold" }}>
            {checkOutTime}
          </p>
          <small className="mb-0 text-muted" style={locationStyle}>
            {renderLocation(checkOutData)}
          </small>
        </td>
        <td>
          <p className="text-muted mb-1" style={{ fontWeight: "bold" }}>
            {hh + ":" + mm + " Hr"}
          </p>
        </td>
      </tr>,
    );
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Card className="rpt-card">
            <CardHeader className="rpt-head border-0">
              <div className="rpt-title">
                <span className="rpt-title-icon">
                  <i className="ri-calendar-check-line"></i>
                </span>
                <div className="rpt-title-text">
                  <h5>Attendance Report</h5>
                  <p>Monthly attendance for your team, day by day.</p>
                </div>
              </div>
              <Row className="g-2 align-items-center">
                <Col xs={12} sm={5} md={4} xl={3} xxl={2}>
                  <div className="form-icon right">
                    <DatePicker
                      value={dayjs(filterKeys.month, MonthFormat)}
                      format={MonthFormat}
                      picker="month"
                      allowClear={false}
                      className="form-control"
                      placeholder="Select Month"
                      onChange={handleDateRangeChange}
                    />
                  </div>
                </Col>

                <Col xs={12} sm={7} md={5} xl={4} xxl={3}>
                  <div className="position-relative">
                    <Input
                      data-testid="attendance-report-search-employee-input"
                      type="text"
                      className="form-control"
                      placeholder="Search employee..."
                      value={searchInput}
                      onChange={handleSearchChange}
                      style={{ paddingRight: "32px" }}
                    />
                    {/* Plain <i class="search-icon"> from the template CSS
                        ships with pointer-events: none, so clicks never
                        reached it. Using a focusable <span> with an
                        explicit pointer-events/zIndex fixes that. */}
                    <span
                      role="button"
                      tabIndex={searchInput ? 0 : -1}
                      aria-label="Clear search"
                      onClick={searchInput ? clearSearch : undefined}
                      onKeyDown={(e) => {
                        if (
                          searchInput &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
                          e.preventDefault();
                          clearSearch();
                        }
                      }}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: searchInput ? "pointer" : "default",
                        pointerEvents: "auto",
                        zIndex: 5,
                        lineHeight: 0,
                      }}
                    >
                      <i
                        className={
                          searchInput ? "ri-close-line" : "ri-search-line"
                        }
                      ></i>
                    </span>
                  </div>
                </Col>

                <Col
                  xs={12}
                  md
                  className="rpt-actions d-flex justify-content-end align-items-center gap-2"
                >
                  <Button
                    data-testid="attendance-report-export-button"
                    type="button"
                    className="btn rpt-btn is-soft"
                    onClick={() => openExportModal("page")}
                  >
                    <i className="ri-file-download-line align-bottom me-1"></i>
                    Export
                  </Button>

                  <Button
                    type="button"
                    className="btn rpt-btn is-primary"
                    data-testid="attendance-report-download-all-button"
                    onClick={() => openExportModal("all")}
                    disabled={exportingAll}
                  >
                    {exportingAll ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <i className="ri-download-cloud-2-line align-bottom me-1"></i>
                        Export All
                      </>
                    )}
                  </Button>
                </Col>

                <Modal data-testid="attendance-report-show-dialog" isOpen={showModal} toggle={toggleModal} centered={true}>
                  <ModalHeader close={<ModalCloseButton onClick={toggleModal} testId="attendance-report-show-close-button" />} toggle={toggleModal}></ModalHeader>
                  <ModalBody className="py-3 px-5">
                    <div className="mt-2 text-center">
                      <lord-icon
                        src="https://cdn.lordicon.com/nocovwne.json"
                        trigger="loop"
                        colors="primary:#0ab39c,secondary:#f06548"
                        style={{ width: "100px", height: "100px" }}
                      ></lord-icon>
                      <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                        <h4>Are you sure?</h4>
                        <p className="text-muted mx-4 mb-0">{exportMessage}</p>
                      </div>
                    </div>
                    <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                      <Button
                        data-testid="attendance-report-show-footer-close-button"
                        type="button"
                        className="btn w-sm btn-light"
                        onClick={toggleModal}
                      >
                        Close
                      </Button>
                      <Button
                        data-testid="attendance-report-show-download-button"
                        type="button"
                        className="btn w-sm btn-success"
                        onClick={() => {
                          if (isExportAll) handleExportAll();
                          else exportExcelFile();
                          toggleModal();
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  </ModalBody>
                </Modal>
              </Row>
            </CardHeader>
          </Card>
        </Container>

        {loading && !(team_daily_attendance_report || []).length ? (
          <div className="mb-3 px-2">
            <TableSkeletonBlock
              rows={8}
              cols={8}
              testId="attendance-report-loading-skeleton"
              label="Loading attendance report"
            />
          </div>
        ) : (
          <Table
            bordered
            cellBordered
            height={420}
            headerHeight={60}
            data={team_daily_attendance_report || []}
            rowHeight={60}
            autoHeight={true}
            loading={loading}
            className="mb-3 rpt-table"
            affixHeader={70}
            affixHorizontalScrollbar
          >
            <Column width={250} fixed="left" align="center">
              <HeaderCell
                style={{
                  background: headerColor,
                  borderRadius: "1px",
                  padding: "18px",
                  fontWeight: "bold",
                }}
              >
                Employee
              </HeaderCell>
              <FixedColumns />
            </Column>
            {allColumns}
          </Table>
        )}

        <Container fluid>
          <Row className="align-items-center g-3 text-center text-sm-start mb-5">
            <div className="col-sm">
              <div className="text-muted">
                Showing
                <span className="fw-semibold ms-1">{startItem}</span> to{" "}
                <span className="fw-semibold">{endItem}</span> of{" "}
                <span className="fw-semibold">{totalCount}</span>
              </div>
            </div>

            <div className="col-sm-auto">
              <ul className="pagination pagination-separated pagination-md justify-content-center justify-content-sm-start mb-0">
                <li className={prevClass}>
                  <button
                    data-testid="attendance-report-previous-button"
                    type="button"
                    className="page-link"
                    disabled={prevDisabled}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Previous
                  </button>
                </li>
                {pageItems}
                <li className={nextClass}>
                  <button
                    data-testid="attendance-report-next-button"
                    type="button"
                    className="page-link"
                    disabled={nextDisabled}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>

            <div className="col-sm-auto">
              <select
                testId="attendance-report-page-size"
                className="form-select custom-select-medium text-muted my-select"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                {pageSizeOptions}
              </select>
            </div>
          </Row>
        </Container>

        <Modal
          data-testid="attendance-report-date-dialog"
          isOpen={timeline_modal}
          toggle={open_timeline}
          centered
          className="custom-modal"
        >
          <ModalHeader close={<ModalCloseButton onClick={open_timeline} testId="attendance-report-date-close-button" />} toggle={open_timeline}>
            <h5
              className="modal-title"
              id="exampleModalToggleLabel"
              style={{ fontSize: "smaller" }}
            >
              Date: {timelineDate}
            </h5>
          </ModalHeader>
          <ModalBody className="text-left">
            <div>
              <SimpleBar style={{ maxHeight: "410px" }} className="p-3 pt-0">
                <table className="table table-auto">
                  <thead>
                    <tr>
                      <th>
                        Check In{" "}
                        <i className="mdi mdi-arrow-down-thick arrow-icon"></i>
                      </th>
                      <th>
                        Check Out{" "}
                        <i className="mdi mdi-arrow-up-thick arrow-icon"></i>
                      </th>
                      <th>Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>{timelineRows}</tbody>
                </table>
              </SimpleBar>
              <div className="text-center mt-3">
                <Button data-testid="attendance-report-date-footer-close-button" className="btn btn-light modal-dismiss-btn" onClick={open_timeline}>
                  Close
                </Button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    </React.Fragment>
  );
};

export default AttendanceReport;
