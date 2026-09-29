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

const DEFAULT_PAGE_SIZE = 20; // API default (max 100)
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
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

const BreakReport = () => {
  const dispatch = useDispatch();
  const { layoutModeType } = useSelector((state) => state.LayoutReducer);

  document.title = `Team Monthly Break Report | ${MetaTitle}`;

  useEffect(() => {
    if (layoutModeType) dispatch(changeLayoutMode(layoutModeType));
  }, []);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState([]);
  const [filterKeys, setFilterKeys] = useState({
    month: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
  });

  // ── search state (debounced) ────────────────
  // searchInput updates instantly as the user types;
  // search is the debounced value that drives the API call.
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1); // restart from first page on a new search
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const clearSearch = () => {
    setSearchInput("");
  };

  // ── pagination state ────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPagesFromApi, setTotalPagesFromApi] = useState(1);

  // ── export modal state ──────────────────────
  // "page" -> export current page (report state)
  // "all"  -> export every employee via export-all-break-report/
  const [showModal, setShowModal] = useState(false);
  const [exportType, setExportType] = useState("page");
  const [exportingAll, setExportingAll] = useState(false);

  const toggleModal = () => setShowModal((s) => !s);

  const openExportModal = (type) => {
    setExportType(type);
    setShowModal(true);
  };

  const [detailModal, setDetailModal] = useState(false);
  const [detailData, setDetailData] = useState({
    date: "",
    status_log: [],
  });

  // GET /report/get-employee-break-report/v2/?thisMonth=2026-09&page=1&page_size=20&search=john
  const getReportData = (thisMonth, targetPage, targetPageSize, searchTerm) => {
    setLoading(true);

    let url =
      "report/get-employee-break-report/v2/?thisMonth=" +
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
        const body = (res && res.data) || {};
        const list = Array.isArray(body.data) ? body.data : [];
        const total = body.count != null ? body.count : list.length;
        const pages =
          body.total_pages != null
            ? body.total_pages
            : Math.max(1, Math.ceil(total / targetPageSize));

        setReport(list);
        setTotalCount(total);
        setTotalPagesFromApi(Math.max(1, pages));

        // current page became empty -> step back
        if (list.length === 0 && targetPage > 1) {
          setPage(targetPage - 1);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // fetch on mount and whenever month / page / page size / search changes
  useEffect(() => {
    getReportData(filterKeys.month, page, pageSize, search);
  }, [filterKeys.month, page, pageSize, search]);

  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys((p) => ({ ...p, month: monthStr }));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPagesFromApi || newPage === page) return;
    setPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  function formatDate(dateString) {
    const d = new Date(dateString);
    const month = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
    const day = d.getDate().toString().padStart(2, "0");
    return `${day} ${month} ${d.getFullYear().toString().substr(2)}`;
  }

  // seconds -> H:MM:SS
  function formatDuration(seconds) {
    if (!seconds) return "-";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }

  // ----- derived data (current page only — drives the on-screen table) -----
  const breakDates = Array.from(
    new Set(report.flatMap((e) => e.break_status_data.map((d) => d.date))),
  );

  const breakTypes = Array.from(
    new Map(
      report.flatMap((e) =>
        e.break_status_data.flatMap((d) =>
          (d.status_log || []).map((s) => [s.id, s.name]),
        ),
      ),
    ),
  )
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.id - b.id);

  const monthLabel = breakDates.length
    ? (() => {
        const d = new Date(breakDates[0]);
        return `${d.toLocaleString("default", {
          month: "short",
        })} ${d.getFullYear()}`;
      })()
    : filterKeys.month;

  // per-employee, per-type total across the month
  const getTypeTotal = (rowData, typeId) =>
    rowData.break_status_data.reduce((sum, d) => {
      const entry = (d.status_log || []).find((s) => s.id === typeId);
      return sum + (entry ? entry.break_duration : 0);
    }, 0);

  // ----- employee fixed cell -----
  const FixedColumns = ({ rowData, index, ...props }) => {
    const emp = rowData.employee || {};
    const html_tag = (
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
            title={emp.first_name}
          >
            <span className="first_letter" style={{ color: "white" }}>
              {emp?.first_name?.charAt(0) || ""}
            </span>
          </div>
        </div>
        <div className="flex-grow-1">
          <Link to="#" className="link-body-emphasis mb-0">
            <h5 className="fs-14 mb-1" style={{ textAlign: "left" }}>
              {emp.first_name} {emp.last_name}
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

  // ----- per-date break cell -----
  const BreakCell = ({ rowData, date, bgColor, ...props }) => {
    const day = rowData.break_status_data.find((d) => d.date === date);
    const total = day?.total_break_duration || 0;
    const hasLog = day?.status_log?.length > 0;
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
              {formatDuration(total)}
            </span>

            {hasLog && (
              <Link
                to="#"
                className="mt-1"
                style={{ color: "#0AB39C", fontSize: "12px" }}
                onClick={() => {
                  setDetailData({
                    date: format(new Date(day.date), "dd MMM, yyyy"),
                    status_log: day.status_log,
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

  // ----- per-break-type summary cell -----
  const BreakTypeCell = ({ rowData, typeId, ...props }) => {
    const total = getTypeTotal(rowData, typeId);
    return <Cell {...props}>{formatDuration(total)}</Cell>;
  };

  // ----- per-employee export -----
  const DownloadCell = ({ rowData, ...props }) => {
    const exportEmp = () => {
      const emp = rowData.employee || {};
      const name = emp.first_name || "Employee";

      const wb = new ExcelJs.Workbook();
      const sheet = wb.addWorksheet("Breaks");
      const headers = ["Date", ...breakTypes.map((bt) => bt.name), "Total"];
      const hr = sheet.addRow(headers);
      hr.font = { bold: true };

      rowData.break_status_data.forEach((day) => {
        const row = [formatDate(day.date)];
        breakTypes.forEach((bt) => {
          const c = (day.status_log || []).find((x) => x.id === bt.id);
          row.push(c ? formatDuration(c.break_duration) : "-");
        });
        row.push(formatDuration(day.total_break_duration));
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
        a.download = `${name}_Breaks_${filterKeys.month}.xlsx`;
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
  //
  // Builds the team XLSX from any report list:
  //  - "Export"     -> current page rows (default: `report` state)
  //  - "Export All" -> full month list from export-all-break-report/
  //
  // Dates / break types are derived from whichever dataset is
  // passed in, NOT from the paginated `breakDates` / `breakTypes`
  // above — otherwise "Export All" would be clipped to whatever
  // columns happen to exist on the current page.
  // ====================================================

  const exportExcelFile = (reportData = report, fileSuffix = "") => {
    const wb = new ExcelJs.Workbook();
    const sheet = wb.addWorksheet("Break Report", {
      views: [{ state: "frozen", xSplit: 2, ySplit: 1 }],
    });

    const datesForExport = Array.from(
      new Set(
        reportData.flatMap((e) =>
          (e.break_status_data || []).map((d) => d.date),
        ),
      ),
    );

    const typesForExport = Array.from(
      new Map(
        reportData.flatMap((e) =>
          (e.break_status_data || []).flatMap((d) =>
            (d.status_log || []).map((s) => [s.id, s.name]),
          ),
        ),
      ),
    )
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.id - b.id);

    const getTypeTotalFor = (rowData, typeId) =>
      (rowData.break_status_data || []).reduce((sum, d) => {
        const entry = (d.status_log || []).find((s) => s.id === typeId);
        return sum + (entry ? entry.break_duration : 0);
      }, 0);

    const headers = ["Employee", "Email"];
    datesForExport.forEach((d) => headers.push(formatDate(d)));
    typesForExport.forEach((bt) => headers.push(bt.name));
    headers.push("Total Break");

    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };

    reportData.forEach((emp) => {
      const e = emp.employee || {};
      const row = [
        `${e.first_name || ""} ${e.last_name || ""}`.trim(),
        e.email || "",
      ];
      datesForExport.forEach((d) => {
        const day = (emp.break_status_data || []).find((x) => x.date === d);
        row.push(
          day && day.total_break_duration > 0
            ? formatDuration(day.total_break_duration)
            : "-",
        );
      });
      typesForExport.forEach((bt) => {
        const total = getTypeTotalFor(emp, bt.id);
        row.push(total > 0 ? formatDuration(total) : "-");
      });
      row.push(formatDuration(emp.overall_total_break_duration));

      const dataRow = sheet.addRow(row);
      dataRow.eachCell((cell, n) => {
        if (cell.value !== "-" && n > 2) {
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
      a.download = `Break_Report_${filterKeys.month}${fileSuffix}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  // ====================================================
  // EXPORT ALL
  //
  // GET /report/export-all-break-report/?thisMonth=2026-09&search=john
  // Fetches every employee for the selected month (honoring
  // the current search filter, not paginated), then builds
  // the same XLSX as a normal export.
  // Durations from the API are already in seconds, matching
  // what formatDuration/exportExcelFile expect.
  // ====================================================

  const handleExportAll = () => {
    setExportingAll(true);

    let url =
      "report/export-all-break-report/?thisMonth=" +
      encodeURIComponent(filterKeys.month);

    if (search) {
      url += "&search=" + encodeURIComponent(search);
    }

    Api({
      method: "GET",
      url,
    })
      .then((res) => {
        const body = res?.data;
        const list = Array.isArray(body?.data) ? body.data : [];

        if (list.length === 0) {
          window.alert(body?.message || "No break data found for this month.");
          return;
        }

        exportExcelFile(list, "_All");
      })
      .catch((error) => {
        console.error("Export all break report API error:", error);

        const apiMessage = error?.response?.data?.message;
        window.alert(apiMessage || "Failed to export the break report.");
      })
      .finally(() => {
        setExportingAll(false);
      });
  };

  // ----- columns -----
  const isDark = layoutModeType === "dark";
  const headerColor = isDark ? "#242933" : "#e6f7ff";
  const headerBgColor = isDark ? "#1a1d24" : "white";

  const dynamicColumns = breakDates.map((date, index) => {
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
        <Column width={110} align="center">
          <HeaderCell style={{ fontWeight: "bold", background: bgColor }}>
            Break
          </HeaderCell>
          <BreakCell date={date} bgColor={bgColor} />
        </Column>
      </ColumnGroup>
    );
  });

  const summaryColumns = [
    ...breakTypes.map((bt) => (
      <Column width={140} align="center" key={`bt_${bt.id}`}>
        <HeaderCell
          style={{ background: headerBgColor, fontWeight: "bold", padding: 18 }}
        >
          {bt.name}
        </HeaderCell>
        <BreakTypeCell typeId={bt.id} style={{ background: headerBgColor }} />
      </Column>
    )),
    <Column width={140} align="center" key="total-break">
      <HeaderCell
        style={{ background: headerBgColor, fontWeight: "bold", padding: 18 }}
      >
        Total Break
      </HeaderCell>
      <Cell style={{ background: headerBgColor, fontWeight: "bold" }}>
        {(rowData) => formatDuration(rowData.overall_total_break_duration)}
      </Cell>
    </Column>,
    <Column width={80} fixed="right" key="download">
      <HeaderCell style={{ fontWeight: "bold", padding: 18 }}>Down</HeaderCell>
      <DownloadCell />
    </Column>,
  ];

  // ── pagination values (computed outside JSX) ──
  const rowsOnPage = report.length;
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min((page - 1) * pageSize + rowsOnPage, totalCount);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPagesFromApi;
  const prevClass = prevDisabled ? "page-item disabled" : "page-item";
  const nextClass = nextDisabled ? "page-item disabled" : "page-item";
  const pageNumbers = getPageNumbers(page, totalPagesFromApi);

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

  // ----- export modal text (kept out of JSX) -----
  const isExportAll = exportType === "all";

  const exportMessage = isExportAll ? (
    <>
      Export <b>{monthLabel}</b> Break Report for <b>all employees</b> as a XLSX
      file?
    </>
  ) : (
    <>
      Export <b>{monthLabel}</b> Break Report (current page) as a XLSX file?
    </>
  );

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

                <Col xl={3}>
                  <div className="position-relative">
                    <Input
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

                <Col xl={3}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-info-subtle text-info fs-12 p-2">
                      Employees: <b>{totalCount}</b>
                    </span>
                  </div>
                </Col>

                <Col xl={4} className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      type="button"
                      className="btn btn-info"
                      onClick={() => openExportModal("page")}
                      style={{
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.75rem",
                        width: "80px",
                      }}
                    >
                      <i className="ri-file-download-line align-bottom me-1"></i>
                      Export
                    </Button>

                    <Button
                      type="button"
                      className="btn btn-success"
                      onClick={() => openExportModal("all")}
                      disabled={exportingAll}
                      style={{
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.75rem",
                        width: "100px",
                      }}
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
                  </div>
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
                        <p className="text-muted mx-4 mb-0">{exportMessage}</p>
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
                          if (isExportAll) {
                            handleExportAll();
                          } else {
                            exportExcelFile();
                          }
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

        {/* ── Pagination ── */}
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
                className="form-select custom-select-medium text-muted my-select"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                {pageSizeOptions}
              </select>
            </div>
          </Row>
        </Container>

        {/* status_log detail modal */}
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
              {detailData.status_log?.length > 0 ? (
                <table className="table table-sm mb-3">
                  <thead>
                    <tr>
                      <th>Break Type</th>
                      <th className="text-end">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailData.status_log.map((s, i) => (
                      <tr key={`${s.id}_${i}`}>
                        <td>{s.name}</td>
                        <td className="text-end">
                          {formatDuration(s.break_duration)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted mb-0">No breaks logged.</p>
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

export default BreakReport;
