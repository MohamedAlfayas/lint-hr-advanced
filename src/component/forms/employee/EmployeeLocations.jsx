import React from "react";
import { Avatar, Box, Button, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import no_image from "../../../assets/images/users/no_img.jpg";
import { FormSection } from "../../../shared/ui/form";
import { testId } from "../../../shared/testing/testId";

/** Employee-specific check-in locations (existing employees only). */
const EmployeeLocations = ({ locations, onAdd, onEdit }) => {
  const employeeLocations = (locations || []).filter((l) => l.type === "employee");

  return (
    <FormSection
      title="Custom locations"
      description="Add or manage employee locations."
      action={
        <Button
          size="small"
          startIcon={<AddLocationAltOutlinedIcon />}
          onClick={onAdd}
          data-testid="employee-add-location-button"
        >
          Add location
        </Button>
      }
      spacing={1.25}
    >
      {employeeLocations.length > 0 ? (
        employeeLocations.map((location, index) => (
          <Paper
            key={location.id ?? index}
            variant="outlined"
            sx={{ p: 1.25, display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Avatar
              variant="rounded"
              src={location.image_url ? location.image_url : no_image}
              alt="location"
              sx={{ width: 48, height: 48 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {location.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div" noWrap>
                {location.accurate_address}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Radius: {location.radius_range} m
              </Typography>
            </Box>
            <Tooltip title="Edit location">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(location)}
                data-testid={testId("employee-location", location.id ?? location.name, "edit-button")}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>
        ))
      ) : (
        <Stack
          alignItems="center"
          sx={{ py: 2, border: 1, borderStyle: "dashed", borderColor: "divider", borderRadius: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            No Custom Location
          </Typography>
        </Stack>
      )}
    </FormSection>
  );
};

export default EmployeeLocations;
