import React, { forwardRef } from "react";
import ReactSelect, { components as rsComponents } from "react-select";
import ReactAsyncSelect from "react-select/async";
import { testId, useFieldTestId } from "../testing/testId";

/**
 * Drop-in `react-select` with data-testids (react-select does not forward
 * `data-testid` to the DOM). Base id is `testId` or `<module>-<name>`:
 *   `<base>-select` (input), `<base>-trigger`, `<base>-option-<label>`,
 *   `<base>-selected-value`, `<base>-selected-<label>` (multi), `<base>-no-options`.
 * Employee options use their employee ID instead of the name.
 */

const optionKey = (props) => {
  const data = props.data || {};
  return data.emp_id || (typeof props.label === "string" && props.label) || data.value || data.id;
};

const baseOf = (props) => props.selectProps?.__testIdBase;

const ID_BY_COMPONENT = {
  Input: (p) => `${baseOf(p)}-select`,
  DropdownIndicator: (p) => `${baseOf(p)}-trigger`,
  ClearIndicator: (p) => `${baseOf(p)}-clear-button`,
  Option: (p) => testId(baseOf(p), "option", optionKey(p)),
  SingleValue: (p) => `${baseOf(p)}-selected-value`,
  MultiValue: (p) => testId(baseOf(p), "selected", optionKey(p)),
  NoOptionsMessage: (p) => `${baseOf(p)}-no-options`,
};

// Wrappers are cached per component so inline `components={{ ... }}` objects
// don't remount the select (and drop input focus) on every render.
const wrapperCache = new Map();

const wrap = (name, Component) => {
  const byName = wrapperCache.get(name) || new WeakMap();
  wrapperCache.set(name, byName);
  if (byName.has(Component)) return byName.get(Component);

  const getId = ID_BY_COMPONENT[name];
  const Wrapped =
    name === "Input"
      ? (props) => <Component {...props} data-testid={getId(props)} />
      : (props) => (
          <Component {...props} innerProps={{ ...props.innerProps, "data-testid": getId(props) }} />
        );
  Wrapped.displayName = `Testable${name}`;
  byName.set(Component, Wrapped);
  return Wrapped;
};

const withTestIdComponents = (components = {}) => {
  const merged = { ...components };
  Object.keys(ID_BY_COMPONENT).forEach((name) => {
    merged[name] = wrap(name, components[name] || rsComponents[name]);
  });
  return merged;
};

const makeTestable = (SelectComponent) => {
  const Testable = forwardRef(({ testId: testIdOverride, components, ...props }, ref) => {
    const base = useFieldTestId(props.name || props.inputId || props.id, testIdOverride);
    return (
      <SelectComponent
        ref={ref}
        {...props}
        __testIdBase={base}
        components={withTestIdComponents(components)}
      />
    );
  });
  Testable.displayName = "TestableSelect";
  return Testable;
};

const TestableSelect = makeTestable(ReactSelect);

export const TestableAsyncSelect = makeTestable(ReactAsyncSelect);
export { rsComponents as components };
export default TestableSelect;
