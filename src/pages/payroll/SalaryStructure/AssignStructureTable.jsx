import React, { useState, useEffect } from "react";
import {
  Col,
  Row,
  Table,
  Button,
  Input,
  CardHeader,
  CardTitle,
} from "reactstrap";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { Api } from "../../../common/api/Api";
import AssignStructureEditModal from "./AssignStructureEditModal";
import Select from "react-select";

const AssignStructureTable = ({ onImport, onExport }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedStructureId, setSelectedStructureId] = useState("");
  const [pageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  const salaryStructures = useSelector(
    (state) => state.SalaryStructureReducer.salary_structures,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("single");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = () => {
    setLoading(true);
    Api({
      method: "GET",
      url: "payroll/get-employee-assigned-salary-structure/",
    })
      .then((res) => {
        setEmployees(res?.data?.data || []);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStructureId]);

  const filteredData = employees.filter((item) => {
    const matchesSearch = (item.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStructure =
      selectedStructureId === ""
        ? true
        : selectedStructureId === "unassigned"
          ? !item.salary_structure
          : item.salary_structure?.id === Number(selectedStructureId);

    return matchesSearch && matchesStructure;
  });

  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredData.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPages = () => {
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, totalPages);
    if (end - start < 4) start = Math.max(end - 4, 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // ✅ FIXED: Select all from filteredData (all pages), not just currentData
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map((item) => item.emp_uuid));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (uuid) => {
    setSelectedIds((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid],
    );
  };

  // ✅ FIXED: isAllSelected checks against filteredData
  const isAllSelected =
    filteredData.length > 0 &&
    filteredData.every((item) => selectedIds.includes(item.emp_uuid));

  // ✅ NEW: indeterminate state — some (not all) selected
  const isSomeSelected =
    !isAllSelected &&
    currentData.some((item) => selectedIds.includes(item.emp_uuid));

  const headerCheckboxRef = React.useRef(null);
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const handleSingleAssign = (employee) => {
    setModalMode("single");
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const handleBulkAssign = () => {
    if (selectedIds.length < 2) {
      Swal.fire({
        icon: "warning",
        title: "Select Multiple Employees",
        text: "Please select at least 2 employees to use bulk assign.",
      });
      return;
    }
    setModalMode("bulk");
    setSelectedEmployee(null);
    setModalOpen(true);
  };

  const handleSaveSuccess = () => {
    setSelectedIds([]);
    fetchEmployees();
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  return (
    <>
      <Row>
        <Col md={12}>
          {/* Toolbar */}
          <div className="d-flex justify-content-between mt-3 mb-3 flex-wrap gap-2">
            <div className="d-flex gap-2 flex-wrap align-items-center">
            
              <div style={{ position: "relative", width: 260 }}>
  <i
    className="bx bx-search-alt"
    style={{
      position: "absolute",
      left: 10,
      top: "50%",
      transform: "translateY(-50%)",
      
    }}
  ></i>

  <Input
    placeholder="Search employee"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{ paddingLeft: 35 }}
  />
</div>

              <Select
                id="salary_structure_filter"
                name="salary_structure_filter"
                isClearable={true}
                isMulti={false}
                options={[
                  { label: "All Structures", value: "" },
                  { label: "Not Assigned", value: "unassigned" },
                  ...(salaryStructures || []).map((s) => ({
                    label: s.name,
                    value: s.id,
                  })),
                ]}
                placeholder="Select Salary Structure"
                value={
                  selectedStructureId !== ""
                    ? [
                        { label: "All Structures", value: "" },
                        { label: "Not Assigned", value: "unassigned" },
                        ...(salaryStructures || []).map((s) => ({
                          label: s.name,
                          value: s.id,
                        })),
                      ].find((opt) => opt.value === selectedStructureId)
                    : null
                }
                onChange={(selected) =>
                  setSelectedStructureId(selected ? selected.value : "")
                }
              />

              {selectedIds.length >= 2 && (
                <Button color="primary" onClick={handleBulkAssign}>
                  <i className="ri-user-add-line align-middle me-1"></i>
                  Assign Structure ({selectedIds.length})
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <Table
            bordered
            hover
            responsive
            className="align-middle"
            style={{ textAlign: "center" }}
          >
            <thead>
              <tr>
                <th style={{ width: 44, textAlign: "center" }}>
                  {/* ✅ FIXED: uses ref for indeterminate + checks all filtered */}
                  <Input
                    type="checkbox"
                    innerRef={headerCheckboxRef}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Emp ID</th>
                <th style={{ textAlign: "left", paddingLeft: 16 }}>Name</th>
                <th>Role</th>
                <th>Salary Structure</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-muted py-4">
                    Loading...
                  </td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((item) => (
                  <tr key={item.emp_uuid}>
                    <td style={{ textAlign: "center" }}>
                      <Input
                        type="checkbox"
                        checked={selectedIds.includes(item.emp_uuid)}
                        onChange={() => handleSelectOne(item.emp_uuid)}
                      />
                    </td>

                    <td>{item.emp_id}</td>

                    <td style={{ textAlign: "left" }}>
                      <div
                        className="d-flex align-items-center gap-2"
                        style={{ paddingLeft: 4 }}
                      >
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: "#0ab39c",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 600,
                              flexShrink: 0,
                              letterSpacing: "0.5px",
                            }}
                          >
                            {getInitials(item.name)}
                          </div>
                        )}
                        <span>{item.name}</span>
                      </div>
                    </td>

                    <td>{item.role?.name || "—"}</td>

                    <td>
                      {item.salary_structure ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 12px",
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 500,
                            background: "#e0f5f0",
                            color: "#0d9e78",
                          }}
                        >
                          {item.salary_structure.name}
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 12px",
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 500,
                            background: "#fff3e0",
                            color: "#e07b00",
                          }}
                        >
                          Not Assigned
                        </span>
                      )}
                    </td>

                    <td>
                      <Button
                        size="sm"
                        color="primary"
                        outline
                        onClick={() => handleSingleAssign(item)}
                        style={{ fontSize: 12, padding: "4px 14px" }}
                      >
                        <i className="ri-links-line align-middle me-1"></i>
                        Assign
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-muted py-4">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted" style={{ fontSize: 13 }}>
              Showing {totalRecords === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(startIndex + pageSize, totalRecords)} of {totalRecords}
              {selectedIds.length > 0 && (
                <span className="ms-2 text-primary fw-semibold">
                  ({selectedIds.length} selected)
                </span>
              )}
            </div>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Prev
              </Button>
              {getPages().map((p) => (
                <Button
                  key={p}
                  size="sm"
                  color={p === currentPage ? "primary" : "light"}
                  onClick={() => goToPage(p)}
                >
                  {p}
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

      <AssignStructureEditModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        mode={modalMode}
        employee={selectedEmployee}
        bulkUuids={selectedIds}
        onSaveSuccess={handleSaveSuccess}
      />
    </>
  );
};

export default AssignStructureTable;