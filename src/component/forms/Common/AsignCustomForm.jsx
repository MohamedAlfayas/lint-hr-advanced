// AsignCustomForm.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";

import {
  addMapping,
  editMapping,
} from "../../../redux/reducers/ChildReducer/AssignCustomFormReducer";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { PostApi } from "../../../common/api/PostApi";
import { PutApi } from "../../../common/api/PutApi";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import { FormAutocomplete, FormSection } from "../../../shared/ui/form";

const CUSTOM_FORM_STORAGE_KEY = "custom_form";

const schema = Yup.object({
  custom_form: Yup.mixed().nullable().required("Please select a custom form"),
  custom_status: Yup.mixed()
    .nullable()
    .required("Please select a custom status"),
  department: Yup.mixed().nullable().required("Please select a department"),
  employee_id_list: Yup.array()
    .min(1, "Please select at least one employee")
    .required("Please select at least one employee"),
});

const optionValue = (o) => o?.value;

const findOptionValue = (options, id) =>
  id
    ? options.find((opt) => Number(opt.value) === Number(id))?.value ?? null
    : null;

const employeesInDepartment = (employees, departmentId) => {
  if (departmentId === null || departmentId === undefined) return [];
  return employees
    .filter((emp) =>
      (emp.primary_department_id_list || []).some(
        (depId) => Number(depId) === Number(departmentId),
      ),
    )
    .map((emp) => ({
      value: emp.id,
      label:
        emp.first_name || emp.employee_name || emp.full_name || `#${emp.id}`,
      ...emp,
    }));
};

const AsignCustomForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const isEdit = Boolean(form_obj?.id);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const customFormOptions = useMemo(
    () =>
      (GetLocalStorageData(CUSTOM_FORM_STORAGE_KEY) || []).map((f) => ({
        value: f.id,
        label: f.name,
      })),
    [],
  );

  const statusOptions = useMemo(
    () =>
      (GetLocalStorageData("custom_statuses") || []).map((st) => ({
        value: st.id,
        label: st.name,
      })),
    [],
  );

  const departmentOptions = useMemo(
    () =>
      (GetLocalStorageData("department") || []).map((dep) => ({
        value: dep.id,
        label: dep.name || dep.department_name,
      })),
    [],
  );

  const allEmployees = useMemo(
    () => GetLocalStorageData("employee") || [],
    [],
  );

  // form_obj has no "department" field of its own — in edit mode it's inferred
  // from the primary_department_id_list of the first mapped employee.
  const toFormValues = useCallback(
    (obj) => {
      const mappedIds = new Set(
        (obj?.employee_id_list || []).map((id) => Number(id)),
      );

      let department = null;
      if (obj?.id && mappedIds.size) {
        const firstMatched = allEmployees.find((emp) =>
          mappedIds.has(Number(emp.id)),
        );
        const deptId = firstMatched?.primary_department_id_list?.[0];
        if (deptId !== undefined) {
          department = findOptionValue(departmentOptions, deptId);
        }
      }

      const employee_id_list = employeesInDepartment(allEmployees, department)
        .filter((opt) => mappedIds.has(Number(opt.value)))
        .map((opt) => opt.value);

      return {
        custom_form: findOptionValue(customFormOptions, obj?.custom_form),
        custom_status: findOptionValue(statusOptions, obj?.custom_status),
        department,
        employee_id_list,
      };
    },
    [allEmployees, customFormOptions, statusOptions, departmentOptions],
  );

  const { control, handleSubmit, reset, setValue, setError, watch } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset, toFormValues]);

  const department = useWatch({ control, name: "department" });

  const employeeOptions = useMemo(
    () => employeesInDepartment(allEmployees, department),
    [allEmployees, department],
  );

  // On department change keep only employees that still belong to it; in edit
  // mode the originally mapped employees of that department are re-selected.
  useEffect(() => {
    const sub = watch((values, { name, type }) => {
      if (name !== "department" || type !== "change") return;

      const options = employeesInDepartment(allEmployees, values.department);
      const optionIds = new Set(options.map((opt) => opt.value));
      const mappedIds = new Set(
        (form_obj?.employee_id_list || []).map((id) => Number(id)),
      );

      const preselected = options
        .filter((opt) => mappedIds.has(Number(opt.value)))
        .map((opt) => opt.value);
      const stillValid = (values.employee_id_list || []).filter((id) =>
        optionIds.has(id),
      );

      setValue(
        "employee_id_list",
        preselected.length ? preselected : stillValid,
        { shouldDirty: true },
      );
    });
    return () => sub.unsubscribe();
  }, [watch, setValue, allEmployees, form_obj]);

  const onSubmit = async (values) => {
    const payload = {
      ...(isEdit && { id: form_obj.id }),
      custom_form: values.custom_form,
      custom_status: values.custom_status,
      employee_id_list: values.employee_id_list,
    };

    setIsSubmitting(true);

    try {
      const response = isEdit
        ? await PutApi("custom/employee-custom-form-mapping/", payload, false)
        : await PostApi("custom/employee-custom-form-mapping/", payload, false);

      if (response?.status === 200 || response?.status === 201) {
        const responseData = response?.data?.data || response?.data;

        dispatch(isEdit ? editMapping(responseData) : addMapping(responseData));

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
          fieldErrors.forEach((field) => {
            setError(field, {
              type: "server",
              message: errorData[field].join(" "),
            });
          });

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

    setIsSubmitting(false);
  };

  return (
    <SidebarFormLayout
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update" : "Save"}
    >
      <FormSection title="Form">
        <FormAutocomplete
          name="custom_form"
          control={control}
          label="Custom form"
          placeholder="Select Custom Form"
          options={customFormOptions}
          getOptionValue={optionValue}
          required
        />
        <FormAutocomplete
          name="custom_status"
          control={control}
          label="Custom status"
          placeholder="Select Custom Status"
          options={statusOptions}
          getOptionValue={optionValue}
          required
        />
      </FormSection>

      <FormSection title="Assign to">
        <FormAutocomplete
          name="department"
          control={control}
          label="Department"
          placeholder="Select Department"
          options={departmentOptions}
          getOptionValue={optionValue}
          required
        />
        <FormAutocomplete
          name="employee_id_list"
          control={control}
          label="Employees"
          placeholder={
            department !== null && department !== undefined
              ? "Select Employees"
              : "Select a department first"
          }
          options={employeeOptions}
          getOptionValue={optionValue}
          multiple
          required
          disabled={department === null || department === undefined}
        />
      </FormSection>
    </SidebarFormLayout>
  );
};

export default AsignCustomForm;
