import { Api } from "../../../common/api/Api";

// Cache used by read-only consumers (StatusBadge, PayslipStatusCell, any
// dropdown that just needs the active status list). Admin screens that need
// to see inactive rows too should use fetchStatusMasterAdmin below instead,
// which always hits the network.
let cache = {
    run: null,
    payslip: null,
};

let pending = {
    run: null,
    payslip: null,
};

// Clears the cache for a scope (or all scopes) so the next fetchStatusMaster
// call hits the network again. Called after every save.
const invalidate = (scope) => {
    if (scope) {
        cache[scope] = null;
        pending[scope] = null;
    } else {
        cache = { run: null, payslip: null };
        pending = { run: null, payslip: null };
    }
};

// Active-only, cached — what everyday consumers (badges, "move to" dropdowns)
// should use.
export const fetchStatusMaster = (scope) => {
    if (cache[scope]) {
        return Promise.resolve(cache[scope]);
    }

    if (pending[scope]) {
        return pending[scope];
    }

    pending[scope] = Api({
        method: "GET",
        url: `payroll/status-master/?scope=${scope}`,
    })
        .then((res) => {
            cache[scope] = res.data.data || [];
            pending[scope] = null;
            return cache[scope];
        })
        .catch((err) => {
            pending[scope] = null;
            throw err;
        });

    return pending[scope];
};

// Always hits the network, never cached — for the Status Master admin screen,
// which needs to see and re-enable inactive rows too. NOTE: the current
// backend GET always filters is_active=True, so include_inactive has no
// effect until the view is updated to honor it; this is here so the admin
// screen picks it up for free the moment that param is supported server-side.
export const fetchStatusMasterAdmin = (scope, includeInactive = true) => {
    const params = new URLSearchParams({ scope });
    if (includeInactive) params.set("include_inactive", "1");
    return Api({ method: "GET", url: `payroll/status-master/?${params.toString()}` }).then(
        (res) => res.data.data || []
    );
};

// Single save call for both create and update, matching
// PayrollStatusMasterApiView.post: id 0 (or omitted) creates, id > 0 updates.
// For an update you can send a partial payload — the backend applies it with
// partial=True — e.g. { id, is_active: false } to just toggle a row off.
export const saveStatusMaster = (payload) => {
    return Api({
        method: "POST",
        url: `payroll/status-master/`,
        data: { id: 0, ...payload },
    }).then((res) => {
        invalidate(payload.scope);
        // scope isn't always present on a partial payload (e.g. a bare
        // { id, is_active } toggle) — if we don't know the scope, clear both
        // so a stale cached list is never served.
        if (!payload.scope) invalidate();
        return res.data.data;
    });
};

export const colorFor = (code) => {
  const map = {
    draft: "warning", processing: "info", computed: "primary",
    pending_approval: "warning", approved: "success", rejected: "danger",
    locked: "dark", paid: "success", closed: "secondary",
    on_hold: "warning", cancelled: "danger",
    pending: "secondary", under_review: "info", finalized: "dark",
    excluded: "secondary", partially_paid: "warning",
  };
  return map[code] || "secondary";
};

// Reached only through the payment release actions, which also write
// paid_amount / balance_amount / PayslipPayment. A generic status move
// would leave those amounts stale.
export const PAYMENT_ONLY_STATUSES = ["paid", "partially_paid"];

// Run statuses that are allowed to release a tranche.
// "finalized" is the same ready-to-pay stage as "locked" in the status master.
export const RUN_RELEASE_STATUSES = ["locked", "finalized", "finalised", "partially_paid"];

export const isPaymentRecorded = (payslip) =>
    PAYMENT_ONLY_STATUSES.includes(payslip?.status);

export const canReleasePayments = (runStatus) =>
    RUN_RELEASE_STATUSES.includes(runStatus);

export const labelFor = (rows, code) => {
    const row = (rows || []).find((r) => r.code === code);
    return row?.label || String(code || "").replace(/_/g, " ");
};

// Empty requires_run_at_least means the target is not constrained.
// Otherwise the run must already be one of those statuses.
export const runAllowsStatus = (statusRow, runStatus) => {
    const required = statusRow?.requires_run_at_least || [];
    if (!required.length) return true;
    return required.includes(runStatus);
};

export const nextStatusCodes = (rows, currentCode, runStatus) => {
    const current = (rows || []).find((r) => r.code === currentCode);
    return (current?.allowed_next || []).filter((code) => {
        if (PAYMENT_ONLY_STATUSES.includes(code)) return false;
        const target = (rows || []).find((r) => r.code === code);
        return runAllowsStatus(target, runStatus);
    });
};

// Targets every selected payslip is allowed to move to.
export const bulkTargetCodes = (rows, payslips, runStatus) => {
    if (!payslips?.length) return [];
    const sets = payslips.map(
        (p) => new Set(nextStatusCodes(rows, p.status, runStatus))
    );
    const [first, ...rest] = sets;
    return [...first].filter((code) => rest.every((set) => set.has(code)));
};

