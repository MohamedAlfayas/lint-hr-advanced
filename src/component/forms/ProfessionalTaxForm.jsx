import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Button, Grid, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SidebarFormLayout from "../../shared/ui/SidebarFormLayout";
import { FormSection, FormTextField, FormToggleGroup } from "../../shared/ui/form";
import { testId, itemTestKey } from "../../shared/testing/testId";

const deduction_cycle_option = [
  { id: "1", label: "Monthly", value: "Monthly" },
  { id: "2", label: "Quarterly", value: "Quarterly" },
  { id: "3", label: "Half-Yearly", value: "Half-Yearly" },
  { id: "4", label: "Annually", value: "Annually" },
];

const schema = Yup.object({
  state: Yup.string().nullable(),
  cycle_id: Yup.string().nullable(),
  range: Yup.array(),
});

const toFormValues = (obj) => ({
  state: obj?.state ?? "",
  cycle_id: obj?.cycle_id ?? null,
  range: obj?.range ?? [],
});

const ProfessionalTaxForm = () => {
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  // keyName keeps each slab's own `id` from being overwritten by RHF's row key
  const { fields, append, remove } = useFieldArray({
    control,
    name: "range",
    keyName: "_key",
  });

  const addRow = () => {
    append({ id: fields.length + 1, s: 0, e: 0, tax: 0 });
  };

  const deleteRow = () => {
    if (fields.length > 1) {
      remove(fields.length - 1);
    }
  };

  const saveData = () => {};

  return (
    <SidebarFormLayout onSubmit={handleSubmit(saveData)}>
      <FormTextField
        name="state"
        control={control}
        label="Location"
        placeholder="Tax State"
        disabled
        startIcon={<PlaceOutlinedIcon fontSize="small" color="action" />}
      />

      <FormToggleGroup
        name="cycle_id"
        control={control}
        label="Deduction Cycle"
        options={deduction_cycle_option}
        required
        helperText="Please select Deduction Cycle."
      />

      <FormSection
        title="Tax slabs"
        action={
          <Button data-testid="professional-tax-add-button" size="small" startIcon={<AddIcon />} onClick={addRow}>
            Add
          </Button>
        }
        spacing={1.5}
      >
        {fields.map((row, index) => (
          <Paper key={row._key} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <Grid container spacing={1.5} sx={{ flex: 1 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormTextField
                    name={`range.${index}.s`}
                    control={control}
                    label="Start"
                    type="number"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormTextField
                    name={`range.${index}.e`}
                    control={control}
                    label="End"
                    type="number"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormTextField
                    name={`range.${index}.tax`}
                    control={control}
                    label="Amount"
                    type="number"
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Stack sx={{ width: 40, alignItems: "center", pt: 0.25 }}>
                {index !== 0 && index === fields.length - 1 && (
                  <Tooltip title="Remove slab">
                    <IconButton data-testid={testId("professional-tax-delete-outline", itemTestKey(row), "button")} size="small" color="error" onClick={deleteRow}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </FormSection>
    </SidebarFormLayout>
  );
};

export default ProfessionalTaxForm;
