import React, {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import { CardGridSkeleton } from "../../../component/common/skeleton/Skeleton";
import { Api } from "../../../common/api/Api";
import { MetaTitle } from "../../../common/data/MetaTitle";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { setProjects } from "../../../redux/reducers/ChildReducer/ProjectsReducer";
import {
  hasPageCache,
  readPageCache,
  writePageCache,
} from "../../../common/js/pageLoadCache";

const ReactApexChart = lazy(() => import("react-apexcharts"));

const TASK_FETCH_SIZE = 300;
const CRM_TASKS_CACHE_KEY = "crm-dashboard:tasks";
const DAY = 24 * 60 * 60 * 1000;

const pickList = (node, depth = 0) => {
  if (Array.isArray(node)) return node;
  if (!node || typeof node !== "object" || depth > 3) return null;
  for (const key of ["results", "data", "items", "tasks"]) {
    const found = pickList(node[key], depth + 1);
    if (found) return found;
  }
  return null;
};

// Accepts ISO strings, "YYYY-MM-DD" and "DD-MM-YYYY"
const parseDate = (value) => {
  if (!value) return null;
  const s = String(value);
  const dmy = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
  const d = dmy ? new Date(+dmy[3], +dmy[2] - 1, +dmy[1]) : new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const fmtShort = (d) =>
  d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-";

const relativeDue = (d) => {
  if (!d) return { text: "No due date", tone: "secondary" };
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const due = new Date(d);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - start) / DAY);
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, tone: "danger" };
  if (diff === 0) return { text: "Due today", tone: "warning" };
  if (diff === 1) return { text: "Tomorrow", tone: "warning" };
  return { text: `In ${diff} days`, tone: diff <= 3 ? "info" : "success" };
};

const isValidColor = (color) => {
  if (!color) return false;
  const s = new Option().style;
  s.color = color;
  return s.color !== "";
};

const AVATAR_TONES = ["primary", "success", "info", "warning", "danger", "violet"];
const toneFor = (seed = "") => {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return AVATAR_TONES[sum % AVATAR_TONES.length];
};

