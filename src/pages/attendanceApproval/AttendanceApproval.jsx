import React, { useEffect, useMemo, useState } from "react";
import { MetaTitle } from "../../common/data/MetaTitle";
import InfoTable from "../../component/common/table/InfoTable";
import { useDispatch, useSelector } from "react-redux";
import { updateAttendanceApprovalNotes } from "../../redux/reducers/ChildReducer/AttendanceApprovalReducer";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import {
  ApvCheckIn,
  ApvDate,
  ApvDepartment,
  ApvDiff,
  ApvEmployee,
  ApvNotesButton,
  ApvSeconds,
  ApvStatus,
  ApvWorked,
} from "../../component/common/approval/ApprovalCells";
import { setAttendanceApprovalTableFilterKeys } from "../../redux/reducers/ChildReducer/TableFilterReducer";
import { format } from "date-fns";
import { ParseTime } from "../../common/js/ParseTime";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import NotesModal from "../../component/common/modal/NotesModal";
import { differenceInMinutes } from "date-fns";
import "./../../common/css/lc_style.css";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import { toast } from "react-toastify";
import {
  VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_ALL_ATTENDANCE_APPROVAL_ACCESS_KEY,
} from "../../common/constant/RoleConstants";
import { setApprovalEmployeeTypeFilter } from "../../redux/reducers/ChildReducer/ApprovalComponentReducer";
import ModalCloseButton from "../../shared/ui/ModalCloseButton";
import { testId, itemTestKey } from "../../shared/testing/testId";

const APV_STATUS = {
  2: { label: "Approved", tone: "success", icon: "ri-checkbox-circle-line" },
  3: { label: "Pending", tone: "warning", icon: "ri-time-line" },
  4: { label: "Rejected", tone: "danger", icon: "ri-close-circle-line" },
};

