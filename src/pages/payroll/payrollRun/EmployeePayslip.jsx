import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Spinner,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Badge,
} from "reactstrap";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";

const employees = GetLocalStorageData("employee") || [];

// ─── Transform API data ───────────────────────────────────────────────────────
const transformPayslip = (item) => {
  const earnings = {};
  const deductions = {};

  (item.components || []).forEach((comp) => {
    if (
      comp.component_type === "allowance" ||
      comp.component_type === "reimbursement"
    ) {
      earnings[comp.component_name] = comp.final_amount;
    } else if (comp.component_type === "deduction") {
      deductions[comp.component_name] = comp.final_amount;
    }
  });

  const lopDays = parseFloat(item.lop_days || 0);
  if (lopDays > 0 && parseFloat(item.lop_deduction) > 0) {
    deductions["LOP Deduction"] = parseFloat(item.lop_deduction).toFixed(2);
  }

  if (parseFloat(item.pf_employee) > 0)
    deductions["PF (Employee)"] = item.pf_employee;
  if (parseFloat(item.esi_employee) > 0)
    deductions["ESI (Employee)"] = item.esi_employee;
  if (parseFloat(item.pt_amount) > 0)
    deductions["Professional Tax"] = item.pt_amount;
  if (parseFloat(item.ot_amount) > 0) earnings["Overtime"] = item.ot_amount;

  if (!item.bonus_included_in_ctc) {
    if (parseFloat(item.statutory_bonus) > 0)
      earnings["Statutory Bonus"] = item.statutory_bonus;
    if (parseFloat(item.performance_bonus) > 0)
      earnings["Performance Bonus"] = item.performance_bonus;
  }

  if (parseFloat(item.gratuity_provision) > 0)
    earnings["Gratuity Provision"] = item.gratuity_provision;

  const empDetails = employees.find(
    (e) => String(e.id) === String(item.employee),
  );

  return {
    ...item,
    earnings,
    deductions,
    employee_name: empDetails
      ? `${empDetails.first_name} ${empDetails.last_name}`.trim()
      : `Employee #${item.employee}`,
    emp_id: empDetails?.emp_id || "-",
    designation: empDetails?.designation || "-",
    date_of_joining: empDetails?.date_of_joining || "-",
    pf_account: empDetails?.pf_account || "-",
    uan: empDetails?.uan || "-",
    profile_url: empDetails?.profile_url || null,
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val, allowDec = true) =>
  Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: allowDec ? 2 : 0,
    maximumFractionDigits: allowDec ? 2 : 0,
  });

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
  if (n === 0) return "Zero";
  return "Indian Rupee " + convert(n) + " Only";
};

