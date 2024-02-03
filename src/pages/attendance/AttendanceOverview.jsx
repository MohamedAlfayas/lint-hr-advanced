import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import CountUp from "react-countup";
import { AttendanceOverviewChart } from "./AttendanceOverviewChart";
import { useSelector } from "react-redux";
import { format } from "date-fns";

const AttendanceOverview = () => {
  // Inside your component

  const { individual_attendance_report_data } = useSelector(
    (state) => state.AttendanceReportReducer
  );

  const [chartData, setChartData] = useState({
    categories: [],
    series: [],
  });

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

      reversed_report_data.map((d) => {
        console.log("DATE = ", d);

        dates.push(format(new Date(d.date), "dd MMM"));

        let final_paid_hr_count = 0;
        let balance_hr_count = 0;
        let holiday_hours_count = 0;
        let weekend_hours_count = 0;
        let leave_hours_count = 0;

        let work_schedule_duration = !!d.work_schedule_duration
          ? (d.work_schedule_duration / 3600).toFixed(1)
          : 0;

        if (d.is_present === true) {
          final_paid_hr_count = parseFloat(
            (d.final_paid_hr_in_seconds / 3600).toFixed(1)
          );
          let balance_hours_diff =
            parseFloat(work_schedule_duration) -
            parseFloat(final_paid_hr_count);

          balance_hr_count =
            parseFloat(balance_hours_diff) > 0 ? balance_hours_diff : 0;

          holiday_hours_count = 0;
          weekend_hours_count = 0;
          leave_hours_count = 0;
        } else if (d.is_holiday === true) {
          final_paid_hr_count = 0;
          balance_hr_count = 0;
          holiday_hours_count = work_schedule_duration;
          weekend_hours_count = 0;
          leave_hours_count = 0;
        } else if (d.is_week_off === true) {
          final_paid_hr_count = 0;
          balance_hr_count = 0;
          holiday_hours_count = 0;
          weekend_hours_count = work_schedule_duration;
          leave_hours_count = 0;
        } else {
          final_paid_hr_count = 0;
          balance_hr_count = 0;
          holiday_hours_count = 0;
          weekend_hours_count = 0;
          leave_hours_count = work_schedule_duration;
        }

        in_hours.push(final_paid_hr_count);
        balance_hours.push(balance_hr_count);
        holiday_hours.push(holiday_hours_count);
        leave_hours.push(leave_hours_count);
        weekend_hours.push(weekend_hours_count);
      });

      console.log("Dates = ", dates);
      console.log("IN Hours = ", in_hours);
      console.log("Balance Hours = ", balance_hours);
      console.log("holiday Hours = ", holiday_hours);
      console.log("Leave Hours = ", leave_hours);
      console.log("Weekend Hours = ", weekend_hours);

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
      ];

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
                          end={51}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">Work Schedule</p>
                  </div>
                </Col>
                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="18">
                        <CountUp
                          start={0}
                          end={18}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">Check IN Hours</p>
                  </div>
                </Col>
                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="0">
                        <CountUp
                          start={0}
                          end={0}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">OT Hours</p>
                  </div>
                </Col>

                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="18">
                        <CountUp
                          start={0}
                          end={18}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">Paid Hours</p>
                  </div>
                </Col>

                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="18">
                        <CountUp
                          start={0}
                          end={18}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">Paid Hours</p>
                  </div>
                </Col>

                <Col xs={4} sm={2}>
                  <div className="p-2 border border-dashed border-start-0 border-end-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="33">
                        <CountUp
                          start={0}
                          end={-33}
                          suffix=" Hr"
                          separator={""}
                          duration={3}
                        />
                      </span>
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
                    dataColors='["--vz-success", "--vz-primary", "--vz-info", "--vz-danger", "--vz-light"]'
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
