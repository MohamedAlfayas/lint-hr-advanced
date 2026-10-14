import React from "react";
import { Box, Chip, IconButton, Link, Tooltip } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

/** Small, reusable cell renderers for `AppTable` columns. */

export const StatusChip = ({ active, activeLabel = "Active", inactiveLabel = "Inactive" }) => (
  <Chip
    size="small"
    color={active ? "success" : "default"}
    variant={active ? "filled" : "outlined"}
    label={active ? activeLabel : inactiveLabel}
    sx={{ fontWeight: 600, minWidth: 72 }}
  />
);

export const YesNoChip = ({ value }) => (
  <Chip
    size="small"
    variant="outlined"
    color={value ? "success" : "default"}
    label={value ? "Yes" : "No"}
  />
);

export const LinkCell = ({ children, onClick, testId }) => (
  <Link
    component="button"
    type="button"
    underline="hover"
    fontWeight={600}
    onClick={onClick}
    data-testid={testId}
  >
    {children}
  </Link>
);

/**
 * One-line cell with an ellipsis; hovering shows the full `text` in a tooltip.
 * `children` is the normal cell content (keeps bold / colour / search highlight).
 */
export const TruncatedCell = ({ text, minWidth, children }) => (
  <Tooltip
    title={text}
    placement="top-start"
    enterDelay={300}
    slotProps={{
      tooltip: {
        sx: { maxWidth: 380, fontSize: 12.5, lineHeight: 1.5, whiteSpace: "pre-line", py: 1, px: 1.25 },
      },
    }}
  >
    <Box
      component="span"
      sx={{
        display: "block",
        width: "100%",
        minWidth,
        // Long text must not widen the column (and push the table into a
        // horizontal scroll); the cell's own width decides how much shows.
        contain: "inline-size",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        cursor: "default",
        "& *": { whiteSpace: "nowrap" },
      }}
    >
      {children}
    </Box>
  </Tooltip>
);

export const EditAction = ({ onClick, title = "Edit", testId }) => (
  <Tooltip title={title}>
    <IconButton size="small" color="primary" onClick={onClick} data-testid={testId}>
      <EditOutlinedIcon fontSize="small" />
    </IconButton>
  </Tooltip>
);