// ─── PDF Page width = 595pt (A4). Padding 32 each side = 531pt usable ─────────
// Layout: split into LEFT half (earnings) and RIGHT half (deductions)
// Each half = 265pt wide
// Within each half:
//   Name col : 155pt   Amount col : 80pt   (YTD removed — was causing overflow)
// Divider between halves = 1pt border

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

  // ── Header ──
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  companyName: { fontSize: 17, fontFamily: "Helvetica-Bold", color: "#299cdb" },
  companyCity: { fontSize: 8, color: "#888888", marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  payslipLabel: { fontSize: 8, color: "#888888" },
  payPeriod: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#1a1a1a" },
  dividerOrange: {
    borderBottomWidth: 2,
    borderBottomColor: "#299cdb",
    marginBottom: 12,
  },

  // ── Employee Summary + Net Pay ──
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

  // Net Pay Box
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

  // PF/UAN bar
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

  // ── Earnings / Deductions — two-panel layout ──
  // Outer wrapper: full width row
  tableWrapper: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#dddddd",
  },

  // LEFT panel (Earnings)
  leftPanel: { width: "50%", borderRightWidth: 1, borderRightColor: "#cccccc" },

  // RIGHT panel (Deductions)
  rightPanel: { width: "50%" },

  // Panel header row
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

  // Data row inside panel
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
  panelRowEmpty: {
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },

  // Cells within each panel row
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

  // ── Net Payable Footer ──
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

  // ── Bonus box ──
  bonusBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  bonusHeader: {
    backgroundColor: "#f7f8fa",
    padding: "5 8",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  bonusTitle: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#444444" },
  bonusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "5 8",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  bonusLabel: { fontSize: 8, color: "#1a1a1a" },
  bonusAmt: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0ab39c" },
  bonusNoteBox: {
    backgroundColor: "#f7f8fa",
    padding: "4 8",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  bonusNote: { fontSize: 7, color: "#888888" },

  // ── LOP warning ──
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

// ─── PDF Document Component ───────────────────────────────────────────────────
const PayslipPDF = ({ slip, companyName, allowDecimal }) => {
  if (!slip) return null;

  const ad = allowDecimal ?? true;
  const netPayNum = parseFloat(slip.net_pay || 0);

  const earningEntries = Object.entries(slip.earnings || {});
  const deductionEntries = Object.entries(slip.deductions || {});

  // Pad the shorter list so both panels have the same number of data rows
  const maxData = Math.max(earningEntries.length, deductionEntries.length);
  const earnRows = [
    ...earningEntries,
    ...Array(Math.max(0, maxData - earningEntries.length)).fill(null),
  ];
  const dedRows = [
    ...deductionEntries,
    ...Array(Math.max(0, maxData - deductionEntries.length)).fill(null),
  ];

  const hasBonus =
    parseFloat(slip.statutory_bonus) > 0 ||
    parseFloat(slip.performance_bonus) > 0 ||
    parseFloat(slip.gratuity_provision) > 0;

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* ── Header ── */}
        <View style={S.headerRow}>
          <View>
            <Text style={S.companyName}>{companyName || "Company"}</Text>
            {/* <Text style={S.companyCity}>Kerala India</Text> */}
          </View>
          <View style={S.headerRight}>
            <Text style={S.payslipLabel}>Payslip For the Month</Text>
            <Text style={S.payPeriod}>{slip.pay_period || "-"}</Text>
          </View>
        </View>
        <View style={S.dividerOrange} />

        {/* ── Employee Summary + Net Pay Box ── */}
        <View style={S.summaryRow}>
          <View style={S.summaryLeft}>
            <Text style={S.sectionTitle}>EMPLOYEE SUMMARY</Text>
            {[
              ["Employee Name", slip.employee_name || "-"],
              ["Designation", slip.designation || "-"],
              ["Employee ID", slip.emp_id || "-"],
              ["Date of Joining", slip.date_of_joining || "-"],
              ["Pay Period", slip.pay_period || "-"],
              ["Pay Date", slip.effective_date || "-"],
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
              ["Paid Days", String(slip.payable_days ?? "-")],
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

        {/* ── PF / UAN ── */}
        <View style={S.pfBar}>
          <View style={S.pfItem}>
            <Text style={S.pfLabel}>PF A/C Number : </Text>
            <Text style={S.pfValue}>{slip.pf_account || "-"}</Text>
          </View>
          <View style={S.pfItem}>
            <Text style={S.pfLabel}>UAN : </Text>
            <Text style={S.pfValue}>{slip.uan || "-"}</Text>
          </View>
        </View>

        {/* ── Two-Panel Table ── */}
        <View style={S.tableWrapper}>
          {/* LEFT — Earnings */}
          <View style={S.leftPanel}>
            {/* Header */}
            <View style={S.panelHeader}>
              <Text style={[S.panelHeaderText, { flex: 1 }]}>EARNINGS</Text>
              <Text
                style={[S.panelHeaderText, { width: 70, textAlign: "right" }]}
              >
                AMOUNT
              </Text>
            </View>

            {/* Data rows */}
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

            {/* Gross Earnings total */}
            <View style={[S.panelRow, S.panelRowTotal]}>
              <Text style={S.cellNameBold}>Gross Earnings</Text>
              <Text style={S.cellAmtBold}>
                Rs.{fmt(slip.gross_earnings, ad)}
              </Text>
            </View>
          </View>

          {/* RIGHT — Deductions */}
          <View style={S.rightPanel}>
            {/* Header */}
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

            {/* Data rows */}
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

            {/* Total Deductions */}
            <View style={[S.panelRow, S.panelRowTotalD]}>
              <Text style={S.cellNameRed}>Total Deductions</Text>
              <Text style={S.cellAmtRedBold}>
                Rs.{fmt(slip.total_deductions, ad)}
              </Text>
            </View>
          </View>
        </View>
        {/* end tableWrapper */}

        {/* ── Net Payable Footer ── */}
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

        {/* ── Amount in Words ── */}
        <Text style={S.amtWords}>
          Amount In Words : {numberToWords(netPayNum)}
        </Text>

        {/* ── Bonus & Gratuity ── */}
        {hasBonus && (
          <View style={S.bonusBox}>
            <View style={S.bonusHeader}>
              <Text style={S.bonusTitle}>BONUS & GRATUITY</Text>
            </View>
            {parseFloat(slip.statutory_bonus) > 0 && (
              <View style={S.bonusRow}>
                <Text style={S.bonusLabel}>Statutory Bonus</Text>
                <Text style={S.bonusAmt}>
                  Rs.{fmt(slip.statutory_bonus, ad)}
                </Text>
              </View>
            )}
            {parseFloat(slip.performance_bonus) > 0 && (
              <View style={S.bonusRow}>
                <Text style={S.bonusLabel}>Performance Bonus</Text>
                <Text style={S.bonusAmt}>
                  Rs.{fmt(slip.performance_bonus, ad)}
                </Text>
              </View>
            )}
            {parseFloat(slip.gratuity_provision) > 0 && (
              <View style={[S.bonusRow, { borderBottomWidth: 0 }]}>
                <Text style={S.bonusLabel}>Gratuity Provision</Text>
                <Text style={[S.bonusAmt, { color: "#888888" }]}>
                  Rs.{fmt(slip.gratuity_provision, ad)}
                </Text>
              </View>
            )}
            {slip.bonus_notes && (
              <View style={S.bonusNoteBox}>
                <Text style={S.bonusNote}>{slip.bonus_notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── LOP Warning ── */}
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

        {/* ── Page Footer ── */}
        <Text style={S.footerNote}>
          This is a computer-generated payslip and does not require a signature.
        </Text>
      </Page>
    </Document>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const EmployeePayslip = ({ payrollRunId = 38, companyName = "Lintcloud" }) => {
  const [loading, setLoading] = useState(false);
  const [payslipData, setPayslipData] = useState([]);
  const [dynamicEarnings, setDynamicEarnings] = useState([]);
  const [dynamicDeductions, setDynamicDeductions] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Api({
      method: "GET",
      url: `payroll/employee-payslip/?payroll_run=${payrollRunId}`,
    })
      .then((res) => {
        const raw = res?.data?.data || [];
        const transformed = raw.map(transformPayslip);
        setPayslipData(transformed);

        const earningKeys = new Set();
        const deductionKeys = new Set();
        transformed.forEach((item) => {
          Object.keys(item.earnings || {}).forEach((k) => earningKeys.add(k));
          Object.keys(item.deductions || {}).forEach((k) =>
            deductionKeys.add(k),
          );
        });
        setDynamicEarnings(Array.from(earningKeys));
        setDynamicDeductions(Array.from(deductionKeys));
      })
      .catch(() => toast.error("Failed to load payslip data."))
      .finally(() => setLoading(false));
  }, [payrollRunId]);

  const handleOpenModal = (slip) => {
    setSelectedSlip(slip);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSlip(null);
  };

  // ── PDF download ────────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!selectedSlip) return;
    setDownloading(true);
    try {
      const allowDecimal = selectedSlip?.allow_decimal_in_payslip ?? true;
      const blob = await pdf(
        <PayslipPDF
          slip={selectedSlip}
          companyName={companyName}
          allowDecimal={allowDecimal}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Payslip_${(selectedSlip.employee_name || "Employee").replace(/\s+/g, "_")}_${selectedSlip.pay_period || payrollRunId}.pdf`;
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

  const fmtCell = (val, allowDec = true) =>
    Number(val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: allowDec ? 2 : 0,
      maximumFractionDigits: allowDec ? 2 : 0,
    });

  const allowDecimal = selectedSlip?.allow_decimal_in_payslip ?? true;

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="success" />
        <p className="text-muted mt-2" style={{ fontSize: 13 }}>
          Loading payslips...
        </p>
      </div>
    );
  }

  return (
    <React.Fragment>
      {/* ── Registry Table ── */}
      <Card className="shadow-none border">
        <CardHeader className="bg-light">
          <CardTitle tag="h5" className="mb-0">
            Employee Payslip Registry
          </CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table
              className="table-bordered align-middle table-nowrap mb-0"
              style={{ fontSize: 13 }}
            >
              <thead
                className="table-light text-muted text-uppercase"
                style={{ fontSize: 11 }}
              >
                <tr>
                  <th>Employee</th>
                  <th>Payable Days</th>
                  <th>LOP Days</th>
                  {dynamicEarnings.map((earn) => (
                    <th key={earn}>{earn}</th>
                  ))}
                  {dynamicDeductions.map((ded) => (
                    <th key={ded} className="text-danger">
                      {ded}
                    </th>
                  ))}
                  <th className="table-success text-dark">Net Pay</th>
                  <th className="text-center">Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslipData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        6 + dynamicEarnings.length + dynamicDeductions.length
                      }
                      className="text-center py-4 text-muted"
                    >
                      No payslip data found.
                    </td>
                  </tr>
                ) : (
                  payslipData.map((row, index) => {
                    const netPay = parseFloat(row.net_pay || 0);
                    return (
                      <tr key={row.id || index}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center gap-2">
                            {row.profile_url ? (
                              <img
                                src={row.profile_url}
                                alt={row.employee_name}
                                className="rounded-circle"
                                width={28}
                                height={28}
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                className="rounded-circle bg-success-subtle d-flex align-items-center justify-content-center"
                                style={{
                                  width: 28,
                                  height: 28,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: "#0ab39c",
                                }}
                              >
                                {(row.employee_name || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p
                                className="mb-0 fw-medium"
                                style={{ fontSize: 13 }}
                              >
                                {row.employee_name}
                              </p>
                              <p
                                className="mb-0 text-muted"
                                style={{ fontSize: 11 }}
                              >
                                {row.emp_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>{row.payable_days}</td>
                        <td>
                          {parseFloat(row.lop_days) > 0 ? (
                            <Badge color="danger" className="fs-11">
                              {row.lop_days}
                            </Badge>
                          ) : (
                            <span className="text-muted">0</span>
                          )}
                        </td>
                        {dynamicEarnings.map((earn) => (
                          <td key={earn}>
                            &#8377;{fmtCell(row.earnings?.[earn])}
                          </td>
                        ))}
                        {dynamicDeductions.map((ded) => (
                          <td key={ded} className="text-danger">
                            &#8377;{fmtCell(row.deductions?.[ded])}
                          </td>
                        ))}
                        <td
                          className={`fw-bold ${netPay < 0 ? "text-danger" : "text-success"}`}
                        >
                          &#8377;{fmtCell(row.net_pay)}
                        </td>
                        <td className="text-center">
                          <Badge
                            color={
                              row.status === "draft" ? "warning" : "success"
                            }
                            className="fs-11"
                          >
                            {row.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button
                            color="light"
                            size="sm"
                            className="border py-1 px-2"
                            onClick={() => handleOpenModal(row)}
                          >
                            <i className="ri-printer-line align-middle me-1"></i>
                            Open Slip
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── Payslip Modal ── */}
      {selectedSlip && (
        <Modal isOpen={modalOpen} toggle={handleCloseModal} size="lg" centered>
          <ModalHeader toggle={handleCloseModal} className="bg-light p-3">
            Payslip &mdash; {selectedSlip.employee_name || "Employee"} (
            {selectedSlip.emp_id || selectedSlip.employee})
          </ModalHeader>

          <ModalBody
            className="p-4"
            style={{ maxHeight: "72vh", overflowY: "auto", overflowX: "auto" }}
          >
            <div
              className="p-3 border rounded bg-white"
              style={{ minWidth: "620px" }}
            >
              <div className="text-center mb-3">
                <h5 className="fw-bold text-uppercase mb-1">Salary Slip</h5>
                <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                  Payroll Run #{selectedSlip.payroll_run}
                </p>
              </div>
              <hr />

              <Row className="mb-3">
                <Col sm={6}>
                  <p className="mb-1">
                    <strong>Employee ID:</strong>{" "}
                    {selectedSlip.emp_id || selectedSlip.employee}
                  </p>
                  <p className="mb-1">
                    <strong>Name:</strong> {selectedSlip.employee_name || "—"}
                  </p>
                  <p className="mb-0">
                    <strong>Structure:</strong>{" "}
                    {selectedSlip.salary_structure_name ||
                      `ID: ${selectedSlip.salary_structure}`}
                  </p>
                </Col>
                <Col sm={6}>
                  <p className="mb-1">
                    <strong>Based On:</strong>{" "}
                    {selectedSlip.based_on?.toUpperCase()}
                  </p>
                  <p className="mb-1">
                    <strong>CTC:</strong> &#8377;
                    {fmtCell(selectedSlip.ctc_amount)}
                  </p>
                  <p className="mb-0">
                    <strong>Effective Date:</strong>{" "}
                    {selectedSlip.effective_date || "—"}
                  </p>
                </Col>
              </Row>

              <div
                className="p-2 bg-light rounded mb-3 d-flex gap-4 flex-nowrap align-items-center"
                style={{ fontSize: 12, overflowX: "auto" }}
              >
                <span className="text-nowrap">
                  <strong>Total Days:</strong>{" "}
                  {selectedSlip.total_days_in_month}
                </span>
                <span className="text-nowrap">
                  <strong>Payable Days:</strong> {selectedSlip.payable_days}
                </span>
                <span className="text-nowrap">
                  <strong>Present:</strong> {selectedSlip.present_days}
                </span>
                <span className="text-nowrap">
                  <strong>Leave:</strong> {selectedSlip.approved_leave_days}
                </span>
                <span
                  className={`text-nowrap ${parseFloat(selectedSlip.lop_days) > 0 ? "text-danger fw-bold" : ""}`}
                >
                  <strong>LOP:</strong> {selectedSlip.lop_days}
                </span>
                <span className="text-nowrap">
                  <strong>Week Off:</strong> {selectedSlip.week_off_days}
                </span>
                <span className="text-nowrap">
                  <strong>Holidays:</strong> {selectedSlip.holiday_days}
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
                      {Object.entries(selectedSlip.earnings || {}).map(
                        ([key, val]) => (
                          <tr key={key}>
                            <td style={{ fontSize: 12 }}>{key}</td>
                            <td className="text-end" style={{ fontSize: 12 }}>
                              &#8377;{fmtCell(val, allowDecimal)}
                            </td>
                          </tr>
                        ),
                      )}
                      <tr className="table-success fw-bold">
                        <td style={{ fontSize: 12 }}>Gross Earnings</td>
                        <td className="text-end" style={{ fontSize: 12 }}>
                          &#8377;
                          {fmtCell(selectedSlip.gross_earnings, allowDecimal)}
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
                      {Object.entries(selectedSlip.deductions || {}).map(
                        ([key, val]) => (
                          <tr key={key}>
                            <td style={{ fontSize: 12 }}>{key}</td>
                            <td
                              className="text-end text-danger"
                              style={{ fontSize: 12 }}
                            >
                              &#8377;{fmtCell(val, allowDecimal)}
                            </td>
                          </tr>
                        ),
                      )}
                      <tr className="table-danger fw-bold">
                        <td style={{ fontSize: 12 }}>Total Deductions</td>
                        <td
                          className="text-end text-danger"
                          style={{ fontSize: 12 }}
                        >
                          &#8377;{fmtCell(selectedSlip.total_deductions)}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <div className="mt-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
                <h6
                  className="mb-0 fw-bold text-uppercase"
                  style={{ fontSize: 12 }}
                >
                  Net Take-Home Pay
                </h6>
                <h5
                  className={`mb-0 fw-bold ${parseFloat(selectedSlip.net_pay) < 0 ? "text-danger" : "text-success"}`}
                >
                  &#8377;{fmtCell(selectedSlip.net_pay, allowDecimal)}
                </h5>
              </div>

              {selectedSlip.based_on === "ctc" &&
                parseFloat(selectedSlip.employer_cost_embedded) > 0 && (
                  <div className="mt-2 p-2 rounded border bg-light d-flex justify-content-between align-items-center">
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      Employer Cost (PF/ESI/Gratuity embedded in CTC)
                      <Badge
                        color="secondary"
                        className="ms-2"
                        style={{ fontSize: 10 }}
                      >
                        CTC Only
                      </Badge>
                    </span>
                    <span
                      className="text-danger fw-medium"
                      style={{ fontSize: 12 }}
                    >
                      &#8377;
                      {fmtCell(
                        selectedSlip.employer_cost_embedded,
                        allowDecimal,
                      )}
                    </span>
                  </div>
                )}

              {(parseFloat(selectedSlip.total_bonus) > 0 ||
                parseFloat(selectedSlip.gratuity_provision) > 0) && (
                <div className="mt-3 border rounded overflow-hidden">
                  <div className="px-3 py-2 bg-light border-bottom">
                    <p
                      className="mb-0 fw-bold text-uppercase"
                      style={{ fontSize: 11 }}
                    >
                      Bonus & Gratuity
                    </p>
                  </div>
                  <div className="px-3 py-2">
                    {parseFloat(selectedSlip.statutory_bonus) > 0 && (
                      <div className="d-flex justify-content-between py-1 border-bottom">
                        <span style={{ fontSize: 12 }}>Statutory Bonus</span>
                        <span
                          className="text-success fw-medium"
                          style={{ fontSize: 12 }}
                        >
                          &#8377;{fmtCell(selectedSlip.statutory_bonus)}
                        </span>
                      </div>
                    )}
                    {parseFloat(selectedSlip.performance_bonus) > 0 && (
                      <div className="d-flex justify-content-between py-1 border-bottom">
                        <span style={{ fontSize: 12 }}>Performance Bonus</span>
                        <span
                          className="text-success fw-medium"
                          style={{ fontSize: 12 }}
                        >
                          &#8377;{fmtCell(selectedSlip.performance_bonus)}
                        </span>
                      </div>
                    )}
                    {parseFloat(selectedSlip.gratuity_provision) > 0 && (
                      <div className="d-flex justify-content-between py-1">
                        <span style={{ fontSize: 12 }}>
                          Gratuity Provision
                          <Badge
                            color="secondary"
                            className="ms-2"
                            style={{ fontSize: 10 }}
                          >
                            CTC Only
                          </Badge>
                        </span>
                        <span
                          className="text-muted fw-medium"
                          style={{ fontSize: 12 }}
                        >
                          &#8377;{fmtCell(selectedSlip.gratuity_provision)}
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedSlip.bonus_notes && (
                    <div className="px-3 py-2 border-top bg-light">
                      <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                        <i className="ri-information-line me-1"></i>
                        {selectedSlip.bonus_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {parseFloat(selectedSlip.lop_days) > 0 && (
                <div className="mt-2 p-2 rounded border border-warning border-opacity-25 bg-warning-subtle d-flex gap-2 align-items-start">
                  <i className="ri-error-warning-line text-warning mt-1"></i>
                  <p
                    className="mb-0 text-warning-emphasis"
                    style={{ fontSize: 12 }}
                  >
                    <strong>{selectedSlip.lop_days} LOP days</strong> were
                    deducted this month.
                    {parseFloat(selectedSlip.pf_employee) > 0 && (
                      <>
                        {" "}
                        Statutory deductions (PF: &#8377;
                        {fmtCell(selectedSlip.pf_employee)}) still apply.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </ModalBody>

          {/* ── Footer with Download Button ── */}
          <ModalFooter className="bg-light border-top">
            <div className="d-flex justify-content-between w-100 align-items-center">
              <Button
                color="secondary"
                outline
                size="sm"
                onClick={handleCloseModal}
              >
                Close
              </Button>
              <Button
                color="success"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={downloading}
                style={{ minWidth: 165 }}
              >
                {downloading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <i className="ri-download-2-line align-middle me-1"></i>
                    Download Payslip
                  </>
                )}
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default EmployeePayslip;
