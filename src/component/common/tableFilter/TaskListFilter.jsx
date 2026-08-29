import React, { useMemo, useRef, useCallback } from "react";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Col } from "reactstrap";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { useDispatch, useSelector } from "react-redux";
import { setTaskListFilterKeys } from "../../../redux/reducers/ChildReducer/TableFilterReducer";
import { Api } from "../../../common/api/Api";
import { useState } from "react";

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

  const { task_list_filter_keys } = useSelector(
    (state) => state.TableFilterReducer,
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

  // Add handler case inside handleFilterChange, before the generic val logic:
  if (name === "is_my_task") {
    dispatch(
      setTaskListFilterKeys({
        ...task_list_filter_keys,
        is_my_task: e ? e.value : null,
      }),
    );
    return;
  }

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
    </React.Fragment>
  );
};

export default TaskListFilter;
