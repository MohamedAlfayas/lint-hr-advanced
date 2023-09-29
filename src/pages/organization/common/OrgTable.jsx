import React, { useMemo } from "react";
import TableContainer from "../../../component/common/table/TableContainer";
import { Link } from "react-router-dom";

import {
  Badge,
  Button,
  ListGroup,
  ListGroupItem,
  UncontrolledTooltip,
} from "reactstrap";

const OrgTable = ({ teamMembersID }) => {
  let globalData = JSON.parse(localStorage.getItem("lcEdu_GlobalData"));
  console.log("globalData.......");
  console.log(globalData);
  const department = globalData.Department;
  const TeamData = globalData.Employee;

  const tableData = TeamData.filter((obj) =>
    teamMembersID.includes(parseInt(obj.id))
  );

  const columns = useMemo(() => {
    return [
      {
        Header: "ID",
        accessor: (cellProps) => {
          return <Link to="#">{cellProps.id}</Link>;
        },
        disableFilters: false,
        filterable: false,
        sortBy: [
          {
            desc: false,
          },
        ],
      },

      {
        Header: "Name",
        accessor: "name",
        tdClass: "d-flex",
        accessor: (cellProps) => {
          const imgsrc =
            cellProps.id % 2 === 0
              ? require("../../../assets/images/users/avatar-3.jpg")
              : require("../../../assets/images/users/avatar-8.jpg");
          return (
            <div style={{ textAlign: "left" }}>
              <img
                src={cellProps.img}
                alt={cellProps.name}
                className="avatar-xs rounded-3 me-2"
              />
              <span style={{ marginLeft: "7px" }}>
                <b>{cellProps.name}</b>
              </span>
            </div>
          );
        },
        disableFilters: false,
        filterable: false,
      },
      {
        Header: "Department",
        accessor: "dep",
        disableFilters: false,
        filterable: false,
        accessor: (cellProps) => {
          console.log(cellProps);
          //const depName = department.filter((p) => p.id === cellProps.dep[0]);

          var depList = department.filter((obj) =>
            cellProps.dep.includes(parseInt(obj.id))
          );

          //console.log(depList);

          let row_id = cellProps.id;

          return (
            <span>
              <Button
                color="light"
                id={`depListRef-${row_id}`}
                className="position-relative">
                {depList[0].name}
                {depList.length > 1 ? (
                  <span>
                    <Badge
                      //id="tooltipwithHtml"
                      pill
                      color="success"
                      className="position-absolute top-0 start-100 translate-middle">
                      +{depList.length}
                      <span className="visually-hidden">Departments</span>
                    </Badge>

                    <UncontrolledTooltip
                      placement="bottom"
                      target={`depListRef-${row_id}`}>
                      {" "}
                      <div class="mt-1">
                        {depList.map((item, key) => (
                          <p class="mb-1">{item.name}</p>
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
        Header: "Status",
        disableFilters: true,
        filterable: true,
        accessor: (cellProps) => {
          switch (cellProps.status) {
            case "Active":
              return (
                <span className="badge bg-success-subtle text-success text-uppercase">
                  {" "}
                  {cellProps.status}
                </span>
              );
            case "Refund":
              return (
                <span className="badge bg-warning-subtle  text-warning text-uppercase">
                  {" "}
                  {cellProps.status}
                </span>
              );
            default:
              return (
                <span className="badge bg-danger-subtle  text-danger text-uppercase">
                  {" "}
                  {cellProps.status}
                </span>
              );
          }
        },
      },
      {
        Header: "Actions",
        disableFilters: true,
        filterable: true,
        accessor: (cellProps) => {
          return (
            <React.Fragment>
              <p>
                <Link to="#" className="link-info">
                  View
                </Link>
              </p>
            </React.Fragment>
          );
        },
      },
    ];
  }, []);

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

export default OrgTable;
