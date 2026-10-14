import React, { useRef } from "react";
import { Col, Label } from "reactstrap";
import Select from "../../../shared/ui/TestableSelect";
import { leave_type_options } from "../../../common/constant/Constants";
import { useDispatch, useSelector } from "react-redux";
import { setLeaveTypeTableFilterKeys } from "../../../redux/reducers/ChildReducer/TableFilterReducer";

const LeaveTypeFilter = () => {
  const inputRef = useRef();

  const dispatch = useDispatch();

  const { leave_type_table_filter_keys } = useSelector(
    (state) => state.TableFilterReducer,
  );

  const handleFilterChange = (e, name) => {
    let val = !!e ? e.id : 0;
    dispatch(
      setLeaveTypeTableFilterKeys({
        ...leave_type_table_filter_keys,
        [name]: val,
      }),
    );
  };

  const handleLeaveTypeSearch = (option, inputValue) => {
    const search = inputValue.trim();

    if (!search) return true;

    if (/^\d+$/.test(search)) {
      return false;
    }

    return (option.label || option.data?.label || "")
      .toLowerCase()
      .includes(search.toLowerCase());
  };

  return (
    <React.Fragment>
      <Col md={4}>
        <Select
          testId="leave-type-filter-status-filter"
          id="status_filter"
          name="status_filter"
          isClearable={true}
          innerRef={inputRef}
          isMulti={false}
          options={leave_type_options || []}
          className="basic-multi-select"
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          filterOption={handleLeaveTypeSearch}
          placeholder="Select Leave Type"
          value={
            !!leave_type_table_filter_keys?.unit
              ? leave_type_options.find(
                  (d) => d.id === leave_type_table_filter_keys?.unit,
                )
              : []
          }
          onChange={(e) => handleFilterChange(e, "unit")}
        />
      </Col>
    </React.Fragment>
  );
};

export default LeaveTypeFilter;
