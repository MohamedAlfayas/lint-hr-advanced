import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  Col,
  Row,
  Button,
  Modal,
  ModalBody,
  Input,
  Label,
  FormGroup,
  Badge,
} from "reactstrap";
import FeatherIcon from "feather-icons-react";
import Swal from "sweetalert2";
import "../../../common/css/lc_form.css";
import { useDispatch, useSelector } from "react-redux";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { Api } from "../../../common/api/Api";
import {
  addCustomForm,
  editCustomForm,
} from "../../../redux/reducers/ChildReducer/CustomFormReducer";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";

// ─── Field type definitions ───────────────────────────────────────────────────
const FIELD_TYPES = [
  { id: "text", label: "Text", icon: "type" },
  { id: "paragraph", label: "Paragraph", icon: "align-left" },
  { id: "select", label: "Select List", icon: "list" },
  { id: "radio", label: "Radio", icon: "disc" },
  { id: "date", label: "Date", icon: "calendar" },
  { id: "time", label: "Time", icon: "clock" },
  { id: "image", label: "Image Upload", icon: "image" },
  { id: "file", label: "File Upload", icon: "file" },
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

// ─── Bootstrap Switch Toggle ──────────────────────────────────────────────────
function Toggle({ checked, onChange, id }) {
  return (
    <div className="form-check form-switch mb-0">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        id={id}
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ cursor: "pointer", width: "2.5em", height: "1.3em" }}
      />
    </div>
  );
}

