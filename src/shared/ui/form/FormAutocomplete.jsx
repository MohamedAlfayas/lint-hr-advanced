import React, { useMemo } from "react";
import { Controller } from "react-hook-form";
import { Autocomplete, Checkbox, Chip, TextField } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {
  EmployeeAvatar,
  EmployeeOption,
  isEmployeeOption,
  withEmployeeAdornment,
} from "../../../component/forms/employee/EmployeeOption";
import { testId, useFieldTestId } from "../../testing/testId";

const defaultGetLabel = (o) => o?.label ?? o?.name ?? "";
const defaultGetValue = (o) => o?.id ?? o?.value;

const SELECT_ALL = { __selectAll: true };

/**
 * Searchable single / multi select bound to React Hook Form.
 *
 * Form state stores plain values (ids), not option objects, so payloads stay
 * identical to what the API expects. Multi mode adds checkboxes, a
 * "Select all" option and compact chips.
 */
const FormAutocomplete = ({
  name,
  control,
  label,
  options = [],
  multiple = false,
  required,
  helperText,
  placeholder,
  getOptionLabel = defaultGetLabel,
  getOptionValue = defaultGetValue,
  limitTags = 3,
  selectAll = true,
  testId: testIdOverride,
  ...autocompleteProps
}) => {
  const baseId = useFieldTestId(name, testIdOverride);
  const byValue = useMemo(
    () => new Map(options.map((o) => [String(getOptionValue(o)), o])),
    [options, getOptionValue],
  );
  const findOption = (v) =>
    byValue.get(String(v !== null && typeof v === "object" ? getOptionValue(v) : v));
  const withSelectAll = multiple && selectAll && options.length > 1;
  const isEmployeeList = useMemo(() => options.slice(0, 5).some(isEmployeeOption), [options]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const selected = multiple
          ? (Array.isArray(field.value) ? field.value : []).map(findOption).filter(Boolean)
          : field.value === null || field.value === undefined || field.value === ""
            ? null
            : findOption(field.value) ?? null;
        const allSelected =
          multiple && options.length > 0 && selected.length === options.length;

        const labelOf = (o) => (o?.__selectAll ? "Select all" : getOptionLabel(o));

        return (
          <Autocomplete
            {...autocompleteProps}
            slotProps={{
              ...autocompleteProps.slotProps,
              popupIndicator: {
                "data-testid": `${baseId}-trigger`,
                ...autocompleteProps.slotProps?.popupIndicator,
              },
              clearIndicator: {
                "data-testid": `${baseId}-clear-button`,
                ...autocompleteProps.slotProps?.clearIndicator,
              },
            }}
            multiple={multiple}
            options={withSelectAll ? [SELECT_ALL, ...options] : options}
            value={selected}
            disableCloseOnSelect={multiple}
            limitTags={limitTags}
            getOptionLabel={labelOf}
            filterOptions={(opts, state) => {
              const q = state.inputValue.trim().toLowerCase();
              const matches = opts.filter(
                (o) => !o.__selectAll && labelOf(o).toLowerCase().includes(q),
              );
              return withSelectAll && !q ? [SELECT_ALL, ...matches] : matches;
            }}
            isOptionEqualToValue={(o, v) =>
              !o.__selectAll && String(getOptionValue(o)) === String(getOptionValue(v))
            }
            onChange={(_, next) => {
              if (!multiple) {
                field.onChange(next ? getOptionValue(next) : null);
                return;
              }
              if (next.some((o) => o.__selectAll)) {
                field.onChange(allSelected ? [] : options.map(getOptionValue));
                return;
              }
              field.onChange(next.map(getOptionValue));
            }}
            onBlur={field.onBlur}
            renderOption={(props, option, { selected: isSelected }) => {
              const { key, ...rest } = props;
              const isAll = option.__selectAll;
              return (
                <li
                  key={key}
                  {...rest}
                  data-testid={testId(
                    baseId,
                    "option",
                    isAll
                      ? "select-all"
                      : (isEmployeeList && option?.emp_id) || labelOf(option) || getOptionValue(option),
                  )}
                  style={isAll ? { fontWeight: 600 } : undefined}
                >
                  {multiple && (
                    <Checkbox
                      size="small"
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      checked={isAll ? allSelected : isSelected}
                      indeterminate={isAll && !allSelected && selected.length > 0}
                      sx={{ mr: 1, p: 0.5 }}
                    />
                  )}
                  {isEmployeeList && !isAll ? (
                    <EmployeeOption option={option} />
                  ) : (
                    labelOf(option)
                  )}
                </li>
              );
            }}
            {...(multiple && {
              renderValue: (value, getItemProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getItemProps({ index });
                  return (
                    <Chip
                      key={key}
                      {...tagProps}
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={labelOf(option)}
                      data-testid={testId(baseId, "selected", labelOf(option) || getOptionValue(option))}
                      {...(isEmployeeList && {
                        avatar: <EmployeeAvatar option={option} size={20} />,
                      })}
                    />
                  );
                }),
            })}
            renderInput={(params) => (
              <TextField
                {...params}
                {...(isEmployeeList && !multiple && {
                  InputProps: withEmployeeAdornment(params.InputProps, selected),
                })}
                inputProps={{ ...params.inputProps, "data-testid": `${baseId}-select` }}
                inputRef={field.ref}
                label={label}
                required={required}
                placeholder={selected?.length ? undefined : placeholder}
                error={!!error}
                helperText={
                  error?.message || helperText ? (
                    <span data-testid={`${baseId}-${error ? "error" : "helper"}`}>
                      {error?.message || helperText}
                    </span>
                  ) : undefined
                }
              />
            )}
          />
        );
      }}
    />
  );
};

export default FormAutocomplete;
