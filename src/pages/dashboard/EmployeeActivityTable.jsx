import React, { useMemo } from "react";
import TableContainer from "../../component/common/table/TableContainer";
import { Link } from "react-router-dom";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
//import images

import avatar2 from "../../assets/images/users/avatar-2.jpg";

//SimpleBar
import Select from "react-select";

import SimpleBar from "simplebar-react";
const EmployeeActivityTable = ({ departmentId }) => {
  const EmployeeData = GetLocalStorageData("employee") || [];
  const DepartmentData = GetLocalStorageData("department") || [];

  const TableData = EmployeeData;

  //  const TableData = EmployeeData.filter((d) =>
  //   d.primary_department_id_list.includes(departmentId)
  // );

  return (
    <React.Fragment>
      <SimpleBar style={{ maxHeight: "750px" }} className="p-3 pt-0">
        <div className="acitivity-timeline acitivity-main mt-2">
          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <img
                src={avatar2}
                alt=""
                className="avatar-xs rounded-circle acitivity-avatar"
              />
            </div>
            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-warning me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">Late</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>

              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Login - 09:18 AM</small>
              </p>
              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Logout -</small>
              </p>
            </div>
          </div>

          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <div
                className="avatar-xs rounded-circle acitivity-avatar"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#0ab39c",
                }}
                data-bs-toggle="tooltip"
                title={"Test"}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {"Test".charAt(0)}
                </span>
              </div>
            </div>

            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-success me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">Ontime</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>

              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Login - 09:18 AM</small>
              </p>

              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Logout - 07:35 PM</small>
              </p>
              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Total - 08:18 Hr</small>
              </p>
            </div>
          </div>

          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <img
                src={avatar2}
                alt=""
                className="avatar-xs rounded-circle acitivity-avatar"
              />
            </div>
            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-body me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">Leave</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>

              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Reason - Vacation</small>
              </p>
              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">
                  Date - Jan 1 to Jan 5 (4 Days)
                </small>
              </p>
            </div>
          </div>

          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <div
                className="avatar-xs rounded-circle acitivity-avatar"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#0ab39c",
                }}
                data-bs-toggle="tooltip"
                title={"Test"}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {"Test".charAt(0)}
                </span>
              </div>
            </div>

            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-danger me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">No Data</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>
            </div>
          </div>

          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <div
                className="avatar-xs rounded-circle acitivity-avatar"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#0ab39c",
                }}
                data-bs-toggle="tooltip"
                title={"Test"}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {"Test".charAt(0)}
                </span>
              </div>
            </div>

            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-secondary me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">Holiday</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>
              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">New Year</small>
              </p>
            </div>
          </div>

          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <div
                className="avatar-xs rounded-circle acitivity-avatar"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#0ab39c",
                }}
                data-bs-toggle="tooltip"
                title={"Test"}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {"Test".charAt(0)}
                </span>
              </div>
            </div>

            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-info me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">W/O</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>
            </div>
          </div>
          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <img
                src={avatar2}
                alt=""
                className="avatar-xs rounded-circle acitivity-avatar"
              />
            </div>
            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-warning me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">Late</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>

              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Login - 09:18 AM</small>
              </p>
              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Logout -</small>
              </p>
            </div>
          </div>
          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <img
                src={avatar2}
                alt=""
                className="avatar-xs rounded-circle acitivity-avatar"
              />
            </div>
            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-warning me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">Late</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>

              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Login - 09:18 AM</small>
              </p>
              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Logout -</small>
              </p>
            </div>
          </div>

          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <div
                className="avatar-xs rounded-circle acitivity-avatar"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#0ab39c",
                }}
                data-bs-toggle="tooltip"
                title={"Test"}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {"Test".charAt(0)}
                </span>
              </div>
            </div>

            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-success me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">Ontime</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>

              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Login - 09:18 AM</small>
              </p>

              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Logout - 07:35 PM</small>
              </p>
              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Total - 08:18 Hr</small>
              </p>
            </div>
          </div>

          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <img
                src={avatar2}
                alt=""
                className="avatar-xs rounded-circle acitivity-avatar"
              />
            </div>
            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-body me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">Leave</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>

              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Reason - Vacation</small>
              </p>
              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">
                  Date - Jan 1 to Jan 5 (4 Days)
                </small>
              </p>
            </div>
          </div>

          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <div
                className="avatar-xs rounded-circle acitivity-avatar"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#0ab39c",
                }}
                data-bs-toggle="tooltip"
                title={"Test"}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {"Test".charAt(0)}
                </span>
              </div>
            </div>

            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-danger me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">No Data</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>
            </div>
          </div>

          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <div
                className="avatar-xs rounded-circle acitivity-avatar"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#0ab39c",
                }}
                data-bs-toggle="tooltip"
                title={"Test"}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {"Test".charAt(0)}
                </span>
              </div>
            </div>

            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-secondary me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">Holiday</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>
              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">New Year</small>
              </p>
            </div>
          </div>

          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <div
                className="avatar-xs rounded-circle acitivity-avatar"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#0ab39c",
                }}
                data-bs-toggle="tooltip"
                title={"Test"}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {"Test".charAt(0)}
                </span>
              </div>
            </div>

            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-info me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">W/O</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>
            </div>
          </div>
          <div className="acitivity-item d-flex mt-1">
            <div className="flex-shrink-0">
              <img
                src={avatar2}
                alt=""
                className="avatar-xs rounded-circle acitivity-avatar"
              />
            </div>
            <div className="flex-grow-1 ms-3 border-bottom border-bottom-dashed">
              <h6 className="mb-0 lh-base">
                Natasha Carey{" "}
                <i class="mdi mdi-circle fs-10 align-middle text-warning me-1 ms-2"></i>
                <span class="fs-12 mb-0 text-muted">Late</span>
              </h6>
              <p className="text-muted mb-2">Department | Role</p>

              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Login - 09:18 AM</small>
              </p>
              <p className="mb-1 text-muted">
                <small className="mb-0 text-muted">Logout -</small>
              </p>
            </div>
          </div>
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};

export default EmployeeActivityTable;
