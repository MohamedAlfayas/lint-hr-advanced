import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  Box,
  ButtonBase,
  FormHelperText,
  Typography,
} from "@mui/material";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import EmojiPicker from "emoji-picker-react";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { toast } from "react-toastify";
import { PostApi } from "../../../common/api/PostApi";
import {
  addCustomStatus,
  editCustomStatus,
} from "../../../redux/reducers/ChildReducer/CustomStatusReducer";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { PutApi } from "../../../common/api/PutApi";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import { FormSection, FormSwitch, FormTextField } from "../../../shared/ui/form";

const NAME_MAX = 50;
const NAME_CHARS = /[^A-Za-z0-9\s.,&()'-]/g;

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .matches(/^[A-Za-z0-9\s.,&()'-]+$/, "Please Enter Status Name")
    .min(1, "Please Enter Status Name")
    .max(NAME_MAX, "Status name cannot exceed 50 characters")
    .required("Please Enter Status Name"),
  emoji: Yup.string().required("Please Select an Emoji"),
});

const toFormValues = (obj) => ({
  id: obj?.id || null,
  name: obj?.name || "",
  emoji: obj?.emoji ?? obj?.icon ?? "",
  is_active: obj?.is_active ?? obj?.active ?? true,
  location_required: obj?.location_required ?? false,
  notes_required: obj?.notes_required ?? false,
  is_break: obj?.is_break ?? false,
});

const CustomStatusForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const pickerRef = useRef(null);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusId = useWatch({ control, name: "id" });
  const isActive = useWatch({ control, name: "is_active" });
  const isEdit = !!statusId;

  const HandleCustomStatusSaveAPI = async (values) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        icon: values.emoji,
        is_active: values.is_active,
        location_required: values.location_required,
        notes_required: values.notes_required,
        is_break: values.is_break,
      };

      const isNew = !values.id;
      let response;

      if (isNew) {
        response = await PostApi(
          "attendance/custom-statuses/v2/",
          payload,
          true,
        );
      } else {
        response = await PutApi(
          `attendance/custom-statuses/${values.id}/v2/`,
          payload,
          true,
        );
      }

      const savedData = response?.data?.data || response?.data || null;

      if ([200, 201].includes(response?.status) && savedData) {
        const normalizedData = {
          ...savedData,
          emoji: savedData.emoji ?? savedData.icon ?? values.emoji,
          is_active: savedData.is_active ?? values.is_active,
          location_required:
            savedData.location_required ?? values.location_required,
          notes_required: savedData.notes_required ?? values.notes_required,
        };

        isNew
          ? dispatch(addCustomStatus(normalizedData))
          : dispatch(editCustomStatus(normalizedData));

        // Sync localStorage
        let existingData = GetLocalStorageData("custom_statuses") || [];
        existingData = existingData.filter((i) => i && typeof i === "object");

        const updatedData = isNew
          ? [...existingData, normalizedData]
          : existingData.map((i) =>
              i.id === normalizedData.id ? normalizedData : i,
            );

        SetLocalStorage("custom_statuses", JSON.stringify(updatedData));

        let global =
          JSON.parse(localStorage.getItem("lint_hr_globaldata")) || {};
        global["custom_statuses"] = updatedData;
        SetLocalStorage("lint_hr_globaldata", JSON.stringify(global));

        toast.success(
          isNew
            ? "Custom status added successfully."
            : "Custom status updated successfully.",
        );

        dispatch(toggleRSBView(false));
      } else {
        toast.error(
          response?.data?.message || response?.data?.detail || "Failed to save",
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.detail ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarFormLayout
      onSubmit={handleSubmit(HandleCustomStatusSaveAPI)}
      isSubmitting={loading}
      submitLabel={isEdit ? "Update" : "Create"}
    >
      <FormSection title="Details">
        <FormTextField
          name="name"
          control={control}
          label="Name"
          placeholder="e.g. On a call"
          required
          autoFocus
          maxLength={NAME_MAX}
          sanitize={(v) => v.replace(NAME_CHARS, "")}
        />

        <Controller
          name="emoji"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Box ref={pickerRef} sx={{ position: "relative" }}>
              <Typography
                variant="caption"
                color={error ? "error" : "text.secondary"}
                sx={{ display: "block", mb: 0.5 }}
              >
                Status icon *
              </Typography>
              <ButtonBase
                ref={field.ref}
                onClick={() => setShowPicker((prev) => !prev)}
                onBlur={field.onBlur}
                sx={{
                  width: "100%",
                  justifyContent: "space-between",
                  px: 1.75,
                  py: 1.5,
                  border: 1,
                  borderRadius: 1,
                  borderColor: error ? "error.main" : "divider",
                  "&:hover": { borderColor: error ? "error.main" : "text.primary" },
                }}
              >
                <Typography
                  variant="body1"
                  color={field.value ? "text.primary" : "text.secondary"}
                  sx={{ fontSize: field.value ? 20 : undefined, lineHeight: 1.4 }}
                >
                  {field.value || "Pick an Emoji"}
                </Typography>
                <EmojiEmotionsOutlinedIcon fontSize="small" color="action" />
              </ButtonBase>
              {error && (
                <FormHelperText error sx={{ mx: 1.75 }}>
                  {error.message}
                </FormHelperText>
              )}

              {showPicker && (
                <Box sx={{ position: "absolute", zIndex: 999, mt: 0.5 }}>
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      field.onChange(emojiData.emoji);
                      setShowPicker(false);
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        />
      </FormSection>

      <FormSection title="Rules">
        <FormSwitch
          name="location_required"
          control={control}
          label="Location Required"
        />
        <FormSwitch
          name="notes_required"
          control={control}
          label="Notes Required"
        />
        <FormSwitch
          name="is_break"
          control={control}
          label="Exclude from Working Hours"
          description="When enabled, time logged will not be counted toward working hours"
        />
      </FormSection>

      {isEdit && (
        <FormSection title="Status">
          <FormSwitch
            name="is_active"
            control={control}
            label="Status"
            description={`Status is currently ${isActive ? "Yes" : "No"}`}
          />
        </FormSection>
      )}
    </SidebarFormLayout>
  );
};

export default CustomStatusForm;
