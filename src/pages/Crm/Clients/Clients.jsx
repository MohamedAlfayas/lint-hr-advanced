import React, { useEffect, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { useDispatch, useSelector } from "react-redux";
import { setClients } from "../../../redux/reducers/ChildReducer/ClientReducer";
import { client_component_name } from "../../../common/constant/Constants";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { useNavigate } from "react-router-dom";

const Clients = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ================= REDUX DATA =================
  const { client_data } = useSelector((state) => state.ClientReducer);

  // ================= LOAD LOCAL STORAGE ON PAGE LOAD =================
  useEffect(() => {
    const localClients = GetLocalStorageData("clients") || [];

    dispatch(setClients(localClients));
  }, [dispatch]);

  const additionalColumn = [
    {
      Header: "Client Name",
      id: "name",
      filterable: false,
      accessor: (obj) => (
        <span
          onClick={() => navigate(`/client-overview/${obj.id}`)}
          style={{
            cursor: "pointer",
            color: "#405189",
            fontWeight: 600,
          }}
        >
          {obj.name}
        </span>
      ),
    },
    {
      Header: "City",
      accessor: "city",
      filterable: false,
      id: "city",
    },
    {
      Header: "State",
      accessor: "state",
      filterable: false,
      id: "state",
    },
    {
      Header: "Country",
      accessor: "country",
      filterable: false,
      id: "country",
    },
    {
      Header: "Phone",
      accessor: "phone_number",
      filterable: false,
      id: "phone_number",
    },
    {
      Header: "Website",
      id: "website",
      filterable: false,
      accessor: (obj) => {
        return obj.website ? (
          <a href={obj.website} target="_blank" rel="noreferrer">
            {obj.website}
          </a>
        ) : (
          "-"
        );
      },
    },
    {
      Header: "GST Number",
      id: "gst_number",
      filterable: false,
      accessor: (obj) => <span>{obj.gst_number || "-"}</span>,
    },
    {
      Header: "Status",
      id: "status",
      filterable: false,
      accessor: (obj) => {
        const status = obj.status ? "Active" : "Inactive";
        const statusClass = obj.status ? "success" : "warning";

        return (
          <span
            className={`badge text-uppercase bg-${statusClass}-subtle text-${statusClass}`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  const initialFormObj = useMemo(() => {
    return {
      id: 0,
      name: "",
      owner: null,
      manager_id_list: [],
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      country_code: "",
      phone_number: "",
      website: "",
      vat_number: "",
      gst_number: "",
    };
  }, []);

  const filterKey = "status";

  const filterOptions = [
    {
      option: true,
      label: "Active",
      count: client_data?.filter((e) => e[filterKey] === true).length || 0,
    },
    {
      option: false,
      label: "Inactive",
      count: client_data?.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  document.title = `Clients | ${MetaTitle}`;

  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={client_data || []}
        formname={client_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"30%"}
      />
    </React.Fragment>
  );
};

export default Clients;
