import React, { Fragment, useMemo, useState } from "react";
import { Table } from "../../../shared/ui/table/RsuiteCompatTable";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import {
  Badge,
  Button,
  Col,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import SimpleBar from "simplebar-react";
import { useDispatch, useSelector } from "react-redux";
import { ConvertSecondsToTime } from "../../../common/js/ConvertSecondsToTime";
import { setAttendancePagination } from "../../../redux/reducers/ChildReducer/AttendanceReportReducer";
import { testId, itemTestKey } from "../../../shared/testing/testId";
import ModalCloseButton from "../../../shared/ui/ModalCloseButton";

const PAGE_SIZE_OPTIONS = [10, 20, 25, 50, 100];

// Forces pager buttons and the "Show N" select to the exact same height / baseline
const pagerStyles = `
.att-pager .pagination { margin: 0 !important; align-items: center; }
.att-pager .page-link { height: 34px; min-width: 34px; display: inline-flex; align-items: center; justify-content: center; padding: 0 12px; line-height: 1; }
.att-pager .att-pager-select { height: 34px; margin: 0; padding-top: 0; padding-bottom: 0; line-height: 32px; box-shadow: none; }
`;

// Builds [1, "gap-4", 5, 6, 7, "gap-12", 12]
const buildPageWindow = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2)
    [total - 1, total - 2, total - 3].forEach((p) => pages.add(p));
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
};

