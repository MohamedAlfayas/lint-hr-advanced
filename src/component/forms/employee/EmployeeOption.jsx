import React from "react";
import { Controller } from "react-hook-form";
import { Autocomplete, Avatar, Box, Stack, TextField, Typography } from "@mui/material";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { testId, useFieldTestId } from "../../../shared/testing/testId";

export const getEmployeeLabel = (o) =>
  o?.label ?? [o?.first_name, o?.last_name].filter(Boolean).join(" ");

/** True when an option looks like an employee record (has a photo field or employee identity fields). */
export const isEmployeeOption = (o) =>
  !!o &&
  typeof o === "object" &&
  !o.__selectAll &&
  ("profile_url" in o || ("first_name" in o && ("emp_id" in o || "primary_department_id_list" in o)));

/** Profile photo with a coloured initials fallback (also used when the image fails to load). */
export const EmployeeAvatar = ({ option, size = 30, sx }) => {
  const isGroup = option?.id === "0" || option?.id === 0;
  const label = getEmployeeLabel(option) || "";
  const first = (isGroup ? label : option?.first_name || label) || "?";
  const last = isGroup ? "" : option?.last_name || "";
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return (
    <Avatar
      src={!isGroup && option?.profile_url ? option.profile_url : undefined}
      alt={label}
      sx={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.4)),
        fontWeight: 700,
        bgcolor: "var(--vz-success, #0ab39c)",
        color: "#fff",
        flexShrink: 0,
        ...sx,
      }}
    >
      {isGroup ? <i className="ri-team-line" /> : initials}
    </Avatar>
  );
};

/** Avatar + name + employee ID + primary department, for employee pickers. */
export const EmployeeOption = ({ option, departments }) => {
  const label = getEmployeeLabel(option);
  const isGroup = option?.id === "0";
  const deptList = departments ?? GetLocalStorageData("department") ?? [];
  const departmentName =
    !isGroup && option?.primary_department_id_list
      ? deptList.find((d) => Number(d.id) === Number(option.primary_department_id_list[0]))?.name
      : "";

  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
      <EmployeeAvatar option={option} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {label}
          {option?.emp_id && (
            <Typography component="span" variant="caption" color="text.secondary">
              {" "}
              - {option.emp_id}
            </Typography>
          )}
        </Typography>
        {departmentName && (
          <Typography variant="caption" color="text.secondary" component="div" noWrap>
            {departmentName}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

/** Employee options are identified by employee ID (names can repeat). */
export const employeeOptionTestId = (baseId, option) =>
  testId(baseId, "option", option?.emp_id || getEmployeeLabel(option) || option?.id);

export const renderEmployeeOption = (departments, baseId) => (props, option) => {
  const { key, ...rest } = props;
  return (
    <li key={key} {...rest} data-testid={baseId ? employeeOptionTestId(baseId, option) : undefined}>
      <EmployeeOption option={option} departments={departments} />
    </li>
  );
};

/** Prepends the selected employee's avatar to an Autocomplete input. */
export const withEmployeeAdornment = (InputProps, option) =>
  option
    ? {
        ...InputProps,
        startAdornment: (
          <>
            <EmployeeAvatar option={option} size={24} sx={{ ml: 0.5, mr: 0.25 }} />
            {InputProps?.startAdornment}
          </>
        ),
      }
    : InputProps;

/** Single employee picker bound to RHF; stores the employee id (0 when cleared). */
export const ReportingManagerField = ({
  name,
  control,
  label,
  required,
  helperText,
  options = [],
  departments = [],
  placeholder,
  testId: testIdOverride,
}) => {
  const baseId = useFieldTestId(name, testIdOverride);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const selected = (field.value && options.find((o) => o.id === field.value)) || null;
        return (
          <Autocomplete
            options={options}
            value={selected}
            getOptionLabel={getEmployeeLabel}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            onChange={(_, next) => field.onChange(next ? next.id : 0)}
            onBlur={field.onBlur}
            slotProps={{
              popupIndicator: { "data-testid": `${baseId}-trigger` },
              clearIndicator: { "data-testid": `${baseId}-clear-button` },
            }}
            renderOption={renderEmployeeOption(departments, baseId)}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{ ...params.inputProps, "data-testid": `${baseId}-select` }}
                InputProps={withEmployeeAdornment(params.InputProps, selected)}
                inputRef={field.ref}
                label={label}
                required={required}
                placeholder={selected ? undefined : placeholder}
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
