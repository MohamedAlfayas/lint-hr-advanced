import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  Autocomplete,
  Button,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import {
  addContacts,
  editContacts,
} from "../../../redux/reducers/ChildReducer/ContactsReducer";
import { phoneTypes } from "../../../common/constant/Constants";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import {
  FormAutocomplete,
  FormCheckbox,
  FormSection,
  FormTextField,
} from "../../../shared/ui/form";
import { testId, itemTestKey } from "../../../shared/testing/testId";

// register lottie and define custom element
defineElement(loadAnimation);

const schema = Yup.object({
  name: Yup.string().required("Please Enter Customer  Name"),
  project_number: Yup.string().required("Please Enter Project Number"),
  email: Yup.string()
    .email("Please Enter Valid Email")
    .required("Please Enter Email"),
});

const toFormValues = (obj) => ({
  name: obj?.name ?? "",
  email: obj?.email ?? "",
  phone_numbers: obj?.phone_numbers ?? [],
  description: obj?.description ?? "",
  project_number: obj?.project_number ?? "",
});

const hasIncompletePhone = (phones) =>
  (phones || []).some(
    (phone) => String(phone.number ?? "").trim() === "" || !phone.type,
  );

const ContactsForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const { contacts_data } = useSelector((state) => state.ContactsReducer);

  const { control, handleSubmit, reset, getValues } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phone_numbers",
    keyName: "_key",
  });

  useEffect(() => {
    if (form_obj) {
      reset(toFormValues(form_obj));
    }
  }, [form_obj, reset]);

  const handleAddPhoneNumber = () => {
    const phones = getValues("phone_numbers") || [];
    if (hasIncompletePhone(phones)) {
      toast.error("Please fill the fields.");
      return;
    }
    append({
      number: "",
      type: "",
      primary: false,
      id: 0,
      row_id: phones.length ? phones[phones.length - 1].row_id + 1 : 1,
    });
  };

  const onSubmit = (values) => {
    if (hasIncompletePhone(values.phone_numbers)) {
      toast.error("Please fill the fields.");
      return;
    }

    const finalValues = { ...form_obj, ...values };
    if (form_obj?.id === 0) {
      const id = contacts_data?.length
        ? contacts_data[contacts_data.length - 1].id + 1
        : 1;
      dispatch(addContacts({ ...finalValues, id: id }));
    } else {
      dispatch(editContacts(finalValues));
    }
  };

  return (
    <SidebarFormLayout onSubmit={handleSubmit(onSubmit)}>
      <FormSection title="Details">
        <FormTextField
          name="name"
          control={control}
          label="Customer name"
          placeholder="Customer Name"
          required
          autoFocus
          helperText="Enter Customer Name."
          startIcon={<PersonOutlineIcon fontSize="small" color="action" />}
        />
        <FormTextField
          name="email"
          control={control}
          label="Email"
          placeholder="Enter Email"
          type="email"
          required
          helperText="Enter Email."
          startIcon={<AlternateEmailIcon fontSize="small" color="action" />}
        />
        <Autocomplete
          options={[]}
          noOptionsText="No contact groups"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Contact groups"
              placeholder="Select contact group"
              required
            />
          )}
        />
      </FormSection>

      <FormSection
        title="Phone numbers"
        action={
          <Button data-testid="contact-add-button" size="small" startIcon={<AddIcon />} onClick={handleAddPhoneNumber}>
            Add
          </Button>
        }
      >
        {fields.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No phone numbers added.
          </Typography>
        )}
        <Stack spacing={1.5}>
          {fields.map((item, index) => (
            <Paper key={item._key} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid size={{ xs: 12, sm: 5 }}>
                  <FormAutocomplete
                    name={`phone_numbers.${index}.type`}
                    control={control}
                    label="Type"
                    placeholder="Select type"
                    size="small"
                    options={phoneTypes}
                    getOptionValue={(o) => o?.value}
                    disableClearable
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <FormTextField
                    name={`phone_numbers.${index}.number`}
                    control={control}
                    label="Contact number"
                    placeholder="Enter contact number"
                    type="number"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <FormCheckbox
                      name={`phone_numbers.${index}.primary`}
                      control={control}
                      label="Primary"
                    />
                    <IconButton
                      data-testid={testId("contact-remove-phone-number", itemTestKey(item), "button")}
                      color="error"
                      size="small"
                      onClick={() => remove(index)}
                      aria-label="Remove phone number"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>
      </FormSection>

      <FormSection title="Project">
        <FormTextField
          name="project_number"
          control={control}
          label="Project number"
          placeholder="Project Number"
          required
          helperText="Enter Your Project Number.."
        />
        <FormTextField
          name="description"
          control={control}
          label="Description"
          placeholder="Add a short note (optional)"
          multiline
          minRows={3}
          maxRows={6}
        />
      </FormSection>
    </SidebarFormLayout>
  );
};

export default ContactsForm;
