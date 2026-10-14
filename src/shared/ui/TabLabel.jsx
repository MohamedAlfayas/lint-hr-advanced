import React from "react";
import { Box } from "@mui/material";

/** Tab text with a small coloured count badge (`color` is a theme palette key). */
const TabLabel = ({ label, count, color = "primary" }) => (
  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
    {label}
    {count != null && (
      <Box
        component="span"
        sx={{
          bgcolor: `${color}.main`,
          color: `${color}.contrastText`,
          borderRadius: 1,
          px: 0.75,
          minWidth: 20,
          lineHeight: "18px",
          fontSize: 11,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {count}
      </Box>
    )}
  </Box>
);

export default TabLabel;
