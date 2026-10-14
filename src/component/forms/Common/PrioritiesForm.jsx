import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import {
  addPriorities,
  editPriorities,
} from "../../../redux/reducers/ChildReducer/PrioritiesReducer";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { PostApi } from "../../../common/api/PostApi";
import { PutApi } from "../../../common/api/PutApi";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import { FormSection, FormSwitch, FormTextField } from "../../../shared/ui/form";
import ColorPickerField, { DEFAULT_COLOR, isBlackOrWhite } from "./ColorPickerField";

defineElement(loadAnimation);

const NAME_MAX = 50;
const COLOR_MAX = 25;
const DESCRIPTION_MAX = 200;
const NAME_CHARS = /[^a-zA-Z0-9\s.,\-&()']/g;
const COLOR_CHARS = /[^a-zA-Z0-9\s.,\-&()'#]/g;
const DESCRIPTION_CHARS = /[^a-zA-Z0-9\s.,!?'"_\-()&:;/]/g;

const schema = Yup.object({
  name: Yup.string()
    .matches(
      /^[a-zA-Z0-9\s.,\-&()']+$/,
      "Priority name can only contain letters, numbers, spaces, and . , - & ( ) '",
    )
    .required("Please Enter Priority Name")
    .min(1, "Please Enter Priority Name")
    .max(NAME_MAX, "Priority name is too long. Please keep it within 50 characters.")
    .test(
      "not-only-spaces",
      "Please Enter Priority Name",
      (value) => !value || value.trim().length > 0,
    ),
  color: Yup.string()
    .trim()
    .required("Please enter a value or select a color.")
    .max(COLOR_MAX, "Color value must not exceed 25 characters.")
    .test(
      "not-black-or-white",
      "Black and white are not allowed as a priority color.",
      (value) => !isBlackOrWhite(value),
    ),
  description: Yup.string()
    .trim()
    .matches(
      /^[a-zA-Z0-9\s.,!?'"_\-()&:;/]*$/,
      "Description can contain only alphabets, numbers, spaces, and . , ! ? \" ' - _ ( ) & : ; /",
    )
    .max(DESCRIPTION_MAX, "Description is too long. Please keep it within 200 characters."),
  status: Yup.boolean(),
});

const toFormValues = (obj) => ({
  name: obj?.name || "",
  color: obj?.color || DEFAULT_COLOR,
  description: obj?.description || "",
  status: obj?.status !== undefined ? obj.status : true,
});

const PrioritiesForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const priorityId = form_obj?.id || 0;

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  const status = useWatch({ control, name: "status" });

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      const isEdit = priorityId && priorityId !== 0;
      const payload = { id: priorityId, ...values };

      const Api = isEdit
        ? await PutApi("task-priority/", payload, false)
        : await PostApi("task-priority/", payload, false);

      if (Api?.status === 200 || Api?.status === 201) {
        const responseData = Api?.data?.data;

        dispatch(isEdit ? editPriorities(responseData) : addPriorities(responseData));

        const oldPriorities = GetLocalStorageData("task_priority") || [];
        let updatedPriorities = [];

        if (isEdit) {
          updatedPriorities = oldPriorities.map((item) =>
            item.id === responseData.id ? responseData : item,
          );
          SetLocalStorage("task_priority", updatedPriorities, 1);
        } else {
          updatedPriorities = [...oldPriorities, responseData];
          SetLocalStorage("task_priority", updatedPriorities, 1);
        }

        toast.success(Api?.data?.message || "Success");
        dispatch(toggleRSBView(false));
      } else {
        toast.error(Api?.data?.error_message || Api?.data?.detail || "Something went wrong!");
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
      submitLabel={priorityId > 0 ? "Update" : "Save"}
    >
      <FormSection title="Details">
        <FormTextField
          name="name"
          control={control}
          label="Priority name"
          placeholder="Priority Name"
          required
          autoFocus
          maxLength={NAME_MAX}
          sanitize={(v) => v.replace(/^\s+/, "").replace(NAME_CHARS, "")}
          startIcon={<FlagOutlinedIcon fontSize="small" color="action" />}
        />
        <ColorPickerField
          name="color"
          control={control}
          label="Color"
          required
          placeholder="e.g. lightgreen or #90ee90"
          helperText='Pick or type a color name / hex code. Invalid values will default to blue ("#0b94a7").'
          maxLength={COLOR_MAX}
          sanitize={(v) => v.replace(/^\s+/, "").replace(COLOR_CHARS, "")}
        />
        <FormTextField
          name="description"
          control={control}
          label="Description"
          placeholder="Description (Optional)"
          multiline
          minRows={3}
          maxRows={6}
          maxLength={DESCRIPTION_MAX}
          sanitize={(v) => v.replace(/^\s+/, "").replace(DESCRIPTION_CHARS, "")}
        />
      </FormSection>

      {priorityId > 0 && (
        <FormSwitch
          name="status"
          control={control}
          label="Status"
          description={status ? "Active" : "Inactive"}
        />
      )}
    </SidebarFormLayout>
  );
};

export default PrioritiesForm;
