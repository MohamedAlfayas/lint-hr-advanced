import axios from "axios";
import { FilePond } from "filepond";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Col, Form, Input, FormFeedback, Label, Row } from "reactstrap";
import Select from "react-select";
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  addLeaveApplication,
  editLeaveApplication,
} from "../../redux/reducers/ChildReducer/LeaveApplyReducer";
import {
  ConvertDateFormat,
  ConvertISODateFormat,
  ConvertDayNameFromISO,
  convertFromToDateFormat,
  convertDate,
  convertDateTimeFormat,
  timeConvert,
  DateFormated,
  // ConvertDateFormat,
} from "../../common/js/ConvertDateFormat";
import Flatpickr from "react-flatpickr";
import {
  single_day_type_leave,
  multiple_day_type_leave,
  leave_type_day_unit,
  leave_type_hour_unit,
  day_type,
} from "../../common/constant/Constants";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import { toast } from "react-toastify";
import { DatePicker, Space } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DateFormat, DateTimeFormat } from "../../common/constant/Constants";
dayjs.extend(customParseFormat);

const ApplyLeaveForm = () => {
  const dispatch = useDispatch();
  const [leaveapplyObj, setLeaveApplyObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [multipleDayStartDate, setMultipleDayStartDate] = useState(null);
  const [multipleDayEndDate, setMultipleDayEndDate] = useState(null);

  const { RangePicker } = DatePicker;

  const [daysCount, setDaysCount] = useState("");
  const [selectedLeaveTypeObj, setSelectedLeaveTypeObj] = useState({});

  const [WeekOffDays, setWeekOffDays] = useState([]);

  const [HolidayDays, setHolidayDays] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [hourDiff, setHourDiff] = useState(null);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const workScheduleData = GetLocalStorageData("work_schedule") || [];
  const profileData = GetLocalStorageData("my_profile") || [];
  const holidayData = GetLocalStorageData("holiday") || [];
  const leaveType = GetLocalStorageData("leave_types_for_employee") || [];

  useEffect(() => {
    console.log("leaveapplyObj = ", leaveapplyObj);
  }, [leaveapplyObj]);

  useEffect(() => {
    if (!!form_obj) {
      console.log("Form Obj = ", form_obj);
      setLeaveApplyObj({
        ...form_obj,
        start: ConvertISODateFormat(form_obj.start),
        end: ConvertISODateFormat(form_obj.end),
      });
      // setStart(dayjs(form_obj.start, "YYYY-MM-DD"));
      // setEnd(dayjs(form_obj.end, "YYYY-MM-DD"));
      // setFromDate(convertDateTimeFormat(form_obj.start));.
      // setToDate(convertDateTimeFormat(form_obj.end));
      console.log("thisEmpWS", thisEmpWS);

      !!thisEmpWS &&
        setWeekOffDays(
          thisEmpWS.workday

            .map((d) => {
              if (d.is_day_on === false) {
                return d.day_id;
              }
              return null;
            })
            .filter((day_id) => day_id !== null)
        );

      setHolidayDays(holidayData.map((d) => d?.date));

      if (form_obj?.leave_type !== 0) {
        let thisLeaveTypeObj = leaveType.find(
          (d) => d.id === form_obj?.leave_type
        );
        handleStartEndDatesChange(thisLeaveTypeObj);
      }
    }
  }, [form_obj]);

  useEffect(() => {
    setHourDiff(timeConvert(form_obj.requested_leave_count));
    setDaysCount(form_obj.requested_leave_count);
  }, [form_obj]);

  const handleLeaveTypeChange = (e) => {
    let leave_type_obj = leaveType.find((d) => d.id === e.id);

    handleStartEndDatesChange(leave_type_obj);
  };

  const thisEmpWS = workScheduleData?.find(
    (val) => val.id === profileData.work_schedule_id
  );

  const handleStartEndDatesChange = (leave_type_obj) => {
    console.log("Leave Type Obj = ", leave_type_obj);

    leave_type_obj?.weekend_between_leave === true
      ? setWeekOffDays([])
      : !!thisEmpWS &&
        setWeekOffDays(
          thisEmpWS.workday

            .map((d) => {
              if (d.is_day_on === false) {
                return d.day_id;
              }
              return null;
            })
            .filter((day_id) => day_id !== null)
        );

    leave_type_obj?.holiday_between_leave === true
      ? setHolidayDays([])
      : setHolidayDays(holidayData.map((d) => d?.date));

    setSelectedLeaveTypeObj(leave_type_obj);
    setLeaveApplyObj((prev) => {
      return {
        ...prev,
        leave_type: leave_type_obj?.id,
        start: null,
        end: null,
      };
    });
    setHourDiff("");
    setDaysCount("");
  };

  const handleMultiDayChange = (dates, dateStrings, daysCount) => {
    const generateIntermediaryDates = () => {
      const start = new Date(
        ConvertISODateFormat(ConvertDateFormat(dateStrings[0]))
      );
      const end = new Date(
        ConvertISODateFormat(ConvertDateFormat(dateStrings[1]))
      );
      const dates = [];
      while (start <= end) {
        dates.push(start.toISOString().split("T")[0]);
        start.setDate(start.getDate() + 1);
      }
      return dates;
    };

    const intermediateDates = generateIntermediaryDates() || [];
    const ValidDays = intermediateDates.filter((d) => {
      if (
        !WeekOffDays.includes(new Date(d).getDay()) &&
        !HolidayDays.includes(d)
      ) {
        return d;
      }
    });

    console.log("validDays", ValidDays);

    const ValidDaysCount = ValidDays.length;
    setDaysCount(ValidDaysCount);

    setLeaveApplyObj({
      ...leaveapplyObj,
      start: ConvertISODateFormat(ConvertDateFormat(dateStrings[0])),
      end: ConvertISODateFormat(ConvertDateFormat(dateStrings[1])),
      requested_leave_count: ValidDaysCount,
      day_type: 1,
      in_between_dates: day_type === 1 ? ValidDays : [],
    });
  };

  const disabledDate = (current) => {
    const dayOfWeek = current.day();
    return (
      WeekOffDays.includes(dayOfWeek) ||
      HolidayDays.map((d) => ConvertDateFormat(d)).includes(
        current.format("DD-MM-YYYY")
      )
    );
  };

  const handleInputChange = (e) => {
    console.log("Input Change = ", e);
    const { name, value } = e.target;
    setLeaveApplyObj({
      ...leaveapplyObj,
      [name]: value,
    });
  };

  const handleDayType = (e) => {
    const value = e?.value || null;
    let updatedDaysCount;
    if (value === 1) {
      updatedDaysCount = 1;
    } else if (value === 2) {
      updatedDaysCount = 0.5;
    } else {
      updatedDaysCount = 0;
    }
    setLeaveApplyObj({
      ...leaveapplyObj,
      day_type: value,
      requested_leave_count: value === 1 ? 1 : value === 2 ? 0.5 : 0,
    });
    setDaysCount(updatedDaysCount);
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
    calculateHourDiff(date, toDate);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    if (date && fromDate && date.isBefore(fromDate)) {
      toast.error("Selected end date cannot be less than the start date");
    } else {
      calculateHourDiff(fromDate, date);
    }
  };

  const calculateHourDiff = (start, end) => {
    if (start && end) {
      let diffInMilliseconds;
      if (start > end) {
        const midnight = new Date(start);
        midnight.setHours(24, 0, 0, 0);
        diffInMilliseconds = midnight - start + end - midnight;
      } else {
        diffInMilliseconds = end - start;
      }
      const hours = diffInMilliseconds / (1000 * 60 * 60);
      const roundedMinutes = Math.round((hours * 60) / 30) * 30;
      const roundedHours = Math.floor(roundedMinutes / 60);
      const remainingMinutes = roundedMinutes % 60;
      const formattedResult = `${String(roundedHours).padStart(
        2,
        "0"
      )}:${String(remainingMinutes).padStart(2, "0")}`;
      const formattedResultForSetting = roundedHours + remainingMinutes / 60;
      setHourDiff(formattedResult);
      setLeaveApplyObj({
        ...leaveapplyObj,
        start: start.format("YYYY-MM-DD HH:mm:00"),
        end: end.format("YYYY-MM-DD HH:mm:00"),
        requested_leave_count: formattedResultForSetting,
        day_type: 1,
      });
    }
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: leaveapplyObj,
    validationSchema: Yup.object({
      leave_type: Yup.number()
        .required("Select Leave Type")
        .min(1, "Please Select Leave Type"),
    }),
    onSubmit: async (values) => {
      console.log("SUCCESSSS !!!! Formik Values = ", values);
      dispatch(setLoaderVisible(true));
      const Api = await PostApi(
        "leave/leave-application/create/",
        values,
        false
      );
      console.log("API RES = ", Api);
      if (Api.status && Api.status === 200) {
        leaveapplyObj.id === 0
          ? dispatch(addLeaveApplication(Api?.data.data))
          : dispatch(editLeaveApplication(Api?.data?.data));
        dispatch(toggleRSBView(false));
        toast.success(Api?.data?.message);
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail);
      }

      dispatch(setLoaderVisible(false));
    },
  });

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form onSubmit={FormikForm.handleSubmit} action="javascript:void(0)">
            <Row className="g-3">
              <Col lg={12}>
                <div className="mb-3">
                  <Label>Type *</Label>
                  <Select
                    name="leave_type"
                    isMulti={false}
                    options={leaveType || []}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor:
                          !state.isFocused &&
                          FormikForm.touched.leave_type &&
                          FormikForm.errors.leave_type
                            ? "red !important"
                            : provided.borderColor,
                      }),
                    }}
                    value={
                      leaveapplyObj?.leave_type
                        ? leaveType.find(
                            (d) => d.id === leaveapplyObj?.leave_type
                          )
                        : []
                    }
                    onChange={handleLeaveTypeChange}
                    placeholder="Select Leave Type"
                    className="basic-multi-select"
                    invalid={
                      FormikForm.touched.leave_type &&
                      FormikForm.errors.leave_type
                        ? true
                        : false
                    }
                  />
                  {FormikForm.touched.leave_type &&
                  FormikForm.errors.leave_type ? (
                    <div className="lc_form_error_text">
                      {FormikForm.errors.leave_type}
                    </div>
                  ) : null}
                </div>
                {!FormikForm.errors.leave_type &&
                  FormikForm.errors.leave_type === "" && (
                    <div id="passwordHelpBlock" className="form-text">
                      Please select type of leave.
                    </div>
                  )}

                {!!selectedLeaveTypeObj?.balance_leave_count && (
                  <>
                    {selectedLeaveTypeObj?.balance_leave_count}{" "}
                    {selectedLeaveTypeObj?.unit === leave_type_day_unit
                      ? "Days"
                      : "Hours"}{" "}
                    Remaining
                  </>
                )}
              </Col>
              {!!selectedLeaveTypeObj?.unit &&
                selectedLeaveTypeObj?.unit === leave_type_day_unit && (
                  <Col lg={12}>
                    <div className="input-group">
                      <Label className="form-label">Select Date</Label>
                      <RangePicker
                        name="multiple_date"
                        format={"DD-MM-YYYY"}
                        placeholder={["Start Date", "End Date"]}
                        disabledDate={disabledDate}
                        onChange={handleMultiDayChange}
                        // value={
                        //   ConvertDateFormat(
                        //     ConvertISODateFormat([
                        //       leaveapplyObj.start,
                        //       leaveapplyObj.end,
                        //     ])
                        //   ) || null
                        // }
                      />
                      <span className="input-group-text">{daysCount} Days</span>
                    </div>
                    {(daysCount === 1 || daysCount === 0.5) && (
                      <div className="input-group">
                        <Label className="form-label">Select Day Type</Label>

                        <Select
                          name="day_type"
                          isMulti={false}
                          options={day_type || []}
                          placeholder="Select Day Type"
                          className="basic-multi-select"
                          value={
                            leaveapplyObj?.day_type
                              ? day_type.find(
                                  (d) => d.id === leaveapplyObj?.day_type
                                )
                              : []
                          }
                          onChange={handleDayType}
                        />
                      </div>
                    )}

                    <div id="passwordHelpBlock" className="form-text">
                      Please select Start & End Date
                    </div>
                  </Col>
                )}

              {!!selectedLeaveTypeObj?.unit &&
                selectedLeaveTypeObj?.unit === leave_type_hour_unit && (
                  <Col lg={12}>
                    <div className="input-group">
                      <Label className="form-label">Select Hour</Label>
                      <Label className="form-label">From</Label>

                      <DatePicker
                        name="start"
                        showTime={{ minuteStep: 30 }}
                        format={"DD-MM-YYYY HH:mm"}
                        disabledDate={disabledDate}
                        onChange={handleFromDateChange}
                        // value={
                        //   convertDateTimeFormat(leaveapplyObj.start) || null
                        // }
                      />
                      <Label className="form-label">To</Label>

                      <DatePicker
                        name="end"
                        showTime={{ minuteStep: 30 }}
                        format={"DD-MM-YYYY HH:mm"}
                        disabledDate={disabledDate}
                        onChange={handleToDateChange}
                        // value={convertDateTimeFormat(leaveapplyObj.end) || null}
                      />

                      <span className="input-group-text">{hourDiff} h</span>
                    </div>
                    <div id="passwordHelpBlock" className="form-text">
                      Please select Date and Hour
                    </div>
                  </Col>
                )}

              <Col lg={12}>
                <label htmlFor="reason" className="form-label">
                  Reason *
                </label>
                <textarea
                  name="reason"
                  className="form-control"
                  id="reason"
                  placeholder="Enter Reason"
                  value={leaveapplyObj?.reason || ""}
                  onChange={handleInputChange}
                />
              </Col>
              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label" type="submit">
                    {" "}
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Apply{" "}
                  </Button>{" "}
                </div>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ApplyLeaveForm;
