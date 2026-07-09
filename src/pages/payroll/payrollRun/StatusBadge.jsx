import React, { useEffect, useState } from "react";
import { Badge } from "reactstrap";
import { fetchStatusMaster, colorFor } from "./statusHelpers";

const StatusBadge = ({ scope, code, size = "fs-12" }) => {
  const [label, setLabel] = useState(code);

  useEffect(() => {
    fetchStatusMaster(scope).then((rows) => {
      const row = rows.find((r) => r.code === code);
      if (row) setLabel(row.label);
    });
  }, [scope, code]);

  return <Badge color={colorFor(code)} pill className={size}>{label}</Badge>;
};

export default StatusBadge;