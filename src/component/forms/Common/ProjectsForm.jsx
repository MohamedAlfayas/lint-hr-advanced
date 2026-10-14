import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

import { setProjects } from "../../../redux/reducers/ChildReducer/ProjectsReducer";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { PostApi } from "../../../common/api/PostApi";
import { PutApi } from "../../../common/api/PutApi";
import { Api } from "../../../common/api/Api";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import { EmployeeAvatar } from "../employee/EmployeeOption";
import {
  FormAutocomplete,
  FormDatePicker,
  FormSection,
  FormSwitch,
  FormTextField,
  FormToggleGroup,
} from "../../../shared/ui/form";

// ================= EMPLOYEE OPTION =================
const buildEmployeeOption = (emp) => ({
  ...emp,
  value: emp.id,
  label:
    `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
    emp.label ||
    emp.name ||
    `Employee ${emp.id}`,
});

// ================= FIELD LIMITS =================
const TITLE_MAX = 100;
const DESCRIPTION_MAX = 1500;
const PRICE_MAX = 100000000000;

const TITLE_MAX_MSG = `Project title must not exceed ${TITLE_MAX} characters.`;
const DESCRIPTION_MAX_MSG = `Description must not exceed ${DESCRIPTION_MAX} characters.`;
const PRICE_MAX_MSG = `Price cannot exceed ${PRICE_MAX}.00`;

const TITLE_CHARS = /[^A-Za-z0-9\s.,!?'"\-_()&:;/]/g;
const DESCRIPTION_CHARS = /[^A-Za-z0-9\s.,\-#/'&():;?!]/g;

const MIN_PROJECT_DATE = dayjs("1900-01-01");

// ================= PROJECT TYPE =================
const PROJECT_TYPE_INTERNAL = 1;

const PROJECT_TYPE_CLIENT = 2;

const projectTypeOptions = [
  {
    value: PROJECT_TYPE_INTERNAL,
    label: "Internal Project",
  },

  {
    value: PROJECT_TYPE_CLIENT,
    label: "Client Project",
  },
];

const isOnOrAfterMinDate = (value) =>
  !value ||
  dayjs(value).isSame(MIN_PROJECT_DATE, "day") ||
  dayjs(value).isAfter(MIN_PROJECT_DATE, "day");

const schema = Yup.object({
  title: Yup.string()
    .trim()
    .matches(/^[A-Za-z0-9\s.,!?'"\-_()&:;/]+$/, "Please Enter the project title")
    .max(TITLE_MAX, TITLE_MAX_MSG)
    .required("Please Enter the project title")
    .test(
      "not-only-spaces",
      "Please Enter the project title",
      (value) => !value || value.trim().length > 0,
    ),

  type: Yup.number()
    .typeError("Please Select Project Type")
    .required("Please Select Project Type"),

  client: Yup.number()
    .nullable()
    .when("type", {
      is: PROJECT_TYPE_CLIENT,
      then: (s) => s.required("Please Select Client"),
      otherwise: (s) => s.nullable(),
    }),

  members_id_list: Yup.array().min(1, "Please Select Project Members"),

  // Optional Fields
  start_date: Yup.string()
    .nullable()
    .test("start-date-range", "Start date cannot be before 01-01-1900", isOnOrAfterMinDate),
  deadline: Yup.string()
    .nullable()
    .test("deadline-range", "Deadline cannot be before 01-01-1900", isOnOrAfterMinDate)
    .test("deadline-check", "Deadline cannot be before Start Date", function (deadline) {
      const { start_date } = this.parent;

      if (!start_date || !deadline) return true;

      return (
        dayjs(deadline).isSame(dayjs(start_date), "day") ||
        dayjs(deadline).isAfter(dayjs(start_date), "day")
      );
    }),
  price: Yup.number()
    .transform((value, original) =>
      original === "" || original === null || original === undefined ? null : value,
    )
    .typeError("Price must be a number")
    .min(0, "Price cannot be negative")
    .max(PRICE_MAX, PRICE_MAX_MSG)
    .nullable(),

  description: Yup.string()
    .matches(/^[A-Za-z0-9\s.,\-#/'&():;?!]*$/, "Description contains invalid characters")
    .max(DESCRIPTION_MAX, DESCRIPTION_MAX_MSG)
    .nullable(),
});

const toFormValues = (obj) => ({
  ...obj,
  id: obj?.id ?? 0,
  title: obj?.title ?? "",
  type: obj?.type ? Number(obj.type) : PROJECT_TYPE_INTERNAL,
  client: obj?.client ? Number(obj.client) : null,
  description: obj?.description ?? "",
  start_date: obj?.start_date ?? null,
  deadline: obj?.deadline ?? null,
  price: obj?.price ?? "",
  status: obj?.status ?? true,
  members_id_list: (obj?.members_id_list || []).map(Number),
});

const ProjectForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ================= CLIENT OPTIONS =================
  const clientOptions = useMemo(
    () =>
      (GetLocalStorageData("clients") || []).map((client) => ({
        ...client,
        value: client.id,
        label: client.name,
      })),
    [],
  );

  // ================= MEMBER OPTIONS =================
  const defaultMemberOptions = useMemo(
    () => (GetLocalStorageData("employee") || []).map(buildEmployeeOption),
    [],
  );

  // Holds full employee objects for members picked via search, since they
  // may not exist in the localStorage "employee" list.
  const [memberDetails, setMemberDetails] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const searchSeq = useRef(0);

  const loadMemberOptions = useCallback(
    async (inputValue) => {
      if (!inputValue || inputValue.trim().length === 0) {
        return defaultMemberOptions;
      }
      try {
        const response = await Api.get(
          `/employee/get-data-on-search/?search=${encodeURIComponent(inputValue.trim())}`,
        );
        const results = response?.data?.data || [];
        return results.map(buildEmployeeOption);
      } catch (error) {
        console.error("Member search error:", error);
        const q = inputValue.toLowerCase();
        return defaultMemberOptions.filter((e) => e.label.toLowerCase().includes(q));
      }
    },
    [defaultMemberOptions],
  );

  useEffect(() => {
    if (!memberSearch.trim()) {
      setMemberResults(null);
      setMembersLoading(false);
      return undefined;
    }
    const seq = ++searchSeq.current;
    setMembersLoading(true);
    const timer = setTimeout(async () => {
      const results = await loadMemberOptions(memberSearch);
      if (seq === searchSeq.current) {
        setMemberResults(results);
        setMembersLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [memberSearch, loadMemberOptions]);

  const { control, handleSubmit, reset, getValues, setValue, watch, trigger } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  // ================= FORM EDIT DATA =================
  useEffect(() => {
    if (form_obj) {
      reset(toFormValues(form_obj));
      setMemberDetails([]);
      setMemberSearch("");
    }
  }, [form_obj, reset]);

  useEffect(() => {
    const sub = watch((values, { name, type }) => {
      if (name === "type" && type === "change" && values.type !== PROJECT_TYPE_CLIENT) {
        setValue("client", null);
      }
      if (name === "start_date" && values.deadline) {
        trigger("deadline");
      }
    });
    return () => sub.unsubscribe();
  }, [watch, setValue, trigger]);

  const [projectId, projectType] = useWatch({ control, name: ["id", "type"] });

  // ================= CLIENT PROJECT CHECK =================
  const isClientProject = Number(projectType) === PROJECT_TYPE_CLIENT;

  // ================= SUBMIT =================
  const onSubmit = async () => {
    const projectData = getValues();
    setIsSubmitting(true);

    try {
      const isEdit = projectData?.id && projectData.id !== 0;

      const payload = {
        title: projectData.title.trim(),

        type: Number(projectData.type),

        description: projectData.description || "",

        start_date: projectData.start_date,

        deadline: projectData.deadline,

        price: projectData.price,

        status: projectData.status,

        client: Number(projectData.type) === PROJECT_TYPE_CLIENT ? projectData.client : null,

        members_id_list: (projectData.members_id_list || []).map(Number),
      };
      console.log("Project Status Before Save:", projectData.status);
      console.log("Payload:", payload);

      if (isEdit) {
        payload.id = projectData.id;
      }

      const callApi = async (body) => {
        try {
          return isEdit
            ? await PutApi("projects/", body, false)
            : await PostApi("projects/", body, false);
        } catch (err) {
          return err?.response || { status: err?.status, data: err?.data };
        }
      };

      let ApiRes = await callApi(payload);

      if (ApiRes?.status === 409 && ApiRes?.data?.requires_confirmation) {
        setIsSubmitting(false);

        const result = await Swal.fire({
          title: "Pending Tasks",
          text:
            ApiRes?.data?.message ||
            "This project has pending tasks. Do you want to deactivate it anyway?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Yes, Deactivate",
          cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) {
          setValue("status", true);
          return;
        }

        setIsSubmitting(true);
        ApiRes = await callApi({ ...payload, confirm: true });
      }
      if (ApiRes?.status === 200 || ApiRes?.status === 201) {
        const responseData = ApiRes?.data?.data;
        console.log("API Response:", responseData);
        console.log("Response Status:", responseData?.status);

        // ================= OLD DATA =================
        const oldProjects = (await GetLocalStorageData("projects")) || [];

        let updatedProjects = [];

        // ================= EDIT =================
        if (isEdit) {
          console.log("Edit Resonse - ", responseData);
          console.log("Old Project - ", oldProjects);
          updatedProjects = oldProjects.map((item) =>
            Number(item.id) === Number(responseData.id) ? responseData : item,
          );

          await SetLocalStorage("projects", updatedProjects, 1);
        }

        // ================= ADD =================
        else {
          const alreadyExists = oldProjects.some(
            (item) => Number(item.id) === Number(responseData.id),
          );

          updatedProjects = alreadyExists ? oldProjects : [...oldProjects, responseData];
          await SetLocalStorage("projects", updatedProjects, 1);
        }

        console.log("Updated Projects after Edit:", updatedProjects);

        // ================= UPDATE REDUX =================
        dispatch(setProjects(updatedProjects));

        toast.success(ApiRes?.data?.message || "Project Saved Successfully");

        dispatch(toggleRSBView(false));
      } else {
        toast.error(ApiRes?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);

      toast.error("API Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarFormLayout
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel="Save"
    >
      <FormSection title="Project">
        <FormTextField
          name="title"
          control={control}
          label="Project Title"
          placeholder="Project Title"
          required
          autoFocus
          maxLength={TITLE_MAX}
          sanitize={(v) => v.replace(TITLE_CHARS, "")}
          startIcon={<WorkOutlineOutlinedIcon fontSize="small" color="action" />}
        />

        <FormToggleGroup
          name="type"
          control={control}
          label="Project Type"
          required
          options={projectTypeOptions}
          getOptionValue={(o) => o.value}
        />

        {isClientProject && (
          <FormAutocomplete
            name="client"
            control={control}
            label="Client"
            placeholder="Select Client"
            required
            options={clientOptions}
            getOptionValue={(o) => Number(o.value)}
            getOptionLabel={(o) => (o?.city ? `${o.label} (${o.city})` : o?.label ?? "")}
          />
        )}

        <Controller
          name="members_id_list"
          control={control}
          render={({ field, fieldState: { error } }) => {
            const ids = (field.value || []).map(Number);
            const known = [...memberDetails, ...defaultMemberOptions];
            const selected = ids
              .map((id) => known.find((e) => Number(e.id) === id))
              .filter(Boolean)
              .map(buildEmployeeOption);
            const options = memberResults ?? defaultMemberOptions;

            return (
              <Autocomplete
                multiple
                disableCloseOnSelect
                limitTags={3}
                options={options}
                value={selected}
                loading={membersLoading}
                filterOptions={(opts) => opts}
                getOptionLabel={(o) => o?.label ?? ""}
                isOptionEqualToValue={(o, v) => Number(o.id) === Number(v.id)}
                noOptionsText={memberSearch ? "No employees found" : "Type to search"}
                loadingText="Searching..."
                inputValue={memberSearch}
                onInputChange={(_, next) => setMemberSearch(next)}
                onChange={(_, next) => {
                  field.onChange(next.map((o) => Number(o.id)));
                  setMemberDetails(next.map((o) => ({ ...o })));
                }}
                onBlur={field.onBlur}
                renderOption={(props, option, { selected: isSelected }) => {
                  const { key, ...rest } = props;
                  return (
                    <li key={key} {...rest}>
                      <Checkbox
                        size="small"
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        checked={isSelected}
                        sx={{ mr: 1, p: 0.5 }}
                      />
                      <EmployeeAvatar option={option} sx={{ mr: 1.25 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {option.label}
                        </Typography>
                        {(option.employee_id || option.email) && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {[option.employee_id, option.email].filter(Boolean).join(" · ")}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  );
                }}
                renderValue={(value, getItemProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getItemProps({ index });
                    return (
                      <Chip
                        key={key}
                        {...tagProps}
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
                    label="Project Members"
                    required
                    placeholder={selected.length ? undefined : "Search members..."}
                    error={!!error}
                    helperText={error?.message || "Select or search project members."}
                  />
                )}
              />
            );
          }}
        />

        <FormTextField
          name="description"
          control={control}
          label="Description"
          placeholder="Project Description"
          helperText="Description (Optional)."
          multiline
          minRows={3}
          maxRows={8}
          maxLength={DESCRIPTION_MAX}
          sanitize={(v) => v.replace(/^\s+/, "").replace(DESCRIPTION_CHARS, "")}
        />
      </FormSection>

      <FormSection title="Timeline & budget">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormDatePicker
              name="start_date"
              control={control}
              label="Start Date"
              minDate={MIN_PROJECT_DATE}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormDatePicker
              name="deadline"
              control={control}
              label="Deadline"
              minDate={MIN_PROJECT_DATE}
            />
          </Grid>
        </Grid>

        <FormTextField
          name="price"
          control={control}
          label="Price"
          type="number"
          placeholder="0.00"
          onKeyDown={(e) => {
            if (e.key === "-" || e.key === "e" || e.key === "E") {
              e.preventDefault();
            }
          }}
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </FormSection>

      {/* STATUS - SHOW ONLY IN EDIT MODE */}
      {projectId > 0 && (
        <FormSwitch
          name="status"
          control={control}
          label="Status"
          description="Turn off to deactivate this project"
        />
      )}
    </SidebarFormLayout>
  );
};

export default ProjectForm;
