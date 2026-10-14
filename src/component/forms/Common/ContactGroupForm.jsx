import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import {
  addContactGroup,
  editContactGroup,
} from "../../../redux/reducers/ChildReducer/ContactGroupReducer";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import { FormSection, FormTextField } from "../../../shared/ui/form";

// register lottie and define custom element
defineElement(loadAnimation);

const schema = Yup.object({
  name: Yup.string().required("Please Enter Status  Name"),
  domain: Yup.string().required("Please Enter Domain  Name"),
});

const toFormValues = (obj) => ({
  name: obj?.name ?? "",
  description: obj?.description ?? "",
  domain: obj?.domain ?? "",
});

const ContactGroupForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const { contact_group_data } = useSelector(
    (state) => state.ContactGroupReducer,
  );

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  useEffect(() => {
    if (form_obj) {
      reset(toFormValues(form_obj));
    }
  }, [form_obj, reset]);

  const onSubmit = (values) => {
    const finalValues = { ...form_obj, ...values };
    if (form_obj?.id === 0) {
      const id = contact_group_data?.length
        ? contact_group_data[contact_group_data.length - 1].id + 1
        : 1;
      dispatch(addContactGroup({ ...finalValues, id: id }));
    } else {
      dispatch(editContactGroup(finalValues));
    }
  };

  return (
    <SidebarFormLayout onSubmit={handleSubmit(onSubmit)}>
      <FormSection title="Details">
        <FormTextField
          name="name"
          control={control}
          label="Contact group name"
          placeholder="Status Name"
          required
          autoFocus
          helperText="Enter Contact Group Name."
          startIcon={<GroupsOutlinedIcon fontSize="small" color="action" />}
        />
        <FormTextField
          name="domain"
          control={control}
          label="Domain"
          placeholder="Domain"
          required
          helperText="Enter Domain Name."
          startIcon={<LanguageOutlinedIcon fontSize="small" color="action" />}
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

export default ContactGroupForm;
