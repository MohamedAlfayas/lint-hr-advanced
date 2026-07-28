// IncomeTaxPolicySettings.jsx — company income-tax (TDS) policy, BOTH REGIMES.
// Versioned (GET list, Edit / New Version, PUT/POST). A regime switch drives
// the slab table, surcharge table, rebate/std-deduction fields and the live
// preview. Slabs & surcharge for both regimes are saved together.
import React, { useEffect, useState, useMemo } from "react";
import {
  Card, CardHeader, CardBody, CardTitle, CardSubtitle,
  Col, Row, Label, Button, Input, Badge, Table,
} from "reactstrap";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";

const REGIMES = [{ v: "new", l: "New Regime" }, { v: "old", l: "Old Regime" }];

const SectionLabel = ({ children, right }) => (
  <div className="d-flex align-items-center justify-content-between mb-2">
    <p className="text-uppercase fw-semibold text-muted mb-0" style={{ fontSize: 11, letterSpacing: ".8px" }}>{children}</p>
    {right}
  </div>
);
const SettingRow = ({ label, children, last = false }) => (
  <Row className={`align-items-center px-3 py-2 g-0${!last ? " border-bottom" : ""}`}>
    <Col sm={5} md={4}><Label className="mb-0 text-muted" style={{ fontSize: 13 }}>{label}</Label></Col>
    <Col sm={7} md={8}>{children}</Col>
  </Row>
);
const ViewToggle = ({ checked, label }) => (
  <div className="d-flex align-items-center gap-2">
    <span style={{ display: "inline-block", width: 36, height: 20, borderRadius: 12, background: checked ? "#0ab39c" : "#ced4da", position: "relative", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: checked ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
    </span>{label && <span style={{ fontSize: 13 }}>{label}</span>}
  </div>
);
const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const D = (v) => (v === "" || v == null ? 0 : Number(v));

// client mirror of the engine (preview only), regime-aware
function previewTax(taxable, regime, slabs, bands, p) {
  const ti = Math.max(taxable, 0);
  let base = 0;
  [...slabs].sort((a, b) => D(a.lower_limit) - D(b.lower_limit)).forEach((s) => {
    const lo = D(s.lower_limit);
    const hi = s.upper_limit === "" || s.upper_limit == null ? Infinity : D(s.upper_limit);
    if (ti > lo) base += (Math.min(ti, hi) - lo) * D(s.rate_percent) / 100;
  });
  const limit = D(regime === "new" ? p.rebate_87a_income_limit_new : p.rebate_87a_income_limit_old);
  const maxr = D(regime === "new" ? p.rebate_87a_max_amount_new : p.rebate_87a_max_amount_old);
  let rebate = ti <= limit ? Math.min(base, maxr) : 0;
  let after = Math.max(base - rebate, 0);
  let relief = 0;
  if (regime === "new" && p.apply_marginal_relief_new && ti > limit) {
    const ex = ti - limit; if (after > ex) { relief = after - ex; after = ex; }
  }
  let rate = 0;
  [...bands].sort((a, b) => D(a.income_threshold) - D(b.income_threshold))
    .forEach((b) => { if (ti > D(b.income_threshold)) rate = D(b.rate_percent); });
  const sur = after * rate / 100;
  const cess = (after + sur) * D(p.cess_percent) / 100;
  return { base, rebate, relief, sur, cess, total: after + sur + cess };
}

const emptyForm = () => ({
  effective_date: "", financial_year: "", default_regime: "new",
  standard_deduction_new: "75000.00", standard_deduction_old: "50000.00",
  rebate_87a_income_limit_new: "1200000.00", rebate_87a_max_amount_new: "60000.00",
  rebate_87a_income_limit_old: "500000.00", rebate_87a_max_amount_old: "12500.00",
  apply_marginal_relief_new: true,
  cap_80c: "150000.00", cap_80ccd_1b: "50000.00", cap_80d: "100000.00",
  cap_80tta: "10000.00", cap_section24: "200000.00",
  hra_metro_percent: "50.00", hra_nonmetro_percent: "40.00", hra_rent_minus_basic_percent: "10.00",
  cess_percent: "4.00", round_tds_to_nearest_10: true, is_active: true,
  slabs: [
    { regime: "new", lower_limit: "0", upper_limit: "400000", rate_percent: "0" },
    { regime: "new", lower_limit: "400000", upper_limit: "800000", rate_percent: "5" },
    { regime: "new", lower_limit: "800000", upper_limit: "1200000", rate_percent: "10" },
    { regime: "new", lower_limit: "1200000", upper_limit: "1600000", rate_percent: "15" },
    { regime: "new", lower_limit: "1600000", upper_limit: "2000000", rate_percent: "20" },
    { regime: "new", lower_limit: "2000000", upper_limit: "2400000", rate_percent: "25" },
    { regime: "new", lower_limit: "2400000", upper_limit: "", rate_percent: "30" },
    { regime: "old", lower_limit: "0", upper_limit: "250000", rate_percent: "0" },
    { regime: "old", lower_limit: "250000", upper_limit: "500000", rate_percent: "5" },
    { regime: "old", lower_limit: "500000", upper_limit: "1000000", rate_percent: "20" },
    { regime: "old", lower_limit: "1000000", upper_limit: "", rate_percent: "30" },
  ],
  surcharge_bands: [
    { regime: "new", income_threshold: "5000000", rate_percent: "10" },
    { regime: "new", income_threshold: "10000000", rate_percent: "15" },
    { regime: "new", income_threshold: "20000000", rate_percent: "25" },
    { regime: "old", income_threshold: "5000000", rate_percent: "10" },
    { regime: "old", income_threshold: "10000000", rate_percent: "15" },
    { regime: "old", income_threshold: "20000000", rate_percent: "25" },
    { regime: "old", income_threshold: "50000000", rate_percent: "37" },
  ],
});

const IncomeTaxPolicySettings = () => {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [regime, setRegime] = useState("new");
  const [previewIncome, setPreviewIncome] = useState("1300000");

  const fetchData = () => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/income-tax-policy/" })
      .then((res) => {
        const list = res?.data?.data || [];
        setRecords(list); setIsEmpty(list.length === 0);
        if (list.length) setForm({ ...list[0] });
      }).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const data = form || {};
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const tog = (f) => setForm((p) => ({ ...p, [f]: !p[f] }));

  // slab / band ops scoped to the active regime
  const slabsOf = (r) => (data.slabs || []).map((s, i) => ({ ...s, _i: i })).filter((s) => s.regime === r);
  const bandsOf = (r) => (data.surcharge_bands || []).map((b, i) => ({ ...b, _i: i })).filter((b) => b.regime === r);
  const setSlab = (i, k, v) => setForm((p) => ({ ...p, slabs: p.slabs.map((s, idx) => idx === i ? { ...s, [k]: v } : s) }));
  const addSlab = () => setForm((p) => ({ ...p, slabs: [...p.slabs, { regime, lower_limit: "", upper_limit: "", rate_percent: "" }] }));
  const delSlab = (i) => setForm((p) => ({ ...p, slabs: p.slabs.filter((_, idx) => idx !== i) }));
  const setBand = (i, k, v) => setForm((p) => ({ ...p, surcharge_bands: p.surcharge_bands.map((b, idx) => idx === i ? { ...b, [k]: v } : b) }));
  const addBand = () => setForm((p) => ({ ...p, surcharge_bands: [...p.surcharge_bands, { regime, income_threshold: "", rate_percent: "" }] }));
  const delBand = (i) => setForm((p) => ({ ...p, surcharge_bands: p.surcharge_bands.filter((_, idx) => idx !== i) }));

  const stdKey = regime === "new" ? "standard_deduction_new" : "standard_deduction_old";

  const preview = useMemo(() => {
    if (!form) return null;
    const taxable = Math.max(D(previewIncome) - D(form[stdKey]), 0);
    return { taxable, ...previewTax(taxable, regime, slabsOf(regime), bandsOf(regime), form) };
  }, [form, previewIncome, regime]);

  const validateRegime = (r) => {
    const rows = slabsOf(r).sort((a, b) => D(a.lower_limit) - D(b.lower_limit));
    if (!rows.length) return toast.error(`Add slabs for ${r} regime`), false;
    if (D(rows[0].lower_limit) !== 0) return toast.error(`${r}: first slab must start at 0`), false;
    for (let i = 0; i < rows.length - 1; i++)
      if (D(rows[i].upper_limit) !== D(rows[i + 1].lower_limit)) return toast.error(`${r}: slabs must be contiguous`), false;
    if (rows[rows.length - 1].upper_limit !== "" && rows[rows.length - 1].upper_limit != null)
      return toast.error(`${r}: top slab must be open-ended`), false;
    return true;
  };
  const validate = () => {
    if (!form.effective_date) return toast.error("Effective date required"), false;
    if (!form.financial_year) return toast.error("Financial year required"), false;
    return validateRegime("new") && validateRegime("old");
  };

  const save = () => {
    if (!validate()) return;
    setLoading(true);
    const isUpdate = !!form.id;
    Api({ method: isUpdate ? "PUT" : "POST", url: "payroll/income-tax-policy/", data: form })
      .then((res) => { toast.success(res?.data?.message || "Saved"); fetchData(); setIsEditing(false); })
      .catch((err) => toast.error(err?.response?.data?.message || "Failed to save"))
      .finally(() => setLoading(false));
  };
  const startNew = () => { setForm(emptyForm()); setIsEmpty(false); setIsEditing(true); };
  const cancel = () => { if (records.length) setForm({ ...records[0] }); setIsEditing(false); };

  const RegimeTabs = () => (
    <div className="d-flex gap-2 mb-3">
      {REGIMES.map((r) => (
        <Button key={r.v} size="sm" color={regime === r.v ? "primary" : "light"}
          className={regime === r.v ? "" : "border"} onClick={() => setRegime(r.v)}>{r.l}</Button>
      ))}
    </div>
  );

  if (isEmpty && !isEditing) {
    return (
      <Card>
        <CardHeader className="bg-light"><CardTitle tag="h5" className="mb-0">Income Tax Policy</CardTitle></CardHeader>
        <CardBody>
          <div className="text-center py-5">
            <div className="avatar-md mx-auto mb-4"><div className="avatar-title bg-light rounded-circle text-muted fs-28"><i className="ri-percent-line"></i></div></div>
            <h6 className="mb-1">No Income Tax Policy Configured</h6>
            <p className="text-muted mb-4" style={{ fontSize: 13 }}>Set slabs, rebate, surcharge & cess for both regimes.</p>
            <Button color="primary" onClick={startNew}><i className="ri-add-line align-bottom me-1"></i> Configure Policy</Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-light d-flex justify-content-between align-items-center">
        <div>
          <CardTitle tag="h5" className="mb-0">Income Tax Policy</CardTitle>
          <CardSubtitle className="text-muted mt-1" style={{ fontSize: 12 }}>New & old regime — slabs, 87A rebate, surcharge, cess & old-regime caps. Drives monthly TDS.</CardSubtitle>
        </div>
        {!isEditing && (
          <div className="d-flex gap-2">
            <Button size="sm" color="primary" outline onClick={() => { setForm({ ...records[0] }); setIsEditing(true); }}><i className="ri-edit-line fs-14"></i> Edit</Button>
            <Button size="sm" color="success" outline onClick={startNew}><i className="ri-add-line fs-14"></i> New Version</Button>
          </div>
        )}
      </CardHeader>

      <CardBody className="p-4">
        {!isEditing && records.length > 1 && (
          <div className="d-flex gap-2 flex-wrap mb-4">
            {records.map((r, i) => (
              <Badge key={r.id} color={form?.id === r.id ? "primary" : "light"} className={form?.id === r.id ? "" : "text-dark border"}
                style={{ cursor: "pointer", fontSize: 12, padding: "5px 12px" }} onClick={() => setForm({ ...r })}>
                FY {r.financial_year}{i === 0 && <span className="ms-1">· Latest</span>}
              </Badge>
            ))}
          </div>
        )}

        {!isEditing && (
          <div className={`alert d-flex align-items-center gap-2 py-2 px-3 mb-4 ${data.is_active ? "alert-success" : "alert-secondary"}`}>
            <i className={`fs-16 ${data.is_active ? "ri-checkbox-circle-fill" : "ri-close-circle-line"}`}></i>
            <span style={{ fontSize: 13 }}><strong>Policy is {data.is_active ? "Active" : "Inactive"}</strong>
              {data.financial_year && <span className="ms-2 opacity-75">· FY {data.financial_year} · default {data.default_regime} regime</span>}</span>
          </div>
        )}

        <SectionLabel>General</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Financial Year">{isEditing ? <Input value={form.financial_year || ""} placeholder="2025-26" style={{ width: 160 }} onChange={(e) => set("financial_year", e.target.value)} /> : <span style={{ fontSize: 13 }}>{data.financial_year || "—"}</span>}</SettingRow>
          <SettingRow label="Effective Date">{isEditing ? <Input type="date" value={form.effective_date || ""} style={{ width: 180 }} onChange={(e) => set("effective_date", e.target.value)} /> : <span style={{ fontSize: 13 }}>{data.effective_date || "—"}</span>}</SettingRow>
          <SettingRow label="Default Regime">{isEditing ? (
            <div className="d-flex gap-2">{REGIMES.map((r) => <Button key={r.v} size="sm" color={form.default_regime === r.v ? "primary" : "light"} className={form.default_regime === r.v ? "" : "border"} onClick={() => set("default_regime", r.v)}>{r.l}</Button>)}</div>
          ) : <Badge color="primary" pill style={{ fontSize: 12 }}>{data.default_regime}</Badge>}</SettingRow>
          <SettingRow label="Cess (%)">{isEditing ? <Input type="number" value={form.cess_percent} style={{ width: 100 }} onChange={(e) => set("cess_percent", e.target.value)} /> : <span style={{ fontSize: 13 }}>{data.cess_percent}%</span>}</SettingRow>
          <SettingRow label="Round TDS to ₹10">{isEditing ? <div className="form-check form-switch mb-0"><Input className="form-check-input" type="checkbox" checked={!!form.round_tds_to_nearest_10} onChange={() => tog("round_tds_to_nearest_10")} /></div> : <ViewToggle checked={!!data.round_tds_to_nearest_10} />}</SettingRow>
          <SettingRow label="Status" last>{isEditing ? <div className="form-check form-switch mb-0"><Input className="form-check-input" type="checkbox" checked={!!form.is_active} onChange={() => tog("is_active")} /></div> : <ViewToggle checked={!!data.is_active} label={data.is_active ? "Active" : "Inactive"} />}</SettingRow>
        </div>

        {/* ── regime-scoped section ── */}
        <RegimeTabs />

        <SectionLabel>{regime === "new" ? "New" : "Old"} Regime — Deductions & Rebate</SectionLabel>
        <div className="border rounded mb-4">
          <SettingRow label="Standard Deduction">{isEditing ? <Input type="number" value={form[stdKey]} style={{ width: 140 }} onChange={(e) => set(stdKey, e.target.value)} /> : <span style={{ fontSize: 13 }}>{inr(data[stdKey])}</span>}</SettingRow>
          <SettingRow label="87A Rebate — Income Limit">{isEditing ? <Input type="number" value={form[regime === "new" ? "rebate_87a_income_limit_new" : "rebate_87a_income_limit_old"]} style={{ width: 160 }} onChange={(e) => set(regime === "new" ? "rebate_87a_income_limit_new" : "rebate_87a_income_limit_old", e.target.value)} /> : <span style={{ fontSize: 13 }}>{inr(data[regime === "new" ? "rebate_87a_income_limit_new" : "rebate_87a_income_limit_old"])}</span>}</SettingRow>
          <SettingRow label="87A Rebate — Max Amount" last={regime === "old"}>{isEditing ? <Input type="number" value={form[regime === "new" ? "rebate_87a_max_amount_new" : "rebate_87a_max_amount_old"]} style={{ width: 140 }} onChange={(e) => set(regime === "new" ? "rebate_87a_max_amount_new" : "rebate_87a_max_amount_old", e.target.value)} /> : <span style={{ fontSize: 13 }}>{inr(data[regime === "new" ? "rebate_87a_max_amount_new" : "rebate_87a_max_amount_old"])}</span>}</SettingRow>
          {regime === "new" && <SettingRow label="Marginal Relief" last>{isEditing ? <div className="form-check form-switch mb-0"><Input className="form-check-input" type="checkbox" checked={!!form.apply_marginal_relief_new} onChange={() => tog("apply_marginal_relief_new")} /></div> : <ViewToggle checked={!!data.apply_marginal_relief_new} />}</SettingRow>}
        </div>

        {regime === "old" && (
          <>
            <SectionLabel>Old Regime — Chapter VI-A Caps & HRA</SectionLabel>
            <div className="border rounded mb-4">
              {[["cap_80c", "80C cap"], ["cap_80ccd_1b", "80CCD(1B) cap"], ["cap_80d", "80D cap"], ["cap_80tta", "80TTA cap"], ["cap_section24", "Sec 24 (home-loan int.) cap"]].map(([k, lbl]) => (
                <SettingRow key={k} label={lbl}>{isEditing ? <Input type="number" value={form[k]} style={{ width: 140 }} onChange={(e) => set(k, e.target.value)} /> : <span style={{ fontSize: 13 }}>{inr(data[k])}</span>}</SettingRow>
              ))}
              <SettingRow label="HRA — Metro %">{isEditing ? <Input type="number" value={form.hra_metro_percent} style={{ width: 100 }} onChange={(e) => set("hra_metro_percent", e.target.value)} /> : <span style={{ fontSize: 13 }}>{data.hra_metro_percent}%</span>}</SettingRow>
              <SettingRow label="HRA — Non-metro %">{isEditing ? <Input type="number" value={form.hra_nonmetro_percent} style={{ width: 100 }} onChange={(e) => set("hra_nonmetro_percent", e.target.value)} /> : <span style={{ fontSize: 13 }}>{data.hra_nonmetro_percent}%</span>}</SettingRow>
              <SettingRow label="HRA — Rent minus % of Basic" last>{isEditing ? <Input type="number" value={form.hra_rent_minus_basic_percent} style={{ width: 100 }} onChange={(e) => set("hra_rent_minus_basic_percent", e.target.value)} /> : <span style={{ fontSize: 13 }}>{data.hra_rent_minus_basic_percent}%</span>}</SettingRow>
            </div>
          </>
        )}

        <SectionLabel right={isEditing && <Button size="sm" color="success" outline onClick={addSlab}><i className="ri-add-line fs-14"></i> Add Slab</Button>}>{regime === "new" ? "New" : "Old"} Regime — Tax Slabs</SectionLabel>
        <Table bordered responsive className="mb-4" style={{ fontSize: 13 }}>
          <thead className="table-light"><tr><th>From (₹)</th><th>To (₹)</th><th>Rate (%)</th>{isEditing && <th style={{ width: 40 }}></th>}</tr></thead>
          <tbody>
            {slabsOf(regime).map((s) => (
              <tr key={s._i}>
                <td>{isEditing ? <Input bsSize="sm" type="number" value={s.lower_limit} onChange={(e) => setSlab(s._i, "lower_limit", e.target.value)} /> : inr(s.lower_limit)}</td>
                <td>{isEditing ? <Input bsSize="sm" type="number" value={s.upper_limit ?? ""} placeholder="∞ (blank = top)" onChange={(e) => setSlab(s._i, "upper_limit", e.target.value)} /> : (s.upper_limit ? inr(s.upper_limit) : "and above")}</td>
                <td>{isEditing ? <Input bsSize="sm" type="number" value={s.rate_percent} onChange={(e) => setSlab(s._i, "rate_percent", e.target.value)} /> : `${s.rate_percent}%`}</td>
                {isEditing && <td className="text-center"><i className="ri-delete-bin-line text-danger" style={{ cursor: "pointer" }} onClick={() => delSlab(s._i)}></i></td>}
              </tr>
            ))}
          </tbody>
        </Table>

        <SectionLabel right={isEditing && <Button size="sm" color="success" outline onClick={addBand}><i className="ri-add-line fs-14"></i> Add Band</Button>}>{regime === "new" ? "New" : "Old"} Regime — Surcharge Bands</SectionLabel>
        <Table bordered responsive className="mb-4" style={{ fontSize: 13 }}>
          <thead className="table-light"><tr><th>Income above (₹)</th><th>Surcharge (%)</th>{isEditing && <th style={{ width: 40 }}></th>}</tr></thead>
          <tbody>
            {bandsOf(regime).map((b) => (
              <tr key={b._i}>
                <td>{isEditing ? <Input bsSize="sm" type="number" value={b.income_threshold} onChange={(e) => setBand(b._i, "income_threshold", e.target.value)} /> : inr(b.income_threshold)}</td>
                <td>{isEditing ? <Input bsSize="sm" type="number" value={b.rate_percent} onChange={(e) => setBand(b._i, "rate_percent", e.target.value)} /> : `${b.rate_percent}%`}</td>
                {isEditing && <td className="text-center"><i className="ri-delete-bin-line text-danger" style={{ cursor: "pointer" }} onClick={() => delBand(b._i)}></i></td>}
              </tr>
            ))}
          </tbody>
        </Table>

        <SectionLabel>Tax Preview — {regime === "new" ? "New" : "Old"} Regime (annual)</SectionLabel>
        <div className="border rounded p-3 mb-4 bg-light">
          <Row className="align-items-center g-2 mb-3">
            <Col xs="auto"><Label className="mb-0" style={{ fontSize: 13 }}>Annual taxable gross</Label></Col>
            <Col xs="auto"><Input type="number" value={previewIncome} style={{ width: 180 }} onChange={(e) => setPreviewIncome(e.target.value)} /></Col>
            <Col xs="auto" className="text-muted" style={{ fontSize: 12 }}>− std {inr(data[stdKey])} = taxable {inr(preview?.taxable)} {regime === "old" && "(before HRA/80C — set per employee)"}</Col>
          </Row>
          {preview && (
            <Row className="g-3">
              {[["Slab tax", preview.base], ["87A rebate", -preview.rebate], ["Marginal relief", -preview.relief], ["Surcharge", preview.sur], ["Cess", preview.cess]].map(([k, v]) => (
                <Col key={k} md={2} xs={6}><div className="text-muted" style={{ fontSize: 11 }}>{k}</div><div className="fw-semibold" style={{ fontSize: 14 }}>{inr(v)}</div></Col>
              ))}
              <Col md={2} xs={6}><div className="text-muted" style={{ fontSize: 11 }}>Annual tax</div><div className="fw-bold text-primary" style={{ fontSize: 16 }}>{inr(preview.total)}</div><div className="text-muted" style={{ fontSize: 11 }}>≈ {inr(preview.total / 12)}/mo</div></Col>
            </Row>
          )}
        </div>

        {isEditing && (
          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button color="light" className="border" onClick={cancel} disabled={loading}>Cancel</Button>
            <Button color="success" onClick={save} disabled={loading}><i className="ri-check-double-line align-middle me-1"></i>{loading ? "Saving…" : "Save Changes"}</Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default IncomeTaxPolicySettings;