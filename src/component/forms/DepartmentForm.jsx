import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";
import { PostApi } from "../../common/api/PostApi";
import { setDepartmentDetails } from "../../redux/reducers/ChildReducer/DepartmentReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import SidebarFormLayout from "../../shared/ui/SidebarFormLayout";
import {
  FormAutocomplete,
  FormSection,
  FormSwitch,
  FormTextField,
} from "../../shared/ui/form";

const NAME_MAX = 50;
const DESCRIPTION_MAX = 200;
const NAME_CHARS = /[^a-zA-Z0-9 .,\-&()'_]/g;
const DESCRIPTION_CHARS = /[^a-zA-Z0-9\s.,!?'"\-_()&:;/]/g;

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Please enter department name")
    .max(NAME_MAX, `Department name must not exceed ${NAME_MAX} characters`),
  pid: Yup.number()
    .typeError("Please select parent department")
    .required("Please select parent department")
    .min(1, "Please select parent department"),
  is_location_required: Yup.boolean(),
  allow_only_mobile_checkin: Yup.boolean(),
  description: Yup.string()
    .trim()
    .max(DESCRIPTION_MAX, `Description must not exceed ${DESCRIPTION_MAX} characters`),
});

const toFormValues = (obj) => ({
  name: obj?.name ?? "",
  pid: obj?.pid ?? null,
  is_location_required: !!obj?.is_location_required,
  allow_only_mobile_checkin: !!obj?.allow_only_mobile_checkin,
  description: obj?.description ?? "",
});

const DepartmentForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parentOptions = useMemo(
    () =>
      (GetLocalStorageData("department") || []).filter(
        (d) => !(form_obj?.child_id_list || []).includes(d.id) && d.id !== form_obj?.id,
      ),
    [form_obj],
  );

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    const res = await PostApi(
      "department/create/",
      {
        ...form_obj,
        ...values,
        name: values.name.trim(),
        description: values.description.trim(),
      },
      false,
    );
    setIsSubmitting(false);
    if (res?.status === 200) {
      dispatch(setDepartmentDetails(res?.data?.data));
      SetLocalStorage("department_details", res?.data?.data, 1);
      SetLocalStorage("department", res?.data?.department_data, 1);
      dispatch(toggleRSBView(false));
      toast.success(res?.data?.message);
    } else {
      toast.error(res?.data?.message || res?.data?.detail);
    }
  };

  return (
    <SidebarFormLayout
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={form_obj?.id ? "Update" : "Create"}
    >
      <FormSection title="Details">
        <FormTextField
          name="name"
          control={control}
          label="Department name"
          placeholder="e.g. Engineering"
          required
          autoFocus
          maxLength={NAME_MAX}
          sanitize={(v) => v.replace(/^\s+/, "").replace(NAME_CHARS, "")}
          startIcon={<ApartmentOutlinedIcon fontSize="small" color="action" />}
        />
        <FormAutocomplete
          name="pid"
          control={control}
          label="Parent department"
          placeholder="Select parent department"
          options={parentOptions}
          required
        />
        <FormTextField
          name="description"
          control={control}
          label="Description"
          placeholder="Add a short note (optional)"
          multiline
          minRows={3}
          maxRows={6}
          maxLength={DESCRIPTION_MAX}
          sanitize={(v) => v.replace(DESCRIPTION_CHARS, "")}
        />
      </FormSection>

      <FormSection title="Attendance rules">
        <FormSwitch
          name="is_location_required"
          control={control}
          label="Location required"
          description="Employees must check in from an allowed location"
        />
        <FormSwitch
          name="allow_only_mobile_checkin"
          control={control}
          label="Mobile check-in only"
          description="Allow check-in / check-out only from the mobile app"
        />
      </FormSection>
    </SidebarFormLayout>
  );
};

export default DepartmentForm;
