import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { generateOfferLetterPreview } from "../../common/pdf/offerLetterTemplate";
import { testId } from "../../shared/testing/testId";

const formatDate = (value) => (value && dayjs(value).isValid() ? dayjs(value).format("DD MMM YYYY") : "");

const Section = ({ icon, title, children }) => (
  <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={(theme) => ({ px: 2, py: 1.25, bgcolor: alpha(theme.palette.primary.main, 0.04), borderBottom: 1, borderColor: "divider" })}
    >
      <Box sx={{ color: "primary.main", display: "flex", "& svg": { fontSize: 20 } }}>{icon}</Box>
      <Typography variant="subtitle2" fontWeight={700}>
        {title}
      </Typography>
    </Stack>
    <Box sx={{ p: 2.5 }}>{children}</Box>
  </Box>
);

const Field = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25, whiteSpace: "pre-line", color: value ? "text.primary" : "text.disabled" }}>
      {value || "Not provided"}
    </Typography>
  </Box>
);

const ImagePreview = ({ label, src, editing, onChange }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
      {label}
    </Typography>
    <Box
      sx={{
        mt: 0.75,
        height: 96,
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "divider",
        bgcolor: "action.hover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {src ? (
        <Box component="img" src={src} alt={label} sx={{ maxHeight: "80%", maxWidth: "90%", objectFit: "contain" }} />
      ) : (
        <Stack alignItems="center" spacing={0.5} sx={{ color: "text.disabled" }}>
          <ImageOutlinedIcon />
          <Typography variant="caption">Not uploaded</Typography>
        </Stack>
      )}
    </Box>
    {editing && (
      <Button
        component="label"
        size="small"
        startIcon={<CloudUploadOutlinedIcon />}
        sx={{ mt: 1, textTransform: "none" }}
        data-testid={testId("employee-document", label, "upload-button")}
      >
        {src ? "Change" : "Upload"}
        <input
          hidden
          type="file"
          accept="image/*"
          onChange={onChange}
          data-testid={testId("employee-document", label, "file-input")}
        />
      </Button>
    )}
  </Box>
);

const EmployeeDocument = ({ profileObj }) => {
  const [data, setData] = useState({
    first_name: profileObj.first_name || "",
    last_name: profileObj.last_name || "",
    emp_id: profileObj.emp_id || "",
    joining_date: profileObj.joining_date || "",
    address_line: profileObj.address_line || "",

    company_name: profileObj.company_name || "Lintcloud Technologies",
    company_address: profileObj.company_address || "Tirunelveli, Tamil Nadu",
    hr_name: profileObj.hr_name || "John Robert",
    issue_date: profileObj.issue_date || new Date().toISOString().split("T")[0],

    company_logo: profileObj.company_logo || "",
    hr_signature: profileObj.hr_signature || "",

    body_content: profileObj.body_content || []
  });

  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState(null);

  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  const handleFile = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setData((prev) => ({ ...prev, [type]: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    const { url, fileName } = await generateOfferLetterPreview(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const startEdit = () => {
    setSnapshot(data);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (snapshot) setData(snapshot);
    setIsEditing(false);
  };

  const input = (name, label, props = {}) => (
    <TextField
      fullWidth
      size="small"
      name={name}
      label={label}
      value={data[name]}
      onChange={handleChange}
      {...props}
      slotProps={{
        ...props.slotProps,
        htmlInput: {
          "data-testid": testId("employee-document", name, props.multiline ? "textarea" : "input"),
        },
      }}
    />
  );

  const fullName = `${data.first_name} ${data.last_name}`.trim();

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              variant="rounded"
              sx={(theme) => ({ width: 44, height: 44, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" })}
            >
              <DescriptionOutlinedIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: 17 }}>
                Offer Letter Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditing ? "Update the details used in the offer letter" : `Issued on ${formatDate(data.issue_date) || "—"}`}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            {isEditing ? (
              <>
                <Button variant="outlined" color="inherit" startIcon={<CloseRoundedIcon />} onClick={cancelEdit} data-testid="employee-document-cancel-button">
                  Cancel
                </Button>
                <Button variant="contained" color="success" startIcon={<SaveOutlinedIcon />} onClick={() => setIsEditing(false)} data-testid="employee-document-save-button">
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={startEdit} data-testid="employee-document-edit-button">
                  Edit
                </Button>
                <Button variant="contained" startIcon={<FileDownloadOutlinedIcon />} onClick={handleDownload} data-testid="employee-document-download-button">
                  Download PDF
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Stack spacing={2.5}>
          <Section icon={<BusinessOutlinedIcon />} title="Company Details">
            {isEditing ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>{input("company_name", "Company Name")}</Grid>
                <Grid size={{ xs: 12, md: 6 }}>{input("hr_name", "HR Name")}</Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  {input("issue_date", "Issue Date", { type: "date", slotProps: { inputLabel: { shrink: true } } })}
                </Grid>
                <Grid size={12}>{input("company_address", "Company Address", { multiline: true, minRows: 2 })}</Grid>
              </Grid>
            ) : (
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Company Name" value={data.company_name} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="HR Name" value={data.hr_name} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Issue Date" value={formatDate(data.issue_date)} /></Grid>
                <Grid size={12}><Field label="Company Address" value={data.company_address} /></Grid>
              </Grid>
            )}
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ImagePreview label="Company Logo" src={data.company_logo} editing={isEditing} onChange={(e) => handleFile(e, "company_logo")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ImagePreview label="HR Signature" src={data.hr_signature} editing={isEditing} onChange={(e) => handleFile(e, "hr_signature")} />
              </Grid>
            </Grid>
          </Section>

          <Section icon={<PersonOutlineRoundedIcon />} title="Employee Details">
            {isEditing ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>{input("first_name", "First Name")}</Grid>
                <Grid size={{ xs: 12, md: 6 }}>{input("last_name", "Last Name")}</Grid>
                <Grid size={{ xs: 12, md: 6 }}>{input("emp_id", "Employee ID")}</Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  {input("joining_date", "Joining Date", { type: "date", slotProps: { inputLabel: { shrink: true } } })}
                </Grid>
                <Grid size={12}>{input("address_line", "Address", { multiline: true, minRows: 3 })}</Grid>
              </Grid>
            ) : (
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Full Name" value={fullName} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Employee ID" value={data.emp_id} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Joining Date" value={formatDate(data.joining_date)} /></Grid>
                <Grid size={12}><Field label="Address" value={data.address_line} /></Grid>
              </Grid>
            )}
          </Section>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default EmployeeDocument;
