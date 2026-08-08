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
const CUSTOM_FORM_STORAGE_KEY = "custom_form_list";

const validationSchema = Yup.object({
  custom_form: Yup.object().nullable().required("Please select a custom form"),
  custom_status: Yup.object()
    .nullable()
    .required("Please select a custom status"),
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
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const formik = useFormik({
    initialValues: {
      custom_form: null,
      custom_status: null,
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
          toast.error(
            response?.data?.error_message ||
              response?.data?.detail ||
              "Something went wrong!",
          );
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

  // ================= LOAD EMPLOYEE OPTIONS + PRESELECT (EDIT MODE, NO API CALL) =================
  useEffect(() => {
    const employees = GetLocalStorageData("employee") || [];

    const options = employees.map((emp) => ({
      value: emp.id,
      label:
        emp.first_name || emp.employee_name || emp.full_name || `#${emp.id}`,
      ...emp,
    }));

    setEmployeeOptions(options);

    if (form_obj?.employee_id_list?.length) {
      const idSet = new Set(form_obj.employee_id_list.map((id) => Number(id)));
      const preselected = options.filter((opt) => idSet.has(Number(opt.value)));
      formik.setFieldValue("employee_id_list", preselected);
    }
  }, []);

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

              {/* EMPLOYEES */}
              <Col md={12}>
                <div className="mb-3">
                  <Label className="form-label">Employees *</Label>

                  <Select
                    isMulti
                    name="employee_id_list"
                    options={employeeOptions}
                    components={{ Option: EmployeeDisplayInSelect }}
                    value={formik.values.employee_id_list}
                    onChange={(selected) =>
                      formik.setFieldValue("employee_id_list", selected || [])
                    }
                    onBlur={() =>
                      formik.setFieldTouched("employee_id_list", true)
                    }
                    classNamePrefix="select"
                    placeholder="Select Employees"
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