// ─── Info Tooltip ─────────────────────────────────────────────────────────────
function InfoTooltip({ text }) {
  const [visible, setVisible] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });
  const iconRef = React.useRef(null);

  const show = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPos({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
    setVisible(true);
  };

  return (
    <>
      <span
        ref={iconRef}
        className="text-muted d-inline-flex align-items-center"
        style={{ cursor: "pointer", lineHeight: 1 }}
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
      >
        <FeatherIcon icon="info" size={13} />
      </span>
      {visible &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -100%)",
              background: "#1e293b",
              color: "#f8fafc",
              fontSize: 12,
              lineHeight: 1.5,
              padding: "6px 10px",
              borderRadius: 6,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 99999,
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              marginBottom: 6,
            }}
          >
            {text}
            <div
              style={{
                position: "absolute",
                bottom: -5,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #1e293b",
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

// ─── Field Preview (non-interactive) ─────────────────────────────────────────
function FieldPreview({ field = {} }) {
  const disabledStyle = { pointerEvents: "none", backgroundColor: "#fff" };
  const today = new Date().toISOString().split("T")[0];

  const getDateLimits = () => {
    if (field.type !== "date") return {};
    const limits = {};
    if (field.showPast === false) limits.min = today;
    if (field.showFuture === false) limits.max = today;
    return limits;
  };

  const commonInputProps = {
    className: "form-control",
    style: disabledStyle,
    readOnly: true,
    disabled: true,
    placeholder: field.placeholder || "",
  };

  switch (field.type) {
    case "text":
      return <input {...commonInputProps} />;

    case "paragraph":
      return (
        <textarea
          {...commonInputProps}
          rows={2}
          style={{ ...disabledStyle, resize: "none" }}
        />
      );

    case "select":
      return (
        <select disabled className="form-control" style={disabledStyle}>
          {(field.options?.length ? field.options : ["Option 1"]).map(
            (o, i) => (
              <option key={i}>{o}</option>
            ),
          )}
        </select>
      );

    case "radio":
      return (
        <div style={disabledStyle}>
          {(field.options?.length ? field.options : ["Option 1"]).map(
            (o, i) => (
              <div key={i} className="form-check mb-1">
                <input className="form-check-input" type="radio" disabled />
                <label className="form-check-label text-muted small">{o}</label>
              </div>
            ),
          )}
        </div>
      );

    case "date":
      return <input type="date" {...commonInputProps} {...getDateLimits()} />;

    case "time":
      return <input type="time" {...commonInputProps} />;

    case "image":
    case "file":
      return (
        <div
          className="text-center text-muted rounded"
          style={{
            border: "2px dashed #ced4da",
            background: "#f8f9fa",
            padding: "12px",
            fontSize: 13,
          }}
        >
          <FeatherIcon
            icon={field.type === "image" ? "image" : "upload"}
            size={14}
            className="me-1"
          />
          {field.type === "image"
            ? "Click to upload image"
            : "Click to upload file"}
        </div>
      );

    default:
      return <input {...commonInputProps} />;
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
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "#f8f9fa",
        border: "1px solid #dee2e6",
        borderTop: "none",
        borderRadius: "0 0 6px 6px",
        padding: "20px 24px 16px",
      }}
    >
      <div
        className="d-flex justify-content-between align-items-center pb-3 mb-3"
        style={{ borderBottom: "1px solid #dee2e6" }}
      >
        <Label className="mb-0" style={{ fontSize: 14, fontWeight: 500 }}>
          Make this Required
        </Label>
        <Toggle
          id={`req-${field.id}`}
          checked={field.required}
          onChange={(v) => onUpdate("required", v)}
        />
      </div>

      <FormGroup className="mb-3">
        <Label className="form-label">Label</Label>
        <Input
          className="form-control"
          value={field.label}
          onChange={(e) => onUpdate("label", e.target.value)}
        />
      </FormGroup>

      {(field.type === "text" || field.type === "paragraph") && (
        <FormGroup className="mb-3">
          <Label className="form-label">Placeholder</Label>
          <Input
            className="form-control"
            value={field.placeholder || ""}
            onChange={(e) => onUpdate("placeholder", e.target.value)}
            placeholder="Enter a description to explain the label"
          />
        </FormGroup>
      )}

      {field.type === "text" && (
        <Row className="mb-3">
          <Col xs={6}>
            <FormGroup className="mb-0">
              <Label className="form-label d-flex align-items-center gap-1">
                Min{" "}
                <InfoTooltip text="Minimum number of characters allowed in this field." />
              </Label>
              <Input
                type="number"
                className="form-control"
                value={field.min ?? 1}
                onChange={(e) => onUpdate("min", Number(e.target.value))}
              />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup className="mb-0">
              <Label className="form-label d-flex align-items-center gap-1">
                Max{" "}
                <InfoTooltip text="Maximum number of characters allowed in this field." />
              </Label>
              <Input
                type="number"
                className="form-control"
                value={field.max ?? 100}
                onChange={(e) => onUpdate("max", Number(e.target.value))}
              />
            </FormGroup>
          </Col>
        </Row>
      )}

      {field.type === "text" && (
        <FormGroup className="mb-3">
          <Label className="form-label">Validation</Label>
          <Input
            type="select"
            className="form-control"
            value={field.validation || "None"}
            onChange={(e) => onUpdate("validation", e.target.value)}
          >
            {VALIDATION_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Input>
        </FormGroup>
      )}

      {field.type === "date" && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Label
              className="mb-0 d-flex align-items-center gap-1"
              style={{ fontSize: 14 }}
            >
              Show Future Date{" "}
              <InfoTooltip text="When enabled, users can select dates after today." />
            </Label>
            <Toggle
              id={`future-${field.id}`}
              checked={field.showFuture !== false}
              onChange={(v) => onUpdate("showFuture", v)}
            />
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Label
              className="mb-0 d-flex align-items-center gap-1"
              style={{ fontSize: 14 }}
            >
              Show Past Date{" "}
              <InfoTooltip text="When enabled, users can select dates before today." />
            </Label>
            <Toggle
              id={`past-${field.id}`}
              checked={field.showPast !== false}
              onChange={(v) => onUpdate("showPast", v)}
            />
          </div>
          <FormGroup className="mb-3">
            <Label className="form-label">Format</Label>
            <div className="d-flex align-items-center gap-3">
              <Input
                type="select"
                className="form-control"
                style={{ maxWidth: 180 }}
                value={field.dateFormat || "DD-MM-YYYY"}
                onChange={(e) => onUpdate("dateFormat", e.target.value)}
              >
                {DATE_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.value}
                  </option>
                ))}
              </Input>
              <span
                style={{ fontSize: 13, color: "#6c757d", fontStyle: "italic" }}
              >
                (
                {
                  DATE_FORMATS.find(
                    (f) => f.value === (field.dateFormat || "DD-MM-YYYY"),
                  )?.example
                }
                )
              </span>
            </div>
          </FormGroup>
        </>
      )}

      {field.type === "time" && (
        <FormGroup className="mb-3">
          <Label className="form-label">Format</Label>
          <Input
            type="select"
            className="form-control"
            value={field.timeFormat || "12"}
            onChange={(e) => onUpdate("timeFormat", e.target.value)}
          >
            {TIME_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Input>
        </FormGroup>
      )}

      {field.type === "image" && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Label
              className="mb-0 d-flex align-items-center gap-1"
              style={{ fontSize: 14 }}
            >
              Allow from Gallery{" "}
              <InfoTooltip text="When enabled, users can pick images directly from their device gallery." />
            </Label>
            <Toggle
              id={`gallery-${field.id}`}
              checked={!!field.allowGallery}
              onChange={(v) => onUpdate("allowGallery", v)}
            />
          </div>
          <Row className="mb-3">
            <Col xs={6}>
              <FormGroup className="mb-0">
                <Label className="form-label d-flex align-items-center gap-1">
                  Min{" "}
                  <InfoTooltip text="Minimum number of images the user must upload." />
                </Label>
                <Input
                  type="number"
                  className="form-control"
                  value={field.min ?? 1}
                  min={1}
                  onChange={(e) => onUpdate("min", Number(e.target.value))}
                />
              </FormGroup>
            </Col>
            <Col xs={6}>
              <FormGroup className="mb-0">
                <Label className="form-label d-flex align-items-center gap-1">
                  Max{" "}
                  <InfoTooltip text="Maximum number of images the user can upload." />
                </Label>
                <Input
                  type="number"
                  className="form-control"
                  value={field.max ?? 1}
                  min={1}
                  onChange={(e) => onUpdate("max", Number(e.target.value))}
                />
              </FormGroup>
            </Col>
          </Row>
        </>
      )}

      {field.type === "file" && (
        <Row className="mb-3">
          <Col xs={6}>
            <FormGroup className="mb-0">
              <Label className="form-label d-flex align-items-center gap-1">
                Min{" "}
                <InfoTooltip text="Minimum number of files the user must upload." />
              </Label>
              <Input
                type="number"
                className="form-control"
                value={field.min ?? 1}
                min={1}
                onChange={(e) => onUpdate("min", Number(e.target.value))}
              />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup className="mb-0">
              <Label className="form-label d-flex align-items-center gap-1">
                Max{" "}
                <InfoTooltip text="Maximum number of files the user can upload." />
              </Label>
              <Input
                type="number"
                className="form-control"
                value={field.max ?? 1}
                min={1}
                onChange={(e) => onUpdate("max", Number(e.target.value))}
              />
            </FormGroup>
          </Col>
        </Row>
      )}

      {(field.type === "select" || field.type === "radio") && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Label
              className="mb-0 d-flex align-items-center gap-1"
              style={{ fontSize: 14 }}
            >
              Show in Timeline{" "}
              <InfoTooltip text="When enabled, this field's value will be displayed in the record timeline view." />
            </Label>
            <Toggle
              id={`tl-${field.id}`}
              checked={!!field.showTimeline}
              onChange={(v) => onUpdate("showTimeline", v)}
            />
          </div>

          {field.type === "select" && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Label
                className="mb-0 d-flex align-items-center gap-1"
                style={{ fontSize: 14 }}
              >
                Multiple Select{" "}
                <InfoTooltip text="When enabled, users can select more than one option from the list." />
              </Label>
              <Toggle
                id={`ms-${field.id}`}
                checked={!!field.multiple}
                onChange={(v) => onUpdate("multiple", v)}
              />
            </div>
          )}

          <FormGroup>
            <Label className="form-label">Options</Label>
            {(field.options || []).map((opt, idx) => (
              <div key={idx} className="d-flex gap-2 mb-2">
                <Input
                  className="form-control"
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                />
                <Button
                  color="danger"
                  outline
                  size="sm"
                  className="px-2 flex-shrink-0"
                  onClick={() => removeOption(idx)}
                >
                  <FeatherIcon icon="x" size={14} />
                </Button>
              </div>
            ))}
            <Button
              color="link"
              size="sm"
              className="ps-0 text-primary"
              onClick={addOption}
            >
              <FeatherIcon icon="plus" size={13} className="me-1" />
              Add Option
            </Button>
          </FormGroup>
        </>
      )}

      <div className="d-flex justify-content-end mt-2">
        <Button color="success" onClick={onDone} className="px-4">
          Done
        </Button>
      </div>
    </div>
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
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className="mb-2"
      style={{
        opacity: isDragOver ? 0.45 : 1,
        transition: "opacity 0.15s, transform 0.15s",
        cursor: "grab",
      }}
    >
      <div
        className="bg-white d-flex align-items-start gap-2 px-3 py-2"
        style={{
          border: "1px solid #dee2e6",
          borderRadius: isEditing ? "6px 6px 0 0" : "6px",
          borderBottom: isEditing ? "none" : "1px solid #dee2e6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div className="d-flex flex-column align-items-center gap-1 pt-1 flex-shrink-0">
          <FeatherIcon
            icon="grid"
            size={16}
            style={{ color: "#adb5bd", cursor: "grab" }}
          />
        </div>

        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="fw-semibold" style={{ fontSize: 14 }}>
              {field.label}
              {field.required && <span className="text-danger ms-1">*</span>}
            </span>
            <Badge
              color="primary"
              pill
              className="fw-normal"
              style={{ fontSize: 11 }}
            >
              {FIELD_TYPES.find((f) => f.id === field.type)?.label ||
                field.type}
            </Badge>
          </div>
          <div onMouseDown={(e) => e.stopPropagation()}>
            <FieldPreview field={field} />
          </div>
        </div>

        <div
          className="d-flex gap-1 flex-shrink-0 align-self-end"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            color={isEditing ? "primary" : "light"}
            className="p-1 px-2"
            title="Edit"
            onClick={onToggleEdit}
          >
            <FeatherIcon icon="edit-2" size={13} />
          </Button>
          <Button
            size="sm"
            color="danger"
            outline
            className="p-1 px-2"
            title="Delete"
            onClick={() => onDelete(field.id)}
          >
            <FeatherIcon icon="trash-2" size={13} />
          </Button>
        </div>
      </div>

      {isEditing && (
        <FieldEditor
          field={field}
          onUpdate={(key, val) => onUpdate(field.id, key, val)}
          onDone={onToggleEdit}
        />
      )}
    </div>
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

  /* ── Back button — prompt only if fields exist ── */
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
    <div
      className="d-flex flex-column"
      style={{ height: "100vh", overflow: "hidden", background: "#f3f6f9" }}
    >
      {/* ── Modal: Form Name (initial creation only) ── */}
      <Modal isOpen={modalOpen} centered backdrop="static" keyboard={false}>
        <ModalBody className="p-4">
          <h5 className="mb-3 fw-bold">Form Name</h5>
          <FormGroup className="mb-3">
            <Input
              className="form-control"
              placeholder="Enter the Form Name"
              value={formNameInput}
              onChange={(e) => setFormNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmFormName();
              }}
              autoFocus
            />
          </FormGroup>
          <FormGroup className="mb-3">
            <Label className="form-label">Description</Label>
            <Input
              type="textarea"
              rows={2}
              className="form-control"
              placeholder="Enter a short description (optional)"
              value={formDescInput}
              onChange={(e) => setFormDescInput(e.target.value)}
            />
          </FormGroup>
          <div className="d-flex justify-content-end gap-2">
            <Button
              color="light"
              className="border"
              onClick={handleModalCancel}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              disabled={!formNameInput.trim()}
              onClick={confirmFormName}
            >
              Next
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* ── Modal: Edit Name + Description (create-after & edit mode) ── */}
      <Modal
        isOpen={detailsModalOpen}
        centered
        toggle={() => setDetailsModalOpen(false)}
      >
        <ModalBody className="p-4">
          <h5 className="mb-3 fw-bold">Edit Form Details</h5>
          <FormGroup className="mb-3">
            <Label className="form-label">Name</Label>
            <Input
              className="form-control"
              value={detailsNameDraft}
              onChange={(e) => setDetailsNameDraft(e.target.value)}
              autoFocus
            />
          </FormGroup>
          <FormGroup className="mb-3">
            <Label className="form-label">Description</Label>
            <Input
              type="textarea"
              rows={2}
              className="form-control"
              placeholder="Enter a short description (optional)"
              value={detailsDescDraft}
              onChange={(e) => setDetailsDescDraft(e.target.value)}
            />
          </FormGroup>
          <div className="d-flex justify-content-end gap-2">
            <Button
              color="light"
              className="border"
              onClick={() => setDetailsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              disabled={!detailsNameDraft.trim()}
              onClick={confirmDetailsModal}
            >
              Save
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* ── Body ── */}
      <div
        className="d-flex flex-grow-1"
        style={{ overflow: "hidden", minHeight: 0 }}
      >
        {/* LEFT SIDEBAR */}
        <div
          className="bg-white border-end d-flex flex-column"
          style={{ width: 185, flexShrink: 0, overflow: "hidden" }}
        >
          <div className="px-3 py-3 border-bottom">
            <span className="fw-bold" style={{ fontSize: 15 }}>
              Field list
            </span>
          </div>
          <div className="p-2 flex-grow-1" style={{ overflowY: "auto" }}>
            {FIELD_TYPES.map((f) => (
              <div
                key={f.id}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, f.id)}
                onClick={() => addField(f.id)}
                className="d-flex align-items-center gap-2 px-2 py-2 rounded mb-1"
                style={{
                  cursor: "pointer",
                  userSelect: "none",
                  fontSize: 14,
                  color: "#495057",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e8f4fd";
                  e.currentTarget.style.color = "#0ab39c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#495057";
                }}
              >
                <span
                  className="text-primary d-flex align-items-center"
                  style={{ flexShrink: 0 }}
                >
                  <FeatherIcon icon={f.icon} size={16} />
                </span>
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: title | drop zone | footer */}
        <div
          className="d-flex flex-column flex-grow-1"
          style={{ overflow: "hidden", padding: "20px 24px", minWidth: 0 }}
        >
          {/* Form name + description title */}
          <div className="mb-3 flex-shrink-0">
            <div className="d-flex align-items-center gap-2">
              <span className="lc_form_title" style={{ fontSize: 17 }}>
                {formName}
              </span>
              <button
                className="btn btn-link p-0 text-muted"
                onClick={openDetailsModal}
                title="Edit name & description"
              >
                <FeatherIcon icon="edit-3" size={14} />
              </button>
            </div>
            {formDescription && (
              <div
                className="text-muted"
                style={{ fontSize: 13, marginTop: 2 }}
              >
                {formDescription}
              </div>
            )}
          </div>

          {/* Drop zone – scrollable */}
          <div
            onDrop={handleZoneDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDropZoneDrag(true);
            }}
            onDragLeave={() => setDropZoneDrag(false)}
            className="flex-grow-1 bg-white rounded"
            style={{
              border: `2px dashed ${dropZoneDrag ? "#0ab39c" : "#a8d5f5"}`,
              overflowY: "auto",
              overflowX: "hidden",
              padding: 20,
              transition: "border-color 0.2s",
              minHeight: 0,
            }}
          >
            {fields.length === 0 ? (
              <div
                className="h-100 d-flex flex-column align-items-center justify-content-center text-muted"
                style={{ minHeight: 200 }}
              >
                <FeatherIcon
                  icon="plus-circle"
                  size={34}
                  className="mb-2 opacity-50"
                />
                <span style={{ fontSize: 14 }}>
                  Drag a field from the left panel or click to add
                </span>
              </div>
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
          </div>

          {/* Footer */}
          <div
            className="d-flex justify-content-between align-items-center flex-shrink-0"
            style={{ marginTop: 16 }}
          >
            <Button color="light" className="border px-4" onClick={handleBack}>
              <FeatherIcon icon="arrow-left" size={14} className="me-1" />
              Back
            </Button>
            <Button
              color="primary"
              className="px-4"
              onClick={handleSave}
              disabled={saving}
            >
              <FeatherIcon icon="save" size={14} className="me-1" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
