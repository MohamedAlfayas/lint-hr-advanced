import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import classnames from "classnames";
import Select from "react-select";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import { fetchStatusMasterAdmin, saveStatusMaster, colorFor } from "./statusHelpers";

// Bootstrap contextual colors — matches colorFor()'s vocabulary in statusHelpers.js
const colorOptions = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "success", label: "Success" },
  { value: "danger", label: "Danger" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" },
  { value: "dark", label: "Dark" },
];

const scopeTabs = [
  { id: "run", label: "Payroll Run" },
  { id: "payslip", label: "Payslip" },
];

// Fields the backend strips from the payload for is_system rows
// (see PayrollStatusMasterApiView.post) — kept in sync here so the form
// disables the same fields it knows won't actually save.
const SYSTEM_LOCKED_FIELDS = ["scope", "code", "is_initial", "is_terminal", "is_locked"];

const codesToOptions = (rows) => rows.map((r) => ({ value: r.code, label: r.label }));

const emptyForm = {
  id: null,
  scope: "run",
  code: "",
  label: "",
  description: "",
  sort_order: 0,
  color: null,
  allowed_next: [],
  is_initial: false,
  is_terminal: false,
  is_locked: false,
  is_editable: true,
  requires_run_at_least: [],
  is_active: true,
  is_system: false,
};

const rowToForm = (row) => ({
  id: row.id,
  scope: row.scope,
  code: row.code,
  label: row.label,
  description: row.description || "",
  sort_order: row.sort_order ?? 0,
  color: colorOptions.find((c) => c.value === row.color) || null,
  is_initial: !!row.is_initial,
  is_terminal: !!row.is_terminal,
  is_locked: !!row.is_locked,
  is_editable: row.is_editable !== false,
  is_active: !!row.is_active,
  is_system: !!row.is_system,
});

