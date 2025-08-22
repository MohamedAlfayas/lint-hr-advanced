import React, { useEffect, useMemo } from "react";
import TableContainer from "../../component/common/table/TableContainer";
import { Link } from "react-router-dom";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
//import images

import avatar2 from "../../assets/images/users/avatar-2.jpg";

import { format } from "date-fns";

//SimpleBar
import Select from "react-select";

import SimpleBar from "simplebar-react";
import { ParseTime } from "../../common/js/ParseTime";
import { ConvertSecondsToTime } from "../../common/js/ConvertSecondsToTime";
import {
  absent_display,
  holiday_display,
  late_entry_display,
  leave_display,
  on_time_entry_display,
  week_off_display,
} from "../../common/constant/Constants";
const EmployeeActivityTable = ({ team_data }) => {
  const EmployeeData = GetLocalStorageData("employee") || [];
  const DepartmentData = GetLocalStorageData("department") || [];

  return (
    <React.Fragment>
      <SimpleBar style={{ maxHeight: "750px" }} className="p-3 pt-0">
        <div className="acitivity-timeline acitivity-main mt-2">
          {team_data.map((d) => {
            let emp_detail = EmployeeData.find((e) => e.id === d.employee_id);

            let dep_name_list = DepartmentData.filter((dep) => {
              if (d.primary_department_id_list.includes(dep.id)) {
                return dep.name;
              }
            }).map((l) => l.name);

            let entry_status =
              d?.is_late === true
                ? late_entry_display
                : d?.is_ontime === true
                ? on_time_entry_display
                : d?.is_holiday === true
                ? holiday_display
                : d?.is_week_off === true
                ? week_off_display
                : d?.is_leave_approved === true
                ? leave_display
                : d?.no_data === true
                ? absent_display
                : on_time_entry_display;

            return (
              <div className="acitivity-item d-flex mt-1">
                {!!emp_detail && (
                  <>
                    <div className="flex-shrink-0">
                      {!!emp_detail?.profile_url ? (
                        <img
                          src={emp_detail?.profile_url}
                          alt=""
                          className="avatar-xs rounded-circle acitivity-avatar"
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
                          title={emp_detail.first_name}
                        >
                          <span
                            className="first_letter"
                            style={{ color: "white" }}
                          >
                            {emp_detail?.first_name?.charAt(0) || ""}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
                      <h6 className="mb-0 lh-base">
                        {emp_detail?.first_name} {emp_detail?.last_name}
                        <i
                          class={`mdi mdi-circle fs-10 align-middle text-${entry_status?.class} me-1 ms-2`}
                        ></i>
                        <span class="fs-12 mb-0 text-muted">
                          {entry_status?.text || ""}
                        </span>
                      </h6>

                      <p className="text-muted mb-2">
                        {" "}
                        Department -
                        {dep_name_list.map((dn, index) => (
                          <>
                            {index > 0 ? " / " : ""} {dn}
                          </>
                        ))}
                      </p>

                      {d.is_present === true && (
                        <>
                          {!!d.first_check_in_time && (
                            <p className="mb-1 text-muted">
                              <small className="mb-0 text-muted">
                                Login -{" "}
                                {format(
                                  ParseTime(d.first_check_in_time),
                                  "h:mm a"
                                )}
                              </small>
                            </p>
                          )}

                          {!!d.last_check_out_time && (
                            <>
                              <p className="mb-1 text-muted">
                                <small className="mb-0 text-muted">
                                  Logout -{" "}
                                  {format(
                                    ParseTime(d.last_check_out_time),
                                    "h:mm a"
                                  )}
                                </small>
                              </p>

                              <p className="mb-1 text-muted">
                                <small className="mb-0 text-muted">
                                  Total -{" "}
                                  {ConvertSecondsToTime(
                                    d.final_paid_hr_in_seconds
                                  )}
                                </small>
                              </p>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};

export default EmployeeActivityTable;
