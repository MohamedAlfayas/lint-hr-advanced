import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import EmployeeTableFilter from "../tableFilter/EmployeeTableFilter";
import TaskListFilter from "../tableFilter/TaskListFilter";
import LeaveTypeFilter from "../tableFilter/LeaveTypeFilter";
import HolidayFilter from "../tableFilter/HolidayFilter";
import {
  employee_component_name,
  leave_approval_component_name,
  leave_type_component_name,
  attendance_approval_component_name,
  holiday_component_name,
  attendance_pending_table,
  leave_pending_table,
  task_list_component_name,
} from "../../../common/constant/Constants";
import { setTableFilterSearchText } from "../../../redux/reducers/ChildReducer/TableFilterReducer";
import AppTable from "../../../shared/ui/table/AppTable";
import { fromLegacyColumns } from "../../../shared/ui/table/fromLegacyColumns";
import { testIdModuleFor } from "../../../shared/testing/testIdModules";
import "../../../common/css/lc_style.css";

const DEFAULT_PAGE_SIZE = 25;

const FORMS_WITHOUT_SEARCH = [
  attendance_pending_table,
  attendance_approval_component_name,
  leave_approval_component_name,
  leave_pending_table,
];

const FORM_FILTERS = {
  [employee_component_name]: EmployeeTableFilter,
  [leave_type_component_name]: LeaveTypeFilter,
  [holiday_component_name]: HolidayFilter,
  [task_list_component_name]: TaskListFilter,
};

/**
 * Legacy table API (react-table v7 columns) rendered with the MUI `AppTable`.
 * Callers keep passing `columns` / `data` / `formname`; search text still
 * lives in `TableFilterReducer` because InfoTable filters rows with it.
 */
const TableContainer = ({
  columns,
  data,
  formname,
  isGlobalFilter,
  showInfo,
  serverPagination,
}) => {
  const { search } = useSelector((state) => state.TableFilterReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setTableFilterSearchText(""));
  }, [formname, dispatch]);

  const mrtColumns = useMemo(() => fromLegacyColumns(columns), [columns]);
  const actionColumn = mrtColumns.find((c) => c.header === "Action");
  const hasSelectColumn = mrtColumns.some((c) => c.id === "#");
  // MRT keeps its first column order, so columns added later (e.g. the
  // approval checkbox once permissions load) would land at the end.
  const columnSetKey = mrtColumns.map((c) => c.id).join("|");

  const showSearch = isGlobalFilter && !FORMS_WITHOUT_SEARCH.includes(formname);
  const FormFilter = isGlobalFilter ? FORM_FILTERS[formname] : null;
  const label = (formname || "table").split("_").join(" ");

  const toolbarActions = FormFilter && (
    // Legacy filters are built from reactstrap <Col>s; flatten them into
    // fixed-width toolbar items.
    <Box
      sx={{
        display: "flex",
        flexWrap: { xs: "wrap", lg: "nowrap" },
        gap: 1,
        alignItems: "center",
        flex: 1,
        minWidth: 0,
        "& > [class*='col']": {
          flex: { xs: "0 0 auto", lg: "1 1 150px" },
          width: { xs: 200, lg: "auto" },
          minWidth: { xs: 0, lg: 110 },
          maxWidth: { xs: "100%", lg: 200 },
          p: 0,
        },
        "& > .col-md-3": { flex: { lg: "1 1 190px" }, minWidth: { lg: 170 }, maxWidth: { lg: 230 } },
        "& [class*='-indicatorSeparator']": { display: "none" },
        "& [class*='-indicatorContainer']": { px: "6px" },
        // Same height for every filter; long text stays on one line.
        "& [class*='-control']": { minHeight: 40, height: 40, flexWrap: "nowrap" },
        "& [class*='-ValueContainer'], & [class*='-control'] > div:first-of-type": {
          flexWrap: "nowrap",
          overflow: "hidden",
        },
        "& [class*='-placeholder'], & [class*='-singleValue']": {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
        "& .ant-picker, & .form-control": { height: 40 },
        "& [class*='-multiValue']": { minWidth: 0, flexShrink: 1 },
        "& [class*='-MultiValueGeneric']": {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
        "& [class*='-MultiValueRemove']:hover": { bgcolor: "rgba(255,255,255,0.2)", color: "#fff" },
      }}
    >
      <FormFilter />
    </Box>
  );

  return (
    <AppTable
      key={columnSetKey}
      columns={mrtColumns}
      data={data || []}
      testIdModule={testIdModuleFor(formname)}
      exportFileName={isGlobalFilter ? label.replace(/\s+/g, "-") : undefined}
      toolbarActions={toolbarActions || undefined}
      enableRowSelection={false}
      enableColumnFilters={false}
      enableFacetedValues={false}
      enableColumnOrdering={false}
      enableColumnResizing={false}
      enableDensityToggle={false}
      enableFullScreenToggle={false}
      enableGlobalFilter={showSearch}
      // InfoTable already filters rows with the search text (some tables
      // search server-side), so the table's own search must not filter again.
      filterFns={{ passThrough: () => true }}
      globalFilterFn="passThrough"
      enableGlobalFilterModes={false}
      enableFilterMatchHighlighting={false}
      onGlobalFilterChange={(updater) => {
        const value = typeof updater === "function" ? updater(search) : updater;
        dispatch(setTableFilterSearchText(value ?? ""));
      }}
      state={{ globalFilter: search || "" }}
      enablePagination={showInfo !== false}
      enableBottomToolbar={showInfo !== false}
      enableTopToolbar
      storageKey={formname ? `${formname}-cols-v2` : undefined}
      muiTablePaperProps={{
        elevation: 0,
        sx: {
          width: "100%",
          maxWidth: "100%",
          border: 1,
          borderColor: "divider",
          borderRadius: 3,
          // Filter dropdowns open inside the toolbar and must not be clipped.
          overflow: FormFilter ? "visible" : "hidden",
        },
      }}
      emptyMessage="Sorry! No result found"
      initialState={{
        pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
        columnPinning: {
          left: hasSelectColumn ? ["#"] : [],
          right: actionColumn ? [actionColumn.id] : [],
        },
      }}
      serverPagination={
        serverPagination && {
          pageIndex: (serverPagination.page ?? 1) - 1,
          pageSize: serverPagination.pageSize ?? DEFAULT_PAGE_SIZE,
          rowCount: serverPagination.totalCount ?? 0,
          onChange: ({ pageIndex, pageSize }) => {
            const sizeChanged =
              pageSize !== (serverPagination.pageSize ?? DEFAULT_PAGE_SIZE);
            serverPagination.onChange(sizeChanged ? 1 : pageIndex + 1, pageSize);
          },
        }
      }
    />
  );
};

TableContainer.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  formname: PropTypes.string,
  isGlobalFilter: PropTypes.bool,
  showInfo: PropTypes.bool,
  serverPagination: PropTypes.shape({
    page: PropTypes.number,
    pageSize: PropTypes.number,
    totalCount: PropTypes.number,
    onChange: PropTypes.func,
  }),
};

export default TableContainer;
