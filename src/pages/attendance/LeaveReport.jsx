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
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "antd";
import { Api } from "../../common/api/Api";
import { changeLayoutMode } from "../../layout/HtmlLayoutHelpers";
import "../../common/css/lc_style.css";

const ExcelJs = require("exceljs");

dayjs.extend(customParseFormat);

const { Column, HeaderCell, Cell, ColumnGroup } = Table;

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ----------------------------------------------------
// Pagination page number helper
// Example:
// [1, "...", 4, 5, 6, "...", 20]
// ----------------------------------------------------
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

const LeaveReport = () => {
  const dispatch = useDispatch();

  const { layoutModeType } = useSelector((state) => state.LayoutReducer);

  document.title = `Team Monthly Leave Report | ${MetaTitle}`;

  // ----------------------------------------------------
  // Layout
  // ----------------------------------------------------
  useEffect(() => {
    if (layoutModeType) {
      dispatch(changeLayoutMode(layoutModeType));
    }
  }, [layoutModeType, dispatch]);

  // ----------------------------------------------------
  // Employee local storage
  // ----------------------------------------------------
  const employee_data = GetLocalStorageData("employee") || [];

  // ----------------------------------------------------
  // Main report state
  // ----------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState([]);

  // ----------------------------------------------------
  // Month filter
  // ----------------------------------------------------
  const [filterKeys, setFilterKeys] = useState({
    month: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
  });

  // ----------------------------------------------------
  // Server-side pagination
  // ----------------------------------------------------
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ----------------------------------------------------
  // Export-confirm modal
  // ----------------------------------------------------
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal((s) => !s);
  };

  // ----------------------------------------------------
  // Applications detail modal
  // ----------------------------------------------------
  const [detailModal, setDetailModal] = useState(false);

  const [detailData, setDetailData] = useState({
    date: "",
    applications: [],
    leave_counts: [],
  });

  // ====================================================
  // GET TEAM MONTHLY LEAVE REPORT
  //
  // GET
  // /report/get-team-monthly-leave-report/
  // ?thisMonth=2026-09
  // &page=1
  // &page_size=10
  // ====================================================
  const getReportData = (thisMonth, targetPage, targetPageSize) => {
    setLoading(true);

    Api({
      method: "GET",
      url:
        "report/get-team-monthly-leave-report/?thisMonth=" +
        encodeURIComponent(thisMonth) +
        "&page=" +
        targetPage +
        "&page_size=" +
        targetPageSize,
    })
      .then((res) => {
        const body = res?.data;

        const list = Array.isArray(body?.data) ? body.data : [];

        const total = body?.count ?? 0;

        const apiTotalPages =
          body?.total_pages ?? Math.max(1, Math.ceil(total / targetPageSize));

        setReport(list);
        setTotalCount(total);
        setTotalPages(apiTotalPages);

        // If current page has become empty,
        // move back to previous page.
        if (list.length === 0 && targetPage > 1) {
          setPage(targetPage - 1);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Team monthly leave report API error:", error);

        setReport([]);
        setTotalCount(0);
        setTotalPages(1);

        setLoading(false);
      });
  };

  // ----------------------------------------------------
  // Fetch on mount and whenever:
  // month / page / pageSize changes
  // ----------------------------------------------------
  useEffect(() => {
    getReportData(filterKeys.month, page, pageSize);
  }, [filterKeys.month, page, pageSize]);

  // ----------------------------------------------------
  // Month change
  // ----------------------------------------------------
  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys((prev) => ({
      ...prev,
      month: monthStr,
    }));

    // New month always starts at page 1
    setPage(1);
  };

  // ----------------------------------------------------
  // Page change
  // ----------------------------------------------------
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) {
      return;
    }

    setPage(newPage);
  };

  // ----------------------------------------------------
  // Page size change
  // ----------------------------------------------------
  const handlePageSizeChange = (e) => {
    const newPageSize = Number(e.target.value);

    setPageSize(newPageSize);

    // New page size starts at page 1
    setPage(1);
  };

  // ----------------------------------------------------
  // Format date
  // ----------------------------------------------------
  function formatDate(dateString) {
    const d = new Date(dateString);

    const month = new Intl.DateTimeFormat("en", {
      month: "short",
    }).format(d);

    const day = d.getDate().toString().padStart(2, "0");

    return `${day} ${month} ${d.getFullYear().toString().substr(2)}`;
  }

  // ====================================================
  // DERIVED DATA
  // ====================================================

  // Dates available in current API page
  const leaveDates = Array.from(
    new Set(
      report.flatMap((e) => (e.daily_leave_data || []).map((d) => d.date)),
    ),
  );

  // Leave types
  const leaveTypes = Array.from(
    new Map(
      report.flatMap((e) => [
        ...(e.leave_type_summary || []).map((lt) => [
          lt.leave_type_id,
          lt.leave_type_name,
        ]),

        ...(e.daily_leave_data || []).flatMap((d) =>
          (d.leave_counts || []).map((lc) => [
            lc.leave_type_id,
            lc.leave_type_name,
          ]),
        ),
      ]),
    ),
  )
    .map(([id, name]) => ({
      id,
      name,
    }))
    .sort((a, b) => a.id - b.id);

  // Total leaves on current page
  const teamTotalLeaves = report.reduce(
    (sum, e) => sum + (e.total_leaves_taken || 0),
    0,
  );

  // Month label
  const monthLabel = leaveDates.length
    ? (() => {
        const d = new Date(leaveDates[0]);

        return `${d.toLocaleString("default", {
          month: "short",
        })} ${d.getFullYear()}`;
      })()
    : filterKeys.month;

  // ====================================================
  // EMPLOYEE FIXED CELL
  // ====================================================

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
              style={{
                objectFit: "cover",
              }}
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
              <span
                className="first_letter"
                style={{
                  color: "white",
                }}
              >
                {emp?.first_name?.charAt(0) || ""}
              </span>
            </div>
          )}
        </div>

        <div className="flex-grow-1">
          <Link to="#" className="link-body-emphasis mb-0">
            <h5
              className="fs-14 mb-1"
              style={{
                textAlign: "left",
              }}
            >
              {emp.first_name}
            </h5>
          </Link>

          <div
            className="fs-14 mb-1"
            style={{
              textAlign: "left",
            }}
          >
            {emp.email}
          </div>
        </div>
      </div>
    );

    const rowBg =
      index % 2 === 0
        ? layoutModeType === "dark"
          ? "#1a1a1a"
          : "white"
        : layoutModeType === "dark"
          ? "#242933"
          : "#e6f7ff";

    return (
      <Cell
        {...props}
        style={{
          backgroundColor: rowBg,
          alignItems: "flex-start",
          justifyContent: "flex-start",
          paddingRight: "10px",
        }}
      >
        {html_tag}
      </Cell>
    );
  };

  // ====================================================
  // PER-DATE LEAVE CELL
  // ====================================================

  const LeaveCell = ({ rowData, date, bgColor, ...props }) => {
    const day = (rowData.daily_leave_data || []).find((d) => d.date === date);

    const total = day?.total_leaves || 0;

    const hasApps = day?.applications?.length > 0;

    return (
      <Cell
        {...props}
        style={{
          backgroundColor: bgColor,
        }}
      >
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
                style={{
                  color: "#0AB39C",
                  fontSize: "12px",
                }}
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

  // ====================================================
  // PER LEAVE TYPE SUMMARY CELL
  // ====================================================

  const LeaveTypeCell = ({ rowData, leaveTypeId, ...props }) => {
    const item = (rowData.leave_type_summary || []).find(
      (s) => s.leave_type_id === leaveTypeId,
    );

    return <Cell {...props}>{item ? item.total_taken : 0}</Cell>;
  };

  // ====================================================
  // INDIVIDUAL EMPLOYEE EXPORT
  // ====================================================

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

      hr.font = {
        bold: true,
      };

      (rowData.daily_leave_data || []).forEach((day) => {
        const row = [formatDate(day.date), day.weekday];

        leaveTypes.forEach((lt) => {
          const c = (day.leave_counts || []).find(
            (x) => x.leave_type_id === lt.id,
          );

          row.push(c ? c.count : 0);
        });

        row.push(day.total_leaves || 0);

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
            top: {
              style: "thin",
            },
            left: {
              style: "thin",
            },
            bottom: {
              style: "thin",
            },
            right: {
              style: "thin",
            },
          };

          c.alignment = {
            horizontal: "center",
            wrapText: true,
          };
        }),
      );

      sheet.columns.forEach((col) => {
        let max = 0;

        col.eachCell(
          {
            includeEmpty: true,
          },
          (c) => {
            max = Math.max(max, c.value ? c.value.toString().length : 0);
          },
        );

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

  // ====================================================
  // TEAM EXPORT
  // ====================================================

  const exportExcelFile = () => {
    const wb = new ExcelJs.Workbook();

    const sheet = wb.addWorksheet("Leave Report", {
      views: [
        {
          state: "frozen",
          xSplit: 2,
          ySplit: 1,
        },
      ],
    });

    const headers = ["Employee", "Email"];

    leaveDates.forEach((d) => {
      headers.push(formatDate(d));
    });

    leaveTypes.forEach((lt) => {
      headers.push(lt.name);
    });

    headers.push("Total Leaves");

    const headerRow = sheet.addRow(headers);

    headerRow.font = {
      bold: true,
    };

    report.forEach((emp) => {
      const found = employee_data.find((e) => emp.employee_id === e.id);

      const row = [found ? found.first_name : "", found ? found.email : ""];

      leaveDates.forEach((d) => {
        const day = (emp.daily_leave_data || []).find((x) => x.date === d);

        row.push(day && day.total_leaves > 0 ? day.total_leaves : "-");
      });

      leaveTypes.forEach((lt) => {
        const s = (emp.leave_type_summary || []).find(
          (x) => x.leave_type_id === lt.id,
        );

        row.push(s ? s.total_taken : 0);
      });

      row.push(emp.total_leaves_taken || 0);

      const dataRow = sheet.addRow(row);

      dataRow.eachCell((cell, n) => {
        if (cell.value !== "-" && typeof cell.value === "number" && n > 2) {
          cell.font = {
            color: {
              argb: "f06548",
            },
            bold: true,
          };
        }
      });
    });

    sheet.eachRow((row) =>
      row.eachCell((cell, n) => {
        cell.alignment = {
          horizontal: "center",
        };

        cell.border = {
          top: {
            style: "thin",
          },
          left: {
            style: "thin",
          },
          bottom: {
            style: "thin",
          },
          right: {
            style: "thin",
          },
        };

        if (n > 2 && n % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: "e6f7ff",
            },
          };
        }
      }),
    );

    sheet.columns.forEach((col) => {
      let max = 0;

      col.eachCell(
        {
          includeEmpty: true,
        },
        (c) => {
          max = Math.max(max, c.value ? c.value.toString().length : 0);
        },
      );

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

  // ====================================================
  // TABLE COLUMNS
  // ====================================================

  const isDark = layoutModeType === "dark";

  const headerColor = isDark ? "#242933" : "#e6f7ff";

  const headerBgColor = isDark ? "#1a1d24" : "white";

  // ----------------------------------------------------
  // Dynamic date columns
  // ----------------------------------------------------

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
        header={
          <span
            style={{
              fontWeight: "bold",
            }}
          >
            {formatDate(date)}
          </span>
        }
      >
        <Column width={100} align="center">
          <HeaderCell
            style={{
              fontWeight: "bold",
              background: bgColor,
            }}
          >
            Leaves
          </HeaderCell>

          <LeaveCell date={date} bgColor={bgColor} />
        </Column>
      </ColumnGroup>
    );
  });

  // ----------------------------------------------------
  // Summary columns
  // ----------------------------------------------------

  const summaryColumns = [
    ...leaveTypes.map((lt) => (
      <Column width={130} align="center" key={`lt_${lt.id}`}>
        <HeaderCell
          style={{
            background: headerBgColor,
            fontWeight: "bold",
            padding: 18,
          }}
        >
          {lt.name}
        </HeaderCell>

        <LeaveTypeCell
          leaveTypeId={lt.id}
          style={{
            background: headerBgColor,
          }}
        />
      </Column>
    )),

    <Column width={130} align="center" key="total-leaves">
      <HeaderCell
        style={{
          background: headerBgColor,
          fontWeight: "bold",
          padding: 18,
        }}
      >
        Total Leaves
      </HeaderCell>

      <Cell
        dataKey="total_leaves_taken"
        style={{
          background: headerBgColor,
          fontWeight: "bold",
        }}
      />
    </Column>,

    <Column width={80} fixed="right" key="download">
      <HeaderCell
        style={{
          fontWeight: "bold",
          padding: 18,
        }}
      >
        Down
      </HeaderCell>

      <DownloadCell />
    </Column>,
  ];

  // ====================================================
  // PAGINATION VALUES
  // ====================================================

  const rowsOnPage = report.length;

  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;

  const endItem = Math.min((page - 1) * pageSize + rowsOnPage, totalCount);

  const prevDisabled = page <= 1;

  const nextDisabled = page >= totalPages;

  const pageNumbers = getPageNumbers(page, totalPages);

  const pageItems = [];

  pageNumbers.forEach((p, idx) => {
    if (p === "...") {
      pageItems.push(
        <li className="page-item disabled" key={`gap-${idx}`}>
          <span className="page-link">...</span>
        </li>,
      );

      return;
    }

    pageItems.push(
      <li className="page-item" key={`p-${p}`}>
        <button
          type="button"
          className={p === page ? "page-link active" : "page-link"}
          onClick={() => handlePageChange(p)}
        >
          {p}
        </button>
      </li>,
    );
  });

  const pageSizeOptions = PAGE_SIZE_OPTIONS.map((size) => (
    <option key={size} value={size}>
      {"Show " + size}
    </option>
  ));

  // ====================================================
  // RETURN
  // ====================================================

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Card>
            <CardHeader className="border-0 rounded">
              <Row className="g-2 align-items-center">
                {/* Month */}
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

                {/* Summary */}
                <Col xl={4}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-danger-subtle text-danger fs-12 p-2">
                      Total Leaves: <b>{teamTotalLeaves}</b>
                    </span>

                    <span className="badge bg-info-subtle text-info fs-12 p-2">
                      Employees: <b>{report.length}</b>
                    </span>

                    <span className="badge bg-primary-subtle text-primary fs-12 p-2">
                      Total: <b>{totalCount}</b>
                    </span>
                  </div>
                </Col>

                {/* Export */}
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

                {/* Export Modal */}
                <Modal isOpen={showModal} toggle={toggleModal} centered>
                  <ModalHeader toggle={toggleModal}></ModalHeader>

                  <ModalBody className="py-3 px-5">
                    <div className="mt-2 text-center">
                      <lord-icon
                        src="https://cdn.lordicon.com/nocovwne.json"
                        trigger="loop"
                        colors="primary:#0ab39c,secondary:#f06548"
                        style={{
                          width: "100px",
                          height: "100px",
                        }}
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

        {/* ==================================================
            LEAVE REPORT TABLE
        ================================================== */}

        <Table
          bordered
          cellBordered
          height={500}
          headerHeight={60}
          data={report || []}
          rowHeight={60}
          autoHeight
          loading={loading}
          className="mb-3"
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

        {/* ==================================================
            PAGINATION
        ================================================== */}

        <Container fluid>
          <Row className="align-items-center g-3 text-center text-sm-start mb-5">
            {/* Showing */}
            <div className="col-sm">
              <div className="text-muted">
                Showing <span className="fw-semibold ms-1">{startItem}</span> to{" "}
                <span className="fw-semibold">{endItem}</span> of{" "}
                <span className="fw-semibold">{totalCount}</span>
              </div>
            </div>

            {/* Pagination */}
            <div className="col-sm-auto">
              <ul className="pagination pagination-separated pagination-md justify-content-center justify-content-sm-start mb-0">
                {/* Previous */}
                <li
                  className={prevDisabled ? "page-item disabled" : "page-item"}
                >
                  <button
                    type="button"
                    className="page-link"
                    disabled={prevDisabled}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Previous
                  </button>
                </li>

                {/* Page numbers */}
                {pageItems}

                {/* Next */}
                <li
                  className={nextDisabled ? "page-item disabled" : "page-item"}
                >
                  <button
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

            {/* Page size */}
            <div className="col-sm-auto">
              <select
                className="form-select custom-select-medium text-muted my-select"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                {pageSizeOptions}
              </select>
            </div>
          </Row>
        </Container>

        {/* ==================================================
            APPLICATION DETAILS MODAL
        ================================================== */}

        <Modal
          isOpen={detailModal}
          toggle={() => setDetailModal(false)}
          centered
          className="custom-modal"
        >
          <ModalHeader toggle={() => setDetailModal(false)}>
            <h5
              className="modal-title"
              style={{
                fontSize: "smaller",
              }}
            >
              Date: {detailData.date}
            </h5>
          </ModalHeader>

          <ModalBody className="text-left">
            <SimpleBar
              style={{
                maxHeight: "410px",
              }}
              className="p-2 pt-0"
            >
              {/* Leave counts */}
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

              {/* Applications */}
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
