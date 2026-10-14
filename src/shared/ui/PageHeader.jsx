import React from "react";
import { Box, Stack, Typography } from "@mui/material";

const PageHeader = ({ title, subtitle, icon, actions }) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    alignItems={{ xs: "flex-start", sm: "center" }}
    justifyContent="space-between"
    spacing={2}
    className="page-head-band"
    sx={{ mb: 2.5 }}
  >
    <Stack direction="row" alignItems="center" spacing={1.5}>
      {icon && (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            color: "#fff",
            background:
              "linear-gradient(135deg, var(--vz-success), color-mix(in srgb, var(--vz-success) 55%, var(--vz-info)))",
            boxShadow: "0 6px 16px color-mix(in srgb, var(--vz-success) 32%, transparent)",
          }}
        >
          {icon}
        </Box>
      )}
      <Box>
        <Typography variant="h5" sx={{ fontSize: 20 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
    {actions && (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {actions}
      </Stack>
    )}
  </Stack>
);

export default PageHeader;
