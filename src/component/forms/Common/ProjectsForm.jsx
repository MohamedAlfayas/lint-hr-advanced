import React, { useEffect, useState } from "react";
import { Col, Form, Input, Label, Row, Button, FormFeedback } from "reactstrap";

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

import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";

defineElement(loadAnimation);

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
  });

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
      });
    }
  }, [form_obj]);

  // ================= INPUT CHANGE =================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

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
  });

  // ================= FORMIK =================
  const FormikForm = useFormik({
    enableReinitialize: true,

    initialValues: projectData,

    validationSchema: Yup.object({
      title: Yup.string().required("Please Enter Project Title"),

      type: Yup.number().required("Please Select Project Type"),

      client: Yup.number()
        .nullable()
        .when("type", {
          is: PROJECT_TYPE_CLIENT,
          then: (schema) => schema.required("Please Select Client"),
          otherwise: (schema) => schema.nullable(),
        }),

      // Optional Fields
      start_date: Yup.string().nullable(),
      deadline: Yup.string().nullable(),
      price: Yup.string().nullable(),
    }),

    // ================= SUBMIT =================
    onSubmit: async () => {
      dispatch(setLoaderVisible(true));

      try {
        const isEdit = projectData?.id && projectData.id !== 0;

        const payload = {
          title: projectData.title,

          type: Number(projectData.type),

          description: projectData.description || "",

          start_date: projectData.start_date,

          deadline: projectData.deadline,

          price: projectData.price,

          status: projectData.status,

          client: isClientProject ? projectData.client : null,
        };

        if (isEdit) {
          payload.id = projectData.id;
        }

        const Api = isEdit
          ? await PutApi("projects/", payload, false)
          : await PostApi("projects/", payload, false);

        if (Api?.status === 200 || Api?.status === 201) {
          const responseData = Api?.data?.data;

          // ================= OLD DATA =================
          const oldProjects = GetLocalStorageData("projects") || [];

          let updatedProjects = [];

          // ================= EDIT =================
          if (isEdit) {
            updatedProjects = oldProjects.map((item) =>
              Number(item.id) === Number(responseData.id) ? responseData : item,
            );
            SetLocalStorage("projects", updatedProjects, 1);
          }

          // ================= ADD =================
          else {
            const alreadyExists = oldProjects.some(
              (item) => Number(item.id) === Number(responseData.id),
            );

            updatedProjects = alreadyExists
              ? oldProjects
              : [...oldProjects, responseData];
            SetLocalStorage("projects", updatedProjects, 1);
          }

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

  return (
    <React.Fragment>
      <Row>
        <Col xl={12}>
          <Form onSubmit={FormikForm.handleSubmit}>
            <Row>
              {/* PROJECT TITLE */}
              <Col md={12}>
                <div className="mb-3">
                  <Label className="form-label">Project Title *</Label>

                  <Input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="Project Title"
                    value={projectData.title || ""}
                    onChange={handleInputChange}
                    invalid={
                      FormikForm.touched.title && FormikForm.errors.title
                        ? true
                        : false
                    }
                  />

                  {FormikForm.touched.title && FormikForm.errors.title && (
                    <FormFeedback>{FormikForm.errors.title}</FormFeedback>
                  )}
                </div>
              </Col>

              {/* PROJECT TYPE */}
              <Col md={12}>
                <div className="mb-3">
                  <Label className="form-label">Project Type *</Label>

                  <Select
                    options={projectTypeOptions}
                    value={typeSelectValue}
                    classNamePrefix="lc-select"
                    styles={selectStyles(
                      FormikForm.touched.type,
                      FormikForm.errors.type,
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
                </div>
              </Col>

              {/* CLIENT */}
              {isClientProject && (
                <Col md={12}>
                  <div className="mb-3">
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
                        FormikForm.touched.client,
                        FormikForm.errors.client,
                      )}
                      onChange={(selectedOption) => {
                        setProjectData((prev) => ({
                          ...prev,

                          client: selectedOption ? selectedOption.id : null,
                        }));
                      }}
                    />

                    {FormikForm.touched.client && FormikForm.errors.client && (
                      <div className="text-danger small mt-1">
                        {FormikForm.errors.client}
                      </div>
                    )}
                  </div>
                </Col>
              )}

              {/* DESCRIPTION */}
              <Col md={12}>
                <div className="mb-3">
                  <Label className="form-label">Description</Label>

                  <Input
                    type="textarea"
                    rows={3}
                    name="description"
                    className="form-control"
                    placeholder="Project Description"
                    value={projectData.description || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>

              {/* START DATE */}
              <Col md={6}>
                <div className="mb-3">
                  <Label className="form-label">Start Date</Label>

                  <Input
                    type="date"
                    name="start_date"
                    className="form-control"
                    value={projectData.start_date || ""}
                    onChange={handleInputChange}
                    invalid={
                      FormikForm.touched.start_date &&
                      FormikForm.errors.start_date
                        ? true
                        : false
                    }
                  />

                  {FormikForm.touched.start_date &&
                    FormikForm.errors.start_date && (
                      <FormFeedback>
                        {FormikForm.errors.start_date}
                      </FormFeedback>
                    )}
                </div>
              </Col>

              {/* DEADLINE */}
              <Col md={6}>
                <div className="mb-3">
                  <Label className="form-label">Deadline</Label>

                  <Input
                    type="date"
                    name="deadline"
                    className="form-control"
                    value={projectData.deadline || ""}
                    onChange={handleInputChange}
                    invalid={
                      FormikForm.touched.deadline && FormikForm.errors.deadline
                        ? true
                        : false
                    }
                  />

                  {FormikForm.touched.deadline &&
                    FormikForm.errors.deadline && (
                      <FormFeedback>{FormikForm.errors.deadline}</FormFeedback>
                    )}
                </div>
              </Col>

              {/* PRICE */}
              <Col md={12}>
                <div className="mb-3">
                  <Label className="form-label">Price</Label>

                  <Input
                    type="number"
                    name="price"
                    className="form-control"
                    placeholder="0.00"
                    value={projectData.price || ""}
                    onChange={handleInputChange}
                    invalid={
                      FormikForm.touched.price && FormikForm.errors.price
                        ? true
                        : false
                    }
                  />

                  {FormikForm.touched.price && FormikForm.errors.price && (
                    <FormFeedback>{FormikForm.errors.price}</FormFeedback>
                  )}
                </div>
              </Col>

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
