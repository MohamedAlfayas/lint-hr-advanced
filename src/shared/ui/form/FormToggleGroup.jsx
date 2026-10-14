import React from "react";
import { Controller } from "react-hook-form";
import {
  FormControl,
  FormHelperText,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { testId, useFieldTestId } from "../../testing/testId";

const defaultGetLabel = (o) => o?.label ?? o?.name ?? "";
const defaultGetValue = (o) => o?.id ?? o?.value;

/**
 * Segmented single / multi choice for short option lists (2–5 items),
 * e.g. "Paid / Unpaid" or week days. Use FormAutocomplete for longer lists.
 */
const FormToggleGroup = ({
  name,
  control,
  label,
  options = [],
  multiple = false,
  required,
  helperText,
  color = "primary",
  getOptionLabel = defaultGetLabel,
  getOptionValue = defaultGetValue,
  disabled,
  testId: testIdOverride,
}) => {
  const baseId = useFieldTestId(name, testIdOverride);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl error={!!error} required={required} fullWidth disabled={disabled}>
          {label && (
            <FormLabel
              sx={{
                mb: "6px",
                fontSize: 12.5,
                fontWeight: 600,
                lineHeight: 1.4,
                color: (t) => (t.palette.mode === "dark" ? "text.primary" : "#495057"),
                "&.Mui-focused:not(.Mui-error)": {
                  color: (t) => (t.palette.mode === "dark" ? "text.primary" : "#495057"),
                },
                "& .MuiFormLabel-asterisk": { color: "error.main" },
              }}
            >
              {label}
            </FormLabel>
          )}
          <ToggleButtonGroup
            exclusive={!multiple}
            disabled={disabled}
            size="small"
            color={color}
            value={multiple ? field.value || [] : field.value ?? null}
            onChange={(_, next) => {
              if (!multiple && next === null) return;
              field.onChange(next);
            }}
            onBlur={field.onBlur}
            sx={{
              flexWrap: "wrap",
              "& .MuiToggleButton-root": { px: 2, py: 0.75, fontSize: 13 },
            }}
          >
            {options.map((o) => (
              <ToggleButton
                key={String(getOptionValue(o))}
                value={getOptionValue(o)}
                data-testid={testId(
                    baseId,
                    "option",
                    typeof getOptionLabel(o) === "string" && getOptionLabel(o)
                      ? getOptionLabel(o)
                      : getOptionValue(o),
                  )}
              >
                {getOptionLabel(o)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {(error?.message || helperText) && (
            <FormHelperText data-testid={`${baseId}-${error ? "error" : "helper"}`}>
              {error?.message || helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

export default FormToggleGroup;
