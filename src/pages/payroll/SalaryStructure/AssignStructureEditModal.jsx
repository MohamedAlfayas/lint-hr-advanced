import React, { useEffect, useState } from "react";
import { Skel } from "../../../component/common/skeleton/Skeleton";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormFeedback,
  Input,
  Label,
  Row,
  Col,
  Spinner,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { PostApi } from "../../../common/api/PostApi"; 
import { useDispatch } from "react-redux";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer"; 
import { Api } from "../../../common/api/Api";
import { testId, itemTestKey } from "../../../shared/testing/testId";
import ModalCloseButton from "../../../shared/ui/ModalCloseButton";
/**
 * Props:
 *  - isOpen      : boolean
 *  - toggle      : fn
 *  - mode        : "single" | "bulk"
 *  - employee    : object (used in "single" mode) — has emp_uuid, name, salary_structure
 *  - bulkUuids   : string[] (used in "bulk" mode)
 *  - onSaveSuccess : fn called after successful API response
 */
const AssignStructureEditModal = ({
  isOpen,
  toggle,
  mode = "single",
  employee,
  bulkUuids = [],
  onSaveSuccess,
}) => {
  const dispatch = useDispatch();

  const [structureOptions, setStructureOptions] = useState([]);
  const [loadingStructures, setLoadingStructures] = useState(false);

  // ─── Fetch available salary structures for the dropdown ──────
  const fetchSalaryStructures = () => {
    setLoadingStructures(true);
    Api({
      method: "GET",
      url: "payroll/salary-structure/", // adjust endpoint if needed
    })
      .then((res) => {
        setStructureOptions(res?.data?.data || []);
      })
      .catch((err) => {
        console.error("Error fetching salary structures:", err);
      })
      .finally(() => {
        setLoadingStructures(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      fetchSalaryStructures();
    }
  }, [isOpen]);

  // ─── Formik ──────────────────────────────────────────────────
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      salary_structure: "",
      effective_date: "",
    },
    validationSchema: Yup.object({
      salary_structure: Yup.string().required(
        "Please select a salary structure"
      ),
      effective_date: Yup.string().required("Please select an effective date"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      // Build payload based on mode
      const payload =
        mode === "bulk"
          ? {
              employee_uuid_list: bulkUuids,
              salary_structure: Number(values.salary_structure),
              effective_date: values.effective_date,
            }
          : {
              employee_uuid_list: [employee?.emp_uuid],
              salary_structure: Number(values.salary_structure),
              effective_date: values.effective_date,
            };

      dispatch(setLoaderVisible(true));

      try {
        const res = await PostApi(
          "payroll/assign-salary-structure/",
          payload,
          false
        );

        if (res.status === 200) {
          toast.success(res?.data?.message || "Assigned Successfully");
          onSaveSuccess && onSaveSuccess();
          toggle();
        } else {
          toast.error(res?.data?.message || "Assignment failed");
        }
      } catch (err) {
        console.error("Assign API Error:", err?.response?.data);
        toast.error("Something went wrong");
      } finally {
        setSubmitting(false);
        dispatch(setLoaderVisible(false));
      }
    },
  });

  // ─── Reset on close ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen]);

  const handleCancel = () => {
    formik.resetForm();
    toggle();
  };

  // ─── Helpers ─────────────────────────────────────────────────
  const isBulk = mode === "bulk";

  const currentStructureName =
    employee?.salary_structure?.name || "Not Assigned";

  return (
    <Modal data-testid="assign-structure-dialog" isOpen={isOpen} toggle={handleCancel} centered size="md">
      <ModalHeader close={<ModalCloseButton onClick={handleCancel} testId="assign-structure-close-button" />} className="border-bottom pb-3" toggle={handleCancel}>
        <span className="fw-semibold fs-6 text-body">
          {isBulk
            ? `Assign Structure — ${bulkUuids.length} Employees`
            : employee?.name || "Assign Structure"}
        </span>
      </ModalHeader>

      <ModalBody className="px-4 pt-3 pb-2">
        <Form onSubmit={formik.handleSubmit}>
          <Row className="g-3">

            {/* Current Structure (single mode only) */}
            {!isBulk && (
              <Col md={12}>
                <Label className="form-label text-muted mb-1" style={{ fontSize: 12 }}>
                  Current Salary Structure
                </Label>
                <div className="px-3 py-2 rounded border surface-muted">
                  {currentStructureName === "Not Assigned" ? (
                    <span className="badge bg-warning-subtle text-warning fw-medium">
                      Not Assigned
                    </span>
                  ) : (
                    <span >
                      {currentStructureName}
                    </span>
                  )}
                </div>
              </Col>
            )}
            {/* Current Effective Date (Read Only) */}
{!isBulk && (
  <Col md={12}>
    <Label
      className="form-label text-muted mb-1"
      style={{ fontSize: 12 }}
    >
      Current Effective Date
    </Label>
    <div className="px-3 py-2 rounded border surface-muted">
      {employee?.effective_date ? (
        <span>
          {employee?.effective_date}
        </span>
      ) : (
        <span className="badge bg-warning-subtle text-warning fw-medium">
          Not Assigned
        </span>
      )}
    </div>
  </Col>
)}


            {/* Bulk — show selected count info */}
            {isBulk && (
              <Col md={12}>
                <div
                  className="px-3 py-2 rounded border surface-muted d-flex align-items-center gap-2"
                  style={{ fontSize: 13 }}
                >
                  <i className="ri-group-line text-primary fs-16"></i>
                  <span className="text-muted">
                    Assigning to{" "}
                    <strong className="text-body">{bulkUuids.length}</strong>{" "}
                    selected employees
                  </span>
                </div>
              </Col>
            )}

            {/* Change / New Structure */}
            <Col md={12}>
              <Label className="form-label text-muted mb-1" style={{ fontSize: 12 }}>
                {isBulk ? "Select Salary Structure" : "Change Salary Structure"}{" "}
                <span className="text-danger">*</span>
              </Label>
              {loadingStructures ? (
                <div role="status" aria-label="Loading structures" data-testid="assign-structure-loading-skeleton">
                  <Skel h={38} />
                </div>
              ) : (
                <Input
                  data-testid="assign-structure-salary-structure-select"
                  type="select"
                  name="salary_structure"
                  value={formik.values.salary_structure}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  invalid={
                    !!(
                      formik.touched.salary_structure &&
                      formik.errors.salary_structure
                    )
                  }
                >
                  <option data-testid="assign-structure-salary-structure-option-none" value="">-- Select Structure --</option>
                  {structureOptions.map((opt) => (
                    <option data-testid={testId("assign-structure-salary-structure-option", itemTestKey(opt))} key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </Input>
              )}
              {formik.touched.salary_structure &&
                formik.errors.salary_structure && (
                  <FormFeedback data-testid="assign-structure-salary-structure-error">{formik.errors.salary_structure}</FormFeedback>
                )}
            </Col>

            {/* Effective Date */}
            <Col md={12}>
              <Label className="form-label text-muted mb-1" style={{ fontSize: 12 }}>
                Effective Date <span className="text-danger">*</span>
              </Label>
              <Input
                data-testid="assign-structure-effective-date-input"
                type="date"
                name="effective_date"
                value={formik.values.effective_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={
                  !!(
                    formik.touched.effective_date &&
                    formik.errors.effective_date
                  )
                }
              />
              {formik.touched.effective_date &&
                formik.errors.effective_date && (
                  <FormFeedback data-testid="assign-structure-effective-date-error">{formik.errors.effective_date}</FormFeedback>
                )}
            </Col>

          </Row>
        </Form>
      </ModalBody>

      <ModalFooter className="border-top pt-3 d-flex justify-content-end gap-2">
        <Button data-testid="assign-structure-cancel-button" type="button" className="btn btn-danger" onClick={handleCancel}>
          <i className="ri-close-line align-middle me-1"></i>
          Cancel
        </Button>
        <Button
          data-testid="assign-structure-confirm-button"
          type="button"
          className="btn-success"
          disabled={formik.isSubmitting}
          onClick={formik.handleSubmit}
        >
          {formik.isSubmitting ? (
            <>
              <Spinner size="sm" className="me-1" />
              Saving...
            </>
          ) : (
            <>
              <i className="ri-check-double-line align-middle me-1"></i>
              Assign
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AssignStructureEditModal;