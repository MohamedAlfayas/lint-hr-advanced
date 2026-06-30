import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Badge,
  Table,
  Button,
  Spinner,
} from "reactstrap";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { Api } from "../../common/api/Api";

// ─── Helpers (same as EmployeePayslip.jsx) ────────────────────────────────────
const fmtDays = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  const wholeDays = Math.floor(num);
  const hours = Math.round((num - wholeDays) * 8); // 1 day = 8 hrs
  if (hours === 0) return `${wholeDays} day${wholeDays !== 1 ? "s" : ""}`;
  if (wholeDays === 0) return `${hours} hr${hours !== 1 ? "s" : ""}`;
  return `${wholeDays} day${wholeDays !== 1 ? "s" : ""} ${hours} hr${hours !== 1 ? "s" : ""}`;
};

const transformPayslip = (item) => {
  const earningsMap = {};
  const deductionsMap = {};
  (item.earnings || []).forEach((c) => {
    earningsMap[c.component_name] = c.final_amount;
  });
  (item.deductions || []).forEach((c) => {
    deductionsMap[c.component_name] = c.final_amount;
  });

  return {
    ...item,
    earnings: earningsMap,
    deductions: deductionsMap,
    earningsList: item.earnings || [],
    deductionsList: item.deductions || [],
    regularizationDetails: item.regularization_details || [],
    employerContributions: item.employer_contributions || {
      items: [],
      total_employer_cost: "0.00",
      embedded_in_ctc: "0.00",
      additional_cost: "0.00",
    },
    ctcBreakdown: item.ctc_breakdown || null,
    is_regularized: Boolean(item.is_regularized),
    regularized_days_count:
      item.regularized_days_count ||
      (item.regularization_details || []).length ||
      0,
    employee_name: item.employee_name || `Employee #${item.employee}`,
    emp_id: item.employee_emp_id || "—",
    department: item.department_name || "",
    joining_date: item.joining_date || "—",
    pay_period: item.pay_period || "—",
    pay_date: item.pay_date || "—",
    net_pay_in_words: item.net_pay_in_words || null,
    pf_account: item.pf_account || "—",
    uan: item.uan || "—",
    profile_url: item.profile_url || null,
  };
};

const fmt = (val, allowDec = true) =>
  Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: allowDec ? 2 : 0,
    maximumFractionDigits: allowDec ? 2 : 0,
  });

const getGross = (slip) => slip?.gross_earnings || "0.00";

const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convert(n % 100) : "")
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convert(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convert(n % 100000) : "")
      );
    return (
      convert(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convert(n % 10000000) : "")
    );
  };
  const n = Math.floor(num);
  return n === 0 ? "Zero" : "Indian Rupee " + convert(n) + " Only";
};

