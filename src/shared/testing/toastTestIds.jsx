import React from "react";
import { toast } from "react-toastify";

/**
 * react-toastify 9 has no per-toast attribute option, so the typed helpers are
 * wrapped once here (imported from index.js) to give every message a stable
 * `toast-<type>-message` data-testid. Render-function content is left as is.
 */
const TOAST_TYPES = { success: "success", error: "error", warning: "warning", warn: "warning", info: "info" };

const withTestId = (type, content) =>
  typeof content === "function" ? content : (
    <span data-testid={`toast-${type}-message`}>{content}</span>
  );

Object.entries(TOAST_TYPES).forEach(([method, type]) => {
  const original = toast[method];
  if (typeof original !== "function" || original.__withTestId) return;
  const wrapped = (content, options) => original(withTestId(type, content), options);
  wrapped.__withTestId = true;
  toast[method] = wrapped;
});

/** Close button for <ToastContainer closeButton={ToastCloseButton} />. */
export const ToastCloseButton = ({ closeToast, type, theme = "light" }) => (
  <button
    type="button"
    className={`Toastify__close-button Toastify__close-button--${theme}`}
    aria-label="close"
    onClick={(e) => {
      e.stopPropagation();
      closeToast(e);
    }}
    data-testid={`toast-${type || "default"}-close-button`}
  >
    <svg aria-hidden="true" viewBox="0 0 14 16">
      <path
        fillRule="evenodd"
        d="M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z"
      />
    </svg>
  </button>
);
