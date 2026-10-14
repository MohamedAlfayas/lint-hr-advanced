import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TextFieldsOutlinedIcon from "@mui/icons-material/TextFieldsOutlined";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  addCustomField,
  editCustomField,
} from "../../redux/reducers/ChildReducer/CustomFieldReducer";
import { PostApi } from "../../common/api/PostApi";
import {
  custom_field_input_types,
  custom_field_module_lists,
} from "../../common/constant/Constants";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";
import SidebarFormLayout from "../../shared/ui/SidebarFormLayout";
import {
  FormAutocomplete,
  FormSection,
  FormSwitch,
  FormTextField,
} from "../../shared/ui/form";
import { testId, itemTestKey } from "../../shared/testing/testId";

const NAME_MAX = 100;
const NAME_CHARS = /[^A-Za-z0-9 .,&()'_-]/g;

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Please Enter Display Name")
    .max(NAME_MAX, "Display Name cannot exceed 100 characters")
    .matches(
      /^[A-Za-z0-9 .,&()'_-]+$/,
      "Only letters, numbers, spaces, ., ,, -, &, (, ), ', and _ are allowed",
    ),
  type: Yup.string().required("Select Field Type"),
  applicable_for_modules: Yup.array()
    .required("Select Applicable For")
    .min(1, "Select Applicable For"),
});

const toFormValues = (obj) => ({
  name: obj?.name ?? "",
  type: obj?.type ?? null,
  options: obj?.options ?? [],
  max_size: obj?.max_size ?? 1,
  applicable_for_modules: obj?.applicable_for_modules ?? [],
  is_required: !!obj?.is_required,
});

const CustomFieldForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, setValue, getValues, watch } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
    keyName: "_key",
  });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      if (name === "type" && type === "change") {
        setValue(
          "options",
          values.type === "option" ? [{ id: 1, label: "", value: "" }] : [],
        );
        setValue("max_size", 1);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const fieldType = useWatch({ control, name: "type" });
  const maxSize = useWatch({ control, name: "max_size" });

  const addOption = () => {
    const options = getValues("options") || [];
    const newId = options.length ? options[options.length - 1].id + 1 : 1;
    append({ id: newId, value: "", label: "" });
  };

  const onSubmit = async (values) => {
    const invalid_form_value = (values.options || []).some(
      (d) => d.label.trim().length === 0 || d.value.trim().length === 0,
    );
    if (invalid_form_value) {
      toast.error("Please Enter Label Value For Option");
      return;
    }

    setIsSubmitting(true);
    const res = await PostApi(
      "fields/custom-field/create/",
      { ...form_obj, ...values },
      false,
    );
    setIsSubmitting(false);
    if (res.status && res.status === 200) {
      if (form_obj?.id === 0) {
        dispatch(addCustomField(res?.data.data));
        SetLocalStorage("custom_fields", res?.data.data, 2);
      } else {
        dispatch(editCustomField(res?.data?.data));
        SetLocalStorage("custom_fields", res?.data.data, 3);
      }
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
          label="Display name"
          placeholder="Display Name"
          required
          autoFocus
          maxLength={NAME_MAX}
          sanitize={(v) => v.replace(NAME_CHARS, "")}
          startIcon={<TextFieldsOutlinedIcon fontSize="small" color="action" />}
        />
        <FormAutocomplete
          name="type"
          control={control}
          label="Field type"
          placeholder="Select field type"
          options={custom_field_input_types}
          disableClearable
          required
        />
        <FormAutocomplete
          name="applicable_for_modules"
          control={control}
          label="Applicable for"
          placeholder="Select modules"
          options={custom_field_module_lists}
          multiple
          required
        />
      </FormSection>

      {fieldType === "option" && (
        <FormSection
          title="Options"
          action={
            <Button data-testid="custom-field-add-button" size="small" startIcon={<AddIcon />} onClick={addOption}>
              Add
            </Button>
          }
        >
          <Stack spacing={1.5}>
            {fields.map((item, index) => (
              <Paper
                key={item._key}
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 2 }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <FormTextField
                    name={`options.${index}.label`}
                    control={control}
                    label="Label"
                    size="small"
                    fullWidth
                  />
                  <FormTextField
                    name={`options.${index}.value`}
                    control={control}
                    label="Value"
                    size="small"
                    fullWidth
                  />
                  {fields.length > 1 && index === fields.length - 1 ? (
                    <IconButton
                      data-testid={testId("custom-field-remove-option", itemTestKey(item), "button")}
                      color="error"
                      onClick={() => remove(index)}
                      aria-label="Remove option"
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  ) : (
                    <Box sx={{ width: 40, flexShrink: 0 }} />
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </FormSection>
      )}

      {fieldType === "file" && (
        <FormSection title="File settings">
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Maximum size
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                data-testid="custom-field-decrease-maximum-size-button"
                size="small"
                onClick={() =>
                  setValue("max_size", maxSize === 1 ? 1 : maxSize - 1)
                }
                aria-label="Decrease maximum size"
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <TextField
                size="small"
                value={`${maxSize} MB`}
                sx={{ width: "7em" }}
                slotProps={{
                  htmlInput: { readOnly: true, style: { textAlign: "center" } },
                }}
              />
              <IconButton
                data-testid="custom-field-increase-maximum-size-button"
                size="small"
                onClick={() => setValue("max_size", maxSize + 1)}
                aria-label="Increase maximum size"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </FormSection>
      )}

      <FormSection title="Validation">
        <FormSwitch
          name="is_required"
          control={control}
          label="Is required"
          description="Users must fill this field"
        />
      </FormSection>
    </SidebarFormLayout>
  );
};

export default CustomFieldForm;
