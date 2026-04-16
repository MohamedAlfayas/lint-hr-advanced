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
const CALCULATION_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed" },
  { value: "percentage", label: "Percentage" },
];

const BASED_ON_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "ctc", label: "CTC" },
];

const PAYOUT_FREQUENCY_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half_yearly", label: "Half Yearly" },
  { value: "annually", label: "Annually" },
];

const VariableModal = ({ isOpen, toggle, component, onSaved }) => {
  const dispatch = useDispatch();
  const isNew = !component || component.id === 0;

  const getOption = (options, value) =>
    options.find((opt) => opt.value === value) || null;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: component?.name || "",
      payout_frequency:
        component?.payout_frequency ||
        component?.frequency ||
        "annually",

      is_individual_override: component?.is_individual_override || false,
      is_lop_dependant: component?.is_lop_dependant || false,
      is_included_in_ctc: component?.is_included_in_ctc || false,
      is_taxable: component?.is_taxable || false,
      is_esi_applicable: component?.is_esi_applicable || false,
      is_prorate: component?.is_prorate || false,
      tax_mode: component?.tax_mode || "one_time",

      calculation_type: component?.calculation_type || "fixed",
      calculation_value: component?.calculation_value || "",
      calculation_based_on:
        component?.calculation_based_on || "ctc",
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      calculation_value: Yup.string().required("Required"),
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
        salary_type: "variable",
        frequency: values.payout_frequency,
      };

      dispatch(setLoaderVisible(true));

      try {
        const Api = await PostApi("payroll/component/", payload, false);

        if (Api.status === 200) {
          isNew
            ? dispatch(addRecurring(Api.data.data))
            : dispatch(editRecurring(Api.data.data));

          toast.success("Saved Successfully");
          onSaved?.(Api.data.data);
          toggle();
        } else {
          toast.error("Failed");
        }
      } catch (err) {
        console.log(err);
        toast.error("Something went wrong");
      } finally {
        setSubmitting(false);
        dispatch(setLoaderVisible(false));
      }
    },
  });

  useEffect(() => {
    if (!isOpen) formik.resetForm();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>
        {isNew ? "Create Component" : "Edit Component"}
      </ModalHeader>

      <ModalBody>
        <Form onSubmit={formik.handleSubmit}>
          {/* NAME */}
          <FormGroup>
            <Label>Component Name</Label>
            <Input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
          </FormGroup>

          {/* LEFT RIGHT SECTION */}
          <Row className="mt-3">
            {/* LEFT */}
            <Col md={6} className="pe-4 border-end">
              <FormGroup>
                <Label>Payout Frequency</Label>
                <Select
                  options={PAYOUT_FREQUENCY_OPTIONS}
                  value={getOption(
                    PAYOUT_FREQUENCY_OPTIONS,
                    formik.values.payout_frequency
                  )}
                  onChange={(opt) =>
                    formik.setFieldValue(
                      "payout_frequency",
                      opt?.value || ""
                    )
                  }
                />
              </FormGroup>

              <div className="d-flex justify-content-between align-items-center py-2">
                <Label className="mb-0">Included In CTC</Label>
                <Toggle
                  value={formik.values.is_included_in_ctc}
                  onChange={(v) =>
                    formik.setFieldValue("is_included_in_ctc", v)
                  }
                />
              </div>

              <div className="d-flex justify-content-between align-items-center py-2">
                <Label className="mb-0">Taxable</Label>
                <Toggle
                  value={formik.values.is_taxable}
                  onChange={(v) =>
                    formik.setFieldValue("is_taxable", v)
                  }
                />
              </div>

              {/* TAX MODE */}
              {/* <div className="py-2">
                <Label className="d-block">Tax Mode</Label>

                <div className="form-check">
                  <Input
                    type="radio"
                    name="tax_mode"
                    value="one_time"
                    checked={formik.values.tax_mode === "one_time"}
                    onChange={formik.handleChange}
                  />
                  <Label className="form-check-label">
                    One time Tax Deduction
                  </Label>
                </div>

                <div className="form-check">
                  <Input
                    type="radio"
                    name="tax_mode"
                    value="spread"
                    checked={formik.values.tax_mode === "spread"}
                    onChange={formik.handleChange}
                  />
                  <Label className="form-check-label">
                    Distribute Tax across rest of the year
                  </Label>
                </div>
              </div> */}

              <div className="d-flex justify-content-between align-items-center py-2">
                <Label className="mb-0">Prorate</Label>
                <Toggle
                  value={formik.values.is_prorate}
                  onChange={(v) =>
                    formik.setFieldValue("is_prorate", v)
                  }
                />
              </div>
            </Col>

            {/* RIGHT */}
            <Col md={6} className="ps-4">
              <div className="d-flex justify-content-between align-items-center py-2">
                <Label className="mb-0">Individual Override</Label>
                <Toggle
                  value={formik.values.is_individual_override}
                  onChange={(v) =>
                    formik.setFieldValue("is_individual_override", v)
                  }
                />
              </div>

              <div className="d-flex justify-content-between align-items-center py-2">
                <Label className="mb-0">LOP Dependant</Label>
                <Toggle
                  value={formik.values.is_lop_dependant}
                  onChange={(v) =>
                    formik.setFieldValue("is_lop_dependant", v)
                  }
                />
              </div>

              <div className="d-flex justify-content-between align-items-center py-2">
                <Label className="mb-0">ESI Applicable</Label>
                <Toggle
                  value={formik.values.is_esi_applicable}
                  onChange={(v) =>
                    formik.setFieldValue("is_esi_applicable", v)
                  }
                />
              </div>
            </Col>
          </Row>

          {/* CALCULATION */}
          <div className="mt-4 p-3 border rounded bg-light">
            <Row className="align-items-end">
              <Col md={4}>
                <Label>Calculation Type</Label>
                <Select
                  options={CALCULATION_TYPE_OPTIONS}
                  value={getOption(
                    CALCULATION_TYPE_OPTIONS,
                    formik.values.calculation_type
                  )}
                  onChange={(opt) =>
                    formik.setFieldValue(
                      "calculation_type",
                      opt?.value || ""
                    )
                  }
                />
              </Col>

              {formik.values.calculation_type === "percentage" && (
                <Col md={4}>
                  <Label>Based On</Label>
                  <Select
                    options={BASED_ON_OPTIONS}
                    value={getOption(
                      BASED_ON_OPTIONS,
                      formik.values.calculation_based_on
                    )}
                    onChange={(opt) =>
                      formik.setFieldValue(
                        "calculation_based_on",
                        opt?.value || ""
                      )
                    }
                  />
                </Col>
              )}

              <Col md={4}>
                <Label>
                  {formik.values.calculation_type === "percentage"
                    ? "Enter Percentage (%)"
                    : "Enter Annual Amount"}
                </Label>
                <Input
                  name="calculation_value"
                  value={formik.values.calculation_value}
                  onChange={formik.handleChange}
                />
              </Col>
            </Row>
          </div>
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button className="btn-danger" onClick={toggle}>
          Cancel
        </Button>
        <Button className="btn-success" onClick={formik.handleSubmit}>
          <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
          {isNew ? "Create" : "Update"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default VariableModal;