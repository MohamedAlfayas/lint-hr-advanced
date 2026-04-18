import React, { useEffect, useMemo, useRef, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import LeaveTypesWidgets from "./LeaveTypesWidgets";
import HolidayCalenderAPi from "../holidays/HolidayCalenderAPi";
import InfoTable from "../../component/common/table/InfoTable";
import LeaveChangeModal from "./LeaveChangeModal";
import { useDispatch, useSelector } from "react-redux";
import { MetaTitle } from "../../common/data/MetaTitle";
import { leave_application_component_name } from "../../common/constant/Constants";
import { Api } from "../../common/api/Api";
import { convertDate, convertTime } from "../../common/js/ConvertDateFormat";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { setLeaveApplication } from "../../redux/reducers/ChildReducer/LeaveApplyReducer";
import { setLeaveTypeForCurrentEmployee } from "../../redux/reducers/ChildReducer/LeaveTypeReducer";

const LeaveDashboard = () => {
  const dispatch = useDispatch();

  // ── modal state ──────────────────────────────
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [selectedLeaveRecord, setSelectedLeaveRecord] = useState(null);

  const openChangeModal = (record) => {
    setSelectedLeaveRecord(record);
    setChangeModalOpen(true);
  };

  const closeChangeModal = () => {
    setChangeModalOpen(false);
    setSelectedLeaveRecord(null);
  };

  // ── fetch leave applications ─────────────────
  const fetchLeaveApplications = () => {
    Api({ method: "GET", url: "leave/get-my-leave-application/" })
      .then((res) => dispatch(setLeaveApplication(res?.data?.data || [])))
      .catch(() => console.log("ERR – leave applications"));
  };

  // ── data fetch on mount ──────────────────────
  useEffect(() => {
    fetchLeaveApplications();
  }, []);

  useEffect(() => {
    Api({ method: "GET", url: "leave/get-leave-type-for-employee/" })
      .then((res) =>
        dispatch(setLeaveTypeForCurrentEmployee(res?.data?.data || [])),
      )
      .catch(() => console.log("ERR – leave types"));
  }, []);

  document.title = `Leave Application | ${MetaTitle}`;

  const LeaveTypeData = GetLocalStorageData("leave_types") || [];

  const getUnitId = (id) =>
    LeaveTypeData?.find((val) => val?.value === id)?.unit;

  const { leave_application_data } = useSelector(
    (state) => state.LeaveApplyReducer,
  );
  const { leave_type_for_current_employee } = useSelector(
    (state) => state.LeaveTypeReducer,
  );

  // ── deleted row style helper ─────────────────
  const deletedStyle = {
    textDecoration: "line-through",
    opacity: 0.55,
    color: "inherit",
  };

  const getCellStyle = (obj) => (obj.is_deleted ? deletedStyle : {});

  // ── status helpers ───────────────────────────
  const getStatusLabel = (status, is_deleted) => {
    if (is_deleted) return "Cancelled";
    switch (status) {
      case 1:
        return "Pending";
      case 2:
        return "Approved";
      case 3:
        return "Rejected";
      case 4:
        return "Cancel Request";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status, is_deleted) => {
    if (is_deleted) return "danger";
    switch (status) {
      case 1:
        return "warning";
      case 2:
        return "success";
      case 3:
        return "danger";
      case 4:
        return "info";
      default:
        return "secondary";
    }
  };

  // ── Approve handler ──────────────────────────
  const handleApprove = (record) => {
    const newStatus = record.status === 4 ? 5 : 2;
    Api({
      method: "PATCH",
      url: `leave/update-leave-status/${record.id}/`,
      data: { status: newStatus },
    })
      .then(() => fetchLeaveApplications())
      .catch(() => console.log("ERR – approve leave"));
  };

  // ── Reject handler ───────────────────────────
  const handleReject = (record) => {
    const newStatus = record.status === 4 ? 6 : 3;
    Api({
      method: "PATCH",
      url: `leave/update-leave-status/${record.id}/`,
      data: { status: newStatus },
    })
      .then(() => fetchLeaveApplications())
      .catch(() => console.log("ERR – reject leave"));
  };

  // ── table columns ────────────────────────────
  const additionalColumn = [
    {
      Header: "Leave Type",
      filterable: false,
      id: "leave_type_id",
      accessor: (obj) => {
        const data = GetLocalStorageData("leave_types");
        const thisLeaveType = data.find((d) => d.id === obj.leave_type_id);
        return <b style={getCellStyle(obj)}>{thisLeaveType?.name}</b>;
      },
    },
    {
      Header: "Reason",
      filterable: false,
      id: "reason",
      accessor: (obj) => <b style={getCellStyle(obj)}>{obj.reason}</b>,
    },
    {
      Header: "Start Date",
      filterable: false,
      id: "start",
      accessor: (obj) => {
        const date = convertDate(new Date(obj.start).toDateString());
        const time = convertTime(new Date(obj.start).toTimeString());
        return (
          <b style={getCellStyle(obj)}>
            {getUnitId(obj.leave_type_id) === 1 ? date : `${date} - ${time}`}
          </b>
        );
      },
    },
    {
      Header: "End Date",
      filterable: false,
      id: "end",
      accessor: (obj) => {
        const date = convertDate(new Date(obj.end).toDateString());
        const time = convertTime(new Date(obj.end).toTimeString());
        return (
          <b style={getCellStyle(obj)}>
            {getUnitId(obj.leave_type_id) === 1 ? date : `${date} - ${time}`}
          </b>
        );
      },
    },
    {
      Header: "Total",
      filterable: false,
      id: "Total",
      accessor: (obj) => (
        <b style={getCellStyle(obj)}>{`${obj.requested_leave_count} ${
          getUnitId(obj.leave_type_id) === 1 ? "Days" : "Hour"
        }`}</b>
      ),
    },
    {
      Header: () => (
        <div style={{ textAlign: "center", width: "100%" }}>Status</div>
      ),
      id: "status",
      filterable: false,

      // ✅ force cell center also
      Cell: ({ row }) => {
        const obj = row.original;

        const label = getStatusLabel(obj.status, obj.is_deleted);
        const color = getStatusColor(obj.status, obj.is_deleted);

        let cancelBadge = null;

        if (obj.leave_cancellation_details) {
          const cancelStatus = obj.leave_cancellation_details.status;

          let cancelLabel = "";
          let cancelColor = "";

          if (cancelStatus === 1) {
            cancelLabel = "Pending";
            cancelColor = "warning";
          } else if (cancelStatus === 2) {
            cancelLabel = "Cancelled Leave Req Approved";
            cancelColor = "success";
          } else {
            cancelLabel = "Cancelled Leave Req Rejected";
            cancelColor = "danger";
          }

          cancelBadge = (
            <span
              className={`badge text-uppercase bg-${cancelColor}-subtle text-${cancelColor}`}
            >
              {cancelLabel}
            </span>
          );
        }

        return (
          <div
            style={{
              width: "100%", // 🔥 important
              display: "flex",
              justifyContent: "center", // 🔥 force center
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "25px",
              }}
            >
              {/* DOTTED LINE */}
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  bottom: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderLeft: "2px dotted #ccc",
                }}
              />

              {/* LABEL */}
              <span
                className={`badge text-uppercase bg-${color}-subtle text-${color}`}
                style={{ zIndex: 1 }}
              >
                {label}
              </span>

              {/* CANCEL */}
              {cancelBadge && <div style={{ zIndex: 1 }}>{cancelBadge}</div>}
            </div>
          </div>
        );
      },
    },
  ];

  const initialFormObj = useMemo(
    () => ({
      id: 0,
      leave_type_id: 0,
      reason: "",
      start: null,
      end: null,
      requested_leave_count: 0,
      status: 1,
      day_type: 1,
      in_between_dates: [],
    }),
    [],
  );

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
    {
      option: 4,
      label: "Cancel Request",
      count:
        leave_application_data.filter((e) => e[filterKey] === 4).length || 0,
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
                width_per={"45%"}
                leaveTypeForEmployeeData={leave_type_for_current_employee}
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
              onChangeLeave={(row) => openChangeModal(row)}
            />
            <HolidayCalenderAPi />
          </Row>
        </Container>
      </div>

      {/* Change Leave Modal */}
      <LeaveChangeModal
        isOpen={changeModalOpen}
        onClose={closeChangeModal}
        leaveRecord={selectedLeaveRecord}
      />
    </React.Fragment>
  );
};

export default LeaveDashboard;
