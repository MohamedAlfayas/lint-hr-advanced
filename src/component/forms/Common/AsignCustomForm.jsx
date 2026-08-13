// AsignCustomForm.jsx
import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Col, Form, Label, Row, Button, FormFeedback } from "reactstrap";

import Select from "react-select";
import { useFormik } from "formik";
import * as Yup from "yup";

import { toast } from "react-toastify";

import {
  addMapping,
  editMapping,
} from "../../../redux/reducers/ChildReducer/AssignCustomFormReducer";

import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";

import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";

import { PostApi } from "../../../common/api/PostApi";

import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import { EmployeeDisplayInSelect } from "../../../common/js/EmployeeDisplayInSelect";
import { PutApi } from "../../../common/api/PutApi";

const MAPPING_STORAGE_KEY = "custom_form_mapping";
const CUSTOM_FORM_STORAGE_KEY = "custom_form";

const validationSchema = Yup.object({
  custom_form: Yup.object().nullable().required("Please select a custom form"),
  custom_status: Yup.object()
    .nullable()
    .required("Please select a custom status"),
  department: Yup.object().nullable().required("Please select a department"),
  employee_id_list: Yup.array()
    .min(1, "Please select at least one employee")
    .required("Please select at least one employee"),
});

const AsignCustomForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const isEdit = Boolean(form_obj?.id);

  // ================= STATE =================
  const [customFormOptions, setCustomFormOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const formik = useFormik({
    initialValues: {
      custom_form: null,
      custom_status: null,
      department: null,
      employee_id_list: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        ...(isEdit && { id: form_obj.id }),
        custom_form: values.custom_form.value,
        custom_status: values.custom_status.value,
        employee_id_list: values.employee_id_list.map((opt) => opt.value),
      };

      dispatch(setLoaderVisible(true));

      try {
        const response = isEdit
          ? await PutApi("custom/employee-custom-form-mapping/", payload, false)
          : await PostApi(
              "custom/employee-custom-form-mapping/",
              payload,
              false,
            );

        if (response?.status === 200 || response?.status === 201) {
          const responseData = response?.data?.data || response?.data;

          dispatch(
            isEdit ? editMapping(responseData) : addMapping(responseData),
          );

          toast.success(
            response?.data?.message || "Custom Form mapped successfully.",
          );
          dispatch(toggleRSBView(false));
        } else {
          const errorData = response?.data || {};

          // field-level errors come back as { field_name: ["msg1", "msg2"] }
          const fieldErrors = Object.keys(errorData).filter((key) =>
            Array.isArray(errorData[key]),
          );

          if (fieldErrors.length) {
            const formikErrors = {};
            fieldErrors.forEach((field) => {
              formikErrors[field] = errorData[field].join(" ");
              formik.setFieldTouched(field, true, false);
            });
            formik.setErrors(formikErrors);

            // show the first message as a toast too
            toast.error(errorData[fieldErrors[0]][0]);
          } else {
            toast.error(
              errorData?.error_message ||
                errorData?.detail ||
                "Something went wrong!",
            );
          }
        }
      } catch (error) {
        console.log("ERROR =", error);
        toast.error("API Error");
      }

      dispatch(setLoaderVisible(false));
    },
  });

  // ================= LOAD CUSTOM FORM OPTIONS FROM LOCAL STORAGE =================
  useEffect(() => {
    const forms = GetLocalStorageData(CUSTOM_FORM_STORAGE_KEY) || [];

    const options = forms.map((f) => ({
      value: f.id,
      label: f.name,
    }));

    setCustomFormOptions(options);

    if (form_obj?.custom_form) {
      const match = options.find(
        (opt) => Number(opt.value) === Number(form_obj.custom_form),
      );
      formik.setFieldValue("custom_form", match || null);
    }
  }, []);

  // ================= LOAD CUSTOM STATUS OPTIONS =================
  useEffect(() => {
    const statuses = GetLocalStorageData("custom_statuses") || [];

    const options = statuses.map((st) => ({
      value: st.id,
      label: st.name,
    }));

    setStatusOptions(options);

    if (form_obj?.custom_status) {
      const match = options.find(
        (opt) => Number(opt.value) === Number(form_obj.custom_status),
      );
      formik.setFieldValue("custom_status", match || null);
    }
  }, []);

  // ================= LOAD DEPARTMENT OPTIONS =================
  useEffect(() => {
    const dep_options = GetLocalStorageData("department") || [];

    const options = dep_options.map((dep) => ({
      value: dep.id,
      label: dep.name || dep.department_name,
    }));

    setDepartmentOptions(options);
  }, []);

  // ================= LOAD ALL EMPLOYEES (RAW, NOT YET FILTERED) =================
  useEffect(() => {
    const employee_data = GetLocalStorageData("employee") || [];
    setAllEmployees(employee_data);
  }, []);

  // ================= FILTER EMPLOYEES WHENEVER DEPARTMENT CHANGES =================
  useEffect(() => {
    if (!formik.values.department) {
      setEmployeeOptions([]);
      formik.setFieldValue("employee_id_list", []);
      return;
    }

    const selectedDeptId = Number(formik.values.department.value);

    const filtered = allEmployees.filter((emp) =>
      (emp.primary_department_id_list || []).some(
        (depId) => Number(depId) === selectedDeptId,
      ),
    );

    const options = filtered.map((emp) => ({
      value: emp.id,
      label:
        emp.first_name || emp.employee_name || emp.full_name || `#${emp.id}`,
      ...emp,
    }));

    setEmployeeOptions(options);

    // keep only previously selected employees that still belong to this department
    const idSet = new Set(options.map((opt) => opt.value));
    const stillValid = formik.values.employee_id_list.filter((sel) =>
      idSet.has(sel.value),
    );
    if (stillValid.length !== formik.values.employee_id_list.length) {
      formik.setFieldValue("employee_id_list", stillValid);
    }
  }, [formik.values.department, allEmployees]);

  // ================= EDIT MODE PRESELECT: CUSTOM FORM / STATUS =================
  useEffect(() => {
    if (form_obj?.custom_form && customFormOptions.length) {
      const match = customFormOptions.find(
        (opt) => Number(opt.value) === Number(form_obj.custom_form),
      );
      formik.setFieldValue("custom_form", match || null);
    }
  }, [customFormOptions]);

  useEffect(() => {
    if (form_obj?.custom_status && statusOptions.length) {
      const match = statusOptions.find(
        (opt) => Number(opt.value) === Number(form_obj.custom_status),
      );
      formik.setFieldValue("custom_status", match || null);
    }
  }, [statusOptions]);

  // ================= EDIT MODE: DERIVE DEPARTMENT FROM SELECTED EMPLOYEES =================
  // form_obj has no "department" field of its own — it's inferred from the
  // primary_department_id_list of the first mapped employee.
  useEffect(() => {
    if (
      !isEdit ||
      !form_obj?.employee_id_list?.length ||
      !allEmployees.length ||
      !departmentOptions.length ||
      formik.values.department // already set, don't override
    ) {
      return;
    }

    const idSet = new Set(form_obj.employee_id_list.map((id) => Number(id)));
    const matchedEmployees = allEmployees.filter((emp) =>
      idSet.has(Number(emp.id)),
    );

    if (!matchedEmployees.length) return;

    const deptId = matchedEmployees[0]?.primary_department_id_list?.[0];
    if (deptId === undefined) return;

    const match = departmentOptions.find(
      (opt) => Number(opt.value) === Number(deptId),
    );

    if (match) {
      formik.setFieldValue("department", match);
    }
  }, [allEmployees, departmentOptions, form_obj]);

  // ================= EDIT MODE: PRESELECT EMPLOYEES ONCE OPTIONS ARE FILTERED =================
  useEffect(() => {
    if (!form_obj?.employee_id_list?.length || !employeeOptions.length) return;

    const idSet = new Set(form_obj.employee_id_list.map((id) => Number(id)));
    const preselected = employeeOptions.filter((opt) =>
      idSet.has(Number(opt.value)),
    );

    if (preselected.length) {
      formik.setFieldValue("employee_id_list", preselected);
    }
  }, [employeeOptions]);

  return (
    <React.Fragment>
      <Row>
        <Col xl={12}>
          <Form onSubmit={formik.handleSubmit}>
            <Row>
              {/* CUSTOM FORM */}
              <Col md={12}>
                <div className="mb-3">
                  <Label className="form-label">Custom Form *</Label>

                  <Select
                    name="custom_form"
                    options={customFormOptions}
                    value={formik.values.custom_form}
                    onChange={(selected) =>
                      formik.setFieldValue("custom_form", selected || null)
                    }
                    onBlur={() => formik.setFieldTouched("custom_form", true)}
                    classNamePrefix="select"
                    placeholder="Select Custom Form"
                    className={
                      formik.touched.custom_form && formik.errors.custom_form
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.custom_form && formik.errors.custom_form && (
                    <FormFeedback type="invalid" className="d-block">
                      {formik.errors.custom_form}
                    </FormFeedback>
                  )}
                </div>
              </Col>

              {/* CUSTOM STATUS */}
              <Col md={12}>
                <div className="mb-3">
                  <Label className="form-label">Custom Status *</Label>

                  <Select
                    name="custom_status"
                    options={statusOptions}
                    value={formik.values.custom_status}
                    onChange={(selected) =>
                      formik.setFieldValue("custom_status", selected || null)
                    }
                    onBlur={() => formik.setFieldTouched("custom_status", true)}
                    classNamePrefix="select"
                    placeholder="Select Custom Status"
                    className={
                      formik.touched.custom_status &&
                      formik.errors.custom_status
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.custom_status &&
                    formik.errors.custom_status && (
                      <FormFeedback type="invalid" className="d-block">
                        {formik.errors.custom_status}
                      </FormFeedback>
                    )}
                </div>
              </Col>

              {/* DEPARTMENT */}
              <Col md={12}>
                <div className="mb-3">
                  <Label className="form-label">Department *</Label>

                  <Select
                    name="department"
                    options={departmentOptions}
                    value={formik.values.department}
                    onChange={(selected) =>
                      formik.setFieldValue("department", selected || null)
                    }
                    onBlur={() => formik.setFieldTouched("department", true)}
                    classNamePrefix="select"
                    placeholder="Select Department"
                    className={
                      formik.touched.department && formik.errors.department
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.department && formik.errors.department && (
                    <FormFeedback type="invalid" className="d-block">
                      {formik.errors.department}
                    </FormFeedback>
                  )}
                </div>
              </Col>

              {/* EMPLOYEES */}
              <Col md={12}>
                <div className="mb-3">
                  <Label className="form-label">Employees *</Label>

                  <Select
                    isMulti
                    name="employee_id_list"
                    options={employeeOptions}
                    isDisabled={!formik.values.department}
                    components={{ Option: EmployeeDisplayInSelect }}
                    value={formik.values.employee_id_list}
                    onChange={(selected) =>
                      formik.setFieldValue("employee_id_list", selected || [])
                    }
                    onBlur={() =>
                      formik.setFieldTouched("employee_id_list", true)
                    }
                    classNamePrefix="select"
                    placeholder={
                      formik.values.department
                        ? "Select Employees"
                        : "Select a department first"
                    }
                    className={
                      formik.touched.employee_id_list &&
                      formik.errors.employee_id_list
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.employee_id_list &&
                    formik.errors.employee_id_list && (
                      <FormFeedback type="invalid" className="d-block">
                        {formik.errors.employee_id_list}
                      </FormFeedback>
                    )}
                </div>
              </Col>

              {/* SAVE */}
              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label" type="submit">
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                    {isEdit ? "Update" : "Save"}
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

export default AsignCustomForm;
