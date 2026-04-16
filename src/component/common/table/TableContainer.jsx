import React, { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { useState } from "react";
import {
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
  useSortBy,
  useFilters,
  useExpanded,
  usePagination,
  useRowSelect,
} from "react-table";
import { Table, Row, Col, Button, Input, CardBody } from "reactstrap";
import { DefaultColumnFilter } from "./Filters";
import { Link } from "react-router-dom";
import EmployeeTableFilter from "../tableFilter/EmployeeTableFilter";
import AttendanceApprovalFilter from "../tableFilter/AttendanceApprovalFilter";
import {
  employee_component_name,
  leave_approval_component_name,
  leave_type_component_name,
  attendance_approval_component_name,
  holiday_component_name,
  attendance_pending_table,
  leave_pending_table,
} from "../../../common/constant/Constants";
import LeaveApprovalFilter from "../tableFilter/LeaveApprovalFilter";
import LeaveTypeFilter from "../tableFilter/LeaveTypeFilter";
import HolidayFilter from "../tableFilter/HolidayFilter";
import { useDispatch, useSelector } from "react-redux";
import { setTableFilterSearchText } from "../../../redux/reducers/ChildReducer/TableFilterReducer";
import "../../../common/css/lc_style.css";
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
}) => {
  const { search } = useSelector((state) => state.TableFilterReducer);

  const dispatch = useDispatch();

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
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    rows,
    state: { pageIndex, pageSize, pageCount },
  } = useTable(
    {
      columns,
      data,
      defaultColumn: { Filter: DefaultColumnFilter },
      initialState: {
        pageIndex: 0,
        pageSize: 25,
        selectedRowIds: 0,
        sortBy: [
          {
            desc: true,
          },
        ],
      },
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

  const onChangeInSelect = (event) => {
    setPageSize(Number(event.target.value));
  };
  // const onChangeInInput = (event) => {
  //   const page = event.target.value ? Number(event.target.value) - 1 : 0;
  //   gotoPage(page);
  // };
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    gotoPage(page);
  };
  const startItem = pageIndex * pageSize + 1;
  const endItem =
    (pageIndex + 1) * pageSize < data.length
      ? (pageIndex + 1) * pageSize
      : data.length;
  const totalItem =
    (pageIndex + 1) * pageSize < rows.length
      ? (pageIndex + 1) * pageSize
      : rows.length;
  return (
    <Fragment>
      {isGlobalFilter && (
        <Row className="mb-3">
          {isGlobalSearch && (
            <Col md={1}>
              <select
                className="form-select"
                value={pageSize}
                onChange={onChangeInSelect}
              >
                {[25, 50, 100].map((pageSize) => (
                  <option
                    key={pageSize}
                    value={pageSize}
                    style={{ paddingTop: 0.4 }}
                  >
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </Col>
          )}
          <CardBody className="border border-dashed border-end-0 border-start-0">
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

              {/* <Col md={2}>
                <div>
                  <button type="button" className="btn btn-primary w-100">
                    {" "}
                    <i className="ri-equalizer-fill me-1 align-bottom"></i>
                    Filters
                  </button>
                </div>
              </Col> */}
            </Row>
          </CardBody>
        </Row>
      )}

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
                    {/* <Filter column={column} /> */}
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

      {showInfo === true && (
        <Row className="align-items-center g-3 text-center text-sm-start mb-3">
          <div className="col-sm">
            <div className="text-muted">
              Showing
              <span className="fw-semibold ms-1">{startItem}</span> to{" "}
              <span className="fw-semibold">{endItem}</span> of{" "}
              <span className="fw-semibold">{rows.length}</span>
            </div>
          </div>
          <div className="col-sm-auto">
            <ul className="pagination pagination-separated pagination-md justify-content-center justify-content-sm-start mb-0">
              <li
                className={
                  !canPreviousPage ? "page-item disabled" : "page-item"
                }
              >
                <Link
                  to="javscript:;"
                  className="page-link"
                  onClick={previousPage}
                >
                  Previous
                </Link>
              </li>
              {pageOptions.map((item, key) => (
                <React.Fragment key={key}>
                  <li className="page-item">
                    <Link
                      to="javscript:;"
                      className={
                        pageIndex === item ? "page-link active" : "page-link"
                      }
                      onClick={() => gotoPage(item)}
                    >
                      {item + 1}
                    </Link>
                  </li>
                </React.Fragment>
              ))}
              <li className={!canNextPage ? "page-item disabled" : "page-item"}>
                <Link to="javscript:;" className="page-link" onClick={nextPage}>
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
};

export default TableContainer;
