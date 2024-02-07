import React from "react";
import { useEffect, useState } from "react";
import { MetaTitle } from "../../common/data/MetaTitle";
import InfoTable from "../../component/common/table/InfoTable";
import { useDispatch, useSelector } from "react-redux";
import { setLeaveApproval } from "../../redux/reducers/ChildReducer/LeaveApprovalReducer";
import { setAttendanceApprovalData } from "../../redux/reducers/ChildReducer/AttendanceApprovalReducer";
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { Button, Badge, UncontrolledTooltip } from "reactstrap";
import { convertDate, convertTime } from "../../common/js/ConvertDateFormat";
import { setAttendanceApprovalTableFilterKeys } from "../../redux/reducers/ChildReducer/TableFilterReducer";
import { format } from "date-fns";
import { ParseTime } from "../../common/js/ParseTime";
import { ConvertSecondsToTime } from "../../common/js/ConvertSecondsToTime";
import { Link } from "react-router-dom";

const AttendanceApproval = () => {
  const dispatch = useDispatch();

  const { attendance_approval_data } = useSelector(
    (state) => state.AttendanceApprovalReducer
  );

  const DepartmentData = GetLocalStorageData("department") || [];
  const LeaveTypeData = GetLocalStorageData("leave_types") || [];
  const EmployeeData = GetLocalStorageData("employee") || [];
  const ProfileData = GetLocalStorageData("my_profile");

  const { version } = useSelector((data) => data.MetaReducer);

  const getUnitId = (id) => {
    const day_type = LeaveTypeData?.find((val) => val?.value === id)?.unit;
    return day_type;
  };
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
      url: "attendance/get_attendance_entry_log/?thisMonth=" + thisMonth,
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
  const [timelineDate, setTimeLineDate] = useState("");

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
    // {
    //   Header: "Department",
    //   id: "department",
    //   filterable: false,
    //   accessor: (obj) => {

    //     let thisDepartment = ProfileData
    //       ? ProfileData.find((data) =>
    //           data.primary_department_id_list.includes(
    //             obj.primary_department_id_list
    //           )
    //         )
    //       : [];

    //     let firstDep_name = thisDepartment?.length
    //       ? thisDepartment[0].name
    //       : "";

    //     let subDepList = thisDepartment?.length
    //       ? thisDepartment.filter((datas, index) => {
    //           if (index !== 0) {
    //             return datas;
    //           }
    //         })
    //       : [];

    //     return (
    //       <span>
    //         <Button
    //           color="light"
    //           id={`depListRef-${obj.id}`}
    //           className="position-relative"
    //         >
    //           <React.Fragment>{firstDep_name}</React.Fragment>
    //           {subDepList.length > 0 ? (
    //             <span>
    //               <Badge
    //                 //id="tooltipwithHtml"
    //                 pill
    //                 color="success"
    //                 className="position-absolute top-0 start-100 translate-middle"
    //               >
    //                 +{subDepList.length}
    //                 <span className="visually-hidden">Departments</span>
    //               </Badge>

    //               <UncontrolledTooltip
    //                 placement="bottom"
    //                 target={`depListRef-${obj.id}`}
    //               >
    //                 {" "}
    //                 <div className="mt-1">
    //                   {subDepList.map((item, key) => (
    //                     <p className="mb-1">{item.name}</p>
    //                   ))}
    //                 </div>{" "}
    //               </UncontrolledTooltip>
    //             </span>
    //           ) : (
    //             ""
    //           )}
    //         </Button>
    //       </span>
    //     );
    //   },
    // },
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
          </React.Fragment>
        );
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
      Header: "Edited CIH",
      accessor: "edited_cih",
      filterable: false,
      id: "edited_cih",
      accessor: (obj) => {
        let edited_hours = ConvertSecondsToTime(
          obj.edited_checked_hr_in_seconds
        );
        return <React.Fragment>{edited_hours}</React.Fragment>;
      },
    },
    {
      Header: "OT",
      accessor: "ot",
      filterable: false,
      id: "ot",
      accessor: (obj) => {
        let ot_hours = ConvertSecondsToTime(obj.edited_ot_hr_in_seconds);
        return <React.Fragment>{ot_hours}</React.Fragment>;
      },
    },
    {
      Header: "Diff",
      accessor: "diff",
      filterable: false,
      id: "diff",
      accessor: (obj) => {
        return <b>0</b>;
      },
    },

    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        let status =
          obj.hr_status === 1
            ? "Pending"
            : obj.hr_status === 2
            ? "Approved"
            : "Rejected";
        let statusClass =
          obj.hr_status === 1
            ? "primary"
            : obj.hr_status === 2
            ? "success"
            : "danger";
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

  const filterKey = "status";
  const filterOptions = [
    {
      option: 1,
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
      option: 3,
      label: "Rejected",
      count:
        attendance_approval_data.filter((e) => e[filterKey] === 4).length || 0,
    },
  ];

  document.title = `Attendance Approval | ${MetaTitle}`;
  return (
    <div>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={attendance_approval_data}
        formname={"attendance_approval"}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"35%"}
      />
    </div>
  );
};

export default AttendanceApproval;
