import React, { useEffect, useState } from "react";

import "react-toastify/dist/ReactToastify.css";

// import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { useMemo } from "react";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem, UncontrolledTooltip
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { contacts_component_name } from "../../../common/constant/Constants"


const Contacts = () => {
  const dispatch = useDispatch();

  const { contacts_data } = useSelector(
    (state) => state.ContactsReducer
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };
  





  const additionalColumn = [

    {
      Header: "Name",
      accessor: "name",
      filterable: false,
      id: "name",
      accessor: (obj) => {


        return (
          <span>
            {obj.name}
          </span>
        );
      },
    },
    {
      Header: "Email",
      accessor: "email",
      filterable: false,
      id: "email",
    },
    {
      Header: "Phone Number",
      filterable: false,
      id: "number",
      accessor: (obj) => {
        const primaryPhone = obj.phone_numbers.find((item) => item.primary) || obj.phone_numbers[0] || { number: "" };
        const result = primaryPhone;

        // Function to get the icon by phone type
        const getIconByType = (icon) => {
          switch (icon) {
            case 1:
              return "ri-briefcase-line";
            case 2:
              return "ri-smartphone-line";
            case 3:
              return "ri-home-line";
            case 4:
              return "ri-whatsapp-line";
            case 5:
              return "ri-more-line";
            default:
              return "";
          }
        };

        // Filter out primary phone from dropdown items
        const otherPhones = obj.phone_numbers.filter((phone) => !phone.primary);

        return (
          <UncontrolledDropdown >
            <DropdownToggle
              tag="a"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <span className="text-primary d-inline-block edit-item-btn fs-16">
                <i className={getIconByType(result.type)} style={{ marginRight: '8px' }} />
                {result.number}
                {otherPhones.length >0 && (
                  <i
                    className={`${isDropdownOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
                      } lc-icon-hover`}
                    style={{ fontSize: '20px' }}
                  />
                )}
              </span>
            </DropdownToggle>

            {otherPhones.length > 0 && (
              <DropdownMenu
               style={{ zIndex: 1050, marginBottom: '5px' }}>
                {otherPhones.map((phone, index) => (
                  <DropdownItem key={index}>
                    <i className={getIconByType(phone.type)} style={{ marginRight: '8px' }} />
                    {phone.number}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </UncontrolledDropdown>
        );
      }
    }
    ,

    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        let status = obj.status ? "Active" : "Inactive";
        let statusClass = obj.status ? "success" : "warning";
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
      count:
        contacts_data.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count:
        contacts_data.filter((e) => e[filterKey] === false).length || 0,
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
