import React, { useEffect, useMemo, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { useDispatch, useSelector } from "react-redux";
import { setProjects } from "../../../redux/reducers/ChildReducer/ProjectsReducer";
import { project_component_name } from "../../../common/constant/Constants";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { useNavigate } from "react-router-dom";

const Projects = ({ clientId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { project_data } = useSelector((state) => state.ProjectsReducer);

  // ================= PROJECT LOCAL STORAGE =================
  const ProjectLocalData = GetLocalStorageData("projects") || [];

  // ================= CLIENT LOCAL STORAGE =================
  const ClientLocalData = GetLocalStorageData("clients") || [];

  // ================= CLIENT STATE =================
  const [clientList, setClientList] = useState([]);
  // ================= FILTER PROJECTS BY CLIENT =================
  const filteredProjects = useMemo(() => {
    // If no clientId, show all projects
    if (!clientId) {
      return project_data || ProjectLocalData;
    }

    return (project_data || ProjectLocalData).filter(
      (project) =>
        Number(project.type) === 2 &&
        Number(project.client) === Number(clientId),
    );
  }, [project_data, ProjectLocalData, clientId]);

  // ================= LOAD DATA =================
  useEffect(() => {
    dispatch(setProjects(ProjectLocalData));
    setClientList(ClientLocalData);
  }, [dispatch]);

  // ================= PROJECT TYPE =================
  const PROJECT_TYPE_MAP = {
    1: {
      label: "Internal",
      color: "info",
    },
    2: {
      label: "Client",
      color: "primary",
    },
  };

  // ================= TABLE COLUMNS =================
  const additionalColumn = useMemo(
    () => [
      {
        Header: "Title",
        id: "title",
        filterable: false,
        accessor: (obj) => {
          const progress = obj.progress || 0; // replace with your actual progress field

          return (
            <div>
              <span
                onClick={() => navigate(`/project-overview/${obj.id}`)}
                style={{
                  cursor: "pointer",
                  color: "#405189",
                  fontWeight: 600,
                }}
              >
                {obj.title}
              </span>

              <div
                style={{
                  fontSize: "13px",
                  color: "#6c757d",
                  marginTop: "4px",
                }}
                title={obj.description}
              >
                {obj.description?.length > 50
                  ? `${obj.description.substring(0, 50)}...`
                  : obj.description}
              </div>

              <div
                className="progress mt-2"
                style={{
                  height: "4px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "4px",
                }}
              >
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: "#28a745",
                    borderRadius: "4px",
                    transition: "width 0.5s ease",
                  }}
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>

              <small
                style={{
                  color: "#6c757d",
                  fontSize: "11px",
                }}
              >
                {progress}% Complete
              </small>
            </div>
          );
        },
      },

      {
        Header: "Type",
        id: "type",
        filterable: false,
        accessor: (obj) => {
          const t = PROJECT_TYPE_MAP[obj.type] || {
            label: "Unknown",
            color: "secondary",
          };

          return (
            <span
              className={`badge text-uppercase bg-${t.color}-subtle text-${t.color}`}
            >
              {t.label}
            </span>
          );
        },
      },

      {
        Header: "Client Name",
        id: "client_name",
        filterable: false,
        accessor: (obj) => {
          if (Number(obj.type) !== 2) return "-";

          const client = clientList.find(
            (c) => Number(c.id) === Number(obj.client),
          );

          return client?.name || "-";
        },
      },

      {
        Header: "Start Date",
        accessor: "start_date",
        filterable: false,
        id: "start_date",
      },

      {
        Header: "Deadline",
        accessor: "deadline",
        filterable: false,
        id: "deadline",
      },

      {
        Header: "Price",
        id: "price",
        filterable: false,
        accessor: (obj) =>
          obj.price
            ? `₹ ${parseFloat(obj.price).toLocaleString("en-IN")}`
            : "-",
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
    ],
    [clientList, navigate],
  );

  // ================= INITIAL FORM =================
  const initialFormObj = useMemo(
    () => ({
      id: 0,
      title: "",
      type: 1,
      client: null,
      description: "",
      start_date: "",
      deadline: "",
      price: "",
      status: true,
    }),
    [],
  );

  // ================= FILTER =================
  const filterKey = "status";

  const filterOptions = [
    {
      option: true,
      label: "Active",
      count: filteredProjects.filter((e) => e[filterKey] === true).length || 0,
    },

    {
      option: false,
      label: "Inactive",
      count: filteredProjects.filter((e) => e[filterKey] === false).length || 0,
    },
  ];

  document.title = `Projects | ${MetaTitle}`;

  return (
    <React.Fragment>
      <InfoTable
        additionalColumn={additionalColumn}
        tabledata={filteredProjects}
        formname={project_component_name}
        initialFormObj={initialFormObj}
        filterKey={filterKey}
        filterOptions={filterOptions}
        width_per={"30%"}
        table_class={clientId ? "Lc_leave_apply_table me-n3 ms-n3" : ""}
      />
    </React.Fragment>
  );
};

export default Projects;
