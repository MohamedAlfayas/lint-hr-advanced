import React, { useEffect, useState } from "react";
import { Input, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { Api } from "../../../common/api/Api";
import { fetchStatusMaster, isZeroSettlement, labelFor, nextStatusCodes } from "./statusHelpers";
import StatusBadge from "./StatusBadge";

const PayslipStatusCell = ({ payslip, runStatus, onChanged }) => {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetchStatusMaster("payslip").then(setRows); }, []);

  // A zero slip has nothing to record. Do not offer "paid" while the run is
  // partially_paid — the status update is rejected until the run is rejected
  // or reopened. The run itself is moved to paid once nothing is outstanding.
  const nextCodes = nextStatusCodes(rows, payslip.status, runStatus);
  const canMarkZeroPaid = isZeroSettlement(payslip) && runStatus !== "partially_paid";
  const options = canMarkZeroPaid && !nextCodes.includes("paid")
    ? [...nextCodes, "paid"]
    : nextCodes;

  const handleChange = (e) => {
    const target = e.target.value;
    if (!target) return;
    setBusy(true);
    Api({
      method: "PATCH",
      url: "payroll/employee-payslip-status/",
      data: { id: payslip.id, status: target },
    })
      .then((res) => {
        const body = res?.data?.data;
        const skipped = Array.isArray(body?.skipped) ? body.skipped : [];
        const updatedStatus = body?.status;
        if (skipped.length && !body?.updated_count) {
          toast.error(skipped[0]?.reason || "Status was not changed.");
          return;
        }
        if (updatedStatus && updatedStatus !== target) {
          toast.error(`Status stayed ${updatedStatus}.`);
          return;
        }
        toast.success("Status updated");
        onChanged && onChanged();
      })
      .catch((err) => toast.error(err?.response?.data?.error_message || "Failed to update status."))
      .finally(() => setBusy(false));
  };

  if (busy) return <Spinner size="sm" />;

  return (
    <div className="d-flex align-items-center gap-1">
      <StatusBadge scope="payslip" code={payslip.status} />
      {options.length > 0 && (
        <Input type="select" bsSize="sm" style={{ width: 140, fontSize: 11 }} value="" onChange={handleChange}>
          <option value="">Move to…</option>
          {options.map((c) => <option key={c} value={c}>{labelFor(rows, c)}</option>)}
        </Input>
      )}
    </div>
  );
};

export default PayslipStatusCell;
