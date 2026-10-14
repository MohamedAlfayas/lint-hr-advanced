import React, { useMemo } from "react";
import dayjs from "dayjs";
import { DateFormat } from "../../../common/constant/Constants";
import {
  ApvChip,
  ApvDate,
  ApvReason,
  ApvStatus,
  ApvTitle,
} from "../../../component/common/approval/ApprovalCells";

const typeLabel = (h) => (h.is_restricted ? "Restricted" : "Non Restricted");

export const useHolidayColumns = (workSchedules) => {
  const wsById = useMemo(
    () => new Map(workSchedules.map((ws) => [ws.id, ws.label ?? ws.name])),
    [workSchedules],
  );

  return useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Holiday",
        size: 260,
        Cell: ({ row }) => {
          const d = dayjs(row.original.date);
          const isPast = d.isBefore(dayjs(), "day");
          return (
            <ApvTitle
              icon="ri-calendar-event-line"
              title={row.original.name}
              sub={d.isValid() ? d.format("dddd") : undefined}
              tone={isPast ? "secondary" : "primary"}
            />
          );
        },
      },
      {
        id: "date",
        accessorFn: (h) => dayjs(h.date).format("YYYY-MM-DD"),
        header: "Date",
        size: 200,
        exportValue: (h) => dayjs(h.date).format(DateFormat),
        Cell: ({ row }) => {
          const d = dayjs(row.original.date);
          const today = dayjs();
          const status = d.isSame(today, "day")
            ? { label: "Today", tone: "success", icon: "ri-sun-line" }
            : d.isAfter(today, "day")
              ? {
                  label: `In ${d.diff(today.startOf("day"), "day")} days`,
                  tone: "primary",
                  icon: "ri-time-line",
                }
              : null;
          return (
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <ApvDate value={row.original.date} />
              {status && <ApvStatus {...status} />}
            </div>
          );
        },
      },
      {
        id: "work_schedules",
        accessorFn: (h) => (h.work_schedule_id_list || []).length,
        header: "Applicable For",
        size: 160,
        filterVariant: "range",
        exportValue: (h) =>
          (h.work_schedule_id_list || []).map((id) => wsById.get(id) || id).join(", "),
        Cell: ({ row }) => {
          const ids = row.original.work_schedule_id_list || [];
          const names = ids.map((id) => wsById.get(id)).filter(Boolean);
          return (
            <ApvChip
              icon="ri-calendar-2-line"
              title={names.length ? names.join(", ") : "No work schedules"}
            >
              {`${ids.length} ${ids.length === 1 ? "Shift" : "Shifts"}`}
            </ApvChip>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 240,
        Cell: ({ cell }) => <ApvReason text={cell.getValue()} />,
      },
      {
        id: "type",
        accessorFn: typeLabel,
        header: "Type",
        size: 150,
        filterVariant: "select",
        filterSelectOptions: ["Restricted", "Non Restricted"],
        Cell: ({ row }) =>
          row.original.is_restricted ? (
            <ApvStatus tone="info" icon="ri-lock-line" label="Restricted" />
          ) : (
            <ApvStatus tone="success" icon="ri-checkbox-circle-line" label="Non Restricted" />
          ),
      },
    ],
    [wsById],
  );
};
