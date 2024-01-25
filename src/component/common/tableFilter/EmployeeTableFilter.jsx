import React, { useMemo, useRef } from "react";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Col, Label } from "reactstrap";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import Select from "react-select";

const EmployeeTableFilter = () => {
  const inputRef = useRef();

  const dep_options = useMemo(
    () => GetLocalStorageData("department") || [],
    []
  );
  const manager_options = useMemo(() => GetLocalStorageData("employee") || []);
  const role_options = useMemo(() => GetLocalStorageData("role") || []);

  return (
    <React.Fragment>
      <Col md={2}>
        <Select
          id="department_filter"
          name="department_filter"
          innerRef={inputRef}
          isMulti={true}
          options={dep_options || []}
          className="basic-multi-select"
          placeholder="Select Department"
        />
      </Col>

      <Col md={2}>
        <Select
          id="role_filter"
          name="role_filter"
          innerRef={inputRef}
          isMulti={true}
          options={role_options || []}
          className="basic-multi-select"
          placeholder="Select Role"
        />
      </Col>

      <Col md={2}>
        <Select
          id="manager_filter"
          name="manager_filter"
          components={{ Option: EmployeeDisplayInSelect }}
          innerRef={inputRef}
          isMulti={true}
          options={manager_options || []}
          className="basic-multi-select"
          placeholder="Select Reporting Manager"
        />
      </Col>
    </React.Fragment>
  );
};

export default EmployeeTableFilter;