// NOTE: This component no longer fetches its own data. ApprovalFilter.jsx is
// the single source of truth for fetching + pagination for both Leave and
// Attendance approval tables. Previously this component ran its own
// unpaginated mount-fetch that overwrote ApprovalFilter's paginated fetch in
// the same Redux slice (attendance_approval_data), which is why pagination
// behaved unpredictably. It now just renders whatever is in Redux, using the
// serverPagination object passed down from ApprovalFilter for the pager.
const AttendanceApproval = ({
  PendingLeave,
  AttendancePending,
  serverPagination,
  loading = false,
}) => {
  const dispatch = useDispatch();

  const { attendance_approval_data } = useSelector(
    (state) => state.AttendanceApprovalReducer,
  );

  const DepartmentData = GetLocalStorageData("department") || [];
  const EmployeeData = GetLocalStorageData("employee") || [];

  const employeeById = useMemo(() => {
    const map = {};
    (EmployeeData || []).forEach((e) => {
      map[String(e.id)] = e;
    });
    return map;
  }, [EmployeeData]);

  const resolveEmployee = (row) => {
    const id = row?.employee_id ?? row?.employee?.id ?? row?.emp_id;
    return (
      (id != null ? employeeById[String(id)] : null) ||
      (row?.employee && typeof row.employee === "object" ? row.employee : null)
    );
  };

  const resolveDepartments = (emp) => {
    if (Array.isArray(emp?.departments) && emp.departments.length) {
      return emp.departments;
    }
    const ids = emp?.primary_department_id_list || [];
    if (!ids.length) return [];
    return (DepartmentData || []).filter((d) =>
      ids.some((id) => String(id) === String(d.id)),
    );
  };

  // Permission logic merged from the previous AttendanceApproval version.
  // Data fetching remains in ApprovalFilter to preserve server-side pagination.
  const profile_data = JSON.parse(
    localStorage.getItem("lint_hr_profile_data") || "{}",
  );

  const isAdmin = profile_data?.is_admin === true;
  const permList = profile_data?.permission_list || [];

  // let employee_type;

  // if (isAdmin) {
  //   dispatch(setApprovalEmployeeTypeFilter(0));
  //   employee_type = 0;
  // } else if (
  //   permList.includes(VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY) &&
  //   permList.includes(VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY)
  // ) {
  //   employee_type = 1;
  // } else if (
  //   permList.includes(VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY) &&
  //   !permList.includes(VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY)
  // ) {
  //   dispatch(setApprovalEmployeeTypeFilter(0));
  //   employee_type = 0;
  // } else {
  //   employee_type = 1;
  // }

  // const hasAttendanceApprovalAccess =
  //   isAdmin ||
  //   permList.includes(VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY) ||
  //   permList.includes(VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY);

  // // employee_type is retained from the previous permission flow.
  // // The actual API request is intentionally handled by ApprovalFilter.
  // void employee_type;

  // useEffect(() => {
  //   dispatch(
  //     setAttendanceApprovalTableFilterKeys({ primary_department_id_list: 0 }),
  //   );
  // }, []);


  // ⬇️ NEW BLOCK STARTS HERE
  const hasAll =
    isAdmin || permList.includes(VIEW_ALL_ATTENDANCE_APPROVAL_ACCESS_KEY);
  const hasHierarchy = permList.includes(
    VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY,
  );
  const hasTeam = permList.includes(VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY);

  let employee_type;
  if (hasAll) employee_type = 0;
  else if (hasHierarchy && hasTeam) employee_type = 1;
  else if (hasHierarchy) employee_type = 0;
  else employee_type = 1;

  const hasAttendanceApprovalAccess = hasAll || hasHierarchy || hasTeam;

  useEffect(() => {
    if (employee_type === 0) {
      dispatch(setApprovalEmployeeTypeFilter(0));
    }
  }, [employee_type]);
  // ⬆️ NEW BLOCK ENDS HERE

  useEffect(() => {
    dispatch(
      setAttendanceApprovalTableFilterKeys({ primary_department_id_list: 0 }),
    );
  }, []);


  const [timelineList, setTimelineList] = useState([]);
  const [timelineDate, setTimeLineDate] = useState("");
  const [timeline_modal, settimeline_modal] = useState(false);
  const [notes_modal, setNotes_modal] = useState(false);
  const [notesList, setNotesList] = useState([]);
  const [notesData, setNotesData] = useState({});
  const [notesObj, setNotesObj] = useState(null);
  const [date, setDate] = useState(null);
  const closeNotesModal = () => {
    setNotes_modal(false);
  };

  function open_timeline() {
    settimeline_modal(!timeline_modal);
  }

  const viewNotes = (obj) => {
    const intialObj = {
      id: obj?.id,
      final_checked_in_hr_in_seconds: obj?.final_checked_in_hr_in_seconds,
      final_ot_hr_in_seconds: obj?.final_ot_hr_in_seconds,
      final_paid_hr_in_seconds: obj?.final_paid_hr_in_seconds,
      notes: "",
    };
    setNotesObj(intialObj);
    setNotesList(obj?.notes);
    setDate(obj?.date);
    setNotesData(obj);
    setNotes_modal(true);
  };
  const updateNotes = async () => {
    dispatch(setLoaderVisible(true));
    const Api = await PostApi("/attendance/update-notes/", notesObj, false);
    if (Api.status && Api.status === 200) {
      setNotes_modal(false);
      dispatch(updateAttendanceApprovalNotes(Api?.data?.data));
      toast.success(Api?.data?.message);
    } else {
      toast.error(Api?.data?.message || Api?.data?.detail);
    }
    dispatch(setLoaderVisible(false));
  };

  const additionalColumn = [
  
    {
      Header: "Name",
      className: "lc_sticky_first_additional_col",
      id: "employee_id",
      filterable: false,
      accessor: (obj) => (
        <ApvEmployee
          employee={resolveEmployee(obj)}
          className="lc_sticky_first_additional_col"
        />
      ),
    },
    {
      Header: "Department",
      id: "department",
      filterable: false,
      accessor: (obj) => (
        <ApvDepartment
          departments={resolveDepartments(resolveEmployee(obj))}
          refId={obj.id}
        />
      ),
    },
    {
      Header: "Date",
      accessor: "date",
      filterable: false,
      id: "date",
      accessor: (obj) => <ApvDate value={obj.date} />,
    },
    {
      Header: "First Check In",
      accessor: "first_check_in",
      filterable: false,
      id: "first_check_in",
      accessor: (obj) => (
        <ApvCheckIn
          time={obj?.first_check_in ? format(ParseTime(obj.first_check_in), "h:mm a") : null}
          entries={obj?.entry_log?.length || 0}
          onOpenLog={() => {
            setTimelineList(obj?.entry_log);
            setTimeLineDate(format(new Date(obj?.date), "dd MMM, yyyy"));
            open_timeline();
          }}
        />
      ),
    },
    {
      Header: "Work Schedule",
      accessor: "work_schedule",
      filterable: false,
      id: "work_schedule",
      accessor: (obj) => <ApvSeconds seconds={obj.work_schedule_duration_without_break} />,
    },
    {
      Header: "Checked Hours",
      accessor: "checked_hoours",
      filterable: false,
      id: "checked_hours",
      accessor: (obj) => (
        <ApvWorked
          worked={obj.checked_in_hr_in_seconds || 0}
          planned={obj.work_schedule_duration_without_break || 0}
        />
      ),
    },
    {
      Header: "Edited Hours",
      accessor: "edited_hours",
      filterable: false,
      id: "edited_hours",
      accessor: (obj) => (
        <ApvSeconds seconds={obj.edited_checked_in_hr_in_seconds} tone="primary" strong />
      ),
    },
    {
      Header: "OT",
      accessor: "ot",
      filterable: false,
      id: "ot",
      accessor: (obj) => <ApvSeconds seconds={obj.edited_ot_hr_in_seconds} tone="info" strong />,
    },
    {
      Header: "Diff",
      accessor: "diff",
      filterable: false,
      id: "diff",
      accessor: (obj) => <ApvDiff seconds={obj.paid_hr_difference_in_seconds} />,
    },
    {
      Header: "Paid Hr",
      accessor: "paid_hr",
      filterable: false,
      id: "paid_hr",
      accessor: (obj) => (
        <ApvSeconds seconds={obj.final_paid_hr_in_seconds} tone="success" strong />
      ),
    },
    {
      Header: "Notes",
      accessor: "notes",
      filterable: false,
      id: "notes",
      accessor: (obj) => (
        <ApvNotesButton count={obj.notes?.length || 0} onClick={() => viewNotes(obj)} />
      ),
    },

    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        const s = APV_STATUS[obj.hr_status] || APV_STATUS[4];
        return <ApvStatus tone={s.tone} icon={s.icon} label={s.label} />;
      },
    },
  ];

  const filterKey = "hr_status";
  const filterOptions = [
    {
      option: 3,
      label: "Pending",
      count:
        attendance_approval_data.filter((e) => e[filterKey] === 3).length || 0,
    },
    {
      option: 2,
      label: "Approved",
      count:
        attendance_approval_data.filter((e) => e[filterKey] === 2).length || 0,
    },

    {
      option: 4,
      label: "Rejected",
      count:
        attendance_approval_data.filter((e) => e[filterKey] === 4).length || 0,
    },
  ];

  document.title = `Approval | ${MetaTitle}`;
  return (
    <React.Fragment>
      {hasAttendanceApprovalAccess ? (
        <InfoTable
          additionalColumn={additionalColumn}
          tabledata={attendance_approval_data}
          formname={"attendance_approval"}
          filterKey={filterKey}
          filterOptions={filterOptions}
          width_per={"35%"}
          serverPagination={serverPagination}
          loading={loading}
        />
      ) : (
        <div className="text-center py-5">
          <p className="text-muted mb-0">
            You do not have permission to view attendance approvals.
          </p>
        </div>
      )}
      <Modal
        data-testid="attendance-approval-date-dialog"
        isOpen={timeline_modal}
        toggle={() => {
          open_timeline();
        }}
        centered
        className="custom-modal"
      >
        <ModalHeader
          close={<ModalCloseButton onClick={() => {
          open_timeline();
        }} testId="attendance-approval-date-close-button" />} toggle={() => {
          open_timeline();
        }}>
          <h5
            className="modal-title"
            id="exampleModalToggleLabel"
            style={{ fontSize: "smaller" }}
          >
            Date: {timelineDate}
          </h5>
        </ModalHeader>
        <ModalBody className="text-left">
          <div>
            <SimpleBar style={{ maxHeight: "410px" }} className="p-3 pt-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      Check In{" "}
                      <i className="mdi mdi-arrow-down-thick arrow-icon"></i>
                    </th>
                    <th>
                      Check Out{" "}
                      <i className="mdi mdi-arrow-up-thick arrow-icon"></i>
                    </th>
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineList.length > 0 &&
                    timelineList.map((data, idx) => {
                      let checkInData = timelineList[idx];
                      let checkOutData = timelineList[idx + 1];
                      if (
                        checkInData &&
                        parseInt(checkInData.entry_type) === 1
                      ) {
                        let checkInTime = format(
                          ParseTime(checkInData.entry_time),
                          "h:mm a",
                        );
                        let checkOutTime = checkOutData
                          ? format(ParseTime(checkOutData.entry_time), "h:mm a")
                          : "";
                        let totalDifference = checkOutData
                          ? differenceInMinutes(
                              ParseTime(checkOutData.entry_time),
                              ParseTime(checkInData.entry_time),
                            )
                          : 0;
                        let totalHours = Math.floor(totalDifference / 60);
                        let totalMinutes = totalDifference % 60;

                        let formattedTotalHours = totalHours
                          .toString()
                          .padStart(2, "0");
                        let formattedTotalMinutes = totalMinutes
                          .toString()
                          .padStart(2, "0");

                        return (
                          <tr key={idx}>
                            <td>
                              <p
                                className="text-muted mb-1"
                                style={{ fontWeight: "bold" }}
                              >
                                {checkInTime}
                              </p>
                              <small
                                className="mb-0 text-muted"
                                style={{
                                  display: "inline-block",
                                  maxWidth: "100px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {checkInData.location_id !== null ? (
                                  <a
                                    data-testid={testId("attendance-approval-date-check-in-location", itemTestKey(data), "link")}
                                    href={`https://maps.google.com/?q=${checkInData.latitude},${checkInData.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <i className="mdi mdi-map-marker"></i>{" "}
                                    {checkInData.location || ""}
                                  </a>
                                ) : checkInData &&
                                  checkInData.location !== "" ? (
                                  <span>
                                    <i className="mdi mdi-map-marker"></i>{" "}
                                    {checkInData.location}
                                  </span>
                                ) : null}
                              </small>
                            </td>
                            <td>
                              <p
                                className="text-muted mb-1"
                                style={{ fontWeight: "bold" }}
                              >
                                {checkOutTime}
                              </p>
                              <small
                                className="mb-0 text-muted"
                                style={{
                                  display: "inline-block",
                                  maxWidth: "100px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {checkOutData &&
                                checkOutData.location_id !== null ? (
                                  <a
                                    data-testid={testId("attendance-approval-date-check-out-location", itemTestKey(data), "link")}
                                    href={`https://maps.google.com/?q=${checkOutData.latitude},${checkOutData.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <i className="mdi mdi-map-marker"></i>{" "}
                                    {checkOutData.location || ""}
                                  </a>
                                ) : checkOutData &&
                                  checkOutData.location !== "" ? (
                                  <span>
                                    <i className="mdi mdi-map-marker"></i>{" "}
                                    {checkOutData.location}
                                  </span>
                                ) : null}
                              </small>
                            </td>
                            <td>
                              <p
                                className="text-muted mb-1"
                                style={{ fontWeight: "bold" }}
                              >
                                {formattedTotalHours}:{formattedTotalMinutes} Hr
                              </p>
                            </td>
                          </tr>
                        );
                      }
                      return null; // Skip rendering if it's not a check-in entry
                    })}
                </tbody>
              </table>
            </SimpleBar>
            <div className="text-center mt-3">
              <Button
                data-testid="attendance-approval-date-footer-close-button"
                className="btn btn-light modal-dismiss-btn"
                onClick={() => {
                  open_timeline();
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
      <NotesModal
        isOpen={notes_modal}
        onClose={closeNotesModal}
        date={date}
        notes={notesList}
        resolveEmployee={(n) =>
          EmployeeData.find((e) => String(e.id) === String(n.employee_id))
        }
        canWrite={notesData.hr_status !== 2}
        value={notesObj?.notes}
        onChange={(v) => setNotesObj({ ...notesObj, notes: v })}
        onSave={updateNotes}
      />
    </React.Fragment>
  );
};

export default AttendanceApproval;
