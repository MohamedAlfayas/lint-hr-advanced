import React, { useEffect, useMemo, useState } from "react";
import { Badge, Col, Container, Row } from "reactstrap";
import LeaveTypesWidgets from "./LeaveTypesWidgets";
import HolidayCalenderAPi from "../holidays/HolidayCalenderAPi";
import InfoTable from "../../component/common/table/InfoTable";
import { useDispatch, useSelector } from "react-redux";
import { MetaTitle } from "../../common/data/MetaTitle";
import { leave_application_component_name } from "../../common/constant/Constants";
import { Api } from "../../common/api/Api";
import { GetApi } from "../../common/api/GetApi";
import { ConvertDateFormat } from "../../common/js/ConvertDateFormat";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

const LeaveDashboard = () => {
  const [leaveData, setLeaveData] = useState([]);
  useEffect(() => {
    const fetchLeaveData = async () => {
      const getApiResult = await GetApi('leave/leave-application/get/');
      console.log('getApiResult ===', getApiResult?.data?.data);
      setLeaveData(getApiResult?.data?.data)

    };

    fetchLeaveData();
  }, []);
  document.title = `Leave Application | ${MetaTitle}`;
  const leaveType = GetLocalStorageData("leave_types_for_employee") || [];
  

  // const leaveId = leaveType.find((type) => type.id === getApiResult)
  // const dispatch = useDispatch();
  // const { leave_application_data } = useSelector(
  //   (state) => state.LeaveApplyReducer
  // );
  // useEffect(() => {
  //   dispatch(setLeaveApplication(GetLocalStorageData("leave_types") || []));
  // }, []);

  // let leavetypes = [
  //   { id: 1, name: "Casual Leave (CL)", type: "Day" },
  //   { id: 2, name: "Earned Leave (EL)", type: "Hour" },
  //   { id: 3, name: "Sick Leave (SL)", type: "Day" },
  //   { id: 4, name: "Permission", type: "Hour" },
  // ];

  // let statusObj = [
  //   { id: 1, name: "Pending", class: "warning" },
  //   { id: 2, name: "Approved", class: "success" },
  //   { id: 3, name: "Cancel", class: "danger" },
  // ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("name = ", name, "   value = ", value);
    setLeaveApplication({
      ...leaveapplication,
      [name]: value,
    });
  };

  // const handleTypeChange = (obj) => {
  //   setSelectedGenders(obj);
  //   setLeaveTypeData({
  //     ...leaveTypeData,
  //     genders: obj.map((d) => d.id),
  //   });
  // };

  // const [leaveapplication, setLeaveApplication] = useState([
  //   {
  //     id: 1,
  //     leavetype: 2,
  //     reason: "Testing",
  //     start: "30-05-2023 10:00",
  //     end: "30-05-2023 12:00",
  //     total: 2,
  //     status: 1,
  //   },
  //   {
  //     id: 2,
  //     leavetype: 1,
  //     reason: "Testing",
  //     start: "01-05-2023",
  //     end: "03-05-2023",
  //     total: 2,
  //     status: 2,
  //   },
  //   {
  //     id: 3,
  //     leavetype: 3,
  //     reason: "Testing",
  //     start: "01-05-2023",
  //     end: "03-05-2023",
  //     total: 2,
  //     status: 3,
  //   },
  // ]);

  // Column
  const additionalColumn = [
    {
      Header: "Leave Type",
      filterable: false,
      id: "leave_type",
      accessor: (obj) => {
        const LeaveTypeData = GetLocalStorageData("leave_types");
        const thisLeaveType = LeaveTypeData.find(data => data.id === obj.leave_type)
        return (
          <React.Fragment> <b>{thisLeaveType && thisLeaveType.name}</b></React.Fragment>
        );
      },
    },
    {
      Header: "Reason",
      filterable: false,
      id: "reason",
      accessor: (obj) => {
        return <b>{obj.reason}</b>;
      },
    },
    {
      Header: "Start Date",
      accessor: "start",
      filterable: false,
      id: "start",
      accessor: (obj) => {
        return <b>  {ConvertDateFormat(obj.start)}</b>;
      },
    },
    {
      Header: "End Date",
      accessor: "end",
      filterable: false,
      id: "end",
      accessor: (obj) => {
        return <b> {ConvertDateFormat(obj.end)}</b>;
      },
    },
   
    {
      Header: "Total",
      filterable: false,
      id: "Total",
      accessor: (obj) => {
        let leaveUnit = leaveData.map((type, i) =>
          obj.leave_type == type.id ? type.type : ""
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
      leave_type: 0,
      reason: "",
      start: null,
      end: null,
      requested_leave_count: 0,
      status: 1,
      day_type: 1,
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    { option: 1, label: "Pending", count : leaveData.filter(e => e[filterKey] === 1).length || 0  },
    { option: 2, label: "Approved", count : leaveData.filter(e => e[filterKey] === 2).length || 0  },
    { option: 3, label: "Rejected", count : leaveData.filter(e => e[filterKey] === 3).length || 0  },
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
              tabledata={leaveData}
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
