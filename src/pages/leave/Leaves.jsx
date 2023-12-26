import React, { useMemo, useState } from "react";
import { Badge, Col, Container, Row } from "reactstrap";
import LeaveTypesWidgets from "./LeaveTypesWidgets";
import HolidayCalenderAPi from "../holidays/HolidayCalenderAPi";
import InfoTable from "../../component/common/table/InfoTable";
import { useDispatch, useSelector } from "react-redux";
import { MetaTitle } from "../../common/data/MetaTitle";
import { leave_application_component_name } from "../../common/constant/Constants";

const LeaveDashboard = () => {
  document.title = `Leave Application | ${MetaTitle}`;

  // const dispatch = useDispatch();
  // const { leave_application_data } = useSelector(
  //   (state) => state.LeaveApplyReducer
  // );
  // useEffect(() => {
  //   dispatch(setLeaveApplication(GetLocalStorageData("leave_types") || []));
  // }, []);

  let leavetypes = [
    { id: 1, name: "Casual Leave (CL)", type: "Day" },
    { id: 2, name: "Earned Leave (EL)", type: "Hour" },
    { id: 3, name: "Sick Leave (SL)", type: "Day" },
    { id: 4, name: "Permission", type: "Hour" },
  ];

  let statusObj = [
    { id: 1, name: "Pending", class: "warning" },
    { id: 2, name: "Approved", class: "success" },
    { id: 3, name: "Cancel", class: "danger" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("name = ", name, "   value = ", value);
    setLeaveApplication({
      ...leaveapplication,
      [name]: value,
    });
  };

  const handleTypeChange = (obj) => {
    setSelectedGenders(obj);
    setLeaveTypeData({
      ...leaveTypeData,
      genders: obj.map((d) => d.id),
    });
  };

  const [leaveapplication, setLeaveApplication] = useState([
    {
      id: 1,
      leavetype: 2,
      reason: "Testing",
      start: "30-05-2023 10:00",
      end: "30-05-2023 12:00",
      total: 2,
      status: 1,
    },
    {
      id: 2,
      leavetype: 1,
      reason: "Testing",
      start: "01-05-2023",
      end: "03-05-2023",
      total: 2,
      status: 2,
    },
    {
      id: 3,
      leavetype: 3,
      reason: "Testing",
      start: "01-05-2023",
      end: "03-05-2023",
      total: 2,
      status: 3,
    },
  ]);

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
      selectDate: "",
      select_Dates: "",
      s_hr: "",
      s_min: "",
      e_hr: "",
      e_min: "",
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

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row className="project-wrapper">
            <Col xxl={12}>
              <LeaveTypesWidgets
                formname={leave_application_component_name}
                initialFormObj={initialFormObj}
                width_per={"35%"}
              />
            </Col>
            <InfoTable
              additionalColumn={additionalColumn}
              tabledata={leaveapplication}
              formname={leave_application_component_name}
              initialFormObj={initialFormObj}
              filterKey={filterKey}
              filterOptions={filterOptions}
              width_per={"45%"}
              table_col={8}
              table_class={"Lc_leave_apply_table me-n3 ms-n3"}
            />
            <HolidayCalenderAPi />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default LeaveDashboard;
