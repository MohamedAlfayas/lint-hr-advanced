import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Alert, Typography } from "@mui/material";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import {
  FormAutocomplete,
  FormCheckbox,
  FormSection,
  FormTextField,
} from "../../../shared/ui/form";

const benefitPlans = [
  "National Pension Scheme",
  "Other Non-Taxable Deduction",
].map((item) => ({ id: item, label: item }));

const investments = [
  { group: "80C", items: ["Life Insurance Premium", "Public Provident Fund", "Unit-linked insurance plan", "ELSS Tax Saving Mutual Fund"] },
  { group: "80D", items: ["Medi Claim Policy for self, spouse, children - 80D"] },
].flatMap(({ group, items }) => items.map((item) => ({ id: item, label: item, group })));

const schema = Yup.object({
  benefit_plan: Yup.string().nullable(),
  investment: Yup.string().nullable(),
  name_in_payslip: Yup.string(),
  include_employer_contribution: Yup.boolean(),
  superannuation: Yup.boolean(),
  pro_rata: Yup.boolean(),
  mark_active: Yup.boolean(),
});

const defaultValues = {
  benefit_plan: null,
  investment: null,
  name_in_payslip: "",
  include_employer_contribution: false,
  superannuation: false,
  pro_rata: false,
  mark_active: true,
};

const BenfitsForm = () => {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues,
  });

  const onSubmit = () => {};

  return (
    <SidebarFormLayout
      onSubmit={handleSubmit(onSubmit)}
      footerStart={
        <Typography variant="caption" color="error">
          * indicates mandatory fields
        </Typography>
      }
    >
      <FormSection title="Benefit">
        <FormAutocomplete
          name="benefit_plan"
          control={control}
          label="Benefit Plan"
          placeholder="Select a Benefit Plan"
          options={benefitPlans}
        />
        <FormAutocomplete
          name="investment"
          control={control}
          label="Associate this benefit with"
          placeholder="Select an Investment"
          options={investments}
          groupBy={(o) => o.group}
        />
        <FormTextField
          name="name_in_payslip"
          control={control}
          label="Name in Payslip"
          required
        />
      </FormSection>

      <FormSection title="Configuration" spacing={0.5}>
        <FormCheckbox
          name="include_employer_contribution"
          control={control}
          label="Include employer's contribution in employee’s salary structure."
        />
        <FormCheckbox
          name="superannuation"
          control={control}
          label="Consider this a superannuation fund"
        />
        <FormCheckbox
          name="pro_rata"
          control={control}
          label="Calculate on pro-rata basis"
          helperText="Pay will be adjusted based on employee working days."
        />
        <FormCheckbox name="mark_active" control={control} label="Mark this as Active" />
      </FormSection>

      <Alert severity="warning" variant="outlined">
        <strong>Note:</strong> Once you associate this benefits with an employee, you will only
        be able to edit the Name in Payslip.
      </Alert>
    </SidebarFormLayout>
  );
};

export default BenfitsForm;
