import React, { useMemo } from "react";
import AppTable from "../../../shared/ui/table/AppTable";
import { EditAction, LinkCell, StatusChip, YesNoChip } from "../../../shared/ui/table/cells";

const SalaryComponentsTable = ({ items = [], onEdit }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ row }) => (
          <LinkCell onClick={() => onEdit(row.original)}>{row.original.name}</LinkCell>
        ),
      },
      { accessorKey: "earning_type_label", header: "Earning Type", filterVariant: "select" },
      { accessorKey: "calculation_type_label", header: "Calculation Type", filterVariant: "select" },
      {
        id: "epf",
        accessorFn: (r) => (r.epf ? "Yes" : "No"),
        header: "EPF",
        filterVariant: "select",
        Cell: ({ row }) => <YesNoChip value={row.original.epf} />,
      },
      {
        id: "esi",
        accessorFn: (r) => (r.esi ? "Yes" : "No"),
        header: "ESI",
        filterVariant: "select",
        Cell: ({ row }) => <YesNoChip value={row.original.esi} />,
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
      exportFileName="salary-components"
      initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
      enableRowActions
      positionActionsColumn="last"
      displayColumnDefOptions={{ "mrt-row-actions": { header: "Action", size: 80 } }}
      renderRowActions={({ row }) => <EditAction onClick={() => onEdit(row.original)} />}
    />
  );
};

export default SalaryComponentsTable;
