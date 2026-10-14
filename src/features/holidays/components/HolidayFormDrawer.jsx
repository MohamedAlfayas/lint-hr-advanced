import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/material";
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import FormDrawer from "../../../shared/ui/FormDrawer";
import {
  FormAutocomplete,
  FormDatePicker,
  FormSwitch,
  FormTextField,
} from "../../../shared/ui/form";
import { getApiErrorMessage } from "../../../shared/api/axiosBaseQuery";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { useSaveHolidayMutation } from "../api/holidaysApi";
import {
  HOLIDAY_DESCRIPTION_MAX,
  HOLIDAY_MIN_DATE,
  HOLIDAY_NAME_MAX,
  holidayMaxDate,
  holidaySchema,
  sanitizeHolidayDescription,
  sanitizeHolidayName,
} from "../holidaySchema";

const FORM_ID = "holiday-form";

const toFormValues = (holiday, workSchedules) => ({
  name: holiday?.name ?? "",
  date: holiday?.date
    ? dayjs(holiday.date).format("YYYY-MM-DD")
    : dayjs().format("YYYY-MM-DD"),
  work_schedule_id_list:
    holiday?.work_schedule_id_list ?? workSchedules.map((ws) => ws.id),
  is_restricted: holiday?.is_restricted ?? false,
  description: holiday?.description ?? "",
});

/**
 * Create / edit holiday. `holiday === null` opens the create form.
 */
const HolidayFormDrawer = ({ open, holiday, onClose }) => {
  const isEdit = !!holiday?.id;
  const workSchedules = useMemo(
    () => (open ? GetLocalStorageData("work_schedule") || [] : []),
    [open],
  );
  const [saveHoliday, { isLoading }] = useSaveHolidayMutation();

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(holidaySchema),
    mode: "onTouched",
    defaultValues: toFormValues(holiday, workSchedules),
  });

  useEffect(() => {
    if (open) reset(toFormValues(holiday, workSchedules));
  }, [open, holiday, workSchedules, reset]);

  const onSubmit = async (values) => {
    try {
      const res = await saveHoliday({
        ...holiday,
        ...values,
        name: values.name.trim(),
        description: values.description.trim(),
        id: holiday?.id ?? 0,
      }).unwrap();
      toast.success(res?.message || `Holiday ${isEdit ? "updated" : "created"}`);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Holiday" : "New Holiday"}
      subtitle={
        isEdit
          ? "Update the holiday details and applicable shifts"
          : "Add a holiday to the company calendar"
      }
      formId={FORM_ID}
      submitLabel={isEdit ? "Update" : "Create"}
      isSubmitting={isLoading}
    >
      <Stack
        component="form"
        id={FORM_ID}
        noValidate
        spacing={2.5}
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormTextField
          name="name"
          control={control}
          label="Holiday name"
          placeholder="e.g. Independence Day"
          required
          autoFocus
          maxLength={HOLIDAY_NAME_MAX}
          sanitize={sanitizeHolidayName}
          startIcon={<CelebrationOutlinedIcon fontSize="small" color="action" />}
        />

        <FormDatePicker
          name="date"
          control={control}
          label="Date"
          required
          minDate={HOLIDAY_MIN_DATE}
          maxDate={holidayMaxDate()}
        />

        <FormAutocomplete
          name="work_schedule_id_list"
          control={control}
          label="Applicable work schedules"
          placeholder="Select work schedules"
          options={workSchedules}
          multiple
          required
          helperText="Employees on these shifts will get this holiday"
        />

        <FormSwitch
          name="is_restricted"
          control={control}
          label="Restricted holiday"
          description="Optional holiday employees can choose to take"
          color="info"
        />

        <FormTextField
          name="description"
          control={control}
          label="Description"
          placeholder="Add a short note (optional)"
          multiline
          minRows={3}
          maxRows={6}
          maxLength={HOLIDAY_DESCRIPTION_MAX}
          sanitize={sanitizeHolidayDescription}
        />
      </Stack>
    </FormDrawer>
  );
};

export default HolidayFormDrawer;
