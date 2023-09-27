import React from "react";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { Link } from "react-router-dom";
import OrgTable from "./OrgTable";

const OrgModal = ({ showOrgModal, toggleOrgModal, teamMembersID }) => {
  return (
    <Modal
      isOpen={showOrgModal}
      toggle={() => {
        toggleOrgModal();
      }}
      centered>
      <ModalHeader className="modal-title">Members</ModalHeader>

      <ModalBody className="text-center p-1">
        <div className="mt-4">
          <OrgTable teamMembersID={teamMembersID} />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default OrgModal;
