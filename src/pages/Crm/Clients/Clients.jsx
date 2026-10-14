import React, { useEffect, useMemo, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Offcanvas, OffcanvasBody } from "reactstrap";
import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { useDispatch, useSelector } from "react-redux";
import { setClients } from "../../../redux/reducers/ChildReducer/ClientReducer";
import { client_component_name } from "../../../common/constant/Constants";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { useNavigate } from "react-router-dom";
import {
  PROJECT_VIEW_ACCESS_KEY,
  CREATE_PROJECT_ACCESS_KEY,
  EDIT_PROJECT_ACCESS_KEY,
} from "../../../common/constant/RoleConstants";
import {
  ApvActive,
  ApvChip,
  ApvEmployee,
  ApvLink,
  ApvPeople,
  ApvTitle,
  initialsOf,
} from "../../../component/common/approval/ApprovalCells";

const DetailItem = ({ icon, label, value, full = false, wrap = false }) => {
  const isEmpty = value === null || value === undefined || value === "";
  return (
    <div className={`cld-item ${full ? "is-full" : ""}`}>
      <span className="cld-item-icon">
        <i className={icon} />
      </span>
      <div className="min-w-0 flex-grow-1">
        <div className="cld-item-label">{label}</div>
        <div
          className={`cld-item-value${wrap ? " is-wrap" : ""}${isEmpty ? " is-empty" : ""}`}
          title={typeof value === "string" ? value : undefined}
        >
          {isEmpty ? "Not set" : value}
        </div>
      </div>
    </div>
  );
};

