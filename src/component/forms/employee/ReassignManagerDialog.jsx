import React from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  getEmployeeLabel,
  renderEmployeeOption,
  withEmployeeAdornment,
} from "./EmployeeOption";
import { testId } from "../../../shared/testing/testId";

/**
 * Shown when the API refuses the save because this employee still manages
 * teams: pick a new reporting manager for each team, then Assign.
 */
const ReassignManagerDialog = ({
  open,
  onClose,
  employeeName,
  teams,
  departments,
  onManagerChange,
  onAssign,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="sm"
    slotProps={{ paper: { "data-testid": "employee-reassign-manager-dialog" } }}
  >
    <DialogTitle>Assign New Reporting Manager</DialogTitle>
    <DialogContent dividers>
      <Typography variant="body2" sx={{ mb: 2 }}>
        <b>{employeeName}</b> is the reporting manager for the following employees
      </Typography>
      <Stack spacing={1.5}>
        {(teams || []).map((d) => {
          const options = d.rep_man_options || [];
          const selected =
            options.find((e) => e.id === parseInt(d.new_reporting_manager_id)) || null;
          const baseId = testId("employee-reassign-manager", d?.name || d?.id);
          return (
            <Paper key={d.id} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                {d?.name}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    options={options}
                    value={selected}
                    disableClearable
                    getOptionLabel={getEmployeeLabel}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    onChange={(_, option) => option && onManagerChange(option, d?.id)}
                    slotProps={{ popupIndicator: { "data-testid": `${baseId}-trigger` } }}
                    renderOption={renderEmployeeOption(departments, baseId)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{ ...params.inputProps, "data-testid": `${baseId}-select` }}
                        InputProps={withEmployeeAdornment(params.InputProps, selected)}
                        size="small"
                        label="New reporting manager"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Employees
                  </Typography>
                  {d?.employee_details?.map((m) => (
                    <Typography key={m?.id} variant="body2">
                      {m?.name}
                    </Typography>
                  ))}
                </Grid>
              </Grid>
            </Paper>
          );
        })}
      </Stack>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 1.5 }}>
      <Button color="inherit" onClick={onClose} data-testid="employee-reassign-manager-close-button">
        Close
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={onAssign}
        data-testid="employee-reassign-manager-assign-button"
      >
        Assign
      </Button>
    </DialogActions>
  </Dialog>
);

export default ReassignManagerDialog;
