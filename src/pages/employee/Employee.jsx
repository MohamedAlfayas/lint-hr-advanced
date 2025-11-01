import React, { useState } from "react";

import "react-toastify/dist/ReactToastify.css";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setEmployee } from "../../redux/reducers/ChildReducer/EmployeeReducer";
import { GetCustomField } from "../../common/js/GetCustomField";
import { Badge, Button, UncontrolledTooltip } from "reactstrap";
import { Link } from "react-router-dom";
import {
  setComponentToShow,
  setFormObj,
  setFormTitle,
  setFormWidthPercentage,
  toggleRSBView,
} from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  employee_component_name,
  profile_view_component_name,
} from "../../common/constant/Constants";
import {
  resetEmployeeTableFilterKeys,
  setEmployeeTableFilterKeys,
} from "../../redux/reducers/ChildReducer/TableFilterReducer";
import { previousDateFormat } from "../../common/js/ConvertDateFormat";

import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
import { Api } from "../../common/api/Api";
import { SimpleRadialbar } from "./SimpleRadialbar";
import { GetApi } from "../../common/api/GetApi";
import { setTodayAttendanceProgressBar } from "../../redux/reducers/ChildReducer/EmployeeProgressBarReducer";


const Employee = () => {
  const dispatch = useDispatch();
  const { employee_data } = useSelector((state) => state.EmployeeReducer);
    const todayAttendance = useSelector(
    (state) => state.EmployeeProgressBarReducer
  );
  console.log(todayAttendance,"TODAY");
  

  const { version } = useSelector((state) => state.MetaReducer);

  const EmployeeData = GetLocalStorageData("employee") || [];


  useEffect(() => {
    dispatch(setEmployee(EmployeeData));
  }, [version]);
  
  useEffect(() => {
    // dispatch(
    //   setEmployeeTableFilterKeys({
    //     primary_department_id_list: 0,
    //     role_id: 0,
    //     reporting_manager_id: 0,
    //   })
    // );
    dispatch(resetEmployeeTableFilterKeys());
  }, []);

  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      try {
        const res = await GetApi("/attendance/get-attendance-status");
        const result = res?.data;
        console.log(result,"RESULT");
        
        dispatch(setTodayAttendanceProgressBar(result));
        
      } catch (err) {
        console.error("Error fetching attendance status:", err);
      }
    };

    fetchAttendanceStatus();
  }, []);

 

  const CustomFieldsForThisForm = GetCustomField("employee") || [];
  const DepartmentData = GetLocalStorageData("department") || [];

  const viewEmployee = (obj) => {
    dispatch(setFormTitle("Employee Details"));
    dispatch(setFormObj(obj));
    dispatch(setFormWidthPercentage("30%"));
    dispatch(setComponentToShow(profile_view_component_name));
    dispatch(toggleRSBView(true));
  };

  // Column
  const additionalColumn = [
{
  Header: "Name",
  accessor: "first_name",
  filterable: false,
  id: "first_name",
  accessor: (obj) => {
    // Find this employee's attendance data

      const employeeAttendance = todayAttendance.today_attendance.find(
      (emp) => emp.employee?.id === obj.id
    );
    
    console.log("EMP",employeeAttendance);
    

    const totalWorkDuration = employeeAttendance?.total_work_duration ?? 0;
    const totalTimeWorked = employeeAttendance?.total_time_worked ?? 0;

    const progress =
      totalWorkDuration > 0
        ? Math.min(100, Math.round((totalTimeWorked / totalWorkDuration) * 100))
        : 0;

    return (
      <div className="d-flex gap-2 align-items-center">
        {/* Profile Image / Initial */}
        <div className="flex-shrink-0">
          {obj.profile_url ? (
            <img
              src={obj.profile_url}
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
              }}
              data-bs-toggle="tooltip"
              title={obj.first_name}
            >
              <span className="first_letter" style={{ color: "white" }}>
                {obj?.first_name?.charAt(0) || ""}
              </span>
            </div>
          )}
        </div>

        {/* Employee Info */}
        <div className="flex-grow-1">
          <div>
            <Link
              to="#"
              onClick={() => viewEmployee(obj)}
              className="link-body-emphasis mb-0"
            >
              <h5 className="fs-14 mb-1">
                <span>{obj.first_name}</span>
                <span style={{ color: "#a29797", fontSize: "smaller" }}>
                  {" "}
                  #{obj.emp_id}
                </span>
              </h5>
            </Link>
          </div>
          <div>{obj.email}</div>

          {/* Show progress bar only if employee is active */}
        {obj.is_active && (
  <div
    className="progress mt-1"
    style={{
      height: "4px",
      backgroundColor: "#e9ecef", // gray background
      borderRadius: "4px",
    }}
  >
    <div
      className="progress-bar"
      role="progressbar"
      style={{
        width: `${progress}%`,
        backgroundColor: progress >= 100 ? "#28a745" : "#28a745", // green if complete or on time
        borderRadius: "4px",
        transition: "width 0.5s ease",
      }}
      aria-valuenow={progress}
      aria-valuemin="0"
      aria-valuemax="100"
    ></div>
  </div>
)}

        </div>
      </div>
    );
  },
}


