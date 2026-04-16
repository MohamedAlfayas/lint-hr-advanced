import React, { useState, useEffect } from "react";
import { Col, Row, Table, Button } from "reactstrap";
import { Link } from "react-router-dom";

const BenefitsTable = ({ items = [], onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  const totalRecords = items.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const currentData = items.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <Row>
      <Col md={12}>
        <div className="table-responsive">
          <Table className="table-borderless align-middle table-nowrap mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Benefit Type</th>
                <th>Benefit Frequency</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    No records found
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link
                        to="#"
                        className="text-primary fw-medium"
                        onClick={() => onEdit(item)}
                      >
                        {item.name}
                      </Link>
                    </td>

                    <td>{item.deduction_type_label}</td>

                    <td>{item.frequency_label}</td>

                   
                    <td>
                      {item.mark_active ? (
                        <span className="text-success">Active</span>
                      ) : (
                        <span className="text-muted">Inactive</span>
                      )}
                    </td>

                    <td>
                      <Link to="#" onClick={() => onEdit(item)}>
                        <i className="ri-pencil-fill fs-16"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <div className="text-muted">
            Showing {totalRecords === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(endIndex, totalRecords)} of {totalRecords}
          </div>

          <div className="d-flex gap-1">
            <Button
              size="sm"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Prev
            </Button>

            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                size="sm"
                color={currentPage === i + 1 ? "primary" : "light"}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default BenefitsTable;