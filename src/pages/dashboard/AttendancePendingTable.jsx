import React from "react";
import { useEffect, useState } from "react";
import { MetaTitle } from "../../common/data/MetaTitle";
import InfoTable from "../../component/common/table/InfoTable";
import { useDispatch, useSelector } from "react-redux";
import { setAttendanceApprovalData } from "../../redux/reducers/ChildReducer/AttendanceApprovalReducer";
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Badge,
  UncontrolledTooltip,
  Row,
  Col,
} from "reactstrap";
import { setAttendanceApprovalTableFilterKeys } from "../../redux/reducers/ChildReducer/TableFilterReducer";
import { format } from "date-fns";
import { ParseTime } from "../../common/js/ParseTime";
import { ConvertSecondsToTime } from "../../common/js/ConvertSecondsToTime";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import { differenceInMinutes } from "date-fns";
import { GetAmPmDateTime } from "../../common/js/ConvertDateTimeToAmPm";
import "./../../common/css/lc_style.css";
const AttendancePendingTable = () => {
  const dispatch = useDispatch();

  const { attendance_approval_data } = useSelector(
    (state) => state.AttendanceApprovalReducer
  );

  const DepartmentData = GetLocalStorageData("department") || [];
  const EmployeeData = GetLocalStorageData("employee") || [];

  useEffect(() => {
    dispatch(
      setAttendanceApprovalTableFilterKeys({ primary_department_id_list: 0 })
    );
  }, []);

  useEffect(() => {
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    Api({
      type: "GET",
      url:
        "attendance/get-attendance-data-for-approval/?thisMonth=" +
        thisMonth +
        "&department_id=0",
    })
      .then((res) => {
        console.log("res", res);
        dispatch(setAttendanceApprovalData(res?.data?.data));
      })
      .catch((err) => {
        console.log("ERR = ", err);
      });
  }, []);

  const [timelineList, setTimelineList] = useState([]);
  console.log("list", timelineList);
  const [timelineDate, setTimeLineDate] = useState("");
  const [timeline_modal, settimeline_modal] = useState(false);
  const [notes_modal, setNotes_modal] = useState(false);
  const [notesList, setNotesList] = useState([]);
  const [date, setDate] = useState(null);
  const closeNotesModal = () => {
    setNotes_modal(false);
  };

  function open_timeline() {
    settimeline_modal(!timeline_modal);
  }

  const viewNotes = (obj) => {
    console.log("This rowData = ", obj);

    setNotesList(obj?.notes);
    setDate(obj?.date);

    setNotes_modal(true);
  };

  const additionalColumn = [
    {
      Header: "Name",
      accessor: "employee_id",
      filterable: false,
      id: "employee_id",

      accessor: (obj) => {
        const thisEmployee = EmployeeData.find(
          (data) => data.id === obj.employee_id
        );
        return thisEmployee.profile_url ? (
          <div className="d-flex gap-2 align-items-center">
            <div className="flex-shrink-0">
              <img
                src={thisEmployee.profile_url}
                alt=""
                className="avatar-xs rounded-circle"
              />
            </div>
            <div className="flex-grow-1">
              <div>{thisEmployee.fname}</div>
              <div>{thisEmployee.email}</div>
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
                title={thisEmployee.fname}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {thisEmployee.fname.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div>{thisEmployee.fname}</div>
              <div>{thisEmployee.email}</div>
            </div>
          </div>
        );
      },
    },
    
    {
      Header: "Date",
      accessor: "date",
      filterable: false,
      id: "date",
      accessor: (obj) => {
        const date = format(new Date(obj.date), "dd MMM, yyyy");

        return <b>{date}</b>;
      },
    },
    {
      Header: "First Check In",
      accessor: "first_check_in",
      filterable: false,
      id: "first_check_in",
      accessor: (obj) => {
        let in_time = obj?.first_check_in
          ? format(ParseTime(obj?.first_check_in), "h:mm a")
          : null;
        return (
          <React.Fragment>
            {in_time}{" "}
            {obj.entry_log.length > 0 ? (
              <Link
                className="link-opacity-75 ms-1"
                href="#"
                onClick={() => {
                  setTimelineList(obj?.entry_log);
                  setTimeLineDate(format(new Date(obj?.date), "dd MMM, yyyy"));
                  open_timeline();
                }}
              >
                +{obj.entry_log.length}
              </Link>
            ) : (
              <span>-</span>
            )}
          </React.Fragment>
        );
      },
    },
    {
      Header: "Work Schedule",
      accessor: "work_schedule",
      filterable: false,
      id: "work_schedule",
      accessor: (obj) => {
        let workSchedule = ConvertSecondsToTime(
          obj.work_schedule_duration_without_break
        );
        return <React.Fragment> {workSchedule} </React.Fragment>;
      },
    },
    {
      Header: "Checked Hours",
      accessor: "checked_hoours",
      filterable: false,
      id: "checked_hours",
      accessor: (obj) => {
        let checked_hours = ConvertSecondsToTime(obj.checked_in_hr_in_seconds);
        return <React.Fragment> {checked_hours} </React.Fragment>;
      },
    },
    {
      Header: "Edited Hours",
      accessor: "edited_hours",
      filterable: false,
      id: "edited_hours",
      accessor: (obj) => {
        let edited_hours = ConvertSecondsToTime(
          obj.edited_checked_in_hr_in_seconds
        );

        return <b>{edited_hours}</b>;
      },
    },
    {
      Header: "OT",
      accessor: "ot",
      filterable: false,
      id: "ot",
      accessor: (obj) => {
        let ot_hours = ConvertSecondsToTime(obj.edited_ot_hr_in_seconds);
        return <b>{ot_hours}</b>;
      },
    },
    {
      Header: "Diff",
      accessor: "diff",
      filterable: false,
      id: "diff",
      accessor: (obj) => {
        let diff = ConvertSecondsToTime(obj.paid_hr_difference_in_seconds);
        return <b>{diff}</b>;
      },
    },

    {
      Header: "Paid Hr",
      accessor: "paid_hr",
      filterable: false,
      id: "paid_hr",
      accessor: (obj) => {
        let final_hr = ConvertSecondsToTime(obj.final_paid_hr_in_seconds);
        return <React.Fragment>{final_hr}</React.Fragment>;
      },
    },
    {
      Header: "Notes",
      accessor: "notes",
      filterable: false,
      id: "notes",
      accessor: (obj) => {
        return (
          <React.Fragment>
            {" "}
            <Link
              className="link-opacity-75 ms-1"
              href="#"
              onClick={() => viewNotes(obj)}
            >
              {obj.notes.length} Notes
            </Link>
          </React.Fragment>
        );
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
   
  ];

  document.title = `Attendance Approval | ${MetaTitle}`;
  return (
    <div>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={attendance_approval_data}
        formname={""}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"35%"}
      />
      <Modal
        isOpen={timeline_modal}
        toggle={() => {
          open_timeline();
        }}
        centered
        className="custom-modal"
      >
        <ModalHeader>
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
                    <th>Location</th>
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
                          "h:mm a"
                        );
                        let checkOutTime = checkOutData
                          ? format(ParseTime(checkOutData.entry_time), "h:mm a")
                          : "";
                        let totalDifference = checkOutData
                          ? differenceInMinutes(
                              ParseTime(checkOutData.entry_time),
                              ParseTime(checkInData.entry_time)
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
                            </td>
                            <td>
                              <p
                                className="text-muted mb-1"
                                style={{ fontWeight: "bold" }}
                              >
                                {checkOutTime}
                              </p>
                            </td>
                            <td>
                              <p
                                className="text-muted mb-1"
                                style={{ fontWeight: "bold" }}
                              >
                                {formattedTotalHours}:{formattedTotalMinutes} Hr
                              </p>
                            </td>
                            <td>
                              <small className="mb-0 text-muted">
                                <a
                                  href={`https://maps.google.com/?q=${checkInData.location}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <i className="mdi mdi-map-marker"></i>{" "}
                                  {checkInData.location || ""}
                                </a>
                              </small>
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
                className="btn btn-warning"
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
      <Modal
        isOpen={notes_modal}
        toggle={() => {
          closeNotesModal();
        }}
        centered
        className="custom-modal"
      >
        <ModalHeader>
          <h5
            className="modal-title"
            id="exampleModalToggleLabel"
            style={{ fontSize: "smaller" }}
          >
            Notes - {format(new Date(date), "dd MMM, yyyy")}
          </h5>
        </ModalHeader>
        <ModalBody className="text-left">
          <div>
            <SimpleBar style={{ height: "300px" }} className="px-3 mx-n3 mb-2">
              {notesList && notesList.length > 0 ? (
                notesList.map((d) => {
                  let emp_details =
                    !!EmployeeData &&
                    EmployeeData.find((e) => e.id === d.employee_id);

                  return (
                    <div className="d-flex mb-4">
                      <div className="flex-shrink-0">
                        {emp_details?.profile_url ? (
                          <img
                            src={emp_details?.profile_url}
                            alt=""
                            className="avatar-xs rounded-circle"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="avatar-xs rounded-circle"
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              background: "#0ab39c",
                              objectFit: "cover",
                            }}
                            data-bs-toggle="tooltip"
                            title={emp_details.fname}
                          >
                            <span
                              className="first_letter"
                              style={{ color: "white" }}
                            >
                              {emp_details.fname.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-grow-1 ms-3">
                        <h5 className="fs-13">
                          {emp_details.fname}{" "}
                          <small className="text-muted ms-2">
                            {/* 20 Dec 2021 - 05:47AM */}
                            {GetAmPmDateTime(d?.created_time)}
                          </small>
                        </h5>
                        <p className="text-muted">{d?.message}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "25vh",
                  }}
                >
                  <lord-icon
                    src="https://cdn.lordicon.com/msoeawqm.json"
                    trigger="loop"
                    colors="primary:#405189,secondary:#0ab39c"
                    style={{
                      marginTop: "20px",
                      width: "150px",
                      height: "80px",
                      marginBottom: "20px",
                    }}
                  ></lord-icon>
                  <p
                    style={{
                      width: "300px",
                      color: "#405189",
                      fontSize: "20px",
                      textAlign: "center",
                    }}
                  >
                    No Notes Found!
                  </p>
                </div>
              )}
            </SimpleBar>
            <form className="mt-4">
              <Row className="g-3">
                <Col xs={12} className="text-end">
                  <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                    <button
                      type="button"
                      className="btn btn-warning"
                      data-bs-dismiss="modal"
                      onClick={closeNotesModal}
                    >
                      Close
                    </button>
                  </div>
                </Col>
              </Row>
            </form>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AttendancePendingTable;
