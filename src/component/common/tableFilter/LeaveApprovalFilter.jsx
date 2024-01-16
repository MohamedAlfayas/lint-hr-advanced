import React, { useRef } from "react";
import { Col, Label } from "reactstrap";
import Select from "react-select";
import { leave_approval_status_options } from "../../../common/constant/Constants";

const LeaveApprovalFilter = () => {
  const inputRef = useRef();
  return (
    <React.Fragment>
      <Col md={4}>
        <Select
          id="status_filter"
          name="status_filter"
          innerRef={inputRef}
          isMulti={false}
          options={leave_approval_status_options || []}
          className="basic-multi-select"
          placeholder="Select Status"
        />
      </Col>
    </React.Fragment>
  );
};

export default LeaveApprovalFilter;
