import React, { useState, useEffect } from "react";
import { Button, Input, Label, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Api } from "../../../common/api/Api";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import {
  editPTSetting,
  addPTSetting,
} from "../../../redux/reducers/ChildReducer/PTSettingsReducer";
import { testId, itemTestKey } from "../../../shared/testing/testId";
import "./PTSettings.scss";

const CYCLE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "half_yearly", label: "Half-Yearly" },
  { value: "yearly", label: "Yearly" },
];

const formatStateLabel = (value) => {
  if (!value) return "";
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const createRow = (data = {}, index = 0) => ({
  _uid: `${Date.now()}_${index}_${Math.random()}`,
  start: data?.start ?? "",
  end: data?.end ?? "",
  amount: data?.amount ?? "",
});

const PTSettingsForm = () => {
  const dispatch = useDispatch();
  const formObj = useSelector((state) => state.RightSideBarReducer?.form_obj);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    state: "",
    deduction_cycle: "monthly",
    slab_basis: "monthly",
    is_active: true,
  });
  const [tableData, setTableData] = useState([createRow()]);

  const isEdit = Boolean(form.id);

  useEffect(() => {
    if (!formObj || !formObj.id) {
      setForm({
        id: formObj?.id,
        state: formObj?.state || "",
        deduction_cycle: formObj?.deduction_cycle || "monthly",
        slab_basis: formObj?.slab_basis || "monthly",
        is_active: formObj?.is_active ?? true,
      });
      setTableData([createRow()]);
      return;
    }
    setForm({
      id: formObj.id,
      state: formObj.state || "",
      deduction_cycle: formObj.deduction_cycle || "monthly",
      slab_basis: formObj.slab_basis || "monthly",
    });
    setTableData(
      Array.isArray(formObj.slabs) && formObj.slabs.length > 0
        ? formObj.slabs.map((s, i) => createRow(s, i))
        : [createRow()]
    );
  }, [formObj]);

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  // ─── Core: update a field, then re-cascade ALL starts from row 1 onward ──
  const updateRow = (_uid, field, value) => {
    setTableData((prev) => {
      const idx = prev.findIndex((row) => row._uid === _uid);
      if (idx === -1) return prev;

      // 1. Apply the change
      const updated = prev.map((row, i) =>
        i === idx ? { ...row, [field]: value } : { ...row }
      );

      // 2. If end changed, cascade: set every subsequent row's start = prevEnd + 1
      if (field === "end") {
        for (let i = idx + 1; i < updated.length; i++) {
          const prevEnd = updated[i - 1].end;
          if (prevEnd === "" || prevEnd === null || prevEnd === undefined) break;
          updated[i] = { ...updated[i], start: String(Number(prevEnd) + 1) };
        }
      }

      return updated;
    });
  };

  // ─── Blur validation for end field only ───────────────────────────────────
  const validateEndOnBlur = (_uid) => {
    setTableData((prev) => {
      const idx = prev.findIndex((row) => row._uid === _uid);
      if (idx === -1) return prev;

      const row = prev[idx];
      const endVal = row.end;
      const startVal = row.start;

      if (endVal === "" || startVal === "") return prev;

      if (Number(endVal) < Number(startVal)) {
        toast.error(`Slab ${idx + 1}: End must be ≥ Start (${startVal})`);
        const updated = prev.map((r, i) =>
          i === idx ? { ...r, end: startVal } : { ...r }
        );
        // Re-cascade after correction
        for (let i = idx + 1; i < updated.length; i++) {
          const prevEnd = updated[i - 1].end;
          if (prevEnd === "" || prevEnd === null) break;
          updated[i] = { ...updated[i], start: String(Number(prevEnd) + 1) };
        }
        return updated;
      }

      return prev;
    });
  };

  // ─── Add row: start = last end + 1 ───────────────────────────────────────
  const addRow = () => {
    setTableData((prev) => {
      const lastRow = prev[prev.length - 1];
      if (lastRow?.end === "" || lastRow?.end === undefined) {
        toast.error("Please fill in the End value of the current slab before adding a new one.");
        return prev;
      }
      const newStart = Number(lastRow.end) + 1;
      return [...prev, createRow({ start: newStart }, prev.length)];
    });
  };

  // ─── Delete row: re-cascade starts after deletion ─────────────────────────
  const deleteRow = (_uid) => {
    setTableData((prev) => {
      const filtered = prev.filter((row) => row._uid !== _uid);
      // Re-cascade all starts from row 1
      for (let i = 1; i < filtered.length; i++) {
        const prevEnd = filtered[i - 1].end;
        if (prevEnd === "" || prevEnd === null || prevEnd === undefined) break;
        filtered[i] = { ...filtered[i], start: String(Number(prevEnd) + 1) };
      }
      return filtered;
    });
  };

  const validate = () => {
    if (!form.state) { toast.error("State is required"); return false; }
    if (!tableData.length) { toast.error("At least one slab is required"); return false; }
    for (let i = 0; i < tableData.length; i++) {
      const r = tableData[i];
      if (r.start === "" || r.end === "" || r.amount === "") {
        toast.error(`Slab ${i + 1}: All fields required`); return false;
      }
      if (Number(r.end) < Number(r.start)) {
        toast.error(`Slab ${i + 1}: End must be ≥ Start`); return false;
      }
      if (i > 0 && Number(r.start) <= Number(tableData[i - 1].end)) {
        toast.error(`Slab ${i + 1}: Start must be > previous End`); return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      id: form.id,
      state: form.state,
      deduction_cycle: form.deduction_cycle,
      slab_basis: form.slab_basis,
      is_active: form.is_active,
      slabs: tableData.map((r) => ({
        start: Number(r.start),
        end: Number(r.end),
        amount: Number(r.amount),
      })),
    };
    Api({ method: "PUT", url: "payroll/pt-settings/", data: payload })
      .then((res) => {
        if (res?.status === 200) {
          toast.success(res?.data?.message || "Saved successfully");
          const updatedItem = res?.data?.data ?? payload;
          if (isEdit) dispatch(editPTSetting(updatedItem));
          else dispatch(addPTSetting(updatedItem));
          dispatch(toggleRSBView(false));
        } else {
          toast.error("Save failed");
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Error occurred"))
      .finally(() => setSaving(false));
  };

  const filledAmounts = tableData.map((r) => Number(r.amount) || 0);
  const maxAmount = filledAmounts.length ? Math.max(...filledAmounts) : 0;

  return (
    <div className="ptf">
      <div className="ptf-scroll">
        {/* ── 1. Basics ── */}
        <section className="ptf-section">
          <div className="ptf-section-head">
            <span className="ptf-step">1</span>
            <div>
              <h6>State & cycle</h6>
              <p>Where this tax applies and how often it's deducted</p>
            </div>
          </div>

          <div className="ptf-field">
            <Label>State <span className="text-danger">*</span></Label>
            {isEdit ? (
              <>
                <div className="ptf-locked">
                  <i className="ri-map-pin-2-line"></i>
                  {formatStateLabel(form.state)}
                  <i className="ri-lock-line ptf-locked-icon" title="Locked"></i>
                </div>
                <small className="ptf-hint">State cannot be changed after creation.</small>
              </>
            ) : (
              <Input
                data-testid="pt-settings-form-enter-state-key-e-input"
                value={form.state}
                onChange={(e) => setField("state", e.target.value)}
                placeholder="Enter state key (e.g. tamil_nadu)"
              />
            )}
          </div>

          <div className="ptf-row">
            <div className="ptf-field">
              <Label>Deduction Cycle</Label>
              <Input
                data-testid="pt-settings-form-deduction-cycle-select" type="select" value={form.deduction_cycle}
                onChange={(e) => setField("deduction_cycle", e.target.value)}>
                {CYCLE_OPTIONS.map((o) => <option data-testid={testId("pt-settings-form-deduction-cycle-option", itemTestKey(o))} key={o.value} value={o.value}>{o.label}</option>)}
              </Input>
            </div>
            <div className="ptf-field">
              <Label>Slab Basis</Label>
              <Input
                data-testid="pt-settings-form-slab-basis-select" type="select" value={form.slab_basis}
                onChange={(e) => setField("slab_basis", e.target.value)}>
                {CYCLE_OPTIONS.map((o) => <option data-testid={testId("pt-settings-form-slab-basis-option", itemTestKey(o))} key={o.value} value={o.value}>{o.label}</option>)}
              </Input>
            </div>
          </div>
        </section>

        {/* ── 2. Slabs ── */}
        <section className="ptf-section">
          <div className="ptf-section-head">
            <span className="ptf-step">2</span>
            <div>
              <h6>Tax slabs</h6>
              <p>Gross salary ranges and the PT amount for each</p>
            </div>
            <span className="ptf-badge">
              {tableData.length} slab{tableData.length === 1 ? "" : "s"} · max ₹{maxAmount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="ptf-slab-head" aria-hidden="true">
            <span />
            <span>Start (₹)</span>
            <span>End (₹)</span>
            <span>Amount (₹)</span>
            <span />
          </div>

          <ol className="ptf-slabs">
            {tableData.map((row, i) => (
              <li key={row._uid} className="ptf-slab">
                <span className="ptf-slab-no">{i + 1}</span>

                {/* START — editable only for row 0, read-only (auto) for rest */}
                <label className="ptf-slab-field">
                  <span className="ptf-slab-label">Start (₹)</span>
                  {i === 0 ? (
                    <Input
                      data-testid="pt-settings-form-first-slab-start-input"
                      type="number"
                      value={row.start}
                      onChange={(e) => updateRow(row._uid, "start", e.target.value)}
                    />
                  ) : (
                    <Input
                      data-testid={testId("pt-settings-form-slab", row.start, "start-input")}
                      type="number"
                      value={row.start}
                      readOnly
                      className="is-auto"
                      title="Auto-calculated from previous row's End"
                    />
                  )}
                </label>

                {/* END — always editable, triggers cascade */}
                <label className="ptf-slab-field">
                  <span className="ptf-slab-label">End (₹)</span>
                  <Input
                    data-testid={testId("pt-settings-form-slab", row.start, "end-input")}
                    type="number"
                    value={row.end}
                    onChange={(e) => updateRow(row._uid, "end", e.target.value)}
                    onBlur={() => validateEndOnBlur(row._uid)}
                  />
                </label>

                <label className="ptf-slab-field">
                  <span className="ptf-slab-label">Amount (₹)</span>
                  <Input
                    data-testid={testId("pt-settings-form-slab", row.start, "amount-input")}
                    type="number"
                    value={row.amount}
                    onChange={(e) => updateRow(row._uid, "amount", e.target.value)}
                  />
                </label>

                <div className="ptf-slab-action">
                  {i !== 0 && (
                    <button
                      data-testid={testId("pt-settings-form-slab", row.start, "delete-button")}
                      type="button"
                      className="ptf-del"
                      title="Remove slab"
                      onClick={() => deleteRow(row._uid)}
                    >
                      <i className="ri-delete-bin-6-line"></i>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <button data-testid="pt-settings-form-add-row-button" type="button" className="ptf-add" onClick={addRow}>
            <i className="ri-add-line"></i>
            Add slab
          </button>

          <p className="ptf-hint mt-2 mb-0">
            <i className="ri-information-line me-1"></i>
            Each slab starts right after the previous one ends. Use 999999 as the last End for "and above".
          </p>
        </section>
      </div>

      <div className="ptf-foot">
        <Button data-testid="pt-settings-form-cancel-button" color="light" className="ptf-cancel" onClick={() => dispatch(toggleRSBView(false))}>Cancel</Button>
        <Button data-testid="pt-settings-form-update-button" color="primary" className="ptf-save" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size="sm" className="me-1" /> : <i className="ri-check-double-line me-1"></i>}
          {isEdit ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default PTSettingsForm;