import React, { useEffect, useMemo, useRef, useState } from "react";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { Col } from "reactstrap";
import Select from "react-select";
import { DatePicker } from "antd";
import { MonthFormat } from "../../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { Api } from "../../../common/api/Api";
import { setAttendanceApprovalData } from "../../../redux/reducers/ChildReducer/AttendanceApprovalReducer";
import { useDispatch } from "react-redux";
dayjs.extend(customParseFormat);

const AttendanceApprovalFilter = () => {
  const [filteredDepType, setFilteredDepType] = useState(0);
  const [filteredMonth, setFilteredMonth] = useState(
    `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`
  );
  const dep_options = useMemo(
    () => GetLocalStorageData("department") || [],
    []
  );

  const dispatch = useDispatch();

  const [depOptions, setDepOptions] = useState([]);

  useEffect(() => {
    setDepOptions([{ id: "0", label: "All", value: "0" }, ...dep_options]);
  }, []);

  const handleDepartmentChange = (e, name) => {
    setFilteredDepType(e.value);
  };

  const handleDateRangeChange = (e, monthStr) => {
    setFilteredMonth(monthStr);
  };

  const handleFilter = async () => {
    dispatch(setLoaderVisible(true));
    Api({
      type: "GET",
      url:
        "attendance/get-attendance-data-for-approval/?thisMonth=" +
        filteredMonth +
        "&department_id=" +
        filteredDepType,
    })
      .then((res) => {
        console.log("res", res);
        dispatch(setAttendanceApprovalData(res?.data?.data));
      })
      .catch((err) => {
        console.log("ERR = ", err);
      });
    dispatch(setLoaderVisible(false));
  };

  return (
    <React.Fragment>
      <Col md={3}>
        <Select
          id="department_filter"
          name="department_filter"
          isClearable={false}
          isMulti={false}
          options={depOptions || []}
          className="basic-multi-select"
          placeholder="Select Department"
          allowClear={false}
          onChange={(e) =>
            handleDepartmentChange(e, "primary_department_id_list")
          }
          value={depOptions.find((d) => d.id === filteredDepType) || []}
        />
      </Col>
      <Col md={3}>
        <div className="form-icon right">
          <DatePicker
            value={dayjs(filteredMonth)}
            format={MonthFormat}
            picker="month"
            allowClear={false}
            className="form-control"
            placeholder="Select Month"
            onChange={handleDateRangeChange}
          />
        </div>
      </Col>

      <div className="col-lg-auto">
        <div className="hstack gap-2">
          <button
            type="button"
            onClick={handleFilter}
            className="btn btn-danger"
          >
            <i className="ri-equalizer-fill me-1 align-bottom"></i> Filter
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AttendanceApprovalFilter;
