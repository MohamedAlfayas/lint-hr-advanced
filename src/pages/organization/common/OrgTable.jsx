import React, { useMemo } from "react";
import TableContainer from "../../../component/common/table/TableContainer";
import { Link } from "react-router-dom";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";

import {
  Badge,
  Button,
  ListGroup,
  ListGroupItem,
  UncontrolledTooltip,
} from "reactstrap";

const OrgTable = ({ departmentId }) => {
  const EmployeeData = GetLocalStorageData("employee") || [];
  const DepartmentData = GetLocalStorageData("department") || [];

  const TableData = EmployeeData.filter((d) =>
    d.primary_department_id_list.includes(departmentId)
  );

  const columns = [
    {
      Header: "Name",
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
                className="avatar-xs rounded-circle acitivity-avatar"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="flex-grow-1 align-items-left">
              <div>
                <Link
                  to="#"
                  // onClick={() => viewEmployee(obj)}
                  className="link-body-emphasis mb-0"
                >
                  {" "}
                  <h5 className="fs-14 mb-1 text text-start">{obj.fname}</h5>
                </Link>
              </div>
              <div className="text-start">{obj.email}</div>
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
            <div className="flex-grow-1 align-items-left">
              <div>
                <Link
                  to="#"
                  onClick={() => viewEmployee(obj)}
                  className="link-body-emphasis mb-0"
                >
                  {" "}
                  <h5 className="fs-14 mb-1 text text-start">{obj.fname}</h5>
                </Link>
              </div>
              <div className="text-start">{obj.email}</div>
            </div>
          </div>
        );
      },
      // filterable: false,
      // id: "nameAndEmail",
    },
    // {
    //   Header: "ID",
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

    // {
    //   Header: "Role",
    //   id: "role_id",
    //   filterable: false,
    //   accessor: (obj) => {
    //     const RoleData = GetLocalStorageData("role");
    //     let thisRole = RoleData
    //       ? RoleData.filter((data) => obj.role_id === data.id)
    //       : [];
    //     return (
    //       <>
    //         {thisRole.map((d) => (
    //           <React.Fragment>{d.name}</React.Fragment>
    //         ))}
    //       </>
    //     );
    //   },
    // },
    // {
    //   Header: "Department",
    //   id: "department",
    //   filterable: false,
    //   accessor: (obj) => {
    //     let thisDepartment = DepartmentData
    //       ? DepartmentData.filter((data) =>
    //           obj.primary_department_id_list.includes(data.id)
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
      Header: "Reporting Manager",
      filterable: false,
      id: "reporting_manager_id",
      accessor: (obj) => {
        let rm_obj =
          EmployeeData.find((d) => d.id === obj.reporting_manager_id) || null;

        return !!rm_obj ? (
          rm_obj.profile_url ? (
            <div className="d-flex gap-2 align-items-center">
              <div className="flex-shrink-0">
                <img
                  src={rm_obj.profile_url}
                  alt=""
                  className="avatar-xs rounded-circle acitivity-avatar"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="flex-grow-1">
                <div>
                  <Link to="#" className="link-body-emphasis mb-0">
                    {" "}
                    <h5 className="fs-14 mb-1 text-start">{rm_obj.fname}</h5>
                  </Link>
                </div>
                <div className="text-start">{rm_obj.email}</div>
              </div>
            </div>
          ) : (
            <div className="d-flex gap-2 align-items-center">
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
                  title={rm_obj.fname}
                >
                  <span className="first_letter" style={{ color: "white" }}>
                    {rm_obj.fname.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-grow-1">
                <div>
                  <Link to="#" className="link-body-emphasis mb-0">
                    {" "}
                    <h5 className="fs-14 mb-1 text-start">{rm_obj.fname}</h5>
                  </Link>
                </div>
                <div className="text-start">{rm_obj.email}</div>
              </div>
            </div>
          )
        ) : (
          "-----------------"
        );
      },
    },
    // {
    //   Header: "Status",
    //   id: "status",
    //   filterable: false,
    //   accessor: (obj) => {
    //     let status = obj.is_active ? "Active" : "Inactive";
    //     let statusClass = obj.is_active ? "success" : "warning";
    //     return (
    //       <span
    //         className={`badge text-uppercase bg-${statusClass}-subtle text-${statusClass}`}
    //       >
    //         {" "}
    //         {status}{" "}
    //       </span>
    //     );
    //   },
    // },
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

export default OrgTable;
