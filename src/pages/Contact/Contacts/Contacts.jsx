import React, { useMemo } from "react";

import "react-toastify/dist/ReactToastify.css";

import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { useSelector } from "react-redux";
import { contacts_component_name } from "../../../common/constant/Constants";
import {
  ApvActive,
  ApvLink,
  ApvTitle,
  initialsOf,
} from "../../../component/common/approval/ApprovalCells";

const PHONE_ICONS = {
  1: "ri-briefcase-line",
  2: "ri-smartphone-line",
  3: "ri-home-line",
  4: "ri-whatsapp-line",
  5: "ri-more-line",
};

const Contacts = () => {
  const { contacts_data } = useSelector((state) => state.ContactsReducer);

  const additionalColumn = [
    {
      Header: "Name",
      filterable: false,
      id: "name",
      accessor: (obj) => (
        <ApvTitle initials={initialsOf(obj.name)} title={obj.name} sub={obj.description} />
      ),
    },
    {
      Header: "Email",
      filterable: false,
      id: "email",
      accessor: (obj) => (
        <ApvLink href={`mailto:${obj.email}`} icon="ri-mail-line">
          {obj.email}
        </ApvLink>
      ),
    },
    {
      Header: "Phone Number",
      filterable: false,
      id: "number",
      accessor: (obj) => {
        const phones = obj.phone_numbers || [];
        const primary = phones.find((p) => p.primary) || phones[0];
        const others = phones.filter((p) => p !== primary && p.number);
        return (
          <span className="d-inline-flex align-items-center gap-1">
            <ApvLink
              href={`tel:${primary?.number || ""}`}
              icon={PHONE_ICONS[primary?.type] || "ri-phone-line"}
            >
              {primary?.number}
            </ApvLink>
            {others.length > 0 && (
              <span
                className="apv-dept-more"
                title={others.map((p) => p.number).join(", ")}
              >
                +{others.length}
              </span>
            )}
          </span>
        );
      },
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => <ApvActive active={obj.status} />,
    },
  ];

  const initialFormObj = useMemo(() => {
    return {
      id: 0,
      name: "",
      description: "",
      phone_numbers: [
        { id: 0, row_id: 1, type: "", number: "", primary: false },
      ],
      email: "",
      project_number: "",
      contact_groups: "",
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    {
      option: true,
      label: "Active",
      count: contacts_data.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count: contacts_data.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  document.title = `Contacts | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={contacts_data}
        formname={contacts_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"30%"}
      />
    </React.Fragment>
  );
};

export default Contacts;