// ─── PDF styles (same as EmployeePayslip.jsx) ─────────────────────────────────
const S = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 32,
    paddingRight: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  companyName: { fontSize: 17, fontFamily: "Helvetica-Bold", color: "#299cdb" },
  headerRight: { alignItems: "flex-end" },
  payslipLabel: { fontSize: 8, color: "#888888" },
  payPeriod: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#1a1a1a" },
  dividerBlue: {
    borderBottomWidth: 2,
    borderBottomColor: "#299cdb",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLeft: { flex: 1, marginRight: 14 },
  sectionTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#888888",
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  summaryItem: { flexDirection: "row", marginBottom: 4 },
  summaryLabel: { width: 100, fontSize: 8, color: "#555555" },
  summaryColon: { fontSize: 8, color: "#888888", marginRight: 5 },
  summaryValue: { fontSize: 8, fontFamily: "Helvetica-Bold", flex: 1 },
  netBox: {
    borderWidth: 1,
    borderColor: "#c3e8dc",
    borderRadius: 5,
    padding: 12,
    width: 168,
    backgroundColor: "#f6fdf9",
  },
  netBoxAccent: {
    borderLeftWidth: 3,
    borderLeftColor: "#0ab39c",
    paddingLeft: 9,
  },
  netAmount: { fontSize: 17, fontFamily: "Helvetica-Bold", color: "#1a1a1a" },
  netLabel: { fontSize: 7, color: "#0ab39c", marginTop: 3 },
  netDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#c3e8dc",
    marginVertical: 7,
  },
  netRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  netRowLabel: { fontSize: 8, color: "#555555" },
  netRowValue: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  pfBar: {
    flexDirection: "row",
    backgroundColor: "#f7f8fa",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 7,
    marginBottom: 12,
    gap: 24,
  },
  pfItem: { flexDirection: "row" },
  pfLabel: { fontSize: 7.5, color: "#888888", marginRight: 3 },
  pfValue: { fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  tableWrapper: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#dddddd",
  },
  leftPanel: { width: "50%", borderRightWidth: 1, borderRightColor: "#cccccc" },
  rightPanel: { width: "50%" },
  panelHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    padding: "6 8",
  },
  panelHeaderText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#444444",
  },
  panelRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  panelRowAlt: { backgroundColor: "#fafafa" },
  panelRowTotal: { backgroundColor: "#eaf7f3", borderBottomWidth: 0 },
  panelRowTotalD: { backgroundColor: "#fff5f5", borderBottomWidth: 0 },
  cellName: { flex: 1, fontSize: 8, color: "#1a1a1a" },
  cellNameBold: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  cellNameRed: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#c53030",
  },
  cellAmt: { width: 70, fontSize: 8, textAlign: "right", color: "#1a1a1a" },
  cellAmtBold: {
    width: 70,
    fontSize: 8,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  cellAmtRed: { width: 70, fontSize: 8, textAlign: "right", color: "#c53030" },
  cellAmtRedBold: {
    width: 70,
    fontSize: 8,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    color: "#c53030",
  },
  empCostBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 8,
  },
  empCostTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#555555",
    marginBottom: 6,
  },
  empCostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  empCostLabel: { fontSize: 7.5, color: "#555555" },
  empCostBadge: { fontSize: 6.5, color: "#888888", marginLeft: 4 },
  empCostAmt: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#1a1a1a" },
  empCostDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 5,
  },
  empCostTotal: { flexDirection: "row", justifyContent: "space-between" },
  empCostTotalLabel: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  empCostTotalAmt: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#c53030",
  },
  netFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#dddddd",
    padding: 10,
  },
  netFooterLeft: { flex: 1 },
  netFooterTitle: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  netFooterSub: { fontSize: 7, color: "#666666", marginTop: 2 },
  netFooterAmtBox: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c3e8dc",
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  netFooterAmt: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  netFooterAmtRed: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "#c53030",
  },
  amtWords: { textAlign: "right", fontSize: 7, color: "#555555", marginTop: 5 },
  lopWarn: {
    flexDirection: "row",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#f59e0b",
    borderRadius: 4,
    padding: 7,
    marginTop: 8,
  },
  lopText: { fontSize: 7, color: "#92400e", flex: 1 },
  footerNote: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 7,
    marginTop: 28,
    fontSize: 7,
    color: "#aaaaaa",
    textAlign: "center",
  },
});

