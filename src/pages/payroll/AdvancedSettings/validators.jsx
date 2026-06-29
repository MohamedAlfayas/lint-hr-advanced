export const isBlank = (v) => v === "" || v === null || v === undefined;

export const range = (label, v, min, max) => {
  if (isBlank(v)) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return `${label} must be a valid number`;
  if (n < min) return `${label} cannot be less than ${min}`;
  if (n > max) return `${label} cannot be greater than ${max}`;
  return null;
};

export const required = (label, v) => (isBlank(v) ? `${label} is required` : null);
export const day = (label, v) => range(label, v, 1, 31);
export const month = (label, v) => range(label, v, 1, 12);
export const percent = (label, v) => range(label, v, 0, 100);

export const min = (label, v, m) => {
  if (isBlank(v)) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return `${label} must be a valid number`;
  return n < m ? `${label} must be at least ${m}` : null;
};

// toast the first non-null error; return ok flag
export const runChecks = (checks, toast) => {
  const first = checks.find(Boolean);
  if (first) { toast.error(first); return false; }
  return true;
};