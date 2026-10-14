import React from "react";

/**
 * reactstrap's ModalHeader close button with a data-testid, for
 * `<ModalHeader toggle={onClose} close={<ModalCloseButton onClick={onClose} testId="..." />}>`.
 */
const ModalCloseButton = ({ onClick, testId }) => (
  <button type="button" className="btn-close" aria-label="Close" onClick={onClick} data-testid={testId} />
);

export default ModalCloseButton;
