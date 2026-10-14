import React from "react";
import { useDispatch } from "react-redux";
import { Box, Button, Stack } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { TestIdModule, testId, useTestIdModule } from "../testing/testId";

/**
 * Form body for the shared right sidebar (DisplayForms). Renders the <form>,
 * stacked fields and a footer with Cancel / Save that stays pinned to the
 * bottom of the sidebar's scroll area.
 *
 * `testIdModule` (e.g. "employee") prefixes the data-testids of this layout
 * and of every shared field inside it.
 */
const SidebarFormLayout = ({
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
  onCancel,
  footerStart,
  hideSubmit = false,
  cancelLabel,
  spacing = 2.5,
  testIdModule,
  children,
}) => {
  const dispatch = useDispatch();
  const handleCancel = onCancel || (() => dispatch(toggleRSBView(false)));
  const inheritedModule = useTestIdModule();
  const moduleName = testIdModule || inheritedModule;

  return (
    <TestIdModule name={moduleName}>
      <Box
        component="form"
        noValidate
        onSubmit={onSubmit}
        data-testid={testId(moduleName, "form")}
        sx={{ display: "flex", flexDirection: "column", minHeight: "100%" }}
      >
        <Stack spacing={spacing} sx={{ flex: 1, pb: 3 }}>
          {children}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            position: "sticky",
            // Scroll parent has p:3 and sticky stops at its padding edge, so offset by the same amount.
            bottom: (theme) => theme.spacing(-3),
            zIndex: 2,
            mx: -3,
            mb: -3,
            px: 3,
            py: 2,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 -8px 16px -12px rgba(15, 23, 42, 0.25)",
          }}
        >
          <Box sx={{ flex: 1 }}>{footerStart}</Box>
          <Button
            variant="text"
            color="inherit"
            onClick={handleCancel}
            disabled={isSubmitting}
            data-testid={testId(moduleName, hideSubmit ? "close" : "cancel", "button")}
          >
            {cancelLabel || (hideSubmit ? "Close" : "Cancel")}
          </Button>
          {!hideSubmit && (
            <Button
              type="submit"
              variant="contained"
              color="success"
              loading={isSubmitting}
              loadingPosition="start"
              startIcon={<CheckRoundedIcon />}
              data-testid={testId(moduleName, "save", "button")}
            >
              {submitLabel}
            </Button>
          )}
        </Stack>
      </Box>
    </TestIdModule>
  );
};

export default SidebarFormLayout;