const AttendanceTeamTable = () => {
  const dispatch = useDispatch();
  const { Column, HeaderCell, Cell } = Table;
  const [loading] = useState(false);

  const holiday_data = GetLocalStorageData("holiday") || [];
  const employee_data = GetLocalStorageData("employee") || [];
  const DepartmentData = GetLocalStorageData("department") || [];

  const [timeline_modal, settimeline_modal] = useState(false);
  const [notes_modal, setNotes_modal] = useState(false);

  const { team_attendance_report_data, attendance_pagination } = useSelector(
    (state) => state.AttendanceReportReducer,
  );

  const pagination = attendance_pagination || {
    count: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
  };

  // 🔹 Pagination handlers (Filter component refetches when these change)
  const handlePageChange = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > pagination.total_pages ||
      nextPage === pagination.page
    )
      return;
    dispatch(setAttendancePagination({ page: nextPage }));
  };

  const handlePageSizeChange = (e) => {
    dispatch(
      setAttendancePagination({ page_size: Number(e.target.value), page: 1 }),
    );
  };

  const pageWindow = useMemo(
    () => buildPageWindow(pagination.page, pagination.total_pages),
    [pagination.page, pagination.total_pages],
  );

  const rangeStart =
    pagination.count === 0
      ? 0
      : (pagination.page - 1) * pagination.page_size + 1;
  const rangeEnd = Math.min(
    pagination.page * pagination.page_size,
    pagination.count,
  );

  function open_timeline() {
    settimeline_modal(!timeline_modal);
  }

  function open_notes_modal() {
    setNotes_modal(!notes_modal);
  }

  const EmployeeCell = ({ rowData, dataKey, ...props }) => {
    const at_employee_data = (employee_data || []).find(
      (i) => i.id == rowData.employee_id,
    );

    if (!at_employee_data) {
      return (
        <Cell {...props}>
          <span>Employee Not Found</span>
        </Cell>
      );
    }

    let html_tag = at_employee_data.profile_url ? (
      <div className="d-flex gap-2 align-items-center">
        <div className="flex-shrink-0">
          <img
            src={at_employee_data.profile_url}
            alt=""
            className="avatar-xs rounded-circle"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="flex-grow-1">
          <div>
            <Link to="#" className="link-body-emphasis mb-0" data-testid={testId("attendance-team-row", at_employee_data.emp_id, "employee-link")}>
              {" "}
              <h5 className="fs-14 mb-1">{at_employee_data.first_name}</h5>
            </Link>
          </div>
          <div>{at_employee_data.email}</div>
        </div>
      </div>
    ) : (
      <div className="d-flex gap-2 align-items-center">
        <div className="flex-shrink-0">
          <div
            className="avatar-xs rounded-circle"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#0ab39c",
            }}
            data-bs-toggle="tooltip"
            title={at_employee_data.first_name}
          >
            <span className="first_letter" style={{ color: "white" }}>
              {at_employee_data.first_name.charAt(0)}
            </span>
          </div>
        </div>
        <div className="flex-grow-1">
          <div>
            <Link to="#" className="link-body-emphasis mb-0" data-testid={testId("attendance-team-row", at_employee_data.emp_id, "employee-link")}>
              {" "}
              <h5 className="fs-14 mb-1">{at_employee_data.first_name}</h5>
            </Link>
          </div>
          <div>{at_employee_data.email}</div>
        </div>
      </div>
    );

    return (
      <Cell {...props} className="link-group">
        {html_tag}
      </Cell>
    );
  };

  const DepartmentCell = ({ rowData, dataKey, ...props }) => {
    const departmentIds = rowData?.primary_department_id_list || [];

    const thisDepartment = (DepartmentData || []).filter((data) =>
      departmentIds.includes(data.id),
    );

    let firstDep_name = thisDepartment?.length ? thisDepartment[0].name : "";

    let subDepList = thisDepartment?.length
      ? thisDepartment.filter((datas, index) => index !== 0)
      : [];

    return (
      <Cell {...props} className="link-group">
        <span>
          <Button
            data-testid="attendance-team-sub-dep-list-length-0-button"
            color="light"
            id={`depListRef-${rowData.employee_id}`}
            className="position-relative"
          >
            <React.Fragment>{firstDep_name}</React.Fragment>
            {subDepList.length > 0 ? (
              <span>
                <Badge
                  pill
                  color="success"
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  +{subDepList.length}
                  <span className="visually-hidden">Departments</span>
                </Badge>

                <UncontrolledTooltip
                  placement="bottom"
                  target={`depListRef-${rowData.employee_id}`}
                >
                  {" "}
                  <div className="mt-1">
                    {subDepList.map((item) => (
                      <p className="mb-1" key={item.id}>
                        {item.name}
                      </p>
                    ))}
                  </div>{" "}
                </UncontrolledTooltip>
              </span>
            ) : (
              ""
            )}
          </Button>
        </span>
      </Cell>
    );
  };

  const WSHourCell = ({ rowData, dataKey, ...props }) => {
    return (
      <Cell {...props} className="link-group">
        <div>
          <div className="d-flex mb-2">
            <div className="flex-grow-1">
              <div>Progress </div>
            </div>
            <div className="flex-shrink-0">
              <div>
                {` ${ConvertSecondsToTime(rowData.total_paid_hr_in_seconds)}`}/
                {` ${ConvertSecondsToTime(
                  rowData.total_work_schedule_hr_without_break_in_seconds,
                )}`}
              </div>
            </div>
          </div>
          <div className="progress progress-sm animated-progess">
            <div
              className="progress-bar bg-success"
              role="progressbar"
              aria-valuenow="0"
              aria-valuemin="0"
              aria-valuemax="100"
              style={{
                width: Math.round(
                  (rowData.total_paid_hr_in_seconds /
                    rowData.total_work_schedule_hr_without_break_in_seconds) *
                    100 *
                    2,
                ),
              }}
            ></div>
          </div>
        </div>
      </Cell>
    );
  };

  const fixedColumns = [
    <Column key="employee" width={250} fixed="left">
      <HeaderCell>Employee</HeaderCell>
      <EmployeeCell dataKey="employee" fullText />
    </Column>,
    <Column key="ws_hours" width={200} fixed="left">
      <HeaderCell>Paid Time / Work Schedule</HeaderCell>
      <WSHourCell
        dataKey="total_work_schedule_hr_without_break_in_seconds"
        fullText
      />
    </Column>,
    <Column key="department" width={200} fixed="left">
      <HeaderCell>Department</HeaderCell>
      <DepartmentCell dataKey="primary_department_id_list" fullText />
    </Column>,
  ];

  const dynamicColumns =
    (team_attendance_report_data || []).length > 0
      ? (team_attendance_report_data[0]?.workday_data || []).map(
          (day, index) => (
            <Column key={`dynamic_${index}`} width={100} align="center">
              <HeaderCell>
                {" "}
                {format(new Date(day.date), "dd MMM, yyyy")}
              </HeaderCell>
              <Cell
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {(rowData) => {
                  const dayData = rowData.workday_data?.[index];
                  if (!dayData) return <span>-</span>;

                  let result_text = "";
                  let result_text_color = "black";

                  if (dayData.is_holiday === true) {
                    result_text =
                      holiday_data.find((d) => d.id === dayData.holiday_id)
                        ?.name || "Holiday";
                    result_text_color = "green";
                  } else if (dayData.is_week_off === true) {
                    result_text = dayData.week_off_day_name || "";
                    result_text_color = "blue";
                  } else if (dayData.is_leave_approved === true) {
                    result_text = "Leave";
                    result_text_color = "orange";
                  } else if (dayData.leave_taken_without_approval === true) {
                    result_text = "Absent";
                    result_text_color = "red";
                  } else if (dayData.is_attendance_exists === false) {
                    result_text = "-";
                    result_text_color = "black";
                  } else {
                    result_text =
                      parseInt(dayData.final_paid_hr_in_seconds) > 0
                        ? ConvertSecondsToTime(dayData.final_paid_hr_in_seconds)
                        : "00:00Hr";
                    result_text_color = "black";
                  }

                  return (
                    <span style={{ color: result_text_color }}>
                      {result_text}
                    </span>
                  );
                }}
              </Cell>
            </Column>
          ),
        )
      : [];

  const allColumns = [...fixedColumns, ...dynamicColumns];

  return (
    <Fragment>
      <Table
        variant="app"
        height={400}
        data={team_attendance_report_data || []}
        rowHeight={60}
        autoHeight={true}
        loading={loading}
        bordered={true}
        affixHorizontalScrollbar
        className="mb-3"
      >
        {allColumns}
      </Table>

      {/* Pagination */}
      {pagination.count > 0 && (
        <div className="att-pager d-flex align-items-center justify-content-between flex-wrap gap-3 bg-white rounded px-4 py-3 mb-4">
          <style>{pagerStyles}</style>
          <div className="text-muted">
            Showing <span className="fw-semibold">{rangeStart}</span> to{" "}
            <span className="fw-semibold">{rangeEnd}</span> of{" "}
            <span className="fw-semibold">{pagination.count}</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            {pagination.total_pages > 1 && (
              <Pagination
                className="pagination-separated mb-0"
                aria-label="Attendance pages"
              >
                <PaginationItem disabled={pagination.page <= 1}>
                  <PaginationLink
                    previous
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pagination.page - 1);
                    }}
                  >
                    Previous
                  </PaginationLink>
                </PaginationItem>

                {pageWindow.map((p) =>
                  typeof p === "string" ? (
                    <PaginationItem key={p} disabled>
                      <PaginationLink
                        href="#"
                        onClick={(e) => e.preventDefault()}
                      >
                        …
                      </PaginationLink>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p} active={p === pagination.page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem
                  disabled={pagination.page >= pagination.total_pages}
                >
                  <PaginationLink
                    next
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pagination.page + 1);
                    }}
                  >
                    Next
                  </PaginationLink>
                </PaginationItem>
              </Pagination>
            )}

            <Input
              data-testid="attendance-team-employees-per-page-select"
              type="select"
              value={pagination.page_size}
              onChange={handlePageSizeChange}
              aria-label="Employees per page"
              className="att-pager-select"
              style={{ width: "auto", minWidth: 110 }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option data-testid={testId("attendance-team-employees-per-page-option", itemTestKey(n))} key={n} value={n}>
                  Show {n}
                </option>
              ))}
            </Input>
          </div>
        </div>
      )}

      {/* IN/OUT List Modal */}
      <Modal data-testid="attendance-team-date-dialog" isOpen={timeline_modal} toggle={open_timeline} centered>
        <ModalHeader close={<ModalCloseButton onClick={open_timeline} testId="attendance-team-date-close-button" />} toggle={open_timeline}>
          <h5 className="modal-title" id="exampleModalToggleLabel">
            Date :
          </h5>
        </ModalHeader>
        <ModalBody className="text-left">
          <div>
            <SimpleBar style={{ maxHeight: "410px" }} className="p-3 pt-0">
              <div className="acitivity-timeline acitivity-main">
                <div className="acitivity-item d-flex">
                  <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                    <div className="avatar-title bg-success-subtle text-success rounded-circle">
                      <i className="mdi mdi-arrow-right-thick"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1 lh-base">Check IN </h6>
                    <p className="text-muted mb-1">02:14 PM Today </p>
                    <small className="mb-0 text-muted">
                      <i className="mdi mdi-map-marker"></i> Lintcloud, Vallioor
                    </small>
                  </div>
                </div>

                <div className="acitivity-item py-3 d-flex">
                  <div className="flex-shrink-0">
                    <div className="avatar-xs acitivity-avatar">
                      <div className="avatar-title rounded-circle bg-warning-subtle text-warning">
                        <i className="mdi mdi-arrow-left-thick"></i>
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1 lh-base">Check Out</h6>
                    <p className="text-muted mb-1">02:14 PM Today </p>
                    <small className="mb-0 text-muted">
                      <i className="mdi mdi-map-marker"></i> Lintcloud, Vallioor
                    </small>
                  </div>
                </div>

                <div className="acitivity-item d-flex">
                  <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                    <div className="avatar-title bg-success-subtle text-success rounded-circle">
                      <i className="ri-shopping-cart-2-line"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1 lh-base">Purchase by James Price</h6>
                    <p className="text-muted mb-1">
                      Product noise evolve smartwatch{" "}
                    </p>
                    <small className="mb-0 text-muted">02:14 PM Today</small>
                  </div>
                </div>
              </div>
            </SimpleBar>
            <Button data-testid="attendance-team-date-continue-button" className="btn btn-warning" onClick={open_timeline}>
              Continue
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Notes Modal */}
      <Modal data-testid="attendance-team-notes-dialog" isOpen={notes_modal} toggle={open_notes_modal} centered>
        <ModalBody className="text-left">
          <div>
            <SimpleBar style={{ height: "300px" }} className="px-3 mx-n3 mb-2">
              <div className="d-flex mb-4">
                <div className="flex-shrink-0">
                  <img
                    src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/72/profile/c436ed58-7f6a-467e-80f0-f2034dad859f.jpg"
                    alt=""
                    className="avatar-xs rounded-circle"
                  />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="fs-13">
                    Joseph Parker{" "}
                    <small className="text-muted ms-2">
                      20 Dec 2021 - 05:47AM
                    </small>
                  </h5>
                  <p className="text-muted">
                    I am getting message from customers that when they place
                    order always get error message .
                  </p>
                </div>
              </div>
              <div className="d-flex mb-4">
                <div className="flex-shrink-0">
                  <img
                    src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/67/profile/2e06ae27-9238-458c-b0c7-bd4eba75e835.jpg"
                    alt=""
                    className="avatar-xs rounded-circle"
                  />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="fs-13">
                    Donald Palmer{" "}
                    <small className="text-muted ms-2">
                      24 Dec 2021 - 05:20PM
                    </small>
                  </h5>
                  <p className="text-muted">
                    If you have further questions, please contact Customer
                    Support from the “Action Menu” on your .
                  </p>
                </div>
              </div>
              <div className="d-flex">
                <div className="flex-shrink-0">
                  <img
                    src="https://local-lcedu-static.s3.amazonaws.com/dev/employee/62/profile/8a2e638c-c521-4129-9742-adc05acaae51.webp"
                    alt=""
                    className="avatar-xs rounded-circle"
                  />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="fs-13">
                    Alexis Clarke{" "}
                    <small className="text-muted ms-2">26 min ago</small>
                  </h5>
                  <p className="text-muted">
                    Your provides you with the most current status of your
                    order. To help manage your order refer to the “Action Menu”
                    to initiate return, contact Customer Support and more.
                  </p>
                </div>
              </div>
            </SimpleBar>
            <form className="mt-4">
              <Row className="g-3">
                <Col xs={12}>
                  <label
                    htmlFor="exampleFormControlTextarea1"
                    className="form-label text-body"
                  >
                    Leave a Notes
                  </label>
                  <textarea
                    data-testid="attendance-team-notes-textarea"
                    className="form-control bg-light border-light"
                    id="exampleFormControlTextarea1"
                    rows="3"
                    placeholder="Enter your comment..."
                  ></textarea>
                </Col>
                <Col xs={12} className="text-end">
                  <button
                    data-testid="attendance-team-notes-attach-button"
                    type="button"
                    className="btn btn-ghost-secondary btn-icon waves-effect me-1"
                  >
                    <i className="ri-attachment-line fs-16"></i>
                  </button>
                  <Link data-testid="attendance-team-notes-post-notes-link" to="#" className="btn btn-success">
                    Post Notes
                  </Link>
                </Col>
              </Row>
            </form>
          </div>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default AttendanceTeamTable;
