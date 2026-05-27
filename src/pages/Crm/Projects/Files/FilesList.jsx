import React, { useState } from "react";
import {
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import { Link } from "react-router-dom";
import Dropzone from "react-dropzone";

const FilesList = () => {
  const [modalFile, setModalFile] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    fileName: "",
    uploadedFile: null,
  });

  // ✅ Dummy Data
  const [fileList, setFileList] = useState([
    {
      id: 1,
      fileName: "Project Design",
      fileType: "image",
      fileItem: "PNG File",
      size: "2.4 MB",
      createDate: "22 May 2026",
      fileUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      icon: "ri-image-2-fill",
      iconClass: "success",
    },
    {
      id: 2,
      fileName: "Company Report",
      fileType: "pdf",
      fileItem: "PDF File",
      size: "1.1 MB",
      createDate: "20 May 2026",
      fileUrl:
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      icon: "ri-file-pdf-fill",
      iconClass: "danger",
    },
    {
      id: 3,
      fileName: "Presentation",
      fileType: "doc",
      fileItem: "DOC File",
      size: "3.5 MB",
      createDate: "18 May 2026",
      fileUrl:
        "https://file-examples.com/storage/fe86f0b8f7c0d8f5d53/sample.doc",
      icon: "ri-file-word-fill",
      iconClass: "primary",
    },
  ]);

  const fileToggle = () => {
    setModalFile(!modalFile);
  };

  // ✅ Open Create Modal
  const handleFileClicks = () => {
    setIsEdit(false);
    setSelectedFile(null);

    setFormData({
      fileName: "",
      uploadedFile: null,
    });

    setModalFile(true);
  };

  // ✅ Edit File
  const handleFileClick = (item) => {
    setIsEdit(true);
    setSelectedFile(item);

    setFormData({
      fileName: item.fileName,
      uploadedFile: null,
    });

    setModalFile(true);
  };

  // ✅ Upload File
  const handleAcceptedFiles = (files) => {
    if (files.length > 0) {
      setFormData({
        ...formData,
        uploadedFile: files[0],
      });
    }
  };

  // ✅ Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      const updatedList = fileList.map((item) =>
        item.id === selectedFile.id
          ? {
              ...item,
              fileName: formData.fileName,
            }
          : item,
      );

      setFileList(updatedList);
    } else {
      const newFile = {
        id: Date.now(),
        fileName: formData.fileName,
        fileType: "file",
        fileItem: formData.uploadedFile
          ? formData.uploadedFile.type
          : "Unknown File",
        size: formData.uploadedFile
          ? `${(formData.uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
          : "0 MB",
        createDate: new Date().toLocaleDateString(),
        fileUrl: formData.uploadedFile
          ? URL.createObjectURL(formData.uploadedFile)
          : "#",
        icon: "ri-file-fill",
        iconClass: "info",
      };

      setFileList([newFile, ...fileList]);
    }

    setModalFile(false);
  };

  // ✅ Open File
  const openFile = (item) => {
    window.open(item.fileUrl, "_blank");
  };

  // ✅ Delete
  const onClickFileDelete = (item) => {
    const filtered = fileList.filter((x) => x.id !== item.id);
    setFileList(filtered);
  };

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          {/* Header */}
          <div className="d-flex align-items-center mb-3">
            <h5 className="flex-grow-1 fs-16 mb-0">Recent File</h5>

            <div className="flex-shrink-0">
              <button className="btn btn-success" onClick={handleFileClicks}>
                <i className="ri-add-line align-bottom me-1"></i>
                Add File
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table align-middle table-nowrap mb-0">
              <thead className="table-active">
                <tr>
                  <th>Name</th>
                  <th>File Item</th>
                  <th>File Size</th>
                  <th>Recent Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {fileList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 fs-17 me-2">
                          <i
                            className={`${item.icon} text-${item.iconClass}`}
                          />
                        </div>

                        <div
                          className="flex-grow-1 text-primary cursor-pointer"
                          style={{ cursor: "pointer" }}
                          onClick={() => openFile(item)}
                        >
                          {item.fileName}
                        </div>
                      </div>
                    </td>

                    <td>{item.fileItem}</td>

                    <td>{item.size}</td>

                    <td>{item.createDate}</td>

                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        {/* Dropdown */}
                        <UncontrolledDropdown direction="start">
                          <DropdownToggle
                            tag="button"
                            className="btn btn-light btn-icon btn-sm"
                          >
                            <i className="ri-more-fill align-bottom" />
                          </DropdownToggle>

                          <DropdownMenu className="dropdown-menu-end">
                            <DropdownItem onClick={() => openFile(item)}>
                              View
                            </DropdownItem>

                            <DropdownItem onClick={() => handleFileClick(item)}>
                              Rename
                            </DropdownItem>

                            <DropdownItem divider />

                            <DropdownItem
                              onClick={() => onClickFileDelete(item)}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="align-items-center mt-3 row g-3 text-center text-sm-start">
            <div className="col-sm">
              <div className="text-muted">
                Showing <span className="fw-semibold">3</span> of{" "}
                <span className="fw-semibold">3</span> Results
              </div>
            </div>

            <div className="col-sm-auto">
              <ul className="pagination pagination-separated pagination-sm justify-content-center justify-content-sm-start mb-0">
                <li className="page-item disabled">
                  <Link to="#" className="page-link">
                    ←
                  </Link>
                </li>

                <li className="page-item active">
                  <Link to="#" className="page-link">
                    1
                  </Link>
                </li>

                <li className="page-item disabled">
                  <Link to="#" className="page-link">
                    →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ================= Modal ================= */}
      <Modal isOpen={modalFile} toggle={fileToggle} centered className="zoomIn">
        <ModalHeader toggle={fileToggle} className="p-3 bg-success-subtle">
          {isEdit ? "File Rename" : "Create File"}
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleSubmit}>
            {/* File Name */}
            <div className="mb-4">
              <Label className="form-label">File Name</Label>

              <Input
                type="text"
                placeholder="Enter file name"
                value={formData.fileName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fileName: e.target.value,
                  })
                }
              />
            </div>

            {/* Dropzone */}
            {!isEdit && (
              <div className="mb-4">
                <Label className="form-label">Upload File</Label>

                <Dropzone
                  onDrop={(acceptedFiles) => {
                    handleAcceptedFiles(acceptedFiles);
                  }}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div className="dropzone dz-clickable border rounded p-4 text-center">
                      <div
                        className="dz-message needsclick"
                        {...getRootProps()}
                      >
                        <input {...getInputProps()} />

                        <div className="mb-3">
                          <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                        </div>

                        <h5>Drop files here or click to upload.</h5>

                        {formData.uploadedFile && (
                          <p className="mt-3 text-success mb-0">
                            Selected: {formData.uploadedFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Dropzone>
              </div>
            )}

            {/* Buttons */}
            <div className="hstack gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-ghost-success"
                onClick={() => setModalFile(false)}
              >
                <i className="ri-close-line align-bottom"></i>
                Close
              </button>

              <button type="submit" className="btn btn-primary">
                {isEdit ? "Save" : "Create"}
              </button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default FilesList;