const Clients = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedClient, setSelectedClient] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  const canViewProjects = useMemo(() => {
    const profile = JSON.parse(localStorage.getItem("lint_hr_profile_data") || "{}");
    if (profile?.is_admin === true) return true;
    const permissionList = profile?.permission_list || [];
    return [
      PROJECT_VIEW_ACCESS_KEY,
      CREATE_PROJECT_ACCESS_KEY,
      EDIT_PROJECT_ACCESS_KEY,
    ].some((key) => permissionList.includes(key));
  }, []);

  const { client_data } = useSelector((state) => state.ClientReducer);

  const employeeData = GetLocalStorageData("employee") || [];

  const getEmployee = (empId) => employeeData.find((e) => Number(e.id) === Number(empId));

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
        <ApvTitle
          initials={initialsOf(obj.name) || "C"}
          title={obj.name}
          sub={[obj.city, obj.country].filter(Boolean).join(", ") || null}
          onClick={() => {
            setSelectedClient(obj);
            setDrawerOpen(true);
          }}
        />
      ),
    },
    // {
    //   Header: "City",
    //   accessor: "city",
    //   filterable: false,
    //   id: "city",
    // },
    // {
    //   Header: "State",
    //   accessor: "state",
    //   filterable: false,
    //   id: "state",
    // },
    // {
    //   Header: "Country",
    //   accessor: "country",
    //   filterable: false,
    //   id: "country",
    // },
    // {
    //   Header: "Phone",
    //   accessor: "phone_number",
    //   filterable: false,
    //   id: "phone_number",
    // },
    {
      Header: "Owner",
      id: "owner",
      filterable: false,
      accessor: (obj) => <ApvEmployee employee={getEmployee(obj.owner)} />,
    },
    {
      Header: "Managers",
      id: "managers",
      filterable: false,
      accessor: (obj) => <ApvPeople people={(obj.manager_id_list || []).map(getEmployee)} />,
    },
    {
      Header: "Phone",
      id: "phone_number",
      filterable: false,
      accessor: (obj) => {
        const phone = obj.phone_number ? `${obj.country_code || ""} ${obj.phone_number}`.trim() : "";
        return (
          <ApvLink href={`tel:${phone.replace(/\s+/g, "")}`} icon="ri-phone-line">
            {phone}
          </ApvLink>
        );
      },
    },
    {
      Header: "Website",
      id: "website",
      filterable: false,
      accessor: (obj) => {
        const site = obj.website || "";
        const href = site && !/^https?:\/\//i.test(site) ? `https://${site}` : site;
        return (
          <ApvLink href={href} icon="ri-global-line">
            {site.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
          </ApvLink>
        );
      },
    },
    {
      Header: "GST Number",
      id: "gst_number",
      filterable: false,
      accessor: (obj) => <ApvChip icon="ri-file-text-line">{obj.gst_number}</ApvChip>,
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
  const websiteHref =
    websiteLink && !/^https?:\/\//i.test(websiteLink)
      ? `https://${websiteLink}`
      : websiteLink;

  const clientInitials =
    (selectedClient?.name || "C")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "C";

  const phoneText = selectedClient?.phone_number
    ? `${selectedClient.country_code || ""} ${selectedClient.phone_number}`.trim()
    : "";

  const fullAddress = [
    [
      selectedClient?.address,
      selectedClient?.city,
      selectedClient?.state,
      selectedClient?.country,
    ]
      .filter((part) => part && String(part).trim())
      .join(", "),
    selectedClient?.pincode,
  ]
    .filter(Boolean)
    .join(" - ");

  const ownerName = getEmployeeName(selectedClient?.owner);
  const managerNames = (selectedClient?.manager_id_list || [])
    .map((id) => getEmployeeName(id))
    .filter((name) => name && name !== "-");

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
        className="cld-drawer"
        style={{ width: "480px", maxWidth: "100vw" }}
      >
        <OffcanvasBody className="p-0 d-flex flex-column">
          {/* ── Header ── */}
          <div className="cld-hero">
            <button
              data-testid="client-list-close-button"
              type="button"
              className="cld-close"
              onClick={toggleDrawer}
              aria-label="Close"
            >
              <i className="ri-close-line" />
            </button>
            <div className="d-flex align-items-center gap-3">
              <span className="cld-avatar">{clientInitials}</span>
              <div className="min-w-0">
                <h5 className="cld-name" title={selectedClient?.name}>
                  {selectedClient?.name || "Client Details"}
                </h5>
                <span
                  className={`cld-status ${selectedClient?.status ? "is-active" : ""}`}
                >
                  <span className="cld-status-dot" />
                  {selectedClient?.status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {(phoneText || websiteLink) && (
              <div className="cld-quick">
                {phoneText && (
                  <a className="cld-quick-btn" href={`tel:${phoneText.replace(/\s+/g, "")}`} data-testid="client-list-call-link">
                    <i className="ri-phone-line" />
                    {phoneText}
                  </a>
                )}
                {websiteLink && (
                  <a
                    data-testid="client-list-website-link"
                    className="cld-quick-btn"
                    href={websiteHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="ri-global-line" />
                    Website
                  </a>
                )}
              </div>
            )}
          </div>

          {/* ── Body ── */}
          <div className="cld-body">
            <section className="cld-section">
              <div className="cld-section-title">
                <i className="ri-contacts-book-line" />
                Contact Information
              </div>
              <div className="cld-grid">
                <DetailItem icon="ri-phone-line" label="Phone" value={phoneText} />
                <DetailItem
                  icon="ri-global-line"
                  label="Website"
                  value={
                    websiteLink ? (
                      <a data-testid="client-list-website-href-link" href={websiteHref} target="_blank" rel="noreferrer">
                        {websiteLink}
                      </a>
                    ) : null
                  }
                />
                <DetailItem
                  icon="ri-map-pin-line"
                  label="Address"
                  value={fullAddress}
                  full
                  wrap
                />
              </div>
            </section>

            <section className="cld-section">
              <div className="cld-section-title">
                <i className="ri-briefcase-4-line" />
                Business Details
              </div>
              <div className="cld-grid">
                <DetailItem
                  icon="ri-file-text-line"
                  label="GST Number"
                  value={selectedClient?.gst_number}
                />
                <DetailItem
                  icon="ri-user-star-line"
                  label="Owner"
                  value={ownerName !== "-" ? ownerName : null}
                />
                <DetailItem
                  icon="ri-team-line"
                  label="Managers"
                  full
                  value={
                    managerNames.length ? (
                      <span className="cld-chips">
                        {managerNames.map((name) => (
                          <span key={name} className="cld-chip">
                            {name}
                          </span>
                        ))}
                      </span>
                    ) : null
                  }
                  wrap
                />
              </div>
            </section>

            {selectedClient?.entity_location_details?.length > 0 && (
              <section className="cld-section">
                <div className="cld-section-title">
                  <i className="ri-map-2-line" />
                  Locations
                </div>
                <div className="d-flex flex-column gap-2">
                  {selectedClient.entity_location_details.map((loc, idx) => (
                    <div key={idx} className="cld-location">
                      <i className="ri-map-pin-2-fill" />
                      <div className="min-w-0">
                        <div className="fw-semibold">{loc.name}</div>
                        <div className="cld-muted">
                          {loc.accurate_address || loc.address || "-"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {canViewProjects && (
            <div className="cld-footer">
              <button
                data-testid="client-list-view-projects-button"
                type="button"
                className="btn btn-primary w-100 cld-primary"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate(`/client-overview/${selectedClient?.id}`);
                }}
              >
                <i className="ri-folder-2-line" />
                View Projects
              </button>
            </div>
          )}
        </OffcanvasBody>
      </Offcanvas>

      <style>{`
        .cld-drawer { border-left: 0 !important; box-shadow: -12px 0 40px rgba(15,23,42,.18); }
        .cld-hero {
          position: relative; padding: 24px 22px 20px;
          background: linear-gradient(135deg, rgba(var(--vz-primary-rgb), .14), rgba(var(--vz-info-rgb), .06));
          border-bottom: 1px solid var(--vz-border-color);
        }
        .cld-close {
          position: absolute; top: 14px; right: 14px; width: 34px; height: 34px; border: 0; border-radius: 10px;
          display: inline-flex; align-items: center; justify-content: center; font-size: 20px;
          background: var(--vz-secondary-bg); color: var(--vz-secondary-color); transition: all .15s ease;
        }
        .cld-close:hover { background: rgba(var(--vz-danger-rgb), .1); color: var(--vz-danger); }
        .cld-avatar {
          width: 56px; height: 56px; flex: 0 0 56px; border-radius: 16px; font-size: 20px; font-weight: 700;
          display: inline-flex; align-items: center; justify-content: center; color: #fff;
          background: linear-gradient(135deg, var(--vz-primary), #6a7cc4); box-shadow: 0 6px 16px rgba(var(--vz-primary-rgb), .3);
        }
        .cld-name {
          margin: 0 40px 6px 0; font-size: 17px; font-weight: 700; line-height: 1.3;
          color: var(--vz-heading-color, var(--vz-body-color));
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .cld-status {
          display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 999px;
          font-size: 11.5px; font-weight: 600; background: rgba(var(--vz-warning-rgb), .14); color: var(--vz-warning);
        }
        .cld-status.is-active { background: rgba(var(--vz-success-rgb), .14); color: var(--vz-success); }
        .cld-status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .cld-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .cld-quick-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 10px;
          font-size: 12.5px; font-weight: 500; color: var(--vz-primary); text-decoration: none;
          background: var(--vz-secondary-bg); border: 1px solid var(--vz-border-color); transition: all .15s ease;
        }
        .cld-quick-btn:hover { border-color: rgba(var(--vz-primary-rgb), .5); color: var(--vz-primary); transform: translateY(-1px); }

        .cld-body { flex: 1; overflow-y: auto; padding: 18px 22px; display: flex; flex-direction: column; gap: 18px; }
        .cld-section-title {
          display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
          font-size: 12px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--vz-secondary-color);
        }
        .cld-section-title i { font-size: 15px; color: var(--vz-primary); }
        .cld-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
        .cld-item {
          display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; min-width: 0;
          border: 1px solid var(--vz-border-color); border-radius: 12px; transition: border-color .15s ease;
        }
        .cld-item:hover { border-color: rgba(var(--vz-primary-rgb), .35); }
        .cld-item.is-full { grid-column: 1 / -1; }
        .cld-item-icon {
          width: 32px; height: 32px; flex: 0 0 32px; border-radius: 9px; font-size: 16px;
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--vz-primary); background: rgba(var(--vz-primary-rgb), .1);
        }
        .cld-item-label { font-size: 11px; text-transform: uppercase; letter-spacing: .4px; color: var(--vz-secondary-color); }
        .cld-item-value { font-size: 13px; font-weight: 600; color: var(--vz-heading-color, var(--vz-body-color)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cld-item-value.is-wrap { white-space: normal; word-break: break-word; }
        .cld-item-value.is-empty { color: var(--vz-secondary-color); font-weight: 400; font-style: italic; }
        .cld-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
        .cld-chip { padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; background: rgba(var(--vz-primary-rgb), .1); color: var(--vz-primary); }
        .cld-location { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 12px; background: var(--vz-tertiary-bg, var(--vz-light)); }
        .cld-location > i { color: var(--vz-danger); font-size: 16px; margin-top: 1px; }
        .cld-muted { font-size: 12px; color: var(--vz-secondary-color); }

        .cld-footer { padding: 14px 22px; border-top: 1px solid var(--vz-border-color); background: var(--vz-secondary-bg); }
        .cld-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          height: 42px; border-radius: 11px; font-weight: 600; box-shadow: 0 6px 14px rgba(var(--vz-primary-rgb), .25);
        }
        .min-w-0 { min-width: 0; }
        @media (max-width: 480px) { .cld-grid { grid-template-columns: 1fr; } }
      `}</style>
    </React.Fragment>
  );
};

export default Clients;
