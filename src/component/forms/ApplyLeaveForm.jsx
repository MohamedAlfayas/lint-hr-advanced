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
import { ConvertISODateFormat } from "../../common/js/ConvertDateFormat";
import Flatpickr from "react-flatpickr";

const ApplyLeaveForm = () => {
  const dispatch = useDispatch();
  const [leaveapplyObj, setLeaveApplyObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [selectedLeaveType, setSelectedLeaveType] = useState([]);
  const [leaveDaysCount, setLeaveDaysCount] = useState(0);
  const [leaveHoursCount, setLeaveHoursCount] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startHour, setStartHour] = useState(null);
  const [endHour, setEndHour] = useState(null);

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
   
  ];
  const handleDateChange = (startDate, endDate) => {
    console.log(leaveapplyObj);
    if (startDate != null && endDate != null) {
      setLeaveApplyObj({
        ...leaveapplyObj,
        start: ConvertISODateFormat(startDate),
      });
      setLeaveApplyObj({
        ...leaveapplyObj,
        end: ConvertISODateFormat(endDate),
      });
      console.log(startDate);
      console.log(endDate);
      var diff = new Date(endDate) - new Date(startDate);
      console.log(diff);
      if (!isNaN(diff)) {
        var diffCount = diff / 1000 / 60 / 60 / 24 + 1;
        setLeaveDaysCount(diffCount);
        if (diffCount <= 0) {
          setEndDate(startDate);
          setLeaveDaysCount(0);
          toast.warning("Date Range Error");
        } else if (diffCount > leaveapplyObj.available_count) {
          toast.warning("Date Range is Exceed Your Limit");

          setEndDate(null);
        } else {
          setLeaveDaysCount(diffCount);
        }
        console.log(diffCount);
      }
    }
  };

  const handleHourChange = (startHour, endHour) => {
    if (startHour != null && endHour != null) {
      setLeaveApplyObj({
        ...leaveapplyObj,
        start: startHour,
      });
      setLeaveApplyObj({
        ...leaveapplyObj,
        end: endHour,
      });

      var diff = new Date(endHour) - new Date(startHour);
      console.log(diff);

      if (!isNaN(diff)) {
        //var diffCount = diff / 1000 / 60 / 60 / 24 + 1;

        var seconds = Math.floor(diff / 1000);
        var minutes =
          Math.floor((seconds % 3600) / 60) < 10
            ? "0" + Math.floor((seconds % 3600) / 60)
            : Math.floor((seconds % 3600) / 60);
        var hour =
          Math.floor(seconds / 3600) < 10
            ? "0" + Math.floor(seconds / 3600)
            : Math.floor(seconds / 3600);
        var TotalDiff = hour + " : " + minutes;

        console.log(TotalDiff);

        setLeaveHoursCount(TotalDiff);

        if (TotalDiff <= 0) {
          setEndHour(startHour);
          setLeaveHoursCount(0);
          toast.warning("Hour Range Error");
        } else if (TotalDiff > leaveapplyObj.available_count) {
          toast.warning("Hour Range is Exceed Your Limit");

          setEndHour(null);
        } else {
          setLeaveHoursCount(TotalDiff);
        }
        console.log(TotalDiff);
      }
    }
  };

  useEffect(() => {
    handleDateChange(startDate, endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    handleHourChange(startHour, endHour);
  }, [startHour, endHour]);

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
                    console.log(leaveDaysCount);
                    setLeaveApplyObj({
                      ...leaveapplyObj,
                      leavetype: e.id,
                      available_count: e.available_count,
                    });
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
                    value={startHour}
                    options={{
                      enableTime: true,
                      dateFormat: "Y-m-d H:i",
                    }}
                    onChange={(selectedDates, dateStr, instance) => {
                      //setLeaveApplyObj({ ...leaveapplyObj, end: dateStr });
                      setStartHour(dateStr);

                      // handleDateChange(selectedDates, dateStr, instance);
                    }}
                  />
                  <span className="input-group-text">
                    {leaveHoursCount} Hours
                  </span>
                  <Flatpickr
                    className="form-control"
                    placeholder="End Hour"
                    value={endHour}
                    options={{
                      enableTime: true,
                      dateFormat: "Y-m-d H:i",
                    }}
                    onChange={(selectedDates, dateStr, instance) => {
                      //setLeaveApplyObj({ ...leaveapplyObj, end: dateStr });
                      setEndHour(dateStr);

                      // handleDateChange(selectedDates, dateStr, instance);
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
