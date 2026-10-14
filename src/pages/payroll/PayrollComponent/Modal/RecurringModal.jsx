import React, { useEffect } from "react";
import { Modal, Form } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../../../redux/reducers/ChildReducer/LoaderReducer";

import { PostApi } from "../../../../common/api/PostApi";
import {
  addRecurring,
  editRecurring,
} from "../../../../redux/reducers/ChildReducer/RecurringReducer";
import "./componentModal.scss";
import { testId } from "../../../../shared/testing/testId";

/* Options */
const COMPONENT_TYPE_OPTIONS = [
  { value: "allowance", label: "Allowance" },
  { value: "deduction", label: "Deduction" }
];

const CALCULATION_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed" },
  { value: "percentage", label: "Percentage" },
];

const CALC_BASED_ON_OPTIONS = [
  { value: "ctc", label: "CTC" },
  { value: "basic", label: "Basic" },
];

/* Helpers */
// Strips digit characters from a string
const stripNumbers = (value) => value.replace(/[0-9]/g, "");

// Reusable Formik onChange handler: blocks numbers on any text field
const handleNoNumberChange = (formik, fieldName) => (e) => {
  formik.setFieldValue(fieldName, stripNumbers(e.target.value));
};

// Yup test to catch numbers from paste/autofill too
const noNumbersTest = {
  name: "no-numbers",
  message: "Component name cannot contain numbers",
  test: (value) => !value || !/\d/.test(value),
};

// Clamps calculation_value to 0–100 when calculation_type is "percentage"
const handleCalculationValueChange = (formik) => (e) => {
  let value = e.target.value;

  if (formik.values.calculation_type === "percentage" && value !== "") {
    const num = Number(value);
    if (!Number.isNaN(num) && num > 100) {
      value = "100";
    }
  }

  formik.setFieldValue("calculation_value", value);
};

const CALC_BASED_ON_CTC_ONLY = [{ value: "ctc", label: "CTC" }];

