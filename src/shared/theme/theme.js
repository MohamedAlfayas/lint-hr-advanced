import { alpha, createTheme } from "@mui/material/styles";

// Brand colours mirror the Bootstrap/Velzon SCSS variables
// (src/assets/scss/config/default/_variables.scss) so MUI and legacy screens match.
export const brand = {
  primary: "#405189",
  success: "#0ab39c",
  info: "#299cdb",
  warning: "#f7b84b",
  danger: "#f06548",
  secondary: "#3577f1",
};

// Collapses the outline notch so the border is never cut for the label.
const staticLabelLegend = {
  maxWidth: "0.01px !important",
  padding: "0 !important",
  "& > span": { display: "none" },
};

const outlinedInputRoot = ({ theme }) => ({
  borderRadius: 8,
  backgroundColor: theme.palette.background.paper,
  transition: "box-shadow .15s ease, border-color .15s ease",
  "&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
    borderColor: alpha(theme.palette.success.main, 0.55),
  },
  "&.Mui-focused": {
    boxShadow: `0 0 0 3px ${alpha(theme.palette.success.main, 0.14)}`,
  },
  "&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.success.main,
    borderWidth: 1,
  },
  "&.Mui-focused.Mui-error": {
    boxShadow: `0 0 0 3px ${alpha(theme.palette.error.main, 0.14)}`,
  },
});

const pickersOutlinedInputRoot = ({ theme }) => ({
  borderRadius: 8,
  backgroundColor: theme.palette.background.paper,
  transition: "box-shadow .15s ease",
  "&.Mui-focused": {
    boxShadow: `0 0 0 3px ${alpha(theme.palette.success.main, 0.14)}`,
  },
  "&.Mui-focused:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline": {
    borderColor: theme.palette.success.main,
    borderWidth: 1,
  },
});

// Compact filter bars keep MUI's floating label so labelled fields stay
// level with unlabelled ones (e.g. the table search box).
export const floatingLabelTheme = (outer) => ({
  ...outer,
  components: {
    ...outer.components,
    MuiTextField: { defaultProps: { size: "small" } },
    MuiInputLabel: {},
    MuiOutlinedInput: {
      styleOverrides: {
        root: (props) => ({ ...outlinedInputRoot(props), "&.Mui-focused": { boxShadow: "none" } }),
      },
    },
    MuiPickersTextField: { defaultProps: { size: "small" } },
    MuiPickersOutlinedInput: {
      styleOverrides: {
        root: (props) => ({ ...pickersOutlinedInputRoot(props), "&.Mui-focused": { boxShadow: "none" } }),
      },
    },
  },
});

