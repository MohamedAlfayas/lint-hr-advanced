import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  editEarnings,
  setEarnings,
  setAllowances,
  setDeductions,
  editDeduction,
  editAllowance,
} from "../../../redux/reducers/ChildReducer/SalaryComponentsReducer";
import {
  allowances_module_name,
  deductions_module_name,
  earnings_module_name,
  payroll_policy_calculation_type,
  payroll_policy_period,
} from "../../../common/constant/Constants";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import {
  FormCheckbox,
  FormSection,
  FormTextField,
} from "../../../shared/ui/form";
import { testId, itemTestKey } from "../../../shared/testing/testId";

const schema = Yup.object({
  name: Yup.string().trim().required("Please Enter Name"),
});

const toFormValues = (obj) => ({
  ...obj,
  name: obj?.name ?? "",
  desc: obj?.desc ?? "",
  professional_tax: false,
  labour_welfare_fund: false,
});

const ComponentRows = ({
  items,
  module,
  valueInputType,
  onCalculationTypeChange,
  onTimePeriodChange,
  onRemove,
}) => (
  <Stack spacing={1.5}>
    {items
      .filter((d) => d.selected === true)
      .map((item, index) => (
        <Paper key={item.id ?? index} variant="outlined" sx={{ p: 1.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="body2" fontWeight={600}>
              {item.name}
            </Typography>
            <IconButton
              data-testid={testId("salary-policy-delete-outline", itemTestKey(item), "button")}
              size="small"
              color="error"
              onClick={() => onRemove(item?.id, module)}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <Autocomplete
                size="small"
                disableClearable
                options={payroll_policy_calculation_type}
                value={
                  payroll_policy_calculation_type.find(
                    (d) => d.id === item?.calculation_type,
                  ) || null
                }
                isOptionEqualToValue={(o, v) => o.id === v.id}
                onChange={(_, opt) =>
                  opt && onCalculationTypeChange(opt, item?.id, module)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Calculation type" />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                size="small"
                fullWidth
                type={valueInputType}
                label="Value"
                id={`additionalInput_${module}_${index}`}
                name={`additionalInput_${module}_${index}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Autocomplete
                size="small"
                disableClearable
                options={payroll_policy_period.filter(
                  (d) => d.calculation_type === item?.calculation_type,
                )}
                value={
                  payroll_policy_period.find(
                    (d) => d.id === item?.time_period,
                  ) || null
                }
                isOptionEqualToValue={(o, v) => o.id === v.id}
                onChange={(_, opt) =>
                  opt && onTimePeriodChange(opt, item?.id, module)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Period" />
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
  </Stack>
);

const ComponentPickerDialog = ({
  open,
  title,
  rows,
  module,
  onToggle,
  onClose,
  onSave,
}) => {
  const selectedCount = rows.filter((r) => r.selected).length;
  const allSelected = rows.length > 0 && selectedCount === rows.length;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={selectedCount > 0 && !allSelected}
                  onChange={(e) => onToggle(0, e.target.checked, module)}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Pro-rata</TableCell>
              <TableCell>Taxable</TableCell>
              <TableCell>Contribute to insurance &amp; fund</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={!!item.selected}
                    onChange={(e) => onToggle(item.id, e.target.checked, module)}
                  />
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.pro_rata ? "Yes" : "No"}</TableCell>
                <TableCell>{item.tac ? "Yes" : "No"}</TableCell>
                <TableCell>{item.insurance ? "Yes" : "No"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button data-testid="salary-policy-close-button" color="inherit" onClick={onClose}>
          Close
        </Button>
        <Button data-testid="salary-policy-save-button" variant="contained" color="success" onClick={onSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SalaryPoliciesForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const { earnings_data, allowances_data, deductions_data } = useSelector(
    (state) => state.SalaryComponentsReducer,
  );

  const [EarningsData, setEarningsData] = useState([]);
  const [AllowanceData, setAlowanceData] = useState([]);
  const [DeductionData, setDeductionData] = useState([]);

  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  const GetModuleData = (module) =>
    module === earnings_module_name
      ? earnings_data
      : module === allowances_module_name
        ? allowances_data
        : deductions_data;

  const DispatchModuleData = (module, changed_obj) => {
    module === earnings_module_name
      ? dispatch(editEarnings(changed_obj))
      : module === allowances_module_name
        ? dispatch(editAllowance(changed_obj))
        : dispatch(editDeduction(changed_obj));
  };

  const handleCalculationTypeChange = (e, id, module) => {
    const changed_obj = {
      ...GetModuleData(module).find((d) => d.id === id),
      calculation_type: e.value,
      time_period: 0,
    };
    DispatchModuleData(module, changed_obj);
  };

  const handleTimePeriodChange = (e, id, module) => {
    const changed_obj = {
      ...GetModuleData(module).find((d) => d.id === id),
      time_period: e.value,
    };
    DispatchModuleData(module, changed_obj);
  };

  const handleRemove = (id, module) => {
    const changed_obj = {
      ...GetModuleData(module).find((d) => d.id === id),
      selected: false,
    };
    DispatchModuleData(module, changed_obj);
  };

  const handleModuleCB = (id, checked, module) => {
    const module_data =
      module === earnings_module_name
        ? EarningsData
        : module === allowances_module_name
          ? AllowanceData
          : DeductionData;
    const updatedData = module_data.map((d) =>
      id === 0 || d.id === id
        ? { ...d, selected: checked, calculation_type: 1, time_period: 0 }
        : d,
    );
    module === earnings_module_name
      ? setEarningsData(updatedData)
      : module === allowances_module_name
        ? setAlowanceData(updatedData)
        : setDeductionData(updatedData);
  };

  // Salary policy save API is not wired yet; submit only validates.
  const onSubmit = () => {};

  const rowHandlers = {
    onCalculationTypeChange: handleCalculationTypeChange,
    onTimePeriodChange: handleTimePeriodChange,
    onRemove: handleRemove,
  };

  const selectButton = (onClick) => (
    <Button data-testid="salary-policy-select-components-button" size="small" startIcon={<AddIcon />} onClick={onClick}>
      Select components
    </Button>
  );

  return (
    <React.Fragment>
      <SidebarFormLayout onSubmit={handleSubmit(onSubmit)} submitLabel="Create">
        <FormSection title="Details">
          <FormTextField
            name="name"
            control={control}
            label="Name"
            placeholder="Name"
            helperText="Enter Name"
            required
            autoFocus
          />
          <FormTextField
            name="desc"
            control={control}
            label="Description"
            multiline
            minRows={3}
            maxRows={6}
          />
        </FormSection>

        <FormSection
          title="Earnings"
          action={selectButton(() => {
            setEarningsData(earnings_data);
            setShowEarningsModal(true);
          })}
        >
          <ComponentRows
            items={earnings_data}
            module={earnings_module_name}
            valueInputType="number"
            {...rowHandlers}
          />
        </FormSection>

        <FormSection
          title="Allowances"
          action={selectButton(() => {
            setAlowanceData(allowances_data);
            setShowAllowanceModal(true);
          })}
        >
          <ComponentRows
            items={allowances_data}
            module={allowances_module_name}
            valueInputType="text"
            {...rowHandlers}
          />
        </FormSection>

        <FormSection
          title="Deductions"
          action={selectButton(() => {
            setDeductionData(deductions_data);
            setShowDeductionModal(true);
          })}
        >
          <ComponentRows
            items={deductions_data}
            module={deductions_module_name}
            valueInputType="text"
            {...rowHandlers}
          />
        </FormSection>

        <FormSection title="Compliances">
          <Stack direction="row" spacing={1} alignItems="center">
            <InfoOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Compliances included ESI, EPF
            </Typography>
          </Stack>
          <Box>
            <FormCheckbox
              name="professional_tax"
              control={control}
              label="Profession Tax"
            />
            <FormCheckbox
              name="labour_welfare_fund"
              control={control}
              label="Labour Welfare Fund"
            />
          </Box>
        </FormSection>
      </SidebarFormLayout>

      <ComponentPickerDialog
        open={showEarningsModal}
        title="Select Earning Components"
        rows={EarningsData}
        module={earnings_module_name}
        onToggle={handleModuleCB}
        onClose={() => setShowEarningsModal(false)}
        onSave={() => {
          dispatch(setEarnings(EarningsData));
          setShowEarningsModal(false);
        }}
      />
      <ComponentPickerDialog
        open={showAllowanceModal}
        title="Select Allowance Components"
        rows={AllowanceData}
        module={allowances_module_name}
        onToggle={handleModuleCB}
        onClose={() => setShowAllowanceModal(false)}
        onSave={() => {
          dispatch(setAllowances(AllowanceData));
          setShowAllowanceModal(false);
        }}
      />
      <ComponentPickerDialog
        open={showDeductionModal}
        title="Select Deduction Components"
        rows={DeductionData}
        module={deductions_module_name}
        onToggle={handleModuleCB}
        onClose={() => setShowDeductionModal(false)}
        onSave={() => {
          dispatch(setDeductions(DeductionData));
          setShowDeductionModal(false);
        }}
      />
    </React.Fragment>
  );
};

export default SalaryPoliciesForm;
