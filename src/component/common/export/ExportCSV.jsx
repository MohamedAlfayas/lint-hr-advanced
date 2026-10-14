import PropTypes from "prop-types";
import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { CSVLink } from "react-csv";
import { employee_component_name } from "../../../common/constant/Constants";
import {
  employeeSampleData,
  employeeCSVHeaders,
} from "../../../common/js/employeeSampleData";
import ModalCloseButton from "../../../shared/ui/ModalCloseButton";

const ExportCSV = ({ show, onCloseClick, formname, data }) => {
  // Only the employee form gets the special template.
  const isEmployeeForm = formname === employee_component_name;

  const csvData = isEmployeeForm ? employeeSampleData : data || [];
  const csvHeaders = isEmployeeForm ? employeeCSVHeaders : undefined;
  const csvFilename = isEmployeeForm
    ? "LCEmployeeCreationSampleData.csv"
    : "export.csv";

  return (
    <Modal data-testid="export-show-dialog" isOpen={show} toggle={onCloseClick} centered={true}>
      <ModalHeader close={<ModalCloseButton onClick={onCloseClick} testId="export-show-close-button" />} toggle={onCloseClick}></ModalHeader>
      <ModalBody className="py-3 px-5">
        <div className="mt-2 text-center">
          <lord-icon
            src="https://cdn.lordicon.com/nocovwne.json"
            trigger="loop"
            colors="primary:#0ab39c,secondary:#f06548"
            style={{ width: "100px", height: "100px" }}
          ></lord-icon>
          <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
            <h4>Are you sure ?</h4>
            <p className="text-muted mx-4 mb-0">
              Are you sure you want to export CSV file?
            </p>
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
          <button
            data-testid="export-show-footer-close-button"
            type="button"
            className="btn w-sm btn-light"
            data-bs-dismiss="modal"
            onClick={onCloseClick}
          >
            Close
          </button>
          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename={csvFilename}
            type="button"
            onClick={onCloseClick}
            className="btn w-sm btn-success "
            id="delete-record"
          >
            Download
          </CSVLink>
        </div>
      </ModalBody>
    </Modal>
  );
};

ExportCSV.propTypes = {
  onCloseClick: PropTypes.func,
  formname: PropTypes.string,
  data: PropTypes.any,
  show: PropTypes.any,
};

export default ExportCSV;
