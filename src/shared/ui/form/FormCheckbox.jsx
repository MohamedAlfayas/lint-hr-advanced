import React from "react";
import { Controller } from "react-hook-form";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
} from "@mui/material";
import { useFieldTestId } from "../../testing/testId";

const FormCheckbox = ({
  name,
  control,
  label,
  helperText,
  color = "primary",
  disabled,
  testId: testIdOverride,
}) => {
  const baseId = useFieldTestId(name, testIdOverride);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl error={!!error} disabled={disabled}>
          <FormControlLabel
            label={label}
            slotProps={{ typography: { fontSize: 13 } }}
            control={
              <Checkbox
                size="small"
                color={color}
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                inputRef={field.ref}
                slotProps={{ input: { "data-testid": `${baseId}-checkbox` } }}
              />
            }
          />
          {(error?.message || helperText) && (
            <FormHelperText
              sx={{ mt: -0.5 }}
              data-testid={`${baseId}-${error ? "error" : "helper"}`}
            >
              {error?.message || helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

export default FormCheckbox;
