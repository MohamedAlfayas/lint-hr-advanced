import React, { useRef, useState } from "react";
import Select from "../../../shared/ui/TestableSelect";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "antd";
import { MonthFormat } from "../../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { setLeaveApproval } from "../../../redux/reducers/ChildReducer/LeaveApprovalReducer";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { Api } from "../../../common/api/Api";
import { setAttendanceApprovalData } from "../../../redux/reducers/ChildReducer/AttendanceApprovalReducer";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import AttendanceApproval from "../../../pages/attendanceApproval/AttendanceApproval";
dayjs.extend(customParseFormat);

const DEFAULT_PAGE_SIZE = 10;

const LeaveApprovalFilter = ({ formname, onPaginationChange }) => {
  const inputRef = useRef();

  const dispatch = useDispatch();

  const [employeeType, setEmployeeType] = useState(1);
  const [filteredMonth, setFilteredMonth] = useState(
    `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
  );

  // ── Pagination state ────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);

  const employeeTypeOptions = [
    { id: "0", label: "All Employee", value: "0" },
    { id: "1", label: "My Team Members", value: "1" },
  ];

  const handleEmployeeTypeChange = (e, name) => {
    setEmployeeType(e.value);
  };

  const handleDateRangeChange = (e, monthStr) => {
    setFilteredMonth(monthStr);
  };

  // ── Shared fetch, parameterised by page/page_size ────────────
  // GET /leave/get-leave-application-for-approval/?thisMonth=2026-09&employee_type=1&page=1&page_size=25
  // GET /attendance/get-attendance-data-for-approval/?thisMonth=2026-09&employee_type=1&page=1&page_size=25
  const fetchFilteredData = async (targetPage, targetPageSize) => {
    dispatch(setLoaderVisible(true));

    if (formname === "leave_approval_component_name") {
      try {
        const res = await Api({
          type: "GET",
          url:
            "leave/get-leave-application-for-approval/?thisMonth=" +
            filteredMonth +
            "&employee_type=" +
            employeeType +
            "&page=" +
            targetPage +
            "&page_size=" +
            targetPageSize,
        });

        const body = res?.data;
        const payload = body?.data;

        let list = [];
        let total = 0;

        if (Array.isArray(payload)) {
          list = payload;
          total = body?.count ?? body?.total ?? payload.length;
        } else if (Array.isArray(payload?.results)) {
          list = payload.results;
          total = payload.count ?? payload.total ?? list.length;
        } else if (Array.isArray(body?.results)) {
          list = body.results;
          total = body.count ?? list.length;
        }

        dispatch(setLeaveApproval(list));
        setTotalCount(total);
        onPaginationChange?.({
          page: targetPage,
          pageSize: targetPageSize,
          totalCount: total,
        });
      } catch (err) {
        console.log("ERR = ", err);
        dispatch(setLeaveApproval([]));
      } finally {
        dispatch(setLoaderVisible(false));
      }
    } else if (formname === "attendance_approval_component_name") {
      try {
        const res = await Api({
          type: "GET",
          url:
            "attendance/get-attendance-data-for-approval/?thisMonth=" +
            filteredMonth +
            "&employee_type=" +
            employeeType +
            "&page=" +
            targetPage +
            "&page_size=" +
            targetPageSize,
        });

        const body = res?.data;
        const payload = body?.data;

        let list = [];
        let total = 0;

        if (Array.isArray(payload)) {
          list = payload;
          total = body?.count ?? body?.total ?? payload.length;
        } else if (Array.isArray(payload?.results)) {
          list = payload.results;
          total = payload.count ?? payload.total ?? list.length;
        } else if (Array.isArray(body?.results)) {
          list = body.results;
          total = body.count ?? list.length;
        }

        dispatch(setAttendanceApprovalData(list));
        setTotalCount(total);
        onPaginationChange?.({
          page: targetPage,
          pageSize: targetPageSize,
          totalCount: total,
        });
      } catch (err) {
        console.log("ERR = ", err);
        dispatch(setAttendanceApprovalData([]));
      } finally {
        dispatch(setLoaderVisible(false));
      }
    } else {
      dispatch(setLoaderVisible(false));
      toast.error("Sometyhing Went Wrong!");
    }
  };

  // Applying a new filter always resets back to page 1
  const handleFilter = () => {
    setPage(1);
    fetchFilteredData(1, pageSize);
  };

  return (
    <React.Fragment>
      <div className="tf-card">
        <div className="tf-fields">
          <div className="tf-field">
            <label className="tf-label" htmlFor="employee_filter">
              <i className="ri-group-line"></i> Employee Type
            </label>
            <Select
              inputId="employee_filter"
              name="employee_filter"
              isClearable={false}
              isMulti={false}
              options={employeeTypeOptions || []}
              className="basic-multi-select"
              placeholder="Select Employee Type"
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              onChange={handleEmployeeTypeChange}
              value={
                employeeTypeOptions.find((d) => d.id === employeeType) ||
                employeeTypeOptions[1]
              }
            />
          </div>

          <div className="tf-field">
            <span className="tf-label">
              <i className="ri-calendar-2-line"></i> Month
            </span>
            <DatePicker
              value={dayjs(filteredMonth)}
              format={MonthFormat}
              picker="month"
              allowClear={false}
              placeholder="Select Month"
              suffixIcon={<i className="ri-arrow-down-s-line"></i>}
              style={{ width: "100%" }}
              onChange={handleDateRangeChange}
            />
          </div>

          <button type="button" onClick={handleFilter} className="tf-apply">
            <i className="ri-equalizer-line"></i> Apply Filter
          </button>
        </div>

        <nav className="tf-switch" aria-label="Approval type">
          <Link
            to="/attendanceapproval"
            className="tf-switch-btn"
          >
            <i className="ri-time-line"></i> Attendance Approval
          </Link>
          <Link to="/leave-approval" className="tf-switch-btn active">
            <i className="ri-calendar-check-line"></i> Leave Approval
          </Link>
        </nav>
      </div>
    </React.Fragment>
  );
};

export default LeaveApprovalFilter;
