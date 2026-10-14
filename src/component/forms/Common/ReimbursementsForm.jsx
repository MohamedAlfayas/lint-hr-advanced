import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Alert, Typography } from "@mui/material";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import {
  FormAutocomplete,
  FormCheckbox,
  FormSection,
  FormTextField,
  FormToggleGroup,
} from "../../../shared/ui/form";

const reimbursementTypes = [
  "Entertainment Reimbursement",
  "Gadget Reimbursement",
  "Books and Periodicals Reimbursement",
  "Business Development Expense Reimbursement",
  "Helper Reimbursement",
].map((item) => ({ id: item, label: item }));

const carryForwardOptions = [
  {
    id: "yearly",
    label: "Carry forward",
    description: "Carry forward and encash at the end of the fiscal year",
  },
  {
    id: "monthly",
    label: "Encash monthly",
    description: "Do not carry forward and encash monthly",
  },
];

const schema = Yup.object({
  reimbursement_type: Yup.string().nullable(),
  name_in_payslip: Yup.string(),
  is_fbp: Yup.boolean(),
  carry_forward: Yup.string(),
  amount: Yup.mixed(),
  mark_active: Yup.boolean(),
});

const defaultValues = {
  reimbursement_type: null,
  name_in_payslip: "",
  is_fbp: false,
  carry_forward: "yearly",
  amount: 0,
  mark_active: false,
};

const blockInvalidAmountKeys = (e) => {
  if (e.key === "-" || e.key === "e") {
    e.preventDefault();
  }
};

const ReimbursementsForm = () => {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues,
  });

  const carryForward = useWatch({ control, name: "carry_forward" });

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
      <FormSection title="Reimbursement">
        <FormAutocomplete
          name="reimbursement_type"
          control={control}
          label="Reimbursement Type"
          placeholder="Select"
          options={reimbursementTypes}
        />
        <FormTextField
          name="name_in_payslip"
          control={control}
          label="Name in Payslip"
          required
        />
        <FormCheckbox
          name="is_fbp"
          control={control}
          label="Include this as a Flexible Benefit Plan component"
          helperText="FBP allows your employees to personalise their salary structure by choosing how much they want to receive under each FBP component."
        />
      </FormSection>

      <FormSection title="Payout">
        <FormToggleGroup
          name="carry_forward"
          control={control}
          label="How do you want to handle unclaimed reimbursement?"
          options={carryForwardOptions}
          helperText={carryForwardOptions.find((o) => o.id === carryForward)?.description}
        />
        <FormTextField
          name="amount"
          control={control}
          label="Enter Amount"
          required
          type="number"
          sanitize={(v) => v.replace(/-/g, "")}
          startIcon="₹"
          endIcon={
            <Typography variant="body2" color="text.secondary" noWrap>
              per month
            </Typography>
          }
          slotProps={{
            htmlInput: { min: 0, step: 1, onKeyDown: blockInvalidAmountKeys },
          }}
        />
        <FormCheckbox name="mark_active" control={control} label="Mark this as Active" />
      </FormSection>

      <Alert severity="warning" variant="outlined">
        <strong>Note:</strong> Once you associate this component with an employee, you will only
        be able to edit the Name in Payslip and Amount. The changes you make to Amount will apply
        only to new employees.
      </Alert>
    </SidebarFormLayout>
  );
};

export default ReimbursementsForm;
