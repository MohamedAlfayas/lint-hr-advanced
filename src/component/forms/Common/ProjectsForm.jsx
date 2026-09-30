import React, { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { Col, Form, Input, Label, Row, Button } from "reactstrap";

import { useDispatch, useSelector } from "react-redux";

import { setProjects } from "../../../redux/reducers/ChildReducer/ProjectsReducer";

import { toast } from "react-toastify";

import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";

import { useFormik } from "formik";

import * as Yup from "yup";

import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";

import { PostApi } from "../../../common/api/PostApi";

import { loadAnimation } from "lottie-web";

import { defineElement } from "lord-icon-element";

import { PutApi } from "../../../common/api/PutApi";

import Select from "react-select";
import AsyncSelect from "react-select/async";

import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import { Api } from "../../../common/api/Api";

defineElement(loadAnimation);

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

// ================= CLIENT OPTION =================
const ClientOptionDisplay = ({ innerRef, innerProps, data, isSelected }) => (
  <div
    ref={innerRef}
    {...innerProps}
    className={`lc-select__option px-3 py-2 d-flex align-items-center gap-2 ${
      isSelected ? "bg-primary text-white" : ""
    }`}
    style={{ cursor: "pointer" }}
  >
    <span className="fw-semibold">{data.label}</span>

    {data.city && <span className="text-muted small">({data.city})</span>}
  </div>
);

const ProjectForm = () => {
  const dispatch = useDispatch();
  const minProjectDate = dayjs("1900-01-01");

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  // ================= CLIENT LOCAL STORAGE =================
  const ClientLocalData = GetLocalStorageData("clients") || [];

  const [clientData] = useState(ClientLocalData);

  // ================= PROJECT STATE =================
  const [projectData, setProjectData] = useState({
    id: 0,
    title: "",
    type: PROJECT_TYPE_INTERNAL,
    client: null,
    description: "",
    start_date: null,
    deadline: null,
    price: "",
    status: true,
    members_id_list: [],
  });

  // Holds full employee objects for members picked via search, since they
  // may not exist in the localStorage "employee" list.
  const [memberDetails, setMemberDetails] = useState([]);

  // Errors are only shown after the user clicks Save.
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // ================= MEMBER OPTIONS =================
  const buildDefaultMemberOptions = useCallback(() => {
    const list = GetLocalStorageData("employee") || [];
    return list.map(buildEmployeeOption);
  }, []);

  const loadMemberOptions = useCallback(
    async (inputValue) => {
      if (!inputValue || inputValue.trim().length === 0) {
        return buildDefaultMemberOptions();
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
        return buildDefaultMemberOptions().filter((e) =>
          e.label.toLowerCase().includes(q),
        );
      }
    },
    [buildDefaultMemberOptions],
  );

  // ================= CLIENT OPTIONS =================
  const clientOptions = clientData.map((client) => ({
    ...client,
    value: client.id,
    label: client.name,
  }));

  // ================= FORM EDIT DATA =================
  useEffect(() => {
    if (form_obj) {
      setProjectData({
        ...form_obj,
        members_id_list: (form_obj.members_id_list || []).map(Number),
      });
      setMemberDetails([]);
      setHasAttemptedSubmit(false);
    }
  }, [form_obj]);

  // ================= INPUT CHANGE =================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      const filteredValue = value.replace(/[^A-Za-z0-9\s.,!?'"\-_()&:;/]/g, "");

      setProjectData((prev) => ({
        ...prev,
        [name]: filteredValue,
      }));

      return;
    }

    if (name === "description") {
      const filteredValue = value
        .replace(/^\s+/, "")
        .replace(/[^A-Za-z0-9\s.,\-#\/'&():;?!]/g, "");

      setProjectData((prev) => ({
        ...prev,
        description: filteredValue,
      }));

      return;
    }

    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= CLIENT PROJECT CHECK =================
  const isClientProject = Number(projectData.type) === PROJECT_TYPE_CLIENT;

  // ================= SELECT VALUES =================
  const clientSelectValue =
    clientOptions.find(
      (client) => Number(client.value) === Number(projectData.client),
    ) || null;

  const typeSelectValue =
    projectTypeOptions.find(
      (o) => Number(o.value) === Number(projectData.type),
    ) || null;

  const membersValue = (() => {
    const ids = (projectData.members_id_list || []).map(Number);
    if (!ids.length) return [];

    const known = [...memberDetails, ...buildDefaultMemberOptions()];
    return ids
      .map((id) => known.find((e) => Number(e.id) === id))
      .filter(Boolean)
      .map(buildEmployeeOption);
  })();

  // ================= SELECT STYLE =================
  const selectStyles = (touched, error) => ({
    control: (provided, state) => ({
      ...provided,

      borderColor:
        !state.isFocused && touched && error ? "red" : provided.borderColor,

      boxShadow: "none",

      "&:hover": {
        borderColor:
          !state.isFocused && touched && error ? "red" : provided.borderColor,
      },
    }),

    // Overriding `control` changes react-select's generated class names, so the
    // themes.scss multi-value (chip) colors no longer apply and are set here.
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "var(--vz-primary)",
    }),

    multiValueLabel: (provided) => ({
      ...provided,
      color: "var(--vz-white)",
    }),

    multiValueRemove: (provided) => ({
      ...provided,
      color: "var(--vz-white)",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.15)",
        color: "var(--vz-white)",
      },
    }),
  });

  // ================= FORMIK =================
  const FormikForm = useFormik({
    enableReinitialize: true,

    initialValues: projectData,

    validationSchema: Yup.object({
      title: Yup.string()
        .trim()
        .matches(
          /^[A-Za-z0-9\s.,!?'"\-_()&:;/]+$/,
          "Please Enter the project title",
        )
        .max(TITLE_MAX, TITLE_MAX_MSG)
        .required("Please Enter the project title")
        .test(
          "not-only-spaces",
          "Please Enter the project title",
          (value) => !value || value.trim().length > 0,
        ),

      type: Yup.number().required("Please Select Project Type"),

      client: Yup.number()
        .nullable()
        .when("type", {
          is: PROJECT_TYPE_CLIENT,
          then: (schema) => schema.required("Please Select Client"),
          otherwise: (schema) => schema.nullable(),
        }),

      members_id_list: Yup.array().min(1, "Please Select Project Members"),

      // Optional Fields
      start_date: Yup.string()
      .nullable()
      .test(
        "start-date-range",
        "Start date cannot be before 01-01-1900",
        (value) => {
          if (!value) return true;

          return (
            dayjs(value).isSame(minProjectDate, "day") ||
            dayjs(value).isAfter(minProjectDate, "day")
          );
        }
      ),
      deadline: Yup.string()
        .nullable()
        .test(
          "deadline-range",
          "Deadline cannot be before 01-01-1900",
          (value) => {
            if (!value) return true;

            return (
              dayjs(value).isSame(minProjectDate, "day") ||
              dayjs(value).isAfter(minProjectDate, "day")
            );
          }
        )
        .test(
          "deadline-check",
          "Deadline cannot be before Start Date",
          function (deadline) {
            const { start_date } = this.parent;

            if (!start_date || !deadline) return true;

            return (
              dayjs(deadline).isSame(dayjs(start_date), "day") ||
              dayjs(deadline).isAfter(dayjs(start_date), "day")
            );
          }
        ),
      price: Yup.number()
        .min(0, "Price cannot be negative")
        .max(PRICE_MAX, PRICE_MAX_MSG)
        .nullable(),

      description: Yup.string()
        .matches(
          /^[A-Za-z0-9\s.,\-#\/'&():;?!]*$/,
          "Description contains invalid characters",
        )
        .max(DESCRIPTION_MAX, DESCRIPTION_MAX_MSG)
        .nullable(),
    }),

    // ================= SUBMIT =================
    onSubmit: async () => {
      dispatch(setLoaderVisible(true));

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

          client: isClientProject ? projectData.client : null,

          members_id_list: (projectData.members_id_list || []).map(Number),
        };
        console.log("Project Status Before Save:", projectData.status);
        console.log("Payload:", payload);

        if (isEdit) {
          payload.id = projectData.id;
        }

        const Api = isEdit
          ? await PutApi("projects/", payload, false)
          : await PostApi("projects/", payload, false);

        if (Api?.status === 200 || Api?.status === 201) {
          const responseData = Api?.data?.data;
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

            updatedProjects = alreadyExists
              ? oldProjects
              : [...oldProjects, responseData];
            await SetLocalStorage("projects", updatedProjects, 1);
          }

          console.log("Updated Projects after Edit:", updatedProjects);

          // ================= UPDATE REDUX =================
          dispatch(setProjects(updatedProjects));

          toast.success(Api?.data?.message || "Project Saved Successfully");

          dispatch(toggleRSBView(false));
        } else {
          toast.error(Api?.data?.message || "Something went wrong");
        }
      } catch (error) {
        console.log(error);

        toast.error("API Error");
      }

      dispatch(setLoaderVisible(false));
    },
  });

  // enableReinitialize resets Formik errors on every edit, so re-run
  // validation after the first Save to keep errors in sync while fixing fields.
  useEffect(() => {
    if (hasAttemptedSubmit) {
      FormikForm.validateForm(projectData);
    }
  }, [projectData, hasAttemptedSubmit]);

  // Max-limit errors show instantly; all other errors wait for Save.
  const limitErrors = {
    title:
      (projectData.title || "").trim().length > TITLE_MAX
        ? TITLE_MAX_MSG
        : undefined,
    description:
      (projectData.description || "").length > DESCRIPTION_MAX
        ? DESCRIPTION_MAX_MSG
        : undefined,
    price:
      projectData.price !== "" &&
      projectData.price !== null &&
      Number(projectData.price) > PRICE_MAX
        ? PRICE_MAX_MSG
        : undefined,
  };

  const fieldError = (field) =>
    limitErrors[field] ||
    (hasAttemptedSubmit ? FormikForm.errors[field] : undefined);

  // lc_form_error_text already carries a 1rem bottom margin, so the field
  // wrapper drops its own mb-3 while an error is shown.
  const fieldWrapperClass = (field) => (fieldError(field) ? "" : "mb-3");

  return (
    <React.Fragment>
      <Row>
        <Col xl={12}>
          <Form
            onSubmit={(e) => {
              setHasAttemptedSubmit(true);
              FormikForm.handleSubmit(e);
            }}
          >
            <Row>
              {/* PROJECT TITLE */}
              <Col md={12}>
                <div className={fieldWrapperClass("title")}>
                  <Label className="form-label">Project Title *</Label>

                  <Input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="Project Title"
                    value={projectData.title || ""}
                    onChange={handleInputChange}
                    invalid={!!fieldError("title")}
                  />

                  {fieldError("title") && (
                    <div className="lc_form_error_text">
                      {fieldError("title")}
                    </div>
                  )}
                </div>
              </Col>

              {/* PROJECT TYPE */}
              <Col md={12}>
                <div className={fieldWrapperClass("type")}>
                  <Label className="form-label">Project Type *</Label>

                  <Select
                    options={projectTypeOptions}
                    value={typeSelectValue}
                    classNamePrefix="lc-select"
                    styles={selectStyles(
                      hasAttemptedSubmit,
                      fieldError("type"),
                    )}
                    onChange={(selectedOption) => {
                      setProjectData((prev) => ({
                        ...prev,

                        type: selectedOption?.value || PROJECT_TYPE_INTERNAL,

                        client:
                          selectedOption?.value !== PROJECT_TYPE_CLIENT
                            ? null
                            : prev.client,
                      }));
                    }}
                  />

                  {fieldError("type") && (
                    <div className="lc_form_error_text">
                      {fieldError("type")}
                    </div>
                  )}
                </div>
              </Col>

              {/* CLIENT */}
              {isClientProject && (
                <Col md={12}>
                  <div className={fieldWrapperClass("client")}>
                    <Label className="form-label">Client *</Label>

                    <Select
                      isClearable
                      options={clientOptions}
                      components={{
                        Option: ClientOptionDisplay,
                      }}
                      value={clientSelectValue}
                      classNamePrefix="lc-select"
                      placeholder="Select Client"
                      styles={selectStyles(
                        hasAttemptedSubmit,
                        fieldError("client"),
                      )}
                      onChange={(selectedOption) => {
                        setProjectData((prev) => ({
                          ...prev,

                          client: selectedOption ? selectedOption.id : null,
                        }));
                      }}
                    />

                    {fieldError("client") && (
                      <div className="lc_form_error_text">
                        {fieldError("client")}
                      </div>
                    )}
                  </div>
                </Col>
              )}

               {/* PROJECT MEMBERS */}
              <Col md={12}>
                <div className={fieldWrapperClass("members_id_list")}>
                  <Label htmlFor="members_id_list" className="form-label">
                    Project Members *
                  </Label>
                  <AsyncSelect
                    id="members_id_list"
                    name="members_id_list"
                    isMulti
                    isClearable
                    cacheOptions
                    defaultOptions={buildDefaultMemberOptions()}
                    loadOptions={loadMemberOptions}
                    components={{ Option: EmployeeDisplayInSelect }}
                    className="basic-multi-select"
                    classNamePrefix="lc-select"
                    placeholder="Search members..."
                    noOptionsMessage={({ inputValue }) =>
                      inputValue ? "No employees found" : "Type to search"
                    }
                    loadingMessage={() => "Searching..."}
                    value={membersValue}
                    styles={selectStyles(
                      hasAttemptedSubmit,
                      fieldError("members_id_list"),
                    )}
                    onChange={(selected) => {
                      setProjectData((prev) => ({
                        ...prev,
                        members_id_list: selected
                          ? selected.map((o) => Number(o.id))
                          : [],
                      }));
                      setMemberDetails(
                        selected ? selected.map((o) => ({ ...o })) : [],
                      );
                    }}
                  />
                  {fieldError("members_id_list") ? (
                    <div className="lc_form_error_text">
                      {fieldError("members_id_list")}
                    </div>
                  ) : (
                    <div className="form-text">
                      Select or search project members.
                    </div>
                  )}
                </div>
              </Col>

              {/* DESCRIPTION */}
              <Col md={12}>
                <div className={fieldWrapperClass("description")}>
                  <Label className="form-label">Description</Label>

                  <Input
                    type="textarea"
                    rows={3}
                    name="description"
                    className="form-control"
                    placeholder="Project Description"
                    value={projectData.description || ""}
                    onChange={handleInputChange}
                    invalid={!!fieldError("description")}
                  />
                  {fieldError("description") ? (
                    <div className="lc_form_error_text">
                      {fieldError("description")}
                    </div>
                  ) : (
                    <div className="form-text">
                      Description (Optional).{" "}
                      {(projectData.description || "").length}/1500
                    </div>
                  )}
                </div>
              </Col>

              {/* START DATE */}
              <Col md={6}>
                <div className={fieldWrapperClass("start_date")}>
                  <Label className="form-label">Start Date</Label>

                  <Input
                    type="date"
                    name="start_date"
                    min="1900-01-01"
                    className="form-control"
                    value={projectData.start_date || ""}
                    onChange={handleInputChange}
                    invalid={!!fieldError("start_date")}
                  />

                  {fieldError("start_date") && (
                    <div className="lc_form_error_text">
                      {fieldError("start_date")}
                    </div>
                  )}
                </div>
              </Col>

              {/* DEADLINE */}
              <Col md={6}>
                <div className={fieldWrapperClass("deadline")}>
                  <Label className="form-label">Deadline</Label>

                  <Input
                    type="date"
                    name="deadline"
                    min="1900-01-01"
                    className="form-control"
                    value={projectData.deadline || ""}
                    onChange={handleInputChange}
                    invalid={!!fieldError("deadline")}
                  />

                  {fieldError("deadline") && (
                    <div className="lc_form_error_text">
                      {fieldError("deadline")}
                    </div>
                  )}
                </div>
              </Col>

              {/* PRICE */}
              <Col md={12}>
                <div className={fieldWrapperClass("price")}>
                  <Label className="form-label">Price</Label>

                  <Input
                    type="number"
                    name="price"
                    className="form-control"
                    placeholder="0.00"
                    min={0}
                    // max={100000000000}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") {
                        e.preventDefault();
                      }
                    }}
                    value={projectData.price || ""}
                    onChange={handleInputChange}
                    invalid={!!fieldError("price")}
                  />

                  {fieldError("price") && (
                    <div className="lc_form_error_text">
                      {fieldError("price")}
                    </div>
                  )}
                </div>
              </Col>

              {/* STATUS - SHOW ONLY IN EDIT MODE */}
              {projectData.id > 0 && (
                <Col md={12}>
                  <div>
                    <Label htmlFor="project_status" className="form-label">
                      Status
                    </Label>

                    <div className="mb-2">
                      <div
                        className="form-check form-switch form-switch-md form-switch-success"
                        dir="ltr"
                      >
                        <Input
                          type="checkbox"
                          className="form-check-input form-switch-md"
                          id="project_status"
                          checked={projectData.status || false}
                          onChange={(e) =>
                            setProjectData((prev) => ({
                              ...prev,
                              status: e.target.checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              )}

              {/* SUBMIT */}
              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label" type="submit">
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                    Save
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ProjectForm;
