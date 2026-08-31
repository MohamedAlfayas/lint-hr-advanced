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
    [],
  );

  const dispatch = useDispatch();

  const { attendance_approval_table_filter_keys } = useSelector(
    (state) => state.TableFilterReducer,
  );

  const handleFilterChange = (e, name) => {
    let val = !!e ? e.id : 0;
    dispatch(
      setAttendanceApprovalTableFilterKeys({
        ...attendance_approval_table_filter_keys,
        [name]: val,
      }),
    );
  };

  const handleDateRangeChange = (e, monthStr) => {
    dispatch(
      setAttendanceApprovalTableFilterKeys({
        ...attendance_approval_table_filter_keys,
        thisMonth: monthStr,
      }),
    );
  };

  const monthOptions = [
    { id: 0, label: "All", value: "All" },
    { id: 1, label: "January", value: "January" },
    { id: 2, label: "February", value: "February" },
    { id: 3, label: "March", value: "March" },
    { id: 4, label: "April", value: "April" },
    { id: 5, label: "May", value: "May" },
    { id: 6, label: "June", value: "June" },
    { id: 7, label: "July", value: "July" },
    { id: 8, label: "August", value: "August" },
    { id: 9, label: "September", value: "September" },
    { id: 10, label: "October", value: "October" },
    { id: 11, label: "November", value: "November" },
    { id: 12, label: "December", value: "December" },
  ];

  return (
    <React.Fragment>
      <Col md={4}>
        <div className="form-icon right">
          <DatePicker
            picker="year"
            inputReadOnly={true}
            allowClear={false}
            className="form-control"
            style={{ width: "100%", height: "38px" }}
            placeholder="Select Year"
            disabledDate={(current) => {
              const minYear = 1900;
              const maxYear = new Date().getFullYear() + 1;

              return current.year() < minYear || current.year() > maxYear;
            }}
            // onChange={handleDateRangeChange}
            onChange={(date, yearStr) => {
              dispatch(
                setAttendanceApprovalTableFilterKeys({
                  ...attendance_approval_table_filter_keys,
                  year: yearStr,
                }),
              );
            }}
          />
        </div>
      </Col>

      <Col md={4}>
        <Select
          options={monthOptions}
          placeholder="Select Month"
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.id}
          defaultValue={monthOptions[0]}
          styles={{
            menuPortal: (base) => ({
              ...base,
              zIndex: 9999,
            }),
          }}
          menuPortalTarget={document.body}
          onChange={(selected) => {
            dispatch(
              setAttendanceApprovalTableFilterKeys({
                ...attendance_approval_table_filter_keys,
                month: selected?.id || 0,
              }),
            );
          }}
        />
      </Col>
    </React.Fragment>
  );
};

export default HolidayFilter;
