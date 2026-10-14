import React from "react";
import { useEffect, useState } from "react";
import { MetaTitle } from "../../common/data/MetaTitle";
import InfoTable from "../../component/common/table/InfoTable";
import { useDispatch, useSelector } from "react-redux";
import {
  setAttendanceApprovalData,
  updateAttendanceApprovalNotes,
} from "../../redux/reducers/ChildReducer/AttendanceApprovalReducer";
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Badge,
  UncontrolledTooltip,
} from "reactstrap";
import { setAttendanceApprovalTableFilterKeys } from "../../redux/reducers/ChildReducer/TableFilterReducer";
import { format } from "date-fns";
import { ParseTime } from "../../common/js/ParseTime";
import {
  ApvCheckIn,
  ApvDate,
  ApvDiff,
  ApvEmployee,
  ApvNotesButton,
  ApvSeconds,
  ApvWorked,
} from "../../component/common/approval/ApprovalCells";
import SimpleBar from "simplebar-react";
import NotesModal from "../../component/common/modal/NotesModal";
import { differenceInMinutes } from "date-fns";
import "./../../common/css/lc_style.css";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../common/api/PostApi";
import { toast } from "react-toastify";
import { VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY } from "../../common/constant/RoleConstants";
import ModalCloseButton from "../../shared/ui/ModalCloseButton";
import { testId, itemTestKey } from "../../shared/testing/testId";
const AttendancePendingTable = ({ onDataLengthChange }) => {
  const dispatch = useDispatch();

  const { attendance_approval_data } = useSelector(
    (state) => state.AttendanceApprovalReducer,
  );

  const DepartmentData = GetLocalStorageData("department") || [];
  const EmployeeData = GetLocalStorageData("employee") || [];

  useEffect(() => {
    dispatch(
      setAttendanceApprovalTableFilterKeys({ primary_department_id_list: 0 }),
    );
  }, []);
  const profile_data = JSON.parse(localStorage.getItem("lint_hr_profile_data")) || {};

  useEffect(() => {
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    if (
      profile_data.permission_list.includes(
        VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
      )
    ) {
      Api({
        type: "GET",
        url:
          "attendance/get-attendance-data-for-approval/?thisMonth=" +
          thisMonth +
          "&employee_type=1",
      })
        .then((res) => {
          dispatch(setAttendanceApprovalData(res?.data?.data));
        })
        .catch((err) => {
          console.log("ERR");
        });
    }
  }, []);

  const [timelineList, setTimelineList] = useState([]);
  const [timelineDate, setTimeLineDate] = useState("");
  const [timeline_modal, settimeline_modal] = useState(false);
  const [notes_modal, setNotes_modal] = useState(false);
  const [notesList, setNotesList] = useState([]);
  const [date, setDate] = useState(null);
  const [notesUpdateObj, setNotesUpdateObj] = useState(null);
  const closeNotesModal = () => {
    setNotes_modal(false);
  };

  function open_timeline() {
    settimeline_modal(!timeline_modal);
  }

  const AttendancependingData = attendance_approval_data.filter(
    (item) => item.hr_status === 3,
  );
  const DataLength = AttendancependingData.length;

  useEffect(() => {
    onDataLengthChange(DataLength);
  }, [DataLength, onDataLengthChange]);

  const viewNotes = (obj) => {
    let initial_obj = {
      id: obj?.id,
      final_checked_in_hr_in_seconds: obj?.final_checked_in_hr_in_seconds,
      final_ot_hr_in_seconds: obj?.final_ot_hr_in_seconds,
      final_paid_hr_in_seconds: obj?.final_paid_hr_in_seconds,
      notes: "",
    };
    setNotesUpdateObj(initial_obj);

    setNotesList(obj?.notes);
    setDate(obj?.date);

    setNotes_modal(true);
  };

  const updateNotes = async () => {
    dispatch(setLoaderVisible(true));
    const Api = await PostApi(
      "/attendance/update-notes/",
      notesUpdateObj,
      false,
    );
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
      accessor: "employee_id",
      filterable: false,
      id: "employee_id",

      accessor: (obj) => (
        <ApvEmployee employee={EmployeeData.find((data) => data.id === obj.employee_id)} />
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
  ];

  // const filterKey = "hr_status";
  // const filterOptions = [
  //   {
  //     option: 3,
  //     label: "Pending",
  //     count:
  //       attendance_approval_data.filter((e) => e[filterKey] === 3).length || 0,
  //   },

  // ];

  // document.title = `Attendance Approval | ${MetaTitle}`;
  return (
    <div>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={AttendancependingData}
        formname={"attendance_pending_table"}
        // filterKey={filterKey}
        // filterOptions={filterOptions}
        width_per={"35%"}
        table_class={"Lc_leave_apply_table"}
      />
      <Modal
        data-testid="attendance-pending-date-dialog"
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
        }} testId="attendance-pending-date-close-button" />} toggle={() => {
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
                                    data-testid={testId("attendance-pending-date-check-in-location", itemTestKey(data), "link")}
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
                                    data-testid={testId("attendance-pending-date-check-out-location", itemTestKey(data), "link")}
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
                data-testid="attendance-pending-date-footer-close-button"
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
          !!EmployeeData && EmployeeData.find((e) => e.id === n.employee_id)
        }
        canWrite
        value={notesUpdateObj?.notes}
        onChange={(v) => setNotesUpdateObj({ ...notesUpdateObj, notes: v })}
        onSave={updateNotes}
      />
    </div>
  );
};

export default AttendancePendingTable;
