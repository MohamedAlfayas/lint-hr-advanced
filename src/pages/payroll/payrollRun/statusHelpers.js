import { Api } from "../../../common/api/Api";

let cache = {
    run: null,
    payslip: null,
};

let pending = {
    run: null,
    payslip: null,
};

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

export const colorFor = (code) => {
  const map = {
    draft: "warning", processing: "info", computed: "primary",
    pending_approval: "warning", approved: "success", rejected: "danger",
    locked: "dark", paid: "success", closed: "secondary",
    on_hold: "warning", cancelled: "danger",
    pending: "secondary", under_review: "info", finalized: "dark",
    excluded: "secondary",
  };
  return map[code] || "secondary";
};