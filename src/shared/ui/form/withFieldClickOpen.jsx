import React, { useState } from "react";

/**
 * Wraps an MUI X picker so clicking anywhere in the field opens the popup,
 * not only the calendar / clock icon. Typing into the field still works.
 */
const withFieldClickOpen = (Picker) => {
  const Wrapped = ({ slotProps, onOpen, onClose, ...props }) => {
    const [open, setOpen] = useState(false);
    const textField = slotProps?.textField || {};

    const handleFieldClick = (e) => {
      textField.onClick?.(e);
      if (props.disabled || props.readOnly || e.target.closest("button")) return;
      setOpen(true);
    };

    return (
      <Picker
        {...props}
        open={open}
        onOpen={() => {
          setOpen(true);
          onOpen?.();
        }}
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
        slotProps={{
          ...slotProps,
          textField: {
            ...textField,
            onClick: handleFieldClick,
            sx: [{ cursor: "pointer" }, ...[].concat(textField.sx)].filter(Boolean),
          },
        }}
      />
    );
  };
  Wrapped.displayName = `WithFieldClickOpen(${Picker.displayName || Picker.name || "Picker"})`;
  return Wrapped;
};

export default withFieldClickOpen;
