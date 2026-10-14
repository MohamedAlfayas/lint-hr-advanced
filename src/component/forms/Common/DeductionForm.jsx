import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Alert, Typography } from "@mui/material";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import {
  FormCheckbox,
  FormTextField,
  FormToggleGroup,
} from "../../../shared/ui/form";

const deduction_frequency_options = [
  { id: "one_time", label: "One-time deduction" },
  { id: "recurring", label: "Recurring for subsequent payrolls" },
];

const schema = Yup.object({
  name_in_payslip: Yup.string().trim().required("Please enter name in payslip"),
  deduction_frequency: Yup.string().required("Please select deduction frequency"),
  mark_active: Yup.boolean(),
});

const defaultValues = {
  name_in_payslip: "",
  deduction_frequency: "one_time",
  mark_active: true,
};

const DeductionForm = () => {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues,
  });

  const onSubmit = async (values) => {
    console.log("Form submitted:", values);
  };

  return (
    <SidebarFormLayout
      onSubmit={handleSubmit(onSubmit)}
      footerStart={
        <Typography variant="caption" color="error">
          * indicates mandatory fields
        </Typography>
      }
    >
      <FormTextField
        name="name_in_payslip"
        control={control}
        label="Name in Payslip"
        placeholder="Withheld Salary"
        required
        autoFocus
      />

      <FormToggleGroup
        name="deduction_frequency"
        control={control}
        label="Select the deduction frequency"
        options={deduction_frequency_options}
        required
      />

      <FormCheckbox name="mark_active" control={control} label="Mark this as Active" />

      <Alert severity="warning" variant="outlined">
        <strong>Note:</strong> Once you associate this benefits with an employee, you will only
        be able to edit the Name in Payslip. The change will be reflected in both new and
        existing employees.
      </Alert>
    </SidebarFormLayout>
  );
};

export default DeductionForm;
