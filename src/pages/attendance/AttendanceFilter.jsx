import React, { useEffect, useRef, useState } from "react";
import { Api } from "../../common/api/Api";
import {
  MonthFormat,
  hr_status_options,
  attendance_type_options,
} from "../../common/constant/Constants";
import {
  VIEW_TEAM_ATTENDANCE_ACCESS_KEY,
  VIEW_HIERARCHY_ATTENDANCE_ACCESS_KEY,
} from "../../common/constant/RoleConstants";
import { DatePicker } from "antd";
import Select from "../../shared/ui/TestableSelect";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { useDispatch, useSelector } from "react-redux";
import {
  setAttendanceLoading,
  setAttendanceMonth,
  setAttendancePagination,
  setAttendanceSummary,
  setIndividualAttendanceReportData,
  setShowTeamTable,
  setTeamAttendanceReportData,
} from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { PostApi } from "../../common/api/PostApi";
import { toast } from "react-toastify";
import { EmployeeDisplayInSelect } from "../../common/js/EmployeeDisplayInSelect";
import { setEmployeeLeaveType } from "../../redux/reducers/ChildReducer/EmployeeLeaveReducer";
import {
  hasPageCache,
  writePageCache,
} from "../../common/js/pageLoadCache";
import { BuildAttendanceReportChart } from "../../common/js/BuildAttendanceReportChart";
import { testId, itemTestKey } from "../../shared/testing/testId";

dayjs.extend(customParseFormat);

