import React, { useEffect } from "react";
import Select from "react-select";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Form,
  Label,
  Row,
  Col,
  FormGroup,
} from "reactstrap";
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

/* Toggle */
const Toggle = ({ value, onChange }) => (
  <div className="form-check form-switch m-0">
    <Input
      type="checkbox"
      className="form-check-input"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
    />
  </div>
);

/* Options */
const COMPONENT_TYPE_OPTIONS = [
  { value: "allowance", label: "Allowance" },
  { value: "deduction", label: "Deduction" },
  { value: "reimbursement", label: "Reimbursement" },
  { value: "contribution", label: "Contribution" },
];

const CALCULATION_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed" },
  { value: "percentage", label: "Percentage" },
];

const CALC_BASED_ON_OPTIONS = [
  { value: "ctc", label: "CTC" },
  { value: "basic", label: "Basic" },
];

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
        .min(0, "Must be positive"),

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
          toast.error(Api.data.message || "Failed");
        }
      } catch (err) {
        console.log("API ERROR:", err?.response?.data);
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

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalBody>
        <Form onSubmit={formik.handleSubmit}>
          {isBalancing ? (
            <FormGroup>
              <Label>Component Name *</Label>
              <Input
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
              />
            </FormGroup>
          ) : isBasic ? (
            <>
              <div className="text-center mb-3">
                <Label className="fw-bold">Component Name</Label>
                <h5>{formik.values.name}</h5>
              </div>

              <hr />

              <Row className="g-3 justify-content-center">
                <Col md={4}>
                  <Label>Calculation Type</Label>
                  <Select
                    options={CALCULATION_TYPE_OPTIONS}
                    value={getOption(
                      CALCULATION_TYPE_OPTIONS,
                      formik.values.calculation_type
                    )}
                    onChange={(opt) =>
                      formik.setFieldValue("calculation_type", opt.value)
                    }
                  />
                </Col>

                {formik.values.calculation_type === "percentage" && (
                  <Col md={4}>
                    <Label>Based On</Label>
                    <Select
                      options={CALC_BASED_ON_CTC_ONLY}
                      value={getOption(
                        CALC_BASED_ON_CTC_ONLY,
                        formik.values.calculation_based_on
                      )}
                      onChange={(opt) =>
                        formik.setFieldValue("calculation_based_on", opt.value)
                      }
                    />
                  </Col>
                )}

                <Col md={4}>
                  <Label>Value</Label>
                  <Input
                    type="number"
                    name="calculation_value"
                    value={formik.values.calculation_value}
                    onChange={formik.handleChange}
                  />
                </Col>
              </Row>
            </>
          ) : (
            <>
              <FormGroup>
                <Label>Component Name *</Label>
                <Input
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Component Type</Label>
                <Select
                  options={COMPONENT_TYPE_OPTIONS}
                  value={getOption(
                    COMPONENT_TYPE_OPTIONS,
                    formik.values.component_type
                  )}
                  onChange={(opt) =>
                    formik.setFieldValue("component_type", opt.value)
                  }
                />
              </FormGroup>

              <hr />

              <Row className="g-3">
                {[
                  ["is_included_in_ctc", "Included In CTC"],
                  ["is_proof_required", "Proof Required"],

                  formik.values.component_type === "deduction"
                    ? ["remove_from_taxable", "Remove from taxable income"]
                    : ["is_taxable", "Taxable"],

                  ["is_individual_override", "Individual Override"],
                  ["is_lop_dependant", "LOP Dependant"],
                  ["is_esi_applicable", "ESI Applicable"],
                ].map(([key, label]) => (
                  <Col sm={6} key={key}>
                    <FormGroup className="d-flex justify-content-between">
                      <Label className="mb-0">{label}</Label>
                      <Toggle
                        value={formik.values[key]}
                        onChange={(v) => formik.setFieldValue(key, v)}
                      />
                    </FormGroup>
                  </Col>
                ))}
              </Row>

              <hr />

              <Row className="g-3">
                <Col md={4}>
                  <Label>Calculation Type</Label>
                  <Select
                    options={CALCULATION_TYPE_OPTIONS}
                    value={getOption(
                      CALCULATION_TYPE_OPTIONS,
                      formik.values.calculation_type
                    )}
                    onChange={(opt) =>
                      formik.setFieldValue("calculation_type", opt.value)
                    }
                  />
                </Col>

                {formik.values.calculation_type === "percentage" && (
                  <Col md={4}>
                    <Label>Based On</Label>
                    <Select
                      options={CALC_BASED_ON_OPTIONS}
                      value={getOption(
                        CALC_BASED_ON_OPTIONS,
                        formik.values.calculation_based_on
                      )}
                      onChange={(opt) =>
                        formik.setFieldValue("calculation_based_on", opt.value)
                      }
                    />
                  </Col>
                )}

                <Col md={4}>
                  <Label>Value</Label>
                  <Input
                    type="number"
                    name="calculation_value"
                    value={formik.values.calculation_value}
                    onChange={formik.handleChange}
                  />
                </Col>
              </Row>
            </>
          )}
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button className="btn btn-danger" onClick={toggle}>
          Cancel
        </Button>

        <Button
          className="btn-label btn btn-success"
          onClick={formik.handleSubmit}
          disabled={formik.isSubmitting}
        >
          <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
          {formik.isSubmitting ? "Saving..." : isNew ? "Create" : "Update"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RecurringModal;