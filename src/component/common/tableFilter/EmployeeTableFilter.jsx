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

  return (
    <React.Fragment>
      <Col md={4}>
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

      <Col md={4}>
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
