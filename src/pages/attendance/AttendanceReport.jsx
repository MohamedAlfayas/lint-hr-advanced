import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Container,
  Modal,
  ModalBody,
  ModalHeader,
  Button,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import { MetaTitle } from "../../common/data/MetaTitle";
import CountUp from "react-countup";
import { ButtonToolbar, IconButton, Table } from "rsuite";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { parse, format } from "date-fns";
import { Link } from "react-router-dom";
import { MonthFormat } from "../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "antd";
import { ConvertSecondsToTime } from "../../common/js/ConvertSecondsToTime";
import { PostApi } from "../../common/api/PostApi";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { Api } from "../../common/api/Api";
import { setTeamDailyAttendanceReport } from "../../redux/reducers/ChildReducer/TeamDailyAttendanceReportReducer";
import { ParseTime } from "../../common/js/ParseTime";
import * as XLSX from "xlsx";
const ExcelJs = require("exceljs");
import "../../common/css/lc_style.css";
import { differenceInMinutes } from "date-fns";
import { CSVLink } from "react-csv";
import {
  late_entry_display,
  on_time_entry_display,
  earlyin_display,
  earlyout_display,
} from "../../common/constant/Constants";
const AttendanceReport = () => {
  document.title = `Attendance Report | ${MetaTitle}`;

  const { Column, HeaderCell, Cell, ColumnGroup } = Table;
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const dispatch = useDispatch();

  const employee_data = GetLocalStorageData("employee") || [];

  const { team_daily_attendance_report } = useSelector(
    (state) => state.TeamDailyAttendanceReportReducer
  );

  useEffect(() => {
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    getReportData(thisMonth);
  }, []);

  const getReportData = (thisMonth) => {
    dispatch(setLoaderVisible(true));

    Api({
      type: "GET",
      url: "report/get-team-daily-attendance-report/?thisMonth=" + thisMonth,
    })
      .then((res) => {
        dispatch(setTeamDailyAttendanceReport(res?.data?.data));
        dispatch(setLoaderVisible(false));
      })
      .catch((err) => {
  
        dispatch(setLoaderVisible(false));
      });
  };
  const [filterKeys, setFilterKeys] = useState({
    month: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
  });
  // useEffect(() => {
  //   getReportData(filterKeys.month);
  // }, [filterKeys.month]);

  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys({
      ...filterKeys,
      month: monthStr,
    });
    getReportData(monthStr);
  };

  const employeeDate = Array.from(
    new Set(
      team_daily_attendance_report.flatMap((employee) =>
        employee.workday_data.map((report) => report.date)
      )
    )
  );
  const monthYear = employeeDate.map((dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${month} ${year}`;
  });

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
      // const sheet = workbook.addWorksheet("My Sheet", {});
      sheet.properties.defaultRowHeight = 20;
      sheet.autoFilter = {
        from: {
          row: 1, // Assuming your headers start from row 1
          column: 1, // Assuming "Employee Name" is the first column
        },
        to: {
          row: 2, // Assuming all rows are populated
          column: 2, // Assuming "Email" is the second column
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
        // "Notes",
        "In Location",
        "Out Location",
        "In",
        "Out",
        "Total",
      ];
      // Assuming `team_daily_attendance_report` is available
      const employeeDatesXls = Array.from(
        new Set(
          team_daily_attendance_report.flatMap((employee) =>
            employee.workday_data.map((report) => report.date)
          )
        )
      );

      const foundEmployee = employee_data.find(
        (emp) => rowData.employee_id === emp.id
      );
      const emp_name = foundEmployee ? foundEmployee.fname : "";
      const employee_id = foundEmployee ? foundEmployee.emp_id : "";

      // Add headers row
      const headerRow = sheet.addRow(["Date", ...headers]);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true }; // Make the header cells bold
      });
      const entry_status_column = [];
      // Add data rows
      employeeDatesXls.forEach((date, index) => {
        const row = [];
        const attendance_data = rowData.workday_data.find(
          (day) => day.date === date
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
              : attendance_data.leave_taken_without_approval === true
              ? "A"
              : "A";

          const total_hour = ConvertSecondsToTime(
            attendance_data.final_paid_hr_in_seconds
          );
          const workScheduleHr = ConvertSecondsToTime(
            attendance_data.work_schedule_hr_without_break_in_seconds
          );
          const checkedInHr = ConvertSecondsToTime(
            attendance_data.checked_in_hr_in_seconds
          );
          const status = attendance_data.hr_status;

          function getStatusText(hr_status) {
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
          }

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
          } else {
            entry_status =
              activity.early_in === true
                ? earlyin_display.text
                : activity.ontime === true
                ? on_time_entry_display.text
                : activity.late === true
                ? late_entry_display.text
                : activity.early_out === true
                ? earlyout_display.text
                : on_time_entry_display.text;
          }

          const otHours = ConvertSecondsToTime(
            attendance_data.final_ot_hr_in_seconds
          );
          const editedHours = ConvertSecondsToTime(
            attendance_data.final_paid_hr_in_seconds -
              attendance_data.checked_in_hr_in_seconds
          );

       
          // const notes = attendance_data.notes;

          // const message = notes && notes.length > 0
          //     ? notes.length > 1
          //         ? `${notes[0].message} (${notes.length - 1})`
          //         : notes[0].message
          //     : "-";
          
  
          const entryLogs = attendance_data.entry_log.map((entry) => {
            const entryTime = entry.entry_time;
            const location = entry.location;
            return {
              time: format(ParseTime(entryTime), "h:mm a"),
              location: entry.location,
              type: entry.entry_type,
            };
          });

          const entryLogIn = entryLogs.filter((entry) => entry.type === 1);
          const entryLogOut = entryLogs.filter((entry) => entry.type === 2);

          const inLength = entryLogIn.length;
          const outLength = entryLogOut.length;
          const maxIterations = Math.max(inLength, outLength);
          function applyFontColor(
            cell,
            cellNumber,
            attend_data,
            statusText,
            entry_status
          ) {
            let fontColor = "000000"; // Default font color (black)
            let isBold = false;
            // Check cell number and corresponding data to determine font color
            switch (cellNumber) {
              // Attend Data
              case 5:
                fontColor =
                  attend_data === "P"
                    ? "00FF00" // Green for Present
                    : attend_data === "A"
                    ? "FF0000" // Red for Absent
                    : attend_data === "H"
                    ? "000000" // Blue for Holiday
                    : attend_data === "L"
                    ? "FFA500" // Orange for Leave
                    : attend_data === "WO"
                    ? "888888" // Blue for WeekOff
                    : "000000"; // Default for other cases
                isBold = true;
                break;
              // Status Text
              case 6:
                fontColor =
                  statusText === "Auto Approval"
                    ? "87CEEB" // Sky blue for Auto Approval
                    : statusText === "Approval"
                    ? "00FF00" // Green for Approval
                    : statusText === "Pending"
                    ? "FFA500" // Orange for Pending
                    : statusText === "Reject"
                    ? "FF0000" // Red for Reject
                    : "000000"; // Default for other cases
                isBold = true;
                break;
              // Entry Status
              case 7:
                fontColor =
                  entry_status === "Early In"
                    ? "00FF00" // Green for Early In
                    : entry_status === "OnTime"
                    ? "00FF00" // Green for On Time
                    : entry_status === "Late"
                    ? "FFA500" // Orange for Late
                    : entry_status === "Early Out"
                    ? "FFA500" // Orange for Early Out
                    : "000000"; // Default for other cases
                isBold = true;
                break;
              // Add more cases for other cells if needed
            }

            // Apply font color to the cell
            cell.font = { color: { argb: fontColor }, bold: isBold };
          }
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
          // row.push(message || "-");

          // Flag to track if in/out data has been added for the day
          let inOutAdded = false;

          // If either entryLogIn or entryLogOut is empty, push an empty row
          if (inLength === 0 || outLength === 0) {
            row.push(
              inLength > 0
                ? entryLogIn.map((entry) => entry.location).join(", ")
                : "-"
            ); // In Location
            row.push(
              outLength > 0
                ? entryLogOut.map((entry) => entry.location).join(", ")
                : "-"
            ); // Out Location
            row.push(inLength > 0 ? entryLogIn[0].time : "-"); // In Time
            row.push(outLength > 0 ? entryLogOut[0].time : "-"); // Out Time
            row.push("-"); // Total Hours
            sheet.addRow(row).eachCell((cell, cellNumber) => {
              // Assuming the text content for the cell is in the row array
              applyFontColor(
                cell,
                cellNumber,
                attend_data,
                statusText,
                entry_status
              );
            });
          } else {
            for (let i = 0; i < maxIterations; i++) {
              const newRow = [...row]; // Copy the existing row
              const inOut = [];
              newRow.push(i < inLength ? entryLogIn[i].location : "-"); // In Location
              newRow.push(i < outLength ? entryLogOut[i].location : "-"); // Out Location
              newRow.push(i < inLength ? entryLogIn[i].time : "-"); // In Time
              newRow.push(i < outLength ? entryLogOut[i].time : "-"); // Out Time
              inOut.push(i < inLength ? entryLogIn[i].location : "-"); // In Location
              inOut.push(i < outLength ? entryLogOut[i].location : "-"); // Out Location
              inOut.push(i < inLength ? entryLogIn[i].time : "-"); // In Time
              inOut.push(i < outLength ? entryLogOut[i].time : "-"); // Out Time
              if (entryLogIn[i] && entryLogOut[i]) {
                let logInTime = new Date("2000-01-01 " + entryLogIn[i].time);
                let logOutTime = new Date("2000-01-01 " + entryLogOut[i].time);
                let timeDifferenceMs = logOutTime - logInTime;
                // If the difference is negative, it means it spans over multiple days, adjust it to be positive
                if (timeDifferenceMs < 0) {
                  timeDifferenceMs += 24 * 60 * 60 * 1000; // Add 24 hours
                }
                // Convert milliseconds to hours and minutes
                let hours = Math.floor(timeDifferenceMs / (1000 * 60 * 60));
                let minutes = Math.floor(
                  (timeDifferenceMs % (1000 * 60 * 60)) / (1000 * 60)
                );
                // Format the result
                let differenceFormatted =
                  hours.toString().padStart(2, "0") +
                  ":" +
                  minutes.toString().padStart(2, "0") +
                  " hr";
                newRow.push(differenceFormatted); // Push the formatted difference
                inOut.push(differenceFormatted);
              } else {
                newRow.push("-"); // Push '-' if either logInTime or logOutTime is not available
              }

              // Add the new row based on the condition
              if (!inOutAdded) {
                sheet.addRow(newRow).eachCell((cell, cellNumber) => {
                  // Assuming the text content for the cell is in the row array
                  applyFontColor(
                    cell,
                    cellNumber,
                    attend_data,
                    statusText,
                    entry_status
                  );
                });
              } else {
                // Push empty values for other rows
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
                  // Assuming the text content for the cell is in the row array
                  applyFontColor(
                    cell,
                    cellNumber,
                    attend_data,
                    statusText,
                    entry_status
                  );
                });
                // sheet.addRow(inOut);
              }
              inOutAdded = true; // Set flag to true after adding in/out data for the day
            }
          }
        }
      });

      const maxColumns = sheet.columns.length;
      const maxRows = sheet.rowCount;

      for (let rowIndex = 1; rowIndex <= maxRows; rowIndex++) {
        for (let colIndex = 1; colIndex <= maxColumns; colIndex++) {
          const cell = sheet.getCell(rowIndex, colIndex);
          if (colIndex % 2 === 0) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFFF" }, // Set the background color for even columns
            };
          } else {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "e6f7ff" }, // Set the background color for odd columns
            };
          }
        }
      }
      // Set column widths and cell borders
      sheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(
            maxLength,
            cell.value ? cell.value.toString().length : 0
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

      const monthYear = employeeDatesXls.map((dateString) => {
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
        const filename = `${emp_name}_${employee_id}_Attendance_${monthYear[0]}.xlsx`;
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
            appearance="subtle"
            icon={
              <span className="text-primary d-inline-block edit-item-btn fs-16">
                <i
                  class="ri-download-2-line"
                  onClick={exportindividualExcelFile}
                ></i>
              </span>
            }
          />
        </ButtonToolbar>
      </Cell>
    );
  };

  const employeeDatesXls = Array.from(
    new Set(
      team_daily_attendance_report.flatMap((employee) =>
        employee.workday_data.map((report) => report.date)
      )
    )
  );

  const exportExcelFile = () => {
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
        row: 1, // Assuming your headers start from row 1
        column: 1, // Assuming "Employee Name" is the first column
      },
      to: {
        row: 2, // Assuming all rows are populated
        column: 2, // Assuming "Email" is the second column
      },
    };

    const headers = ["Employee Name", "Email"];
    const subheaders = ["", ""];

    // Assuming `team_daily_attendance_report` is available
    const employeeDatesXls = Array.from(
      new Set(
        team_daily_attendance_report.flatMap((employee) =>
          employee.workday_data.map((report) => report.date)
        )
      )
    );

    employeeDatesXls.forEach((date, index) => {
      headers.push("", "", formatDate(date), "");
      subheaders.push("#", "Check-in", "Check-out", "Duration","Notes");
    });

    headers.push("Total Days", "Present Days");
    subheaders.push("Total Days", "Present Days")
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
      [0, 1, 2, 3,4].forEach((offset) => {
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
          cell.alignment = { horizontal: "center" }; // Center align the content
        });
      });
    }

    team_daily_attendance_report.forEach((rowData, rowIndex, colIndex) => {
      const row = [];
      const foundEmployee = employee_data.find(
        (emp) => rowData.employee_id === emp.id
      );
      const emp_name = foundEmployee ? foundEmployee.fname : "";
      row.push(emp_name);
      row.push(foundEmployee ? foundEmployee.email : "");

      employeeDatesXls.forEach((date, colIndex) => {
        const attendance_data = rowData.workday_data.find(
          (day) => day.date === date
        );
        let attend_data =
          attendance_data && attendance_data.is_present === true
            ? "P"
            : attendance_data && attendance_data.is_holiday === true
            ? "H"
            : attendance_data && attendance_data.is_day_on === false
            ? "WO"
            : attendance_data && attendance_data.is_leave_approved === true
            ? "L"
            : attendance_data &&
              attendance_data.leave_taken_without_approval === true
            ? "A"
            : "A";
        row.push(attend_data);
        const notes = attendance_data.notes;

        const message = notes && notes.length > 0
            ? notes.length > 1
                ? `${notes[0].message} (${notes.length - 1})`
                : notes[0].message
            : "-";

        if (attendance_data) {
          const checkInLog = attendance_data.entry_log.find(
            (log) => parseInt(log.entry_type) === 1
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
            attendance_data.final_paid_hr_in_seconds
          );
          const entryLogLength = attendance_data.entry_log.length;
          let duration =
            entryLogLength === 0
              ? total_hour
              : `${total_hour} (${entryLogLength})`;
          row.push(firstCheckIn);
          row.push(lastCheckOut);
          row.push(duration);
          row.push(message);
        } else {
          row.push("", "", "", "","");
        }
      });

      row.push(rowData.total_working_days_count);
      row.push(rowData.total_present_days_count);
      const dataRow = sheet.addRow(row);

      dataRow.eachCell((cell, cellNumber) => {
        let value = cell.value;
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
        if (cellNumber >= 8 && cellNumber <= 12) {
          const fillColor = colIndex % 2 === 0 ? "FFFFFF" : "e6f7ff";
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: fillColor },
          };
        } else if (cellNumber >= 13 && cellNumber <= 17) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 18 && cellNumber <= 22) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 23 && cellNumber <= 27) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 28 && cellNumber <= 32) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 33 && cellNumber <= 37) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 38 && cellNumber <= 42) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 43 && cellNumber <= 47) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 48 && cellNumber <= 52) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 53 && cellNumber <= 57) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 58 && cellNumber <= 62) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 63 && cellNumber <= 67) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 68 && cellNumber <= 72) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 73 && cellNumber <= 77) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 78 && cellNumber <= 82) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 83 && cellNumber <= 87) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 88 && cellNumber <= 92) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 93 && cellNumber <= 97) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 98 && cellNumber <= 102) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 103 && cellNumber <= 107) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 108 && cellNumber <= 112) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 113 && cellNumber <= 117) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 118 && cellNumber <= 122) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 123 && cellNumber <= 127) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 128 && cellNumber <= 132) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 133 && cellNumber <= 137) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 138 && cellNumber <= 142) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        } else if (cellNumber >= 143 && cellNumber <= 147) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        } else if (cellNumber >= 148 && cellNumber <= 152) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        }
      });
    });

    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      let maxHeight = 0;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const lines = cell.value ? cell.value.toString().split("\n").length : 1;
        maxHeight = Math.max(maxHeight, lines);
      });
      row.height = maxHeight * 15; // Adjust this factor according to your font size and row height settings
    });

    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.alignment = { horizontal: "center" };
      });
    });

    sheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        maxLength = Math.max(
          maxLength,
          cell.value ? cell.value.toString().length : 0
        );
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    // Apply borders to all cells
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center" }; // Center align the content
      });
    });
    // const additionalSheet = workbook.addWorksheet("Additional Data");
    // additionalSheet.addRow(["Additional", "Data", "Goes", "Here"]);
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const employeeDatesXls = Array.from(
        new Set(
          team_daily_attendance_report.flatMap((employee) =>
            employee.workday_data.map((report) => report.date)
          )
        )
      );

      const monthYear = employeeDatesXls.map((dateString) => {
        const date = new Date(dateString);
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();
        return `${month}_${year}`;
      });

      const filename = `Attendance_${monthYear[0]}.xlsx`; // Assuming you want to use the first month-year combination in the array

      anchor.download = filename;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  function formatDate(dateString) {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear().toString().substr(2);
    const month = new Intl.DateTimeFormat("en", { month: "short" }).format(
      dateObj
    );
    const day = dateObj.getDate().toString().padStart(2, "0");
    return `${day} ${month} ${year}`;
  }
  const [timeline_modal, settimeline_modal] = useState(false);
  const [timelineList, setTimelineList] = useState([]);
  const [timelineDate, setTimeLineDate] = useState("");
  function open_timeline() {
    settimeline_modal(!timeline_modal);
  }

  const FixedColumns = ({ rowData, index, dataKey, ...props }) => {
    let foundEmployee;
    let emp_name = (foundEmployee = employee_data.find(
      (emp) => rowData.employee_id === emp.id
    ));

    let html_tag = emp_name.profile_url ? (
      <div className="d-flex gap-2 align-items-center">
        <div className="flex-shrink-0">
          <img
            src={emp_name.profile_url}
            alt=""
            className="avatar-xs rounded-circle"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="flex-grow-1">
          <div>
            <Link to="#" className="link-body-emphasis mb-0">
              {" "}
              <h5 className="fs-14 mb-1" style={{ textAlign: "left" }}>
                {emp_name.fname}
              </h5>
            </Link>
          </div>
          <div className="fs-14 mb-1" style={{ textAlign: "left" }}>
            {emp_name.email}
          </div>
        </div>
      </div>
    ) : (
      <div className="d-flex gap-2 align-items-center">
        <div className="flex-shrink-0">
          <div
            className="avatar-xs rounded-circle"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#0ab39c",
            }}
            data-bs-toggle="tooltip"
            title={emp_name.fname}
          >
            <span className="first_letter" style={{ color: "white" }}>
              {emp_name.fname.charAt(0)}
            </span>
          </div>
        </div>
        <div className="flex-grow-1">
          <div>
            <Link to="#" className="link-body-emphasis mb-0">
              {" "}
              <h5 className="fs-14 mb-1" style={{ textAlign: "left" }}>
                {emp_name.fname}
              </h5>
            </Link>
          </div>
          <div className="fs-14 mb-1" style={{ textAlign: "left" }}>
            {emp_name.email}
          </div>
        </div>
      </div>
    );
    return (
      <Cell
        {...props}
        dataKey="id"
        style={{ backgroundColor: index % 2 === 0 ? "white" : "#e6f7ff" }}
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
          employee.workday_data.map((report) => report.date)
        )
      )
    );

    const AttendanceData = ({ rowData, date, ...props }) => {
      const attendance_data = rowData.workday_data.find(
        (day) => day.date === date
      );

      let attend_data =
        attendance_data.is_present === true
          ? "P"
          : attendance_data.is_leave_approved === true
          ? "L"
          : attendance_data.is_holiday === true
          ? "H"
          : attendance_data.is_day_on === false
          ? "WO"
          : attendance_data.leave_taken_without_approval === true
          ? "A"
          : "A";
      return (
        <Cell {...props} dataKey={`is_present${date}`}>
          {attend_data}
        </Cell>
      );
    };

    const DurationData = ({ rowData, date, ...props }) => {
      const durationData = rowData.workday_data.find(
        (day) => day.date === date
      );

      const total_hour = ConvertSecondsToTime(
        durationData.final_paid_hr_in_seconds
      );

      return (
        <Cell {...props} dataKey={`is_present${date}`}>
          {total_hour}
        </Cell>
      );
    };

    const InOut = ({ rowData, date, ...props }) => {
      const entryLogForDate = rowData.workday_data.find(
        (day) => day.date === date
      );
      const entryLogLength = entryLogForDate
        ? entryLogForDate.entry_log.length
        : "-";

      return (
        <Cell {...props} dataKey={`entry_log_${date}`}>
          {!!entryLogLength && entryLogLength}
          {!!entryLogLength && entryLogLength > 0 ? (
            <div>
              {" "}
              <Link
                className="link-opacity-75 ms-1"
                href="#"
                style={{ color: "#0AB39C" }}
                onClick={() => {
                  setTimelineList(entryLogForDate?.entry_log);
                  setTimeLineDate(
                    format(new Date(entryLogForDate?.date), "dd MMM, yyyy")
                  );
                  open_timeline();
                }}
              >
                view
              </Link>
            </div>
          ) : (
            <span>-</span>
          )}
        </Cell>
      );
    };

    employeeDates.forEach((date, index) => {
      const dynamicColumn = (
        <ColumnGroup
          key={`date_${date}`}
          align="center"
          header={
            <span style={{ fontWeight: "bold" }}>{formatDate(date)}</span>
          }
        >
          <Column
            width={100}
            className="lc_attendance_style"
            align="center"
            style={{ backgroundColor: index % 2 === 0 ? "white" : "#e6f7ff" }}
          >
            <HeaderCell className="lc_column" style={{ fontWeight: "bold" }}>Attendance</HeaderCell>
            <AttendanceData date={date} />
          </Column>

          <Column
            width={80}
            align="center"
            title="In"
            style={{ backgroundColor: index % 2 === 0 ? "white" : "	#e6f7ff" }}
          >
            <HeaderCell style={{ fontWeight: "bold" }}>In/Out</HeaderCell>
            <InOut date={date} />
          </Column>
          <Column
            width={80}
            align="center"
            title="In"
            style={{ backgroundColor: index % 2 === 0 ? "white" : "	#e6f7ff" }}
          >
            <HeaderCell style={{ fontWeight: "bold" }}>Duration</HeaderCell>
            <DurationData date={date} />
          </Column>
        </ColumnGroup>
      );

      allDynamicColumns.push(dynamicColumn);
    });

    return allDynamicColumns;
  };

  const additionalColumns = [
    <Column width={130} align="center">
      <HeaderCell
        style={{
          background: "#e6f7ff",

          borderRadius: "1px",
          padding: "18px",
          fontWeight: "bold",
        }}
      >
        Total Days
      </HeaderCell>
      <Cell dataKey="total_working_days_count" fullText />
    </Column>,
    <Column width={130} align="center">
      <HeaderCell
        style={{
          background: "#e6f7ff",

          borderRadius: "1px",
          padding: "18px",
          fontWeight: "bold",
        }}
      >
        Present Days
      </HeaderCell>
      <Cell dataKey="total_present_days_count" fullText />
    </Column>,
    <Column width={80} fixed="right">
      <HeaderCell
        style={{
          background: "#e6f7ff",

          borderRadius: "1px",
          padding: "18px",
          fontWeight: "bold",
        }}
      >
        Down
      </HeaderCell>
      <EditableCell />
    </Column>,
  ];

  const allColumns = [...dynamicColumns(), ...additionalColumns];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Card>
            <CardHeader className="border-0 rounded">
              <Row className="g-2">
                <Col xl={2}>
                  <div className="form-icon right">
                    <DatePicker
                      value={dayjs(filterKeys?.month, MonthFormat)}
                      format={MonthFormat}
                      picker="month"
                      allowClear={false}
                      className="form-control"
                      placeholder="Select Month"
                      onChange={handleDateRangeChange}
                    />
                  </div>
                </Col>

                <Button
                  type="button"
                  className="btn btn-info"
                  onClick={toggleModal} // Open the modal when the button is clicked
                  style={{
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.75rem",
                    width: "80px",
                    marginLeft: "auto",
                  }}
                >
                  <i className="ri-file-download-line align-bottom me-1"></i>
                  Export
                </Button>

                <Modal isOpen={showModal} toggle={toggleModal} centered={true}>
                  <ModalHeader toggle={toggleModal}></ModalHeader>
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
                        <p className="text-muted mx-4 mb-0">
                          Are you sure you want to export <b>{monthYear[0]}</b>{" "}
                          Attendance Report as a XLSX file?
                        </p>
                      </div>
                    </div>
                    <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                      <Button
                        type="button"
                        className="btn w-sm btn-light"
                        onClick={toggleModal} // Close the modal when the "Close" button is clicked
                      >
                        Close
                      </Button>
                      <Button
                        type="button"
                        className="btn w-sm btn-success"
                        onClick={() => {
                          exportExcelFile();
                          toggleModal(); // Close the modal after clicking the "Download" button
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
        <Table
          bordered
          cellBordered
          height={420}
          headerHeight={60}
          data={team_daily_attendance_report || []}
          rowHeight={60}
          autoHeight={true}
          loading={loading}
          className="mb-5"
          affixHorizontalScrollbar
        >
          <Column width={250} fixed="left" align="center">
            <HeaderCell
              style={{
                background: "#e6f7ff",
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
        <Modal
          isOpen={timeline_modal}
          toggle={() => {
            open_timeline();
          }}
          centered
          className="custom-modal"
        >
          <ModalHeader>
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
                  <tbody>
                    {timelineList.length > 0 &&
                      timelineList.map((data, idx) => {
                        let checkInData = timelineList[idx];
                        let checkOutData = timelineList[idx + 1];
                        if (
                          checkInData &&
                          parseInt(checkInData.entry_type) === 1
                        ) {
                          let checkInTime = format(
                            ParseTime(checkInData.entry_time),
                            "h:mm a"
                          );
                          let checkOutTime = checkOutData
                            ? format(
                                ParseTime(checkOutData.entry_time),
                                "h:mm a"
                              )
                            : "";
                          let totalDifference = checkOutData
                            ? differenceInMinutes(
                                ParseTime(checkOutData.entry_time),
                                ParseTime(checkInData.entry_time)
                              )
                            : 0;
                          let totalHours = Math.floor(totalDifference / 60);
                          let totalMinutes = totalDifference % 60;

                          let formattedTotalHours = totalHours
                            .toString()
                            .padStart(2, "0");
                          let formattedTotalMinutes = totalMinutes
                            .toString()
                            .padStart(2, "0");

                          return (
                            <tr key={idx}>
                              <td>
                                <p
                                  className="text-muted mb-1"
                                  style={{ fontWeight: "bold" }}
                                >
                                  {checkInTime}
                                </p>
                                <small
                                  className="mb-0 text-muted"
                                  style={{
                                    display: "inline-block",
                                    maxWidth: "100px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {checkInData.location_id !== null ? (
                                    <a
                                      href={`https://maps.google.com/?q=${checkInData.latitude},${checkInData.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <i className="mdi mdi-map-marker"></i>{" "}
                                      {checkInData.location || ""}
                                    </a>
                                  ) : checkInData &&
                                    checkInData.location !== "" ? (
                                    <span>
                                      <i className="mdi mdi-map-marker"></i>{" "}
                                      {checkInData.location}
                                    </span>
                                  ) : null}
                                </small>
                              </td>
                              <td>
                                <p
                                  className="text-muted mb-1"
                                  style={{ fontWeight: "bold" }}
                                >
                                  {checkOutTime}
                                </p>
                                <small
                                  className="mb-0 text-muted"
                                  style={{
                                    display: "inline-block",
                                    maxWidth: "100px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {checkOutData &&
                                  checkOutData.location_id !== null ? (
                                    <a
                                      href={`https://maps.google.com/?q=${checkOutData.latitude},${checkOutData.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <i className="mdi mdi-map-marker"></i>{" "}
                                      {checkOutData.location || ""}
                                    </a>
                                  ) : checkOutData &&
                                    checkOutData.location !== "" ? (
                                    <span>
                                      <i className="mdi mdi-map-marker"></i>{" "}
                                      {checkOutData.location}
                                    </span>
                                  ) : null}
                                </small>
                              </td>
                              <td>
                                <p
                                  className="text-muted mb-1"
                                  style={{ fontWeight: "bold" }}
                                >
                                  {formattedTotalHours}:{formattedTotalMinutes}{" "}
                                  Hr
                                </p>
                              </td>
                            </tr>
                          );
                        }
                        return null; // Skip rendering if it's not a check-in entry
                      })}
                  </tbody>
                </table>
              </SimpleBar>
              <div className="text-center mt-3">
                <Button
                  className="btn btn-warning"
                  onClick={() => {
                    open_timeline();
                  }}
                >
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
