import React, { useMemo } from "react";
import TableContainer from "../../../component/common/table/TableContainer";
import { Link } from "react-router-dom";

const RoleListLable = () => {
  var Roles = {
    Roles: [
      {
        id: 1,
        name: "Admin",
        roles: [1, 2, 3, 4, 5, 6, 7],
        members: 43,
      },
      {
        id: 2,
        name: "Super Admin",
        roles: [1, 2, 3, 4, 5, 6, 7],
        members: 43,
      },
      {
        id: 3,
        name: "Manager",
        roles: [1, 2, 3, 4, 5, 6, 7],
        members: 43,
      },
      {
        id: 4,
        name: "Employee",
        roles: [1, 2, 3, 4, 5, 6, 7],
        members: 43,
      },
    ],
    RoleList: {
      1: "",
      2: "",
      3: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
      9: "",
      10: "",
      11: "",
    },
  };

  return (
    <React.Fragment>
      <TableContainer
        columns={columns || []}
        data={tableData || []}
        isPagination={false}
        isGlobalFilter={false}
        iscustomPageSize={false}
        isBordered={false}
        customPageSize={40}
        className="custom-header-css table align-middle table-nowrap"
        tableClass="table-centered align-middle table-nowrap mb-0"
        theadClass="text-muted table-light"
        SearchPlaceholder="Search Products..."
      />
    </React.Fragment>
  );
};

export default RoleListLable;