export const createAppTheme = (mode = "light") => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: brand.primary },
      secondary: { main: brand.success, contrastText: "#fff" },
      success: { main: brand.success, contrastText: "#fff" },
      info: { main: brand.info },
      warning: { main: brand.warning },
      error: { main: brand.danger },
      background: {
        default: isDark ? "#1a1d21" : "#f3f3f9",
        paper: isDark ? "#212529" : "#ffffff",
      },
      divider: isDark ? alpha("#fff", 0.08) : "#e9ebec",
      text: {
        primary: isDark ? "#ced4da" : "#212529",
        secondary: isDark ? "#878a99" : "#878a99",
      },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: 13,
      button: { textTransform: "none", fontWeight: 500 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600, fontSize: "1rem" },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 8, paddingInline: 16 } },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          rounded: { borderRadius: 12 },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 1px 2px rgba(56, 65, 74, 0.15)",
          }),
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
          fullWidth: true,
          slotProps: { inputLabel: { shrink: true } },
        },
      },
      MuiOutlinedInput: {
        defaultProps: { notched: false },
        styleOverrides: {
          root: (props) => ({
            ...outlinedInputRoot(props),
            "& .MuiOutlinedInput-notchedOutline legend": staticLabelLegend,
          }),
        },
      },
      // Labels sit as plain text above the field instead of floating onto the border.
      MuiInputLabel: {
        defaultProps: { shrink: true },
        styleOverrides: {
          root: ({ theme }) => ({
            position: "relative",
            transform: "none",
            maxWidth: "100%",
            marginBottom: 6,
            fontSize: 12.5,
            fontWeight: 600,
            lineHeight: 1.4,
            color: isDark ? theme.palette.text.primary : "#495057",
            "&.Mui-focused:not(.Mui-error)": {
              color: isDark ? theme.palette.text.primary : "#495057",
            },
            "&.Mui-disabled": { color: theme.palette.text.secondary },
            "& .MuiFormLabel-asterisk": { color: theme.palette.error.main },
          }),
        },
      },
      MuiPickersTextField: {
        defaultProps: { size: "small", fullWidth: true, InputLabelProps: { shrink: true } },
      },
      MuiPickersOutlinedInput: {
        styleOverrides: {
          root: pickersOutlinedInputRoot,
          notchedOutline: { "& legend": staticLabelLegend },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            "&.Mui-focused:not(.Mui-error)": { color: theme.palette.text.secondary },
          }),
        },
      },
      MuiFormHelperText: {
        styleOverrides: { root: { marginInline: 2 } },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 500, borderRadius: 6 } },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          root: {
            "& .MuiBackdrop-root": {
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(4px)",
            },
          },
          paper: ({ theme }) => ({
            borderRadius: 16,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow:
              "0 30px 80px -24px rgba(15, 23, 42, 0.45), 0 2px 6px rgba(15, 23, 42, 0.06)",
          }),
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: ({ theme }) => ({
            position: "relative",
            padding: "16px 20px",
            fontSize: "1.02rem",
            fontWeight: 600,
            borderBottom: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.07)}, ${alpha(theme.palette.info.main, 0.03)} 55%, transparent)`,
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 3,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              opacity: 0.85,
            },
            "& + .MuiDialogContent-root": { paddingTop: "20px !important" },
          }),
        },
      },
      MuiDialogContent: {
        styleOverrides: { root: { padding: "20px 22px" } },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: ({ theme }) => ({
            gap: 8,
            padding: "12px 20px",
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: isDark ? alpha("#fff", 0.03) : "#f8f9fb",
            "& > :not(style) ~ :not(style)": { marginLeft: 0 },
            "& .MuiButton-root": { borderRadius: 10 },
          }),
        },
      },

      // ── MUI X pickers ──
      MuiPickerPopper: {
        styleOverrides: {
          paper: ({ theme }) => ({
            marginTop: 6,
            borderRadius: 18,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isDark
              ? "0 24px 48px -16px rgba(0, 0, 0, 0.6)"
              : "0 2px 4px rgba(15, 23, 42, 0.04), 0 24px 48px -16px rgba(15, 23, 42, 0.28)",
            overflow: "hidden",
          }),
        },
      },
      MuiPickersLayout: {
        styleOverrides: {
          root: ({ theme }) => ({
            background: `radial-gradient(120% 50% at 50% 0%, ${alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06)}, transparent 70%)`,
          }),
          actionBar: ({ theme }) => ({
            padding: "10px 12px",
            gap: 8,
            borderTop: `1px dashed ${theme.palette.divider}`,
            "& .MuiButton-root": {
              minWidth: 0,
              height: 34,
              paddingInline: 14,
              borderRadius: 10,
              fontWeight: 600,
            },
            "& .MuiButton-root:not(:last-of-type)": {
              color: theme.palette.text.secondary,
              "&:hover": { backgroundColor: alpha(theme.palette.text.secondary, 0.08) },
            },
            "& .MuiButton-root:last-of-type": {
              color: "#fff",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              boxShadow: `0 8px 16px -8px ${alpha(theme.palette.primary.main, 0.8)}`,
              "&:hover": { filter: "brightness(1.08)" },
            },
          }),
        },
      },
      MuiMultiSectionDigitalClock: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: "6px 4px",
            borderBottom: 0,
            "& .MuiMultiSectionDigitalClockSection-root + .MuiMultiSectionDigitalClockSection-root": {
              borderLeft: `1px dashed ${theme.palette.divider}`,
            },
          }),
        },
      },
      MuiMultiSectionDigitalClockSection: {
        styleOverrides: {
          root: ({ theme }) => ({
            width: 68,
            padding: "4px 6px",
            scrollbarWidth: "thin",
            scrollbarColor: `${alpha(theme.palette.text.secondary, 0.35)} transparent`,
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 4,
              background: alpha(theme.palette.text.secondary, 0.35),
            },
          }),
          item: ({ theme }) => ({
            width: "auto",
            height: 38,
            margin: "3px 0",
            padding: 0,
            justifyContent: "center",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
            color: theme.palette.text.primary,
            transition: "background-color .15s, color .15s, transform .15s",
            "&:hover": {
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.08),
              transform: "scale(1.04)",
            },
            "&.Mui-selected": {
              color: "#fff",
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              boxShadow: `0 6px 14px -6px ${alpha(theme.palette.primary.main, 0.85)}`,
              "&:hover, &:focus-visible": {
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              },
            },
            "&.Mui-disabled": { opacity: 0.35 },
          }),
        },
      },
      MuiDigitalClock: {
        styleOverrides: {
          list: { padding: 6 },
          item: ({ theme }) => ({
            margin: "2px 0",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
            "&:hover": {
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.08),
            },
            "&.Mui-selected": {
              color: "#fff",
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              },
            },
          }),
        },
      },
      MuiPickersCalendarHeader: {
        styleOverrides: {
          label: ({ theme }) => ({ fontWeight: 700, color: theme.palette.text.primary }),
        },
      },
      MuiDayCalendar: {
        styleOverrides: {
          weekDayLabel: ({ theme }) => ({
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            color: theme.palette.text.secondary,
          }),
        },
      },
      MuiPickersDay: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 10,
            fontWeight: 500,
            transition: "background-color .15s, color .15s, transform .15s",
            "&:hover": {
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.08),
              transform: "scale(1.06)",
            },
            "&.MuiPickersDay-today:not(.Mui-selected)": {
              border: `1.5px solid ${alpha(theme.palette.primary.main, 0.6)}`,
              color: theme.palette.primary.main,
              fontWeight: 700,
            },
            "&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus": {
              color: "#fff",
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              boxShadow: `0 6px 14px -6px ${alpha(theme.palette.primary.main, 0.85)}`,
            },
            "&.Mui-disabled:not(.Mui-selected)": { opacity: 0.4 },
          }),
        },
      },
      MuiYearCalendar: {
        styleOverrides: {
          button: ({ theme }) => ({
            borderRadius: 10,
            "&.Mui-selected, &.Mui-selected:hover": {
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
            },
          }),
        },
      },
      MuiMonthCalendar: {
        styleOverrides: {
          button: ({ theme }) => ({
            borderRadius: 10,
            "&.Mui-selected, &.Mui-selected:hover": {
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
            },
          }),
        },
      },
    },
  });
};