const RecurringModal = ({ isOpen, toggle, component, onSaved }) => {
  const dispatch = useDispatch();
  const isNew = !component || component.id === 0;

  const getOption = (options, value) =>
    options.find((opt) => opt.value === value) || null;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: component?.name || "",
      component_type: component?.component_type || "allowance",

      salary_type: "recurring",
      frequency: "monthly",

      is_included_in_ctc: component?.is_included_in_ctc || false,
      is_proof_required: component?.is_proof_required || false,

      is_taxable:
        component?.component_type === "deduction"
          ? false
          : component?.is_taxable || false,

      remove_from_taxable: component?.remove_from_taxable || false,

      is_individual_override: component?.is_individual_override || false,
      is_lop_dependant: component?.is_lop_dependant || false,
      is_esi_applicable: component?.is_esi_applicable || false,

      calculation_type: component?.calculation_type || "fixed",
      calculation_based_on: component?.calculation_based_on || "basic",
      calculation_value: component?.calculation_value || "",

      is_basic: component?.is_basic || false,
      is_balancing_component: component?.is_balancing_component || false,
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Component name is required"),
      calculation_value: Yup.number()
        .typeError("Must be a number")
        .required("Value is required")
        .min(0, "Must be positive")
        .when("calculation_type", {
          is: "percentage",
          then: (schema) => schema.max(100, "Percentage cannot exceed 100"),
        }),
        

      calculation_based_on: Yup.string().when("calculation_type", {
        is: "percentage",
        then: (schema) => schema.required("Required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        id: isNew ? 0 : component.id,
        ...values,
        salary_type: "recurring",
        frequency: "monthly",
        calculation_value: String(values.calculation_value),

        is_taxable:
          values.component_type === "deduction"
            ? false
            : values.is_taxable,

        remove_from_taxable:
          values.component_type === "deduction"
            ? values.remove_from_taxable
            : false,
      };

      dispatch(setLoaderVisible(true));

      try {
        const Api = await PostApi("payroll/component/", payload, false);

        if (Api.status === 200) {
          isNew
            ? dispatch(addRecurring(Api.data.data))
            : dispatch(editRecurring(Api.data.data));

          toast.success(Api.data.message || "Saved Successfully");
          onSaved?.(Api.data.data);
          toggle();
        } else {
          toast.error(Api.data.error_message || "Failed");
        }
      } catch (err) {
        console.log("API ERROR:", err?.error_message);
        toast.error("Something went wrong");
      } finally {
        setSubmitting(false);
        dispatch(setLoaderVisible(false));
      }
    },
  });

  /* HANDLE SWITCH */
  useEffect(() => {
    if (formik.values.component_type === "deduction") {
      formik.setFieldValue("is_taxable", false);
    } else {
      formik.setFieldValue("remove_from_taxable", false);
    }
  }, [formik.values.component_type]);

  useEffect(() => {
    if (!isOpen) formik.resetForm();
  }, [isOpen]);

  const isBalancing = formik.values.is_balancing_component;
  const isBasic = formik.values.is_basic;
  const isDeduction = formik.values.component_type === "deduction";
  const isPct = formik.values.calculation_type === "percentage";
  const basedOnOptions = isBasic ? CALC_BASED_ON_CTC_ONLY : CALC_BASED_ON_OPTIONS;
  const basedOnLabel = getOption(CALC_BASED_ON_OPTIONS, formik.values.calculation_based_on)?.label || "Basic";
  const rawValue = formik.values.calculation_value;
  const previewValue = rawValue === "" || rawValue == null
    ? null
    : isPct
      ? `${rawValue}% of ${basedOnLabel}`
      : `₹${Number(rawValue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} per month`;

  const settings = [
    ["is_included_in_ctc", "Included in CTC", "Counts towards cost to company", "ri-money-dollar-box-line"],
    ["is_proof_required", "Proof required", "Employee must submit proof", "ri-file-shield-2-line"],
    isDeduction
      ? ["remove_from_taxable", "Remove from taxable", "Reduces taxable income", "ri-subtract-line"]
      : ["is_taxable", "Taxable", "Added to taxable income", "ri-percent-line"],
    ["is_individual_override", "Individual override", "Amount editable per employee", "ri-user-settings-line"],
    ["is_lop_dependant", "LOP dependant", "Reduced for loss-of-pay days", "ri-calendar-event-line"],
    ["is_esi_applicable", "ESI applicable", "Included in ESI wages", "ri-heart-pulse-line"],
  ];
  const enabledCount = settings.filter(([key]) => formik.values[key]).length;

  const title = isBasic
    ? "Basic Salary Component"
    : isBalancing
      ? "Balancing Component"
      : isNew ? "Create Recurring Component" : "Edit Recurring Component";
  const subtitle = isBasic
    ? "Define how basic pay is calculated"
    : isBalancing
      ? "Absorbs the remaining CTC after other components"
      : "Paid or deducted every month with salary";

  const nameError = formik.touched.name && formik.errors.name;
  const valueError = formik.touched.calculation_value && formik.errors.calculation_value;

  const nameField = (
    <div className="cmp-field">
      <label className="cmp-label" htmlFor="cmp-name">Component name <span className="cmp-req">*</span></label>
      <div className={`cmp-input ${nameError ? "is-invalid" : ""}`}>
        <i className="ri-price-tag-3-line"></i>
        <input
          data-testid="recurring-pay-name-input"
          id="cmp-name"
          name="name"
          value={formik.values.name}
          onChange={handleNoNumberChange(formik, "name")}
          onBlur={formik.handleBlur}
          placeholder="e.g. House Rent Allowance"
          autoComplete="off"
        />
      </div>
      {nameError && <div className="cmp-error"><i className="ri-error-warning-line"></i>{nameError}</div>}
    </div>
  );

  const calculationSection = (
    <div className="cmp-section">
      <div className="cmp-section-head">
        <span><i className="ri-calculator-line"></i>Calculation</span>
      </div>
      <div className="cmp-calc">
        <div className="cmp-field">
          <label className="cmp-label">Type</label>
          <div className="cmp-seg">
            {CALCULATION_TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                data-testid={testId("recurring-pay-calculation-type", o.value, "button")}
                type="button"
                className={formik.values.calculation_type === o.value ? "is-active" : ""}
                onClick={() => formik.setFieldValue("calculation_type", o.value)}
              >
                <i className={o.value === "fixed" ? "ri-hashtag" : "ri-percent-line"}></i>{o.label}
              </button>
            ))}
          </div>
        </div>

        {isPct && (
          <div className="cmp-field">
            <label className="cmp-label">Based on</label>
            <div className="cmp-seg">
              {basedOnOptions.map((o) => (
                <button
                  key={o.value}
                  data-testid={testId("recurring-pay-based-on", o.value, "button")}
                  type="button"
                  className={formik.values.calculation_based_on === o.value ? "is-active" : ""}
                  onClick={() => formik.setFieldValue("calculation_based_on", o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="cmp-field cmp-value">
          <label className="cmp-label" htmlFor="cmp-value">Value <span className="cmp-req">*</span></label>
          <div className={`cmp-input ${valueError ? "is-invalid" : ""}`}>
            <span className="cmp-affix">{isPct ? "%" : "₹"}</span>
            <input
              data-testid="recurring-pay-calculation-value-input"
              id="cmp-value"
              type="number"
              min="0"
              max={isPct ? 100 : undefined}
              name="calculation_value"
              value={formik.values.calculation_value}
              onChange={handleCalculationValueChange(formik)}
              onBlur={formik.handleBlur}
              placeholder={isPct ? "0 – 100" : "0.00"}
            />
          </div>
          {valueError && <div className="cmp-error"><i className="ri-error-warning-line"></i>{valueError}</div>}
        </div>
      </div>

      <div className={`cmp-preview ${previewValue ? "is-ready" : ""}`}>
        <i className="ri-eye-line"></i>
        {previewValue ? (
          <span>
            <b>{formik.values.name || "This component"}</b> will {isDeduction ? "deduct" : "pay"} <b>{previewValue}</b>
          </span>
        ) : (
          <span>Enter a value to preview the calculation</span>
        )}
      </div>
    </div>
  );

  return (
    <Modal data-testid="recurring-pay-dialog" isOpen={isOpen} toggle={toggle} size="lg" centered className="cmp-modal" contentClassName="cmp-content">
      <Form onSubmit={formik.handleSubmit}>
        <div className={`cmp-hero ${isDeduction ? "is-deduction" : "is-allowance"}`}>
          <span className="cmp-hero-icon">
            <i className={isBasic ? "ri-scales-3-line" : isBalancing ? "ri-scales-3-line" : "ri-repeat-2-line"}></i>
          </span>
          <div className="cmp-hero-text">
            <h5>{title}</h5>
            <p>{subtitle}</p>
          </div>
          <button data-testid="recurring-pay-close-button" type="button" className="cmp-close" onClick={toggle} aria-label="Close">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="cmp-body">
          {isBalancing ? (
            nameField
          ) : isBasic ? (
            <>
              <div className="cmp-basic-name">
                <span>Component</span>
                <b>{formik.values.name}</b>
              </div>
              {calculationSection}
            </>
          ) : (
            <>
              {nameField}

              <div className="cmp-field">
                <label className="cmp-label">Component type</label>
                <div className="cmp-types" role="radiogroup">
                  {COMPONENT_TYPE_OPTIONS.map((o) => {
                    const active = formik.values.component_type === o.value;
                    return (
                      <button
                        data-testid={testId("recurring-pay-component-type", o.value, "button")}
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className={`cmp-type is-${o.value} ${active ? "is-active" : ""}`}
                        onClick={() => formik.setFieldValue("component_type", o.value)}
                      >
                        <span className="cmp-type-icon">
                          <i className={o.value === "allowance" ? "ri-add-circle-line" : "ri-indeterminate-circle-line"}></i>
                        </span>
                        <span className="cmp-type-text">
                          <b>{o.label}</b>
                          <small>{o.value === "allowance" ? "Adds to employee earnings" : "Deducted from salary"}</small>
                        </span>
                        <i className="ri-checkbox-circle-fill cmp-type-check"></i>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="cmp-section">
                <div className="cmp-section-head">
                  <span><i className="ri-settings-3-line"></i>Behaviour</span>
                  <em>{enabledCount} of {settings.length} enabled</em>
                </div>
                <div className="cmp-toggles">
                  {settings.map(([key, label, hint, icon]) => {
                    const on = !!formik.values[key];
                    return (
                      <button
                        key={key}
                        data-testid={testId("recurring-pay", key, "switch")}
                        type="button"
                        role="switch"
                        aria-checked={on}
                        className={`cmp-toggle ${on ? "is-on" : ""}`}
                        onClick={() => formik.setFieldValue(key, !on)}
                      >
                        <span className="cmp-toggle-icon"><i className={icon}></i></span>
                        <span className="cmp-toggle-text">
                          <b>{label}</b>
                          <small>{hint}</small>
                        </span>
                        <span className="cmp-switch"><span></span></span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {calculationSection}
            </>
          )}
        </div>

        <div className="cmp-footer">
          <button data-testid="recurring-pay-cancel-button" type="button" className="it-btn is-soft" onClick={toggle}>Cancel</button>
          <button data-testid="recurring-pay-create-button" type="submit" className="it-btn is-primary" disabled={formik.isSubmitting}>
            <i className="ri-check-double-line"></i>
            {formik.isSubmitting ? "Saving..." : isNew ? "Create" : "Update"}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default RecurringModal;