const AttendanceFilter = () => {
  const dispatch = useDispatch();

  // page / page_size live in Redux so the table's pager can control them
  const { attendance_pagination, attendanceRefreshTick } = useSelector(
    (state) => state.AttendanceReportReducer,
  );
  const page = attendance_pagination?.page ?? 1;
  const page_size = attendance_pagination?.page_size ?? 20;

  const [filterKeys, setFilterKeys] = useState({
    thisMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
    hr_status: "0",
    record: "0",
    type: "1",
    employee: "0",
  });

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [showEmployeeSelect, setShowEmployeeSelect] = useState(false);
  const [attendanceViewFilter, setAttendanceViewFilter] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const requestIdRef = useRef(0);
  const prevFilterKeysRef = useRef(filterKeys);

  const employee_data = GetLocalStorageData("employee");
  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data")) || {};

  useEffect(() => {
    dispatch(setAttendanceMonth(filterKeys.thisMonth));
  }, [dispatch, filterKeys.thisMonth]);

  // 🔹 Permission-based filter
  useEffect(() => {
    const permissions = profile_data?.permission_list || [];

    let allowedIds = ["1"];
    if (permissions.includes(VIEW_HIERARCHY_ATTENDANCE_ACCESS_KEY)) {
      allowedIds = ["1", "2", "3"];
    } else if (permissions.includes(VIEW_TEAM_ATTENDANCE_ACCESS_KEY)) {
      allowedIds = ["1", "2"];
    }

    setAttendanceViewFilter(
      attendance_type_options.filter((d) => allowedIds.includes(d.id)),
    );
  }, []);

  // 🔹 Load employees
  useEffect(() => {
    Api({
      type: "GET",
      url: "employee/get-my-team-members/",
    })
      .then((res) => {
        const response = res?.data?.data || [];

        const emp_options = response
          .map((d) => employee_data.find((e) => e.id === d))
          .filter(Boolean);

        setEmployeeOptions([
          { id: "0", label: "All", value: "0" },
          ...emp_options,
        ]);
      })
      .catch(() => {
        console.log("Something Went Wrong !!");
      });
  }, []);

  // 🔹 Handlers – any filter change resets to page 1
  const resetPage = () => dispatch(setAttendancePagination({ page: 1 }));

  const handleDateRangeChange = (e, monthStr) => {
    setFilterKeys((prev) => ({ ...prev, thisMonth: monthStr }));
    resetPage();
  };

  const handleHRStatusChange = (e) => {
    setFilterKeys((prev) => ({ ...prev, hr_status: e.value }));
    resetPage();
  };

  const handleTypeChange = (e) => {
    setFilterKeys((prev) => ({ ...prev, type: e.value, employee: "0" }));
    setShowEmployeeSelect(e.value === "2");
    resetPage();
  };

  const handleEmployeeChange = (e) => {
    setFilterKeys((prev) => ({ ...prev, employee: e.value }));
    resetPage();
  };

  // 🔹 API Call
  const handleFilter = async (keys, currentPage, currentPageSize) => {
    const requestId = ++requestIdRef.current;
    const requestKey = `attendance-report:${keys.thisMonth}:${keys.hr_status}:${keys.type}:${keys.employee}:${currentPage}:${currentPageSize}`;
    if (!hasPageCache(requestKey)) {
      dispatch(setAttendanceLoading(true));
    }

    try {
      const attendanceApi = await PostApi(
        "report/get-attendance-report/v3/",
        { ...keys, page: currentPage, page_size: currentPageSize },
        false,
      );

      // A newer request has started – ignore this response
      if (requestId !== requestIdRef.current) return;

      if (attendanceApi?.status === 200) {
        const body = attendanceApi?.data;
        const data = body?.data;
        const total_pages = body?.total_pages ?? 0;

        // Only count / total_pages are written back (page & page_size are
        // controlled by the UI) so this can never trigger a refetch loop.
        dispatch(
          setAttendancePagination({
            count: body?.count ?? 0,
            total_pages,
          }),
        );

        // Current page became empty -> step back
        if (
          (data?.team_attendance_report || []).length === 0 &&
          (data?.individual_attendance_report || []).length === 0 &&
          currentPage > 1
        ) {
          dispatch(
            setAttendancePagination({
              page: Math.max(1, Math.min(currentPage - 1, total_pages || 1)),
            }),
          );
          return;
        }

        dispatch(
          setIndividualAttendanceReportData(data?.individual_attendance_report),
        );
        dispatch(setAttendanceSummary(data?.summary));
        dispatch(setTeamAttendanceReportData(data?.team_attendance_report));
        dispatch(
          setShowTeamTable(
            (keys.type === "2" && keys.employee === "0") || keys.type === "3",
          ),
        );
        writePageCache(requestKey);
        dispatch(setAttendanceLoading(false));
        setTimeout(
          () =>
            BuildAttendanceReportChart(
              data?.individual_attendance_report,
              dispatch,
            ),
          0,
        );

        // Leave API
        if (keys.type === "1") {
          Api({
            type: "GET",
            url: `leave/get-leave-type-details-for-employee/?employee_id=${profile_data?.id}`,
          }).then((res) => {
            dispatch(setEmployeeLeaveType(res?.data?.data));
          });
        }

        if (keys.type === "2" && keys.employee !== "0") {
          Api({
            type: "GET",
            url: `leave/get-leave-type-details-for-employee/?employee_id=${keys.employee}`,
          }).then((res) => {
            dispatch(setEmployeeLeaveType(res?.data?.data));
          });
        }
      } else {
        toast.error(
          attendanceApi?.data?.message ||
            attendanceApi?.data?.detail ||
            "Failed to load attendance report",
        );
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        toast.error("Failed to load attendance report");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        dispatch(setAttendanceLoading(false));
      }
    }
  };

  // 🔹 Auto filter: debounce filter changes, fetch immediately on page / page size
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      prevFilterKeysRef.current = filterKeys;
      return;
    }

    const onlyPagingChanged = prevFilterKeysRef.current === filterKeys;
    prevFilterKeysRef.current = filterKeys;

    const delay = setTimeout(
      () => handleFilter(filterKeys, page, page_size),
      onlyPagingChanged ? 0 : 500,
    );

    return () => clearTimeout(delay);
  }, [filterKeys, page, page_size]);

  const lastRefreshTickRef = useRef(attendanceRefreshTick);
  useEffect(() => {
    if (attendanceRefreshTick === lastRefreshTickRef.current) return;
    lastRefreshTickRef.current = attendanceRefreshTick;
    handleFilter(filterKeys, page, page_size);
  }, [attendanceRefreshTick]);

  const currentMonth = dayjs().format(MonthFormat);
  const monthValue = dayjs(filterKeys.thisMonth, MonthFormat);
  const isCurrentMonth = filterKeys.thisMonth === currentMonth;
  const isFiltered =
    !isCurrentMonth || filterKeys.hr_status !== "0" || filterKeys.employee !== "0";

  const setMonth = (d) => {
    if (!d) return;
    if (d.isAfter(dayjs(), "month")) return;
    handleDateRangeChange(null, d.format(MonthFormat));
  };

  const handleReset = () => {
    setFilterKeys((prev) => ({
      ...prev,
      thisMonth: currentMonth,
      hr_status: "0",
      employee: "0",
    }));
    resetPage();
  };

  const statusTone = (opt) => opt?.class || "secondary";
  const viewIcons = { "1": "ri-user-3-line", "2": "ri-team-line", "3": "ri-organization-chart" };

  const selectProps = {
    classNamePrefix: "af-rs",
    menuPortalTarget: document.body,
    menuPosition: "fixed",
    styles: { menuPortal: (base) => ({ ...base, zIndex: 1600 }) },
    isSearchable: false,
  };

  return (
    <div className="af-bar">
      <div className="af-group">
        <span className="af-label">Month</span>
        <div className="af-month">
          <button
            data-testid="attendance-filter-previous-month-button"
            type="button"
            className="af-month-btn"
            aria-label="Previous month"
            onClick={() => setMonth(monthValue.subtract(1, "month"))}
          >
            <i className="ri-arrow-left-s-line" />
          </button>
          <div className="af-month-picker">
            <i className="ri-calendar-2-line" />
            <DatePicker
              value={monthValue}
              format="MMM YYYY"
              picker="month"
              allowClear={false}
              bordered={false}
              suffixIcon={null}
              inputReadOnly
              disabledDate={(d) => d && d.isAfter(dayjs(), "month")}
              onChange={setMonth}
            />
          </div>
          <button
            data-testid="attendance-filter-next-month-button"
            type="button"
            className="af-month-btn"
            aria-label="Next month"
            disabled={isCurrentMonth || monthValue.isAfter(dayjs(), "month")}
            onClick={() => setMonth(monthValue.add(1, "month"))}
          >
            <i className="ri-arrow-right-s-line" />
          </button>
        </div>
      </div>

      <div className="af-group af-grow">
        <span className="af-label">Status</span>
        <Select
          testId="attendance-filter-select-status"
          {...selectProps}
          className="af-select"
          options={hr_status_options}
          placeholder="Select Status"
          value={hr_status_options.find((d) => d.id === filterKeys.hr_status)}
          onChange={handleHRStatusChange}
          formatOptionLabel={(opt) => (
            <span className="af-opt">
              <span className={`af-dot bg-${statusTone(opt)}`} />
              {opt.label}
            </span>
          )}
        />
      </div>

      {attendanceViewFilter.length > 1 && (
        <div className="af-group">
          <span className="af-label">View</span>
          <div className="af-seg" role="tablist">
            {attendanceViewFilter.map((opt) => (
              <button
                data-testid={testId("attendance-filter-user", itemTestKey(opt), "button")}
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={filterKeys.type === opt.id}
                className={`af-seg-btn${filterKeys.type === opt.id ? " is-active" : ""}`}
                onClick={() => filterKeys.type !== opt.id && handleTypeChange(opt)}
              >
                <i className={viewIcons[opt.id] || "ri-user-3-line"} />
                <span>{opt.label.replace(" Attendance", "")}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showEmployeeSelect && (
        <div className="af-group af-grow af-employee">
          <span className="af-label">Employee</span>
          <Select
            testId="attendance-filter-search-employee"
            {...selectProps}
            isSearchable
            className="af-select"
            options={employeeOptions}
            components={{ Option: EmployeeDisplayInSelect }}
            placeholder="Search employee…"
            value={employeeOptions.find((d) => d.id === filterKeys.employee)}
            onChange={handleEmployeeChange}
          />
        </div>
      )}

      {isFiltered && (
        <button data-testid="attendance-filter-reset-button" type="button" className="af-reset" onClick={handleReset}>
          <i className="ri-restart-line" />
          Reset
        </button>
      )}

      <style>{`
        .af-bar{display:flex;align-items:flex-end;flex-wrap:wrap;gap:12px 14px;padding:14px 16px;margin-bottom:1.25rem;border-radius:14px;
          background:var(--vz-secondary-bg);border:1px solid var(--vz-border-color);box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 22px -16px rgba(0,0,0,.25)}
        .af-group{display:flex;flex-direction:column;gap:5px;min-width:0}
        .af-grow{flex:1 1 200px;min-width:min(100%,180px);max-width:100%}
        .af-employee{flex:1 1 240px;min-width:min(100%,200px)}
        .af-label{font-size:.66rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--vz-secondary-color);padding-left:2px}

        .af-month{display:flex;align-items:center;height:38px;border-radius:10px;border:1px solid var(--vz-border-color);background:var(--vz-secondary-bg);overflow:hidden;transition:border-color .15s,box-shadow .15s;min-width:0;max-width:100%}
        .af-month:hover{border-color:rgba(var(--vz-primary-rgb),.45)}
        .af-month:focus-within{border-color:var(--vz-primary);box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb),.15)}
        .af-month-btn{width:34px;flex:0 0 34px;height:100%;display:grid;place-items:center;border:0;background:transparent;color:var(--vz-secondary-color);font-size:18px;transition:all .15s}
        .af-month-btn:hover:not(:disabled){color:var(--vz-primary);background:rgba(var(--vz-primary-rgb),.08)}
        .af-month-btn:disabled{opacity:.35;cursor:not-allowed}
        .af-month-picker{display:flex;align-items:center;gap:4px;height:100%;padding:0 8px 0 10px;border-left:1px solid var(--vz-border-color);border-right:1px solid var(--vz-border-color);min-width:0;flex:1 1 auto}
        .af-month-picker > i{color:var(--vz-primary);font-size:15px;flex-shrink:0}
        .af-month-picker .ant-picker{width:auto;min-width:108px;flex:1 1 auto;padding:0 4px;cursor:pointer}
        .af-month-picker .ant-picker-input{min-width:0}
        .af-month-picker .ant-picker input{font-size:.85rem;font-weight:600;color:var(--vz-heading-color) !important;cursor:pointer;min-width:0}

        .af-select{width:100%;min-width:0}
        .af-select .af-rs__control{min-height:38px;border-radius:10px;border-color:var(--vz-border-color);background:var(--vz-secondary-bg);box-shadow:none;cursor:pointer;transition:border-color .15s,box-shadow .15s}
        .af-select .af-rs__control:hover{border-color:rgba(var(--vz-primary-rgb),.45)}
        .af-select .af-rs__control--is-focused{border-color:var(--vz-primary) !important;box-shadow:0 0 0 3px rgba(var(--vz-primary-rgb),.15)}
        .af-select .af-rs__value-container{overflow:visible;min-width:0}
        .af-select .af-rs__single-value,.af-select .af-rs__input-container{font-size:.85rem;font-weight:500;color:var(--vz-heading-color);max-width:100%;overflow:visible;text-overflow:clip}
        .af-select .af-rs__placeholder{font-size:.85rem;color:var(--vz-secondary-color)}
        .af-select .af-rs__indicator-separator{display:none}
        .af-select .af-rs__indicator{color:var(--vz-secondary-color);padding:0 10px;flex-shrink:0;transition:transform .2s}
        .af-select .af-rs__control--menu-is-open .af-rs__dropdown-indicator{transform:rotate(180deg);color:var(--vz-primary)}
        .af-rs__menu{border-radius:12px !important;overflow:hidden;border:1px solid var(--vz-border-color);background:var(--vz-secondary-bg) !important;box-shadow:0 16px 40px -12px rgba(0,0,0,.3) !important;margin-top:6px !important}
        .af-rs__menu-list{padding:6px !important}
        .af-rs__option{border-radius:8px;font-size:.84rem;cursor:pointer !important;color:var(--vz-heading-color) !important}
        .af-rs__option--is-focused{background:rgba(var(--vz-primary-rgb),.08) !important}
        .af-rs__option--is-selected{background:rgba(var(--vz-primary-rgb),.14) !important;color:var(--vz-primary) !important;font-weight:600}
        .af-opt{display:inline-flex;align-items:center;gap:8px}
        .af-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}

        .af-seg{display:inline-flex;align-items:center;gap:2px;height:38px;padding:3px;border-radius:10px;background:var(--vz-tertiary-bg);border:1px solid var(--vz-border-color);max-width:100%;overflow:auto}
        .af-seg-btn{display:inline-flex;align-items:center;gap:6px;height:100%;padding:0 12px;border:0;border-radius:8px;background:transparent;
          font-size:.82rem;font-weight:500;color:var(--vz-secondary-color);white-space:nowrap;transition:all .15s}
        .af-seg-btn i{font-size:15px;line-height:1}
        .af-seg-btn:hover:not(.is-active){color:var(--vz-heading-color)}
        .af-seg-btn.is-active{color:#fff;background:var(--vz-primary);box-shadow:0 4px 10px -4px rgba(var(--vz-primary-rgb),.7)}

        .af-reset{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 14px;margin-left:auto;border-radius:10px;font-size:.82rem;font-weight:500;
          border:1px dashed rgba(var(--vz-danger-rgb),.45);background:rgba(var(--vz-danger-rgb),.06);color:var(--vz-danger);transition:all .15s}
        .af-reset:hover{background:rgba(var(--vz-danger-rgb),.12);border-style:solid}
        .af-reset i{font-size:15px;line-height:1}
        @media (max-width:767.98px){
          .af-bar{padding:12px}
          .af-grow,.af-employee{flex:1 1 100%;min-width:100%}
          .af-reset{margin-left:0;width:100%;justify-content:center}
        }
        @media (max-width:575.98px){.af-seg-btn span{display:none}.af-seg-btn{padding:0 10px}}
      `}</style>
    </div>
  );
};

export default AttendanceFilter;
