import React, { useMemo, useRef } from "react";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Col, Label } from "reactstrap";
import Select from "react-select";

const EmployeeTableFilter = () => {
  const inputRef = useRef();

  const dep_options = useMemo(
    () => GetLocalStorageData("department") || [],
    []
  );

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
    </React.Fragment>
  );
};

export default EmployeeTableFilter;
