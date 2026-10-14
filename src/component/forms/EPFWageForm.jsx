import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Grid, Paper, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import SidebarFormLayout from "../../shared/ui/SidebarFormLayout";
import { FormSection, FormToggleGroup } from "../../shared/ui/form";

const deduction_cycle_option = [
  { id: "1", label: "Monthly", value: "Monthly" },
  { id: "2", label: "Weekly", value: "Weekly" },
];

const epf_methods = [
  {
    id: "1",
    label: "Method 1",
    employee: "12% of Actual PF Wage",
    employer: "12% of Actual PF Wage",
  },
  {
    id: "2",
    label: "Method 2",
    employee: "12% of Actual PF Wage",
    employer: "3.67% of PF Wage restricted at ₹ 15000",
  },
  {
    id: "3",
    label: "Method 3",
    employee: "12% of PF Wage restricted at ₹ 15000",
    employer: "3.67% of PF Wage restricted at ₹ 15000",
  },
];

const schema = Yup.object({
  epf_type_id: Yup.string().nullable(),
  epf_method: Yup.string().nullable(),
});

const toFormValues = (obj) => ({
  epf_type_id: obj?.epf_type_id ?? null,
  epf_method: obj ? "1" : null,
});

const EPFWageForm = () => {
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  const onSubmit = () => {};

  return (
    <SidebarFormLayout onSubmit={handleSubmit(onSubmit)} hideSubmit>
      <FormToggleGroup
        name="epf_type_id"
        control={control}
        label="Deduction Cycle"
        options={deduction_cycle_option}
        required
        helperText="Please select deduction cycle."
      />

      <FormSection title="EPF contribution method">
        <Controller
          name="epf_method"
          control={control}
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
            >
              <Stack spacing={1.5}>
                {epf_methods.map((method) => {
                  const checked = field.value === method.id;
                  return (
                    <Paper
                      key={method.id}
                      variant="outlined"
                      component="label"
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        borderRadius: 2,
                        transition: "border-color .15s ease, background-color .15s ease",
                        ...(checked && {
                          borderColor: "primary.main",
                          bgcolor: (t) => `${t.palette.primary.main}0d`,
                        }),
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Radio size="small" value={method.id} sx={{ p: 0.5 }} />
                        <Typography variant="body2" fontWeight={600}>
                          {method.label}
                        </Typography>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Employee's Contribution
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {method.employee}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Employer's Contribution
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {method.employer}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                })}
              </Stack>
            </RadioGroup>
          )}
        />
      </FormSection>
    </SidebarFormLayout>
  );
};

export default EPFWageForm;
