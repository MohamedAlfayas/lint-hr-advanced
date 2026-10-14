import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import dayjs from "dayjs";
import {
  Autocomplete,
  Chip,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { DateTimePicker as MuiDateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import withFieldClickOpen from "../../../shared/ui/form/withFieldClickOpen";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  addTask,
  editTask,
} from "../../../redux/reducers/ChildReducer/TaskReducer";
import {
  editProject, // ✅ NEW IMPORT
} from "../../../redux/reducers/ChildReducer/ProjectsReducer";
import { toast } from "react-toastify";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { PostApi } from "../../../common/api/PostApi";
import { PutApi } from "../../../common/api/PutApi";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import { Api } from "../../../common/api/Api";
import { DateTimeFormat } from "../../../common/constant/Constants";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import {
  EmployeeAvatar,
  renderEmployeeOption,
} from "../employee/EmployeeOption";
import {
  FormAutocomplete,
  FormSection,
  FormSwitch,
  FormTextField,
  FormToggleGroup,
} from "../../../shared/ui/form";

defineElement(loadAnimation);

const DateTimePicker = withFieldClickOpen(MuiDateTimePicker);

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 500;
const TITLE_CHARS = /[^A-Za-z0-9\s.,&()'-]/g;
const DESCRIPTION_CHARS = /[^A-Za-z0-9\s.,!?'"\-_()&:;/]/g;

// ─── Related To options ───────────────────────────────────────────────────────
const relatedToOptions = [
  { value: "custom", label: "In House" },
  { value: "project", label: "Project" },
  { value: "client", label: "Client" },
];

// ─── Points options ───────────────────────────────────────────────────────────
const pointsOptions = [
  { value: "1", label: "1 Point" },
  { value: "2", label: "2 Points" },
  { value: "3", label: "3 Points" },
  { value: "4", label: "4 Points" },
  { value: "5", label: "5 Points" },
];

// ─── Default form state ───────────────────────────────────────────────────────
const defaultTaskData = {
  title: "",
  description: "",
  related_to: "custom",
  project: null,
  client: null,
  points: "1",
  assigned_to: null,
  collaborators_id_list: [],
  collaborator_details: [],
  task_status: null,
  task_priority: null,
  start_time: "",
  end_time: "",
  status: true,
  requires_field_visit: false, // ✅ NEW FIELD
  client_location: null, // ✅ NEW FIELD
};

const schema = Yup.object({
  title: Yup.string()
    .trim()
    .matches(/^[A-Za-z0-9\s.,&()'-]+$/, "Task Title contains invalid characters")
    .required("Please enter a valid task title.")
    .test(
      "task-title-length",
      "Task Title cannot exceed 100 characters",
      (value) => !value || value.length <= TITLE_MAX,
    ),
  related_to: Yup.string().required("Please Select Related To"),
  assigned_to: Yup.number().nullable().required("Please Select Assigned To"),
  points: Yup.string()
    .required("Please Select Points")
    .oneOf(["1", "2", "3", "4", "5"], "Please Select a valid Points value"),
  task_status: Yup.number().nullable().required("Please Select Task Status"),
  task_priority: Yup.number()
    .nullable()
    .required("Please Select Task Priority"),
  end_time: Yup.string()
    .nullable()
    .test(
      "end-after-start",
      "Deadline cannot be before the start date.",
      function (value) {
        const { start_time } = this.parent;
        if (!value || !start_time) return true;
        return new Date(value) >= new Date(start_time);
      },
    ),
  description: Yup.string()
    .trim()
    .matches(
      /^[A-Za-z0-9\s.,!?'"\-_()&:;/]*$/,
      "Description contains invalid characters",
    )
    .test(
      "description-length",
      "Description cannot exceed 500 characters",
      (value) => !value || value.length <= DESCRIPTION_MAX,
    ),
  // ✅ NEW: required only when related_to === "client" and requires_field_visit is checked
  client_location: Yup.number()
    .nullable()
    .when(["related_to", "requires_field_visit"], {
      is: (related_to, requires_field_visit) =>
        related_to === "client" && !!requires_field_visit,
      then: (schema) => schema.required("Please Select Client Location"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

// ─── form_obj -> task state (create, edit, or "add from project page") ───────
const toTaskData = (form_obj) => {
  if (form_obj && Object.keys(form_obj).length > 0 && form_obj.id) {
    return {
      ...defaultTaskData,
      ...form_obj,
      related_to: form_obj.related_to || "custom",
      points: form_obj.points ? String(form_obj.points) : "1",
      collaborators_id_list: form_obj.collaborators_id_list || [],
      collaborator_details: form_obj.collaborator_details || [],
      requires_field_visit: !!form_obj.requires_field_visit, // ✅ NEW FIELD
      // ✅ API returns client_location as a full object ({id, type, type_id, name, ...})
      // when editing, but we only ever store/send the plain id internally.
      client_location:
        form_obj.client_location && typeof form_obj.client_location === "object"
          ? (form_obj.client_location.id ?? null)
          : (form_obj.client_location ?? null),
    };
  }
  if (form_obj && form_obj.project) {
    return {
      ...defaultTaskData,
      related_to: "project",
      project: Number(form_obj.project),
    };
  }
  return defaultTaskData;
};

// ─── Build employee option object (normalised shape) ─────────────────────────
const buildEmployeeOption = (emp) => ({
  ...emp,
  value: emp.id,
  label:
    `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
    emp.label ||
    emp.name ||
    `Employee ${emp.id}`,
});

const employeeOptionLabel = (o) =>
  o?.label ? `${o.label}${o.emp_id ? ` - ${o.emp_id}` : ""}` : "";

// ISO string <-> dayjs for the date-time pickers
const toPickerValue = (isoStr) => {
  if (!isoStr) return null;
  const d = dayjs(isoStr);
  return d.isValid() ? d : null;
};
const fromPickerValue = (value) =>
  value && value.isValid()
    ? value.second(0).millisecond(0).toDate().toISOString()
    : "";

const TaskListForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseTaskData = useMemo(() => toTaskData(form_obj), [form_obj]);

  const { control, handleSubmit, reset, setValue, watch } = useForm({
    resolver: yupResolver(schema, undefined, { raw: true }),
    mode: "onTouched",
    defaultValues: baseTaskData,
  });

  useEffect(() => {
    reset(baseTaskData);
  }, [baseTaskData, reset]);

  // User-driven dependent resets (not triggered by reset()/setValue()).
  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      if (type !== "change") return;
      if (name === "related_to") {
        const nextRelatedTo = values.related_to;
        setValue("project", null);
        setValue("client", null);
        // ✅ reset the toggle + location whenever we leave "client"
        if (nextRelatedTo !== "client") {
          setValue("requires_field_visit", false);
          setValue("client_location", null);
        }
      } else if (name === "client") {
        // ✅ location options depend on client, reset selection
        setValue("client_location", null);
      } else if (name === "requires_field_visit" && !values.requires_field_visit) {
        // ✅ clear location if the toggle is switched off
        setValue("client_location", null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const [
    relatedTo,
    project,
    client,
    requiresFieldVisit,
    taskStatus,
    taskPriority,
    startTime,
    endTime,
    status,
    collaboratorIds,
    collaboratorDetails,
  ] = useWatch({
    control,
    name: [
      "related_to",
      "project",
      "client",
      "requires_field_visit",
      "task_status",
      "task_priority",
      "start_time",
      "end_time",
      "status",
      "collaborators_id_list",
      "collaborator_details",
    ],
  });

  // ─── Initial collaborator options from localStorage ───────────────────────
  const buildDefaultCollaboratorOptions = useCallback(() => {
    const list = GetLocalStorageData("employee") || [];
    return list.map(buildEmployeeOption);
  }, []);

  // ─── Detect if we're in "add from project page" mode ─────────────────────
  const isProjectLocked = !!(
    form_obj?.project &&
    (!form_obj?.id || form_obj?.id === 0)
  );

  // ─── Load options from localStorage ──────────────────────────────────────
  const buildEmployeeOptions = () => {
    const list = GetLocalStorageData("employee") || [];
    return list.map(buildEmployeeOption);
  };

  const buildProjectOptions = () => {
    const list = GetLocalStorageData("projects") || [];
    return list
      .map((p) => {
        const id = p.id ?? p.project_id ?? p.pk;
        const name = p.name ?? p.project_name ?? p.title ?? `Project ${id}`;
        return { ...p, id, value: id, label: name };
      })
      .filter((p) => p.value !== undefined && p.value !== null);
  };

  const buildClientOptions = () => {
    const list = GetLocalStorageData("clients") || [];
    return list
      .map((c) => {
        const id = c.id ?? c.client_id ?? c.pk;
        const name = c.name ?? c.client_name ?? c.title ?? `Client ${id}`;
        return { ...c, id, value: id, label: name };
      })
      .filter((c) => c.value !== undefined && c.value !== null);
  };

  // ✅ Client locations come from the selected client's entity_location_details
  // (saved by ClientForm -> Add Location). Falls back to "entity_locations".
  const buildClientLocationOptions = (clientId) => {
    if (clientId === null || clientId === undefined || clientId === "")
      return [];

    const clients = GetLocalStorageData("clients") || [];
    const selectedClient = clients.find(
      (c) => Number(c.id ?? c.client_id ?? c.pk) === Number(clientId),
    );

    let list = selectedClient?.entity_location_details || [];

    if (!list.length) {
      const fallback = GetLocalStorageData("entity_locations") || [];
      list = fallback.filter(
        (l) => l.type === "client" && Number(l.type_id) === Number(clientId),
      );
    }

    return list
      .filter((l) => !l.type || l.type === "client")
      .map((l) => {
        const id = l.id;
        const address = l.address || l.accurate_address || "";
        const label =
          [l.name, address].filter(Boolean).join(", ") || `Location ${id}`;
        return { ...l, id, value: id, label };
      })
      .filter((l) => l.value !== undefined && l.value !== null);
  };

  const buildTaskStatusOptions = () => {
    const list = GetLocalStorageData("task_status") || [];
    return list
      .filter((s) => s.status !== false || s.id === taskStatus)
      .map((s) => ({ ...s, value: s.id, label: s.name || s.title }));
  };

  const buildTaskPriorityOptions = () => {
    const list = GetLocalStorageData("task_priority") || [];
    return list
      .filter((p) => p.status !== false || p.id === taskPriority)
      .map((p) => ({ ...p, value: p.id, label: p.name }));
  };

  const employeeOptions = buildEmployeeOptions();
  const projectOptions = buildProjectOptions();
  const clientOptions = buildClientOptions();
  const clientLocationOptions = buildClientLocationOptions(client); // ✅ NEW
  const taskStatusOptions = buildTaskStatusOptions();
  const taskPriorityOptions = buildTaskPriorityOptions();

  // ─── Async load for collaborators search API ──────────────────────────────
  const loadCollaboratorOptions = useCallback(
    async (inputValue) => {
      if (!inputValue || inputValue.trim().length === 0) {
        return buildDefaultCollaboratorOptions();
      }
      try {
        const response = await Api.get(
          `/employee/get-data-on-search/?search=${encodeURIComponent(inputValue.trim())}`,
        );
        const results = response?.data?.data || [];
        return results.map(buildEmployeeOption);
      } catch (error) {
        console.error("Collaborator search error:", error);
        const fallback = buildDefaultCollaboratorOptions();
        const q = inputValue.toLowerCase();
        return fallback.filter((e) => e.label.toLowerCase().includes(q));
      }
    },
    [buildDefaultCollaboratorOptions],
  );

  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [collaboratorOptions, setCollaboratorOptions] = useState(
    buildDefaultCollaboratorOptions,
  );
  const [collaboratorsLoading, setCollaboratorsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setCollaboratorsLoading(true);
    loadCollaboratorOptions(collaboratorInput).then((options) => {
      if (!active) return;
      setCollaboratorOptions(options);
      setCollaboratorsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [collaboratorInput, loadCollaboratorOptions]);

  // ─── Derived values ───────────────────────────────────────────────────────
  const projectValue =
    projectOptions.find((o) => o.id === project) || null;

  // ─── Collaborators: resolve selected values ───────────────────────────────
  const collaboratorsValue = (() => {
    const ids = collaboratorIds || [];
    if (!ids.length) return [];

    const details = collaboratorDetails || [];
    if (details.length) {
      return details.filter((d) => ids.includes(d.id)).map(buildEmployeeOption);
    }

    return employeeOptions.filter((e) => ids.includes(e.id));
  })();

  const endBeforeStart =
    !!startTime && !!endTime && new Date(endTime) < new Date(startTime);

  const showProject = relatedTo === "project";
  const showClient = relatedTo === "client";
  const showClientLocation = showClient && !!requiresFieldVisit; // ✅ NEW
  const isEditMode = baseTaskData.id > 0;

  const onSubmit = async (values) => {
    const taskData = { ...baseTaskData, ...values };
    const trimmedTitle = taskData.title.trim();

    setIsSubmitting(true);

    try {
      const isEdit = !!(taskData?.id && taskData.id !== 0);

      const needsFieldVisit =
        taskData.related_to === "client" && !!taskData.requires_field_visit;

      const payload = {
        title: trimmedTitle,
        description: taskData.description || "",
        related_to: taskData.related_to,
        project:
          taskData.related_to === "project" ? taskData.project || null : null,
        client:
          taskData.related_to === "client" ? taskData.client || null : null,
        points: taskData.points || null,
        assigned_to: taskData.assigned_to || null,
        collaborators_id_list: taskData.collaborators_id_list || [],
        task_status: taskData.task_status || null,
        task_priority: taskData.task_priority || null,
        start_time: taskData.start_time || null,
        end_time: taskData.end_time || null,
        status: taskData.status,
        // ✅ NEW FIELD — only meaningful (and only ever true) for Client tasks
        requires_field_visit: needsFieldVisit,
        // ✅ NEW FIELD — id only, sent only when a field visit is required
        client_location: needsFieldVisit
          ? taskData.client_location || null
          : null,
      };

      if (isEdit) payload.id = taskData.id;

      // ── Optimistic update for edit ──────────────────────────────────────
      if (isEdit) {
        dispatch(editTask({ ...taskData, ...payload }));
      }

      const response = isEdit
        ? await PutApi(`task/`, payload, false)
        : await PostApi("task/", payload, false);

      if (response?.status === 200 || response?.status === 201) {
        const responseData = response?.data?.data?.task_data;

        if (responseData) {
          dispatch(isEdit ? editTask(responseData) : addTask(responseData));

          // ✅ Immediately sync project progress in Redux
          // API returns updated task_status_details inside project_data on every task save
          const projectData = response?.data?.data?.project_data;
          if (projectData) {
            dispatch(editProject(projectData));
          }

          // ── Sync localStorage ─────────────────────────────────────────
          const oldTasks = GetLocalStorageData("tasks") || [];
          const updatedTasks = isEdit
            ? oldTasks.map((item) =>
                item.id === responseData.id ? responseData : item,
              )
            : [...oldTasks, responseData];
          SetLocalStorage("tasks", updatedTasks, 1);
        }

        toast.success(response?.data?.message || "Saved successfully");
        dispatch(toggleRSBView(false));
      } else {
        // ── Revert optimistic update on failure ───────────────────────
        if (isEdit) {
          dispatch(editTask(taskData));
        }
        toast.error(response?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error("API Error");
    }

    setIsSubmitting(false);
  };

  return (
    <SidebarFormLayout
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel="Save"
    >
      <FormSection title="Details">
        <FormTextField
          name="title"
          control={control}
          label="Task Title"
          placeholder="Task Title"
          required
          autoFocus
          helperText="Enter Task Title."
          maxLength={TITLE_MAX}
          sanitize={(v) => v.replace(TITLE_CHARS, "")}
          startIcon={<AssignmentOutlinedIcon fontSize="small" color="action" />}
        />
        <FormTextField
          name="description"
          control={control}
          label="Description"
          placeholder="Task description..."
          helperText="Enter task description (optional)."
          multiline
          minRows={3}
          maxRows={8}
          maxLength={DESCRIPTION_MAX}
          sanitize={(v) => v.replace(DESCRIPTION_CHARS, "")}
        />
      </FormSection>

      <FormSection title="Related to">
        {isProjectLocked ? (
          <TextField
            label="Related To"
            value={
              relatedToOptions.find((o) => o.value === relatedTo)?.label ||
              relatedToOptions[0].label
            }
            disabled
            required
            helperText='Locked to "Project" — adding task from project page.'
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <LockOutlinedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        ) : (
          <FormToggleGroup
            name="related_to"
            control={control}
            label="Related To"
            options={relatedToOptions}
            getOptionValue={(o) => o.value}
            required
            helperText="Select whether task relates to In House, a Project, or Client."
          />
        )}

        {/* ── Project ──────────────────────────────────────────── */}
        {showProject &&
          (isProjectLocked ? (
            <TextField
              label="Project"
              value={projectValue?.label || `Project #${project}`}
              disabled
              helperText="Project is pre-selected from the current project page."
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <LockOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          ) : (
            <FormAutocomplete
              name="project"
              control={control}
              label="Project"
              placeholder="Select Project"
              options={projectOptions}
              helperText="Select a project."
            />
          ))}

        {/* ── Client ───────────────────────────────────────────── */}
        {showClient && (
          <FormAutocomplete
            name="client"
            control={control}
            label="Client"
            placeholder="Select Client"
            options={clientOptions}
            helperText="Select a client."
          />
        )}

        {/* ── Requires Field Visit (Client tasks only) ──────────── */}
        {showClient && (
          <FormSwitch
            name="requires_field_visit"
            control={control}
            label="Requires Field Visit"
            description={
              requiresFieldVisit
                ? "Yes — this task requires an on-site visit."
                : "No — this task does not require an on-site visit."
            }
          />
        )}

        {/* ── Client Location (only when Requires Field Visit is on) ─ */}
        {showClientLocation && (
          <FormAutocomplete
            name="client_location"
            control={control}
            label="Client Location"
            required
            disabled={!client}
            placeholder={
              client ? "Select Client Location" : "Select a Client first"
            }
            noOptionsText="No locations found for this client"
            options={clientLocationOptions}
            helperText="Select the client site location for this visit."
          />
        )}
      </FormSection>

      <FormSection title="Assignment">
        <FormAutocomplete
          name="assigned_to"
          control={control}
          label="Assigned To"
          placeholder="Select Employee"
          required
          options={employeeOptions}
          getOptionLabel={employeeOptionLabel}
          helperText="Select who this task is assigned to."
        />

        {/* ── Collaborators (async search) ─────────────────────── */}
        <Controller
          name="collaborators_id_list"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              disableCloseOnSelect
              filterSelectedOptions
              limitTags={3}
              options={[
                ...collaboratorOptions,
                ...collaboratorsValue.filter(
                  (v) => !collaboratorOptions.some((o) => o.id === v.id),
                ),
              ]}
              value={collaboratorsValue}
              loading={collaboratorsLoading}
              loadingText="Searching..."
              noOptionsText={
                collaboratorInput ? "No employees found" : "Type to search"
              }
              filterOptions={(options) => options}
              getOptionLabel={employeeOptionLabel}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              onInputChange={(_, inputValue) =>
                setCollaboratorInput(inputValue)
              }
              onChange={(_, selected) => {
                field.onChange(selected ? selected.map((o) => o.id) : []);
                setValue(
                  "collaborator_details",
                  selected ? selected.map((o) => ({ ...o })) : [],
                );
              }}
              onBlur={field.onBlur}
              renderOption={renderEmployeeOption()}
              renderValue={(value, getItemProps) =>
                value.map((option, index) => {
                  const { key, ...itemProps } = getItemProps({ index });
                  return (
                    <Chip
                      key={key}
                      {...itemProps}
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={option.label}
                      avatar={<EmployeeAvatar option={option} size={20} />}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={field.ref}
                  label="Collaborators"
                  placeholder={
                    collaboratorsValue.length
                      ? undefined
                      : "Search collaborators..."
                  }
                  helperText="Select or search collaborators (optional)."
                />
              )}
            />
          )}
        />
      </FormSection>

      <FormSection title="Tracking">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormAutocomplete
              name="task_status"
              control={control}
              label="Task Status"
              placeholder="Select Status"
              required
              options={taskStatusOptions}
              helperText="Select current task status."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormAutocomplete
              name="task_priority"
              control={control}
              label="Task Priority"
              placeholder="Select Priority"
              required
              options={taskPriorityOptions}
              helperText="Select task priority level."
            />
          </Grid>
        </Grid>

        <FormToggleGroup
          name="points"
          control={control}
          label="Points"
          options={pointsOptions}
          getOptionValue={(o) => o.value}
          getOptionLabel={(o) => o.value}
          required
          helperText="Story points for this task (required)."
        />

        {/* STATUS - SHOW ONLY IN EDIT MODE */}
        {isEditMode && (
          <FormSwitch
            name="status"
            control={control}
            label="Status"
            description={status ? "Active" : "Inactive"}
          />
        )}
      </FormSection>

      <FormSection title="Schedule">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="start_time"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  label="Start Date & Time"
                  format={DateTimeFormat}
                  ampm={false}
                  value={toPickerValue(field.value)}
                  onChange={(next) => {
                    if (next && !next.isValid()) return;
                    field.onChange(fromPickerValue(next));
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      onBlur: field.onBlur,
                      helperText: "Task start date and time (optional).",
                    },
                    field: { clearable: true },
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="end_time"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DateTimePicker
                  label="End Date & Time"
                  format={DateTimeFormat}
                  ampm={false}
                  value={toPickerValue(field.value)}
                  onChange={(next) => {
                    if (next && !next.isValid()) return;
                    field.onChange(fromPickerValue(next));
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      onBlur: field.onBlur,
                      error: endBeforeStart || !!error,
                      helperText: endBeforeStart
                        ? "Deadline cannot be before the start date."
                        : error?.message ||
                          "Task deadline date and time (optional).",
                    },
                    field: { clearable: true },
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </FormSection>
    </SidebarFormLayout>
  );
};

export default TaskListForm;
