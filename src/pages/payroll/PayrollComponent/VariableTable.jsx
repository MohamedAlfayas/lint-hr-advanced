import React, { useState, useEffect, useMemo } from "react";
import {
  Col,
  Row,
} from "reactstrap";

import { useDispatch, useSelector } from "react-redux";
import VariableModal from "./Modal/VariableModal";
import { Api } from "../../../common/api/Api";
import { setRecurring } from "../../../redux/reducers/ChildReducer/RecurringReducer";
import AppTable from "../../../shared/ui/table/AppTable";
import { EditAction, StatusChip, YesNoChip } from "../../../shared/ui/table/cells";

const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

const displayValue = (item) => {
  if (item.calculation_type === "percentage" && item.calculation_based_on) {
    return `${item.calculation_based_on.toUpperCase()} * ${parseFloat(
      item.calculation_value || 0
    ).toFixed(2)}%`;
  }
  return Number(item.calculation_value || 0).toLocaleString("en-IN");
};

const yesNoColumn = (key, header) => ({
  id: key,
  accessorFn: (r) => (r[key] ? "Yes" : "No"),
  header,
  filterVariant: "select",
  Cell: ({ row }) => <YesNoChip value={row.original[key]} />,
});

const VariableTable = () => {
  const dispatch = useDispatch();

  const data = useSelector((state) => state.RecurringReducer.recurring_data);

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const fetchComponents = () => {
    setLoading(true);
    Api({ method: "GET", url: "payroll/component/" })
      .then((res) => {
        dispatch(setRecurring(res?.data?.data || []));
      })
      .catch((err) => console.log("Fetch Error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const openCreate = () => {
    setSelectedComponent({ id: 0 });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setSelectedComponent(item);
    setModalOpen(true);
  };

  const filtered = useMemo(
    () => (data || []).filter((d) => d.salary_type === "variable"),
    [data]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Component Name",
        Cell: ({ cell }) => <span style={{ fontWeight: 500 }}>{cell.getValue()}</span>,
      },
      {
        id: "component_type",
        accessorFn: (r) => capitalize(r.component_type),
        header: "Type",
        filterVariant: "select",
      },
      yesNoColumn("is_taxable", "Taxable"),
      { id: "annual_limit", accessorFn: displayValue, header: "Annual Limit" },
      yesNoColumn("is_individual_override", "Individual Override"),
      yesNoColumn("is_proof_required", "Proof Required"),
      yesNoColumn("is_esi_applicable", "ESI Applicable"),
      yesNoColumn("is_included_in_ctc", "Included in CTC"),
      {
        id: "status",
        accessorFn: (r) => (r.is_active ? "Active" : "Inactive"),
        header: "Status",
        filterVariant: "select",
        Cell: ({ row }) => <StatusChip active={row.original.is_active} />,
      },
    ],
    []
  );

  return (
    <>
      <Row>
        <Col md={12}>
          <AppTable
            columns={columns}
            data={filtered}
            isLoading={loading}
            onRefresh={fetchComponents}
            exportFileName="variable-components"
            emptyMessage="No components found"
            toolbarEndActions={
              <button
                data-testid="variable-pay-list-create-component-button"
                type="button"
                className="btn btn-success add-btn"
                onClick={openCreate}
              >
                <i className="ri-add-line align-bottom me-1"></i> Create Component
              </button>
            }
            enableRowActions
            positionActionsColumn="last"
            displayColumnDefOptions={{
              "mrt-row-actions": {
                header: "Action",
                size: 96,
                muiTableHeadCellProps: { align: "center" },
                muiTableBodyCellProps: { align: "center" },
              },
            }}
            renderRowActions={({ row }) => <EditAction onClick={() => openEdit(row.original)} />}
          />
        </Col>
      </Row>

      <VariableModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        component={selectedComponent}
        onSaved={() => {
          setModalOpen(false);
          fetchComponents();
        }}
      />
    </>
  );
};

export default VariableTable;
