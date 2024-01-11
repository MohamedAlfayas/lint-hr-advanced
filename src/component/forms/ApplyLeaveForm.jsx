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
  // ConvertDateFormat,
} from "../../common/js/ConvertDateFormat";
import Flatpickr from "react-flatpickr";
import {
  single_day_type_leave,
  multiple_day_type_leave,
  leave_type_day_unit,
  leave_type_hour_unit,
  leave_day_type,
} from "../../common/constant/Constants";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import { toast } from "react-toastify";
import { DatePicker, Space } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DateFormat } from "../../common/constant/Constants";
dayjs.extend(customParseFormat);

const ApplyLeaveForm = () => {
  const dispatch = useDispatch();
  const [leaveapplyObj, setLeaveApplyObj] = useState({});
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [multipleDayStartDate, setMultipleDayStartDate] = useState(null);
  const [multipleDayEndDate, setMultipleDayEndDate] = useState(null);
  const [selectedSingleDate, setselectedSingleDate] = useState(null);

  const { RangePicker } = DatePicker;

  const [totalMinutes, setTotalMinutes] = useState("");
  const [daysCount, setDaysCount] = useState("");
  const [selectedLeaveTypeObj, setSelectedLeaveTypeObj] = useState({});

  const [WeekOffDays, setWeekOffDays] = useState([]);

  const [HolidayDays, setHolidayDays] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [hourDiff, setHourDiff] = useState(null);

  useEffect(() => {
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
  }, []);

  const handleLeaveTypeChange = (e) => {
    let leave_type_obj = leaveType.find((d) => d.id === e.id);

    console.log("leave_type_obj = ", leave_type_obj);

    leave_type_obj?.weekend_between_leave === true
      ? setWeekOffDays([])
      : setWeekOffDays(
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
    setLeaveApplyObj({
      ...leaveapplyObj,
      leave_type: e.id,
    });
    setHourDiff("");
    setDaysCount("");
    setMultipleDayStartDate(null);
    setMultipleDayEndDate(null);
    setFromDate("");
    setToDate("");
  };

  useEffect(() => {
    let start_date = !!form_obj?.start
      ? ConvertISODateFormat(form_obj.start)
      : null;
    let selectedSingleDate = !!form_obj?.start
      ? ConvertDateFormat(ConvertISODateFormat(form_obj?.start))
      : null;

    setLeaveApplyObj({
      ...form_obj,
      start: start_date,
    });
    setselectedSingleDate(selectedSingleDate);
  }, [form_obj]);

  const handleDateSelected = (date, dateString) => {
    setselectedSingleDate(dateString);
    setLeaveApplyObj({
      ...leaveapplyObj,
      start: ConvertISODateFormat(ConvertDateFormat(dateString)),
      end: ConvertISODateFormat(ConvertDateFormat(dateString)),
    });
    if (leaveapplyObj.available_count <= totalMinutes) {
      toast.error("Selected Leave Exceeding Available Leave Hours ");
    }
  };

  useEffect(() => {
    if (!!selectedSingleDate) {
      const dayName = dayjs(
        ConvertISODateFormat(ConvertDateFormat(selectedSingleDate))
      ).format("dddd");
      getHourMinData(dayName);
    }
  }, [selectedSingleDate]);

  const workScheduleData = GetLocalStorageData("work_schedule") || [];
  const profileData = GetLocalStorageData("my_profile") || [];
  const holidayData = GetLocalStorageData("holiday") || [];
  const leaveType = GetLocalStorageData("leave_types_for_employee") || [];

  const holiday = holidayData.map((d) => d.date);

  const thisEmpWS = workScheduleData?.find(
    (val) => val.id === profileData.work_schedule_id
  );

  const handleMultiDayChange = (dates, dateStrings) => {
    const generateIntermediaryDates = () => {
      const start = new Date(
        ConvertISODateFormat(ConvertDateFormat(dateStrings[0]))
      );
      setMultipleDayStartDate(dateStrings[0]);
      const end = new Date(
        ConvertISODateFormat(ConvertDateFormat(dateStrings[1]))
      );
      setMultipleDayEndDate(dateStrings[1]);
      const dates = [];

      while (start <= end) {
        dates.push(start.toISOString().split("T")[0]);
        start.setDate(start.getDate() + 1);
      }

      return dates;
    };

    const intermediateDates = generateIntermediaryDates() || [];

    const ValidDays = intermediateDates.filter((d) => {
      console.log("HolidayDays", HolidayDays);
      if (
        !WeekOffDays.includes(new Date(d).getDay()) &&
        !HolidayDays.includes(d)
      ) {
        return d;
      }
    });
    console.log("valid Days", ValidDays);

    const multipleDayName = ValidDays.map((d) => {
      const date = new Date(d);
      const days = { weekday: "long" };
      const daysName = date.toLocaleDateString("en-US", days);
      return daysName;
    });

    let totalWorkDuration = 0;
    multipleDayName.forEach((dayNames) => {
      if (thisEmpWS && thisEmpWS.workday && Array.isArray(thisEmpWS.workday)) {
        const matchingDay = thisEmpWS.workday.find(
          (day) => day.weekday.toLowerCase() === dayNames.toLowerCase()
        );

        if (matchingDay) {
          totalWorkDuration += matchingDay.total_work_duration;
        }
      }
    });

    const ValidDaysCount = ValidDays.length;
    setDaysCount(ValidDaysCount);
    if (leaveapplyObj.available_count <= totalWorkDuration) {
      toast.error("Selected Leave Exceeding Available Leave Hours ");
    }
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
    const { name, value } = e.target;
    setLeaveApplyObj({
      ...leaveapplyObj,
      [name]: value,
    });
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
    calculateHourDiff(date, toDate);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    calculateHourDiff(fromDate, date);
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
      setHourDiff(formattedResult);
    }
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: leaveapplyObj,
    validationSchema: Yup.object({
      leave_type: Yup.number()
        .required("Select Leave Type")
        .min(1, "Please Select Leave Type"),
      reason: Yup.string().required("Please enter reason for leave."),
    }),
    onSubmit: async (values) => {
      console.log("SUCCESSSS !!!! Formik Values = ", values);
      if (leaveapplyObj.available_count <= totalMinutes) {
        toast.error("Selected Leave Exceeding Available Leave Hours ");
      }
      // dispatch(setLoaderVisible(true));
      // let data;
      // if (values.unit === 2) {
      //   data = {
      //     id: 0,
      //     leave_type: values.leavetype,
      //     start: selectedMultipleDayStartDateTime,
      //     end: selectedMultipleDayEndDateTime,
      //     day_type: 1,
      //     requested_leave_count: leaveHours,
      //     reason: values.reason,
      //     status: 1,
      //   };
      // } else {
      //   data = {
      //     id: 0,
      //     leave_type: values.leavetype,
      //     start: startingDate,
      //     end: endingDate,
      //     day_type: 2,
      //     requested_leave_count: leaveCount,
      //     reason: values.reason,
      //     status: 1,
      //   };
      // }

      // const Api = await PostApi("leave/leave-application/create/", data, false);
      // console.log("API RES = ", Api);
      // if (Api.status && Api.status === 200) {
      //   leaveapplyObj.id === 0
      //     ? dispatch(addLeaveApplication(Api?.data.data))
      //     : dispatch(editLeaveApplication(Api?.data?.data));
      //   dispatch(toggleRSBView(false));
      //   toast.success(Api?.data?.message);
      // } else {
      //   toast.error(Api?.data?.message || Api?.data?.detail);
      // }

      // dispatch(setLoaderVisible(false));
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
                      : "Hr"}{" "}
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
                      />
                      <span className="input-group-text">{daysCount} Days</span>
                    </div>
                    {daysCount === 1 && (
                      <div className="input-group">
                        <Label className="form-label">Select Day Type</Label>

                        <Select
                          name="leavae_day_type"
                          isMulti={false}
                          options={leave_day_type || []}
                          placeholder="Select Day Type"
                          className="basic-multi-select"
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
                        showTime={{ minuteStep: 30 }}
                        format="DD-MM-YYYY HH:mm"
                        disabledDate={disabledDate}
                        onChange={handleFromDateChange}
                      />
                      <Label className="form-label">To</Label>

                      <DatePicker
                        showTime={{ minuteStep: 30 }}
                        format="DD-MM-YYYY HH:mm"
                        disabledDate={disabledDate}
                        onChange={handleToDateChange}
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
                <Input
                  type="textarea"
                  name="reason"
                  className="form-control"
                  id="description"
                  placeholder="Enter Reason"
                  value={leaveapplyObj.reason || ""}
                  onChange={handleInputChange}
                  invalid={
                    FormikForm.touched.reason && FormikForm.errors.reason
                      ? true
                      : false
                  }
                />
                {FormikForm.touched.reason && FormikForm.errors.reason ? (
                  <FormFeedback type="invalid">
                    {FormikForm.errors.reason}
                  </FormFeedback>
                ) : null}

                {!FormikForm.errors.reason && (
                  <div id="passwordHelpBlock" className="form-text">
                    Please enter reason for leave.
                  </div>
                )}
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
