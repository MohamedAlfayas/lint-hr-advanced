import React from "react";
import {
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
} from "reactstrap";
import { Link } from "react-router-dom";

const TaxSlabModal = ({ isOpen, toggle, taxSlabId, taxSlab }) => {
  const selectedSlab = taxSlabId
    ? taxSlab.find((e) => e.id === taxSlabId)
    : null;

  return (
    <Modal
      id="flipModal"
      isOpen={isOpen}
      toggle={toggle}
      modalClassName="zoomIn"
      centered
    >
      <ModalHeader>
        <h5 className="modal-title" id="staticBackdropLabel">
          Tax Slabs for Lintcloud It Service Pvt Ltd
        </h5>
      </ModalHeader>
      <ModalBody className="text-center">
        <div className="mt-4">
          <Col xl={12}>
            <Table className="table-hover table-striped align-middle table-nowrap mb-0">
              <thead>
                <tr>
                  <th scope="col">Half-yearly Gross Salary (₹)</th>
                  <th scope="col">Half-yearly Tax Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(selectedSlab?.range || []).map((item, key) => (
                  <tr key={key}>
                    <td className="fw-medium">
                      {item.s} - {item.e}
                    </td>
                    <td>{item.tax}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>

          <div className="hstack gap-2 justify-content-center mt-3">
            <Link
              to="#"
              className="btn btn-link link-success fw-medium"
              onClick={toggle}
            >
              <i className="ri-close-line me-1 align-middle"></i> Close
            </Link>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default TaxSlabModal;