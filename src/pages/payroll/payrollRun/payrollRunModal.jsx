import React, { useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Button, Spinner
} from "reactstrap";
import Select from "react-select";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";

const MONTH_OPTIONS = [
  { value: "January", label: "January" }, { value: "February", label: "February" },
  { value: "March", label: "March" }, { value: "April", label: "April" },
  { value: "May", label: "May" }, { value: "June", label: "June" },
  { value: "July", label: "July" }, { value: "August", label: "August" },
  { value: "September", label: "September" }, { value: "October", label: "October" },
  { value: "November", label: "November" }, { value: "December", label: "December" }
];

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - 1 + i;
  return { value: year, label: String(year) };
});

const PayrollRunModal = ({ isOpen, toggle, onSuccess }) => {
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const monthToNumber = {
    "January": 1, "February": 2, "March": 3, "April": 4,
    "May": 5, "June": 6, "July": 7, "August": 8,
    "September": 9, "October": 10, "November": 11, "December": 12
    };

    const handleSubmit = (e) => {
    e.preventDefault();
    if (!month || !year) {
        toast.warning("Please specify both Month and Year operations.");
        return;
    }

    setSubmitting(true);
    
    // Convert the string label (e.g., "January") to its number representation (1)
    const monthNumber = monthToNumber[month.value];

    Api({
        method: "POST",
        url: "payroll/payroll-run/",
        data: {
        month: monthNumber, // Now safely sending an integer (e.g. 1 instead of "January")
        year: year.value,
        remarks: remarks
        }
    })
        .then(() => {
        toast.success("Payroll Processed Successfully");
        onSuccess();
        handleClose();
        })
        .catch((err) => {
        toast.error(err?.response?.data?.detail || "Failed to execute calculations.");
        })
        .finally(() => setSubmitting(false));
    };

  const handleClose = () => {
    setMonth(null);
    setYear(null);
    setRemarks("");
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered className="border-0">
      <ModalHeader toggle={handleClose} className="bg-light p-3">
        Run New Payroll Cycles
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody className="p-4">
          <FormGroup>
            <Label style={{ fontSize: 13, fw: "500" }}>Target Month</Label>
            <Select
              options={MONTH_OPTIONS}
              value={month}
              onChange={(e) => setMonth(e)}
              placeholder="Select Target Month..."
            />
          </FormGroup>

          <FormGroup className="mt-3">
            <Label style={{ fontSize: 13, fw: "500" }}>Target Year</Label>
            <Select
              options={YEAR_OPTIONS}
              value={year}
              onChange={(e) => setYear(e)}
              placeholder="Select Target Year..."
            />
          </FormGroup>

          <FormGroup className="mt-3 mb-0">
            <Label style={{ fontSize: 13, fw: "500" }}>Remarks</Label>
            <Input
              type="textarea"
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide operation descriptions (e.g., May Regular Cycle Payments)..."
              style={{ fontSize: 13 }}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter className="bg-light p-3">
          <Button color="light" className="border" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button color="success" type="submit" disabled={submitting}>
            {submitting ? <Spinner size="sm" className="me-1" /> : <i className="ri-play-circle-line align-middle me-1"></i>}
            Execute Payroll Run
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default PayrollRunModal;