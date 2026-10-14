import React, { useCallback, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { testId, useTestIdModule } from "../testing/testId";

/**
 * Promise-based confirmation dialog.
 *
 *   const [confirm, confirmDialog] = useConfirm("holiday");
 *   if (await confirm({ title, message, confirmLabel })) { ... }
 *   return <>{...}{confirmDialog}</>;
 *
 * data-testids: `<module>-confirm-dialog`, `<module>-confirm-button`,
 * `<module>-confirm-cancel-button` (`opts.testId` replaces "confirm").
 */
export const useConfirm = (testIdModule) => {
  const [options, setOptions] = useState(null);
  const resolver = useRef();
  const inheritedModule = useTestIdModule();
  const baseId = testId(testIdModule || inheritedModule, options?.testId || "confirm");

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOptions(opts);
      }),
    [],
  );

  const close = (result) => {
    resolver.current?.(result);
    setOptions(null);
  };

  const dialog = (
    <Dialog
      open={!!options}
      onClose={() => close(false)}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { "data-testid": `${baseId}-dialog` } }}
    >
      <DialogContent sx={{ pt: 4 }}>
        <Stack alignItems="center" spacing={1.5} textAlign="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: (t) => `${t.palette[options?.color || "error"].main}1a`,
              color: `${options?.color || "error"}.main`,
            }}
          >
            <WarningAmberRoundedIcon fontSize="large" />
          </Avatar>
          <Typography variant="h6" data-testid={`${baseId}-title`}>
            {options?.title || "Are you sure?"}
          </Typography>
          {options?.message && (
            <Typography variant="body2" color="text.secondary" data-testid={`${baseId}-message`}>
              {options.message}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 1 }}>
        <Button color="inherit" onClick={() => close(false)} data-testid={`${baseId}-cancel-button`}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={options?.color || "error"}
          onClick={() => close(true)}
          autoFocus
          data-testid={`${baseId}-button`}
        >
          {options?.confirmLabel || "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return [confirm, dialog];
};
