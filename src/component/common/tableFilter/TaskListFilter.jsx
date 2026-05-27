import React, { useMemo, useRef } from "react";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Col } from "reactstrap";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { setTaskListFilterKeys } from "../../../redux/reducers/ChildReducer/TableFilterReducer";

const TaskListFilter = () => {
  const inputRef = useRef();
  const dispatch = useDispatch();

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

  const { task_list_filter_keys } = useSelector(
    (state) => state.TableFilterReducer,
  );
  console.log("filterrr", task_list_filter_keys);

  // ── Generic change handler ─────────────────────────────────────────────────
  const handleFilterChange = (e, name) => {
    let val;

    if (Array.isArray(e)) {
      val = e.map((item) => item.id || item.value);
      console.log("handleFilterChange", val);
    } else if (e) {
      val = e.id || e.value;
      console.log("handleFilterChange", val);
    } else {
      val = name === "collaborator_id" ? [] : null;
      console.log("handleFilterChange", val);
    }

    dispatch(
      setTaskListFilterKeys({
        ...task_list_filter_keys,
        [name]: val,
      }),
    );
  };

  return (
    <React.Fragment>
      {/* Assigned To */}
      <Col md={2}>
        <Select
          id="assigned_to_filter"
          name="assigned_to_filter"
          isClearable
          components={{ Option: EmployeeDisplayInSelect }}
          innerRef={inputRef}
          isMulti={false}
          options={employee_options.filter((e) => e.is_active)}
          placeholder="Assigned To"
          className="basic-multi-select"
          value={
            task_list_filter_keys?.assigned_to
              ? employee_options.find(
                  (e) => e.id === task_list_filter_keys.assigned_to,
                ) || null
              : null
          }
          onChange={(e) => handleFilterChange(e, "assigned_to")}
        />
      </Col>

      {/* Collaborators — multi select */}
      <Col md={2}>
        <Select
          id="collaborator_filter"
          name="collaborator_filter"
          isClearable
          isMulti
          components={{ Option: EmployeeDisplayInSelect }}
          innerRef={inputRef}
          options={employee_options.filter((e) => e.is_active)}
          placeholder="Collaborators"
          className="basic-multi-select"
          value={
            Array.isArray(task_list_filter_keys?.collaborator_id) &&
            task_list_filter_keys.collaborator_id.length
              ? employee_options.filter((e) =>
                  task_list_filter_keys.collaborator_id.includes(e.id),
                )
              : []
          }
          onChange={(selected) =>
            handleFilterChange(selected || [], "collaborator_id")
          }
        />
      </Col>

      {/* Status */}
      <Col md={2}>
        <Select
          id="task_status_filter"
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
        />
      </Col>

      {/* Priority */}
      <Col md={2}>
        <Select
          id="task_priority_filter"
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
        />
      </Col>
    </React.Fragment>
  );
};

export default TaskListFilter;
