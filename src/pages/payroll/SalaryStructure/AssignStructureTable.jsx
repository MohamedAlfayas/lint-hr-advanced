import React, { useState, useEffect, useMemo } from "react";
import { Col, Row, Button } from "reactstrap";
import { IconButton, Tooltip } from "@mui/material";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { Api } from "../../../common/api/Api";
import AppTable from "../../../shared/ui/table/AppTable";
import AssignStructureEditModal from "./AssignStructureEditModal";
import Select from "../../../shared/ui/TestableSelect";
import {
  ApvChip,
  ApvEmployee,
  ApvStatus,
} from "../../../component/common/approval/ApprovalCells";

const AssignStructureTable = ({ onImport, onExport }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedStructureId, setSelectedStructureId] = useState("");
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

  const filteredData = employees.filter((item) =>
    selectedStructureId === ""
      ? true
      : selectedStructureId === "unassigned"
        ? !item.salary_structure
        : item.salary_structure?.id === Number(selectedStructureId),
  );

  const rowSelection = useMemo(
    () => Object.fromEntries(selectedIds.map((id) => [id, true])),
    [selectedIds],
  );

  const handleRowSelectionChange = (updater) => {
    const next = typeof updater === "function" ? updater(rowSelection) : updater;
    setSelectedIds(Object.keys(next).filter((id) => next[id]));
  };

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

  const structureOptions = [
    { label: "All Structures", value: "" },
    { label: "Not Assigned", value: "unassigned" },
    ...(salaryStructures || []).map((s) => ({
      label: s.name,
      value: s.id,
    })),
  ];

  const columns = useMemo(
    () => [
      { accessorKey: "emp_id", header: "Emp ID", size: 110 },
      {
        id: "name",
        accessorFn: (item) => item.name || "",
        header: "Name",
        Cell: ({ row }) => (
          <ApvEmployee
            employee={{ first_name: row.original.name, profile_url: row.original.image_url }}
            sub={row.original.emp_id ? `#${row.original.emp_id}` : null}
          />
        ),
      },
      {
        id: "role",
        accessorFn: (item) => item.role?.name || "—",
        header: "Role",
        filterVariant: "select",
        Cell: ({ row }) => <ApvChip icon="ri-shield-user-line">{row.original.role?.name}</ApvChip>,
      },
      {
        id: "salary_structure",
        accessorFn: (item) => item.salary_structure?.name || "Not Assigned",
        header: "Salary Structure",
        filterVariant: "select",
        Cell: ({ row }) =>
          row.original.salary_structure ? (
            <ApvStatus tone="success" icon="ri-stack-line" label={row.original.salary_structure.name} />
          ) : (
            <ApvStatus tone="warning" icon="ri-error-warning-line" label="Not Assigned" />
          ),
      },
    ],
    [],
  );

  return (
    <>
      <Row>
        <Col md={12} className="mt-3">
          <AppTable
            columns={columns}
            data={filteredData}
            isLoading={loading}
            onRefresh={fetchEmployees}
            exportFileName="assign-salary-structure"
            getRowId={(item) => String(item.emp_uuid)}
            enableRowSelection
            selectAllMode="all"
            onRowSelectionChange={handleRowSelectionChange}
            state={{ rowSelection }}
            initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
            toolbarActions={
              <>
                <div style={{ minWidth: 220 }}>
                  <Select
                    id="salary_structure_filter"
                    name="salary_structure_filter"
                    isClearable={true}
                    isMulti={false}
                    options={structureOptions}
                    placeholder="Select Salary Structure"
                    value={
                      selectedStructureId !== ""
                        ? structureOptions.find((opt) => opt.value === selectedStructureId)
                        : null
                    }
                    onChange={(selected) =>
                      setSelectedStructureId(selected ? selected.value : "")
                    }
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                </div>
                {selectedIds.length >= 2 && (
                  <Button color="primary" onClick={handleBulkAssign}>
                    <i className="ri-user-add-line align-middle me-1"></i>
                    Assign Structure ({selectedIds.length})
                  </Button>
                )}
              </>
            }
            enableRowActions
            positionActionsColumn="last"
            displayColumnDefOptions={{ "mrt-row-actions": { header: "Action", size: 90 } }}
            renderRowActions={({ row }) => (
              <Tooltip title="Assign">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleSingleAssign(row.original)}
                >
                  <LinkRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          />
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
