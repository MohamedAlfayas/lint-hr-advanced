import React, { useEffect, useMemo, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import LeaveTypesWidgets from "./LeaveTypesWidgets";
import HolidayCalenderAPi from "../holidays/HolidayCalenderAPi";
import InfoTable from "../../component/common/table/InfoTable";
import LeaveChangeModal from "./LeaveChangeModal";
import { useDispatch, useSelector } from "react-redux";
import { MetaTitle } from "../../common/data/MetaTitle";
import { leave_application_component_name } from "../../common/constant/Constants";
import { Api } from "../../common/api/Api";
import {
  ApvChip,
  ApvDate,
  ApvDuration,
  ApvLeaveStatus,
  ApvLeaveType,
  ApvReason,
} from "../../component/common/approval/ApprovalCells";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { setLeaveApplication } from "../../redux/reducers/ChildReducer/LeaveApplyReducer";
import { setLeaveTypeForCurrentEmployee } from "../../redux/reducers/ChildReducer/LeaveTypeReducer";

const DEFAULT_PAGE_SIZE = 10;

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

  // ── pagination state ─────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);

  const handlePaginationChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  // ── fetch leave applications (paginated) ─────
  const fetchLeaveApplications = (
    targetPage = page,
    targetPageSize = pageSize,
  ) => {
    Api({
      method: "GET",
      url: `leave/get-my-leave-application/?page=${targetPage}&page_size=${targetPageSize}`,
    })
      .then((res) => {
        const body = res?.data;
        const payload = body?.data;

        let list = [];
        let total = 0;

        if (Array.isArray(payload)) {
          list = payload;
          total = body?.count ?? body?.total ?? payload.length;
        } else if (Array.isArray(payload?.results)) {
          list = payload.results;
          total = payload.count ?? payload.total ?? list.length;
        } else if (Array.isArray(body?.results)) {
          list = body.results;
          total = body.count ?? list.length;
        }

        dispatch(setLeaveApplication(list));
        setTotalCount(total);

        // if current page became empty (e.g. last item removed), step back
        if (list.length === 0 && targetPage > 1) {
          setPage(targetPage - 1);
        }
      })
      .catch(() => console.log("ERR – leave applications"));
  };

  // ── refetch whenever page / page size changes ─
  useEffect(() => {
    fetchLeaveApplications(page, pageSize);
  }, [page, pageSize]);

  // ── leave types on mount ─────────────────────
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

  // ── table display data ───────────────────────
  // deleted + pending rows: reassign status so they DON'T match the Pending
  // tab (option 1), but still appear under "All Datas". Badge still renders
  // "Cancelled" because getStatusLabel checks is_deleted first.
  const tableDisplayData = useMemo(
    () =>
      leave_application_data.map((e) =>
        e.is_deleted === true && e.status === 1 ? { ...e, status: -1 } : e,
      ),
    [leave_application_data],
  );

  // Cancelled (deleted) leaves are shown struck through and faded.
  const struck = (obj, node) =>
    obj.is_deleted ? <span className="apv-struck">{node}</span> : node;

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
      accessor: (obj) =>
        struck(
          obj,
          <ApvLeaveType name={LeaveTypeData.find((d) => d.id === obj.leave_type_id)?.name} />,
        ),
    },
    {
      Header: "Reason",
      filterable: false,
      id: "reason",
      accessor: (obj) => struck(obj, <ApvReason text={obj.reason} />),
    },
    {
      Header: "Start Date",
      filterable: false,
      id: "start",
      accessor: (obj) =>
        struck(obj, <ApvDate value={obj.start} withTime={getUnitId(obj.leave_type_id) !== 1} />),
    },
    {
      Header: "End Date",
      filterable: false,
      id: "end",
      accessor: (obj) =>
        struck(obj, <ApvDate value={obj.end} withTime={getUnitId(obj.leave_type_id) !== 1} />),
    },
    {
      Header: "Work Date",
      filterable: false,
      id: "comp_off_work_date",
      accessor: (obj) => struck(obj, <ApvDate value={obj.comp_off_work_date} />),
    },
    {
      Header: "Holiday",
      filterable: false,
      id: "holiday_name",
      accessor: (obj) => {
        const globalData = GetLocalStorageData("holiday") || [];
        const matchedHoliday = globalData.find(
          (h) => h.date === (obj.start ? obj.start.split(" ")[0] : null),
        );
        const name = matchedHoliday?.name?.trim();
        return struck(obj, <ApvChip icon="ri-sun-line">{name}</ApvChip>);
      },
    },
    {
      Header: "Total",
      filterable: false,
      id: "Total",
      accessor: (obj) =>
        struck(
          obj,
          <ApvDuration
            count={obj.requested_leave_count}
            days={getUnitId(obj.leave_type_id) === 1}
          />,
        ),
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      Cell: ({ row }) => <ApvLeaveStatus leave={row.original} />,
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
      comp_off_work_date: null,
    }),
    [],
  );

  const filterKey = "status";
  const filterOptions = [
    {
      option: 1,
      label: "Pending",
      count:
        leave_application_data.filter(
          (e) => e[filterKey] === 1 && e.is_deleted === false,
        ).length || 0,
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

  // ── server pagination config passed to table ─
  const serverPagination = {
    page,
    pageSize,
    totalCount,
    onChange: handlePaginationChange,
  };

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
              tabledata={tableDisplayData}
              formname={leave_application_component_name}
              initialFormObj={initialFormObj}
              filterKey={filterKey}
              filterOptions={filterOptions}
              width_per={"45%"}
              table_col={8}
              table_class={"Lc_leave_apply_table me-n3 ms-n3"}
              onChangeLeave={(row) => openChangeModal(row)}
              serverPagination={serverPagination}
            />
            <HolidayCalenderAPi />
          </Row>
        </Container>
      </div>

      <LeaveChangeModal
        isOpen={changeModalOpen}
        onClose={closeChangeModal}
        leaveRecord={selectedLeaveRecord}
      />
    </React.Fragment>
  );
};

export default LeaveDashboard;
