import React from "react";
import { Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { DateFormat } from "../../../common/constant/Constants";
import { useFieldTestId } from "../../testing/testId";

const API_DATE_FORMAT = "YYYY-MM-DD";

/**
 * Date picker bound to React Hook Form. Displays dates as `DateFormat`
 * (DD-MM-YYYY) but stores them as `YYYY-MM-DD` strings, matching the API.
 * Typing is supported with a masked field; out-of-range dates surface the
 * picker's validation message until Yup validates on submit.
 */
const FormDatePicker = ({
  name,
  control,
  label,
  required,
  helperText,
  minDate,
  maxDate,
  format = DateFormat,
  testId: testIdOverride,
  ...pickerProps
}) => {
  const baseId = useFieldTestId(name, testIdOverride);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const value = field.value ? dayjs(field.value, API_DATE_FORMAT) : null;

        return (
          <DatePicker
            {...pickerProps}
            label={label}
            format={format}
            value={value?.isValid() ? value : null}
            minDate={minDate}
            maxDate={maxDate}
            onChange={(next) =>
              field.onChange(next && next.isValid() ? next.format(API_DATE_FORMAT) : "")
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
              actionBar: { actions: ["today", "clear"] },
            }}
          />
        );
      }}
    />
  );
};

export default FormDatePicker;
