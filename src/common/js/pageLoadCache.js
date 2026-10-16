const cache = new Map();

export const hasPageCache = (key) => cache.has(key);

export const readPageCache = (key) => cache.get(key);

export const writePageCache = (key, value = true) => {
  cache.set(key, value);
  return value;
};
