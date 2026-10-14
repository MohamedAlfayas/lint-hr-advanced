import { TableSkeletonBlock } from "./Skeleton";

const TableSkeleton = ({ rows = 8, cols = 6 }) => (
  <div className="pt-3">
    <TableSkeletonBlock rows={rows} cols={cols} testId="table-loading-skeleton" label="Loading table" />
  </div>
);

export default TableSkeleton;
