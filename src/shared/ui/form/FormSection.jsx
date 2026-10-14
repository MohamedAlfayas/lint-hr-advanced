import React from "react";
import { Box, Stack } from "@mui/material";

/**
 * Group of fields inside a long form. Section headings are intentionally not
 * rendered (forms show field labels only); `title`/`description` are kept for
 * callers and accessibility.
 */
const FormSection = ({ title, description, action, children, spacing = 2.5 }) => (
  <Box component="section" aria-label={typeof title === "string" ? title : undefined}>
    {action && (
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1.5 }}>
        {action}
      </Stack>
    )}
    <Stack spacing={spacing}>{children}</Stack>
  </Box>
);

export default FormSection;
