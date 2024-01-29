import React from "react";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { Link } from "react-router-dom";
import OrgTable from "./OrgTable";

const OrgModal = ({ showOrgModal, toggleOrgModal, departmentId }) => {
  return (
    <Modal
      className="modal-dialog"
      scrollable={true}
      isOpen={showOrgModal}
      toggle={() => {
        toggleOrgModal();
      }}
      centered
    >
      <ModalHeader
        className="modal-title"
        id="myModalLabel"
        toggle={() => {
          toggleOrgModal();
        }}
      >
        Members
      </ModalHeader>

      <ModalBody className="text-center p-1">
        <div>
          <OrgTable departmentId={departmentId} />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default OrgModal;
