import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NotesIcon from "@mui/icons-material/Notes";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { Api } from "../../../common/api/Api";
import {
  addCustomForm,
  editCustomForm,
} from "../../../redux/reducers/ChildReducer/CustomFormReducer";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import SidebarFormLayout from "../../../shared/ui/SidebarFormLayout";
import { testId, itemTestKey } from "../../../shared/testing/testId";

// ─── Field type definitions ───────────────────────────────────────────────────
const FIELD_TYPES = [
  { id: "text", label: "Text", Icon: TextFieldsIcon },
  { id: "paragraph", label: "Paragraph", Icon: NotesIcon },
  { id: "select", label: "Select List", Icon: FormatListBulletedIcon },
  { id: "radio", label: "Radio", Icon: RadioButtonCheckedIcon },
  { id: "date", label: "Date", Icon: CalendarMonthOutlinedIcon },
  { id: "time", label: "Time", Icon: AccessTimeIcon },
  { id: "image", label: "Image Upload", Icon: ImageOutlinedIcon },
  { id: "file", label: "File Upload", Icon: AttachFileIcon },
];

const VALIDATION_OPTIONS = [
  "None",
  "Alphanumeric",
  "Numeric",
  "Email",
  "Phone",
  "URL",
];

const DATE_FORMATS = [
  { value: "DD-MM-YYYY", example: "Ex: 15-11-2020" },
  { value: "MM-DD-YYYY", example: "Ex: 11-15-2020" },
  { value: "YYYY-MM-DD", example: "Ex: 2020-11-15" },
  { value: "DD/MM/YYYY", example: "Ex: 15/11/2020" },
  { value: "MM/DD/YYYY", example: "Ex: 11/15/2020" },
  { value: "YYYY/MM/DD", example: "Ex: 2020/11/15" },
];

const TIME_FORMATS = [
  { value: "12", label: "12 Hours" },
  { value: "24", label: "24 Hours" },
];

// ─── Default field factory ────────────────────────────────────────────────────
function createField(type) {
  const ft = FIELD_TYPES.find((f) => f.id === type);
  return {
    id: Date.now() + Math.random(),
    type,
    label: ft?.label || type,
    required: false,
    ...(type === "text" && {
      min: 1,
      max: 100,
      validation: "None",
      placeholder: "",
    }),
    ...(type === "paragraph" && { placeholder: "" }),
    ...(type === "date" && {
      showPast: true,
      showFuture: true,
      dateFormat: "DD-MM-YYYY",
    }),
    ...(type === "time" && { timeFormat: "12" }),
    ...(type === "image" && { allowGallery: false, min: 1, max: 1 }),
    ...(type === "file" && { min: 1, max: 1 }),
    ...((type === "select" || type === "radio") && {
      options: ["Option 1", "Option 2"],
      showTimeline: false,
      ...(type === "select" && { multiple: false }),
    }),
  };
}

// ─── slug helper for field ids sent to the API ────────────────────────────────
function slugify(str, existing = []) {
  let base =
    (str || "field")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "field";
  let slug = base;
  let i = 1;
  while (existing.includes(slug)) slug = `${base}_${i++}`;
  return slug;
}

// ─── builder field → API schema entry ─────────────────────────────────────────
function fieldToApiSchema(field, usedIds) {
  const id = slugify(field.label, usedIds);
  usedIds.push(id);

  const base = { id, label: field.label, required: !!field.required };

  switch (field.type) {
    case "paragraph":
      return { ...base, type: "textarea" };
    case "select":
      return {
        ...base,
        type: field.multiple ? "multiselect" : "dropdown",
        options: (field.options || []).map((o) => ({
          label: o,
          value: slugify(o),
        })),
      };
    case "radio":
      return {
        ...base,
        type: "radio",
        options: (field.options || []).map((o) => ({
          label: o,
          value: slugify(o),
        })),
      };
    default:
      // text, date, time, image, file pass through as-is
      return { ...base, type: field.type };
  }
}

// ─── API schema entry → builder field (for edit mode) ─────────────────────────
function apiSchemaToField(item) {
  const typeMap = {
    textarea: "paragraph",
    dropdown: "select",
    multiselect: "select",
  };
  const type = typeMap[item.type] || item.type;
  const field = createField(type);
  return {
    ...field,
    id: Date.now() + Math.random(),
    label: item.label,
    required: !!item.required,
    ...((type === "select" || type === "radio") && {
      options: (item.options || []).map((o) => o.label),
      multiple: item.type === "multiselect",
    }),
  };
}

