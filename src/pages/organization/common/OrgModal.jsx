import React from "react";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { Link } from "react-router-dom";
import OrgTable from "./OrgTable";

const OrgModal = ({ showOrgModal, toggleOrgModal, departmentId, organizationName }) => {
  return (
    <Modal
      className="modal-dialog"
      style={{ maxWidth: '50%', width: '50%', margin: 'auto' }} 
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
        style={{ fontSize: '0.90rem', padding: '0.25rem' }}
      >
        {organizationName} Members
      
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