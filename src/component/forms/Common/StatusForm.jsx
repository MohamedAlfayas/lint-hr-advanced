import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import { setStatus } from "../../../redux/reducers/ChildReducer/StatusReducer";
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
      "Status name can only contain letters, numbers, spaces, and . , - & ( ) '",
    )
    .required("Please Enter the status name")
    .min(1, "Please Enter the status name")
    .max(NAME_MAX, "Status name is too long. Please keep it within 50 characters.")
    .test(
      "not-only-spaces",
      "Please Enter the status name",
      (value) => !value || value.trim().length > 0,
    ),
  color: Yup.string()
    .trim()
    .required("Please enter a value or select a color.")
    .max(COLOR_MAX, "Color value must not exceed 25 characters.")
    .test(
      "not-black-or-white",
      "Black and white are not allowed as a status color.",
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
  color: isBlackOrWhite(obj?.color) ? DEFAULT_COLOR : obj?.color || DEFAULT_COLOR,
  description: obj?.description || "",
  status: obj?.status !== undefined ? obj.status : true,
});

const StatusForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const statusId = form_obj?.id || 0;

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
      const isEdit = statusId && Number(statusId) !== 0;
      const payload = {
        id: statusId,
        ...values,
        name: values.name.trim(),
      };

      const response = isEdit
        ? await PutApi("task-status/", payload, false)
        : await PostApi("task-status/", payload, false);

      if (response?.status === 200 || response?.status === 201) {
        const responseData = response?.data?.data || response?.data;

        if (!responseData?.id) {
          toast.error("Invalid API Response");
          setIsSubmitting(false);
          return;
        }

        const oldStatus = GetLocalStorageData("task_status") || [];
        let updatedStatus = [];

        if (isEdit) {
          updatedStatus = oldStatus.map((item) =>
            Number(item.id) === Number(responseData.id) ? responseData : item,
          );
          SetLocalStorage("task_status", updatedStatus, 1);
        } else {
          updatedStatus = [...oldStatus, responseData];
          SetLocalStorage("task_status", updatedStatus, 1);
        }

        dispatch(setStatus(updatedStatus));
        toast.success(response?.data?.message || "Status Saved Successfully");
        dispatch(toggleRSBView(false));
      } else {
        toast.error(
          response?.data?.error_message || response?.data?.detail || "Something went wrong!",
        );
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
      submitLabel={statusId > 0 ? "Update" : "Save"}
    >
      <FormSection title="Details">
        <FormTextField
          name="name"
          control={control}
          label="Status name"
          placeholder="Status Name"
          required
          autoFocus
          maxLength={NAME_MAX}
          sanitize={(v) => v.replace(/^\s+/, "").replace(NAME_CHARS, "")}
          startIcon={<LabelOutlinedIcon fontSize="small" color="action" />}
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

      {statusId > 0 && (
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

export default StatusForm;
