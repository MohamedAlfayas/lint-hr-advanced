import React, { useEffect } from "react";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useState } from "react";
import { useMemo } from "react";
import InfoTable from "../../component/common/table/InfoTable";
import { Api } from "../../common/api/Api";
import { useDispatch, useSelector } from "react-redux";
import { setRole } from "../../redux/reducers/ChildReducer/RoleReducer";
import RsuiteTable from "../../component/common/table/RsuiteTable";
import {
  default_roles_list,
  role_component_name,
} from "../../common/constant/Constants";

const Roles = () => {
  document.title = `Role | ${MetaTitle}`;

  const dispatch = useDispatch();

  const { role_data } = useSelector((state) => state.RoleReducer);
  // console.log("Role DAta = ",role_data);

  useEffect(() => {
    Api({
      method: "GET",
      url: "/role/get-role/",
    })
      .then((res) => {
        console.log("RES = ", res);
        dispatch(setRole(res?.data?.data));
      })
      .catch((err) => {
        console.log("ERR = ", err);
      });
  }, []);

  const additionalColumn = [
    {
      Header: "Name",
      filterable: false,
      id: "name",
      accessor: (obj) => {
        return <b>{obj.name}</b>;
      },
    },
    {
      Header: "Employees",
      accessor: "total_employees",
      filterable: false,
      id: "total_employees",
    },
    {
      Header: "Permissions",
      accessor: "roles",
      filterable: false,
      id: "roles",
      accessor: (obj) => {
        let total_roles = 0;

        obj.roles_list.map((d) => {
          let this_dep_role = d.permission.filter(
            (p) => p.checked === true
          ).length;
          total_roles += this_dep_role;
        });

        return <b>{total_roles}</b>;
      },
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        let status = obj.status === 1 ? "Primary" : "Secondary";
        let statusClass = obj.status === 1 ? "success" : "info";
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
      name: "",
      total_employees: 0,
      roles_list: default_roles_list,
      status: 1,
      description: "",
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    {
      option: 1,
      label: "Primary",
      count: role_data.filter((e) => e[filterKey] === 1).length || 0,
    },
    {
      option: 2,
      label: "Secondary",
      count: role_data.filter((e) => e[filterKey] === 2).length || 0,
    },
  ];

  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={role_data}
        formname={role_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"60%"}
        table_class={"Lc_leave_apply_table me-n3 ms-n3"}
      />
    </React.Fragment>
  );
};

export default Roles;
