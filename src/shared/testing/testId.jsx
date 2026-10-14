import React, { createContext, useContext } from "react";

/**
 * data-testid naming: `module-field-type`, lowercase and hyphen-separated,
 * e.g. `employee-emp-id-input`, `employee-department-option-it-team`,
 * `employee-row-lc005`. Values come from fixed names, option text/ids or a
 * record's business id — never from state or list position.
 */

/** "Emp_ID", "IT Team", "+91" → "emp-id", "it-team", "91". */
export const toTestIdPart = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Joins parts into one id, skipping empty parts: testId("employee", "emp_id", "input"). */
export const testId = (...parts) => parts.map(toTestIdPart).filter(Boolean).join("-");

const TestIdModuleContext = createContext("");

/** Sets the module prefix for every shared field / table / dialog inside it. */
export const TestIdModule = ({ name, children }) => (
  <TestIdModuleContext.Provider value={toTestIdPart(name)}>{children}</TestIdModuleContext.Provider>
);

export const useTestIdModule = () => useContext(TestIdModuleContext);

/**
 * Base id for a shared field: the explicit `override` when given, otherwise
 * `<module>-<field name>`.
 */
export const useFieldTestId = (name, override) => {
  const moduleName = useTestIdModule();
  return override ? toTestIdPart(override) : testId(moduleName, name);
};

/** Fields that identify a record to a person, checked in this order for row ids. */
const ROW_ID_KEYS = ["emp_id", "code", "uuid", "emp_uuid", "id"];

export const rowBusinessId = (record) => {
  if (!record || typeof record !== "object") return "";
  const key = ROW_ID_KEYS.find((k) => record[k] !== undefined && record[k] !== null && record[k] !== "");
  return key ? record[key] : "";
};

/** Readable keys for list items (options, cards, chips), checked in this order. */
const ITEM_KEYS = ["emp_id", "code", "name", "label", "title", "value", "key", "id", "uuid"];

/**
 * Identifies a list item for an id: its business id or display text for
 * objects, the value itself for strings and numbers.
 */
export const itemTestKey = (item) => {
  if (item === null || item === undefined) return "";
  if (typeof item !== "object") return item;
  const key = ITEM_KEYS.find((k) => ["string", "number"].includes(typeof item[k]) && item[k] !== "");
  return key ? item[key] : "";
};

/**
 * Id for a row or an element inside it: rowTestId("employee", emp, "edit-button")
 * → "employee-row-lc005-edit-button". Empty when the record has no business id.
 */
export const rowTestId = (moduleName, record, ...parts) => {
  const id = rowBusinessId(record);
  return id === "" ? undefined : testId(moduleName, "row", id, ...parts);
};
