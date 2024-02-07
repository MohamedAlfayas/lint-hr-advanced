import React, { useMemo, useRef, useState } from "react";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Col } from "reactstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { setAttendanceApprovalTableFilterKeys } from "../../../redux/reducers/ChildReducer/TableFilterReducer";
import { DatePicker } from "antd";
import { MonthFormat } from "../../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const AttednaceApprovalFilter = () => {
  const inputRef = useRef();
  const [attedanceApproval, setAttendanceApproval] = useState({
    thisMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
  });

  const dep_options = useMemo(
    () => GetLocalStorageData("department") || [],
    []
  );

  const dispatch = useDispatch();

  const { attendance_approval_table_filter_keys } = useSelector(
    (state) => state.TableFilterReducer
  );

  const handleFilterChange = (e, name) => {
    let val = !!e ? e.id : 0;
    dispatch(
      setAttendanceApprovalTableFilterKeys({
        ...attendance_approval_table_filter_keys,
        [name]: val,
      })
    );
  };

  const handleDateRangeChange = (e, monthStr) => {
    setAttendanceApproval({
      ...attedanceApproval,
      thisMonth: monthStr,
    });
  };

  return (
    <React.Fragment>
      <Col md={3}>
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
            !!attendance_approval_table_filter_keys?.primary_department_id_list
              ? dep_options.find(
                  (d) =>
                    d.id ===
                    attendance_approval_table_filter_keys?.primary_department_id_list
                )
              : []
          }
          onChange={(e) => handleFilterChange(e, "primary_department_id_list")}
        />
      </Col>
      <Col md={3}>
        <div className="form-icon right">
          <DatePicker
            value={dayjs(attedanceApproval?.thisMonth, MonthFormat)}
            format={MonthFormat}
            picker="month"
            allowClear={false}
            className="form-control"
            placeholder="Select Month"
            onChange={handleDateRangeChange}
          />
        </div>
      </Col>
    </React.Fragment>
  );
};

export default AttednaceApprovalFilter;