const StatusMasterTab = () => {
  const [activeScope, setActiveScope] = useState("run");
  const [runRows, setRunRows] = useState([]);
  const [payslipRows, setPayslipRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const rowsByScope = { run: runRows, payslip: payslipRows };
  const rows = rowsByScope[activeScope];

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      fetchStatusMasterAdmin("run"),
      fetchStatusMasterAdmin("payslip"),
    ])
      .then(([run, payslip]) => {
        setRunRows(run || []);
        setPayslipRows(payslip || []);
      })
      .catch(() => toast.error("Couldn't load status master list."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleScope = (scope) => {
    if (scope !== activeScope) setActiveScope(scope);
  };

  // Options for "Next statuses" — every other status in the same scope.
  const nextOptions = useMemo(
    () => codesToOptions(rows.filter((r) => r.id !== form.id)),
    [rows, form.id]
  );

  // Options for "Requires run at least" — payslip statuses reference run codes.
  const runCodeOptions = useMemo(() => codesToOptions(runRows), [runRows]);

  const openCreateModal = () => {
    setForm({ ...emptyForm, scope: activeScope, color: colorOptions[0] });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    const scopeRows = rowsByScope[row.scope] || [];
    const codeLabel = (code) => scopeRows.find((r) => r.code === code)?.label || code;
    const runCodeLabel = (code) => runRows.find((r) => r.code === code)?.label || code;

    setForm({
      ...rowToForm(row),
      allowed_next: (row.allowed_next || []).map((code) => ({
        value: code,
        label: codeLabel(code),
      })),
      requires_run_at_least: (row.requires_run_at_least || []).map((code) => ({
        value: code,
        label: runCodeLabel(code),
      })),
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const isFieldLocked = (field) => form.is_system && SYSTEM_LOCKED_FIELDS.includes(field);

  const validate = () => {
    const next = {};
    if (!form.code.trim()) next.code = "Code is required";
    else if (!/^[a-z0-9_]+$/.test(form.code.trim())) {
      next.code = "Code must be lowercase letters, numbers and underscores only";
    }
    if (!form.label.trim()) next.label = "Label is required";
    if (form.sort_order === "" || Number.isNaN(Number(form.sort_order))) {
      next.sort_order = "Order must be a number";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload = {
      id: form.id || 0,
      scope: form.scope,
      code: form.code.trim(),
      label: form.label.trim(),
      description: form.description.trim() || null,
      sort_order: Number(form.sort_order),
      color: form.color?.value || null,
      allowed_next: form.allowed_next.map((o) => o.value),
      is_initial: form.is_initial,
      is_terminal: form.is_terminal,
      is_locked: form.is_locked,
      is_editable: form.is_editable,
      requires_run_at_least: form.requires_run_at_least.map((o) => o.value),
      is_active: form.is_active,
    };

    // Don't bother sending fields the backend will strip anyway for system
    // rows — keeps the request honest about what will actually change.
    if (form.is_system) {
      SYSTEM_LOCKED_FIELDS.forEach((f) => delete payload[f]);
      payload.id = form.id;
    }

    setSaving(true);
    saveStatusMaster(payload)
      .then(() => {
        toast.success(form.id ? "Status updated" : "Status created");
        setModalOpen(false);
        loadAll();
      })
      .catch((err) =>
        toast.error(
          err?.response?.data?.message ||
            err?.response?.data?.error_message ||
            err?.response?.data?.detail ||
            "Save failed. Please check the details and try again."
        )
      )
      .finally(() => setSaving(false));
  };

  const handleToggleActive = (row) => {
    const action = row.is_active ? "Deactivate" : "Activate";
    Swal.fire({
      title: `${action} this status?`,
      text: row.is_active
        ? `"${row.label}" will stop appearing as a selectable status. Existing records keeping this status are unaffected.`
        : `"${row.label}" will become selectable again.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: action,
      confirmButtonColor: row.is_active ? "#dc3545" : "#0ab39c",
    }).then((result) => {
      if (!result.isConfirmed) return;
      saveStatusMaster({ id: row.id, is_active: !row.is_active })
        .then(() => {
          toast.success(`Status ${row.is_active ? "deactivated" : "activated"}`);
          loadAll();
        })
        .catch(() => toast.error("Couldn't update this status."));
    });
  };

  const sortedRows = [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <Card>
      <CardBody>
        <Row className="align-items-center mb-3">
          <Col>
            <h5 className="mb-0">Status Master</h5>
            <p className="text-muted mb-0" style={{ fontSize: 12 }}>
              System statuses (badge "System") can have their label, description, color,
              order, active state, editability and next-status transitions tuned here —
              their code and structural flags are fixed.
            </p>
          </Col>
          <Col xs="auto">
            <Button color="primary" size="sm" onClick={openCreateModal}>
              + Add Status
            </Button>
          </Col>
        </Row>

        <Nav pills className="mb-3">
          {scopeTabs.map((tab) => (
            <NavItem key={tab.id}>
              <NavLink
                style={{ cursor: "pointer" }}
                className={classnames({ active: activeScope === tab.id })}
                onClick={() => toggleScope(tab.id)}
              >
                {tab.label}
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        {loading ? (
          <div className="text-center py-4">
            <Spinner size="sm" /> <span className="ms-2">Loading...</span>
          </div>
        ) : (
          <Table hover responsive className="align-middle">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Order</th>
                <th>Code</th>
                <th>Preview</th>
                <th>Next Statuses</th>
                <th style={{ width: 130 }}>Flags</th>
                <th style={{ width: 80 }}>Active</th>
                <th style={{ width: 150 }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No statuses configured for this scope yet.
                  </td>
                </tr>
              ) : (
                sortedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.sort_order ?? 0}</td>
                    <td>
                      <code>{row.code}</code>
                      {row.is_system && (
                        <Badge color="light" className="text-dark border ms-2">System</Badge>
                      )}
                    </td>
                    <td>
                      <Badge color={row.color || colorFor(row.code)}>{row.label}</Badge>
                    </td>
                    <td className="text-muted" style={{ fontSize: 12, maxWidth: 220 }}>
                      {(row.allowed_next || []).length === 0
                        ? "—"
                        : row.allowed_next.join(", ")}
                    </td>
                    <td>
                      {row.is_initial && <Badge color="info" className="me-1 mb-1">Initial</Badge>}
                      {row.is_terminal && <Badge color="dark" className="me-1 mb-1">Terminal</Badge>}
                      {row.is_locked && <Badge color="secondary" className="me-1 mb-1">Locked</Badge>}
                    </td>
                    <td>
                      {row.is_active ? (
                        <Badge color="success">Active</Badge>
                      ) : (
                        <Badge color="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td className="text-end">
                      <Button
                        color="link"
                        size="sm"
                        className="p-0 me-3"
                        onClick={() => openEditModal(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        color="link"
                        size="sm"
                        className={`p-0 ${row.is_active ? "text-danger" : "text-success"}`}
                        onClick={() => handleToggleActive(row)}
                      >
                        {row.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </CardBody>

      <Modal isOpen={modalOpen} toggle={closeModal} centered size="lg">
        <ModalHeader toggle={closeModal}>
          {form.id ? "Edit Status" : "Add Status"} —{" "}
          {form.scope === "run" ? "Payroll Run" : "Payslip"}
          {form.is_system && (
            <Badge color="light" className="text-dark border ms-2">System</Badge>
          )}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md={7}>
                <FormGroup>
                  <Label for="statusCode">Code</Label>
                  <Input
                    id="statusCode"
                    placeholder="e.g. pending_approval"
                    value={form.code}
                    invalid={!!errors.code}
                    disabled={isFieldLocked("code")}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                  {errors.code && <div className="text-danger small mt-1">{errors.code}</div>}
                  {isFieldLocked("code") && (
                    <small className="text-muted d-block mt-1">
                      Code is fixed for system statuses.
                    </small>
                  )}
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup>
                  <Label for="statusOrder">Order</Label>
                  <Input
                    id="statusOrder"
                    type="number"
                    value={form.sort_order}
                    invalid={!!errors.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  />
                  {errors.sort_order && (
                    <div className="text-danger small mt-1">{errors.sort_order}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label for="statusLabel">Label</Label>
              <Input
                id="statusLabel"
                placeholder="e.g. Pending Approval"
                value={form.label}
                invalid={!!errors.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
              {errors.label && <div className="text-danger small mt-1">{errors.label}</div>}
            </FormGroup>

            <FormGroup>
              <Label for="statusDescription">Description</Label>
              <Input
                id="statusDescription"
                type="textarea"
                rows={2}
                placeholder="Optional note for other admins about when this status applies"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </FormGroup>

            <Row>
              <Col md={7}>
                <FormGroup>
                  <Label>Badge Color</Label>
                  <Select
                    options={colorOptions}
                    value={form.color}
                    onChange={(opt) => setForm({ ...form, color: opt })}
                  />
                </FormGroup>
              </Col>
              <Col md={5}>
                <div className="mt-4 pt-2">
                  <span className="text-muted small">Preview: </span>
                  <Badge color={form.color?.value || "secondary"}>{form.label || "Label"}</Badge>
                </div>
              </Col>
            </Row>

            <FormGroup>
              <Label>Next Statuses</Label>
              <Select
                isMulti
                options={nextOptions}
                value={form.allowed_next}
                onChange={(opts) => setForm({ ...form, allowed_next: opts || [] })}
                placeholder="Statuses this one can move to..."
              />
              <small className="text-muted d-block mt-1">
                Controls what shows up in the "Move to…" dropdown wherever this status is used.
              </small>
            </FormGroup>

            {form.scope === "payslip" && (
              <FormGroup>
                <Label>Requires Run At Least</Label>
                <Select
                  isMulti
                  options={runCodeOptions}
                  value={form.requires_run_at_least}
                  onChange={(opts) =>
                    setForm({ ...form, requires_run_at_least: opts || [] })
                  }
                  isDisabled={isFieldLocked("requires_run_at_least")}
                  placeholder="Run statuses that must apply for a payslip to enter this status..."
                />
                {isFieldLocked("requires_run_at_least") && (
                  <small className="text-muted d-block mt-1">
                    Fixed for system statuses.
                  </small>
                )}
              </FormGroup>
            )}

            <Row>
              <Col md={4}>
                <FormGroup switch>
                  <Input
                    type="switch"
                    role="switch"
                    id="statusInitial"
                    checked={form.is_initial}
                    disabled={isFieldLocked("is_initial")}
                    onChange={(e) => setForm({ ...form, is_initial: e.target.checked })}
                  />
                  <Label for="statusInitial" check>Initial (entry state)</Label>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup switch>
                  <Input
                    type="switch"
                    role="switch"
                    id="statusTerminal"
                    checked={form.is_terminal}
                    disabled={isFieldLocked("is_terminal")}
                    onChange={(e) => setForm({ ...form, is_terminal: e.target.checked })}
                  />
                  <Label for="statusTerminal" check>Terminal (no exits)</Label>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup switch>
                  <Input
                    type="switch"
                    role="switch"
                    id="statusLocked"
                    checked={form.is_locked}
                    disabled={isFieldLocked("is_locked")}
                    onChange={(e) => setForm({ ...form, is_locked: e.target.checked })}
                  />
                  <Label for="statusLocked" check>Locked (freezes edits)</Label>
                </FormGroup>
              </Col>
            </Row>

            {form.scope === "run" && (
              <FormGroup switch>
                <Input
                  type="switch"
                  role="switch"
                  id="statusEditable"
                  checked={form.is_editable}
                  onChange={(e) => setForm({ ...form, is_editable: e.target.checked })}
                />
                <Label for="statusEditable" check>
                  Payslips can be edited while a run is in this status
                </Label>
              </FormGroup>
            )}

            <FormGroup switch>
              <Input
                type="switch"
                role="switch"
                id="statusActive"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <Label for="statusActive" check>Active</Label>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={closeModal} disabled={saving}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : form.id ? "Save Changes" : "Create"}
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};

export default StatusMasterTab;