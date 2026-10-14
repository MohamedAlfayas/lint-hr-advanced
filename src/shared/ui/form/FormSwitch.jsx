import React from "react";
import { Controller } from "react-hook-form";
import { Box, Switch, Typography } from "@mui/material";
import { useFieldTestId } from "../../testing/testId";

/**
 * Toggle rendered as a bordered row with a title and description, which is
 * clearer than a bare switch for settings-style boolean fields.
 */
const FormSwitch = ({
  name,
  control,
  label,
  description,
  color = "success",
  disabled = false,
  testId: testIdOverride,
}) => {
  const baseId = useFieldTestId(name, testIdOverride);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box
          component="label"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 1.5,
            py: 1,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            transition: "border-color .15s ease, background-color .15s ease",
            ...(field.value && {
              borderColor: `${color}.main`,
              bgcolor: (t) => `${t.palette[color].main}0d`,
            }),
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {label}
            </Typography>
            {description && (
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
          <Switch
            color={color}
            checked={!!field.value}
            disabled={disabled}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
            inputRef={field.ref}
            slotProps={{ input: { "data-testid": `${baseId}-switch` } }}
          />
        </Box>
      )}
    />
  );
};

export default FormSwitch;
