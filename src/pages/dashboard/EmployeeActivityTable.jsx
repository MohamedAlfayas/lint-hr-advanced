import React, { useMemo } from "react";
import TableContainer from "../../component/common/table/TableContainer";
import { Link } from "react-router-dom";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
const EmployeeActivityTable = ({ departmentId }) => {
  const EmployeeData = GetLocalStorageData("employee") || [];
  const DepartmentData = GetLocalStorageData("department") || [];

  const TableData = EmployeeData;

  //  const TableData = EmployeeData.filter((d) =>
  //   d.primary_department_id_list.includes(departmentId)
  // );

  const columns = [
    {
      Header: "Employee",
      accessor: "fname",
      filterable: false,
      id: "fname",
      accessor: (obj) => {
        return obj.profile_url ? (
          <div className="d-flex gap-2 align-items-center">
            <div className="flex-shrink-0">
              <img
                src={obj.profile_url}
                alt=""
                className="avatar-xs rounded-circle"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="flex-grow-1">
              <div>
                <Link
                  to="#"
                  // onClick={() => viewEmployee(obj)}
                  className="link-body-emphasis mb-0"
                >
                  {" "}
                  <h5 className="fs-14 mb-1 text text-start">
                    {obj.fname}{" "}
                    <i class="mdi mdi-circle fs-10 align-middle text-primary me-1 ms-2"></i>
                    <span class="fs-12 mb-0 text-muted">Late</span>
                  </h5>
                </Link>
              </div>
              <div className="text-start">Department | Role</div>
              <div className="text-start mt-1">Login - 9:18 AM</div>
              <div className="text-start ">Logout - </div>
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
                title={obj.fname}
              >
                <span className="first_letter" style={{ color: "white" }}>
                  {obj.fname.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div>
                <Link
                  to="#"
                  // onClick={() => viewEmployee(obj)}
                  className="link-body-emphasis mb-0"
                >
                  {" "}
                  <h5 className="fs-14 mb-1">{obj.fname}</h5>
                </Link>
              </div>
              <div>{obj.email}</div>
            </div>
          </div>
        );
      },
      // filterable: false,
      // id: "nameAndEmail",
    },
  ];
  return (
    <React.Fragment>
      <TableContainer
        columns={columns || []}
        data={TableData || []}
        isPagination={false}
        isGlobalFilter={false}
        iscustomPageSize={false}
        isBordered={false}
        customPageSize={40}
        className="custom-header-css table align-middle table-nowrap"
        tableClass="table-centered align-middle table-nowrap mb-0"
        theadClass="text-muted table-light"
        SearchPlaceholder="Search Products..."
        showInfo={false}
      />
    </React.Fragment>
  );
};

export default EmployeeActivityTable;
