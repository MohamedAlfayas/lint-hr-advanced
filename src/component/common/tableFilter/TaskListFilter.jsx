import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Col, Row, Input, Label, Button } from "reactstrap";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { useDispatch, useSelector } from "react-redux";
import {
  setTaskListFilterKeys,
  setTaskDateRange,
} from "../../../redux/reducers/ChildReducer/TableFilterReducer";
import { Api } from "../../../common/api/Api";
import { useState } from "react";

// ── Date helpers (local time, no UTC shift) ──────────────────────────────────
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

const formatDisplay = (ymd) => {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
};

const getPresets = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysAgo = (n) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);

  return [
    { label: "Today", range: [toYMD(today), toYMD(today)] },
    { label: "Last 7 days", range: [toYMD(daysAgo(6)), toYMD(today)] },
    { label: "Last 30 days", range: [toYMD(daysAgo(29)), toYMD(today)] },
    {
      label: "This month",
      range: [
        toYMD(new Date(today.getFullYear(), today.getMonth(), 1)),
        toYMD(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
      ],
    },
    {
      label: "Last month",
      range: [
        toYMD(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
        toYMD(new Date(today.getFullYear(), today.getMonth(), 0)),
      ],
    },
  ];
};

// ── Date range filter (reactstrap) ───────────────────────────────────────────
const DateRangeFilter = ({ startDate, endDate, onApply }) => {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const wrapperRef = useRef(null);

  // sync draft with applied values whenever the panel opens
  useEffect(() => {
    if (open) {
      setFrom(startDate || "");
      setTo(endDate || "");
    }
  }, [open, startDate, endDate]);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return undefined;
    const onMouseDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const hasValue = !!(startDate || endDate);

  let label = "";
  if (startDate && endDate) {
    label = `${formatDisplay(startDate)} – ${formatDisplay(endDate)}`;
  } else if (startDate) {
    label = `From ${formatDisplay(startDate)}`;
  } else if (endDate) {
    label = `Until ${formatDisplay(endDate)}`;
  }

  const apply = () => {
    let s = from || null;
    let e = to || null;
    if (s && e && s > e) [s, e] = [e, s];
    onApply(s, e);
    setOpen(false);
  };

  const clear = () => {
    setFrom("");
    setTo("");
    onApply(null, null);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      {/* Trigger */}
      <div
        role="button"
        tabIndex={0}
        className="form-control d-flex align-items-center justify-content-between"
        style={{ cursor: "pointer", height: 38, userSelect: "none" }}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
      >
        <span
          className={hasValue ? "" : "text-muted"}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <i className="ri-calendar-line me-2 text-muted" />
          {hasValue ? label : "Start Date – End Date"}
        </span>

        {hasValue && (
          <button
            type="button"
            title="Clear dates"
            className="btn btn-sm p-0 border-0 text-muted ms-2"
            style={{ lineHeight: 1, fontSize: 18 }}
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Panel */}
      {open && (
        <div
          className="bg-body border rounded shadow p-3"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            width: 300,
            zIndex: 1050,
          }}
        >
          <div className="d-flex flex-wrap gap-1 mb-3">
            {getPresets().map((preset) => (
              <Button
                key={preset.label}
                type="button"
                size="sm"
                color="light"
                className="border"
                onClick={() => {
                  onApply(preset.range[0], preset.range[1]);
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <Row className="g-2">
            <Col xs={6}>
              <Label
                for="task_filter_from_date"
                className="form-label small mb-1"
              >
                Start Date
              </Label>
              <Input
                type="date"
                id="task_filter_from_date"
                bsSize="sm"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
              />
            </Col>
            <Col xs={6}>
              <Label
                for="task_filter_to_date"
                className="form-label small mb-1"
              >
                End Date
              </Label>
              <Input
                type="date"
                id="task_filter_to_date"
                bsSize="sm"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-between mt-3">
            <Button type="button" size="sm" color="light" onClick={clear}>
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              color="primary"
              disabled={!from && !to}
              onClick={apply}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskListFilter = () => {
  const inputRef = useRef();
  const dispatch = useDispatch();
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  // ── Local storage options ──────────────────────────────────────────────────
  const employee_options = useMemo(
    () => GetLocalStorageData("employee") || [],
    [],
  );

  const status_options = useMemo(() => {
    const statusData = GetLocalStorageData("task_status") || [];
    return statusData.map((item) => ({
      ...item,
      value: item.id,
      label: item.name,
    }));
  }, []);

  const priority_options = useMemo(() => {
    const priorityData = GetLocalStorageData("task_priority") || [];
    return priorityData.map((item) => ({
      ...item,
      value: item.id,
      label: item.name,
    }));
  }, []);

  const { task_list_filter_keys, task_date_range } = useSelector(
    (state) => state.TableFilterReducer,
  );

  // ✅ FIX: employee_options has no "label" field, so react-select rendered
  // a blank box once an item was selected. Build a labeled version for
  // any Select that shows employee names (Assigned To).
  const employee_options_with_label = useMemo(
    () =>
      employee_options.map((emp) => ({
        ...emp,
        value: emp.id,
        label:
          `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
          emp.label ||
          emp.name ||
          `Employee ${emp.id}`,
      })),
    [employee_options],
  );

  // ── Collaborator default options (active employees from localStorage) ───────
  const defaultCollaboratorOptions = useMemo(
    () =>
      employee_options
        .filter((e) => e.is_active)
        .map((emp) => ({
          ...emp,
          value: emp.id,
          label:
            `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
            emp.label ||
            emp.name ||
            `Employee ${emp.id}`,
        })),
    [employee_options],
  );

  // ── Async search for collaborators ─────────────────────────────────────────
  const loadCollaboratorOptions = useCallback(async (inputValue) => {
    try {
      const response = await Api.get(
        `/employee/get-data-on-search/?search=${encodeURIComponent(
          inputValue || "",
        )}`,
      );

      const results = response?.data?.data || [];

      return results.map((emp) => ({
        ...emp,
        value: emp.id,
        label:
          `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
          emp.name ||
          `Employee ${emp.id}`,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  // ── Date range apply (null/null = cleared -> API returns all tasks) ─────────
  const handleDateRangeApply = (start, end) => {
    dispatch(
      setTaskDateRange({
        start_date: start || null,
        end_date: end || null,
      }),
    );
  };

  // ── Generic change handler ─────────────────────────────────────────────────
  const handleFilterChange = (e, name) => {
    if (name === "collaborator_id") {
      setSelectedCollaborators(e || []);

      dispatch(
        setTaskListFilterKeys({
          ...task_list_filter_keys,
          collaborator_id: e ? e.map((item) => item.id || item.value) : [],
        }),
      );

      return;
    }

    // ✅ FIX: this case was previously outside handleFilterChange (dead code,
    // caused is_my_task filtering to never actually run)
    if (name === "is_my_task") {
      dispatch(
        setTaskListFilterKeys({
          ...task_list_filter_keys,
          is_my_task: e ? e.value : null,
        }),
      );
      return;
    }

    let val;

    if (e) {
      val = e.id || e.value;
    } else {
      val = null;
    }

    dispatch(
      setTaskListFilterKeys({
        ...task_list_filter_keys,
        [name]: val,
      }),
    );
  };

  const selectStyles = {
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const task_type_options = [
    { value: true, label: "My Task" },
    { value: false, label: "Team Task" },
  ];

  return (
    <React.Fragment>
      <Col md={2}>
        <Select
          id="task_type_filter"
          noOptionsMessage={() => "No options"}
          name="task_type_filter"
          isClearable
          isMulti={false}
          options={task_type_options}
          placeholder="My Task / Team Task"
          value={
            task_list_filter_keys?.is_my_task !== undefined &&
            task_list_filter_keys?.is_my_task !== null
              ? task_type_options.find(
                  (t) => t.value === task_list_filter_keys.is_my_task,
                ) || null
              : null
          }
          onChange={(e) => handleFilterChange(e, "is_my_task")}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={selectStyles}
        />
      </Col>
      {/* Assigned To */}
      <Col md={2}>
        <Select
          id="assigned_to_filter"
          noOptionsMessage={() => "No options"}
          filterOption={(option, inputValue) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          }
          name="assigned_to_filter"
          isClearable
          components={{ Option: EmployeeDisplayInSelect }}
          innerRef={inputRef}
          isMulti={false}
          options={employee_options_with_label.filter((e) => e.is_active)}
          placeholder="Assigned To"
          className="basic-multi-select"
          value={
            task_list_filter_keys?.assigned_to
              ? employee_options_with_label.find(
                  (e) => e.id === task_list_filter_keys.assigned_to,
                ) || null
              : null
          }
          onChange={(e) => handleFilterChange(e, "assigned_to")}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={selectStyles}
        />
      </Col>

      {/* Collaborators — async multi select */}
      <Col md={2}>
        <AsyncSelect
          id="collaborator_filter"
          noOptionsMessage={() => "No options"}
          filterOption={(option, inputValue) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          }
          name="collaborator_filter"
          isMulti
          isClearable
          cacheOptions
          defaultOptions={defaultCollaboratorOptions}
          loadOptions={loadCollaboratorOptions}
          components={{ Option: EmployeeDisplayInSelect }}
          placeholder="Collaborators"
          className="basic-multi-select"
          getOptionValue={(option) => String(option.id)}
          getOptionLabel={(option) => option.label}
          value={selectedCollaborators}
          loadingMessage={() => "Searching..."}
          onChange={(selected) =>
            handleFilterChange(selected, "collaborator_id")
          }
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={selectStyles}
        />
      </Col>

      {/* Status */}
      <Col md={2}>
        <Select
          id="task_status_filter"
          noOptionsMessage={() => "No options"}
          filterOption={(option, inputValue) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          }
          name="task_status_filter"
          isClearable
          innerRef={inputRef}
          isMulti={false}
          options={status_options}
          placeholder="Select Status"
          value={
            task_list_filter_keys?.task_status
              ? status_options.find(
                  (s) => s.id === task_list_filter_keys.task_status,
                ) || null
              : null
          }
          onChange={(e) => handleFilterChange(e, "task_status")}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={selectStyles}
        />
      </Col>

      {/* Priority */}
      <Col md={2}>
        <Select
          id="task_priority_filter"
          noOptionsMessage={() => "No options"}
          filterOption={(option, inputValue) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          }
          name="task_priority_filter"
          isClearable
          innerRef={inputRef}
          isMulti={false}
          options={priority_options}
          placeholder="Select Priority"
          value={
            task_list_filter_keys?.task_priority
              ? priority_options.find(
                  (p) => p.id === task_list_filter_keys.task_priority,
                ) || null
              : null
          }
          onChange={(e) => handleFilterChange(e, "task_priority")}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={selectStyles}
        />
      </Col>

      {/* Date range (Start Date – End Date) */}
      <Col md={3}>
        <DateRangeFilter
          startDate={task_date_range?.start_date || null}
          endDate={task_date_range?.end_date || null}
          onApply={handleDateRangeApply}
        />
      </Col>
    </React.Fragment>
  );
};

export default TaskListFilter;
