import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Card,
  CardHeader,
  Col,
  Container,
  Input,
  Row,
} from "reactstrap";

import { MetaTitle } from "../../common/data/MetaTitle";
import TimeTracking from "./TimeTracking";
import AttendanceOverview from "./AttendanceOverview";
import AttendanceEmployeeTable from "../../component/common/table/AttendanceEmployeeTable";
import AttendanceTeamTable from "../../component/common/table/AttendanceTeamTable";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  setIndividualAttendanceReportData,
  setShowTeamTable,
} from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { Api } from "../../common/api/Api";
import AttendanceFilter from "./AttendanceFilter";

const AttendanceDashboard = () => {
  document.title = `Attendance Overview | ${MetaTitle}`;

  const dispatch = useDispatch();

  const { showTeamTable } = useSelector(
    (state) => state.AttendanceReportReducer
  );

  useEffect(() => {
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    Api({
      type: "GET",
      url: "attendance/get_attendance_entry_log/?thisMonth=" + thisMonth,
    })
      .then((res) => {
        dispatch(setIndividualAttendanceReportData(res?.data?.data));
      })
      .catch((err) => {
        console.log("Something Went Wrong !!");
      });
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Filter Card Start */}

          <AttendanceFilter />

          {/* Filter Card End */}

          <Row className="project-wrapper">
            <Col xxl={3} xl={3} sm={3}>
              <TimeTracking />
            </Col>
            {!showTeamTable && (
              <Col xxl={9} xl={9} sm={9}>
                <AttendanceOverview />
              </Col>
            )}
            {!showTeamTable && (
              <Col xxl={12}>
                <AttendanceEmployeeTable />
              </Col>
            )}
            {showTeamTable && (
              <Col xxl={12}>
                <AttendanceTeamTable />
              </Col>
            )}
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AttendanceDashboard;
