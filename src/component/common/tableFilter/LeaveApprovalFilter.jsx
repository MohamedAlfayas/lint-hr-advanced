import React, { useRef, useState } from "react";
import { Card, CardHeader, Col, Label, Row } from "reactstrap";
import Select from "react-select";
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

const DEFAULT_PAGE_SIZE = 25;

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
      <Card>
        <CardHeader className="border-0 rounded">
          <Row className="g-2">
            <Col md={3}>
              <Select
                id="employee_filter"
                name="employee_filter"
                isClearable={false}
                isMulti={false}
                options={employeeTypeOptions || []}
                className="basic-multi-select"
                placeholder="Select Employee Type"
                allowClear={false}
                onChange={handleEmployeeTypeChange}
                value={
                  employeeTypeOptions.find((d) => d.id === employeeType) ||
                  employeeTypeOptions[1]
                }
              />
            </Col>
            <Col md={3}>
              <div className="form-icon right">
                <DatePicker
                  value={dayjs(filteredMonth)}
                  format={MonthFormat}
                  picker="month"
                  allowClear={false}
                  className="form-control"
                  placeholder="Select Month"
                  onChange={handleDateRangeChange}
                />
              </div>
            </Col>

            <div className="col-lg-auto">
              <div className="hstack gap-2">
                <button
                  type="button"
                  onClick={handleFilter}
                  className="btn btn-danger"
                >
                  <i className="ri-equalizer-fill me-1 align-bottom"></i> Filter
                </button>
              </div>
            </div>
            <div className="col-lg-auto">
              <div className="hstack gap-2">
                <Link to="/attendanceapproval" className="btn btn-info">
                  <i className="ri-grid-fill"></i> Attendance Approval
                </Link>
              </div>
            </div>
            <div className="col-lg-auto">
              <div className="hstack gap-2">
                <Link to="/leave-approval" className="btn btn-info">
                  <i className="ri-grid-fill"></i> Leave Approval
                </Link>
              </div>
            </div>
          </Row>
        </CardHeader>
      </Card>
    </React.Fragment>
  );
};

export default LeaveApprovalFilter;