const amountOf = (payslip, field) => parseFloat(payslip?.[field] || 0);

// Pay Full: approved, nothing deferred.
// Release Salary: approved, incentive still deferred (lands on partially_paid).
// Release Balance: partially_paid incentive still outstanding (deferred_amount > 0).
export const paymentEligibility = (payslips = []) => ({
    fullEligible: payslips.filter(
        (p) => p.status === "approved" && !(amountOf(p, "deferred_amount") > 0)
    ),
    salaryEligible: payslips.filter(
        (p) => p.status === "approved" && amountOf(p, "deferred_amount") > 0
    ),
    balanceEligible: payslips.filter(
        (p) =>
            p.status === "partially_paid" &&
            amountOf(p, "balance_amount") > 0 &&
            amountOf(p, "deferred_amount") > 0
    ),
});

// Outstanding balance with no deferred incentive. The payment modal records
// a typed amount against these rows; deferred incentives stay on Release Salary
// / Release Balance.
export const partialAmountEligible = (payslips = []) =>
    payslips.filter(
        (p) =>
            (p.status === "approved" || p.status === "partially_paid") &&
            amountOf(p, "balance_amount") > 0 &&
            !(amountOf(p, "deferred_amount") > 0)
    );

// Approved slips with nothing to pay (net, balance, deferred, and paid are all
// 0). They are not sent through a payslip status change: that call is rejected
// while the run is partially_paid.
export const isZeroSettlement = (payslip) =>
    payslip?.status === "approved" &&
    !(amountOf(payslip, "net_pay") > 0) &&
    !(amountOf(payslip, "balance_amount") > 0) &&
    !(amountOf(payslip, "deferred_amount") > 0) &&
    !(amountOf(payslip, "paid_amount") > 0);

export const zeroSettlementEligible = (payslips = []) =>
    payslips.filter(isZeroSettlement);

// Slips whose money is finished (nothing deferred, nothing left on the balance)
// but whose status is still approved or partially_paid. The run stays
// partially_paid until these are marked paid.
const CLOSED_PAYSLIP_STATUSES = ["paid", "rejected", "cancelled", "excluded"];

export const slipsReadyToMarkPaid = (payslips = []) =>
    payslips.filter(
        (p) =>
            (p.status === "approved" || p.status === "partially_paid") &&
            !(amountOf(p, "balance_amount") > 0) &&
            !(amountOf(p, "deferred_amount") > 0)
    );

export const isRunFullySettled = (payslips = []) =>
    payslips.length > 0 &&
    payslips.every(
        (p) =>
            CLOSED_PAYSLIP_STATUSES.includes(p.status) ||
            slipsReadyToMarkPaid([p]).length > 0
    );

const errorMessage = (err, fallback) => {
    const data = err?.response?.data;
    const raw = data?.error_message || data?.detail || data?.non_field_errors || err?.message || fallback;
    const text = Array.isArray(raw) ? raw.map(String).join(" ") : String(raw || fallback);
    const quoted = text.match(/string="([\s\S]*)",\s*code=/);
    return quoted ? quoted[1] : text;
};

// Nothing is left to pay. Move the run to paid without touching payslip
// status. A payslip status change is rejected while the run is partially_paid
// ("payslip status cannot be changed until it's rejected or reopened"), which
// is what zero-value slips were hitting.
export const promoteSettledRun = (runId) =>
    Api({
        method: "PATCH",
        url: "payroll/payroll-run-status/",
        data: { id: runId, status: "paid", cascade_payslips: false },
    });

// Money slips go to payslip-payment. Zero slips are left as they are — a
// payslip status change is not allowed while the run is partially_paid.
export const settleFullPay = ({ payable = [], zeros = [], paymentData }) => {
    const pay = payable.length
        ? Api({ method: "POST", url: "payroll/payslip-payment/", data: paymentData })
            .then((res) => releaseSummary(res?.data?.data))
            .catch((err) => ({ ok: false, message: errorMessage(err, "Release failed.") }))
        : Promise.resolve(null);

    return pay.then((paySummary) => {
        const summaries = paySummary ? [paySummary] : [];
        if (zeros.length && !payable.length) {
            summaries.push({ ok: true, message: "No amount due on the selected payslips." });
        }
        return summaries;
    });
};

// Backend returns { processed: [id], skipped: [{ id, reason }] }.
// A batch where every row was skipped is a failure, not a success.
export const releaseSummary = (result) => {
    const processed = result?.processed || [];
    const skipped = Array.isArray(result?.skipped) ? result.skipped : [];
    const processedCount = Array.isArray(processed) ? processed.length : Number(processed) || 0;
    if (!processedCount && skipped.length) {
        return { ok: false, message: skipped[0]?.reason || `${skipped.length} skipped` };
    }
    return {
        ok: true,
        message: `${processedCount} released` + (skipped.length ? `, ${skipped.length} skipped` : ""),
    };
};