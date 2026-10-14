import React, { useMemo } from "react";
import TableContainer from "../../../component/common/table/TableContainer";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { ApvEmployee } from "../../../component/common/approval/ApprovalCells";

const OrgTable = ({ departmentId }) => {
  const EmployeeData = GetLocalStorageData("employee") || [];
  const DepartmentData = GetLocalStorageData("department") || [];

  const TableData = EmployeeData.filter(
    (d) =>
      d.primary_department_id_list.includes(departmentId) &&
      d.is_active === true,
  );

  const columns = [
    {
      Header: "Name",
      accessor: "first_name",
      filterable: false,
      id: "first_name",
      accessor: (obj) => <ApvEmployee employee={obj} />,
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

        return <ApvEmployee employee={rm_obj} />;
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
