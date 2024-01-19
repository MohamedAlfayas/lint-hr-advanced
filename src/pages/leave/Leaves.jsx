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
import { convertDate, convertTime } from "../../common/js/ConvertDateFormat";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { setLeaveApplication } from "../../redux/reducers/ChildReducer/LeaveApplyReducer";

const LeaveDashboard = () => {
  useEffect(() => {
    Api({
      method: "GET",
      url: "leave/get-my-leave-application/",
    })
      .then((res) => {
        dispatch(setLeaveApplication(res?.data?.data || []));
      })
      .catch((err) => {
        console.log("ERR = ", err);
      });
  }, []);
  document.title = `Leave Application | ${MetaTitle}`;
  const LeaveTypeData = GetLocalStorageData("leave_types") || [];
  const getUnitId = (id) => {
    const day_type = LeaveTypeData?.find((val) => val?.value === id)?.unit;
    return day_type;
  };

  // const leaveId = leaveType.find((type) => type.id === getApiResult)
  const dispatch = useDispatch();
  const { leave_application_data } = useSelector(
    (state) => state.LeaveApplyReducer
  );

  // Column
  const additionalColumn = [
    {
      Header: "Leave Type",
      filterable: false,
      id: "leave_type",
      accessor: (obj) => {
        const LeaveTypeData = GetLocalStorageData("leave_types");
        const thisLeaveType = LeaveTypeData.find(
          (data) => data.id === obj.leave_type
        );
        return (
          <React.Fragment>
            {" "}
            <b>{thisLeaveType && thisLeaveType.name}</b>
          </React.Fragment>
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
        const date = convertDate(new Date(obj.start).toDateString());
        const time = convertTime(new Date(obj.start).toTimeString());
        return (
          <b>{`${
            getUnitId(obj.leave_type) === 1 ? date : `${date} - ${time}`
          }`}</b>
        );
      },
    },
    {
      Header: "End Date",
      accessor: "end",
      filterable: false,
      id: "end",
      accessor: (obj) => {
        const date = convertDate(new Date(obj.end).toDateString());
        const time = convertTime(new Date(obj.end).toTimeString());
        return (
          <b>{`${
            getUnitId(obj.leave_type) === 1 ? date : `${date} - ${time}`
          }`}</b>
        );
      },
    },

    {
      Header: "Total",
      filterable: false,
      id: "Total",
      accessor: (obj) => {
        let leave_count = obj.requested_leave_count;
        return (
          <b>{`${leave_count} ${
            getUnitId(obj.leave_type) === 1 ? "Days" : "Hour"
          }`}</b>
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
      in_between_dates: [],
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    {
      option: 1,
      label: "Pending",
      count:
        leave_application_data.filter((e) => e[filterKey] === 1).length || 0,
    },
    {
      option: 2,
      label: "Approved",
      count:
        leave_application_data.filter((e) => e[filterKey] === 2).length || 0,
    },
    {
      option: 3,
      label: "Rejected",
      count:
        leave_application_data.filter((e) => e[filterKey] === 3).length || 0,
    },
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
              tabledata={leave_application_data}
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
