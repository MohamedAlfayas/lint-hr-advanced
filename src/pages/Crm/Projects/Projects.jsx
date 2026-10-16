import React, { useEffect, useMemo, useRef } from "react";
import "react-toastify/dist/ReactToastify.css";
import InfoTable from "../../../component/common/table/InfoTable";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { useDispatch, useSelector } from "react-redux";
import { setProjects } from "../../../redux/reducers/ChildReducer/ProjectsReducer";
import { project_component_name } from "../../../common/constant/Constants";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { useNavigate } from "react-router-dom";
import {
  ApvActive,
  ApvDate,
  ApvEmpty,
  ApvStatus,
  ApvTitle,
  initialsOf,
} from "../../../component/common/approval/ApprovalCells";
import { writePageCache } from "../../../common/js/pageLoadCache";

const PROJECT_TYPE_MAP = {
  1: { label: "Internal", tone: "info", icon: "ri-building-2-line" },
  2: { label: "Client", tone: "primary", icon: "ri-user-star-line" },
};

const Projects = ({ clientId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ================= REDUX STATE =================
  // This is the single source of truth — editProject dispatched from
  // TaskListForm / TaskDetailModal updates this immediately after a task save.
  const { project_data } = useSelector((state) => state.ProjectsReducer);

  // ================= CLIENT LOCAL STORAGE =================
  const clientList = useMemo(() => GetLocalStorageData("clients") || [], []);

  // ================= LOAD DATA ON MOUNT =================
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    // Seed Redux from localStorage on first load if store is empty
    if (!project_data || project_data.length === 0) {
      const ProjectLocalData = GetLocalStorageData("projects") || [];
      dispatch(setProjects(ProjectLocalData));
    }
    writePageCache("projects:visited");
  }, [dispatch, project_data]);

  // ================= FILTER PROJECTS BY CLIENT =================
  // Depends only on Redux project_data — re-renders immediately when
  // editProject is dispatched with updated task_status_details.
  const filteredProjects = useMemo(() => {
    const source = project_data || [];

    if (!clientId) {
      return source;
    }

    return source.filter(
      (project) =>
        Number(project.type) === 2 &&
        Number(project.client) === Number(clientId),
    );
  }, [project_data, clientId]);

  // ================= TABLE COLUMNS =================
  const additionalColumn = useMemo(
    () => [
      {
        Header: "Title",
        id: "title",
        filterable: false,
        accessor: (obj) => {
          // ✅ Reads task_status_details directly from Redux project object —
          // updates immediately when editProject is dispatched.
          const progress =
            obj?.task_status_details?.project_completed_percentage || 0;

          const tone = progress >= 100 ? "success" : progress >= 50 ? "warning" : "danger";

          return (
            <span className="apv-project">
              <ApvTitle
                icon="ri-folder-2-line"
                tone={Number(obj.type) === 2 ? "primary" : "info"}
                title={obj.title}
                sub={obj.description || null}
                onClick={() => navigate(`/project-overview/${obj.id}`)}
              />
              <span className="apv-project-progress">
                <span className={`apv-progress is-${progress >= 100 ? "success" : tone}`}>
                  <span style={{ width: `${progress}%` }} />
                </span>
                <small>{progress}%</small>
              </span>
            </span>
          );
        },
      },

      {
        Header: "Type",
        id: "type",
        filterable: false,
        accessor: (obj) => {
          const t = PROJECT_TYPE_MAP[obj.type];
          return t ? (
            <ApvStatus tone={t.tone} icon={t.icon} label={t.label} />
          ) : (
            <ApvStatus tone="secondary" label="Unknown" />
          );
        },
      },

      {
        Header: "Client Name",
        id: "client_name",
        filterable: false,
        accessor: (obj) => {
          if (Number(obj.type) !== 2) return <ApvEmpty />;
          const client = clientList.find((c) => Number(c.id) === Number(obj.client));
          return client ? (
            <ApvTitle initials={initialsOf(client.name)} tone="info" title={client.name} />
          ) : (
            <ApvEmpty />
          );
        },
      },

      {
        Header: "Start Date",
        filterable: false,
        id: "start_date",
        accessor: (obj) => <ApvDate value={obj.start_date} />,
      },

      {
        Header: "Deadline",
        filterable: false,
        id: "deadline",
        accessor: (obj) => <ApvDate value={obj.deadline} />,
      },

      {
        Header: "Price",
        id: "price",
        filterable: false,
        accessor: (obj) =>
          obj.price ? (
            <span className="apv-amount">₹ {parseFloat(obj.price).toLocaleString("en-IN")}</span>
          ) : (
            <ApvEmpty />
          ),
      },

      {
        Header: "Status",
        id: "status",
        filterable: false,
        accessor: (obj) => <ApvActive active={obj.status} />,
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
      start_date: null,
      deadline: null,
      price: "",
      status: true,
    }),
    [],
  );

  // ================= FILTER OPTIONS =================
  const filterKey = "status";

  const filterOptions = useMemo(
    () => [
      {
        option: true,
        label: "Active",
        count: filteredProjects.filter((e) => e[filterKey] === true).length || 0,
      },
      {
        option: false,
        label: "Inactive",
        count:
          filteredProjects.filter((e) => e[filterKey] === false).length || 0,
      },
    ],
    [filteredProjects],
  );

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
