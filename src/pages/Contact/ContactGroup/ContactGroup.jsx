import React, { useMemo } from "react";

import "react-toastify/dist/ReactToastify.css";

import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { useSelector } from "react-redux";
import { contact_group_component_name } from "../../../common/constant/Constants";
import {
  ApvActive,
  ApvChip,
  ApvReason,
  ApvTitle,
} from "../../../component/common/approval/ApprovalCells";

const ContactGroup = () => {

  const { contact_group_data } = useSelector(
    (state) => state.ContactGroupReducer
  );
 
  

  // useEffect(() => {
  //   dispatch(setStatus)
  // }, []);




  const additionalColumn = [
    {
        Header: "ID",
        accessor: "id",
        filterable: false,
        id: "id",
      },
    {
      Header: "Name",
      accessor: "name",
      filterable: false,
      id: "name",
      accessor: (obj) => (
        <ApvTitle icon="ri-contacts-book-line" title={obj.name} tone="info" />
      ),
    },
    {
      Header: "Description",
      filterable: false,
      id: "description",
      accessor: (obj) => <ApvReason text={obj.description} />,
    },
    {
      Header: "Domain",
      filterable: false,
      id: "domain",
      accessor: (obj) => <ApvChip icon="ri-global-line">{obj.domain}</ApvChip>,
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
      domain:"",
      
    };
  }, []);

  const filterKey = "status";
  const filterOptions = [
    {
      option: true,
      label: "Active",
      count:
      contact_group_data.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count:
      contact_group_data.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  document.title = `Contact Group | ${MetaTitle}`;
  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={contact_group_data}
        formname={contact_group_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"30%"}
      />
    </React.Fragment>
  );
};

export default ContactGroup;