// ─── PDF Component (same as EmployeePayslip.jsx) ──────────────────────────────
const PayslipPDF = ({ slip, companyName, allowDecimal }) => {
  if (!slip) return null;
  const ad = allowDecimal ?? true;
  const netPayNum = parseFloat(slip.net_pay || 0);
  const earningEntries = (slip.earningsList || []).map((c) => [
    c.component_name,
    c.final_amount,
  ]);
  const deductionEntries = (slip.deductionsList || []).map((c) => [
    c.component_name,
    c.final_amount,
  ]);
  const maxData = Math.max(earningEntries.length, deductionEntries.length);
  const earnRows = [
    ...earningEntries,
    ...Array(Math.max(0, maxData - earningEntries.length)).fill(null),
  ];
  const dedRows = [
    ...deductionEntries,
    ...Array(Math.max(0, maxData - deductionEntries.length)).fill(null),
  ];
  const grossDisplay = slip.gross_earnings || "0.00";
  const empContrib = slip.employerContributions || {};
  const empItems = empContrib.items || [];
  const amountInWords = slip.net_pay_in_words || numberToWords(netPayNum);

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <View style={S.headerRow}>
          <View>
            <Text style={S.companyName}>{companyName || "Company"}</Text>
          </View>
          <View style={S.headerRight}>
            <Text style={S.payslipLabel}>Payslip For the Month</Text>
            <Text style={S.payPeriod}>{slip.pay_period || "—"}</Text>
          </View>
        </View>
        <View style={S.dividerBlue} />
        <View style={S.summaryRow}>
          <View style={S.summaryLeft}>
            <Text style={S.sectionTitle}>EMPLOYEE SUMMARY</Text>
            {[
              ["Employee Name", slip.employee_name || "—"],
              ["Employee ID", slip.emp_id || "—"],
              ["Date of Joining", slip.joining_date || "—"],
              ["Pay Period", slip.pay_period || "—"],
              ["Pay Date", slip.pay_date || "—"],
            ].map(([label, value]) => (
              <View key={label} style={S.summaryItem}>
                <Text style={S.summaryLabel}>{label}</Text>
                <Text style={S.summaryColon}>:</Text>
                <Text style={S.summaryValue}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={S.netBox}>
            <View style={S.netBoxAccent}>
              <Text style={S.netAmount}>Rs.{fmt(slip.net_pay, ad)}</Text>
              <Text style={S.netLabel}>Employee Net Pay</Text>
            </View>
            <View style={S.netDivider} />
            {[
              ["Paid Days", String(slip.payable_days ?? "—")],
              ["LOP Days", String(slip.lop_days ?? "0")],
            ].map(([l, v]) => (
              <View key={l} style={S.netRow}>
                <Text style={S.netRowLabel}>{l}</Text>
                <Text style={[S.netRowLabel, { color: "#888888" }]}>:</Text>
                <Text style={S.netRowValue}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={S.pfBar}>
          <View style={S.pfItem}>
            <Text style={S.pfLabel}>PF A/C Number : </Text>
            <Text style={S.pfValue}>{slip.pf_account || "—"}</Text>
          </View>
          <View style={S.pfItem}>
            <Text style={S.pfLabel}>UAN : </Text>
            <Text style={S.pfValue}>{slip.uan || "—"}</Text>
          </View>
        </View>
        <View style={S.tableWrapper}>
          <View style={S.leftPanel}>
            <View style={S.panelHeader}>
              <Text style={[S.panelHeaderText, { flex: 1 }]}>EARNINGS</Text>
              <Text
                style={[S.panelHeaderText, { width: 70, textAlign: "right" }]}
              >
                AMOUNT
              </Text>
            </View>
            {earnRows.map((entry, i) => (
              <View
                key={i}
                style={[S.panelRow, i % 2 !== 0 ? S.panelRowAlt : {}]}
              >
                {entry ? (
                  <>
                    <Text style={S.cellName}>{entry[0]}</Text>
                    <Text style={S.cellAmt}>
                      Rs.{fmt(parseFloat(entry[1] || 0), ad)}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={S.cellName}> </Text>
                    <Text style={S.cellAmt}> </Text>
                  </>
                )}
              </View>
            ))}
            <View style={[S.panelRow, S.panelRowTotal]}>
              <Text style={S.cellNameBold}>Gross Earnings</Text>
              <Text style={S.cellAmtBold}>
                Rs.{fmt(parseFloat(grossDisplay), ad)}
              </Text>
            </View>
          </View>
          <View style={S.rightPanel}>
            <View style={S.panelHeader}>
              <Text style={[S.panelHeaderText, { flex: 1, color: "#c53030" }]}>
                DEDUCTIONS
              </Text>
              <Text
                style={[S.panelHeaderText, { width: 70, textAlign: "right" }]}
              >
                AMOUNT
              </Text>
            </View>
            {dedRows.map((entry, i) => (
              <View
                key={i}
                style={[S.panelRow, i % 2 !== 0 ? S.panelRowAlt : {}]}
              >
                {entry ? (
                  <>
                    <Text style={S.cellName}>{entry[0]}</Text>
                    <Text style={S.cellAmtRed}>
                      Rs.{fmt(parseFloat(entry[1] || 0), ad)}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={S.cellName}> </Text>
                    <Text style={S.cellAmt}> </Text>
                  </>
                )}
              </View>
            ))}
            <View style={[S.panelRow, S.panelRowTotalD]}>
              <Text style={S.cellNameRed}>Total Deductions</Text>
              <Text style={S.cellAmtRedBold}>
                Rs.{fmt(slip.total_deductions, ad)}
              </Text>
            </View>
          </View>
        </View>
        <View style={S.netFooter}>
          <View style={S.netFooterLeft}>
            <Text style={S.netFooterTitle}>TOTAL NET PAYABLE</Text>
            <Text style={S.netFooterSub}>
              Gross Earnings - Total Deductions
            </Text>
          </View>
          <View style={S.netFooterAmtBox}>
            <Text style={netPayNum < 0 ? S.netFooterAmtRed : S.netFooterAmt}>
              Rs.{fmt(slip.net_pay, ad)}
            </Text>
          </View>
        </View>
        <Text style={S.amtWords}>Amount In Words : {amountInWords}</Text>
        {empItems.length > 0 && (
          <View style={S.empCostBox}>
            <Text style={S.empCostTitle}>EMPLOYER CONTRIBUTIONS</Text>
            {empItems.map((item, i) => (
              <View key={i} style={S.empCostRow}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={S.empCostLabel}>{item.name}</Text>
                  {item.ctc_embedded && (
                    <Text style={S.empCostBadge}>(in CTC)</Text>
                  )}
                </View>
                <Text style={S.empCostAmt}>
                  Rs.{fmt(parseFloat(item.amount || 0), ad)}
                </Text>
              </View>
            ))}
            <View style={S.empCostDivider} />
            <View style={S.empCostTotal}>
              <Text style={S.empCostTotalLabel}>Total Employer Cost</Text>
              <Text style={S.empCostTotalAmt}>
                Rs.{fmt(parseFloat(empContrib.total_employer_cost || 0), ad)}
              </Text>
            </View>
            {parseFloat(empContrib.additional_cost || 0) > 0 && (
              <View style={[S.empCostRow, { marginTop: 3 }]}>
                <Text style={[S.empCostLabel, { color: "#888888" }]}>
                  Additional Cost (above CTC)
                </Text>
                <Text style={[S.empCostAmt, { color: "#c53030" }]}>
                  Rs.{fmt(parseFloat(empContrib.additional_cost || 0), ad)}
                </Text>
              </View>
            )}
          </View>
        )}
        {parseFloat(slip.lop_days) > 0 && (
          <View style={S.lopWarn}>
            <Text style={S.lopText}>
              {"! " +
                slip.lop_days +
                " LOP days were deducted this month." +
                (parseFloat(slip.pf_employee) > 0
                  ? "  Statutory deductions (PF: Rs." +
                    fmt(slip.pf_employee) +
                    ") still apply."
                  : "")}
            </Text>
          </View>
        )}
        {slip.bonus_notes && (
          <Text style={{ fontSize: 7, color: "#888888", marginTop: 6 }}>
            Note: {slip.bonus_notes}
          </Text>
        )}
        <Text style={S.footerNote}>
          This is a computer-generated payslip and does not require a signature.
        </Text>
      </Page>
    </Document>
  );
};

/**
 * Self-fetching payslip detail modal for the employee "My Payslips" screen.
 * Pass only the payslip `id` from the list row — this component fetches
 * the full detail (earnings, deductions, CTC breakdown, etc.) on open.
 *
 * Usage:
 *   <MyPayslipDetailModal
 *     payslipId={selectedId}
 *     isOpen={modalOpen}
 *     onClose={() => setModalOpen(false)}
 *   />
 */
const MyPayslipDetailModal = ({
  payslipId,
  isOpen,
  onClose,
  companyName = "Lintcloud",
}) => {
  const [loading, setLoading] = useState(false);
  const [slip, setSlip] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen || !payslipId) {
      setSlip(null);
      return;
    }

    setLoading(true);
    Api({ method: "GET", url: `payroll/employee-payslip/?id=${payslipId}` })
      .then((res) => {
        const raw = res?.data?.data || [];
        if (!raw.length) {
          toast.error("Payslip not found.");
          onClose();
          return;
        }
        setSlip(transformPayslip(raw[0]));
      })
      .catch(() => {
        toast.error("Failed to load payslip.");
        onClose();
      })
      .finally(() => setLoading(false));
  }, [isOpen, payslipId]);

  const allowDecimal = slip?.allow_decimal_in_payslip ?? true;

  const handleDownloadPDF = async () => {
    if (!slip) return;
    setDownloading(true);
    try {
      const blob = await pdf(
        <PayslipPDF
          slip={slip}
          companyName={companyName}
          allowDecimal={allowDecimal}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Payslip_${(slip.employee_name || "Employee").replace(/\s+/g, "_")}_${(slip.pay_period || slip.payroll_run).toString().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Payslip downloaded!");
    } catch (err) {
      console.error("PDF error:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" centered>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        {loading || !slip ? (
          "Payslip"
        ) : (
          <>
            Payslip &mdash; {slip.employee_name || "Employee"} (
            {slip.emp_id || slip.employee})
            {slip.department && (
              <span
                className="text-muted ms-2"
                style={{ fontSize: 12, fontWeight: 400 }}
              >
                · {slip.department}
              </span>
            )}
          </>
        )}
      </ModalHeader>

      <ModalBody
        className="p-4"
        style={{ maxHeight: "78vh", overflowY: "auto", overflowX: "auto" }}
      >
        {loading || !slip ? (
          <div className="text-center py-5">
            <Spinner color="success" />
            <p className="text-muted mt-2" style={{ fontSize: 13 }}>
              Loading payslip...
            </p>
          </div>
        ) : (
          <div
            className="p-3 border rounded bg-white"
            style={{ minWidth: "620px" }}
          >
            <div className="text-center mb-3">
              <h5 className="fw-bold text-uppercase mb-1">Salary Slip</h5>
              <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                {slip.pay_period || `Payroll Run #${slip.payroll_run}`}
              </p>
            </div>
            <hr />

            <Row className="mb-3">
              <Col sm={6}>
                <p className="mb-1">
                  <strong>Employee ID:</strong> {slip.emp_id || slip.employee}
                </p>
                <p className="mb-1">
                  <strong>Name:</strong> {slip.employee_name || "—"}
                </p>
                {slip.department && (
                  <p className="mb-1">
                    <strong>Department:</strong> {slip.department}
                  </p>
                )}
                <p className="mb-0">
                  <strong>Date of Joining:</strong> {slip.joining_date || "—"}
                </p>
                <p className="mb-0">
                  <strong>Pay Date:</strong> {slip.pay_date || "—"}
                </p>
              </Col>
              <Col sm={6}>
                <p className="mb-1">
                  <strong>Based On:</strong>{" "}
                  <Badge
                    color={slip.based_on === "ctc" ? "info" : "secondary"}
                    className="text-uppercase fs-11"
                  >
                    {slip.based_on || "—"}
                  </Badge>
                </p>
                <p className="mb-1">
                  <strong>
                    {slip.based_on === "ctc" ? "Annual CTC" : "Monthly Gross"}:
                  </strong>{" "}
                  &#8377;
                  {fmt(
                    slip.based_on === "ctc"
                      ? slip.ctc_amount
                      : slip.gross_amount,
                  )}
                </p>
                <p className="mb-1">
                  <strong>Pay Period:</strong> {slip.pay_period || "—"}
                </p>
              </Col>
            </Row>

            <div
              className="p-2 bg-light rounded mb-3 d-flex gap-4 flex-nowrap align-items-center"
              style={{ fontSize: 12, overflowX: "auto" }}
            >
              <span className="text-nowrap">
                <strong>Total Days:</strong> {slip.total_days_in_month}
              </span>
              <span className="text-nowrap">
                <strong>Payable Days:</strong> {slip.payable_days}
              </span>
              <span className="text-nowrap">
                <strong>Present:</strong> {slip.present_days}
              </span>
              <span className="text-nowrap">
                <strong>Leave:</strong> {slip.approved_leave_days}
              </span>
              <span
                className={`text-nowrap ${parseFloat(slip.lop_days) > 0 ? "text-danger fw-bold" : ""}`}
              >
                <strong>LOP:</strong> {fmtDays(slip.lop_days)}
              </span>
              <span className="text-nowrap">
                <strong>Week Off:</strong> {slip.week_off_days}
              </span>
              <span className="text-nowrap">
                <strong>Holidays:</strong> {slip.holiday_days}
              </span>
              <span className="text-nowrap">
                <strong>Regularized:</strong>{" "}
                {slip.is_regularized ? (
                  <Badge color="info" className="fs-11">
                    Yes ({slip.regularized_days_count})
                  </Badge>
                ) : (
                  <Badge color="secondary" className="fs-11">
                    No
                  </Badge>
                )}
              </span>
            </div>

            <Row className="g-3">
              <Col md={6}>
                <p
                  className="text-uppercase fw-bold text-success mb-2"
                  style={{ fontSize: 11 }}
                >
                  Earnings
                </p>
                <Table size="sm" bordered className="mb-0">
                  <tbody>
                    {(slip.earningsList || []).map((comp) => (
                      <tr key={comp.component_name}>
                        <td style={{ fontSize: 12 }}>{comp.component_name}</td>
                        <td className="text-end" style={{ fontSize: 12 }}>
                          &#8377;{fmt(comp.final_amount, allowDecimal)}
                        </td>
                      </tr>
                    ))}
                    <tr className="table-success fw-bold">
                      <td style={{ fontSize: 12 }}>Gross Earnings</td>
                      <td className="text-end" style={{ fontSize: 12 }}>
                        &#8377;{fmt(getGross(slip), allowDecimal)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <p
                  className="text-uppercase fw-bold text-danger mb-2"
                  style={{ fontSize: 11 }}
                >
                  Deductions
                </p>
                <Table size="sm" bordered className="mb-0">
                  <tbody>
                    {(slip.deductionsList || []).map((comp) => (
                      <tr key={comp.component_name}>
                        <td style={{ fontSize: 12 }}>{comp.component_name}</td>
                        <td
                          className="text-end text-danger"
                          style={{ fontSize: 12 }}
                        >
                          &#8377;{fmt(comp.final_amount, allowDecimal)}
                        </td>
                      </tr>
                    ))}
                    <tr className="table-danger fw-bold">
                      <td style={{ fontSize: 12 }}>Total Deductions</td>
                      <td
                        className="text-end text-danger"
                        style={{ fontSize: 12 }}
                      >
                        &#8377;{fmt(slip.total_deductions)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>

            <div className="mt-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
              <div>
                <h6
                  className="mb-0 fw-bold text-uppercase"
                  style={{ fontSize: 12 }}
                >
                  Net Take-Home Pay
                </h6>
                {slip.net_pay_in_words && (
                  <p className="mb-0 text-muted" style={{ fontSize: 10 }}>
                    {slip.net_pay_in_words}
                  </p>
                )}
              </div>
              <h5
                className={`mb-0 fw-bold ${parseFloat(slip.net_pay) < 0 ? "text-danger" : "text-success"}`}
              >
                &#8377;{fmt(slip.net_pay, allowDecimal)}
              </h5>
            </div>

            {parseFloat(slip.pf_employer || 0) > 0 && (
              <div className="mt-2 px-3 py-2 border rounded bg-light d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: 11 }}>
                  Employer PF Contribution{" "}
                  <span className="text-muted">
                    (not deducted from your salary)
                  </span>
                </span>
                <span className="fw-medium" style={{ fontSize: 11 }}>
                  &#8377;{fmt(slip.pf_employer, allowDecimal)}
                </span>
              </div>
            )}

            {slip.bonus_notes && (
              <div className="mt-2 px-3 py-2 border-top bg-light rounded">
                <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                  <i className="ri-information-line me-1"></i>
                  {slip.bonus_notes}
                </p>
              </div>
            )}

            {parseFloat(slip.lop_days) > 0 && (
              <div className="mt-2 p-2 rounded border border-warning border-opacity-25 bg-warning-subtle d-flex gap-2 align-items-start">
                <i className="ri-error-warning-line text-warning mt-1"></i>
                <p
                  className="mb-0 text-warning-emphasis"
                  style={{ fontSize: 12 }}
                >
                  <strong>{slip.lop_days} LOP days</strong> were deducted this
                  month.
                  {parseFloat(slip.pf_employee) > 0 && (
                    <>
                      {" "}
                      Statutory deductions (PF: &#8377;{fmt(slip.pf_employee)})
                      still apply.
                    </>
                  )}
                </p>
              </div>
            )}

            {slip.regularizationDetails &&
              slip.regularizationDetails.length > 0 && (
                <div className="mt-2 p-2 rounded border border-info border-opacity-25 bg-info-subtle">
                  <p
                    className="mb-2 fw-semibold text-info-emphasis"
                    style={{ fontSize: 12 }}
                  >
                    <i className="ri-calendar-check-line me-1"></i>
                    Regularized Days ({slip.regularizationDetails.length})
                  </p>
                  {slip.regularizationDetails.map((r) => (
                    <div
                      key={r.date}
                      className="d-flex justify-content-between align-items-center mb-1"
                      style={{ fontSize: 11 }}
                    >
                      <span className="text-muted">
                        {r.date}
                        {r.remarks ? ` — ${r.remarks}` : ""}
                      </span>
                      <Badge
                        color={
                          r.regularized_status === "paid" ? "success" : "danger"
                        }
                        className="fs-11"
                      >
                        {r.regularized_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </ModalBody>

      <ModalFooter className="bg-light border-top">
        <div className="d-flex justify-content-between w-100 align-items-center">
          <Button color="secondary" outline size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            color="success"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={downloading || loading || !slip}
            style={{ minWidth: 165 }}
          >
            {downloading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Generating PDF...
              </>
            ) : (
              <>
                <i className="ri-download-2-line align-middle me-1"></i>Download
                Payslip
              </>
            )}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default MyPayslipDetailModal;
