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
} from "reactstrap";
import SimpleBar from "simplebar-react";
import { MetaTitle } from "../../common/data/MetaTitle";
import { ButtonToolbar, IconButton, Table } from "rsuite";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { MonthFormat } from "../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "antd";
import { Api } from "../../common/api/Api";
import { changeLayoutMode } from "../../layout/HtmlLayoutHelpers";
const ExcelJs = require("exceljs");
import "../../common/css/lc_style.css";

const { Column, HeaderCell, Cell, ColumnGroup } = Table;

const LeaveReport = () => {
  const dispatch = useDispatch();
  const { layoutModeType } = useSelector((state) => state.LayoutReducer);

  document.title = `Team Monthly Leave Report | ${MetaTitle}`;

  useEffect(() => {
    if (layoutModeType) dispatch(changeLayoutMode(layoutModeType));
  }, []);

  const employee_data = GetLocalStorageData("employee") || [];

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState([]);
  const [filterKeys, setFilterKeys] = useState({
    month: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
  });

  // export-confirm modal
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal((s) => !s);

  // applications detail modal
  const [detailModal, setDetailModal] = useState(false);
  const [detailData, setDetailData] = useState({
    date: "",
    applications: [],
    leave_counts: [],
  });

  useEffect(() => {
    getReportData(filterKeys.month);
  }, []);

  const getReportData = (thisMonth) => {
    setLoading(true);
    Api({
      type: "GET",
      url: "report/get-team-monthly-leave-report/?thisMonth=" + thisMonth,
    })
      .then((res) => {
        setReport(res?.data?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys((p) => ({ ...p, month: monthStr }));
    getReportData(monthStr);
  };

  function formatDate(dateString) {
    const d = new Date(dateString);
    const month = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
    const day = d.getDate().toString().padStart(2, "0");
    return `${day} ${month} ${d.getFullYear().toString().substr(2)}`;
  }

  // ----- derived data -----
  const leaveDates = Array.from(
    new Set(report.flatMap((e) => e.daily_leave_data.map((d) => d.date))),
  );

  const leaveTypes = Array.from(
    new Map(
      report.flatMap((e) => [
        ...(e.leave_type_summary || []).map((lt) => [
          lt.leave_type_id,
          lt.leave_type_name,
        ]),
        ...e.daily_leave_data.flatMap((d) =>
          (d.leave_counts || []).map((lc) => [
            lc.leave_type_id,
            lc.leave_type_name,
          ]),
        ),
      ]),
    ),
  )
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.id - b.id);

  const teamTotalLeaves = report.reduce(
    (sum, e) => sum + (e.total_leaves_taken || 0),
    0,
  );

  const monthLabel = leaveDates.length
    ? (() => {
        const d = new Date(leaveDates[0]);
        return `${d.toLocaleString("default", {
          month: "short",
        })} ${d.getFullYear()}`;
      })()
    : filterKeys.month;

  // ----- employee fixed cell -----
  const FixedColumns = ({ rowData, index, ...props }) => {
    const emp = employee_data.find((e) => rowData.employee_id === e.id) || {};
    const html_tag = (
      <div className="d-flex gap-2 align-items-center">
        <div className="flex-shrink-0">
          {emp.profile_url ? (
            <img
              src={emp.profile_url}
              alt=""
              className="avatar-xs rounded-circle"
              style={{ objectFit: "cover" }}
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
              title={emp.first_name}
            >
              <span className="first_letter" style={{ color: "white" }}>
                {emp?.first_name?.charAt(0) || ""}
              </span>
            </div>
          )}
        </div>
        <div className="flex-grow-1">
          <Link to="#" className="link-body-emphasis mb-0">
            <h5 className="fs-14 mb-1" style={{ textAlign: "left" }}>
              {emp.first_name}
            </h5>
          </Link>
          <div className="fs-14 mb-1" style={{ textAlign: "left" }}>
            {emp.email}
          </div>
        </div>
      </div>
    );
    return (
      <Cell
        {...props}
        style={{
          backgroundColor:
            index % 2 === 0
              ? layoutModeType === "dark"
                ? "#1a1a1a"
                : "white"
              : layoutModeType === "dark"
                ? "#242933"
                : "#e6f7ff",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          paddingRight: "10px",
        }}
      >
        {html_tag}
      </Cell>
    );
  };

  // ----- per-date leave cell -----
  const LeaveCell = ({ rowData, date, bgColor, ...props }) => {
    const day = rowData.daily_leave_data.find((d) => d.date === date);
    const total = day?.total_leaves || 0;
    const hasApps = day?.applications?.length > 0;
    return (
      <Cell {...props} style={{ backgroundColor: bgColor }}>
        {total > 0 ? (
          <div className="d-flex flex-column align-items-center">
            <span
              style={{
                fontWeight: "bold",
                color: "#f06548",
              }}
            >
              {total}
            </span>

            {hasApps && (
              <Link
                to="#"
                className="mt-1"
                style={{ color: "#0AB39C", fontSize: "12px" }}
                onClick={() => {
                  setDetailData({
                    date: format(new Date(day.date), "dd MMM, yyyy"),
                    applications: day.applications,
                    leave_counts: day.leave_counts,
                  });
                  setDetailModal(true);
                }}
              >
                View
              </Link>
            )}
          </div>
        ) : (
          "-"
        )}
      </Cell>
    );
  };

  // ----- per-leave-type summary cell -----
  const LeaveTypeCell = ({ rowData, leaveTypeId, ...props }) => {
    const item = (rowData.leave_type_summary || []).find(
      (s) => s.leave_type_id === leaveTypeId,
    );
    return <Cell {...props}>{item ? item.total_taken : 0}</Cell>;
  };

  // ----- per-employee export -----
  const DownloadCell = ({ rowData, ...props }) => {
    const exportEmp = () => {
      const found = employee_data.find((e) => rowData.employee_id === e.id);
      const name = found ? found.first_name : "Employee";
      const empId = found ? found.emp_id : "";

      const wb = new ExcelJs.Workbook();
      const sheet = wb.addWorksheet("Leaves");
      const headers = [
        "Date",
        "Weekday",
        ...leaveTypes.map((lt) => lt.name),
        "Total",
        "Applications",
      ];
      const hr = sheet.addRow(headers);
      hr.font = { bold: true };

      rowData.daily_leave_data.forEach((day) => {
        const row = [formatDate(day.date), day.weekday];
        leaveTypes.forEach((lt) => {
          const c = (day.leave_counts || []).find(
            (x) => x.leave_type_id === lt.id,
          );
          row.push(c ? c.count : 0);
        });
        row.push(day.total_leaves);
        row.push(
          (day.applications || [])
            .map((a) => `${a.leave_type_name}: ${a.reason}`)
            .join(" | ") || "-",
        );
        sheet.addRow(row);
      });

      sheet.eachRow((r) =>
        r.eachCell((c) => {
          c.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          c.alignment = { horizontal: "center", wrapText: true };
        }),
      );
      sheet.columns.forEach((col) => {
        let max = 0;
        col.eachCell({ includeEmpty: true }, (c) => {
          max = Math.max(max, c.value ? c.value.toString().length : 0);
        });
        col.width = max < 10 ? 10 : Math.min(max + 2, 50);
      });

      wb.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name}_${empId}_Leaves_${filterKeys.month}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
    };

    return (
      <Cell
        {...props}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ButtonToolbar>
          <IconButton
            appearance="subtle"
            onClick={exportEmp}
            icon={
              <span className="text-primary d-inline-block edit-item-btn fs-16">
                <i className="ri-download-2-line" />
              </span>
            }
          />
        </ButtonToolbar>
      </Cell>
    );
  };

  // ----- team export -----
  const exportExcelFile = () => {
    const wb = new ExcelJs.Workbook();
    const sheet = wb.addWorksheet("Leave Report", {
      views: [{ state: "frozen", xSplit: 2, ySplit: 1 }],
    });

    const headers = ["Employee", "Email"];
    leaveDates.forEach((d) => headers.push(formatDate(d)));
    leaveTypes.forEach((lt) => headers.push(lt.name));
    headers.push("Total Leaves");

    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };

    report.forEach((emp) => {
      const found = employee_data.find((e) => emp.employee_id === e.id);
      const row = [found ? found.first_name : "", found ? found.email : ""];
      leaveDates.forEach((d) => {
        const day = emp.daily_leave_data.find((x) => x.date === d);
        row.push(day && day.total_leaves > 0 ? day.total_leaves : "-");
      });
      leaveTypes.forEach((lt) => {
        const s = (emp.leave_type_summary || []).find(
          (x) => x.leave_type_id === lt.id,
        );
        row.push(s ? s.total_taken : 0);
      });
      row.push(emp.total_leaves_taken);

      const dataRow = sheet.addRow(row);
      dataRow.eachCell((cell, n) => {
        if (cell.value !== "-" && typeof cell.value === "number" && n > 2) {
          cell.font = { color: { argb: "f06548" }, bold: true };
        }
      });
    });

    sheet.eachRow((row) =>
      row.eachCell((cell, n) => {
        cell.alignment = { horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (n > 2 && n % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "e6f7ff" },
          };
        }
      }),
    );
    sheet.columns.forEach((col) => {
      let max = 0;
      col.eachCell({ includeEmpty: true }, (c) => {
        max = Math.max(max, c.value ? c.value.toString().length : 0);
      });
      col.width = max < 10 ? 10 : max + 2;
    });

    wb.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Leave_Report_${filterKeys.month}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  // ----- columns -----
  const isDark = layoutModeType === "dark";
  const headerColor = isDark ? "#242933" : "#e6f7ff";
  const headerBgColor = isDark ? "#1a1d24" : "white";

  const dynamicColumns = leaveDates.map((date, index) => {
    const bgColor =
      index % 2 === 0
        ? isDark
          ? "#1a1d24"
          : "white"
        : isDark
          ? "#242933"
          : "#e6f7ff";
    return (
      <ColumnGroup
        key={`date_${date}`}
        align="center"
        header={<span style={{ fontWeight: "bold" }}>{formatDate(date)}</span>}
      >
        <Column width={100} align="center">
          <HeaderCell style={{ fontWeight: "bold", background: bgColor }}>
            Leaves
          </HeaderCell>
          <LeaveCell date={date} bgColor={bgColor} />
        </Column>
      </ColumnGroup>
    );
  });

  const summaryColumns = [
    ...leaveTypes.map((lt) => (
      <Column width={130} align="center" key={`lt_${lt.id}`}>
        <HeaderCell
          style={{ background: headerBgColor, fontWeight: "bold", padding: 18 }}
        >
          {lt.name}
        </HeaderCell>
        <LeaveTypeCell
          leaveTypeId={lt.id}
          style={{ background: headerBgColor }}
        />
      </Column>
    )),
    <Column width={130} align="center" key="total-leaves">
      <HeaderCell
        style={{ background: headerBgColor, fontWeight: "bold", padding: 18 }}
      >
        Total Leaves
      </HeaderCell>
      <Cell
        dataKey="total_leaves_taken"
        style={{ background: headerBgColor, fontWeight: "bold" }}
      />
    </Column>,
    <Column width={80} fixed="right" key="download">
      <HeaderCell style={{ fontWeight: "bold", padding: 18 }}>Down</HeaderCell>
      <DownloadCell />
    </Column>,
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Card>
            <CardHeader className="border-0 rounded">
              <Row className="g-2 align-items-center">
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

                <Col xl={4}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-danger-subtle text-danger fs-12 p-2">
                      Total Leaves: <b>{teamTotalLeaves}</b>
                    </span>
                    <span className="badge bg-info-subtle text-info fs-12 p-2">
                      Employees: <b>{report.length}</b>
                    </span>
                  </div>
                </Col>

                <Col xl={6} className="text-end">
                  <Button
                    type="button"
                    className="btn btn-info"
                    onClick={toggleModal}
                    style={{
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.75rem",
                      width: "80px",
                    }}
                  >
                    <i className="ri-file-download-line align-bottom me-1"></i>
                    Export
                  </Button>
                </Col>

                <Modal isOpen={showModal} toggle={toggleModal} centered>
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
                          Export <b>{monthLabel}</b> Leave Report as a XLSX
                          file?
                        </p>
                      </div>
                    </div>
                    <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                      <Button
                        type="button"
                        className="btn w-sm btn-light"
                        onClick={toggleModal}
                      >
                        Close
                      </Button>
                      <Button
                        type="button"
                        className="btn w-sm btn-success"
                        onClick={() => {
                          exportExcelFile();
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

        <Table
          bordered
          cellBordered
          height={500}
          headerHeight={60}
          data={report || []}
          rowHeight={60}
          autoHeight
          loading={loading}
          className="mb-5"
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
          {dynamicColumns}
          {summaryColumns}
        </Table>

        {/* applications detail modal */}
        <Modal
          isOpen={detailModal}
          toggle={() => setDetailModal(false)}
          centered
          className="custom-modal"
        >
          <ModalHeader toggle={() => setDetailModal(false)}>
            <h5 className="modal-title" style={{ fontSize: "smaller" }}>
              Date: {detailData.date}
            </h5>
          </ModalHeader>
          <ModalBody className="text-left">
            <SimpleBar style={{ maxHeight: "410px" }} className="p-2 pt-0">
              {detailData.leave_counts?.length > 0 && (
                <table className="table table-sm mb-3">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th className="text-end">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailData.leave_counts.map((lc) => (
                      <tr key={lc.leave_type_id}>
                        <td>{lc.leave_type_name}</td>
                        <td className="text-end">{lc.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h6 className="mb-2">Applications</h6>
              {detailData.applications?.length > 0 ? (
                detailData.applications.map((a) => (
                  <div
                    key={a.leave_application_id}
                    className="border rounded p-2 mb-2"
                  >
                    <div className="fw-bold text-primary">
                      {a.leave_type_name}
                    </div>
                    <small className="text-muted">{a.reason || "-"}</small>
                  </div>
                ))
              ) : (
                <p className="text-muted mb-0">No applications.</p>
              )}
            </SimpleBar>
            <div className="text-center mt-3">
              <Button
                className="btn btn-warning"
                onClick={() => setDetailModal(false)}
              >
                Close
              </Button>
            </div>
          </ModalBody>
        </Modal>
      </div>
    </React.Fragment>
  );
};

export default LeaveReport;