// Builder inputs live inside the sidebar <form>; Enter must not trigger Save.
const preventEnterSubmit = (e) => {
  if (e.key === "Enter" && e.target.tagName === "INPUT") e.preventDefault();
};

// ─── Info Tooltip ─────────────────────────────────────────────────────────────
function InfoTooltip({ text }) {
  return (
    <Tooltip title={text} arrow placement="top">
      <InfoOutlinedIcon
        sx={{ fontSize: 15, color: "text.secondary", cursor: "pointer" }}
      />
    </Tooltip>
  );
}

// ─── Labelled switch row ──────────────────────────────────────────────────────
function SettingSwitch({ label, info, checked, onChange }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
        {info && <InfoTooltip text={info} />}
      </Stack>
      <Switch
        size="small"
        color="success"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </Stack>
  );
}

// ─── Number input with an info tooltip ────────────────────────────────────────
function NumberSetting({ label, info, value, min, onChange }) {
  return (
    <TextField
      type="number"
      size="small"
      fullWidth
      label={label}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      slotProps={{
        htmlInput: min !== undefined ? { min } : undefined,
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <InfoTooltip text={info} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

// ─── Field Preview (non-interactive) ─────────────────────────────────────────
function FieldPreview({ field = {} }) {
  const today = new Date().toISOString().split("T")[0];
  const options = field.options?.length ? field.options : ["Option 1"];

  const getDateLimits = () => {
    if (field.type !== "date") return {};
    const limits = {};
    if (field.showPast === false) limits.min = today;
    if (field.showFuture === false) limits.max = today;
    return limits;
  };

  const commonProps = {
    size: "small",
    fullWidth: true,
    disabled: true,
    placeholder: field.placeholder || "",
  };

  switch (field.type) {
    case "text":
      return <TextField {...commonProps} />;

    case "paragraph":
      return <TextField {...commonProps} multiline rows={2} />;

    case "select":
      return (
        <TextField {...commonProps} select value={0}>
          {options.map((o, i) => (
            <MenuItem key={i} value={i}>
              {o}
            </MenuItem>
          ))}
        </TextField>
      );

    case "radio":
      return (
        <Stack>
          {options.map((o, i) => (
            <FormControlLabel
              key={i}
              disabled
              control={<Radio size="small" />}
              label={o}
              slotProps={{ typography: { variant: "body2" } }}
            />
          ))}
        </Stack>
      );

    case "date":
      return (
        <TextField
          {...commonProps}
          type="date"
          slotProps={{ htmlInput: getDateLimits() }}
        />
      );

    case "time":
      return <TextField {...commonProps} type="time" />;

    case "image":
    case "file":
      return (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "grey.50",
            color: "text.secondary",
            p: 1.5,
          }}
        >
          {field.type === "image" ? (
            <ImageOutlinedIcon fontSize="small" />
          ) : (
            <CloudUploadOutlinedIcon fontSize="small" />
          )}
          <Typography variant="body2">
            {field.type === "image"
              ? "Click to upload image"
              : "Click to upload file"}
          </Typography>
        </Stack>
      );

    default:
      return <TextField {...commonProps} />;
  }
}

// ─── Field Editor ─────────────────────────────────────────────────────────────
function FieldEditor({ field, onUpdate, onDone }) {
  const updateOption = (idx, val) => {
    const opts = [...(field.options || [])];
    opts[idx] = val;
    onUpdate("options", opts);
  };

  const addOption = () =>
    onUpdate("options", [
      ...(field.options || []),
      `Option ${(field.options || []).length + 1}`,
    ]);

  const removeOption = (idx) =>
    onUpdate(
      "options",
      (field.options || []).filter((_, i) => i !== idx),
    );

  return (
    <Stack
      spacing={2}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      sx={{
        bgcolor: "grey.50",
        border: 1,
        borderColor: "divider",
        borderTop: 0,
        borderRadius: "0 0 8px 8px",
        px: 2.5,
        py: 2,
      }}
    >
      <SettingSwitch
        label="Make this Required"
        checked={field.required}
        onChange={(v) => onUpdate("required", v)}
      />

      <TextField
        size="small"
        fullWidth
        label="Label"
        value={field.label}
        onChange={(e) => onUpdate("label", e.target.value)}
      />

      {(field.type === "text" || field.type === "paragraph") && (
        <TextField
          size="small"
          fullWidth
          label="Placeholder"
          value={field.placeholder || ""}
          onChange={(e) => onUpdate("placeholder", e.target.value)}
          placeholder="Enter a description to explain the label"
        />
      )}

      {field.type === "text" && (
        <>
          <Grid container spacing={2}>
            <Grid size={6}>
              <NumberSetting
                label="Min"
                info="Minimum number of characters allowed in this field."
                value={field.min ?? 1}
                onChange={(v) => onUpdate("min", v)}
              />
            </Grid>
            <Grid size={6}>
              <NumberSetting
                label="Max"
                info="Maximum number of characters allowed in this field."
                value={field.max ?? 100}
                onChange={(v) => onUpdate("max", v)}
              />
            </Grid>
          </Grid>
          <TextField
            select
            size="small"
            fullWidth
            label="Validation"
            value={field.validation || "None"}
            onChange={(e) => onUpdate("validation", e.target.value)}
          >
            {VALIDATION_OPTIONS.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </TextField>
        </>
      )}

      {field.type === "date" && (
        <>
          <SettingSwitch
            label="Show Future Date"
            info="When enabled, users can select dates after today."
            checked={field.showFuture !== false}
            onChange={(v) => onUpdate("showFuture", v)}
          />
          <SettingSwitch
            label="Show Past Date"
            info="When enabled, users can select dates before today."
            checked={field.showPast !== false}
            onChange={(v) => onUpdate("showPast", v)}
          />
          <TextField
            select
            size="small"
            fullWidth
            label="Format"
            value={field.dateFormat || "DD-MM-YYYY"}
            onChange={(e) => onUpdate("dateFormat", e.target.value)}
            helperText={
              DATE_FORMATS.find(
                (f) => f.value === (field.dateFormat || "DD-MM-YYYY"),
              )?.example
            }
          >
            {DATE_FORMATS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.value}
              </MenuItem>
            ))}
          </TextField>
        </>
      )}

      {field.type === "time" && (
        <TextField
          select
          size="small"
          fullWidth
          label="Format"
          value={field.timeFormat || "12"}
          onChange={(e) => onUpdate("timeFormat", e.target.value)}
        >
          {TIME_FORMATS.map((f) => (
            <MenuItem key={f.value} value={f.value}>
              {f.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      {field.type === "image" && (
        <SettingSwitch
          label="Allow from Gallery"
          info="When enabled, users can pick images directly from their device gallery."
          checked={!!field.allowGallery}
          onChange={(v) => onUpdate("allowGallery", v)}
        />
      )}

      {(field.type === "image" || field.type === "file") && (
        <Grid container spacing={2}>
          <Grid size={6}>
            <NumberSetting
              label="Min"
              info={
                field.type === "image"
                  ? "Minimum number of images the user must upload."
                  : "Minimum number of files the user must upload."
              }
              value={field.min ?? 1}
              min={1}
              onChange={(v) => onUpdate("min", v)}
            />
          </Grid>
          <Grid size={6}>
            <NumberSetting
              label="Max"
              info={
                field.type === "image"
                  ? "Maximum number of images the user can upload."
                  : "Maximum number of files the user can upload."
              }
              value={field.max ?? 1}
              min={1}
              onChange={(v) => onUpdate("max", v)}
            />
          </Grid>
        </Grid>
      )}

      {(field.type === "select" || field.type === "radio") && (
        <>
          <SettingSwitch
            label="Show in Timeline"
            info="When enabled, this field's value will be displayed in the record timeline view."
            checked={!!field.showTimeline}
            onChange={(v) => onUpdate("showTimeline", v)}
          />

          {field.type === "select" && (
            <SettingSwitch
              label="Multiple Select"
              info="When enabled, users can select more than one option from the list."
              checked={!!field.multiple}
              onChange={(v) => onUpdate("multiple", v)}
            />
          )}

          <Stack spacing={1}>
            <Typography variant="body2" fontWeight={500}>
              Options
            </Typography>
            {(field.options || []).map((opt, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  fullWidth
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                />
                <IconButton
                  data-testid={testId("custom-form-option", itemTestKey(opt), "delete-button")}
                  size="small"
                  color="error"
                  onClick={() => removeOption(idx)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            <Box>
              <Button data-testid="custom-form-add-option-button" size="small" startIcon={<AddIcon />} onClick={addOption}>
                Add Option
              </Button>
            </Box>
          </Stack>
        </>
      )}

      <Stack direction="row" justifyContent="flex-end">
        <Button data-testid="custom-form-done-button" variant="contained" color="success" size="small" onClick={onDone}>
          Done
        </Button>
      </Stack>
    </Stack>
  );
}

// ─── Draggable Field Card ─────────────────────────────────────────────────────
function FieldCard({
  field,
  index,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onUpdate,
  onDelete,
  isEditing,
  onToggleEdit,
  isDragOver,
}) {
  return (
    <Box
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      sx={{
        mb: 1.5,
        opacity: isDragOver ? 0.45 : 1,
        transition: "opacity 0.15s, transform 0.15s",
        cursor: "grab",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          px: 1.5,
          py: 1.25,
          borderRadius: isEditing ? "8px 8px 0 0" : 2,
          borderColor: isEditing ? "primary.main" : "divider",
        }}
      >
        <DragIndicatorIcon
          fontSize="small"
          sx={{ color: "text.disabled", mt: 0.5, flexShrink: 0 }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {field.label}
              {field.required && (
                <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
                  *
                </Box>
              )}
            </Typography>
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={
                FIELD_TYPES.find((f) => f.id === field.type)?.label ||
                field.type
              }
            />
          </Stack>
          <Box onMouseDown={(e) => e.stopPropagation()}>
            <FieldPreview field={field} />
          </Box>
        </Box>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexShrink: 0, alignSelf: "flex-end" }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="Edit">
            <IconButton
              data-testid={testId("custom-form-field", field.label, "edit-button")}
              size="small"
              color={isEditing ? "primary" : "default"}
              onClick={onToggleEdit}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              data-testid={testId("custom-form-field", field.label, "delete-button")}
              size="small"
              color="error"
              onClick={() => onDelete(field.id)}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {isEditing && (
        <FieldEditor
          field={field}
          onUpdate={(key, val) => onUpdate(field.id, key, val)}
          onDone={onToggleEdit}
        />
      )}
    </Box>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function FormBuilder({ editFormId = null }) {
  const dispatch = useDispatch();
  const { custom_form_data } = useSelector((state) => state.CustomFormReducer);

  // editFormId may arrive as: a raw id (number/string) OR the full form
  // record object (e.g. row.original from a table). Normalize both.
  const editingForm =
    editFormId && typeof editFormId === "object"
      ? editFormId
      : editFormId
        ? custom_form_data.find((f) => String(f.id) === String(editFormId))
        : null;

  const [modalOpen, setModalOpen] = useState(!editFormId);
  const [formNameInput, setFormNameInput] = useState("");
  const [formDescInput, setFormDescInput] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [dropZoneDrag, setDropZoneDrag] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadedFormId, setLoadedFormId] = useState(null);

  // ── details (name + description) edit modal — used for both create & edit ──
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsNameDraft, setDetailsNameDraft] = useState("");
  const [detailsDescDraft, setDetailsDescDraft] = useState("");

  const dragIndexRef = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  /* ── sync state once editingForm is available/changes ── */
  useEffect(() => {
    if (editingForm && loadedFormId !== editingForm.id) {
      setFormNameInput(editingForm.name || "");
      setFormDescInput(editingForm.description || "");
      setFormName(editingForm.name || "");
      setFormDescription(editingForm.description || "");
      setFields((editingForm.schema || []).map(apiSchemaToField));
      setModalOpen(false);
      setLoadedFormId(editingForm.id);
    }
  }, [editingForm, loadedFormId]);

  /* ── field management ── */
  const addField = useCallback((type) => {
    setFields((prev) => [...prev, createField(type)]);
  }, []);

  const updateField = useCallback(
    (id, key, value) =>
      setFields((prev) =>
        prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)),
      ),
    [],
  );

  const deleteField = useCallback((id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setEditingId((prev) => (prev === id ? null : prev));
  }, []);

  /* ── drag-to-reorder handlers ── */
  const handleCardDragStart = useCallback((e, index) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => setDragOverIndex(index), 0);
  }, []);

  const handleCardDragEnter = useCallback((e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleCardDragEnd = useCallback(() => {
    const from = dragIndexRef.current;
    const to = dragOverIndex;
    if (from !== null && to !== null && from !== to) {
      setFields((prev) => {
        const arr = [...prev];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        return arr;
      });
    }
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }, [dragOverIndex]);

  /* ── drop zone: accept drag from sidebar ── */
  const handleZoneDrop = (e) => {
    e.preventDefault();
    setDropZoneDrag(false);
    const type = e.dataTransfer.getData("fieldType");
    if (type) addField(type);
  };

  /* ── sidebar drag start ── */
  const handleSidebarDragStart = (e, typeId) => {
    e.dataTransfer.setData("fieldType", typeId);
    dragIndexRef.current = null;
  };

  /* ── Modal Cancel — just close the builder ── */
  const handleModalCancel = () => {
    dispatch(toggleRSBView(false));
  };

  /* ── Back / Cancel — prompt only if fields exist ── */
  const handleBack = () => {
    if (fields.length === 0) {
      dispatch(toggleRSBView(false));
      return;
    }
    Swal.fire({
      icon: "warning",
      title: "Discard Changes?",
      text: "Any unsaved changes will be lost.",
      iconColor: "#f06548",
      showCancelButton: true,
      confirmButtonColor: "#f06548",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Discard",
      cancelButtonText: "Stay",
      reverseButtons: true,
    }).then((res) => {
      if (res.isConfirmed) {
        dispatch(toggleRSBView(false));
      }
    });
  };

  /* ── Save (create or update via API) ── */
  const handleSave = () => {
    if (fields.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Fields Added",
        text: "Please add at least one field before saving.",
        confirmButtonColor: "#0ab39c",
      });
      return;
    }

    const usedIds = [];
    const schema = fields.map((f) => fieldToApiSchema(f, usedIds));

    const payload = {
      ...(editingForm && { id: editingForm.id }),
      name: formName,
      description: formDescription,
      schema,
    };

    setSaving(true);
    Api({
      method: editingForm ? "PUT" : "POST",
      url: "/custom/custom-form/",
      data: payload,
    })
      .then((res) => {
        const saved = res?.data?.data;

        let updatedList;
        if (editingForm) {
          dispatch(editCustomForm(saved));
          updatedList = custom_form_data.map((f) =>
            f.id === saved.id ? saved : f,
          );
        } else {
          dispatch(addCustomForm(saved));
          updatedList = [...custom_form_data, saved];
        }

        // persist the full list to localStorage under "custom_form"
        SetLocalStorage("custom_form", updatedList, 1);

        Swal.fire({
          icon: "success",
          title: editingForm ? "Form Updated!" : "Form Saved!",
          text: res?.data?.message,
          confirmButtonColor: "#0ab39c",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => dispatch(toggleRSBView(false)));
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text:
            err?.response?.data?.message ||
            "Something went wrong. Please try again.",
          confirmButtonColor: "#f06548",
        });
      })
      .finally(() => setSaving(false));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };

  /* ── Confirm form name (initial creation modal) ── */
  const confirmFormName = () => {
    const trimmed = formNameInput.trim();
    if (!trimmed) return;
    setFormName(trimmed);
    setFormDescription(formDescInput.trim());
    setModalOpen(false);
  };

  /* ── Open / confirm the name+description edit modal (used after creation too) ── */
  const openDetailsModal = () => {
    setDetailsNameDraft(formName);
    setDetailsDescDraft(formDescription);
    setDetailsModalOpen(true);
  };

  const confirmDetailsModal = () => {
    const trimmed = detailsNameDraft.trim();
    if (!trimmed) return;
    setFormName(trimmed);
    setFormDescription(detailsDescDraft.trim());
    setDetailsModalOpen(false);
  };

  /* ── render ── */
  return (
    <React.Fragment>
      <SidebarFormLayout
        onSubmit={handleFormSubmit}
        isSubmitting={saving}
        submitLabel="Save"
        onCancel={handleBack}
      >
        <Box
          onKeyDown={preventEnterSubmit}
          sx={{
            display: "flex",
            height: "calc(100vh - 190px)",
            minHeight: 420,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#f3f6f9",
          }}
        >
          {/* LEFT SIDEBAR */}
          <Box
            sx={{
              width: 185,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
              borderRight: 1,
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}
            >
              Field list
            </Typography>
            <List dense sx={{ p: 1, flex: 1, overflowY: "auto" }}>
              {FIELD_TYPES.map(({ id, label, Icon }) => (
                <ListItemButton
                  key={id}
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, id)}
                  onClick={() => addField(id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    userSelect: "none",
                    "&:hover": { bgcolor: "#e8f4fd", color: "#0ab39c" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: "primary.main" }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={label} />
                </ListItemButton>
              ))}
            </List>
          </Box>

          {/* RIGHT: title | drop zone */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              p: 2.5,
            }}
          >
            <Box sx={{ mb: 2, flexShrink: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" fontWeight={700} noWrap>
                  {formName}
                </Typography>
                <Tooltip title="Edit name & description">
                  <IconButton size="small" onClick={openDetailsModal} data-testid="custom-form-edit-details-button">
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              {formDescription && (
                <Typography variant="body2" color="text.secondary">
                  {formDescription}
                </Typography>
              )}
            </Box>

            {/* Drop zone – scrollable */}
            <Box
              onDrop={handleZoneDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDropZoneDrag(true);
              }}
              onDragLeave={() => setDropZoneDrag(false)}
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "2px dashed",
                borderColor: dropZoneDrag ? "#0ab39c" : "#a8d5f5",
                p: 2.5,
                transition: "border-color 0.2s",
              }}
            >
              {fields.length === 0 ? (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                  sx={{ height: "100%", minHeight: 200, color: "text.secondary" }}
                >
                  <AddCircleOutlineIcon sx={{ fontSize: 34, opacity: 0.5 }} />
                  <Typography variant="body2">
                    Drag a field from the left panel or click to add
                  </Typography>
                </Stack>
              ) : (
                fields.map((field, index) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    index={index}
                    onDragStart={handleCardDragStart}
                    onDragEnter={handleCardDragEnter}
                    onDragEnd={handleCardDragEnd}
                    onUpdate={updateField}
                    onDelete={deleteField}
                    isEditing={editingId === field.id}
                    isDragOver={dragOverIndex === index}
                    onToggleEdit={() =>
                      setEditingId(editingId === field.id ? null : field.id)
                    }
                  />
                ))
              )}
            </Box>
          </Box>
        </Box>
      </SidebarFormLayout>

      {/* ── Dialog: Form Name (initial creation only) ── */}
      <Dialog open={modalOpen} fullWidth maxWidth="xs" disableEscapeKeyDown>
        <DialogTitle>Form Name</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Form name"
              placeholder="Enter the Form Name"
              required
              autoFocus
              fullWidth
              value={formNameInput}
              onChange={(e) => setFormNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmFormName();
              }}
            />
            <TextField
              label="Description"
              placeholder="Enter a short description (optional)"
              multiline
              minRows={2}
              fullWidth
              value={formDescInput}
              onChange={(e) => setFormDescInput(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={handleModalCancel} data-testid="custom-form-create-cancel-button">
            Cancel
          </Button>
          <Button
            data-testid="custom-form-next-button"
            variant="contained"
            disabled={!formNameInput.trim()}
            onClick={confirmFormName}
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog: Edit Name + Description (create-after & edit mode) ── */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ pr: 6 }}>
          Edit Form Details
          <IconButton
            data-testid="custom-form-close-button"
            onClick={() => setDetailsModalOpen(false)}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Name"
              required
              autoFocus
              fullWidth
              value={detailsNameDraft}
              onChange={(e) => setDetailsNameDraft(e.target.value)}
            />
            <TextField
              label="Description"
              placeholder="Enter a short description (optional)"
              multiline
              minRows={2}
              fullWidth
              value={detailsDescDraft}
              onChange={(e) => setDetailsDescDraft(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setDetailsModalOpen(false)} data-testid="custom-form-details-cancel-button">
            Cancel
          </Button>
          <Button
            data-testid="custom-form-save-button"
            variant="contained"
            disabled={!detailsNameDraft.trim()}
            onClick={confirmDetailsModal}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