const Avatar = ({ emp, size = 34 }) => {
  const name = `${emp?.first_name || ""} ${emp?.last_name || ""}`.trim() || "Unassigned";
  if (emp?.profile_url) {
    return (
      <img
        src={emp.profile_url}
        alt={name}
        className="crd-avatar"
        style={{ width: size, height: size }}
        title={name}
      />
    );
  }
  return (
    <span
      className={`crd-avatar crd-avatar-${toneFor(name)}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      title={name}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
};

const KpiCard = ({ icon, tone, label, value, sub, progress, onClick }) => (
  <div className={`crd-kpi crd-tone-${tone}`} onClick={onClick} role={onClick ? "button" : undefined}>
    <div className="crd-kpi-top">
      <span className="crd-kpi-icon">
        <i className={icon} />
      </span>
      {onClick && <i className="ri-arrow-right-up-line crd-kpi-go" />}
    </div>
    <div className="crd-kpi-value">{value}</div>
    <div className="crd-kpi-label">{label}</div>
    {typeof progress === "number" && (
      <div className="crd-kpi-bar">
        <span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    )}
    <div className="crd-kpi-sub">{sub}</div>
  </div>
);

const Panel = ({ title, icon, tone = "primary", action, children, className = "" }) => (
  <div className={`crd-panel ${className}`}>
    <div className="crd-panel-head">
      <div className="crd-panel-title">
        <span className={`crd-panel-icon crd-tone-${tone}`}>
          <i className={icon} />
        </span>
        {title}
      </div>
      {action}
    </div>
    <div className="crd-panel-body">{children}</div>
  </div>
);

const Empty = ({ icon, text }) => (
  <div className="crd-empty">
    <span>
      <i className={icon} />
    </span>
    <p>{text}</p>
  </div>
);

const CrmDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { project_data } = useSelector((state) => state.ProjectsReducer);
  const reduxTasks = useSelector((state) => state.TaskReducer?.tasks);

  const cachedTasks = readPageCache(CRM_TASKS_CACHE_KEY);
  const seedTasks = Array.isArray(cachedTasks)
    ? cachedTasks
    : Array.isArray(reduxTasks) && reduxTasks.length
      ? reduxTasks
      : [];

  const [tasks, setTasks] = useState(seedTasks);
  const [loading, setLoading] = useState(
    () => seedTasks.length === 0 && !hasPageCache("crm-dashboard:visited"),
  );
  const [showCharts, setShowCharts] = useState(() => seedTasks.length > 0);

  const clients = useMemo(() => GetLocalStorageData("clients") || [], []);
  const employees = useMemo(() => GetLocalStorageData("employee") || [], []);
  const statuses = useMemo(() => GetLocalStorageData("task_status") || [], []);
  const priorities = useMemo(
    () => GetLocalStorageData("task_priority") || [],
    [],
  );
  const profile = useMemo(() => GetLocalStorageData("my_profile") || {}, []);

  document.title = `CRM Dashboard | ${MetaTitle}`;

  const seededProjectsRef = useRef(false);
  useEffect(() => {
    if (seededProjectsRef.current) return;
    seededProjectsRef.current = true;
    if (!project_data || project_data.length === 0) {
      dispatch(setProjects(GetLocalStorageData("projects") || []));
    }
  }, [dispatch, project_data]);

  useEffect(() => {
    let alive = true;
    const paintTimer = setTimeout(() => {
      if (alive) setShowCharts(true);
    }, 120);

    (async () => {
      try {
        const res = await Api.get(`/task/?page=1&page_size=${TASK_FETCH_SIZE}`);
        if (!alive) return;
        const list = pickList(res?.data) || [];
        setTasks(list);
        writePageCache(CRM_TASKS_CACHE_KEY, list);
        writePageCache("crm-dashboard:visited");
        setLoading(false);
      } catch (e) {
        console.log("CRM dashboard task fetch error:", e);
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
      clearTimeout(paintTimer);
    };
  }, []);

  const projects = useMemo(() => project_data || [], [project_data]);

  const statusById = useMemo(() => {
    const map = {};
    statuses.forEach((s) => (map[String(s.id)] = s));
    return map;
  }, [statuses]);

  const employeeById = useMemo(() => {
    const map = {};
    employees.forEach((e) => (map[String(e.id)] = e));
    return map;
  }, [employees]);

  const isDone = (t) => statusById[String(t.task_status)]?.category === "done";

  const stats = useMemo(() => {
    const now = Date.now();
    const total = tasks.length;
    const done = tasks.filter(isDone).length;
    const inProgress = tasks.filter(
      (t) => statusById[String(t.task_status)]?.category === "in_progress",
    ).length;
    const overdue = tasks.filter((t) => {
      const due = parseDate(t.end_time);
      return !isDone(t) && due && due.getTime() < now;
    }).length;
    const activeProjects = projects.filter((p) => p.status).length;
    const clientProjects = projects.filter((p) => Number(p.type) === 2).length;
    const activeClients = clients.filter((c) => c.status !== false).length;
    const avgProgress = projects.length
      ? Math.round(
          projects.reduce(
            (s, p) => s + Number(p?.task_status_details?.project_completed_percentage || 0),
            0,
          ) / projects.length,
        )
      : 0;
    return {
      total,
      done,
      inProgress,
      open: total - done,
      overdue,
      completion: total ? Math.round((done / total) * 100) : 0,
      activeProjects,
      clientProjects,
      activeClients,
      avgProgress,
    };
  }, [tasks, projects, clients.length, statusById]);

  const statusSeries = useMemo(() => {
    const counts = {};
    tasks.forEach((t) => {
      const k = String(t.task_status ?? "none");
      counts[k] = (counts[k] || 0) + 1;
    });
    const rows = Object.entries(counts).map(([id, count]) => {
      const s = statusById[id];
      return {
        name: s?.name || "No status",
        color: isValidColor(s?.color) ? s.color : "#878a99",
        count,
      };
    });
    rows.sort((a, b) => b.count - a.count);
    return rows;
  }, [tasks, statusById]);

  const priorityRows = useMemo(() => {
    const rows = priorities.map((p) => ({
      id: p.id,
      name: p.name,
      color: isValidColor(p.color) ? p.color : "#878a99",
      count: tasks.filter((t) => Number(t.task_priority) === Number(p.id)).length,
      open: tasks.filter((t) => Number(t.task_priority) === Number(p.id) && !isDone(t)).length,
    }));
    const max = Math.max(1, ...rows.map((r) => r.count));
    return rows.map((r) => ({ ...r, pct: Math.round((r.count / max) * 100) }));
  }, [tasks, priorities.length, statusById]);

  const trend = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en-IN", { month: "short" }), created: 0, done: 0 });
    }
    const idx = Object.fromEntries(months.map((m, i) => [m.key, i]));
    tasks.forEach((t) => {
      const d = parseDate(t.created_time || t.created_at || t.start_time);
      if (!d) return;
      const i = idx[`${d.getFullYear()}-${d.getMonth()}`];
      if (i === undefined) return;
      months[i].created += 1;
      if (isDone(t)) months[i].done += 1;
    });
    return months;
  }, [tasks, statusById]);

  const upcoming = useMemo(() => {
    const horizon = Date.now() + 14 * DAY;
    return tasks
      .filter((t) => !isDone(t))
      .map((t) => ({ ...t, _due: parseDate(t.end_time) }))
      .filter((t) => t._due && t._due.getTime() <= horizon)
      .sort((a, b) => a._due - b._due)
      .slice(0, 6);
  }, [tasks, statusById]);

  const topProjects = useMemo(
    () =>
      [...projects]
        .filter((p) => p.status !== false)
        .sort(
          (a, b) =>
            Number(b?.task_status_details?.project_completed_percentage || 0) -
            Number(a?.task_status_details?.project_completed_percentage || 0),
        )
        .slice(0, 5),
    [projects],
  );

  const workload = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.assigned_to) return;
      const k = String(t.assigned_to);
      map[k] = map[k] || { id: k, total: 0, done: 0 };
      map[k].total += 1;
      if (isDone(t)) map[k].done += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((w) => ({ ...w, emp: employeeById[w.id] }));
  }, [tasks, employeeById, statusById]);

  const recent = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => {
          const ta = parseDate(a.created_time)?.getTime() || 0;
          const tb = parseDate(b.created_time)?.getTime() || 0;
          return tb - ta || Number(b.id || 0) - Number(a.id || 0);
        })
        .slice(0, 6),
    [tasks],
  );

  const chartText = "#878a99";
  const gridColor = "rgba(135,138,153,0.15)";

  const trendOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        toolbar: { show: false },
        fontFamily: "inherit",
        foreColor: chartText,
        animations: { enabled: false },
      },
      colors: ["#405189", "#0ab39c"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      fill: {
        type: "gradient",
        gradient: { opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 95] },
      },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      xaxis: {
        categories: trend.map((m) => m.label),
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { formatter: (v) => Math.round(v) },
        min: 0,
        forceNiceScale: true,
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        markers: { radius: 12 },
      },
      tooltip: { theme: "dark" },
    }),
    [trend],
  );

  const trendSeries = useMemo(
    () => [
      { name: "Created", data: trend.map((m) => m.created) },
      { name: "Completed", data: trend.map((m) => m.done) },
    ],
    [trend],
  );

  const donutOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        fontFamily: "inherit",
        foreColor: chartText,
        animations: { enabled: false },
      },
      labels: statusSeries.map((s) => s.name),
      colors: statusSeries.map((s) => s.color),
      legend: { show: false },
      dataLabels: { enabled: false },
      stroke: { width: 3, colors: ["transparent"] },
      plotOptions: {
        pie: {
          donut: {
            size: "74%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Tasks",
                color: chartText,
                formatter: () => stats.total,
              },
              value: { fontSize: "26px", fontWeight: 700 },
            },
          },
        },
      },
      tooltip: { theme: "dark" },
    }),
    [statusSeries, stats.total],
  );

  const donutSeries = useMemo(
    () => statusSeries.map((s) => s.count),
    [statusSeries],
  );

  const radialOptions = useMemo(
    () => ({
      chart: {
        type: "radialBar",
        fontFamily: "inherit",
        sparkline: { enabled: true },
        animations: { enabled: false },
      },
      colors: ["#0ab39c"],
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "horizontal",
          gradientToColors: ["#299cdb"],
          stops: [0, 100],
        },
      },
      plotOptions: {
        radialBar: {
          hollow: { size: "64%" },
          track: { background: gridColor, strokeWidth: "100%" },
          dataLabels: {
            name: {
              show: true,
              offsetY: 22,
              color: chartText,
              fontSize: "12px",
            },
            value: {
              offsetY: -10,
              fontSize: "28px",
              fontWeight: 700,
              formatter: (v) => `${Math.round(v)}%`,
            },
          },
        },
      },
      stroke: { lineCap: "round" },
      labels: ["Completed"],
    }),
    [],
  );

  const ChartFallback = (
    <div className="crd-loading" style={{ padding: "40px 0" }}>
      Loading chart…
    </div>
  );

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const projectName = (id) => projects.find((p) => Number(p.id) === Number(id))?.title;
  const clientName = (id) => clients.find((c) => Number(c.id) === Number(id))?.name;

  return (
    <div className="page-content crd-page">
      <Container fluid>
        {/* Hero */}
        <div className="crd-hero">
          <div className="crd-hero-glow" />
          <div className="crd-hero-text">
            <span className="crd-hero-chip">
              <i className="ri-briefcase-4-line" /> CRM Overview
            </span>
            <h3>
              {greeting}
              {profile?.first_name ? `, ${profile.first_name}` : ""} 👋
            </h3>
            <p>
              <i className="ri-calendar-line" /> {today}
              <span className="crd-dot" />
              {stats.open} open tasks across {projects.length} projects
            </p>
          </div>
          <div className="crd-hero-actions">
            <button data-testid="crm-dashboard-clients-button" type="button" className="crd-btn crd-btn-light" onClick={() => navigate("/clients")}>
              <i className="ri-user-star-line" /> Clients
            </button>
            <button data-testid="crm-dashboard-projects-button" type="button" className="crd-btn crd-btn-light" onClick={() => navigate("/projects")}>
              <i className="ri-folder-chart-line" /> Projects
            </button>
            <button data-testid="crm-dashboard-go-to-tasks-button" type="button" className="crd-btn crd-btn-solid" onClick={() => navigate("/tasks")}>
              <i className="ri-task-line" /> Go to Tasks
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="crd-kpis">
          <KpiCard
            icon="ri-user-star-line"
            tone="primary"
            label="Clients"
            value={clients.length}
            sub={`${stats.activeClients} active · ${stats.clientProjects} client projects`}
            onClick={() => navigate("/clients")}
          />
          <KpiCard
            icon="ri-folder-chart-line"
            tone="violet"
            label="Projects"
            value={projects.length}
            progress={stats.avgProgress}
            sub={`${stats.activeProjects} active · ${stats.avgProgress}% avg progress`}
            onClick={() => navigate("/projects")}
          />
          <KpiCard
            icon="ri-list-check-2"
            tone="info"
            label="Open Tasks"
            value={loading ? "…" : stats.open}
            progress={stats.completion}
            sub={`${stats.inProgress} in progress · ${stats.done} done`}
            onClick={() => navigate("/tasks")}
          />
          <KpiCard
            icon="ri-alarm-warning-line"
            tone="danger"
            label="Overdue"
            value={loading ? "…" : stats.overdue}
            sub={stats.overdue ? "Need attention now" : "All tasks on schedule"}
          />
        </div>

        {loading && tasks.length === 0 ? (
          <CardGridSkeleton count={6} min={280} testId="crm-dashboard-loading-skeleton" label="Loading CRM insights" />
        ) : (
          <>
            <div className="crd-grid crd-grid-2-1">
              <Panel title="Task Activity" icon="ri-line-chart-line" tone="primary"
                action={<span className="crd-chip">Last 6 months</span>}>
                {showCharts ? (
                  <Suspense fallback={ChartFallback}>
                    <ReactApexChart
                      type="area"
                      height={290}
                      options={trendOptions}
                      series={trendSeries}
                    />
                  </Suspense>
                ) : (
                  ChartFallback
                )}
              </Panel>

              <Panel title="Tasks by Status" icon="ri-donut-chart-line" tone="info">
                {statusSeries.length ? (
                  <>
                    {showCharts ? (
                      <Suspense fallback={ChartFallback}>
                        <ReactApexChart
                          type="donut"
                          height={220}
                          options={donutOptions}
                          series={donutSeries}
                        />
                      </Suspense>
                    ) : (
                      ChartFallback
                    )}
                    <div className="crd-legend">
                      {statusSeries.map((s) => (
                        <div key={s.name} className="crd-legend-row">
                          <span className="crd-legend-dot" style={{ background: s.color }} />
                          <span className="crd-legend-name">{s.name}</span>
                          <span className="crd-legend-val">{s.count}</span>
                          <span className="crd-legend-pct">
                            {stats.total ? Math.round((s.count / stats.total) * 100) : 0}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Empty icon="ri-pie-chart-line" text="No tasks yet" />
                )}
              </Panel>
            </div>

            <div className="crd-grid crd-grid-1-1-1">
              <Panel title="Completion Rate" icon="ri-checkbox-circle-line" tone="success">
                {showCharts ? (
                  <Suspense fallback={ChartFallback}>
                    <ReactApexChart
                      type="radialBar"
                      height={210}
                      options={radialOptions}
                      series={[stats.completion]}
                    />
                  </Suspense>
                ) : (
                  ChartFallback
                )}
                <div className="crd-mini-stats">
                  <div>
                    <strong>{stats.done}</strong>
                    <span>Done</span>
                  </div>
                  <div>
                    <strong>{stats.inProgress}</strong>
                    <span>In progress</span>
                  </div>
                  <div>
                    <strong className="text-danger">{stats.overdue}</strong>
                    <span>Overdue</span>
                  </div>
                </div>
              </Panel>

              <Panel title="Priority Breakdown" icon="ri-flag-2-line" tone="warning">
                {priorityRows.length ? (
                  <div className="crd-prio">
                    {priorityRows.map((p) => (
                      <div key={p.id} className="crd-prio-row">
                        <div className="crd-prio-head">
                          <span className="crd-prio-name">
                            <span className="crd-legend-dot" style={{ background: p.color }} />
                            {p.name}
                          </span>
                          <span className="crd-prio-count">
                            {p.count}
                            <small>{p.open} open</small>
                          </span>
                        </div>
                        <div className="crd-track">
                          <span style={{ width: `${p.pct}%`, background: p.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty icon="ri-flag-line" text="No priorities configured" />
                )}
              </Panel>

              <Panel title="Team Workload" icon="ri-team-line" tone="violet">
                {workload.length ? (
                  <div className="crd-team">
                    {workload.map((w) => {
                      const name = `${w.emp?.first_name || ""} ${w.emp?.last_name || ""}`.trim() || "Unknown";
                      const pct = w.total ? Math.round((w.done / w.total) * 100) : 0;
                      return (
                        <div key={w.id} className="crd-team-row">
                          <Avatar emp={w.emp} />
                          <div className="crd-team-info">
                            <div className="crd-team-top">
                              <span className="crd-team-name">{name}</span>
                              <span className="crd-team-count">
                                {w.done}/{w.total}
                              </span>
                            </div>
                            <div className="crd-track crd-track-sm">
                              <span className="crd-fill-grad" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty icon="ri-user-unfollow-line" text="No assigned tasks" />
                )}
              </Panel>
            </div>

            <div className="crd-grid crd-grid-1-1">
              <Panel title="Project Progress" icon="ri-rocket-2-line" tone="primary"
                action={<button data-testid="crm-dashboard-view-all-button" type="button" className="crd-link" onClick={() => navigate("/projects")}>View all <i className="ri-arrow-right-s-line" /></button>}>
                {topProjects.length ? (
                  <div className="crd-projects">
                    {topProjects.map((p) => {
                      const pct = Math.round(Number(p?.task_status_details?.project_completed_percentage || 0));
                      const due = relativeDue(parseDate(p.deadline));
                      const client = Number(p.type) === 2 ? clientName(p.client) : null;
                      const tone = pct >= 75 ? "success" : pct >= 40 ? "info" : "warning";
                      return (
                        <div key={p.id} className="crd-project" onClick={() => navigate(`/project-overview/${p.id}`)}>
                          <span className={`crd-project-icon crd-tone-${toneFor(p.title || "")}`}>
                            {(p.title || "P").charAt(0).toUpperCase()}
                          </span>
                          <div className="crd-project-info">
                            <div className="crd-project-top">
                              <span className="crd-project-title">{p.title}</span>
                              <span className={`crd-pill crd-pill-${tone}`}>{pct}%</span>
                            </div>
                            <div className="crd-track crd-track-sm">
                              <span className={`crd-fill-${tone}`} style={{ width: `${pct}%` }} />
                            </div>
                            <div className="crd-project-meta">
                              <span>
                                <i className={client ? "ri-user-star-line" : "ri-building-line"} />
                                {client || "Internal"}
                              </span>
                              {p.deadline && (
                                <span className={`text-${due.tone}`}>
                                  <i className="ri-calendar-event-line" />
                                  {due.text}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty icon="ri-folder-open-line" text="No active projects" />
                )}
              </Panel>

              <Panel title="Upcoming Deadlines" icon="ri-timer-flash-line" tone="danger"
                action={<span className="crd-chip">Next 14 days</span>}>
                {upcoming.length ? (
                  <div className="crd-due-list">
                    {upcoming.map((t) => {
                      const due = relativeDue(t._due);
                      const status = statusById[String(t.task_status)];
                      return (
                        <div key={t.id} className={`crd-due crd-due-${due.tone}`} onClick={() => navigate("/tasks")}>
                          <div className="crd-due-date">
                            <strong>{t._due.getDate()}</strong>
                            <span>{t._due.toLocaleString("en-IN", { month: "short" })}</span>
                          </div>
                          <div className="crd-due-body">
                            <div className="crd-due-title">{t.title}</div>
                            <div className="crd-due-meta">
                              {projectName(t.project) && (
                                <span>
                                  <i className="ri-folder-2-line" />
                                  {projectName(t.project)}
                                </span>
                              )}
                              {status && (
                                <span className="crd-status" style={{ "--st": isValidColor(status.color) ? status.color : "#878a99" }}>
                                  {status.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`crd-pill crd-pill-${due.tone}`}>{due.text}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty icon="ri-calendar-check-line" text="Nothing due in the next two weeks" />
                )}
              </Panel>
            </div>

            <Panel title="Recent Tasks" icon="ri-history-line" tone="info" className="mb-4"
              action={<button data-testid="crm-dashboard-open-task-board-button" type="button" className="crd-link" onClick={() => navigate("/tasks")}>Open task board <i className="ri-arrow-right-s-line" /></button>}>
              {recent.length ? (
                <div className="crd-recent">
                  {recent.map((t) => {
                    const status = statusById[String(t.task_status)];
                    const prio = priorities.find((p) => Number(p.id) === Number(t.task_priority));
                    const emp = employeeById[String(t.assigned_to)];
                    const due = parseDate(t.end_time);
                    return (
                      <div key={t.id} className="crd-recent-row" onClick={() => navigate("/tasks")}>
                        <span className={`crd-check ${isDone(t) ? "is-done" : ""}`}>
                          <i className={isDone(t) ? "ri-check-line" : "ri-checkbox-blank-circle-line"} />
                        </span>
                        <div className="crd-recent-main">
                          <div className={`crd-recent-title ${isDone(t) ? "is-done" : ""}`}>{t.title}</div>
                          <div className="crd-recent-sub">
                            {projectName(t.project) || clientName(t.client) || "General"}
                          </div>
                        </div>
                        <div className="crd-recent-cells">
                          {prio && (
                            <span className="crd-status" style={{ "--st": isValidColor(prio.color) ? prio.color : "#878a99" }}>
                              <i className="ri-flag-2-fill" /> {prio.name}
                            </span>
                          )}
                          {status && (
                            <span className="crd-status" style={{ "--st": isValidColor(status.color) ? status.color : "#878a99" }}>
                              {status.name}
                            </span>
                          )}
                          <span className="crd-recent-date">
                            <i className="ri-calendar-line" /> {fmtShort(due)}
                          </span>
                          {emp && <Avatar emp={emp} size={28} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty icon="ri-task-line" text="No tasks created yet" />
              )}
            </Panel>
          </>
        )}
      </Container>

      <style>{`
        .crd-page{--crd-r:16px}
        .crd-tone-primary{--t:var(--vz-primary-rgb)}
        .crd-tone-success{--t:var(--vz-success-rgb)}
        .crd-tone-info{--t:var(--vz-info-rgb)}
        .crd-tone-warning{--t:var(--vz-warning-rgb)}
        .crd-tone-danger{--t:var(--vz-danger-rgb)}
        .crd-tone-violet{--t:124,92,255}

        .crd-hero{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;
          padding:26px 28px;margin-bottom:20px;border-radius:20px;color:#fff;
          background:linear-gradient(120deg,color-mix(in srgb,var(--vz-success) 72%,#000) 0%,var(--vz-success) 50%,color-mix(in srgb,var(--vz-success) 55%,var(--vz-info)) 100%);
          box-shadow:0 18px 40px -18px color-mix(in srgb,var(--vz-success) 70%,transparent)}
        .crd-hero-glow{position:absolute;inset:0;pointer-events:none;
          background:radial-gradient(420px 220px at 85% -10%,rgba(255,255,255,.22),transparent 60%),
                     radial-gradient(300px 200px at 10% 120%,color-mix(in srgb,var(--vz-info) 35%,transparent),transparent 60%)}
        .crd-hero::after{content:"";position:absolute;right:-60px;bottom:-80px;width:260px;height:260px;border-radius:50%;
          border:36px solid rgba(255,255,255,.06)}
        .crd-hero-text{position:relative;z-index:1}
        .crd-hero-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;
          background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(6px)}
        .crd-hero h3{margin:12px 0 6px;color:#fff;font-weight:700;font-size:24px}
        .crd-hero p{margin:0;opacity:.85;font-size:13.5px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
        .crd-dot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.6);margin:0 6px}
        .crd-hero-actions{position:relative;z-index:1;display:flex;gap:10px;flex-wrap:wrap}
        .crd-btn{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 16px;border-radius:12px;font-weight:600;font-size:13.5px;
          border:1px solid transparent;transition:all .2s ease}
        .crd-btn-light{color:#fff;background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.25);backdrop-filter:blur(6px)}
        .crd-btn-light:hover{background:rgba(255,255,255,.22)}
        .crd-btn-solid{color:var(--vz-success);background:#fff;box-shadow:0 8px 20px -8px rgba(0,0,0,.4)}
        .crd-btn-solid:hover{transform:translateY(-1px)}

        .crd-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:20px}
        .crd-kpi{position:relative;overflow:hidden;padding:18px;border-radius:var(--crd-r);background:var(--vz-secondary-bg);
          border:1px solid var(--vz-border-color);transition:transform .2s ease,box-shadow .2s ease}
        .crd-kpi::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:rgb(var(--t))}
        .crd-kpi::after{content:"";position:absolute;right:-30px;top:-30px;width:110px;height:110px;border-radius:50%;
          background:radial-gradient(circle,rgba(var(--t),.14),transparent 70%)}
        .crd-kpi[role=button]{cursor:pointer}
        .crd-kpi:hover{transform:translateY(-3px);box-shadow:0 16px 30px -18px rgba(var(--t),.6)}
        .crd-kpi-top{display:flex;justify-content:space-between;align-items:flex-start}
        .crd-kpi-icon{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;font-size:22px;color:rgb(var(--t));
          background:rgba(var(--t),.12)}
        .crd-kpi-go{font-size:18px;color:var(--vz-secondary-color);transition:all .2s}
        .crd-kpi:hover .crd-kpi-go{color:rgb(var(--t));transform:translate(2px,-2px)}
        .crd-kpi-value{margin-top:14px;font-size:30px;font-weight:700;line-height:1;color:var(--vz-heading-color)}
        .crd-kpi-label{margin-top:6px;font-size:13px;font-weight:600;color:var(--vz-secondary-color);text-transform:uppercase;letter-spacing:.04em}
        .crd-kpi-bar{margin-top:12px;height:6px;border-radius:6px;background:rgba(var(--t),.12);overflow:hidden}
        .crd-kpi-bar span{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,rgba(var(--t),.6),rgb(var(--t)))}
        .crd-kpi-sub{margin-top:8px;font-size:12px;color:var(--vz-secondary-color)}

        .crd-grid{display:grid;gap:16px;margin-bottom:16px}
        .crd-grid-2-1{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
        .crd-grid-1-1-1{grid-template-columns:repeat(3,minmax(0,1fr))}
        .crd-grid-1-1{grid-template-columns:repeat(2,minmax(0,1fr))}

        .crd-panel{display:flex;flex-direction:column;border-radius:var(--crd-r);background:var(--vz-secondary-bg);
          border:1px solid var(--vz-border-color);box-shadow:0 1px 2px rgba(15,23,42,.04)}
        .crd-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 18px;
          border-bottom:1px solid var(--vz-border-color)}
        .crd-panel-title{display:flex;align-items:center;gap:10px;font-weight:700;font-size:14.5px;color:var(--vz-heading-color)}
        .crd-panel-icon{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;font-size:16px;
          color:rgb(var(--t));background:rgba(var(--t),.12)}
        .crd-panel-body{padding:16px 18px;flex:1}
        .crd-chip{font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:999px;color:var(--vz-secondary-color);
          background:var(--vz-tertiary-bg);border:1px solid var(--vz-border-color)}
        .crd-link{border:0;background:none;padding:0;font-size:12.5px;font-weight:600;color:var(--vz-primary);display:inline-flex;align-items:center}
        .crd-link:hover{text-decoration:underline}

        .crd-legend{display:flex;flex-direction:column;gap:6px;margin-top:6px}
        .crd-legend-row{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:10px;font-size:13px}
        .crd-legend-row:hover{background:var(--vz-tertiary-bg)}
        .crd-legend-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0;display:inline-block}
        .crd-legend-name{flex:1;color:var(--vz-body-color)}
        .crd-legend-val{font-weight:700;color:var(--vz-heading-color)}
        .crd-legend-pct{width:42px;text-align:right;font-size:12px;color:var(--vz-secondary-color)}

        .crd-mini-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
        .crd-mini-stats div{text-align:center;padding:10px 6px;border-radius:12px;background:var(--vz-tertiary-bg)}
        .crd-mini-stats strong{display:block;font-size:18px;color:var(--vz-heading-color)}
        .crd-mini-stats span{font-size:11.5px;color:var(--vz-secondary-color)}

        .crd-prio{display:flex;flex-direction:column;gap:16px}
        .crd-prio-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px}
        .crd-prio-name{display:flex;align-items:center;gap:8px;font-weight:600;font-size:13.5px;color:var(--vz-heading-color)}
        .crd-prio-count{font-weight:700;color:var(--vz-heading-color);display:flex;align-items:baseline;gap:6px}
        .crd-prio-count small{font-weight:500;font-size:11.5px;color:var(--vz-secondary-color)}
        .crd-track{height:8px;border-radius:8px;background:var(--vz-tertiary-bg);overflow:hidden}
        .crd-track-sm{height:6px}
        .crd-track span{display:block;height:100%;border-radius:8px;transition:width .6s ease}
        .crd-fill-grad{background:linear-gradient(90deg,#7c5cff,#3577f1)}
        .crd-fill-success{background:linear-gradient(90deg,#34d3b9,var(--vz-success))}
        .crd-fill-info{background:linear-gradient(90deg,#6fd0f5,var(--vz-info))}
        .crd-fill-warning{background:linear-gradient(90deg,#ffc977,var(--vz-warning))}

        .crd-avatar{border-radius:50%;object-fit:cover;flex-shrink:0;display:inline-grid;place-items:center;color:#fff;font-weight:700;
          box-shadow:0 0 0 2px var(--vz-secondary-bg)}
        .crd-avatar-primary{background:linear-gradient(135deg,#405189,#6a7bd6)}
        .crd-avatar-success{background:linear-gradient(135deg,#0ab39c,#34d3b9)}
        .crd-avatar-info{background:linear-gradient(135deg,#299cdb,#6fd0f5)}
        .crd-avatar-warning{background:linear-gradient(135deg,#f7b84b,#ffc977)}
        .crd-avatar-danger{background:linear-gradient(135deg,#f06548,#ff8a7a)}
        .crd-avatar-violet{background:linear-gradient(135deg,#7c5cff,#a58bff)}

        .crd-team{display:flex;flex-direction:column;gap:14px}
        .crd-team-row{display:flex;align-items:center;gap:12px}
        .crd-team-info{flex:1;min-width:0}
        .crd-team-top{display:flex;justify-content:space-between;margin-bottom:6px}
        .crd-team-name{font-weight:600;font-size:13.5px;color:var(--vz-heading-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .crd-team-count{font-size:12px;font-weight:600;color:var(--vz-secondary-color)}

        .crd-projects,.crd-due-list{display:flex;flex-direction:column;gap:10px}
        .crd-project{display:flex;gap:12px;padding:12px;border-radius:14px;border:1px solid var(--vz-border-color);cursor:pointer;
          transition:all .2s ease}
        .crd-project:hover{border-color:rgba(var(--vz-primary-rgb),.4);background:rgba(var(--vz-primary-rgb),.03);transform:translateX(2px)}
        .crd-project-icon{width:40px;height:40px;border-radius:12px;flex-shrink:0;display:grid;place-items:center;font-weight:700;font-size:16px;
          color:rgb(var(--t));background:rgba(var(--t),.12)}
        .crd-project-info{flex:1;min-width:0}
        .crd-project-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:7px}
        .crd-project-title{font-weight:600;color:var(--vz-heading-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .crd-project-meta{display:flex;justify-content:space-between;gap:8px;margin-top:7px;font-size:12px;color:var(--vz-secondary-color)}
        .crd-project-meta span{display:inline-flex;align-items:center;gap:4px}

        .crd-pill{flex-shrink:0;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:999px;white-space:nowrap}
        .crd-pill-success{color:var(--vz-success);background:rgba(var(--vz-success-rgb),.12)}
        .crd-pill-info{color:var(--vz-info);background:rgba(var(--vz-info-rgb),.12)}
        .crd-pill-warning{color:var(--vz-warning);background:rgba(var(--vz-warning-rgb),.14)}
        .crd-pill-danger{color:var(--vz-danger);background:rgba(var(--vz-danger-rgb),.12)}
        .crd-pill-secondary{color:var(--vz-secondary-color);background:var(--vz-tertiary-bg)}

        .crd-due{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:14px;cursor:pointer;
          border:1px solid var(--vz-border-color);border-left:3px solid var(--vz-border-color);transition:all .2s ease}
        .crd-due:hover{background:var(--vz-tertiary-bg)}
        .crd-due-danger{border-left-color:var(--vz-danger)}
        .crd-due-warning{border-left-color:var(--vz-warning)}
        .crd-due-info{border-left-color:var(--vz-info)}
        .crd-due-success{border-left-color:var(--vz-success)}
        .crd-due-date{width:46px;flex-shrink:0;text-align:center;padding:6px 0;border-radius:10px;background:var(--vz-tertiary-bg)}
        .crd-due-date strong{display:block;font-size:17px;line-height:1.1;color:var(--vz-heading-color)}
        .crd-due-date span{font-size:11px;text-transform:uppercase;color:var(--vz-secondary-color)}
        .crd-due-body{flex:1;min-width:0}
        .crd-due-title{font-weight:600;font-size:13.5px;color:var(--vz-heading-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .crd-due-meta{display:flex;align-items:center;gap:8px;margin-top:4px;font-size:12px;color:var(--vz-secondary-color);flex-wrap:wrap}
        .crd-due-meta span{display:inline-flex;align-items:center;gap:4px}
        .crd-status{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;padding:2px 9px;border-radius:999px;
          color:var(--st);background:color-mix(in srgb,var(--st) 14%,transparent);white-space:nowrap}

        .crd-recent{display:flex;flex-direction:column}
        .crd-recent-row{display:flex;align-items:center;gap:12px;padding:11px 8px;border-radius:12px;cursor:pointer;
          border-bottom:1px dashed var(--vz-border-color)}
        .crd-recent-row:last-child{border-bottom:0}
        .crd-recent-row:hover{background:var(--vz-tertiary-bg)}
        .crd-check{width:28px;height:28px;flex-shrink:0;border-radius:50%;display:grid;place-items:center;font-size:15px;
          color:var(--vz-secondary-color);background:var(--vz-tertiary-bg)}
        .crd-check.is-done{color:#fff;background:linear-gradient(135deg,#0ab39c,#34d3b9)}
        .crd-recent-main{flex:1;min-width:0}
        .crd-recent-title{font-weight:600;font-size:13.5px;color:var(--vz-heading-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .crd-recent-title.is-done{text-decoration:line-through;opacity:.6}
        .crd-recent-sub{font-size:12px;color:var(--vz-secondary-color)}
        .crd-recent-cells{display:flex;align-items:center;gap:10px;flex-shrink:0}
        .crd-recent-date{font-size:12px;color:var(--vz-secondary-color);display:inline-flex;align-items:center;gap:4px;min-width:72px}

        .crd-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:28px 0;color:var(--vz-secondary-color)}
        .crd-empty span{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font-size:24px;
          color:var(--vz-primary);background:rgba(var(--vz-primary-rgb),.1)}
        .crd-empty p{margin:0;font-size:13px}
        .crd-loading{display:flex;align-items:center;justify-content:center;gap:10px;padding:60px 0;color:var(--vz-secondary-color)}

        .crd-page .apexcharts-tooltip{border-radius:10px}

        @media (max-width:1399px){.crd-grid-1-1-1{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media (max-width:1199px){.crd-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.crd-grid-2-1{grid-template-columns:1fr}}
        @media (max-width:767px){.crd-kpis,.crd-grid-1-1,.crd-grid-1-1-1{grid-template-columns:1fr}
          .crd-recent-cells .crd-status,.crd-recent-date{display:none}.crd-hero{padding:22px}}
      `}</style>
    </div>
  );
};

export default CrmDashboard;
