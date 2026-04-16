import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormFeedback,
  Input,
  Label,
  Row,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

const earningTypeInfo = {
  "1": "Fixed amount paid at the end of every month.",
  "2": "House Rent Allowance — tax exempt up to certain limits.",
  "3": "Flexible allowance paid as part of gross salary.",
  "4": "Performance or seasonal bonus paid to employees.",
};

const SalaryCmpntForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [customFieldObj, setCustomFieldObj] = useState(form_obj);

  useEffect(() => {
    setCustomFieldObj(form_obj);
  }, [form_obj]);

  const contributionOptions = useMemo(() => {
    const options = [];
    if (form_obj?.contribute?.length > 0) {
      if (form_obj.contribute[0].esi?.is_active)
        options.push({ id: "1", label: "ESI", value: "ESI" });
      if (form_obj.contribute[0].epf?.is_active)
        options.push({ id: "2", label: "EPF", value: "EPF" });
    }
    return options;
  }, []);

  const hasEPF = contributionOptions.some((o) => o.value === "EPF");
  const hasESI = contributionOptions.some((o) => o.value === "ESI");

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      earning_type: customFieldObj?.earning_type || "1",
      name: customFieldObj?.name || "",
      name_in_payslip: customFieldObj?.name_in_payslip || "",
      calculation_type: customFieldObj?.calculation_type || "flat",
      amount: customFieldObj?.amount || 0,
      percentage: customFieldObj?.percentage || 0,
      mark_active: customFieldObj?.mark_active || false,
      salary_structure: customFieldObj?.salary_structure ?? true,
      tax: customFieldObj?.tax ?? true,
      pro_rata: customFieldObj?.pro_rata ?? true,
      epf: customFieldObj?.epf ?? true,
      epf_mode: customFieldObj?.epf_mode || "always",
      esi: customFieldObj?.esi ?? true,
      show_in_payslip: customFieldObj?.show_in_payslip ?? true,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Please enter earning name"),
      name_in_payslip: Yup.string()
        .trim()
        .required("Please enter name in payslip"),
      amount: Yup.number().when("calculation_type", {
        is: "flat",
        then: (s) =>
          s
            .min(1, "Amount must be greater than 0")
            .required("Please enter amount"),
      }),
      percentage: Yup.number().when("calculation_type", {
        is: "percentage",
        then: (s) =>
          s
            .min(0.01, "Percentage must be greater than 0")
            .max(100, "Percentage cannot exceed 100")
            .required("Please enter percentage"),
      }),
    }),
    onSubmit: async (values) => {
      console.log("Form submitted:", values);
      // dispatch(setLoaderVisible(true));
      // const Api = await PostApi("salary-component/create/", values, false);
      // if (Api.status === 200) {
      //   dispatch(toggleRSBView(false));
      //   toast.success(Api?.data?.message);
      // } else {
      //   toast.error(Api?.data?.message || Api?.data?.detail);
      // }
      // dispatch(setLoaderVisible(false));
    },
  });

  return (
    <React.Fragment>

      {/* Page Title */}
      <h5 className="mb-3 fw-semibold text-dark">New Earning</h5>
      <hr className="mt-0 mb-4" />

      <Form onSubmit={formik.handleSubmit}>

        {/* ── Row 1: Earning Type + Info Box ── */}
        <Row className="mb-3 align-items-start">
          <Col md={6}>
            <Label className="form-label fw-medium">
              Earning Type <span className="text-danger">*</span>
            </Label>
            <Input
              type="select"
              name="earning_type"
              value={formik.values.earning_type}
              onChange={formik.handleChange}
            >
              <option value="1">Basic</option>
              <option value="2">HRA</option>
              <option value="3">Special Allowance</option>
              <option value="4">Bonus</option>
            </Input>
          </Col>
          <Col md={6} className="mt-4">
            <div className="alert alert-info d-flex align-items-start gap-2 py-2 px-3 mb-0">
              <i className="ri-information-line fs-16 mt-1 flex-shrink-0"></i>
              <span className="fs-13">
                {earningTypeInfo[formik.values.earning_type]}
              </span>
            </div>
          </Col>
        </Row>

        <hr className="mb-4" />

        {/* ── Row 2: Left inputs + Right config panel ── */}
        <Row className="align-items-start">

          {/* ── LEFT: Form Fields ── */}
          <Col md={6}>

            {/* Earning Name */}
            <div className="mb-3">
              <Label className="form-label fw-medium">
                Earning Name <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                name="name"
                placeholder="Enter earning name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={!!(formik.touched.name && formik.errors.name)}
              />
              {formik.touched.name && formik.errors.name && (
                <FormFeedback>{formik.errors.name}</FormFeedback>
              )}
            </div>

            {/* Name in Payslip */}
            <div className="mb-3">
              <Label className="form-label fw-medium">
                Name in Payslip <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                name="name_in_payslip"
                placeholder="Enter name as shown in payslip"
                value={formik.values.name_in_payslip}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={
                  !!(
                    formik.touched.name_in_payslip &&
                    formik.errors.name_in_payslip
                  )
                }
              />
              {formik.touched.name_in_payslip &&
                formik.errors.name_in_payslip && (
                  <FormFeedback>{formik.errors.name_in_payslip}</FormFeedback>
                )}
            </div>

            {/* Calculation Type */}
            <div className="mb-3">
              <Label className="form-label fw-medium">
                Calculation Type <span className="text-danger">*</span>
              </Label>
              <div className="d-flex flex-column gap-2 mt-1">
                <div className="form-check">
                  <Input
                    type="radio"
                    id="calc_flat"
                    name="calculation_type"
                    value="flat"
                    className="form-check-input"
                    checked={formik.values.calculation_type === "flat"}
                    onChange={formik.handleChange}
                  />
                  <Label className="form-check-label" htmlFor="calc_flat">
                    Flat Amount
                  </Label>
                </div>
                <div className="form-check">
                  <Input
                    type="radio"
                    id="calc_pct"
                    name="calculation_type"
                    value="percentage"
                    className="form-check-input"
                    checked={formik.values.calculation_type === "percentage"}
                    onChange={formik.handleChange}
                  />
                  <Label className="form-check-label" htmlFor="calc_pct">
                    Percentage of CTC
                  </Label>
                </div>
              </div>
            </div>

            {/* Amount / Percentage */}
            {formik.values.calculation_type === "flat" ? (
              <div className="mb-3">
                <Label className="form-label fw-medium">Enter Amount</Label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <Input
                    type="number"
                    name="amount"
                    min="0"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={!!(formik.touched.amount && formik.errors.amount)}
                  />
                  {formik.touched.amount && formik.errors.amount && (
                    <FormFeedback>{formik.errors.amount}</FormFeedback>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <Label className="form-label fw-medium">Percentage (%)</Label>
                <div className="input-group">
                  <span className="input-group-text">%</span>
                  <Input
                    type="number"
                    name="percentage"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formik.values.percentage}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      !!(
                        formik.touched.percentage && formik.errors.percentage
                      )
                    }
                  />
                  {formik.touched.percentage && formik.errors.percentage && (
                    <FormFeedback>{formik.errors.percentage}</FormFeedback>
                  )}
                </div>
              </div>
            )}

            {/* Mark as Active */}
            <div className="form-check mb-2">
              <Input
                type="checkbox"
                id="mark_active"
                name="mark_active"
                className="form-check-input"
                checked={formik.values.mark_active}
                onChange={formik.handleChange}
              />
              <Label className="form-check-label" htmlFor="mark_active">
                Mark this as Active
              </Label>
            </div>
          </Col>

          {/* ── RIGHT: Other Configurations Card ── */}
          <Col md={6}>
            <Card className="border shadow-none">
              <CardBody className="p-3">
                <h6 className="fw-semibold text-dark mb-3 pb-2 border-bottom">
                  Other Configurations
                </h6>

                {/* Salary Structure */}
                <div className="form-check mb-3">
                  <Input
                    type="checkbox"
                    id="salary_structure"
                    name="salary_structure"
                    className="form-check-input"
                    checked={formik.values.salary_structure}
                    onChange={formik.handleChange}
                  />
                  <Label
                    className="form-check-label fw-medium"
                    htmlFor="salary_structure"
                  >
                    Make this earning a part of the employee's salary structure
                  </Label>
                </div>

                {/* Taxable */}
                <div className="form-check mb-1">
                  <Input
                    type="checkbox"
                    id="tax"
                    name="tax"
                    className="form-check-input"
                    checked={formik.values.tax}
                    onChange={formik.handleChange}
                  />
                  <Label className="form-check-label fw-medium" htmlFor="tax">
                    This is a taxable earning
                  </Label>
                </div>
                <p className="text-muted fs-12 ms-4 mb-3">
                  The income tax amount will be divided equally and deducted
                  every month across the financial year.
                </p>

                {/* Pro-rata */}
                <div className="form-check mb-1">
                  <Input
                    type="checkbox"
                    id="pro_rata"
                    name="pro_rata"
                    className="form-check-input"
                    checked={formik.values.pro_rata}
                    onChange={formik.handleChange}
                  />
                  <Label
                    className="form-check-label fw-medium"
                    htmlFor="pro_rata"
                  >
                    Calculate on pro-rata basis
                  </Label>
                </div>
                <p className="text-muted fs-12 ms-4 mb-3">
                  Pay will be adjusted based on employee working days.
                </p>

                {/* EPF */}
                {hasEPF && (
                  <>
                    <div className="form-check mb-2">
                      <Input
                        type="checkbox"
                        id="epf"
                        name="epf"
                        className="form-check-input"
                        checked={formik.values.epf}
                        onChange={formik.handleChange}
                      />
                      <Label
                        className="form-check-label fw-medium"
                        htmlFor="epf"
                      >
                        Consider for EPF Contribution
                      </Label>
                    </div>

                    {formik.values.epf && (
                      <div className="ms-4 mb-3">
                        <div className="form-check mb-1">
                          <Input
                            type="radio"
                            id="epf_always"
                            name="epf_mode"
                            value="always"
                            className="form-check-input"
                            checked={formik.values.epf_mode === "always"}
                            onChange={formik.handleChange}
                          />
                          <Label
                            className="form-check-label text-muted"
                            htmlFor="epf_always"
                          >
                            Always
                          </Label>
                        </div>
                        <div className="form-check">
                          <Input
                            type="radio"
                            id="epf_pf_wage"
                            name="epf_mode"
                            value="pf_wage"
                            className="form-check-input"
                            checked={formik.values.epf_mode === "pf_wage"}
                            onChange={formik.handleChange}
                          />
                          <Label
                            className="form-check-label text-muted"
                            htmlFor="epf_pf_wage"
                          >
                            Only when PF Wage is less than ₹ 15,000
                          </Label>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ESI */}
                {hasESI && (
                  <div className="form-check mb-3">
                    <Input
                      type="checkbox"
                      id="esi"
                      name="esi"
                      className="form-check-input"
                      checked={formik.values.esi}
                      onChange={formik.handleChange}
                    />
                    <Label
                      className="form-check-label fw-medium"
                      htmlFor="esi"
                    >
                      Consider for ESI Contribution
                    </Label>
                  </div>
                )}

                {/* Show in Payslip */}
                <div className="form-check mb-0">
                  <Input
                    type="checkbox"
                    id="show_in_payslip"
                    name="show_in_payslip"
                    className="form-check-input"
                    checked={formik.values.show_in_payslip}
                    onChange={formik.handleChange}
                  />
                  <Label
                    className="form-check-label fw-medium"
                    htmlFor="show_in_payslip"
                  >
                    Show this component in payslip
                  </Label>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ── Note Box ── */}
        <div className="alert alert-warning d-flex align-items-start gap-2 mt-2 mb-4">
          <i className="ri-error-warning-line fs-16 flex-shrink-0 mt-1"></i>
          <span className="fs-13">
            <strong>Note:</strong> Once you associate this component with an
            employee, you will only be able to edit the Name and
            Amount/Percentage. The changes you make to Amount/Percentage will
            apply only to new employees.
          </span>
        </div>

        {/* ── Footer ── */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            <Button type="submit" color="primary" className="btn-label">
              <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
              Save
            </Button>
            <Button type="button" color="light">
              Cancel
            </Button>
          </div>
          <span className="text-danger fs-12">* indicates mandatory fields</span>
        </div>

      </Form>
    </React.Fragment>
  );
};

export default SalaryCmpntForm;