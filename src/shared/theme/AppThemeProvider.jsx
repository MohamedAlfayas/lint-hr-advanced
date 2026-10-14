import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createAppTheme } from "./theme";

/**
 * Provides the MUI theme (following the app's light/dark layout mode) and the
 * dayjs date adapter. CssBaseline is intentionally omitted so MUI does not
 * reset Bootstrap styles used by the not-yet-migrated screens.
 */
const AppThemeProvider = ({ children }) => {
  const mode = useSelector(
    (state) => state.LayoutReducer?.layoutModeType || "light",
  );
  const theme = useMemo(
    () => createAppTheme(mode === "dark" ? "dark" : "light"),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={{ ".pac-container": { zIndex: 1500 } }} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default AppThemeProvider;
