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
import Select from "react-select";
import TimeTracking from "./TimeTracking";
import AttendanceOverview from "./AttendanceOverview";
import AttendanceEmployeeTable from "../../component/common/table/AttendanceEmployeeTable";
import { hr_status } from "../../common/constant/Constants";
import AttendanceTeamTable from "../../component/common/table/AttendanceTeamTable";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setAttendanceReportData } from "../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { Api } from "../../common/api/Api";

const AttendanceDashboard = () => {
  document.title = `Attendance Overview | ${MetaTitle}`;

  const dispatch = useDispatch();

  const initialFilterKeys = useMemo(() => {
    return {
      date_range: "",
      status: "",
      record: "",
      type: "",
      employee: "",
    };
  }, []);

  const [filterKeys, setFilterKeys] = useState(initialFilterKeys);

  useEffect(() => {
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    console.log("thisMonth = ", thisMonth);

    Api({
      type: "GET",
      url: "attendance/get_attendance_entry_log/?thisMonth=" + thisMonth,
    })
      .then((res) => {
        dispatch(setAttendanceReportData(res?.data?.data));
      })
      .catch((err) => {
        console.log("Something Went Wrong !!");
      });
  }, []);

  // Column
  const additionalColumn = [
    {
      Header: "Leave Type",
      filterable: false,
      id: "name",
      accessor: (obj) => {
        let typeName = leavetypes.map((type, i) =>
          obj.leavetype == type.id ? type.name : ""
        );

        return <b>{typeName}</b>;
      },
    },
    {
      Header: "Reason",
      accessor: "reason",
      filterable: false,
      id: "reason",
    },
    {
      Header: "Date",
      id: "Date",
      filterable: false,
      accessor: (obj) => {
        return (
          <>
            {obj.start} To {obj.end}
          </>
        );
      },
    },
    {
      Header: "Total",
      filterable: false,
      id: "Total",
      accessor: (obj) => {
        let leaveUnit = leavetypes.map((type, i) =>
          obj.leavetype == type.id ? type.type : ""
        );
        return (
          <b>
            {obj.total} {leaveUnit}{" "}
          </b>
        );
      },
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        let status =
          obj.status == 1 ? "Pending" : obj.status == 2 ? "Approved" : "Cancel";
        let statusClass =
          obj.status == 1 ? "warning" : obj.status == 2 ? "success" : "danger";
        return (
          <span
            className={`badge text-uppercase bg-${statusClass}-subtle text-${statusClass}`}
          >
            {" "}
            {status}{" "}
          </span>
        );
      },
    },
  ];

  const initialFormObj = useMemo(() => {
    return {
      id: 0,
      leavetype: 0,
      reason: "",
      start: "",
      end: "",
      total: 0,
      status: 1,
      unit: "Day",
      leave_count: 12,
      available_count: 12,
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    { option: true, label: "Approved" },
    { option: true, label: "Pending" },
    { option: true, label: "Cancel" },
  ];

  const date_range_options = useMemo(() => [
    {
      label: "This Month",
      value: "Africa/Abidjan",
    },
    {
      label: "Last Mounth",
      value: "Africa/Abidjan",
    },
    {
      label: "Oct 1st - Oct 31st",
      value: "Africa/Abidjan",
    },
    {
      label: "Sep 1st - Sep 31st",
      value: "Africa/Abidjan",
    },
  ]);

  // const status_options = useMemo(() => [
  //   {
  //     label: "All Status",
  //     value: "Africa/Abidjan",
  //   },
  //   {
  //     label: "Approved",
  //     value: "Africa/Abidjan",
  //   },
  //   {
  //     label: "Reject",
  //     value: "Africa/Abidjan",
  //   },
  //   {
  //     label: "Pending",
  //     value: "Africa/Abidjan",
  //   },
  // ]);

  const record_options = useMemo(() => [
    {
      label: "All Record",
      value: "Africa/Abidjan",
    },
    {
      label: "Missing IN/Out",
      value: "Africa/Abidjan",
    },
    {
      label: "Edited Paid Time",
      value: "Africa/Abidjan",
    },
    {
      label: "Edited OT",
      value: "Africa/Abidjan",
    },
    {
      label: "Check IN on Holiday/Leave/Non-Working Days",
      value: "Africa/Abidjan",
    },
  ]);

  const type_options = useMemo(() => [
    {
      label: "My Attendance",
      value: "Africa/Abidjan",
    },
    {
      label: "Team Attendance",
      value: "Africa/Abidjan",
    },
    {
      label: "Employee Attendance",
      value: "Africa/Abidjan",
    },
  ]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Filter Card Start */}
          <Card>
            <CardHeader className="border-0 rounded">
              <Row className="g-2">
                <Col xl={2}>
                  <div className="form-icon right">
                    <Select
                      name="date_range_attendance"
                      id="date_range_attendance"
                      options={date_range_options}
                      placeholder="Select a Date Range"
                    />
                  </div>
                </Col>
                <Col xl={2}>
                  <div className="form-icon right">
                    <Select
                      name="status_attendance"
                      id="status_attendance"
                      options={hr_status || []}
                      placeholder="Select a Status"
                    />
                  </div>
                </Col>
                <Col xl={2}>
                  <div className="form-icon right">
                    <Select
                      name="record_attendance"
                      id="record_attendance"
                      options={record_options}
                      placeholder="Select a Record"
                    />
                  </div>
                </Col>
                <Col xl={2}>
                  <div className="form-icon right">
                    <Select
                      name="type_attendance"
                      id="type_attendance"
                      options={type_options}
                      placeholder="Select a Type"
                    />
                  </div>
                </Col>
                <Col xl={2}>
                  <div className="form-icon right">
                    <Select
                      name="employee_attendance"
                      id="employee_attendance"
                      options={type_options}
                      placeholder="Select a Employee"
                    />
                  </div>
                </Col>

                <div className="col-lg-auto">
                  <div className="hstack gap-2">
                    <button type="button" className="btn btn-danger">
                      <i className="ri-equalizer-fill me-1 align-bottom"></i>{" "}
                      Filters
                    </button>
                  </div>
                </div>
              </Row>
            </CardHeader>
          </Card>
          {/* Filter Card End */}

          <Row className="project-wrapper">
            <Col xxl={3} xl={3} sm={3}>
              <TimeTracking />
            </Col>
            <Col xxl={9} xl={9} sm={9}>
              <AttendanceOverview />
            </Col>
            <Col xxl={12}>
              <AttendanceEmployeeTable />
            </Col>
            <Col xxl={12}>
              <AttendanceTeamTable />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AttendanceDashboard;
