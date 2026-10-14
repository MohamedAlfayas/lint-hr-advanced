import React, { useEffect } from "react";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useState } from "react";
import { useMemo } from "react";
import InfoTable from "../../component/common/table/InfoTable";
import { Api } from "../../common/api/Api";
import { useDispatch, useSelector } from "react-redux";
import { setRole } from "../../redux/reducers/ChildReducer/RoleReducer";
import RsuiteTable from "../../component/common/table/RsuiteTable";
import { role_component_name } from "../../common/constant/Constants";

import { default_roles_list } from "../../common/constant/RoleConstants";
import {
  ApvChip,
  ApvStatus,
  ApvTitle,
} from "../../component/common/approval/ApprovalCells";

const Roles = () => {
  const dispatch = useDispatch();

  const frontendRoleUUIDs = useMemo(() => {
    return new Set(
      default_roles_list.flatMap((section) =>
        section.permission.map((perm) => perm.role_uuid),
      ),
    );
  }, []);

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
      accessor: (obj) => (
        <ApvTitle
          icon="ri-shield-user-line"
          title={obj.name}
          sub={obj.description}
          tone={obj.is_admin ? "danger" : "primary"}
        />
      ),
    },
    {
      Header: "Employees",
      filterable: false,
      id: "total_employees",
      accessor: (obj) => (
        <ApvChip icon="ri-team-line">{String(obj.total_employees ?? 0)}</ApvChip>
      ),
    },
    {
      Header: "Permissions",
      filterable: false,
      id: "roles",
      accessor: (obj) => {
        const matchedCount = (obj.roles_list || []).filter((uuid) =>
          frontendRoleUUIDs.has(uuid),
        ).length;
        return <ApvChip icon="ri-shield-keyhole-line">{String(matchedCount)}</ApvChip>;
      },
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) =>
        obj.status === 1 ? (
          <ApvStatus tone="success" icon="ri-star-line" label="Primary" />
        ) : (
          <ApvStatus tone="info" icon="ri-user-settings-line" label="Secondary" />
        ),
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
