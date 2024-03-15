import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import CountUp from "react-countup";
import { AttendanceOverviewChart } from "./AttendanceOverviewChart";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const AttendanceOverview = () => {
  // Inside your component

  const ws_data = GetLocalStorageData("work_schedule") || [];

  const { individual_attendance_report_data } = useSelector(
    (state) => state.AttendanceReportReducer
  );

  const [chartData, setChartData] = useState({
    categories: [],
    series: [],
  });

  const [wsHours, setWsHours] = useState(0);
  const [checkInHours, setCheckInHours] = useState(0);
  const [otHours, setOtHours] = useState(0);
  const [paidHours, setPaidHours] = useState(0);
  const [leaveHours, setLeaveHours] = useState(0);
  const [balanceHours, setBalanceHours] = useState(0);

  useEffect(() => {
    if (!!individual_attendance_report_data) {
      console.log(
        "individual_attendance_report_data Overview = ",
        individual_attendance_report_data
      );

      let reversed_report_data =
        individual_attendance_report_data.slice().reverse() || [];

      console.log("reversed_report_data = ", reversed_report_data);

      let dates = [];

      let in_hours = [];
      let balance_hours = [];
      let holiday_hours = [];
      let leave_hours = [];
      let weekend_hours = [];
      let inactive_hours = [];

      let totalWsHours = 0;
      let totalCheckInHours = 0;
      let totalOtHours = 0;
      let totalPaidHours = 0;
      let totalLeaveHours = 0;
      let totalBalanceHours = 0;

      reversed_report_data.map((d) => {
        dates.push(format(new Date(d.date), "dd MMM"));

        let final_paid_hr_count = 0;
        let balance_hr_count = 0;
        let holiday_hours_count = 0;
        let weekend_hours_count = 0;
        let leave_hours_count = 0;
        let inactive_hours_count = 0;

        let daily_work_hour_duration_without_break =
          !!d.daily_work_hour_duration_without_break
            ? (d.daily_work_hour_duration_without_break / 3600).toFixed(1)
            : 0;

        if (d.is_present === true) {
          final_paid_hr_count =
            parseInt(d.final_paid_hr_in_seconds) === 0
              ? parseFloat((d.maximum_full_day_work_duration / 3600).toFixed(1))
              : parseFloat((d.final_paid_hr_in_seconds / 3600).toFixed(1));

          let balance_hours_diff =
            parseFloat(daily_work_hour_duration_without_break) -
            parseFloat(final_paid_hr_count);

          if (d.is_holiday === true || d.is_week_off === true) {
            balance_hr_count = 0;
          } else {
            balance_hr_count =
              parseFloat(balance_hours_diff) > 0 ? balance_hours_diff : 0;
          }

          holiday_hours_count = 0;
          weekend_hours_count = 0;
          leave_hours_count = 0;
          inactive_hours_count = 0;
        } else if (d.is_leave_approved === true) {
          final_paid_hr_count = 0;
          balance_hr_count = 0;
          holiday_hours_count = 0;
          weekend_hours_count = 0;
          inactive_hours_count = 0;
          leave_hours_count = d.maximum_full_day_work_duration;
        } else if (d.is_holiday === true) {
          final_paid_hr_count = 0;
          balance_hr_count = 0;
          holiday_hours_count = d.maximum_full_day_work_duration;
          weekend_hours_count = 0;
          leave_hours_count = 0;
          inactive_hours_count = 0;
        } else if (d.is_week_off === true) {
          console.log("Entered Week off");
          final_paid_hr_count = 0;
          balance_hr_count = 0;
          holiday_hours_count = 0;
          weekend_hours_count = d.maximum_full_day_work_duration;
          leave_hours_count = 0;
          inactive_hours_count = 0;
        } else if (d.leave_taken_without_approval === true) {
          final_paid_hr_count = 0;
          balance_hr_count = 0;
          holiday_hours_count = 0;
          weekend_hours_count = 0;
          leave_hours_count = 0;
          inactive_hours_count = d.maximum_full_day_work_duration;
        } else {
          final_paid_hr_count = 0;
          balance_hr_count = 0;
          holiday_hours_count = 0;
          weekend_hours_count = 0;
          leave_hours_count = 0;
          inactive_hours_count = d.maximum_full_day_work_duration;
        }

        in_hours.push(final_paid_hr_count);
        balance_hours.push(balance_hr_count);
        holiday_hours.push(holiday_hours_count);
        leave_hours.push(leave_hours_count);
        weekend_hours.push(weekend_hours_count);
        inactive_hours.push(inactive_hours_count);

        totalWsHours += parseInt(d.work_schedule_duration_without_break);
        totalCheckInHours += parseInt(d.final_checked_in_hr_in_seconds);
        totalOtHours += parseInt(d.final_ot_hr_in_seconds);
        totalPaidHours += parseInt(d.final_paid_hr_in_seconds);

        if (d.is_leave_approved === true) {
          totalLeaveHours += parseInt(d.daily_work_hour_duration_without_break);
        }

        let balance_hr_for_this_day =
          parseInt(d.work_schedule_duration_without_break) -
            parseInt(d.final_paid_hr_in_seconds) >
          0
            ? parseInt(d.work_schedule_duration_without_break) -
              parseInt(d.final_paid_hr_in_seconds)
            : 0;

        totalBalanceHours += balance_hr_for_this_day;
      });

      let series = [
        {
          name: "IN Hour",
          data: in_hours,
        },
        {
          name: "Balance Hour",
          data: balance_hours,
        },
        {
          name: "Holiday",
          data: holiday_hours,
        },
        {
          name: "Leave",
          data: leave_hours,
        },
        {
          name: "Weekend",
          data: weekend_hours,
        },
        {
          name: "Inactive",
          data: inactive_hours,
        },
      ];

      setWsHours(totalWsHours);
      setCheckInHours(totalCheckInHours);
      setOtHours(totalOtHours);
      setPaidHours(totalPaidHours);
      setLeaveHours(totalLeaveHours);
      setBalanceHours(totalBalanceHours);

      setChartData({
        ...chartData,
        categories: dates,
        series: series,
      });
    }
  }, [individual_attendance_report_data]);

  return (
    <React.Fragment>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="p-0 border-0 bg-light-subtle mt-2">
              <Row className="g-0 text-center">
                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="51">
                        <CountUp
                          start={0}
                          end={String(Math.floor(wsHours / 3600)).padStart(
                            2,
                            "0"
                          )}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>

                      {Math.floor((wsHours % 3600) / 60) > 0 && (
                        <>
                          {" "}
                          <span className="counter-value" data-target="51">
                            <CountUp
                              start={0}
                              end={String(
                                Math.floor((wsHours % 3600) / 60)
                              ).padStart(2, "0")}
                              suffix=" Min"
                              separator={""}
                              duration={3}
                            />
                          </span>
                        </>
                      )}
                    </h5>
                    <p className="text-muted mb-0">Work Schedule</p>
                  </div>
                </Col>
                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="51">
                        <CountUp
                          start={0}
                          end={String(Math.floor(checkInHours / 3600)).padStart(
                            2,
                            "0"
                          )}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>

                      {Math.floor((checkInHours % 3600) / 60) > 0 && (
                        <>
                          {" "}
                          <span className="counter-value" data-target="51">
                            <CountUp
                              start={0}
                              end={String(
                                Math.floor((checkInHours % 3600) / 60)
                              ).padStart(2, "0")}
                              suffix=" Min"
                              separator={""}
                              duration={3}
                            />
                          </span>
                        </>
                      )}
                    </h5>
                    <p className="text-muted mb-0">Check IN Hours</p>
                  </div>
                </Col>
                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="51">
                        <CountUp
                          start={0}
                          end={String(Math.floor(otHours / 3600)).padStart(
                            2,
                            "0"
                          )}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>

                      {Math.floor((otHours % 3600) / 60) > 0 && (
                        <>
                          {" "}
                          <span className="counter-value" data-target="51">
                            <CountUp
                              start={0}
                              end={String(
                                Math.floor((otHours % 3600) / 60)
                              ).padStart(2, "0")}
                              suffix=" Min"
                              separator={""}
                              duration={3}
                            />
                          </span>
                        </>
                      )}
                    </h5>
                    <p className="text-muted mb-0">OT Hours</p>
                  </div>
                </Col>

                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="51">
                        <CountUp
                          start={0}
                          end={String(Math.floor(paidHours / 3600)).padStart(
                            2,
                            "0"
                          )}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>

                      {Math.floor((paidHours % 3600) / 60) > 0 && (
                        <>
                          {" "}
                          <span className="counter-value" data-target="51">
                            <CountUp
                              start={0}
                              end={String(
                                Math.floor((paidHours % 3600) / 60)
                              ).padStart(2, "0")}
                              suffix=" Min"
                              separator={""}
                              duration={3}
                            />
                          </span>
                        </>
                      )}
                    </h5>
                    <p className="text-muted mb-0">Paid Hours</p>
                  </div>
                </Col>

                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="51">
                        <CountUp
                          start={0}
                          end={String(Math.floor(leaveHours / 3600)).padStart(
                            2,
                            "0"
                          )}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>

                      {Math.floor((leaveHours % 3600) / 60) > 0 && (
                        <>
                          {" "}
                          <span className="counter-value" data-target="51">
                            <CountUp
                              start={0}
                              end={String(
                                Math.floor((leaveHours % 3600) / 60)
                              ).padStart(2, "0")}
                              suffix=" Min"
                              separator={""}
                              duration={3}
                            />
                          </span>
                        </>
                      )}
                    </h5>
                    <p className="text-muted mb-0">Leave Hours</p>
                  </div>
                </Col>

                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0 border-end-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="51">
                        <CountUp
                          start={0}
                          end={String(Math.floor(balanceHours / 3600)).padStart(
                            2,
                            "0"
                          )}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>

                      {Math.floor((balanceHours % 3600) / 60) > 0 && (
                        <>
                          {" "}
                          <span className="counter-value" data-target="51">
                            <CountUp
                              start={0}
                              end={String(
                                Math.floor((balanceHours % 3600) / 60)
                              ).padStart(2, "0")}
                              suffix=" Min"
                              separator={""}
                              duration={3}
                            />
                          </span>
                        </>
                      )}
                    </h5>
                    <p className="text-muted mb-0">Balance Hours</p>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody className="p-0 pb-2">
              <div>
                <div dir="ltr" className="apex-charts">
                  <AttendanceOverviewChart
                    dataColors='["--vz-success", "--vz-primary", "--vz-info", "--vz-warning", "--vz-orange", "--vz-danger"]'
                    chartData={chartData}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default AttendanceOverview;
