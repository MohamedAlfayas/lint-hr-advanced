import React, { useRef, useState } from "react";
import { Card, CardHeader, Col, Label, Row } from "reactstrap";
import Select from "react-select";
import { leave_approval_table_filter_options } from "../../../common/constant/Constants";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "antd";
import { MonthFormat } from "../../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { setLeaveApproval } from "../../../redux/reducers/ChildReducer/LeaveApprovalReducer";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { Api } from "../../../common/api/Api";
dayjs.extend(customParseFormat);

const LeaveApprovalFilter = () => {
  const inputRef = useRef();

  const dispatch = useDispatch();

  const [employeeType, setEmployeeType] = useState(1);
  const [filteredMonth, setFilteredMonth] = useState(
    `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`
  );
  const employeeTypeOptions = [
    { id: "0", label: "All Employee", value: "0" },
    { id: "1", label: "My Team Members", value: "1" },
  ];

  const handleEmployeeTypeChange = (e, name) => {
    setEmployeeType(e.value);
  };

  const handleDateRangeChange = (e, monthStr) => {
    setFilteredMonth(monthStr);
  };

  const handleFilter = async () => {
    dispatch(setLoaderVisible(true));
    Api({
      type: "GET",
      url:
        "leave/get-leave-application-for-approval/?thisMonth=" +
        filteredMonth +
        "&employee_type=" +
        employeeType,
    })
      .then((res) => {
        dispatch(setLeaveApproval(res?.data?.data));
        dispatch(setLoaderVisible(false));
      })
      .catch((err) => {
        console.log("ERR = ", err);
        dispatch(setLoaderVisible(false));
      });
  };

  return (
    <React.Fragment>
      <Card>
        <CardHeader className="border-0 rounded">
          <Row className="g-2">
            <Col md={3}>
              <Select
                id="employee_filter"
                name="employee_filter"
                isClearable={false}
                isMulti={false}
                options={employeeTypeOptions || []}
                className="basic-multi-select"
                placeholder="Select Employee Type"
                allowClear={false}
                onChange={handleEmployeeTypeChange}
                value={
                  employeeTypeOptions.find((d) => d.id === employeeType) ||
                  employeeTypeOptions[1]
                }
              />
            </Col>
            <Col md={3}>
              <DatePicker
                value={dayjs(filteredMonth)}
                format={MonthFormat}
                picker="month"
                allowClear={false}
                className="form-control"
                placeholder="Select Month"
                onChange={handleDateRangeChange}
              />
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
          </Row>
        </CardHeader>
      </Card>
    </React.Fragment>
  );
};

export default LeaveApprovalFilter;
