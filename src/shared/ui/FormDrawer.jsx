import React from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { TestIdModule, testId, useTestIdModule } from "../testing/testId";

/**
 * Right-side drawer that hosts a form: sticky header, scrollable body and a
 * sticky footer with Cancel / Save. Pass `formId` and give the inner <form>
 * the same id so the footer button submits it.
 *
 * `testIdModule` (e.g. "holiday") prefixes the data-testids of the drawer and
 * of every shared field inside it.
 */
const FormDrawer = ({
  open,
  onClose,
  title,
  subtitle,
  formId,
  submitLabel = "Save",
  isSubmitting = false,
  width = 480,
  testIdModule,
  children,
}) => {
  const inheritedModule = useTestIdModule();
  const moduleName = testIdModule || inheritedModule;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      slotProps={{
        paper: {
          "data-testid": testId(moduleName, "drawer"),
          sx: { width: { xs: "100%", sm: width } },
        },
      }}
    >
      <TestIdModule name={moduleName}>
        <Stack sx={{ height: "100%" }}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            sx={{ px: 3, py: 2 }}
          >
            <Box>
              <Typography variant="h6" data-testid={testId(moduleName, "drawer", "title")}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <IconButton
              onClick={onClose}
              disabled={isSubmitting}
              edge="end"
              data-testid={testId(moduleName, "close", "button")}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />

          <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>{children}</Box>

          <Divider />
          <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ px: 3, py: 2 }}>
            <Button
              variant="text"
              color="inherit"
              onClick={onClose}
              disabled={isSubmitting}
              data-testid={testId(moduleName, "cancel", "button")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              variant="contained"
              color="success"
              loading={isSubmitting}
              loadingPosition="start"
              startIcon={<CheckRoundedIcon />}
              data-testid={testId(moduleName, "save", "button")}
            >
              {submitLabel}
            </Button>
          </Stack>
        </Stack>
      </TestIdModule>
    </Drawer>
  );
};

export default FormDrawer;
