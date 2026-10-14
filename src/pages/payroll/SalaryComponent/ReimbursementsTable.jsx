import React, { useMemo } from "react";
import AppTable from "../../../shared/ui/table/AppTable";
import { EditAction, LinkCell, StatusChip } from "../../../shared/ui/table/cells";

const ReimbursementsTable = ({ items = [], onEdit }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ row }) => (
          <LinkCell onClick={() => onEdit(row.original)}>{row.original.name}</LinkCell>
        ),
      },
      { accessorKey: "deduction_type_label", header: "Reimbursement Type", filterVariant: "select" },
      {
        accessorKey: "maximum_reimbursable_amount",
        header: "Maximum Reimbursable Amount",
        filterVariant: "range",
        Cell: ({ cell }) =>
          cell.getValue() != null && cell.getValue() !== ""
            ? Number(cell.getValue()).toLocaleString("en-IN")
            : "—",
      },
      {
        id: "status",
        accessorFn: (r) => (r.mark_active ? "Active" : "Inactive"),
        header: "Status",
        filterVariant: "select",
        Cell: ({ row }) => <StatusChip active={row.original.mark_active} />,
      },
    ],
    [onEdit],
  );

  return (
    <AppTable
      columns={columns}
      data={items}
      exportFileName="reimbursements"
      initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
      enableRowActions
      positionActionsColumn="last"
      displayColumnDefOptions={{ "mrt-row-actions": { header: "Action", size: 80 } }}
      renderRowActions={({ row }) => <EditAction onClick={() => onEdit(row.original)} />}
    />
  );
};

export default ReimbursementsTable;
