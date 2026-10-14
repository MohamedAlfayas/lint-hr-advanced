import React from "react";
import { Controller } from "react-hook-form";
import { Button, Chip, FormHelperText, Stack, Typography } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { toast } from "react-toastify";
import { PostApi } from "../../../common/api/PostApi";
import {
  form_date_type,
  form_default_input_types,
  form_file_type,
  form_select_type,
} from "../../../common/constant/Constants";
import { FormAutocomplete, FormDatePicker, FormTextField } from "../../../shared/ui/form";
import { testId, useFieldTestId, useTestIdModule } from "../../../shared/testing/testId";

const getOptionValue = (o) => o?.value;

const uploadCustomFieldFile = async (file) => {
  const cf_form_data = new FormData();
  cf_form_data.append("cf_file", file);
  const ApiRes = await PostApi("fields/upload-custom-field-file/", cf_form_data, true);
  if (ApiRes.status !== 200) toast.error(ApiRes?.data?.message || ApiRes?.data?.detail);
  return ApiRes.status === 200 ? String(ApiRes?.data?.data) : "";
};

const CustomFileField = ({ name, control, cf, testId: baseTestId }) => {
  const baseId = useFieldTestId(name, baseTestId);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Stack spacing={0.75}>
          <Typography variant="body2" color={error ? "error" : "text.secondary"}>
            {cf.name}
            {cf.is_required && " *"}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Button
              component="label"
              variant="outlined"
              size="small"
              color={error ? "error" : "primary"}
              startIcon={<UploadFileOutlinedIcon />}
              data-testid={`${baseId}-upload-button`}
            >
              Choose file
              <input
                hidden
                type="file"
                data-testid={`${baseId}-file-input`}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  field.onChange(await uploadCustomFieldFile(file));
                  field.onBlur();
                }}
              />
            </Button>
            {!!field.value && (
              <Chip
                size="small"
                color="success"
                variant="outlined"
                label={`${cf.name} Uploaded`}
                data-testid={`${baseId}-success-message`}
              />
            )}
          </Stack>
          <FormHelperText
            error={!!error}
            sx={{ mt: 0 }}
            data-testid={`${baseId}-${error ? "error" : "helper"}`}
          >
            {error?.message || `Choose ${cf.name}`}
          </FormHelperText>
        </Stack>
      )}
    />
  );
};

/** Inputs for the employee's custom fields (`cf_values[i].value`). */
const CustomFieldInputs = ({ control, fields }) => {
  const moduleName = useTestIdModule();
  return (fields || []).map((cf, index) => {
    const name = `cf_values.${index}.value`;
    const fieldTestId = testId(moduleName, "cf", cf.name || cf.id);

    if (form_default_input_types.includes(cf.type)) {
      return (
        <FormTextField
          key={cf.id}
          name={name}
          control={control}
          testId={fieldTestId}
          label={cf.name}
          required={!!cf.is_required}
          type={cf.type === "number" ? "number" : "text"}
          placeholder={`Enter ${cf.name}`}
          helperText={`Enter ${cf.name}`}
        />
      );
    }
    if (cf.type === form_file_type) {
      return <CustomFileField key={cf.id} name={name} control={control} cf={cf} testId={fieldTestId} />;
    }
    if (cf.type === form_date_type) {
      return (
        <FormDatePicker
          key={cf.id}
          name={name}
          control={control}
          testId={fieldTestId}
          label={cf.name}
          required={!!cf.is_required}
        />
      );
    }
    if (cf.type === form_select_type) {
      return (
        <FormAutocomplete
          key={cf.id}
          name={name}
          control={control}
          testId={fieldTestId}
          label={cf.name}
          required={!!cf.is_required}
          placeholder={`Select ${cf.name}`}
          options={cf.options || []}
          getOptionValue={getOptionValue}
          disableClearable
        />
      );
    }
    return null;
  });
};

export default CustomFieldInputs;
