import React from "react";
import { Controller } from "react-hook-form";
import { TimePicker as MuiTimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { useFieldTestId } from "../../testing/testId";
import withFieldClickOpen from "./withFieldClickOpen";

dayjs.extend(customParseFormat);

const TimePicker = withFieldClickOpen(MuiTimePicker);

const PARSE_FORMATS = ["HH:mm:ss", "HH:mm", "hh:mm A", "hh:mm a"];

/**
 * Time picker bound to React Hook Form. Stores a string in `valueFormat`
 * (default `HH:mm:ss`, what the API sends/expects) and displays 12h time.
 */
const FormTimePicker = ({
  name,
  control,
  label,
  required,
  helperText,
  valueFormat = "HH:mm:ss",
  format = "hh:mm A",
  testId: testIdOverride,
  ...pickerProps
}) => {
  const baseId = useFieldTestId(name, testIdOverride);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const value = field.value ? dayjs(field.value, PARSE_FORMATS) : null;

        return (
          <TimePicker
            {...pickerProps}
            label={label}
            format={format}
            value={value?.isValid() ? value : null}
            onChange={(next) =>
              field.onChange(next && next.isValid() ? next.format(valueFormat) : "")
            }
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                required,
                onBlur: field.onBlur,
                error: !!error,
                helperText: error?.message || helperText,
                "data-testid": `${baseId}-input`,
                FormHelperTextProps: { "data-testid": `${baseId}-${error ? "error" : "helper"}` },
              },
              openPickerButton: { "data-testid": `${baseId}-trigger` },
            }}
          />
        );
      }}
    />
  );
};

export default FormTimePicker;