,

    // {
    //   Header: " Employee ID",
    //   accessor: "emp_id",
    //   filterable: false,
    //   id: "emp_id",
    //   accessor: (obj) => {
    //     return (
    //       <>
    //         <div className="flex-grow-1">
    //           <div>
    //             <Link
    //               to="#"
    //               onClick={() => viewEmployee(obj)}
    //               className="link-body-emphasis mb-0"
    //             >
    //               {" "}
    //               <React.Fragment>{obj.emp_id}</React.Fragment>
    //             </Link>
    //           </div>
    //         </div>
    //       </>
    //     );
    //   },
    // },

    {
      Header: "Role",
      id: "role_id",
      filterable: false,
      accessor: (obj) => {
        // console.log("obj", obj);
        
        const RoleData = GetLocalStorageData("role");
      
        
        let thisRole = RoleData
          ? RoleData.filter((data) => obj.role?.id === data.id)
          : [];
        return (
          <>
            {thisRole.map((d) => (
              <React.Fragment>{d.name}</React.Fragment>
            ))}
          </>
        );
      },
    },
    {
      Header: "Department",
      id: "department",
      filterable: false,
      accessor: (obj) => {
        let thisDepartment = DepartmentData
          ? DepartmentData.filter((data) =>
              obj.primary_department_id_list.includes(data.id)
            )
          : [];

        let firstDep_name = thisDepartment?.length
          ? thisDepartment[0].name
          : "";

        let subDepList = thisDepartment?.length
          ? thisDepartment.filter((datas, index) => {
              if (index !== 0) {
                return datas;
              }
            })
          : [];

        return (
          <span>
            <Button
              color="light"
              id={`depListRef-${obj.id}`}
              className="position-relative"
            >
              <React.Fragment>{firstDep_name}</React.Fragment>
              {subDepList.length > 0 ? (
                <span>
                  <Badge
                    //id="tooltipwithHtml"
                    pill
                    color="success"
                    className="position-absolute top-0 start-100 translate-middle"
                  >
                    +{subDepList.length}
                    <span className="visually-hidden">Departments</span>
                  </Badge>

                  <UncontrolledTooltip
                    placement="bottom"
                    target={`depListRef-${obj.id}`}
                  >
                    {" "}
                    <div className="mt-1">
                      {subDepList.map((item, key) => (
                        <p className="mb-1">{item.name}</p>
                      ))}
                    </div>{" "}
                  </UncontrolledTooltip>
                </span>
              ) : (
                ""
              )}
            </Button>
          </span>
        );
      },
    },
    {
      Header: "Work Schedule",
      id: "work-schedule",
      filterable: false,
      accessor: (obj) => {
        const WorkSchedule = GetLocalStorageData("work_schedule");
        let workscheduleData = WorkSchedule
          ? WorkSchedule.filter((data) => obj.work_schedule_id === data.id)
          : [];
        const workdayData =
          workscheduleData.length > 0 ? workscheduleData[0].workday : [];
        const days = [
          { id: 1, name: "M", desc: "Monday" },
          { id: 2, name: "T", desc: "Tuesday" },
          { id: 3, name: "W", desc: "Wednesday" },
          { id: 4, name: "T", desc: "Thursday" },
          { id: 5, name: "F", desc: "Friday" },
          { id: 6, name: "S", desc: "Saturday" },
          { id: 7, name: "S", desc: "Sunday" },
        ];
        let timings = [];
        const ws_rowId = workscheduleData.find(
          (d) => d.id === obj.work_schedule_id
        );

        for (let i = 0; i < days.length; i++) {
          for (let j = 0; j < workdayData.length; j++) {
            if (
              days[i].desc.toLowerCase() === workdayData[j].s_day.toLowerCase()
            ) {
              timings.push({
                ws_id: ws_rowId.id,
                id: days[i].id,
                name: workdayData[j].s_day,
                s_hr: workdayData[j].s_hr,
                s_min: workdayData[j].s_min,
                e_hr: workdayData[j].e_hr,
                e_min: workdayData[j].e_min,
                is_day_on: workdayData[j].is_day_on,
              });
            }
          }
        }

        let htmltag = days.map((day, i) => {
          let thisDayTimeObj = timings.find((timing) => timing.id === day.id);

          return (
            <React.Fragment key={day.id}>
              <span
                className={
                  !!thisDayTimeObj && thisDayTimeObj.is_day_on === true
                    ? "fw-bold me-1"
                    : "fw-normal fw-lighter me-1"
                }
                id={`t_${thisDayTimeObj?.ws_id}_${thisDayTimeObj?.id}`}
              >
                {day.name}
              </span>
              <UncontrolledTooltip
                className="lc_tooltip"
                placement="top"
                target={`t_${thisDayTimeObj?.ws_id}_${thisDayTimeObj?.id}`}
              >
                {thisDayTimeObj?.name}{" "}
                {!!thisDayTimeObj && thisDayTimeObj.is_day_on === true && (
                  <>
                    {`${thisDayTimeObj.s_hr}:${thisDayTimeObj.s_min} - ${thisDayTimeObj.e_hr}:${thisDayTimeObj.e_min}`}
                  </>
                )}
              </UncontrolledTooltip>
            </React.Fragment>
          );
        });
        return (
          <>
            {workscheduleData.map((d) => (
              <div key={d.id}>
                {d.name}
                <div>{htmltag}</div>
              </div>
            ))}
          </>
        );
      },
    },

    {
      Header: "Reporting Manager",
      filterable: false,
      id: "reporting_manager_id",
      accessor: (obj) => {
        let rm_obj =
          EmployeeData.find((d) => d.id === obj.reporting_manager_id) || null;
          

        if (!rm_obj) {
          return (
            <div className="d-flex gap-2 align-items-center text-muted">
              <div
                className="avatar-xs rounded-circle d-flex justify-content-center align-items-center"
                style={{
                  background: "#E9ECEF",
                  width: "30px",
                  height: "30px",
                  color: "#6C757D",
                }}
              >
                <i className="fas fa-user-slash"></i>{" "}
                {/* Icon for no manager */}
              </div>
              <div>
                <span className="fw-semibold">Not Assigned</span>
              </div>
            </div>
          );
        }

        return rm_obj.profile_url ? (
          <div className="d-flex gap-2 align-items-center">
            <div className="flex-shrink-0">
              <img
                src={rm_obj.profile_url}
                alt="Profile"
                className="avatar-xs rounded-circle"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="flex-grow-1">
              <Link to="#" className="link-body-emphasis mb-0">
                <h5 className="fs-14 mb-1">{rm_obj.first_name}</h5>
              </Link>
              <div>{rm_obj.email}</div>
            </div>
          </div>
        ) : (
          <div className="d-flex gap-2 align-items-center">
            <div className="flex-shrink-0">
              <div
                className="avatar-xs rounded-circle d-flex justify-content-center align-items-center"
                style={{
                  background: "#0ab39c",
                  width: "30px",
                  height: "30px",
                }}
                data-bs-toggle="tooltip"
                title={rm_obj.first_name}
              >
                <span className="text-white fw-bold">
                  {rm_obj?.first_name?.charAt(0).toUpperCase() || ""}
                </span>
              </div>
            </div>
            <div className="flex-grow-1">
              <Link to="#" className="link-body-emphasis mb-0">
                <h5 className="fs-14 mb-1">{rm_obj.first_name}</h5>
              </Link>
              <div>{rm_obj.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        let status = obj.is_active ? "Active" : "Inactive";
        let statusClass = obj.is_active ? "success" : "warning";
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
      emp_id: "",
      first_name: "",
      last_name: "",
      email: "",
      dob: previousDateFormat(new Date()),
      joining_date: String(new Date()),
      id_proof: null,
      file_1: null,
      file_2: null,
      file_3: null,
      file_4: null,
      file_5: null,
      country_code: "+91",
      contact_number: "",
      gender: 0,
      primary_department_id_list: [],
      branch_id_list: [],
      role_id: 0,
      reporting_manager_id: 0,
      work_schedule_id: 0,
      profile_timezone: "Asia/Kolkata",
      is_active: true,
      is_manager: false,
      profile_url: null,
      cf_values: CustomFieldsForThisForm || [],
      outside_range_notes_required: true,
      allow_attendance_outside_the_range: false,
      can_web_checkin:false,
      allowed_attendance_methods:{
        requires_face_verification: false,
        requires_biometric_authentication: false,
        allow_manual_checkin: false,
      }
    };
  }, [version]);

  const filterKey = "is_active";
  const filterOptions = [
    {
      option: true,
      label: "Active",
      count: employee_data.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count: employee_data.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  document.title = `Employee | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={employee_data}
        formname={employee_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"35%"}
        import_width_per={"50%"}
        initialActiveTab={"2"}
      />
    </React.Fragment>
  );
};

export default Employee;
