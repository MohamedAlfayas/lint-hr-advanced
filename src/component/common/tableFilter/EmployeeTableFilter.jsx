import React, { useMemo, useRef } from "react";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Col, Label } from "reactstrap";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import Select from "../../../shared/ui/TestableSelect";
import { useDispatch, useSelector } from "react-redux";
import { setEmployeeTableFilterKeys } from "../../../redux/reducers/ChildReducer/TableFilterReducer";

const EmployeeTableFilter = () => {
  const inputRef = useRef();

  const dep_options = useMemo(
    () => GetLocalStorageData("department") || [],
    [],
  );
  const manager_options = useMemo(() => GetLocalStorageData("employee") || []);
  const role_options = useMemo(() => GetLocalStorageData("role") || []);

  console.log("Options", role_options);

  const dispatch = useDispatch();

  const { employee_table_filter_keys } = useSelector(
    (state) => state.TableFilterReducer,
  );
  console.log("Filter", employee_table_filter_keys);

  const handleFilterChange = (e, name) => {
    let val = !!e ? e.id : 0;
    dispatch(
      setEmployeeTableFilterKeys({
        ...employee_table_filter_keys,
        [name]: val,
      }),
    );
  };

  const handleFilterOption = (candidate, inputValue) => {
    if (!inputValue) return true;

    if (/^\d+$/.test(inputValue.trim())) {
      return false;
    }

    return (
      candidate.label?.toLowerCase().includes(inputValue.toLowerCase()) ||
      candidate.data?.name?.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  return (
    <React.Fragment>
      <Col md={3}>
        <Select
          testId="employee-filter-department-filter"
          id="department_filter"
          name="department_filter"
          isClearable={true}
          innerRef={inputRef}
          isMulti={false}
          options={dep_options || []}
          className="basic-multi-select"
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          placeholder="Select Department"
          value={
            !!employee_table_filter_keys?.primary_department_id_list
              ? dep_options.find(
                  (d) =>
                    d.id ===
                    employee_table_filter_keys?.primary_department_id_list,
                )
              : []
          }
          filterOption={handleFilterOption}
          onChange={(e) => handleFilterChange(e, "primary_department_id_list")}
        />
      </Col>

      <Col md={2}>
        <Select
          testId="employee-filter-role-filter"
          id="role_filter"
          name="role_filter"
          isClearable={true}
          innerRef={inputRef}
          isMulti={false}
          options={role_options || []}
          className="basic-multi-select"
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          placeholder="Select Role"
          filterOption={handleFilterOption}
          onChange={(e) => handleFilterChange(e, "role_id")}
          value={
            !!employee_table_filter_keys?.role_id
              ? role_options.find(
                  (d) => d.id === employee_table_filter_keys?.role_id,
                )
              : []
          }
        />
      </Col>

      <Col md={3}>
        <Select
          testId="employee-filter-manager-filter"
          id="manager_filter"
          name="manager_filter"
          isClearable={true}
          components={{ Option: EmployeeDisplayInSelect }}
          innerRef={inputRef}
          isMulti={false}
          options={manager_options.filter((d) => d.is_active) || []}
          className="basic-multi-select"
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          placeholder="Select Reporting Manager"
          filterOption={handleFilterOption}
          onChange={(e) => handleFilterChange(e, "reporting_manager_id")}
          value={
            !!employee_table_filter_keys?.reporting_manager_id
              ? manager_options.find(
                  (d) =>
                    d.id === employee_table_filter_keys?.reporting_manager_id,
                )
              : []
          }
        />
      </Col>
    </React.Fragment>
  );
};

export default EmployeeTableFilter;
