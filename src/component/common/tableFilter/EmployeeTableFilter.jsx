import React, { useMemo, useRef } from "react";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Col, Label } from "reactstrap";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { setEmployeeTableFilterKeys } from "../../../redux/reducers/ChildReducer/TableFilterReducer";

const EmployeeTableFilter = () => {
  const inputRef = useRef();

  const dep_options = useMemo(
    () => GetLocalStorageData("department") || [],
    []
  );
  const manager_options = useMemo(() => GetLocalStorageData("employee") || []);
  const role_options = useMemo(() => GetLocalStorageData("role") || []);

  const dispatch = useDispatch();

  const { employee_table_filter_keys } = useSelector(
    (state) => state.TableFilterReducer
  );

  const handleFilterChange = (e, name) => {
    let val = !!e ? e.id : 0;
    dispatch(
      setEmployeeTableFilterKeys({
        ...employee_table_filter_keys,
        [name]: val,
      })
    );
  };

  return (
    <React.Fragment>
      <Col md={2}>
        <Select
          id="department_filter"
          name="department_filter"
          isClearable={true}
          innerRef={inputRef}
          isMulti={false}
          options={dep_options || []}
          className="basic-multi-select"
          placeholder="Select Department"
          value={
            !!employee_table_filter_keys?.primary_department_id_list
              ? dep_options.find(
                  (d) =>
                    d.id ===
                    employee_table_filter_keys?.primary_department_id_list
                )
              : []
          }
          onChange={(e) => handleFilterChange(e, "primary_department_id_list")}
        />
      </Col>

      <Col md={2}>
        <Select
          id="role_filter"
          name="role_filter"
          isClearable={true}
          innerRef={inputRef}
          isMulti={false}
          options={role_options || []}
          className="basic-multi-select"
          placeholder="Select Role"
          onChange={(e) => handleFilterChange(e, "role_id")}
          value={
            !!employee_table_filter_keys?.role_id
              ? role_options.find(
                  (d) => d.id === employee_table_filter_keys?.role_id
                )
              : []
          }
        />
      </Col>

      <Col md={2}>
        <Select
          id="manager_filter"
          name="manager_filter"
          isClearable={true}
          components={{ Option: EmployeeDisplayInSelect }}
          innerRef={inputRef}
          isMulti={false}
          options={manager_options || []}
          className="basic-multi-select"
          placeholder="Select Reporting Manager"
          onChange={(e) => handleFilterChange(e, "reporting_manager_id")}
          value={
            !!employee_table_filter_keys?.reporting_manager_id
              ? manager_options.find(
                  (d) =>
                    d.id === employee_table_filter_keys?.reporting_manager_id
                )
              : []
          }
        />
      </Col>
    </React.Fragment>
  );
};

export default EmployeeTableFilter;
