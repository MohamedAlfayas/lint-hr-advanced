import React, { useMemo, useState } from "react";
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CountryList from "../../../common/data/CountryList";
import { FormTextField } from "../../../shared/ui/form";
import { sanitizePhone } from "./employeeFormSchema";
import { testId, useFieldTestId } from "../../../shared/testing/testId";

/** Phone number input with a country-code menu in the start adornment. */
const ContactNumberField = ({ control, country, onCountryChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const baseId = useFieldTestId("contact_number");
  const countries = useMemo(
    () =>
      CountryList.filter((c) => c.countryCode).sort((a, b) =>
        a.countryName.localeCompare(b.countryName),
      ),
    [],
  );

  return (
    <>
      <FormTextField
        name="contact_number"
        control={control}
        label="Contact number"
        required
        placeholder="Enter number"
        helperText="Enter contact number (10 digits only)."
        sanitize={sanitizePhone}
        slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 10 } }}
        startIcon={
          <Button
            size="small"
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            endIcon={<ArrowDropDownIcon />}
            sx={{ minWidth: 0, px: 0.75, ml: -0.75, textTransform: "none" }}
            data-testid={`${baseId}-country-code-trigger`}
          >
            {country?.flagImg && (
              <img src={country.flagImg} alt="country flag" height="16" />
            )}
            <Box
              component="span"
              sx={{ ml: 0.75, color: "text.secondary" }}
              data-testid={`${baseId}-country-code-selected-value`}
            >
              {country?.countryCode}
            </Box>
          </Button>
        }
      />
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { maxHeight: 280, width: 280 } } }}
      >
        {countries.map((item) => (
          <MenuItem
            key={`${item.countryName}-${item.countryCode}`}
            selected={item.countryName === country?.countryName}
            data-testid={testId(baseId, "country-code-option", item.countryName)}
            onClick={() => {
              onCountryChange(item);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <img src={item.flagImg} alt="country flag" height="16" />
            </ListItemIcon>
            <ListItemText primary={item.countryName} />
            <Typography variant="caption" color="text.secondary">
              {item.countryCode}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ContactNumberField;
