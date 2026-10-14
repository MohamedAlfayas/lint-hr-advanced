import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Box, Grid } from "@mui/material";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import {
  addLeaveType,
  editLeaveType,
} from "../../redux/reducers/ChildReducer/LeaveTypeReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { PostApi } from "../../common/api/PostApi";
import {
  gender_options,
  leave_reset_options,
  leave_type_day_unit,
  leave_type_hour_unit,
} from "../../common/constant/Constants";
import { SetLocalStorage } from "../../meta/SetLocalStorageData";
import SidebarFormLayout from "../../shared/ui/SidebarFormLayout";
import {
  FormAutocomplete,
  FormSection,
  FormSwitch,
  FormTextField,
  FormToggleGroup,
} from "../../shared/ui/form";

const NAME_MAX = 150;
const DESCRIPTION_MAX = 200;
const TEXT_CHARS = /[^a-zA-Z0-9\s.,?!"'_\-()&:;/\\]/g;
const NUMBER_FIELDS = [
  "allowed_count",
  "monthly_allowed_count",
  "hour_allowed_in_day",
  "carry_forward_limit",
];

const unitOptions = [
  { label: "Days", value: leave_type_day_unit },
  { label: "Hour", value: leave_type_hour_unit },
];

// Leave types 1 / 2 are system types: once saved their rules are locked.
const isFrozen = (obj) => obj?.id > 0 && [1, 2].includes(obj?.type);

const sanitizeText = (v) => v.replace(/^ +/, "").replace(TEXT_CHARS, "");

const sanitizeCount = (v) => {
  const digits = String(v).replace(/\D/g, "");
  return digits === "" ? "" : parseInt(digits, 10);
};

const blockNonDigitKeys = (e) => {
  if (["-", "e", "E", "+", "."].includes(e.key)) e.preventDefault();
};

// An emptied count input counts as 0 (the old form reset "" to 0 on blur).
const count = () =>
  Yup.number()
    .transform((value, original) => (original === "" ? 0 : value))
    .nullable();

const schema = Yup.object({
  name: Yup.string()
    .required("Please Enter Leave Type Name")
    .trim()
    .matches(
      /^[a-zA-Z0-9\s.,?!"'_\-()&:;/\\]+$/,
      "Name can contain only alphabets, numbers, spaces, and . , ? ! \" ' - _ ( ) & : ; / \\",
    )
    .min(2, "Name must be at least 2 characters")
    .max(NAME_MAX, "Leave Type Name is too long. Maximum 150 characters allowed."),
  genders: Yup.array()
    .required("Please Select Gender")
    .min(1, "Please Select Gender"),
  ws_id: Yup.array()
    .required("Please Select Work Schedule")
    .min(1, "Please Select Work Schedule"),
  role_id: Yup.array()
    .required("Please Select Applicable Role")
    .min(1, "Please Select Applicable Role"),
  allowed_count: count().when(["unit", "is_credit_based"], ([unit, credit], s) => {
    if (unit === leave_type_hour_unit) {
      return s.max(8760, "Leave Hour Allowed in a Year must not exceed 8760");
    }
    if (unit === leave_type_day_unit && !credit) {
      return s.max(365, "Leave Days Count must not exceed 365");
    }
    return s;
  }),
  monthly_allowed_count: count().when(
    ["unit", "is_credit_based"],
    ([unit, credit], s) =>
      unit === leave_type_day_unit && credit
        ? s.max(30, "Monthly Allowed Count must not exceed 30")
        : s,
  ),
  hour_allowed_in_day: count().when("unit", {
    is: leave_type_hour_unit,
    then: (s) =>
      s
        .max(24, "Leave Hour Allowed in a Day must not exceed 24")
        .test(
          "day-lte-year",
          "Leave Hour Allowed in a Day must not exceed Leave Hour Allowed in a Year",
          function (value) {
            const { allowed_count } = this.parent;
            if (value == null || value === "") return true;
            if (allowed_count == null || allowed_count === "") return true;
            return Number(value) <= Number(allowed_count);
          },
        ),
  }),
  carry_forward_limit: count().when(
    [
      "unit",
      "allowed_to_carry_forward",
      "is_credit_based",
      "allowed_count",
      "monthly_allowed_count",
    ],
    ([unit, carryForward, credit, allowed, monthly], s) =>
      unit === leave_type_day_unit && carryForward
        ? s.max(
            credit ? (Number(monthly) || 0) * 12 : Number(allowed) || 0,
            "Carry Forward Limit must not exceed Leave Days Count",
          )
        : s,
  ),
  description: Yup.string()
    .trim()
    .matches(
      /^[a-zA-Z0-9\s.,!?'"_\-()&:;/\\]*$/,
      "Description can contain only alphabets, numbers, spaces, and . , ! ? \" ' - _ ( ) & : ; / \\",
    )
    .max(DESCRIPTION_MAX, "Description is too long. Please keep it within 200 characters."),
});

const schemaResolver = yupResolver(schema);
const resolver = (values, context, options) =>
  isFrozen(values) ? { values, errors: {} } : schemaResolver(values, context, options);

const toFormValues = (obj) => ({
  ...obj,
  is_credit_based: obj?.is_credit_based ?? false,
  allowed_count: obj?.allowed_count || 0,
  monthly_allowed_count: obj?.monthly_allowed_count || 0,
});

const countFieldProps = {
  type: "number",
  sanitize: sanitizeCount,
  onKeyDown: blockNonDigitKeys,
  slotProps: { htmlInput: { min: 0 } },
};

/** FormSwitch has no `disabled` prop; this blocks interaction for frozen types. */
const Locked = ({ locked, children }) => (
  <Box
    aria-disabled={locked || undefined}
    sx={locked ? { pointerEvents: "none", opacity: 0.6 } : undefined}
  >
    {children}
  </Box>
);

const LeaveTypeForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ws_options = useMemo(() => GetLocalStorageData("work_schedule") || [], [form_obj]);
  const role_options = useMemo(() => GetLocalStorageData("role") || [], [form_obj]);

  const frozen = isFrozen(form_obj);

  const { control, handleSubmit, reset, watch, setValue, trigger, clearErrors } =
    useForm({
      resolver,
      mode: "onTouched",
      defaultValues: toFormValues(form_obj),
    });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  // Side effects of user edits (mirrors the old onChange handlers).
  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      if (type !== "change") return;

      if (name === "unit") {
        setValue("hour_allowed_in_day", 0, { shouldDirty: true });
        setValue("allowed_count", 0, { shouldDirty: true });
        if (values.unit === leave_type_hour_unit) {
          setValue("is_credit_based", false, { shouldDirty: true });
          setValue("weekend_between_leave", true, { shouldDirty: true });
          setValue("holiday_between_leave", true, { shouldDirty: true });
        }
        clearErrors(["allowed_count", "hour_allowed_in_day"]);
      } else if (name === "is_credit_based") {
        setValue(
          "monthly_allowed_count",
          values.is_credit_based ? values.monthly_allowed_count || 0 : 0,
          { shouldDirty: true },
        );
        trigger(["allowed_count", "monthly_allowed_count"]);
      } else if (name === "allowed_to_carry_forward") {
        setValue(
          "carry_forward_limit",
          values.allowed_to_carry_forward ? values.carry_forward_limit : 0,
          { shouldDirty: true },
        );
        clearErrors("carry_forward_limit");
      } else if (name === "allowed_count" && values.unit === leave_type_hour_unit) {
        trigger("hour_allowed_in_day");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, trigger, clearErrors]);

  const unit = useWatch({ control, name: "unit" });
  const isCreditBased = useWatch({ control, name: "is_credit_based" });
  const monthlyAllowedCount = useWatch({ control, name: "monthly_allowed_count" });
  const allowCarryForward = useWatch({ control, name: "allowed_to_carry_forward" });
  const leaveTypeId = useWatch({ control, name: "id" });

  const onSubmit = async (formValues) => {
    const data = {
      ...(frozen
        ? {
            ...toFormValues(form_obj),
            status: formValues.status,
            carry_forward_limit: formValues.carry_forward_limit,
          }
        : formValues),
    };
    NUMBER_FIELDS.forEach((key) => {
      if (data[key] === "") data[key] = 0;
    });

    if (data.is_credit_based && data.monthly_allowed_count > 30) {
      toast.error("Monthly Allowed Count must not exceed 30");
    } else if (!data.is_credit_based && data.allowed_count > 365) {
      toast.error("Leave Days Count must not exceed 365");
    } else if (
      data.allowed_to_carry_forward &&
      data.carry_forward_limit >
        (data.is_credit_based
          ? (Number(data.monthly_allowed_count) || 0) * 12
          : data.allowed_count)
    ) {
      toast.error("Carry Forward Limit must not exceed Leave Days Count");
    } else if (data.unit === leave_type_hour_unit && data.hour_allowed_in_day === 0) {
      toast.error("Leave Hour Must not be 0");
    } else if (
      data.unit === leave_type_hour_unit &&
      Number(data.hour_allowed_in_day) > Number(data.allowed_count)
    ) {
      toast.error(
        "Leave Hour Allowed in a Day must not exceed Leave Hour Allowed in a Year",
      );
    } else {
      const payload = { ...data };

      if (data.is_credit_based) {
        payload.monthly_allowed_count = data.monthly_allowed_count;
        payload.allowed_count = 0;
      } else {
        payload.monthly_allowed_count = 0;
      }

      setIsSubmitting(true);
      const Api = await PostApi("/leave/leave_type/create/", payload, false);
      setIsSubmitting(false);
      if (Api.status && Api.status === 200) {
        if (data.id === 0) {
          dispatch(addLeaveType(Api?.data.data));
          SetLocalStorage("leave_types", Api?.data.data, 2);
        } else {
          dispatch(editLeaveType(Api?.data?.data));
          SetLocalStorage("leave_types", Api?.data.data, 3);
        }

        dispatch(toggleRSBView(false));
        toast.success(Api?.data?.message);
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail);
      }
    }
  };

  const isDayUnit = unit === leave_type_day_unit;
  const isHourUnit = unit === leave_type_hour_unit;

  return (
    <SidebarFormLayout
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={leaveTypeId > 0 ? "Update" : "Save"}
    >
      <FormSection title="Details">
        <FormTextField
          name="name"
          control={control}
          label="Name"
          placeholder="Casual"
          helperText="Enter Leave Type Name."
          required
          autoFocus
          disabled={frozen}
          maxLength={NAME_MAX}
          sanitize={sanitizeText}
          startIcon={<EventBusyOutlinedIcon fontSize="small" color="action" />}
        />
        <FormTextField
          name="description"
          control={control}
          label="Description"
          placeholder="Description (Optional)"
          multiline
          minRows={3}
          maxRows={6}
          disabled={frozen}
          maxLength={DESCRIPTION_MAX}
          sanitize={sanitizeText}
        />
        <FormToggleGroup
          name="unit"
          control={control}
          label="Unit"
          options={unitOptions}
          helperText="Select Leave Type Unit."
          color="success"
          required
          disabled={frozen}
        />
      </FormSection>

      <FormSection title="Allowance">
        {isDayUnit && (
          <Locked locked={frozen}>
            <FormSwitch
              name="is_credit_based"
              control={control}
              label="Credit Based Leave"
              description="Credit leave every month instead of once a year"
            />
          </Locked>
        )}

        {isDayUnit &&
          (isCreditBased ? (
            <FormTextField
              key="monthly_allowed_count"
              name="monthly_allowed_count"
              control={control}
              label="Leave Days Count (allowed in a month)"
              placeholder="Enter the number of leave days allowed in a month"
              helperText={`Equivalent to ${
                (Number(monthlyAllowedCount) || 0) * 12
              } days in a year (monthly × 12).`}
              disabled={frozen}
              {...countFieldProps}
            />
          ) : (
            <FormTextField
              key="allowed_count_days"
              name="allowed_count"
              control={control}
              label="Leave Days Count (allowed in a year)"
              placeholder="Enter the number of leave days allowed in a year"
              helperText="Please Enter Leave Days Allowed in a year."
              disabled={frozen}
              {...countFieldProps}
            />
          ))}

        {isHourUnit && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                key="allowed_count_hours"
                name="allowed_count"
                control={control}
                label="Leave Hour (allowed in a year)"
                placeholder="Year"
                helperText="Please Enter Leave Hour Allowed in a year."
                disabled={frozen}
                {...countFieldProps}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="hour_allowed_in_day"
                control={control}
                label="Leave Hour (allowed in a day)"
                placeholder="Day"
                helperText="Please Enter Leave Hour Allowed in a day."
                disabled={frozen}
                {...countFieldProps}
              />
            </Grid>
          </Grid>
        )}

        <FormAutocomplete
          name="reset_type"
          control={control}
          label="Reset"
          placeholder="Select reset period"
          helperText="Please Select Reset Leave."
          options={leave_reset_options}
          required
          disabled={frozen}
        />
      </FormSection>

      <FormSection title="Applicability">
        <FormAutocomplete
          name="ws_id"
          control={control}
          label="Applicable For Workschedule"
          placeholder="Select work schedules"
          helperText="Please select associate work schedule."
          options={ws_options}
          multiple
          required
          disabled={frozen}
        />
        <FormAutocomplete
          name="role_id"
          control={control}
          label="Applicable For Role"
          placeholder="Select roles"
          helperText="Select applicable roles."
          options={role_options}
          multiple
          required
          disabled={frozen}
        />
        <FormAutocomplete
          name="genders"
          control={control}
          label="Gender"
          placeholder="Select genders"
          helperText="Please select applicable Gender."
          options={gender_options}
          multiple
          required
          disabled={frozen}
        />
      </FormSection>

      {isDayUnit && (
        <FormSection title="Rules">
          <Locked locked={frozen}>
            <FormSwitch
              name="weekend_between_leave"
              control={control}
              label="Weekend Between Leave"
              description="Count weekends that fall between leave days"
            />
          </Locked>
          <Locked locked={frozen}>
            <FormSwitch
              name="holiday_between_leave"
              control={control}
              label="Holiday Between Leave"
              description="Count holidays that fall between leave days"
            />
          </Locked>
          <Locked locked={frozen}>
            <FormSwitch
              name="allowed_to_carry_forward"
              control={control}
              label="Allow Carry Forward"
              description="Unused leave moves to the next cycle"
            />
          </Locked>
          {allowCarryForward && (
            <FormTextField
              name="carry_forward_limit"
              control={control}
              label="Carry Forward Limit"
              helperText="Enter maximum carry forward limit."
              {...countFieldProps}
            />
          )}
          {leaveTypeId > 0 && (
            <FormSwitch
              name="status"
              control={control}
              label="Status"
              description="Inactive leave types cannot be applied for"
            />
          )}
        </FormSection>
      )}
    </SidebarFormLayout>
  );
};

export default LeaveTypeForm;
