import axios from "axios";
import { FilePond } from "filepond";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Col, Form, Input, Label, Row } from "reactstrap";
import Select from "react-select";
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  addLeaveApplication,
  editLeaveApplication,
} from "../../redux/reducers/ChildReducer/LeaveApplyReducer";
import { toast } from "react-toastify";

const ApplyLeaveForm = () => {
  const dispatch = useDispatch();
  const [leaveapplyObj, setLeaveApplyObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [selectedLeaveType, setSelectedLeaveType] = useState([]);
  const [leaveDaysCount, setLeaveDaysCount] = useState([]);
  const [leaveHoursCount, setLeaveHoursCount] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    setLeaveApplyObj(form_obj);
  }, [form_obj]);

  // const handleSubmit = async () => {
  //   Api({
  //     method: "POST",
  //     url: "holiday/create/",
  //     data: holidayObj,
  //   })
  //     .then((res) => {
  //       console.log("REs = ", res);
  //       holidayObj.id === 0
  //         ? dispatch(addHoliday(res?.data.data))
  //         : dispatch(editHoliday(res?.data?.data));
  //       dispatch(toggleRSBView(false));
  //       toast.success(res?.data?.message);
  //     })
  //     .catch((err) => {
  //       console.log("ERr == ", err);
  //       toast.success(err?.response?.data?.message);
  //     });
  // };

  const lt_option = [
    {
      id: 1,
      label: "Casual Leave (CL)",
      value: 1,
      type: 1,
      unit: "Day",
      leave_count: 12,
      available_count: 12,
      status: 1,
    },
    {
      id: 2,
      label: "Earned Leave (EL)",
      value: 2,
      type: 1,
      unit: "Day",
      leave_count: 12,
      available_count: 12,
      status: 1,
    },
    {
      id: 3,
      label: "Sick Leave (SL)",
      value: 3,
      type: 2,
      unit: "Day",
      leave_count: 12,
      available_count: 5,
      status: 1,
    },
    {
      id: 4,
      label: "Maternity Leave (ML)",
      value: 4,
      type: 1,
      unit: "Day",
      leave_count: 60,
      available_count: 30,
      status: 1,
    },
    {
      id: 5,
      label: "Marriage Leave",
      value: 5,
      type: 1,
      unit: "Day",
      leave_count: 15,
      available_count: 15,
      status: 1,
    },
    {
      id: 6,
      label: "Compensatory Off",
      value: 6,
      type: 1,
      unit: "Day",
      leave_count: 12,
      available_count: 12,
      status: 1,
    },
    {
      id: 7,
      label: "Loss Of Pay Leave",
      value: 7,
      type: 1,
      unit: "Day",
      leave_count: 12,
      available_count: 12,
      status: 1,
    },
    {
      id: 8,
      label: "Permission",
      value: 8,
      type: 1,
      unit: "Hour",
      leave_count: 48,
      available_count: 32,
      status: 1,
    },
    {
      id: 9,
      label: "Casual Leave",
      value: 9,
      type: 1,
      unit: "Day",
      leave_count: 12,
      available_count: 12,
      status: 1,
    },
  ];

  console.log("leaveapplyObj");
  console.log(leaveapplyObj);

  let isSelectedUnit = "";

  const handleDateChange = (startDate, endDate) => {
    setLeaveApplyObj({
      ...leaveapplyObj,
      start: ConvertISODateFormat(startDate),
    });
    setLeaveApplyObj({ ...leaveapplyObj, end: ConvertISODateFormat(endDate) });

    console.log(startDate);
    console.log(endDate);

    var diff = new Date(endDate) - new Date(startDate);

    if (!isNaN(diff)) {
      setLeaveDaysCount(diff / 1000 / 60 / 60 / 24 + 1);
    } else {
      setLeaveDaysCount(0);
    }

    console.log(diff);
  };

  useEffect(() => {
    handleDateChange(startDate, endDate);
  }, [startDate, endDate]);

  return (
    <React.Fragment>
      <Row>
        <Col>
          {/* <Form onSubmit={handleSubmit} action="javascript:void(0)"> */}
          <Row className="g-3">
            <Col lg={12}>
              <div className="mb-3">
                <Label>Type *</Label>
                <Select
                  required
                  isMulti={false}
                  options={lt_option || []}
                  //value={leaveapplyObj.leavetype || []}
                  //onChange={handleGenderChange}
                  value={
                    (leaveapplyObj.leavetype &&
                      lt_option.find(
                        (e) => e.id === leaveapplyObj.leavetype
                      )) ||
                    []
                  }
                  onChange={(e) => {
                    setSelectedLeaveType(e.unit);
                    isSelectedUnit = e.unit;
                    console.log(selectedLeaveType);
                    setLeaveApplyObj({ ...leaveapplyObj, leavetype: e.id });
                  }}
                  placeholder="Select Leave Type"
                  className="basic-multi-select"
                />
              </div>
              <div id="passwordHelpBlock" className="form-text">
                Please select type of leave.
              </div>
            </Col>

            {selectedLeaveType === "Day" ? (
              <Col lg={12}>
                <label htmlFor="holidayName" className="form-label">
                  Select Date *
                </label>
                <div className="input-group">
                  <Flatpickr
                    className="form-control"
                    placeholder="Start Date"
                    value={startDate}
                    options={{
                      dateFormat: "d M, Y",
                    }}
                    onChange={(selectedDates, dateStr, instance) => {
                      // setLeaveApplyObj({ ...leaveapplyObj, start: dateStr });
                      setStartDate(dateStr);

                      // handleDateChange(selectedDates, dateStr, instance);
                    }}
                  />
                  <span className="input-group-text">
                    {leaveDaysCount} Days
                  </span>
                  <Flatpickr
                    className="form-control"
                    placeholder="End Date"
                    value={endDate}
                    options={{
                      dateFormat: "d M, Y",
                    }}
                    onChange={(selectedDates, dateStr, instance) => {
                      //setLeaveApplyObj({ ...leaveapplyObj, end: dateStr });
                      setEndDate(dateStr);

                      // handleDateChange(selectedDates, dateStr, instance);
                    }}
                  />
                </div>

                <div id="passwordHelpBlock" className="form-text">
                  Please select Start & End Date.
                </div>
              </Col>
            ) : selectedLeaveType === "Hour" ? (
              <Col lg={12}>
                <label htmlFor="holidayName" className="form-label">
                  Select Hour *
                </label>
                <div className="input-group">
                  <Flatpickr
                    className="form-control"
                    placeholder="Start Hour"
                    options={{
                      enableTime: true,
                      dateFormat: "Y-m-d H:i",
                    }}
                  />
                  <span className="input-group-text">2 Hours</span>
                  <Flatpickr
                    className="form-control"
                    placeholder="End Hour"
                    options={{
                      enableTime: true,
                      dateFormat: "Y-m-d H:i",
                    }}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text">
                  Please select Start & End Hour.
                </div>
              </Col>
            ) : (
              ""
            )}

            <Col lg={12}>
              <label htmlFor="description" className="form-label">
                Reason *
              </label>
              <textarea
                type="text"
                name="description"
                className="form-control"
                id="description"
                placeholder="Enter Reason"
                // value={holidayObj.description || ""}
              ></textarea>
              <div id="passwordHelpBlock" className="form-text">
                Please enter reason for leave.
              </div>
            </Col>

            <Col lg={12}>
              <div className="text-end">
                <Button color="success" className="btn-label">
                  {" "}
                  <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                  Apply{" "}
                </Button>{" "}
              </div>
            </Col>
          </Row>
          {/* </Form> */}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ApplyLeaveForm;
