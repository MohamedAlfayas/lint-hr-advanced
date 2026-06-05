import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Button, Badge } from "reactstrap";

const DetailRow = ({ label, value, last = false }) => (
  <Row className={`align-items-center py-2 g-0 ${!last ? "border-bottom" : ""}`}>
    <Col xs={5}>
      <span className="text-muted fw-medium" style={{ fontSize: 13 }}>{label}</span>
    </Col>
    <Col xs={7}>
      <span className="text-dark" style={{ fontSize: 13 }}>{value || "—"}</span>
    </Col>
  </Row>
);

const PayrollRunDetails = ({ isOpen, toggle, data }) => {
  if (!data) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle} className="bg-light p-3">
        Payroll Run Details — Operational Audit
      </ModalHeader>
      <ModalBody className="p-4">
        <div className="border rounded px-3 bg-white">
          <DetailRow label="Month" value={data.month} />
          <DetailRow label="Year" value={data.year} />
          <DetailRow 
            label="Current Status" 
            value={<Badge color="primary">{data.status}</Badge>} 
          />
          <DetailRow label="Processed At" value={data.processed_at} />
          <DetailRow label="Approved At" value={data.approved_at} />
          <DetailRow label="Paid At" value={data.paid_at} />
          <DetailRow label="Created At" value={data.created_at} />
          <DetailRow label="Remarks" value={data.remarks} last={true} />
        </div>
      </ModalBody>
      <ModalFooter className="bg-light p-3">
        <Button color="secondary" size="sm" onClick={toggle}>
          Dismiss View
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PayrollRunDetails;