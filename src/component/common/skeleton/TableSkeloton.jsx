import "../../../common/css/lc_style.css";
const TableSkeleton = ({ rows = 8 }) => {
  return (
    <div className="table-responsive table-card lc-skelton-table">
      <table className="table align-middle table-nowrap">
        <thead className="table-light">
          <tr>
            {[...Array(6)].map((_, i) => (
              <th key={i}>
                <div className="skeleton skeleton-text"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(6)].map((_, colIndex) => (
                <td key={colIndex}>
                  <div className="skeleton skeleton-text"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
