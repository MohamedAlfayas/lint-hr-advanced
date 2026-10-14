const STORAGE_KEY = "lint_hr_globaldata";

// The global blob is large and this is called from render paths and table
// cells, so it's parsed only when the stored string changes. Callers share the
// parsed objects and must not mutate them.
let cachedRaw = null;
let cachedData = null;

const readGlobalData = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedData = raw === null ? null : JSON.parse(raw);
    } catch {
      cachedData = null;
    }
  }
  return cachedData;
};

export const GetLocalStorageData = (key) => {
  const data = readGlobalData();
  return data && typeof data === "object" && key in data ? data[key] : null;
};
