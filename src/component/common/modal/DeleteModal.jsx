import PropTypes from "prop-types";
import React from "react";
import { Modal, ModalBody } from "reactstrap";

const DeleteModal = ({ show, onDeleteClick, onCloseClick }) => {
  return (
    <Modal
      data-testid="delete-dialog"
      fade={true}
      isOpen={show}
      toggle={onCloseClick}
      centered={true}
      size="sm"
      className="dm-modal"
    >
      <ModalBody className="dm-body">
        <button
          data-testid="delete-close-button"
          type="button"
          className="dm-close"
          aria-label="Close"
          onClick={onCloseClick}
        >
          <i className="ri-close-line" />
        </button>

        <div className="dm-icon">
          <span className="dm-icon-ring" />
          <i className="ri-delete-bin-6-line" />
        </div>

        <h5 className="dm-title">Delete this record?</h5>
        <p className="dm-text">
          This action can't be undone. The record will be permanently removed.
        </p>

        <div className="dm-actions">
          <button
            data-testid="delete-cancel-button"
            type="button"
            className="btn btn-light"
            data-bs-dismiss="modal"
            onClick={onCloseClick}
          >
            Cancel
          </button>
          <button
            data-testid="delete-confirm-button"
            type="button"
            className="btn btn-danger"
            id="delete-record"
            onClick={onDeleteClick}
          >
            <i className="ri-delete-bin-line" />
            Yes, Delete
          </button>
        </div>
      </ModalBody>

      <style>{`
        .dm-modal .modal-content{overflow:hidden}
        .dm-modal .dm-body{position:relative;padding:32px 24px 22px !important;text-align:center;
          background:radial-gradient(120% 60% at 50% 0%,rgba(var(--vz-danger-rgb),.10),transparent 70%)}
        .dm-close{position:absolute;top:12px;right:12px;width:32px;height:32px;border:0;border-radius:10px;display:grid;place-items:center;font-size:18px;
          color:var(--vz-secondary-color);background:transparent;transition:all .15s}
        .dm-close:hover{color:var(--vz-danger);background:rgba(var(--vz-danger-rgb),.1)}
        .dm-icon{position:relative;width:72px;height:72px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;font-size:30px;color:#fff;
          background:linear-gradient(135deg,var(--vz-danger),rgba(var(--vz-danger-rgb),.75));box-shadow:0 14px 30px -12px rgba(var(--vz-danger-rgb),.9)}
        .dm-icon-ring{position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(var(--vz-danger-rgb),.25);animation:dmPulse 1.8s ease-out infinite}
        @keyframes dmPulse{0%{transform:scale(.9);opacity:1}100%{transform:scale(1.25);opacity:0}}
        .dm-title{margin:0 0 6px;font-size:1.1rem;font-weight:700;color:var(--vz-heading-color)}
        .dm-text{margin:0 auto;max-width:260px;font-size:.86rem;line-height:1.5;color:var(--vz-secondary-color)}
        .dm-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}
        .dm-actions .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:40px;border-radius:10px;font-weight:500}
        .dm-actions .btn-danger{box-shadow:0 8px 18px -8px rgba(var(--vz-danger-rgb),.9)}
      `}</style>
    </Modal>
  );
};

DeleteModal.propTypes = {
  onCloseClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  show: PropTypes.any,
};

export default DeleteModal;
