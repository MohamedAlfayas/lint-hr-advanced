import React, { useRef } from "react";
import { Col, Label } from "reactstrap";
import Select from "react-select";
import { leave_type_options } from "../../../common/constant/Constants";

const LeaveTypeFilter = () => {
  const inputRef = useRef();
  return (
    <React.Fragment>
      <Col md={4}>
        <Select
          id="status_filter"
          name="status_filter"
          innerRef={inputRef}
          isMulti={false}
          options={leave_type_options || []}
          className="basic-multi-select"
          placeholder="Select Leave Type"
        />
      </Col>
    </React.Fragment>
  );
};

export default LeaveTypeFilter;
