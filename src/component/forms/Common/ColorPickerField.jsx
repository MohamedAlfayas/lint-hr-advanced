import React from "react";
import { useController } from "react-hook-form";
import { Box, InputAdornment, TextField } from "@mui/material";

export const DEFAULT_COLOR = "#0b94a7";

const BLOCKED_COLORS = new Set([
  "black", "#000", "#000000", "rgb(0,0,0)", "rgba(0,0,0,1)",
  "white", "#fff", "#ffffff", "rgb(255,255,255)", "rgba(255,255,255,1)",
]);

export const isBlackOrWhite = (value) => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "");
  return BLOCKED_COLORS.has(normalized);
};

const isValidHex = (value) =>
  !!value && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());

const getSwatchColor = (value) => {
  if (!isValidHex(value)) return DEFAULT_COLOR;
  if (isBlackOrWhite(value)) return DEFAULT_COLOR;
  return value;
};

/**
 * Text input for a color name / hex code with a native color swatch picker
 * as its start adornment. Both write to the same React Hook Form field.
 */
const ColorPickerField = ({
  name,
  control,
  label,
  required,
  helperText,
  placeholder,
  maxLength,
  sanitize,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });
  const value = field.value ?? "";
  const counter = maxLength ? `${value.length} / ${maxLength}` : null;

  return (
    <TextField
      {...field}
      value={value}
      onChange={(e) => field.onChange(sanitize ? sanitize(e.target.value) : e.target.value)}
      label={label}
      required={required}
      placeholder={placeholder}
      error={!!error}
      helperText={
        <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span>{error?.message || helperText}</span>
          {counter && <span>{counter}</span>}
        </span>
      }
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Box
                component="input"
                type="color"
                aria-label={`${label} picker`}
                value={getSwatchColor(value)}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  field.onBlur();
                }}
                sx={{
                  width: 32,
                  height: 28,
                  p: 0,
                  border: 0,
                  bgcolor: "transparent",
                  cursor: "pointer",
                }}
              />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default ColorPickerField;
