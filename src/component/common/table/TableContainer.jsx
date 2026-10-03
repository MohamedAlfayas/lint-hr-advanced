import React, { Fragment, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import {
  useTable,
  useGlobalFilter,
  useSortBy,
  useFilters,
  useExpanded,
  usePagination,
  useRowSelect,
} from "react-table";
import { Table, Row, Col, CardBody } from "reactstrap";
import { DefaultColumnFilter } from "./Filters";
import { Link } from "react-router-dom";
import EmployeeTableFilter from "../tableFilter/EmployeeTableFilter";
import TaskListFilter from "../tableFilter/TaskListFilter";
import {
  employee_component_name,
  leave_approval_component_name,
  leave_type_component_name,
  attendance_approval_component_name,
  holiday_component_name,
  attendance_pending_table,
  leave_pending_table,
  task_list_component_name,
  status_component_name,
} from "../../../common/constant/Constants";
import LeaveTypeFilter from "../tableFilter/LeaveTypeFilter";
import HolidayFilter from "../tableFilter/HolidayFilter";
import { useDispatch, useSelector } from "react-redux";
import { setTableFilterSearchText } from "../../../redux/reducers/ChildReducer/TableFilterReducer";
import "../../../common/css/lc_style.css";

const DEFAULT_PAGE_SIZE = 25;

const TableContainer = ({
  columns,
  data,
  formname,
  isGlobalSearch,
  isGlobalFilter,
  tableClass,
  theadClass,
  trClass,
  thClass,
  tdClass,
  divClass,
  SearchPlaceholder,
  showInfo,
  // { page (1-based), pageSize, totalCount, onChange(page, pageSize) }
  serverPagination,
}) => {
  const { search } = useSelector((state) => state.TableFilterReducer);
  const dispatch = useDispatch();

  const isServer = !!serverPagination;
  const serverPage = serverPagination?.page ?? 1;
  const serverPageSize = serverPagination?.pageSize ?? DEFAULT_PAGE_SIZE;
  const serverTotal = serverPagination?.totalCount ?? 0;

  // controlled pageIndex / pageSize when server-side
  const useControlledState = useCallback(
    (tableState) =>
      isServer
        ? {
            ...tableState,
            pageIndex: serverPage - 1,
            pageSize: serverPageSize,
          }
        : tableState,
    [isServer, serverPage, serverPageSize],
  );

  // Status & Task tables keep the order they receive (Task list is already
  // sorted newest-first in Tasks.jsx). Other tables keep the old default.
  const keepIncomingOrder =
    formname === status_component_name || formname === task_list_component_name;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    rows,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn: { Filter: DefaultColumnFilter },
      initialState: {
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE,
        selectedRowIds: 0,
        sortBy: keepIncomingOrder ? [] : [{ desc: true }],
      },
      ...(isServer && {
        manualPagination: true,
        autoResetPage: false,
        pageCount: Math.max(1, Math.ceil(serverTotal / serverPageSize)),
        useControlledState,
      }),
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect,
  );

  useEffect(() => {
    // Clear search when switching component/form
    dispatch(setTableFilterSearchText(""));
  }, [formname, dispatch]);

  const generateSortingIndicator = (column) => {
    return column.isSorted ? (
      column.isSortedDesc ? (
        <span>&#8593;</span>
      ) : (
        <span>&#8595;</span>
      )
    ) : (
      ""
    );
  };

  // ── pagination actions (server or client) ────
  const totalPages = isServer
    ? Math.max(1, Math.ceil(serverTotal / serverPageSize))
    : pageOptions.length;

  const handleGoToPage = (index) => {
    if (isServer) {
      if (index < 0 || index >= totalPages) return;
      serverPagination.onChange(index + 1, serverPageSize);
    } else {
      gotoPage(index);
    }
  };

  const handlePrevious = (e) => {
    e?.preventDefault?.();
    if (isServer) {
      if (serverPage > 1) handleGoToPage(pageIndex - 1);
    } else {
      previousPage();
    }
  };

  const handleNext = (e) => {
    e?.preventDefault?.();
    if (isServer) {
      if (serverPage < totalPages) handleGoToPage(pageIndex + 1);
    } else {
      nextPage();
    }
  };

  const handlePageSizeChange = (e) => {
    const size = Number(e.target.value);
    if (isServer) {
      // reset to first page on size change
      serverPagination.onChange(1, size);
    } else {
      setPageSize(size);
    }
  };

  const hasPrev = isServer ? serverPage > 1 : canPreviousPage;
  const hasNext = isServer ? serverPage < totalPages : canNextPage;

  const totalItems = isServer ? serverTotal : rows.length;
  const startItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem = isServer
    ? Math.min(pageIndex * pageSize + page.length, serverTotal)
    : Math.min((pageIndex + 1) * pageSize, data.length);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);

  // empty state lives inside the table area so the filter row stays visible
  const hasRows = page.length > 0;

  return (
    <Fragment>
      {isGlobalFilter && (
        <Row className="mb-3">
          {isGlobalSearch && (
            <Col md={1}>
              <select
                className="form-select"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                {[25, 50, 100].map((size) => (
                  <option key={size} value={size} style={{ paddingTop: 0.4 }}>
                    Show {size}
                  </option>
                ))}
              </select>
            </Col>
          )}
          <CardBody className="border border-dashed border-end-0 border-start-0 py-1">
            <Row>
              {formname === attendance_pending_table ? null : formname ===
                attendance_approval_component_name ? null : formname ===
                leave_approval_component_name ? null : formname ===
                leave_pending_table ? null : (
                <Col md={4}>
                  <div className="search-box me-2 mb-2 d-inline-block col-12">
                    <input
                      id="search-bar-0"
                      type="text"
                      className="form-control search"
                      placeholder={`Search ${(formname || "Table").split("_").join(" ")}`}
                      value={search || ""}
                      onChange={(e) =>
                        dispatch(setTableFilterSearchText(e.target.value))
                      }
                    />
                    <i className="bx bx-search-alt search-icon"></i>
                  </div>
                </Col>
              )}

              {formname === employee_component_name && <EmployeeTableFilter />}
              {formname === leave_type_component_name && <LeaveTypeFilter />}
              {formname === holiday_component_name && <HolidayFilter />}
              {formname === task_list_component_name && <TaskListFilter />}
            </Row>
          </CardBody>
        </Row>
      )}

      {hasRows ? (
        <div className={`${divClass} custom-table-container table-wrapper`}>
          <Table
            hover
            {...getTableProps()}
            className={`${tableClass} ${window.location.pathname === "/approval" ? "custom-table" : ""}`}
          >
            <thead className={`${theadClass} custom-table-header`}>
              {headerGroups.map((headerGroup) => (
                <tr
                  className={`${trClass} custom-table-row`}
                  key={headerGroup.id}
                  {...headerGroup.getHeaderGroupProps()}
                >
                  {headerGroup.headers.map((column) => (
                    <th
                      key={column.id}
                      className={`${thClass} custom-table-header-cell`}
                      {...column.getSortByToggleProps()}
                    >
                      {column.render("Header")}
                      {generateSortingIndicator(column)}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody {...getTableBodyProps()} className="custom-table-body">
              {page.map((row) => {
                prepareRow(row);
                return (
                  <Fragment key={row.getRowProps().key}>
                    <tr className="custom-table-row">
                      {row.cells.map((cell) => (
                        <td
                          className={`${tdClass} custom-table-cell`}
                          key={cell.id}
                          {...cell.getCellProps()}
                        >
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "25vh",
          }}
        >
          <lord-icon
            src="https://cdn.lordicon.com/msoeawqm.json"
            trigger="loop"
            colors="primary:#405189,secondary:#0ab39c"
            style={{
              marginTop: "20px",
              width: "150px",
              height: "80px",
              marginBottom: "20px",
            }}
          ></lord-icon>
          <p
            style={{
              width: "300px",
              color: "#405189",
              fontSize: "20px",
              textAlign: "center",
            }}
          >
            Sorry! No Result Found
          </p>
        </div>
      )}

      {showInfo === true && (hasRows || (isServer && serverTotal > 0)) && (
        <Row className="align-items-center g-3 text-center text-sm-start mt-3 mb-0">
          <div className="col-sm">
            <div className="text-muted">
              Showing
              <span className="fw-semibold ms-1">{startItem}</span> to{" "}
              <span className="fw-semibold">{endItem}</span> of{" "}
              <span className="fw-semibold">{totalItems}</span>
            </div>
          </div>
          <div className="col-sm-auto">
            <ul className="pagination pagination-separated pagination-md justify-content-center justify-content-sm-start mb-0">
              <li className={!hasPrev ? "page-item disabled" : "page-item"}>
                <Link to="#" className="page-link" onClick={handlePrevious}>
                  Previous
                </Link>
              </li>
              {pageNumbers.map((item) => (
                <li className="page-item" key={item}>
                  <Link
                    to="#"
                    className={
                      pageIndex === item ? "page-link active" : "page-link"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      handleGoToPage(item);
                    }}
                  >
                    {item + 1}
                  </Link>
                </li>
              ))}
              <li className={!hasNext ? "page-item disabled" : "page-item"}>
                <Link to="#" className="page-link" onClick={handleNext}>
                  Next
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-sm-auto">
            <select
              className="form-select custom-select-medium text-muted my-select"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              {[25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        </Row>
      )}
    </Fragment>
  );
};

TableContainer.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
  serverPagination: PropTypes.shape({
    page: PropTypes.number,
    pageSize: PropTypes.number,
    totalCount: PropTypes.number,
    onChange: PropTypes.func,
  }),
};

export default TableContainer;
