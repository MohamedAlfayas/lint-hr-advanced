import React from "react";
import { Avatar, Box, IconButton, Stack, Tooltip } from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import DummyUserImg from "../../../assets/images/users/user.png";

const ProfilePhotoField = ({ src, onChange }) => (
  <Stack alignItems="center">
    <Box sx={{ position: "relative" }}>
      <Avatar
        src={src || DummyUserImg}
        alt="user-profile"
        sx={{ width: 96, height: 96, border: 3, borderColor: "background.paper", boxShadow: 2 }}
      />
      <Tooltip title="Change photo">
        <IconButton
          component="label"
          size="small"
          aria-label="Change photo"
          data-testid="employee-profile-photo-upload-button"
          sx={{
            position: "absolute",
            right: -2,
            bottom: -2,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            boxShadow: 1,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <PhotoCameraOutlinedIcon fontSize="small" />
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={onChange}
            data-testid="employee-profile-photo-file-input"
          />
        </IconButton>
      </Tooltip>
    </Box>
  </Stack>
);

export default ProfilePhotoField;
