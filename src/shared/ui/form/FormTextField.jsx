import React from "react";
import { Controller } from "react-hook-form";
import { InputAdornment, TextField } from "@mui/material";
import { useFieldTestId } from "../../testing/testId";

/**
 * Text / textarea input bound to React Hook Form.
 *
 * - `sanitize(value)` filters keystrokes before they reach form state
 *   (e.g. strip disallowed characters).
 * - `maxLength` shows a live "n / max" counter in the helper text.
 * - `testId` overrides the `<module>-<name>` base of its data-testids.
 */
const FormTextField = ({
  name,
  control,
  label,
  required,
  helperText,
  maxLength,
  sanitize,
  startIcon,
  endIcon,
  testId: testIdOverride,
  ...textFieldProps
}) => {
  const baseId = useFieldTestId(name, testIdOverride);
  const kind = textFieldProps.multiline ? "textarea" : "input";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const value = field.value ?? "";
        const counter = maxLength ? `${value.length} / ${maxLength}` : null;

        return (
          <TextField
            {...textFieldProps}
            {...field}
            value={value}
            onChange={(e) => {
              const next = sanitize ? sanitize(e.target.value) : e.target.value;
              field.onChange(next);
            }}
            label={label}
            required={required}
            error={!!error}
            helperText={
              error?.message || helperText || counter ? (
                <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span data-testid={`${baseId}-${error ? "error" : "helper"}`}>
                    {error?.message || helperText}
                  </span>
                  {counter && <span>{counter}</span>}
                </span>
              ) : undefined
            }
            slotProps={{
              ...textFieldProps.slotProps,
              htmlInput: {
                "data-testid": `${baseId}-${kind}`,
                ...textFieldProps.inputProps,
                ...textFieldProps.slotProps?.htmlInput,
              },
              input: {
                ...textFieldProps.slotProps?.input,
                ...(startIcon && {
                  startAdornment: (
                    <InputAdornment position="start">{startIcon}</InputAdornment>
                  ),
                }),
                ...(endIcon && {
                  endAdornment: (
                    <InputAdornment position="end">{endIcon}</InputAdornment>
                  ),
                }),
              },
            }}
          />
        );
      }}
    />
  );
};

export default FormTextField;
