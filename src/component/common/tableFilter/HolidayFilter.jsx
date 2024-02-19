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

const HolidayFilter = () => {
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
    dispatch(
      setAttendanceApprovalTableFilterKeys({
        ...attendance_approval_table_filter_keys,
        thisMonth: monthStr,
      })
    );
  };



  return (
    <React.Fragment>
      <Col md={3}>
        <div className="form-icon right">
          <DatePicker
            // value={dayjs(attendance_approval_table_filter_keys?.thisMonth)}
            // format={MonthFormat}
            picker="year"
            allowClear={false}
            className="form-control"
            placeholder="Select Year"
            // onChange={handleDateRangeChange}
          />
        </div>
      </Col>

    
    </React.Fragment>
  );
};

export default HolidayFilter;
