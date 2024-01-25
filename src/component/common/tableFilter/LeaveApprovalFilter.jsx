import React, { useRef } from "react";
import { Col, Label } from "reactstrap";
import Select from "react-select";
import { leave_approval_table_filter_options } from "../../../common/constant/Constants";
import { useDispatch, useSelector } from "react-redux";
import { setLeaveApprovalTableFilterKeys } from "../../../redux/reducers/ChildReducer/TableFilterReducer";

const LeaveApprovalFilter = () => {
  const inputRef = useRef();

  const dispatch = useDispatch();

  const { leave_approval_table_filter_keys } = useSelector(
    (state) => state.TableFilterReducer
  );

  const handleFilterChange = (e, name) => {
    let val = !!e ? e.id : 0;
    dispatch(
      setLeaveApprovalTableFilterKeys({
        ...leave_approval_table_filter_keys,
        [name]: val,
      })
    );
  };

  return (
    <React.Fragment>
      <Col md={4}>
        <Select
          id="status_filter"
          name="status_filter"
          isClearable={true}
          innerRef={inputRef}
          isMulti={false}
          options={leave_approval_table_filter_options || []}
          className="basic-multi-select"
          placeholder="Select Status"
          onChange={(e) => handleFilterChange(e, "status")}
        />
      </Col>
    </React.Fragment>
  );
};

export default LeaveApprovalFilter;
