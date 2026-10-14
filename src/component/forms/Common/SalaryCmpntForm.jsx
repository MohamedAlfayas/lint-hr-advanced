import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Alert, Typography } from "@mui/material";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import {
  FormCheckbox,
  FormSection,
  FormSwitch,
  FormTextField,
  FormToggleGroup,
} from "../../../shared/ui/form";

const earningTypeOptions = [
  { id: "1", label: "Basic" },
  { id: "2", label: "HRA" },
  { id: "3", label: "Special Allowance" },
  { id: "4", label: "Bonus" },
];

const earningTypeInfo = {
  "1": "Fixed amount paid at the end of every month.",
  "2": "House Rent Allowance — tax exempt up to certain limits.",
  "3": "Flexible allowance paid as part of gross salary.",
  "4": "Performance or seasonal bonus paid to employees.",
};

const calculationTypeOptions = [
  { id: "flat", label: "Flat Amount" },
  { id: "percentage", label: "Percentage of CTC" },
];

const epfModeOptions = [
  { id: "always", label: "Always" },
  { id: "pf_wage", label: "Only when PF Wage is less than ₹ 15,000" },
];

const schema = Yup.object({
  earning_type: Yup.string(),
  name: Yup.string().trim().required("Please enter earning name"),
  name_in_payslip: Yup.string().trim().required("Please enter name in payslip"),
  calculation_type: Yup.string(),
  amount: Yup.number().when("calculation_type", {
    is: "flat",
    then: (s) =>
      s
        .typeError("Please enter amount")
        .min(1, "Amount must be greater than 0")
        .required("Please enter amount"),
  }),
  percentage: Yup.number().when("calculation_type", {
    is: "percentage",
    then: (s) =>
      s
        .typeError("Please enter percentage")
        .min(0.01, "Percentage must be greater than 0")
        .max(100, "Percentage cannot exceed 100")
        .required("Please enter percentage"),
  }),
  mark_active: Yup.boolean(),
  salary_structure: Yup.boolean(),
  tax: Yup.boolean(),
  pro_rata: Yup.boolean(),
  epf: Yup.boolean(),
  epf_mode: Yup.string(),
  esi: Yup.boolean(),
  show_in_payslip: Yup.boolean(),
});

const toFormValues = (obj) => ({
  earning_type: obj?.earning_type || "1",
  name: obj?.name || "",
  name_in_payslip: obj?.name_in_payslip || "",
  calculation_type: obj?.calculation_type || "flat",
  amount: obj?.amount || 0,
  percentage: obj?.percentage || 0,
  mark_active: obj?.mark_active || false,
  salary_structure: obj?.salary_structure ?? true,
  tax: obj?.tax ?? true,
  pro_rata: obj?.pro_rata ?? true,
  epf: obj?.epf ?? true,
  epf_mode: obj?.epf_mode || "always",
  esi: obj?.esi ?? true,
  show_in_payslip: obj?.show_in_payslip ?? true,
});

const SalaryCmpntForm = () => {
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const contributionOptions = useMemo(() => {
    const options = [];
    if (form_obj?.contribute?.length > 0) {
      if (form_obj.contribute[0].esi?.is_active)
        options.push({ id: "1", label: "ESI", value: "ESI" });
      if (form_obj.contribute[0].epf?.is_active)
        options.push({ id: "2", label: "EPF", value: "EPF" });
    }
    return options;
  }, [form_obj]);

  const hasEPF = contributionOptions.some((o) => o.value === "EPF");
  const hasESI = contributionOptions.some((o) => o.value === "ESI");

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  const [earningType, calculationType, epf] = useWatch({
    control,
    name: ["earning_type", "calculation_type", "epf"],
  });

  const onSubmit = async (values) => {
    console.log("Form submitted:", values);
    // dispatch(setLoaderVisible(true));
    // const Api = await PostApi("salary-component/create/", values, false);
    // if (Api.status === 200) {
    //   dispatch(toggleRSBView(false));
    //   toast.success(Api?.data?.message);
    // } else {
    //   toast.error(Api?.data?.message || Api?.data?.detail);
    // }
    // dispatch(setLoaderVisible(false));
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
      <FormSection title="Earning type">
        <FormToggleGroup
          name="earning_type"
          control={control}
          options={earningTypeOptions}
          required
        />
        {earningTypeInfo[earningType] && (
          <Alert severity="info" variant="outlined">
            {earningTypeInfo[earningType]}
          </Alert>
        )}
      </FormSection>

      <FormSection title="Details">
        <FormTextField
          name="name"
          control={control}
          label="Earning Name"
          placeholder="Enter earning name"
          required
          autoFocus
        />
        <FormTextField
          name="name_in_payslip"
          control={control}
          label="Name in Payslip"
          placeholder="Enter name as shown in payslip"
          required
        />
      </FormSection>

      <FormSection title="Calculation">
        <FormToggleGroup
          name="calculation_type"
          control={control}
          label="Calculation Type"
          options={calculationTypeOptions}
          required
        />
        {calculationType === "flat" ? (
          <FormTextField
            key="amount"
            name="amount"
            control={control}
            label="Enter Amount"
            type="number"
            startIcon="₹"
            slotProps={{ htmlInput: { min: 0 } }}
          />
        ) : (
          <FormTextField
            key="percentage"
            name="percentage"
            control={control}
            label="Percentage (%)"
            type="number"
            startIcon="%"
            slotProps={{ htmlInput: { min: 0, max: 100, step: 0.01 } }}
          />
        )}
        <FormCheckbox name="mark_active" control={control} label="Mark this as Active" />
      </FormSection>

      <FormSection title="Other configurations" spacing={1.5}>
        <FormSwitch
          name="salary_structure"
          control={control}
          label="Part of salary structure"
          description="Make this earning a part of the employee's salary structure"
        />
        <FormSwitch
          name="tax"
          control={control}
          label="This is a taxable earning"
          description="The income tax amount will be divided equally and deducted every month across the financial year."
        />
        <FormSwitch
          name="pro_rata"
          control={control}
          label="Calculate on pro-rata basis"
          description="Pay will be adjusted based on employee working days."
        />
        {hasEPF && (
          <FormSwitch
            name="epf"
            control={control}
            label="Consider for EPF Contribution"
          />
        )}
        {hasEPF && epf && (
          <FormToggleGroup
            name="epf_mode"
            control={control}
            label="EPF contribution applies"
            options={epfModeOptions}
          />
        )}
        {hasESI && (
          <FormSwitch
            name="esi"
            control={control}
            label="Consider for ESI Contribution"
          />
        )}
        <FormSwitch
          name="show_in_payslip"
          control={control}
          label="Show this component in payslip"
        />
      </FormSection>

      <Alert severity="warning" variant="outlined">
        <strong>Note:</strong> Once you associate this component with an employee, you will only
        be able to edit the Name and Amount/Percentage. The changes you make to Amount/Percentage
        will apply only to new employees.
      </Alert>
    </SidebarFormLayout>
  );
};

export default SalaryCmpntForm;
