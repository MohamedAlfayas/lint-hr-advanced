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
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { profile_data } from "../../redux/reducers/ChildReducer/MyProfileReducer";
import { setEmployeeLeaveType } from "../../redux/reducers/ChildReducer/EmployeeLeaveReducer";
import { BuildAttendanceReportChart } from "../../common/js/BuildAttendanceReportChart";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const AttendanceDashboard = () => {
  document.title = `Attendance Overview | ${MetaTitle}`;

  const dispatch = useDispatch();

  const [userData, setUserData] = useState();

  const { showLoader } = useSelector((state) => state.LoaderReducer);

  const { profile_data } = useSelector((state) => state.MyProfileReducer);

  const { showTeamTable } = useSelector(
    (state) => state.AttendanceReportReducer,
  );
  const show_attendance_timer = useSelector(
    (state) => state.ClockReducer.show_attendance_timer,
  );

  // const department_data = GetLocalStorageData("department");
  const department_data = GetLocalStorageData("department") || [];
  console.log("department_data =", department_data);
  console.log("profile_data =", profile_data);

  const [hideTimer, setHideTimer] = useState(false);

  // const emp_department = profile_data.primary_department_id_list
  //   ? department_data.filter((d) =>
  //       (profile_data?.primary_department_id_list).includes(d.id),
  //     )
  //   : [];

  const emp_department =
    Array.isArray(department_data) &&
    Array.isArray(profile_data?.primary_department_id_list)
      ? department_data.filter((d) =>
          profile_data.primary_department_id_list.includes(d.id)
        )
      : [];

  useEffect(() => {
    dispatch(setLoaderVisible(true));
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    Api({
      type: "GET",
      url: "attendance/get_attendance_entry_log/v2/?thisMonth=" + thisMonth,
    })
      .then((res) => {
        dispatch(setIndividualAttendanceReportData(res?.data?.data));
        BuildAttendanceReportChart(res?.data?.data, dispatch);
        dispatch(setShowTeamTable(false));
        ResetLoaderVisible();
      })
      .catch((err) => {
        console.log("Something Went Wrong !!");
        ResetLoaderVisible();
      });

    // if (profile_data.length > 0) {
    //   const isMobileCheckinAllowed = profile_data.can_web_checkin || false;

    //   setHideTimer(isMobileCheckinAllowed);
    // }

    if (profile_data?.id) {
      const isMobileCheckinAllowed =
        profile_data?.can_web_checkin || false;

      setHideTimer(isMobileCheckinAllowed);
    }
  }, []);

  const ResetLoaderVisible = () => {
    setTimeout(() => {
      dispatch(setLoaderVisible(false));
    }, 1000);
  };

  useEffect(() => {
    if (profile_data && profile_data?.id) {
      Api({
        type: "GET",
        url: `leave/get-leave-type-details-for-employee/?employee_id=${profile_data.id}`,
      })
        .then((res) => {
          dispatch(setEmployeeLeaveType(res?.data?.data));
        })
        .catch((err) => {
          console.log("Something Went Wrong!!!");
        });
    }
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Filter Card Start */}
          <div style={{ zIndex: 1000, position: "relative" }}>
            <AttendanceFilter />
          </div>
          {/* Filter Card End */}

          <Row className="project-wrapper align-items-stretch">
            {!showTeamTable && show_attendance_timer && (
              <Col xxl={3} xl={4} lg={4} md={5} sm={12} xs={12} className="d-flex">
                <TimeTracking hideTimer={hideTimer} />
              </Col>
            )}
            {!showTeamTable && (
              <Col
                xxl={show_attendance_timer ? 9 : 12}
                xl={show_attendance_timer ? 8 : 12}
                lg={show_attendance_timer ? 8 : 12}
                md={show_attendance_timer ? 7 : 12}
                sm={12}
                xs={12}
                className="d-flex"
              >
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
