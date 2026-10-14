import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Box, Grid } from "@mui/material";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import MarkunreadMailboxOutlinedIcon from "@mui/icons-material/MarkunreadMailboxOutlined";
import { timzone_options } from "../../../common/constant/Constants";
import CountryList, { countriesWithStates } from "../../../common/data/CountryList";
import LocationSearch from "../../../pages/organization/LocationSearch";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import {
  FormAutocomplete,
  FormSection,
  FormTextField,
} from "../../../shared/ui/form";
import useLocationSearchBridge from "./useLocationSearchBridge";

const ACCURATE_ADDRESS_MAX = 200;

const schema = Yup.object({
  name: Yup.string().required("Please Enter Location Name"),
  address: Yup.string().required("Please Enter Address"),
  country: Yup.string().required("Please Select Country"),
  state: Yup.string().required("Please Select State"),
  city: Yup.string().required("Please Enter City"),
  pincode: Yup.string().required("Please Enter Pincode"),
  timezone: Yup.string().required("Please Select Time Zone"),
  accurate_address: Yup.string()
    .required("Please Enter Accurate Address")
    .max(
      ACCURATE_ADDRESS_MAX,
      `Accurate Address cannot exceed ${ACCURATE_ADDRESS_MAX} characters`,
    ),
});

const optionValue = (o) => o?.value;

const countryOptions = countriesWithStates.map((d) => ({
  ...d,
  label: d.countryName,
  value: d.countryName,
}));

const toFormValues = (obj) => ({
  ...obj,
  name: obj?.name ?? "",
  address: obj?.address ?? "",
  country: obj?.country ?? "",
  state: obj?.state ?? "",
  city: obj?.city ?? "",
  pincode: obj?.pincode != null ? String(obj.pincode) : "",
  timezone: obj?.timezone ?? "",
  accurate_address: obj?.accurate_address ?? "",
});

const BranchLocationForm = () => {
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const { control, handleSubmit, reset, setValue, setError, trigger } =
    useForm({
      resolver: yupResolver(schema),
      mode: "onTouched",
      defaultValues: toFormValues(form_obj),
    });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  const { locationObj, setLocationObj, LocationFormikForm } =
    useLocationSearchBridge({ control, setValue, setError, trigger });

  const country = useWatch({ control, name: "country" });
  const stateOptions = useMemo(
    () => CountryList.find((d) => d.countryName === country)?.states || [],
    [country],
  );

  // Branch location save API is not wired yet; submit only validates.
  const onSubmit = () => {};

  return (
    <SidebarFormLayout onSubmit={handleSubmit(onSubmit)} submitLabel="Save">
      <FormSection title="Location">
        <FormTextField
          name="name"
          control={control}
          label="Location"
          placeholder="Enter Name"
          helperText="Enter Your Location Name."
          required
          autoFocus
          startIcon={<ApartmentOutlinedIcon fontSize="small" color="action" />}
        />
        <Box>
          <LocationSearch
            locationObj={locationObj}
            setLocationObj={setLocationObj}
            LocationFormikForm={LocationFormikForm}
          />
        </Box>
      </FormSection>

      <FormSection title="Address">
        <FormTextField
          name="address"
          control={control}
          label="Address"
          helperText="Address."
          required
          multiline
          minRows={2}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormAutocomplete
              name="country"
              control={control}
              label="Country"
              placeholder="Select country"
              helperText="Enter Country."
              options={countryOptions}
              getOptionValue={optionValue}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormAutocomplete
              name="state"
              control={control}
              label="State"
              placeholder="Select state"
              helperText="Select State."
              options={stateOptions}
              getOptionValue={optionValue}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="city"
              control={control}
              label="City"
              placeholder="City"
              helperText="Select City."
              required
              fullWidth
              startIcon={
                <LocationCityOutlinedIcon fontSize="small" color="action" />
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="pincode"
              control={control}
              label="Pincode"
              placeholder="666666"
              helperText="Pincode."
              required
              fullWidth
              slotProps={{ htmlInput: { inputMode: "numeric" } }}
              sanitize={(v) => v.replace(/[^0-9]/g, "")}
              startIcon={
                <MarkunreadMailboxOutlinedIcon fontSize="small" color="action" />
              }
            />
          </Grid>
        </Grid>
        <FormAutocomplete
          name="timezone"
          control={control}
          label="Time Zone"
          placeholder="Select a time zone"
          helperText="Time Zone."
          options={timzone_options}
          getOptionValue={optionValue}
          required
        />
      </FormSection>
    </SidebarFormLayout>
  );
};

export default BranchLocationForm;
