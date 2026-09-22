import React, { useEffect, useState } from "react";
import { Badge } from "reactstrap";
import { fetchStatusMaster, colorFor } from "./statusHelpers";

const StatusBadge = ({ scope, code, size = "fs-12" }) => {
  const [label, setLabel] = useState(code);
  const [color, setColor] = useState(colorFor(code));

  useEffect(() => {
    setLabel(code);
    setColor(colorFor(code));
    let active = true;
    fetchStatusMaster(scope).then((rows) => {
      if (!active) return;
      const row = rows.find((r) => r.code === code);
      if (!row) return;
      setLabel(row.label || code);
      setColor(row.color || colorFor(code));
    });
    return () => { active = false; };
  }, [scope, code]);

  return <Badge color={color} pill className={size}>{label}</Badge>;
};

export default StatusBadge;
