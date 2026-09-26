import React, { useEffect, useMemo, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import {
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
   Row,
  Col,
} from "reactstrap";
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

  const [selectedClient, setSelectedClient] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  const { client_data } = useSelector((state) => state.ClientReducer);

  const employeeData = GetLocalStorageData("employee") || [];

  const getEmployeeName = (empId) => {
    const emp = employeeData.find((e) => Number(e.id) === Number(empId));
    if (!emp) return "-";
    return `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || emp.name || "-";
  };

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
          onClick={() => {
            setSelectedClient(obj);
            setDrawerOpen(true);
          }}
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
      status: true,
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

  const websiteLink = selectedClient && selectedClient.website
    ? selectedClient.website
    : "";

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

           <Offcanvas
        isOpen={drawerOpen}
        toggle={toggleDrawer}
        direction="end"
        style={{ width: "480px" }}
      >
        <OffcanvasHeader toggle={toggleDrawer}>
          <div>
            <h5 className="mb-0 fw-bold">{selectedClient?.name || "Client Details"}</h5>
            <span
              className={`badge text-uppercase bg-${
                selectedClient?.status ? "success" : "warning"
              }-subtle text-${selectedClient?.status ? "success" : "warning"} mt-1`}
            >
              {selectedClient?.status ? "Active" : "Inactive"}
            </span>
          </div>
        </OffcanvasHeader>
      <OffcanvasBody className="pt-2">
          {/* ── Contact Info Section ── */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted fs-12 fw-bold mb-3 pb-1 border-bottom">
              Contact Information
            </h6>
               <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">Phone</span>
              <span className="fw-medium">
                {selectedClient?.phone_number || "-"}
              </span>
            </div>
                       <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">Pincode</span>
              <span className="fw-medium">
                {selectedClient?.pincode || "-"}
              </span>
            </div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">Address</span>
              <span className="fw-medium text-end">
                {selectedClient?.address || "-"}
              </span>
            </div>
                       <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">City</span>
              <span className="fw-medium">
                {selectedClient?.city || "-"}
              </span>
            </div>
                       <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">State</span>
              <span className="fw-medium">
                {selectedClient?.state || "-"}
              </span>
            </div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">Country</span>
              <span className="fw-medium">
                {selectedClient?.country || "-"}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">Website</span>
              <span className="fw-medium">
                {websiteLink ? (
                  <a href={websiteLink} target="_blank" rel="noreferrer">
                    {websiteLink}
                  </a>
                ) : (
                  "-"
                )}
              </span>
            </div>
          </div>

          {/* ── Business Info Section ── */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted fs-12 fw-bold mb-3 pb-1 border-bottom">
              Business Details
            </h6>
                          <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">GST Number</span>
              <span className="fw-medium">
                {selectedClient?.gst_number || "-"}
              </span>
            </div>
                       <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted">Owner</span>
              <span className="fw-medium">
                {getEmployeeName(selectedClient?.owner)}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">Managers</span>
              <span className="fw-medium text-end">
                {selectedClient?.manager_id_list?.length > 0
                  ? selectedClient.manager_id_list
                      .map((id) => getEmployeeName(id))
                      .join(", ")
                  : "-"}
              </span>
            </div>
          </div>

          {/* ── Locations Section ── */}
          {selectedClient?.entity_location_details?.length > 0 && (
            <div className="mb-4">
              <h6 className="text-uppercase text-muted fs-12 fw-bold mb-3 pb-1 border-bottom">
                Locations
              </h6>
              {selectedClient.entity_location_details.map((loc, idx) => (
                <div
                  key={idx}
                  className="d-flex align-items-start mb-2 p-2 rounded"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  <i className="ri-map-pin-2-fill text-primary me-2 mt-1"></i>
                  <div>
                    <div className="fw-medium">{loc.name}</div>
                    <div className="text-muted fs-12">
                      {loc.accurate_address || loc.address || "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={() => {
              setDrawerOpen(false);
              navigate(`/client-overview/${selectedClient?.id}`);
            }}
          >
            <i className="ri-folder-2-line align-bottom me-1"></i>
            View Projects
          </button>
        </OffcanvasBody>
      </Offcanvas>
    </React.Fragment>
  );
};

export default Clients;