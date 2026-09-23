import React, { useState } from "react";

import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
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
import Swal from "sweetalert2";

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
  const [rmModalOpen, setRmModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentRM, setCurrentRM] = useState(null);
  const [rmSearch, setRmSearch] = useState("");

  const { employee_data } = useSelector((state) => state.EmployeeReducer);
  const todayAttendance = useSelector(
    (state) => state.EmployeeProgressBarReducer,
  );

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

        dispatch(setTodayAttendanceProgressBar(result));
      } catch (err) {
        console.error("Error fetching attendance status:", err);
      }
    };

    fetchAttendanceStatus();
  }, []);

  const handleChangeReportingManager = async (newRM) => {
    if (!selectedEmployee || newRM.id === currentRM) return;

    const result = await Swal.fire({
      title: "Change Reporting Manager?",
      html: `Assign <strong style="color:#7066e0">${newRM.first_name}</strong> as Reporting Manager?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0ab39c",
      confirmButtonText: "Yes, Change",
    });

    // 👉 Stop here if cancelled
    if (!result.isConfirmed) return;

    // 👉 call API here
    // await updateReportingManager(selectedEmployee.id, newRM.id);

    // ✅ Build updated employee (also update the info object for the modal UI)
    const updatedEmployee = {
      ...selectedEmployee,
      reporting_manager_id: newRM.id,
      reporting_manager_info: {
        id: newRM.id,
        emp_id: newRM.emp_id,
        first_name: newRM.first_name,
        last_name: newRM.last_name,
        email: newRM.email,
        profile_url: newRM.profile_url,
      },
    };

    // ✅ Update table data
    dispatch(
      setEmployee(
        employee_data.map((emp) =>
          emp.id === selectedEmployee.id ? updatedEmployee : emp,
        ),
      ),
    );

    // ✅ Update form data silently
    dispatch(setFormObj(updatedEmployee));

    // ✅ Keep selectedEmployee in sync so modal shows new manager
    setSelectedEmployee(updatedEmployee);

    // ✅ Local UI cleanup
    setCurrentRM(newRM.id);
    setRmModalOpen(false);

    // ✅ Success feedback
    await Swal.fire({
      icon: "success",
      title: "Reporting Manager Updated!",
      html: `<strong>${newRM.first_name}</strong> has been successfully assigned as the Reporting Manager.`,
      confirmButtonColor: "#0ab39c",
    });
  };
  const handleCloseRmModal = () => {
    setRmModalOpen(false);
    setRmSearch(""); // ✅ clear search
  };

  useEffect(() => {
    if (!rmModalOpen) {
      setRmSearch("");
    }
  }, [rmModalOpen]);

  const CustomFieldsForThisForm = GetCustomField("employee") || [];
  const DepartmentData = GetLocalStorageData("department") || [];

  const viewEmployee = (obj) => {
    dispatch(setFormTitle("Employee Details"));
    dispatch(setFormObj(obj));
    dispatch(setFormWidthPercentage("30%"));
    dispatch(setComponentToShow(profile_view_component_name));
    dispatch(toggleRSBView(true));
  };

  const filteredEmployees = employee_data
    ?.filter((emp) => {
      return (
        emp.is_active === true &&
        emp.id !== selectedEmployee?.id &&
        emp.first_name?.toLowerCase().includes(rmSearch.toLowerCase())
      );
    })
    .sort((a, b) => {
      // ✅ Bring selected RM to top
      if (a.id === currentRM) return -1;
      if (b.id === currentRM) return 1;
      return 0;
    });

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
          (emp) => emp.employee?.id === obj.id,
        );

        const totalWorkDuration = employeeAttendance?.total_work_duration ?? 0;
        const totalTimeWorked = employeeAttendance?.total_time_worked ?? 0;

        const progress =
          totalWorkDuration > 0
            ? Math.min(
                100,
                Math.round((totalTimeWorked / totalWorkDuration) * 100),
              )
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
              {/* {obj.is_active && (
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
              )} */}
            </div>
          </div>
        );
      },
    },

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
              obj.primary_department_id_list.includes(data.id),
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

        // Ensure WorkSchedule is always an array
        const workScheduleList = Array.isArray(WorkSchedule)
          ? WorkSchedule
          : Array.isArray(WorkSchedule?.data)
            ? WorkSchedule.data
            : [];

        const workscheduleData = workScheduleList.filter(
          (data) => data.id === obj.work_schedule_id,
        );

        const workdayData =
          workscheduleData.length > 0 ? workscheduleData[0].workday || [] : [];

        const days = [
          { id: 1, name: "M", desc: "Monday" },
          { id: 2, name: "T", desc: "Tuesday" },
          { id: 3, name: "W", desc: "Wednesday" },
          { id: 4, name: "T", desc: "Thursday" },
          { id: 5, name: "F", desc: "Friday" },
          { id: 6, name: "S", desc: "Saturday" },
          { id: 7, name: "S", desc: "Sunday" },
        ];

        const timings = [];

        const ws_rowId =
          workscheduleData.find((d) => d.id === obj.work_schedule_id) || {};

        for (let i = 0; i < days.length; i++) {
          for (let j = 0; j < workdayData.length; j++) {
            if (
              days[i].desc.toLowerCase() === workdayData[j].s_day.toLowerCase()
            ) {
              timings.push({
                ws_id: ws_rowId?.id,
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

        const htmltag = days.map((day) => {
          const thisDayTimeObj = timings.find((timing) => timing.id === day.id);

          const tooltipId = `t_${ws_rowId?.id || 0}_${day.id}`;

          return (
            <React.Fragment key={day.id}>
              <span
                className={
                  thisDayTimeObj?.is_day_on
                    ? "fw-bold me-1"
                    : "fw-normal fw-lighter me-1"
                }
                id={tooltipId}
              >
                {day.name}
              </span>

              <UncontrolledTooltip
                className="lc_tooltip"
                placement="top"
                target={tooltipId}
              >
                {thisDayTimeObj?.name || day.desc}

                {thisDayTimeObj?.is_day_on && (
                  <>
                    <br />
                    {`${thisDayTimeObj.s_hr}:${thisDayTimeObj.s_min} - ${thisDayTimeObj.e_hr}:${thisDayTimeObj.e_min}`}
                  </>
                )}
              </UncontrolledTooltip>
            </React.Fragment>
          );
        });

        return (
          <>
            {workscheduleData.length > 0 ? (
              workscheduleData.map((d) => (
                <div key={d.id}>
                  {d.name}
                  <div>{htmltag}</div>
                </div>
              ))
            ) : (
              <div>-</div>
            )}
          </>
        );
      },
    },
    {
      Header: "Reporting Manager",
      filterable: false,
      id: "reporting_manager_id",
      accessor: (obj) => {
        // const rm_obj =
        //   EmployeeData.find((d) => d.id === obj.reporting_manager_id) || null;
          const rm_obj =
            obj.reporting_manager_info ||
            EmployeeData.find((d) => d.id === obj.reporting_manager_id) ||
            null;

        const handleRMClick = (e) => {
          e.preventDefault();
          e.stopPropagation(); // prevents row click

          setSelectedEmployee(obj);
          setCurrentRM(obj.reporting_manager_id || null);
          setRmModalOpen(true);
        };

        // 🚫 Not Assigned
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
                <i className="fas fa-user-slash" />
              </div>
              <span className="fw-semibold">Not Assigned</span>
            </div>
          );
        }

        // ✅ Assigned RM — avatar + name + email ALL clickable
        return (
          <div
            className="d-flex gap-2 align-items-center"
            role="button"
            style={{ cursor: "pointer" }}
            onClick={handleRMClick}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {rm_obj.profile_url ? (
                <img
                  src={rm_obj.profile_url}
                  alt="Profile"
                  className="avatar-xs rounded-circle"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  className="avatar-xs rounded-circle d-flex justify-content-center align-items-center"
                  style={{
                    background: "#0ab39c",
                    width: "30px",
                    height: "30px",
                  }}
                  title={rm_obj.first_name}
                >
                  <span className="text-white fw-bold">
                    {rm_obj.first_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Name + Email */}
            <div className="flex-grow-1">
              <h5 className="fs-14 mb-1 link-body-emphasis">
                {rm_obj.first_name} {rm_obj.last_name}
              </h5>
              <div className="text-muted">{rm_obj.email}</div>
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
      // dob: previousDateFormat(new Date()),
      dob: "",
      // joining_date: String(new Date()),
      joining_date: "",
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
      can_web_checkin: false,
      allowed_attendance_methods: {
        requires_face_verification: false,
        requires_biometric_authentication: false,
        allow_manual_checkin: false,
      },
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
      <Modal
        isOpen={rmModalOpen}
        toggle={handleCloseRmModal}
        centered
        size="lg"
      >
        <ModalHeader toggle={handleCloseRmModal}>
          Select Reporting Manager
        </ModalHeader>

        <ModalBody style={{ maxHeight: "400px", overflowY: "auto" }}>
          {/* 🔍 Search */}
          <div className="input-group mb-3">
            <span className="input-group-text bg-white">
              <i className="bx bx-search-alt"></i>
            </span>
            <Input
              type="text"
              placeholder="Search employee name..."
              value={rmSearch}
              onChange={(e) => setRmSearch(e.target.value)}
            />
          </div>

          {/* ✅ Filter + Sort */}
          {(() => {
            const currentRmId =
              selectedEmployee?.reporting_manager_info?.id ?? currentRM;

            const filteredEmployees = employee_data
              ?.filter(
                (emp) =>
                  emp.is_active === true &&
                  emp.id !== selectedEmployee?.id &&
                  `${emp.first_name} ${emp.last_name} ${emp.email}`
                    ?.toLowerCase()
                    .includes(rmSearch.toLowerCase()),
              )
              .sort((a, b) => {
                if (a.id === currentRmId) return -1;
                if (b.id === currentRmId) return 1;
                return 0;
              });

            return filteredEmployees && filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => {
                const isSelected = emp.id === currentRmId;

                return (
                  <div
                    key={emp.id}
                    className={`d-flex align-items-center p-2 mb-2 rounded cursor-pointer ${
                      isSelected
                        ? "bg-success-subtle border border-success"
                        : "hover-bg"
                    }`}
                    onClick={() => handleChangeReportingManager(emp)}
                  >
                    <div className="avatar-xs me-2">
                      {emp.profile_url ? (
                        <img
                          src={emp.profile_url}
                          alt=""
                          className="rounded-circle"
                          style={{ width: 32, height: 32, objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-success text-white d-flex justify-content-center align-items-center"
                          style={{ width: 32, height: 32 }}
                        >
                          {emp.first_name?.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="fw-semibold">
                        {emp.first_name} {emp.last_name}
                      </div>
                      <small className="text-muted">{emp.email}</small>
                    </div>

                    {isSelected && (
                      <Badge color="success" className="ms-auto">
                        Selected
                      </Badge>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted py-3">
                No Reporting Managers Available
              </div>
            );
          })()}
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default Employee;
