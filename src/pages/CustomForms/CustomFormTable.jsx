import React, { useEffect } from "react";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useState } from "react";
import { useMemo } from "react";
import InfoTable from "../../component/common/table/InfoTable";
import { Api } from "../../common/api/Api";
import { useDispatch, useSelector } from "react-redux";
import { setRole } from "../../redux/reducers/ChildReducer/RoleReducer";
import RsuiteTable from "../../component/common/table/RsuiteTable";
import { custom_form_component_name } from "../../common/constant/Constants";

import { default_roles_list } from "../../common/constant/RoleConstants";

const CustomFormTable = () => {
  const dispatch = useDispatch();

  const { role_data } = useSelector((state) => state.RoleReducer);


  useEffect(() => {
    Api({
      method: "GET",
      url: "/role/get-role/",
    })
      .then((res) => {
        dispatch(setRole(res?.data?.data));
      })
      .catch((err) => {
        console.log("ERR");
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
        let total_roles = obj.roles_list.length;

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
      roles_list: [],
      status: 1,
      description: "",
      is_admin: false,
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
        formname={custom_form_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"100%"}
        table_class={"Lc_leave_apply_table me-n3 ms-n3"}
      />
    </React.Fragment>
  );
};

export default CustomFormTable;
