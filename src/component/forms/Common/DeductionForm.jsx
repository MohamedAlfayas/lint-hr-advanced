import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Form,
  FormGroup,
  FormFeedback,
  Input,
  Label,
  Button,
  Card,
  CardBody,
  CardTitle,
} from "reactstrap";

const DeductionForm = () => {
  const form_obj = {};
  const [customFieldObj, setCustomFieldObj] = useState(form_obj);

  useEffect(() => {
    setCustomFieldObj(form_obj);
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name_in_payslip: customFieldObj?.name_in_payslip || "",
      deduction_frequency: customFieldObj?.deduction_frequency || "one_time",
      mark_active: customFieldObj?.mark_active ?? true,
    },
    validationSchema: Yup.object({
      name_in_payslip: Yup.string().trim().required("Please enter name in payslip"),
      deduction_frequency: Yup.string().required("Please select deduction frequency"),
    }),
    onSubmit: async (values) => {
      console.log("Form submitted:", values);
    },
  });

  return (
    <Card
      className="border"
      
    >
      <CardBody className="p-4">
        <CardTitle tag="h5" className="fw-semibold text-dark mb-0">
          New Deduction
        </CardTitle>
        <hr className="my-3" />

        <Form onSubmit={formik.handleSubmit}>

          {/* Name in Payslip */}
          <FormGroup>
            <Label className="fw-medium " style={{ fontSize: 13.5 }}>
              Name in Payslip <span className="text-danger">*</span>
            </Label>
            <Input
              type="text"
              name="name_in_payslip"
              placeholder="Withheld Salary"
              value={formik.values.name_in_payslip}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              invalid={formik.touched.name_in_payslip && !!formik.errors.name_in_payslip}
            />
            <FormFeedback>{formik.errors.name_in_payslip}</FormFeedback>
          </FormGroup>

          {/* Deduction Frequency */}
          <FormGroup>
            <Label className="fw-medium " style={{ fontSize: 13.5 }}>
              Select the deduction frequency <span className="text-danger">*</span>
            </Label>
            <FormGroup check className="mb-2">
              <Input
                type="radio"
                name="deduction_frequency"
                value="one_time"
                checked={formik.values.deduction_frequency === "one_time"}
                onChange={formik.handleChange}
              />
              <Label check style={{ fontSize: 14 }}>
                One-time deduction
              </Label>
            </FormGroup>
            <FormGroup check>
              <Input
                type="radio"
                name="deduction_frequency"
                value="recurring"
                checked={formik.values.deduction_frequency === "recurring"}
                onChange={formik.handleChange}
              />
              <Label check style={{ fontSize: 14 }}>
                Recurring deduction for subsequent Payrolls
              </Label>
            </FormGroup>
            {formik.touched.deduction_frequency && formik.errors.deduction_frequency && (
              <p className="text-danger mt-1 mb-0" style={{ fontSize: 12 }}>
                {formik.errors.deduction_frequency}
              </p>
            )}
          </FormGroup>

          {/* Mark as Active */}
          <FormGroup check className="mb-4">
            <Input
              type="checkbox"
              name="mark_active"
              checked={formik.values.mark_active}
              onChange={formik.handleChange}
            />
            <Label check style={{ fontSize: 14 }}>
              Mark this as Active
            </Label>
          </FormGroup>

          {/* Note Box */}
          <div
            className="rounded p-3 mb-4"
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              fontSize: 13.5,
              lineHeight: 1.55,
              color: "#374151",
            }}
          >
            <span className="fw-semibold" style={{ color: "#92400e" }}>Note: </span>
            Once you associate this benefits with an employee, you will only be able to edit
            the Name in Payslip. The change will be reflected in both new and existing employees.
          </div>

          {/* Footer */}
          <hr className="mb-3" />
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <Button type="submit" color="primary" style={{ fontSize: 14 }}>
                Save
              </Button>
              <Button type="button" color="light" className="border" style={{ fontSize: 14 }}>
                Cancel
              </Button>
            </div>
            <span className="text-danger" style={{ fontSize: 12 }}>
              * indicates mandatory fields
            </span>
          </div>

        </Form>
      </CardBody>
    </Card>
  );
};

export default DeductionForm;