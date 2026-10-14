import Swal from "sweetalert2";

// Gives every Swal.fire call in the app the same look as the in-app confirm
// dialogs: theme colours, soft round icon, Cancel on the left.

const TONES = {
  danger: "#f06548",
  primary: "#405189",
  success: "#0ab39c",
  warning: "#f7b84b",
  info: "#299cdb",
};

const COLOR_ALIASES = {
  "#d33": "danger",
  "#dd3333": "danger",
  "#d33333": "danger",
  "#dc3545": "danger",
  "#f06548": "danger",
  red: "danger",
  "var(--vz-danger)": "danger",
  "#3085d6": "primary",
  "#405189": "primary",
  "#7066e0": "primary",
  "var(--vz-primary)": "primary",
  "#0ab39c": "success",
  "#28a745": "success",
  "#198754": "success",
  "var(--vz-success)": "success",
  "#f7b84b": "warning",
  "#ffc107": "warning",
  "#299cdb": "info",
};

const ICON_HTML = {
  warning: '<i class="ri-alert-line"></i>',
  error: '<i class="ri-close-circle-line"></i>',
  success: '<i class="ri-check-line"></i>',
  info: '<i class="ri-information-line"></i>',
  question: '<i class="ri-question-line"></i>',
};

const ICON_TONE = {
  warning: "warning",
  error: "danger",
  success: "success",
  info: "info",
  question: "primary",
};

const PICKER_INPUTS = ["date", "datetime-local", "time", "month", "week"];

// data-testids for every popup: `<prefix>-dialog`, `<prefix>-confirm-button`, …
// Pass `testId: "employee-delete"` to Swal.fire to replace the "swal" prefix.
const SWAL_TEST_IDS = {
  dialog: null,
  title: ".swal2-title",
  message: ".swal2-html-container",
  "confirm-button": ".swal2-confirm",
  "cancel-button": ".swal2-cancel",
  "deny-button": ".swal2-deny",
  "close-button": ".swal2-close",
  error: ".swal2-validation-message",
};

const setTestIds = (popup, prefix) => {
  Object.entries(SWAL_TEST_IDS).forEach(([type, selector]) => {
    const el = selector ? popup.querySelector(selector) : popup;
    if (el) el.setAttribute("data-testid", `${prefix}-${type}`);
  });
  const input = Swal.getInput();
  if (input) input.setAttribute("data-testid", `${prefix}-input`);
};

const toneOf = (color) => {
  if (!color) return null;
  return COLOR_ALIASES[String(color).trim().toLowerCase()] || null;
};

const normalise = (args) => {
  let params = args[0];
  if (params === undefined || params === null) return args;
  if (typeof params !== "object") {
    const [title, html, icon] = args;
    params = { title, html, icon };
  }
  if (params.toast) {
    const { testId: toastTestId, didOpen: toastDidOpen, ...toastParams } = params;
    return [
      {
        ...toastParams,
        didOpen: (popup) => {
          setTestIds(popup, toastTestId || `toast-${params.icon || "default"}`);
          if (typeof toastDidOpen === "function") toastDidOpen(popup);
        },
      },
    ];
  }

  const next = { ...params };
  const confirmTone = toneOf(next.confirmButtonColor);

  if (next.confirmButtonColor === undefined) {
    next.confirmButtonColor = TONES.primary;
  } else if (confirmTone) {
    next.confirmButtonColor = TONES[confirmTone];
  }
  delete next.cancelButtonColor;

  if (next.reverseButtons === undefined) next.reverseButtons = true;

  if (next.icon && ICON_HTML[next.icon]) {
    if (next.iconHtml === undefined) next.iconHtml = ICON_HTML[next.icon];
    if (next.iconColor === undefined) {
      const tone =
        next.icon === "warning" && confirmTone === "danger"
          ? "danger"
          : ICON_TONE[next.icon];
      next.iconColor = TONES[tone];
    }
  }

  next.customClass = {
    ...(typeof next.customClass === "object" ? next.customClass : {}),
    popup: [next.customClass?.popup, "lhr-swal"].filter(Boolean).join(" "),
  };

  const testIdPrefix = next.testId || "swal";
  delete next.testId;
  const userDidOpen = next.didOpen;
  next.didOpen = (popup) => {
    setTestIds(popup, testIdPrefix);
    if (PICKER_INPUTS.includes(next.input)) {
      const input = popup.querySelector(".swal2-input");
      if (input && typeof input.showPicker === "function") {
        input.addEventListener("click", () => {
          try {
            input.showPicker();
          } catch (e) {
            // showPicker throws when the picker is already open
          }
        });
      }
    }
    if (typeof userDidOpen === "function") userDidOpen(popup);
  };

  return [next];
};

if (!Swal.__lhrThemed) {
  const originalFire = Swal.fire;
  Swal.fire = function themedFire(...args) {
    return originalFire.apply(this, normalise(args));
  };
  Swal.__lhrThemed = true;
}
