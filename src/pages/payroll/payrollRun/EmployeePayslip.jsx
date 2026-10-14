import React, { useEffect, useRef, useState } from "react";
import { TableSkeletonBlock } from "../../../component/common/skeleton/Skeleton";
import {
  Card, CardHeader, CardBody, CardTitle, Table, Spinner,
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Badge, Input,
} from "reactstrap";
import Select from "../../../shared/ui/TestableSelect";
import { Document, Page, Text, View, StyleSheet, pdf, Image } from "@react-pdf/renderer";
import { Api } from "../../../common/api/Api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import PayslipStatusCell from "./PayslipStatusCell";
import PayslipBulkStatusBar from "./PayslipBulkStatusBar";
import PayslipRevisionHistory from "./PayslipRevisionHistory";
import { isPaymentRecorded } from "./statusHelpers";
import ExcelJs from "exceljs";
import { ApvEmployee } from "../../../component/common/approval/ApprovalCells";
import { testId, itemTestKey } from "../../../shared/testing/testId";
import ModalCloseButton from "../../../shared/ui/ModalCloseButton";

const fmtDateTime = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

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

const PAYSLIP_PAGE_SIZE = 15;

const employees = GetLocalStorageData("employee") || [];
const departments = GetLocalStorageData("department") || [];

const deptMap = departments.reduce((acc, d) => {
  acc[d.id] = d.name;
  return acc;
}, {});

const getDeptName = (emp) => {
  const ids = emp?.primary_department_id_list || [];
  const firstId = ids[0];
  return deptMap[firstId] || "";
};

// Same group colors as the Regularization sheet.
const PAYSLIP_COLORS = {
  employee:   { bg: "#f0f4f8", text: "#334155", border: "#cbd5e1", cell: "#f8fafc" },
  attendance: { bg: "#fffbeb", text: "#92400e", border: "#fcd34d", cell: "#fffdf5" },
  lop:        { bg: "#fff1f2", text: "#be123c", border: "#fda4af", cell: "#fff1f2" },
  earning:    { bg: "#f0fdf4", text: "#166534", border: "#86efac", cell: "#f0fdf4" },
  deduction:  { bg: "#fff5f5", text: "#c53030", border: "#fca5a5", cell: "#fff8f8" },
  netpay:     { bg: "#ecfdf5", text: "#065f46", border: "#34d399", cell: "#ecfdf5" },
  payment:    { bg: "#eff6ff", text: "#1d4ed8", border: "#93c5fd", cell: "#f0f6ff" },
  meta:       { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", cell: "#ffffff" },
};

const GROUP_HEAD_H = 36;

const payslipTh = (color, extra = {}) => ({
  padding: "6px 8px",
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  verticalAlign: "middle",
  textAlign: "center",
  position: "sticky",
  top: 0,
  zIndex: 3,
  background: color.bg,
  color: color.text,
  borderRight: `1px solid ${color.border}`,
  borderBottom: `2px solid ${color.border}`,
  borderTop: `2px solid ${color.border}`,
  height: GROUP_HEAD_H,
  boxSizing: "border-box",
  ...extra,
});

const payslipSubTh = (color, extra = {}) => payslipTh(color, {
  top: GROUP_HEAD_H,
  borderTop: "none",
  whiteSpace: "normal",
  wordBreak: "break-word",
  lineHeight: 1.3,
  minWidth: 108,
  height: "auto",
  ...extra,
});

const payslipTd = (color, extra = {}) => ({
  padding: "8px",
  fontSize: 12,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  textAlign: "right",
  background: color.cell,
  color: color.text,
  borderRight: "1px solid #e9ecef",
  borderBottom: "1px solid #e9ecef",
  ...extra,
});

const transformPayslip = (item) => {
  const earningsMap   = {};
  const deductionsMap = {};
  (item.earnings   || []).forEach((c) => { earningsMap[c.component_name]   = c.final_amount; });
  (item.deductions || []).forEach((c) => { deductionsMap[c.component_name] = c.final_amount; });


  const empDetails = employees.find((e) => String(e.id) === String(item.employee));

  const employee_name =
    item.employee_name ||
    (empDetails
      ? `${empDetails.first_name || ""} ${empDetails.last_name || ""}`.trim()
      : `Employee #${item.employee}`);

  return {
    ...item,
    earnings:   earningsMap,
    deductions: deductionsMap,
    earningsList:   item.earnings   || [],
    deductionsList: item.deductions || [],
    regularizationDetails: item.regularization_details || [],
    employerContributions: item.employer_contributions || {
      items: [], total_employer_cost: "0.00", embedded_in_ctc: "0.00", additional_cost: "0.00",
    },
    ctcBreakdown: item.ctc_breakdown || null,
    is_regularized: Boolean(item.is_regularized),
    regularized_days_count: item.regularized_days_count || (item.regularization_details || []).length || 0,
    employee_name,
    emp_id:          item.employee_emp_id  || empDetails?.emp_id          || "—",
    department:      item.department_name  || getDeptName(empDetails) || "",
    department_id:   item.department_id    || (empDetails?.primary_department_id_list || [])[0] || null,
    joining_date:    item.joining_date      || empDetails?.date_of_joining  || "—",
    pay_period:      item.pay_period        || "—",
    pay_date:        item.pay_date          || "—",
    net_pay_in_words: item.net_pay_in_words || null,
    pf_account:  empDetails?.pf_account  || "—",
    uan:         empDetails?.uan         || "—",
    profile_url: empDetails?.profile_url || null,
  };
};

const fmt = (val, allowDec = true) =>
  Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: allowDec ? 2 : 0,
    maximumFractionDigits: allowDec ? 2 : 0,
  });

const getGross = (slip) => slip?.gross_earnings || "0.00";

const numberToWords = (num) => {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
    "Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const convert = (n) => {
    if (n < 20)       return ones[n];
    if (n < 100)      return tens[Math.floor(n/10)] + (n%10 ? " "+ones[n%10] : "");
    if (n < 1000)     return ones[Math.floor(n/100)]+" Hundred"+(n%100 ? " "+convert(n%100) : "");
    if (n < 100000)   return convert(Math.floor(n/1000))+" Thousand"+(n%1000 ? " "+convert(n%1000) : "");
    if (n < 10000000) return convert(Math.floor(n/100000))+" Lakh"+(n%100000 ? " "+convert(n%100000) : "");
    return convert(Math.floor(n/10000000))+" Crore"+(n%10000000 ? " "+convert(n%10000000) : "");
  };
  const n = Math.floor(num);
  return n === 0 ? "Zero" : "Indian Rupee "+convert(n)+" Only";
};

// ─── PDF styles (unchanged) ───────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32,
    fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a", backgroundColor: "#ffffff",
  },
  headerRow: { flexDirection:"row", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 },
  companyName: { fontSize:17, fontFamily:"Helvetica-Bold", color:"#299cdb" },
  headerRight: { alignItems:"flex-end" },
  payslipLabel: { fontSize:8, color:"#888888" },
  payPeriod: { fontSize:12, fontFamily:"Helvetica-Bold", color:"#1a1a1a" },
  dividerBlue: { borderBottomWidth:2, borderBottomColor:"#299cdb", marginBottom:12 },
  summaryRow: { flexDirection:"row", justifyContent:"space-between", marginBottom:12 },
  summaryLeft: { flex:1, marginRight:14 },
  sectionTitle: { fontSize:7, fontFamily:"Helvetica-Bold", color:"#888888", letterSpacing:0.8, marginBottom:7 },
  summaryItem: { flexDirection:"row", marginBottom:4 },
  summaryLabel: { width:100, fontSize:8, color:"#555555" },
  summaryColon: { fontSize:8, color:"#888888", marginRight:5 },
  summaryValue: { fontSize:8, fontFamily:"Helvetica-Bold", flex:1 },
  netBox: { borderWidth:1, borderColor:"#c3e8dc", borderRadius:5, padding:12, width:168, backgroundColor:"#f6fdf9" },
  netBoxAccent: { borderLeftWidth:3, borderLeftColor:"#0ab39c", paddingLeft:9 },
  netAmount: { fontSize:17, fontFamily:"Helvetica-Bold", color:"#1a1a1a" },
  netLabel: { fontSize:7, color:"#0ab39c", marginTop:3 },
  netDivider: { borderBottomWidth:1, borderBottomColor:"#c3e8dc", marginVertical:7 },
  netRow: { flexDirection:"row", justifyContent:"space-between", marginBottom:3 },
  netRowLabel: { fontSize:8, color:"#555555" },
  netRowValue: { fontSize:8, fontFamily:"Helvetica-Bold" },
  pfBar: { flexDirection:"row", backgroundColor:"#f7f8fa", borderWidth:1, borderColor:"#e5e7eb", borderRadius:4, padding:7, marginBottom:12, gap:24 },
  pfItem: { flexDirection:"row" },
  pfLabel: { fontSize:7.5, color:"#888888", marginRight:3 },
  pfValue: { fontSize:7.5, fontFamily:"Helvetica-Bold" },
  tableWrapper: { flexDirection:"row", borderWidth:1, borderColor:"#dddddd" },
  leftPanel: { width:"50%", borderRightWidth:1, borderRightColor:"#cccccc" },
  rightPanel: { width:"50%" },
  panelHeader: { flexDirection:"row", backgroundColor:"#f0f0f0", borderBottomWidth:1, borderBottomColor:"#dddddd", padding:"6 8" },
  panelHeaderText: { fontSize:7.5, fontFamily:"Helvetica-Bold", color:"#444444" },
  panelRow: { flexDirection:"row", borderBottomWidth:1, borderBottomColor:"#eeeeee", paddingVertical:5, paddingHorizontal:8 },
  panelRowAlt: { backgroundColor:"#fafafa" },
  panelRowTotal: { backgroundColor:"#eaf7f3", borderBottomWidth:0 },
  panelRowTotalD: { backgroundColor:"#fff5f5", borderBottomWidth:0 },
  cellName: { flex:1, fontSize:8, color:"#1a1a1a" },
  cellNameBold: { flex:1, fontSize:8, fontFamily:"Helvetica-Bold", color:"#1a1a1a" },
  cellNameRed: { flex:1, fontSize:8, fontFamily:"Helvetica-Bold", color:"#c53030" },
  cellAmt: { width:70, fontSize:8, textAlign:"right", color:"#1a1a1a" },
  cellAmtBold: { width:70, fontSize:8, textAlign:"right", fontFamily:"Helvetica-Bold", color:"#1a1a1a" },
  cellAmtRed: { width:70, fontSize:8, textAlign:"right", color:"#c53030" },
  cellAmtRedBold: { width:70, fontSize:8, textAlign:"right", fontFamily:"Helvetica-Bold", color:"#c53030" },
  empCostBox: { marginTop:10, borderWidth:1, borderColor:"#e5e7eb", borderRadius:4, padding:8 },
  empCostTitle: { fontSize:7.5, fontFamily:"Helvetica-Bold", color:"#555555", marginBottom:6 },
  empCostRow: { flexDirection:"row", justifyContent:"space-between", marginBottom:3 },
  empCostLabel: { fontSize:7.5, color:"#555555" },
  empCostBadge: { fontSize:6.5, color:"#888888", marginLeft:4 },
  empCostAmt: { fontSize:7.5, fontFamily:"Helvetica-Bold", color:"#1a1a1a" },
  empCostDivider: { borderBottomWidth:1, borderBottomColor:"#e5e7eb", marginVertical:5 },
  empCostTotal: { flexDirection:"row", justifyContent:"space-between" },
  empCostTotalLabel: { fontSize:8, fontFamily:"Helvetica-Bold" },
  empCostTotalAmt: { fontSize:8, fontFamily:"Helvetica-Bold", color:"#c53030" },
  netFooter: { flexDirection:"row", justifyContent:"space-between", alignItems:"center", backgroundColor:"#f0f0f0", borderWidth:1, borderTopWidth:0, borderColor:"#dddddd", padding:10 },
  netFooterLeft: { flex:1 },
  netFooterTitle: { fontSize:9, fontFamily:"Helvetica-Bold" },
  netFooterSub: { fontSize:7, color:"#666666", marginTop:2 },
  netFooterAmtBox: { backgroundColor:"#ffffff", borderWidth:1, borderColor:"#c3e8dc", borderRadius:4, paddingVertical:7, paddingHorizontal:12 },
  netFooterAmt: { fontSize:15, fontFamily:"Helvetica-Bold", color:"#1a1a1a" },
  netFooterAmtRed: { fontSize:15, fontFamily:"Helvetica-Bold", color:"#c53030" },
  amtWords: { textAlign:"right", fontSize:7, color:"#555555", marginTop:5 },
  lopWarn: { flexDirection:"row", backgroundColor:"#fffbeb", borderWidth:1, borderColor:"#f59e0b", borderRadius:4, padding:7, marginTop:8 },
  lopText: { fontSize:7, color:"#92400e", flex:1 },
  footerNote: { borderTopWidth:1, borderTopColor:"#e5e7eb", paddingTop:7, marginTop:28, fontSize:7, color:"#aaaaaa", textAlign:"center" },
  headerLeft: { flexDirection: "column", justifyContent: "center" },
  companyLogo: { maxWidth: 140, maxHeight: 45, objectFit: "contain" },
});

// ─── PDF Component (unchanged) ────────────────────────────────────────────────
const PayslipPDF = ({ slip, companyName, companyLogo, allowDecimal }) => {
  if (!slip) return null;
  const ad        = allowDecimal ?? true;
  const netPayNum = parseFloat(slip.net_pay || 0);
  const earningEntries   = (slip.earningsList   || []).map((c) => [c.component_name, c.final_amount]);
  const deductionEntries = (slip.deductionsList || []).map((c) => [c.component_name, c.final_amount]);
  const maxData  = Math.max(earningEntries.length, deductionEntries.length);
  const earnRows = [...earningEntries,   ...Array(Math.max(0, maxData - earningEntries.length)).fill(null)];
  const dedRows  = [...deductionEntries, ...Array(Math.max(0, maxData - deductionEntries.length)).fill(null)];
  const grossDisplay = slip.gross_earnings || "0.00";
  const empContrib = slip.employerContributions || {};
  const empItems   = empContrib.items || [];
  const amountInWords = slip.net_pay_in_words || numberToWords(netPayNum);

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <View style={S.headerRow}>
          <View style={S.headerLeft}>
            {companyLogo ? (
              <Image src={companyLogo} style={S.companyLogo} />
            ) : (
              <Text style={S.companyName}>{companyName || "Company"}</Text>
            )}
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
              ["Employee Name",   slip.employee_name || "—"],
              ["Employee ID",     slip.emp_id        || "—"],
              ["Date of Joining", slip.joining_date  || "—"],
              ["Pay Period",      slip.pay_period    || "—"],
              ["Pay Date",        slip.pay_date      || "—"],
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
              ["LOP Days",  String(slip.lop_days     ?? "0")],
            ].map(([l, v]) => (
              <View key={l} style={S.netRow}>
                <Text style={S.netRowLabel}>{l}</Text>
                <Text style={[S.netRowLabel, { color:"#888888" }]}>:</Text>
                <Text style={S.netRowValue}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={S.pfBar}>
          <View style={S.pfItem}><Text style={S.pfLabel}>PF A/C Number : </Text><Text style={S.pfValue}>{slip.pf_account || "—"}</Text></View>
          <View style={S.pfItem}><Text style={S.pfLabel}>UAN : </Text><Text style={S.pfValue}>{slip.uan || "—"}</Text></View>
        </View>
        <View style={S.tableWrapper}>
          <View style={S.leftPanel}>
            <View style={S.panelHeader}>
              <Text style={[S.panelHeaderText, { flex:1 }]}>EARNINGS</Text>
              <Text style={[S.panelHeaderText, { width:70, textAlign:"right" }]}>AMOUNT</Text>
            </View>
            {earnRows.map((entry, i) => (
              <View key={i} style={[S.panelRow, i % 2 !== 0 ? S.panelRowAlt : {}]}>
                {entry ? (<><Text style={S.cellName}>{entry[0]}</Text><Text style={S.cellAmt}>Rs.{fmt(parseFloat(entry[1] || 0), ad)}</Text></>) : (<><Text style={S.cellName}> </Text><Text style={S.cellAmt}> </Text></>)}
              </View>
            ))}
            <View style={[S.panelRow, S.panelRowTotal]}>
              <Text style={S.cellNameBold}>Gross Earnings</Text>
              <Text style={S.cellAmtBold}>Rs.{fmt(parseFloat(grossDisplay), ad)}</Text>
            </View>
          </View>
          <View style={S.rightPanel}>
            <View style={S.panelHeader}>
              <Text style={[S.panelHeaderText, { flex:1, color:"#c53030" }]}>DEDUCTIONS</Text>
              <Text style={[S.panelHeaderText, { width:70, textAlign:"right" }]}>AMOUNT</Text>
            </View>
            {dedRows.map((entry, i) => (
              <View key={i} style={[S.panelRow, i % 2 !== 0 ? S.panelRowAlt : {}]}>
                {entry ? (<><Text style={S.cellName}>{entry[0]}</Text><Text style={S.cellAmtRed}>Rs.{fmt(parseFloat(entry[1] || 0), ad)}</Text></>) : (<><Text style={S.cellName}> </Text><Text style={S.cellAmt}> </Text></>)}
              </View>
            ))}
            <View style={[S.panelRow, S.panelRowTotalD]}>
              <Text style={S.cellNameRed}>Total Deductions</Text>
              <Text style={S.cellAmtRedBold}>Rs.{fmt(slip.total_deductions, ad)}</Text>
            </View>
          </View>
        </View>
        <View style={S.netFooter}>
          <View style={S.netFooterLeft}>
            <Text style={S.netFooterTitle}>TOTAL NET PAYABLE</Text>
            <Text style={S.netFooterSub}>Gross Earnings - Total Deductions</Text>
          </View>
          <View style={S.netFooterAmtBox}>
            <Text style={netPayNum < 0 ? S.netFooterAmtRed : S.netFooterAmt}>Rs.{fmt(slip.net_pay, ad)}</Text>
          </View>
        </View>
        <Text style={S.amtWords}>Amount In Words : {amountInWords}</Text>
        {empItems.length > 0 && (
          <View style={S.empCostBox}>
            <Text style={S.empCostTitle}>EMPLOYER CONTRIBUTIONS</Text>
            {empItems.map((item, i) => (
              <View key={i} style={S.empCostRow}>
                <View style={{ flexDirection:"row", alignItems:"center" }}>
                  <Text style={S.empCostLabel}>{item.name}</Text>
                  {item.ctc_embedded && <Text style={S.empCostBadge}>(in CTC)</Text>}
                </View>
                <Text style={S.empCostAmt}>Rs.{fmt(parseFloat(item.amount || 0), ad)}</Text>
              </View>
            ))}
            <View style={S.empCostDivider} />
            <View style={S.empCostTotal}>
              <Text style={S.empCostTotalLabel}>Total Employer Cost</Text>
              <Text style={S.empCostTotalAmt}>Rs.{fmt(parseFloat(empContrib.total_employer_cost || 0), ad)}</Text>
            </View>
            {parseFloat(empContrib.additional_cost || 0) > 0 && (
              <View style={[S.empCostRow, { marginTop:3 }]}>
                <Text style={[S.empCostLabel, { color:"#888888" }]}>Additional Cost (above CTC)</Text>
                <Text style={[S.empCostAmt, { color:"#c53030" }]}>Rs.{fmt(parseFloat(empContrib.additional_cost || 0), ad)}</Text>
              </View>
            )}
          </View>
        )}
        {parseFloat(slip.lop_days) > 0 && (
          <View style={S.lopWarn}>
            <Text style={S.lopText}>
              {"! " + slip.lop_days + " LOP days were deducted this month." +
                (parseFloat(slip.pf_employee) > 0
                  ? "  Statutory deductions (PF: Rs." + fmt(slip.pf_employee) + ") still apply."
                  : "")}
            </Text>
          </View>
        )}
        {slip.bonus_notes && (
          <Text style={{ fontSize:7, color:"#888888", marginTop:6 }}>Note: {slip.bonus_notes}</Text>
        )}
        <Text style={S.footerNote}>This is a computer-generated payslip and does not require a signature.</Text>
      </Page>
    </Document>
  );
};

// ─── react-select styling — matches Bootstrap's .form-control (search box) ──
// so the department filter sits flush with the search input instead of
// looking taller / differently bordered like the raw react-select default.
const deptSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    height: 38,
    fontSize: 13,
    borderRadius: 4,
    borderColor: state.isFocused ? "#0ab39c" : "#ced4da",
    boxShadow: state.isFocused ? "0 0 0 0.15rem rgba(10,179,156,0.25)" : "none",
    "&:hover": { borderColor: state.isFocused ? "#0ab39c" : "#adb5bd" },
  }),
  valueContainer: (base) => ({
    ...base,
    height: 36,
    padding: "0 10px",
  }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorsContainer: (base) => ({ ...base, height: 36 }),
  indicatorSeparator: () => ({ display: "none" }),
  placeholder: (base) => ({ ...base, fontSize: 13, color: "#6c757d" }),
  singleValue: (base) => ({ ...base, fontSize: 13 }),
  menu: (base) => ({ ...base, fontSize: 13, zIndex: 10 }),
  option: (base, state) => ({
    ...base,
    fontSize: 13,
    backgroundColor: state.isSelected ? "#0ab39c" : state.isFocused ? "#e6f7f4" : "#fff",
    color: state.isSelected ? "#fff" : "#1a1a1a",
  }),
};

// ─── Main Component ───────────────────────────────────────────────────────────
const EmployeePayslip = ({ payrollRunId = 38, companyName = "Lintcloud", refreshKey = 0, month, year, runStatus, onPaymentReleased, runTotals = null }) => {
  const [loading, setLoading]                     = useState(false);
  const [page, setPage]                           = useState(1);
  const [totalCount, setTotalCount]               = useState(0);
  const [totalPages, setTotalPages]               = useState(1);
  const [payslipData, setPayslipData]             = useState([]);
  const [dynamicEarnings, setDynamicEarnings]     = useState([]);
  const [dynamicDeductions, setDynamicDeductions] = useState([]);
  const [selectedSlip, setSelectedSlip]           = useState(null);
  const [modalOpen, setModalOpen]                 = useState(false);
  const [downloading, setDownloading]             = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [rerunning, setRerunning] = useState(false);
  const [historySlip, setHistorySlip] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const toggleSelect = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null); // react-select option | null

  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));

  const urlToBase64 = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // e.g. "data:image/png;base64,...."
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    Api({ method: "GET", url: "branch/get-company-profile/" })
      .then(async (res) => {
        const profile = res?.data?.data || {};
        const logoUrl = profile.light_logo_image || profile.dark_logo_image;
        if (!logoUrl) return;
        try {
          const base64 = await urlToBase64(logoUrl);
          setCompanyLogo(base64);
        } catch (err) {
          console.error("Failed to load company logo for payslip PDF:", err);
          // Silently fall back to text company name — not worth blocking the download over
        }
      })
      .catch((err) => console.error("Failed to fetch company profile:", err));
  }, []);

  const payslipListUrl = (targetPage, targetPageSize = PAYSLIP_PAGE_SIZE) => {
    const params = new URLSearchParams();
    params.set("payroll_run", String(payrollRunId));
    params.set("page", String(targetPage));
    params.set("page_size", String(targetPageSize));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedDepartment?.value != null && selectedDepartment.value !== "") {
      params.set("department", String(selectedDepartment.value));
    }
    return `payroll/employee-payslip/?${params.toString()}`;
  };

  const applyPayslipRows = (raw, meta) => {
    const transformed = (raw || []).map(transformPayslip);
    setPayslipData(transformed);
    setTotalCount(Number(meta?.count ?? transformed.length));
    setTotalPages(Math.max(1, Number(meta?.total_pages ?? 1)));
    const earningKeys = new Set();
    const deductionKeys = new Set();
    transformed.forEach((item) => {
      Object.keys(item.earnings || {}).forEach((k) => earningKeys.add(k));
      Object.keys(item.deductions || {}).forEach((k) => deductionKeys.add(k));
    });
    setDynamicEarnings(Array.from(earningKeys));
    setDynamicDeductions(Array.from(deductionKeys));
  };

  const fetchPayslips = (targetPage = page) => {
    setLoading(true);
    return Api({ method: "GET", url: payslipListUrl(targetPage) })
      .then((res) => applyPayslipRows(res?.data?.data, res?.data))
      .catch(() => toast.error("Failed to load payslip data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !modalOpen && !historySlip) setFullscreen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreen, modalOpen, historySlip]);

  const filtersKey = `${payrollRunId}|${debouncedSearch}|${selectedDepartment?.value ?? ""}`;
  const filtersRef = useRef(filtersKey);

  useEffect(() => {
    const filtersChanged = filtersRef.current !== filtersKey;
    filtersRef.current = filtersKey;
    if (filtersChanged && page !== 1) {
      setPage(1);
      setSelectedIds([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Api({ method: "GET", url: payslipListUrl(page) })
      .then((res) => {
        if (!cancelled) applyPayslipRows(res?.data?.data, res?.data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load payslip data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, filtersKey, refreshKey]);

  useEffect(() => {
    setSelectedIds([]);
  }, [page, filtersKey]);

  // Re-run (or first-run) payroll for just the checked rows — e.g. after
  // fixing an attendance record for a couple of people, or clearing new
  // joiners without waiting on everyone else. `selectedIds` are payslip
  // ids (used for bulk status too); the run endpoint wants employee ids,
  // so map through the payslip data we already have in memory.
  const rerunEmployees = (employeeIds) => {
    if (!month || !year) {
      toast.error("Missing month/year for this run — cannot re-run.");
      return;
    }
    if (!employeeIds.length) return;

    setRerunning(true);
    Api({
      method: "POST",
      url: "payroll/payroll-run/selected-employees/",
      data: { month, year, employee_ids: employeeIds },
    })
      .then((res) => {
        const { processed_employee_ids = [], failed = [] } = res?.data?.data || {};
        toast.success(
          `Re-ran ${processed_employee_ids.length} employee(s)` +
          (failed.length ? `, ${failed.length} failed` : "")
        );
        if (failed.length) {
          failed.forEach((f) => toast.error(`Employee #${f.employee_id}: ${f.error}`));
        }
        setSelectedIds([]);
        fetchPayslips();
      })
      .catch((err) => toast.error(err?.response?.data?.error_message || err?.response?.data?.detail || "Failed to re-run selected employees."))
      .finally(() => setRerunning(false));
  };

  // Parent owns the overview totals and run-status badge. When it is
  // wired, its callback refetches this table via refreshKey. Otherwise
  // refresh locally so the grid still updates.
  const refreshAfterChange = ({ clearSelection = false } = {}) => {
    if (clearSelection) setSelectedIds([]);
    if (onPaymentReleased) onPaymentReleased();
    else fetchPayslips();
  };

  const confirmRerun = (title, text) =>
    Swal.fire({
      icon: "question",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Yes, re-run",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => result.isConfirmed);

  const handleRerunSelected = () => {
    const selected = payslipData.filter((row) => selectedIds.includes(row.id));
    const blocked = selected.filter(isPaymentRecorded);
    const eligible = selected.filter((row) => !isPaymentRecorded(row));
    if (!eligible.length) {
      toast.warning("Paid and partially paid payslips cannot be re-run.");
      return;
    }
    const names = eligible.map((row) => row.employee_name).filter(Boolean);
    const title = eligible.length === 1
      ? `Re-run payroll for ${names[0] || "this employee"}?`
      : `Re-run payroll for ${eligible.length} employees?`;
    const text = blocked.length
      ? `${blocked.length} paid or partially paid payslip(s) will be skipped. This recalculates the remaining payslips.`
      : "This recalculates the selected payslips for this run.";
    confirmRerun(title, text).then((confirmed) => {
      if (!confirmed) return;
      if (blocked.length) {
        toast.warning(`${blocked.length} paid or partially paid payslip(s) skipped.`);
      }
      rerunEmployees(eligible.map((row) => row.employee));
    });
  };

  const handleRerunOne = (row) => {
    if (isPaymentRecorded(row)) {
      toast.warning("Paid and partially paid payslips cannot be re-run.");
      return;
    }
    const name = row.employee_name || "this employee";
    confirmRerun(
      `Re-run payroll for ${name}?`,
      "This recalculates only this employee's payslip for the current run.",
    ).then((confirmed) => {
      if (confirmed) rerunEmployees([row.employee]);
    });
  };

  // ── Excel export — every employee matching the current search and department ──
  const handleExportExcel = async () => {
    let exportRows = [];
    try {
      const first = await Api({ method: "GET", url: payslipListUrl(1, 100) });
      const exportPages = Number(first?.data?.total_pages || 1);
      exportRows = (first?.data?.data || []).map(transformPayslip);
      for (let nextPage = 2; nextPage <= exportPages; nextPage += 1) {
        const res = await Api({ method: "GET", url: payslipListUrl(nextPage, 100) });
        exportRows = exportRows.concat((res?.data?.data || []).map(transformPayslip));
      }
    } catch (err) {
      toast.error("Failed to export payslips.");
      return;
    }
    if (!exportRows.length) {
      toast.warning("No payslips to export.");
      return;
    }
    const earningKeys = new Set();
    const deductionKeys = new Set();
    exportRows.forEach((item) => {
      Object.keys(item.earnings || {}).forEach((k) => earningKeys.add(k));
      Object.keys(item.deductions || {}).forEach((k) => deductionKeys.add(k));
    });
    const dynamicEarnings = Array.from(earningKeys);
    const dynamicDeductions = Array.from(deductionKeys);

    const workbook = new ExcelJs.Workbook();
    const sheet = workbook.addWorksheet("Payslips", {
      views: [{ state: "frozen", xSplit: 2, ySplit: 1 }], // freeze header row + first 2 cols
    });
    sheet.properties.defaultRowHeight = 20;

    // ── Column definitions ──
    const staticStart = [
      "Employee",
      "Emp ID",
      "Department",
      "Pay Period",
      "Payable Days",
      "LOP Days",
      "Regularized",
    ];
    const header = [
      ...staticStart,
      ...dynamicEarnings,
      "Gross Earnings",
      ...dynamicDeductions,
      "Total Deductions",
      "Net Pay",
      "Paid",
      "Balance",
      "Based On",
    ];

    // Column index ranges for group fills (1-based)
    const earnStart = staticStart.length + 1; // first earning col
    const earnEnd = earnStart + dynamicEarnings.length; // includes Gross
    const dedStart = earnEnd + 1; // first deduction col
    const dedEnd = dedStart + dynamicDeductions.length; // includes Total Deductions
    const netCol = dedEnd + 1; // Net Pay col
    const paidStart = netCol + 1; // Paid, Balance
    const paidEnd = netCol + 2;

    // ── Header row ──
    const headerRow = sheet.addRow(header);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.eachCell((cell, col) => {
      let fill = "1F6FEB"; // blue default
      if (col >= earnStart && col <= earnEnd)
        fill = "0AB39C"; // earnings green
      else if (col >= dedStart && col <= dedEnd)
        fill = "C53030"; // deductions red
      else if (col === netCol) fill = "0A8F7E"; // net pay
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fill },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
    });

    // ── Data rows ──
    exportRows.forEach((row) => {
      const netPay = Number(row.net_pay || 0);
      const values = [
        row.employee_name,
        row.emp_id,
        row.department || "",
        row.pay_period || "",
        row.payable_days,
        row.lop_days,
        row.is_regularized ? `Yes (${row.regularized_days_count})` : "No",
        ...dynamicEarnings.map((e) =>
          row.earnings?.[e] != null ? Number(row.earnings[e]) : "",
        ),
        Number(row.gross_earnings || 0),
        ...dynamicDeductions.map((d) =>
          row.deductions?.[d] != null ? Number(row.deductions[d]) : "",
        ),
        Number(row.total_deductions || 0),
        netPay,
        Number(row.paid_amount || 0),
        Number(row.balance_amount || 0),
        (row.based_on || "CTC").toUpperCase(),
      ];

      const dataRow = sheet.addRow(values);

      dataRow.eachCell((cell, col) => {
        cell.alignment = {
          horizontal: col === 1 ? "left" : "center",
          vertical: "middle",
        };

        // number formatting for money columns
        if (col >= earnStart && col <= dedEnd) {
          cell.numFmt = "#,##0.00";
        }
        // group tint fills
        if (col >= earnStart && col <= earnEnd) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "E6F9F4" },
          };
        } else if (col >= dedStart && col <= dedEnd) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FDECEC" },
          };
        }
        // paid and balance amounts
        if (col >= paidStart && col <= paidEnd) {
          cell.numFmt = "#,##0.00";
        }
        // net pay styling
        if (col === netCol) {
          cell.numFmt = "#,##0.00";
          cell.font = {
            bold: true,
            color: { argb: netPay < 0 ? "C53030" : "0A8F7E" },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D8F3EA" },
          };
        }
      });
    });

    // ── Borders on all cells ──
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // ── Auto column widths ──
    sheet.columns.forEach((column, i) => {
      let maxLength = header[i] ? header[i].length : 10;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value != null ? cell.value.toString().length : 0;
        maxLength = Math.max(maxLength, len);
      });
      column.width = Math.max(maxLength + 2, 12);
    });

    // ── Download ──
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const rawPeriod = exportRows[0]?.pay_period || `Run_${payrollRunId}`;
    const safePeriod = rawPeriod.replace(/\s+/g, "_").replace(/[^\w-]/g, "");

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Payslips_${safePeriod}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
    toast.success("Excel exported!");
  };

  const handleOpenModal  = (slip) => { setSelectedSlip(slip); setModalOpen(true); };
  const handleCloseModal = ()     => { setModalOpen(false);   setSelectedSlip(null); };

  const handleDownloadPDF = async () => {
    if (!selectedSlip) return;
    setDownloading(true);
    try {
      const ad   = selectedSlip?.allow_decimal_in_payslip ?? true;
      const blob = await pdf(
        <PayslipPDF
          slip={selectedSlip}
          companyName={companyName}
          companyLogo={companyLogo}
          allowDecimal={ad}
        />
      ).toBlob();
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href  = url;
      link.download = `Payslip_${(selectedSlip.employee_name || "Employee").replace(/\s+/g,"_")}_${(selectedSlip.pay_period || payrollRunId).replace(/\s+/g,"_")}.pdf`;
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

  const allowDecimal = selectedSlip?.allow_decimal_in_payslip ?? true;
  const startItem = totalCount === 0 ? 0 : (page - 1) * PAYSLIP_PAGE_SIZE + 1;
  const endItem = Math.min(page * PAYSLIP_PAGE_SIZE, totalCount);
  const pageNumbers = [];
  for (let n = 1; n <= totalPages; n += 1) {
    if (n === 1 || n === totalPages || Math.abs(n - page) <= 1) pageNumbers.push(n);
  }

  return (
    <React.Fragment>
      <div
        className="d-flex flex-column"
        style={fullscreen ? {
          position: "fixed",
          inset: 0,
          zIndex: 1045,
          background: "#fff",
          padding: "16px 20px",
          minHeight: 0,
        } : { flex: "1 1 auto", minHeight: 0 }}
      >
      {fullscreen && (
        <div
          className="d-flex align-items-center justify-content-between mb-2 pb-2 flex-shrink-0"
          style={{ borderBottom: "1px solid #e5e7eb" }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
            <i className="ri-fullscreen-line me-2"></i>Full Screen
          </span>
          <Button data-testid="payslip-exit-full-screen-esc-button" color="light" size="sm" className="border" onClick={() => setFullscreen(false)}>
            <i className="ri-fullscreen-exit-line me-1"></i>Exit Full Screen (Esc)
          </Button>
        </div>
      )}
      <Card className="shadow-none border d-flex flex-column mb-0" style={{ minHeight: 0, flex: "0 1 auto", maxHeight: "100%", overflow: "hidden" }}>
        {/* ── Card Header ── */}
        <CardHeader className="bg-light d-flex align-items-center justify-content-between flex-shrink-0">
          <CardTitle tag="h5" className="mb-0">Employee Payslip Registry</CardTitle>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted" style={{ fontSize: 12 }}>
              {totalCount} employee{totalCount !== 1 ? "s" : ""}
            </span>
            <Button data-testid="payslip-export-excel-button" color="success" size="sm" onClick={handleExportExcel} disabled={!totalCount || loading}>
              <i className="ri-file-excel-2-line align-middle me-1"></i> Export Excel
            </Button>
            <Button
              data-testid="payslip-fullscreen-button"
              color="light"
              size="sm"
              className="border"
              onClick={() => setFullscreen((open) => !open)}
              title={fullscreen ? "Exit full screen" : "Full screen view"}
            >
              <i className={fullscreen ? "ri-fullscreen-exit-line" : "ri-fullscreen-line"}></i>
            </Button>
            {selectedIds.length > 0 && (
              <Button
                data-testid="payslip-re-run-selected-button"
                color="primary"
                outline
                size="sm"
                onClick={handleRerunSelected}
                disabled={rerunning || !payslipData.some((row) => selectedIds.includes(row.id) && !isPaymentRecorded(row))}
                title="Paid and partially paid payslips are skipped"
              >
                {rerunning ? <Spinner size="sm" className="me-1" /> : <i className="ri-refresh-line align-middle me-1"></i>}
                Re-run Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </CardHeader>

        {runTotals && (
          <div className="d-flex flex-wrap gap-3 px-3 pt-3 flex-shrink-0">
            {[
              { label: "Total Gross", val: runTotals.gross, color: PAYSLIP_COLORS.earning },
              { label: "Total Deductions", val: runTotals.deductions, color: PAYSLIP_COLORS.deduction },
              { label: "Total Net Pay", val: runTotals.netPay, color: PAYSLIP_COLORS.netpay },
              { label: "Total Paid", val: runTotals.paid, color: PAYSLIP_COLORS.payment },
              { label: "Balance Pending", val: runTotals.balance, color: PAYSLIP_COLORS.lop },
            ].map((c) => (
              <div
                key={c.label}
                className="text-center"
                style={{
                  flex: "1 1 160px",
                  background: c.color.cell,
                  color: c.color.text,
                  borderTop: `3px solid ${c.color.border}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <p className="mb-1 text-uppercase fw-semibold" style={{ fontSize: 10, letterSpacing: "0.4px" }}>{c.label}</p>
                <h5 className="mb-0 fw-bold">{runTotals.ready ? `₹${fmt(c.val)}` : "—"}</h5>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters — name search + department, side by side, aligned heights ── */}
        <div className="px-3 py-2 border-bottom d-flex align-items-center gap-3 flex-wrap flex-shrink-0">
          <div className="search-box" style={{ width: 240, height: 38 }}>
            <Input
              data-testid="payslip-search-employee-name-or-input"
              type="search"
              className="form-control search"
              style={{ height: 38, fontSize: 13 }}
              placeholder="Search employee name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <i className="ri-search-line search-icon"></i>
          </div>
          <div style={{ width: 220 }}>
            <Select
              testId="payslip-filter-by-department"
              options={departmentOptions}
              value={selectedDepartment}
              onChange={(val) => setSelectedDepartment(val)}
              isClearable
              placeholder="Filter by department..."
              classNamePrefix="select2-selection"
              styles={deptSelectStyles}
            />
          </div>
          {selectedDepartment && (
            <Button
              data-testid="payslip-clear-department-button"
              color="link"
              size="sm"
              className="text-muted p-0 text-decoration-none align-self-center"
              style={{ fontSize: 12, lineHeight: "38px" }}
              onClick={() => setSelectedDepartment(null)}
            >
              Clear department
            </Button>
          )}
        </div>

        <PayslipBulkStatusBar
          selectedIds={selectedIds}
          payslips={payslipData}
          runStatus={runStatus}
          onDone={() => refreshAfterChange({ clearSelection: true })}
        />

        <CardBody className="p-0 d-flex flex-column" style={{ minHeight: 0, flex: "1 1 auto", overflow: "hidden" }}>
          <style>{`
            .payslip-scroll {
              overflow: auto;
              flex: 1 1 auto;
              min-height: 0;
              scrollbar-width: thin;
              scrollbar-color: #b7c3ea #f4f6fb;
            }
            .payslip-scroll::-webkit-scrollbar {
              width: 8px;
              height: 10px;
            }
            .payslip-scroll::-webkit-scrollbar-track {
              background: #f4f6fb;
            }
            .payslip-scroll::-webkit-scrollbar-thumb {
              background: #b7c3ea;
              border-radius: 8px;
              border: 2px solid #f4f6fb;
            }
            .payslip-scroll::-webkit-scrollbar-thumb:hover {
              background: #405189;
            }
            .payslip-scroll::-webkit-scrollbar-corner {
              background: #f4f6fb;
            }
          `}</style>
          <div className="payslip-scroll">
            <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: "max-content", fontSize: 12 }}>
              <thead>
                <tr>
                  <th rowSpan={2} style={payslipTh(PAYSLIP_COLORS.employee, { left: 0, zIndex: 6, width: 48, minWidth: 48, height: "auto" })}>
                    <input
                      data-testid="payslip-select-all-checkbox"
                      type="checkbox"
                      style={{ width: 15, height: 15, cursor: "pointer" }}
                      checked={selectedIds.length === payslipData.length && payslipData.length > 0}
                      onChange={(e) => setSelectedIds(e.target.checked ? payslipData.map((r) => r.id) : [])}
                    />
                  </th>
                  <th rowSpan={2} style={payslipTh(PAYSLIP_COLORS.employee, { left: 48, zIndex: 6, minWidth: 220, textAlign: "left", height: "auto", boxShadow: "4px 0 6px -4px rgba(15, 23, 42, 0.18)" })}>
                    Employee
                  </th>
                  <th colSpan={2} style={payslipTh(PAYSLIP_COLORS.attendance, { borderLeft: `3px solid ${PAYSLIP_COLORS.attendance.border}` })}>Attendance</th>
                  <th rowSpan={2} style={payslipTh(PAYSLIP_COLORS.lop, { height: "auto", borderLeft: `3px solid ${PAYSLIP_COLORS.lop.border}` })}>LOP</th>
                  <th rowSpan={2} style={payslipTh(PAYSLIP_COLORS.attendance, { height: "auto" })}>Regularized</th>
                  {dynamicEarnings.length > 0 && (
                    <th colSpan={dynamicEarnings.length} style={payslipTh(PAYSLIP_COLORS.earning, { borderLeft: `3px solid ${PAYSLIP_COLORS.earning.border}` })}>Earnings</th>
                  )}
                  {dynamicDeductions.length > 0 && (
                    <th colSpan={dynamicDeductions.length} style={payslipTh(PAYSLIP_COLORS.deduction, { borderLeft: `3px solid ${PAYSLIP_COLORS.deduction.border}` })}>Deductions</th>
                  )}
                  <th rowSpan={2} style={payslipTh(PAYSLIP_COLORS.netpay, { height: "auto", borderLeft: `3px solid ${PAYSLIP_COLORS.netpay.border}` })}>Net Pay</th>
                  <th colSpan={2} style={payslipTh(PAYSLIP_COLORS.payment, { borderLeft: `3px solid ${PAYSLIP_COLORS.payment.border}` })}>Settlement</th>
                  <th colSpan={2} style={payslipTh(PAYSLIP_COLORS.meta, { borderLeft: `3px solid ${PAYSLIP_COLORS.meta.border}` })}>Details</th>
                  <th rowSpan={2} style={payslipTh(PAYSLIP_COLORS.meta, { right: 0, zIndex: 6, minWidth: 168, height: "auto", boxShadow: "-4px 0 6px -4px rgba(15, 23, 42, 0.18)" })}>
                    Actions
                  </th>
                </tr>
                <tr>
                  <th style={payslipSubTh(PAYSLIP_COLORS.attendance, { borderLeft: `3px solid ${PAYSLIP_COLORS.attendance.border}`, textAlign: "left" })}>Pay Period</th>
                  <th style={payslipSubTh(PAYSLIP_COLORS.attendance)}>Payable Days</th>
                  {dynamicEarnings.map((earn, i) => (
                    <th key={earn} style={payslipSubTh(PAYSLIP_COLORS.earning, { borderLeft: i === 0 ? `3px solid ${PAYSLIP_COLORS.earning.border}` : undefined })}>{earn}</th>
                  ))}
                  {dynamicDeductions.map((ded, i) => (
                    <th key={ded} style={payslipSubTh(PAYSLIP_COLORS.deduction, { borderLeft: i === 0 ? `3px solid ${PAYSLIP_COLORS.deduction.border}` : undefined })}>{ded}</th>
                  ))}
                  <th style={payslipSubTh(PAYSLIP_COLORS.payment, { borderLeft: `3px solid ${PAYSLIP_COLORS.payment.border}` })}>Paid</th>
                  <th style={payslipSubTh(PAYSLIP_COLORS.payment)}>Balance</th>
                  <th style={payslipSubTh(PAYSLIP_COLORS.meta, { borderLeft: `3px solid ${PAYSLIP_COLORS.meta.border}`, textAlign: "center" })}>Based On</th>
                  <th style={payslipSubTh(PAYSLIP_COLORS.meta, { textAlign: "center" })}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={12 + dynamicEarnings.length + dynamicDeductions.length} className="py-3">
                      <TableSkeletonBlock rows={6} cols={8} head={false} testId="employee-payslip-loading-skeleton" label="Loading payslips" />
                    </td>
                  </tr>
                ) : payslipData.length === 0 ? (
                  <tr>
                    <td colSpan={12 + dynamicEarnings.length + dynamicDeductions.length} className="text-center py-4 text-muted">
                      No payslip data found.
                    </td>
                  </tr>
                ) : payslipData.map((row, index) => {
                  const netPay = parseFloat(row.net_pay || 0);
                  return (
                    <tr key={row.id || index}>
                      <td style={payslipTd(PAYSLIP_COLORS.employee, { position: "sticky", left: 0, zIndex: 2, textAlign: "center", width: 48, minWidth: 48, background: "#fff" })}>
                        <input data-testid={testId("payslip-row", itemTestKey(row), "checkbox")} type="checkbox" style={{ width: 15, height: 15, cursor: "pointer" }} checked={selectedIds.includes(row.id)} onChange={() => toggleSelect(row.id)} />
                      </td>
                      <td style={payslipTd(PAYSLIP_COLORS.employee, { position: "sticky", left: 48, zIndex: 2, textAlign: "left", minWidth: 220, background: "#fff", boxShadow: "4px 0 6px -4px rgba(15, 23, 42, 0.18)" })}>
                        <ApvEmployee
                          employee={{ first_name: row.employee_name, profile_url: row.profile_url }}
                          tag={row.emp_id ? `#${row.emp_id}` : null}
                          sub={row.department || null}
                        />
                      </td>
                      <td style={payslipTd(PAYSLIP_COLORS.attendance, { textAlign: "left" })}>{row.pay_period || "—"}</td>
                      <td style={payslipTd(PAYSLIP_COLORS.attendance)}>{row.payable_days}</td>
                      <td style={payslipTd(PAYSLIP_COLORS.lop, { fontWeight: 600 })}>
                        {parseFloat(row.lop_days) > 0 ? fmtDays(row.lop_days) : "0"}
                      </td>
                      <td style={payslipTd(PAYSLIP_COLORS.attendance, { textAlign: "center" })}>
                        {row.is_regularized
                          ? `${row.regularized_days_count} day${row.regularized_days_count === 1 ? "" : "s"}`
                          : "—"}
                      </td>
                      {dynamicEarnings.map((earn) => (
                        <td key={earn} style={payslipTd(PAYSLIP_COLORS.earning)}>
                          &#8377;{fmt(row.earnings?.[earn])}
                        </td>
                      ))}
                      {dynamicDeductions.map((ded) => (
                        <td key={ded} style={payslipTd(PAYSLIP_COLORS.deduction)}>
                          &#8377;{fmt(row.deductions?.[ded])}
                        </td>
                      ))}
                      <td style={payslipTd(PAYSLIP_COLORS.netpay, { fontWeight: 800, color: netPay < 0 ? "#c53030" : PAYSLIP_COLORS.netpay.text })}>
                        &#8377;{fmt(row.net_pay)}
                      </td>
                      <td style={payslipTd(PAYSLIP_COLORS.payment)}>&#8377;{fmt(row.paid_amount)}</td>
                      <td style={payslipTd(PAYSLIP_COLORS.payment, { fontWeight: parseFloat(row.balance_amount || 0) > 0 ? 700 : 400 })}>
                        &#8377;{fmt(row.balance_amount)}
                      </td>
                      <td style={payslipTd(PAYSLIP_COLORS.meta, { textAlign: "center", textTransform: "uppercase" })}>
                        {row.based_on || "—"}
                      </td>
                      <td style={payslipTd(PAYSLIP_COLORS.meta, { textAlign: "center", background: "#fff" })}>
                        <PayslipStatusCell payslip={row} runStatus={runStatus} onChanged={() => refreshAfterChange()} />
                      </td>
                      <td style={payslipTd(PAYSLIP_COLORS.meta, { position: "sticky", right: 0, zIndex: 2, textAlign: "right", background: "#fff", minWidth: 168, boxShadow: "-4px 0 6px -4px rgba(15, 23, 42, 0.12)" })}>
                        <Button
                          data-testid={testId("payslip-refresh", itemTestKey(row), "button")}
                          color="light"
                          size="sm"
                          className="border py-1 px-2 me-1"
                          title={isPaymentRecorded(row) ? "Paid and partially paid payslips cannot be re-run" : "Re-run payroll for this employee only"}
                          disabled={rerunning || isPaymentRecorded(row)}
                          onClick={() => handleRerunOne(row)}
                        >
                          <i className="ri-refresh-line align-middle"></i>
                        </Button>
                        <Button
                          data-testid={testId("payslip-view-old-versions-of-this", itemTestKey(row), "button")}
                          color="light"
                          size="sm"
                          className="border py-1 px-2 me-1"
                          title="View old versions of this payslip"
                          onClick={() => setHistorySlip(row)}
                        >
                          <i className="ri-history-line align-middle"></i>
                        </Button>
                        <Button
                          data-testid={testId("payslip-open-slip", itemTestKey(row), "button")}
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
                })}
              </tbody>
            </table>
          </div>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 border-top flex-shrink-0">
            <div className="text-muted" style={{ fontSize: 12 }}>
              Showing <span className="fw-semibold">{startItem}</span> to{" "}
              <span className="fw-semibold">{endItem}</span> of{" "}
              <span className="fw-semibold">{totalCount}</span>
            </div>
            {totalPages > 1 && (
              <ul className="pagination pagination-separated pagination-sm mb-0">
                <li className={page <= 1 || loading ? "page-item disabled" : "page-item"}>
                  <button data-testid="payslip-previous-button" type="button" className="page-link" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
                    Previous
                  </button>
                </li>
                {pageNumbers.map((n, idx) => {
                  const prev = pageNumbers[idx - 1];
                  const gap = prev && n - prev > 1;
                  return (
                    <React.Fragment key={n}>
                      {gap && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}
                      <li className="page-item">
                        <button
                          data-testid={testId("payslip", itemTestKey(n), "button")}
                          type="button"
                          className={n === page ? "page-link active" : "page-link"}
                          disabled={loading}
                          onClick={() => setPage(n)}
                        >
                          {n}
                        </button>
                      </li>
                    </React.Fragment>
                  );
                })}
                <li className={page >= totalPages || loading ? "page-item disabled" : "page-item"}>
                  <button data-testid="payslip-next-button" type="button" className="page-link" disabled={page >= totalPages || loading} onClick={() => setPage(page + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            )}
          </div>
        </CardBody>
      </Card>
      </div>

      {/* ── Payslip Revision History Modal ── */}
      <PayslipRevisionHistory
        isOpen={Boolean(historySlip)}
        toggle={() => setHistorySlip(null)}
        payslip={historySlip}
      />

      {/* ── Payslip Detail Modal ── */}
      {selectedSlip && (
        <Modal data-testid="payslip-detail-dialog" isOpen={modalOpen} toggle={handleCloseModal} size="xl" centered>
          <ModalHeader close={<ModalCloseButton onClick={handleCloseModal} testId="payslip-detail-close-button" />} toggle={handleCloseModal} className="bg-light p-3">
            Payslip &mdash; {selectedSlip.employee_name || "Employee"} ({selectedSlip.emp_id || selectedSlip.employee})
            {selectedSlip.department && (
              <span className="text-muted ms-2" style={{ fontSize: 12, fontWeight: 400 }}>
                · {selectedSlip.department}
              </span>
            )}
          </ModalHeader>

          <ModalBody className="p-4" style={{ maxHeight:"78vh", overflowY:"auto", overflowX:"auto" }}>
            <div className="p-3 border rounded bg-white" style={{ minWidth:"620px" }}>
              <div className="text-center mb-3">
                <h5 className="fw-bold text-uppercase mb-1">Salary Slip</h5>
                <p className="text-muted mb-0" style={{ fontSize:12 }}>
                  {selectedSlip.pay_period || `Payroll Run #${selectedSlip.payroll_run}`}
                </p>
              </div>
              <hr />

              <Row className="mb-3">
                <Col sm={6}>
                  <p className="mb-1"><strong>Employee ID:</strong> {selectedSlip.emp_id || selectedSlip.employee}</p>
                  <p className="mb-1"><strong>Name:</strong> {selectedSlip.employee_name || "—"}</p>
                  {selectedSlip.department && (
                    <p className="mb-1"><strong>Department:</strong> {selectedSlip.department}</p>
                  )}
                  <p className="mb-0"><strong>Date of Joining:</strong> {selectedSlip.joining_date || "—"}</p>
                  <p className="mb-0"><strong>Pay Date:</strong> {selectedSlip.pay_date || "—"}</p>
                </Col>
                <Col sm={6}>
                  <p className="mb-1">
                    <strong>Based On:</strong>{" "}
                    <Badge color={selectedSlip.based_on === "ctc" ? "info" : "secondary"} className="text-uppercase fs-11">
                      {selectedSlip.based_on || "—"}
                    </Badge>
                  </p>
                  <p className="mb-1">
                    <strong>{selectedSlip.based_on === "ctc" ? "Annual CTC" : "Monthly Gross"}:</strong>{" "}
                    &#8377;{fmt(selectedSlip.based_on === "ctc" ? selectedSlip.ctc_amount : selectedSlip.gross_amount)}
                  </p>
                  <p className="mb-1"><strong>Pay Period:</strong> {selectedSlip.pay_period || "—"}</p>
                </Col>
              </Row>

              <div
                className="p-2 bg-light rounded mb-3 d-flex gap-4 flex-nowrap align-items-center"
                style={{ fontSize:12, overflowX:"auto" }}
              >
                <span className="text-nowrap"><strong>Total Days:</strong> {selectedSlip.total_days_in_month}</span>
                <span className="text-nowrap"><strong>Payable Days:</strong> {selectedSlip.payable_days}</span>
                <span className="text-nowrap"><strong>Present:</strong> {selectedSlip.present_days}</span>
                <span className="text-nowrap"><strong>Leave:</strong> {selectedSlip.approved_leave_days}</span>
                <span className={`text-nowrap ${parseFloat(selectedSlip.lop_days) > 0 ? "text-danger fw-bold" : ""}`}>
                  <strong>LOP:</strong> {fmtDays(selectedSlip.lop_days)}
                </span>
                <span className="text-nowrap"><strong>Week Off:</strong> {selectedSlip.week_off_days}</span>
                <span className="text-nowrap"><strong>Holidays:</strong> {selectedSlip.holiday_days}</span>
                <span className="text-nowrap">
                  <strong>Regularized:</strong>{" "}
                  {selectedSlip.is_regularized
                    ? <Badge color="info" className="fs-11">Yes ({selectedSlip.regularized_days_count})</Badge>
                    : <Badge color="secondary" className="fs-11">No</Badge>}
                </span>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <p className="text-uppercase fw-bold text-success mb-2" style={{ fontSize:11 }}>Earnings</p>
                  <Table size="sm" bordered className="mb-0">
                    <tbody>
                      {(selectedSlip.earningsList || []).map((comp) => (
                        <tr key={comp.component_name}>
                          <td style={{ fontSize:12 }}>{comp.component_name}</td>
                          <td className="text-end" style={{ fontSize:12 }}>
                            &#8377;{fmt(comp.final_amount, allowDecimal)}
                          </td>
                        </tr>
                      ))}
                      <tr className="table-success fw-bold">
                        <td style={{ fontSize:12 }}>Gross Earnings</td>
                        <td className="text-end" style={{ fontSize:12 }}>
                          &#8377;{fmt(getGross(selectedSlip), allowDecimal)}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <p className="text-uppercase fw-bold text-danger mb-2" style={{ fontSize:11 }}>Deductions</p>
                  <Table size="sm" bordered className="mb-0">
                    <tbody>
                      {(selectedSlip.deductionsList || []).map((comp) => (
                        <tr key={comp.component_name}>
                          <td style={{ fontSize:12 }}>{comp.component_name}</td>
                          <td className="text-end text-danger" style={{ fontSize:12 }}>
                            &#8377;{fmt(comp.final_amount, allowDecimal)}
                          </td>
                        </tr>
                      ))}
                      <tr className="table-danger fw-bold">
                        <td style={{ fontSize:12 }}>Total Deductions</td>
                        <td className="text-end text-danger" style={{ fontSize:12 }}>
                          &#8377;{fmt(selectedSlip.total_deductions, allowDecimal)}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <div className="mt-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 fw-bold text-uppercase" style={{ fontSize:12 }}>Net Take-Home Pay</h6>
                  {selectedSlip.net_pay_in_words && (
                    <p className="mb-0 text-muted" style={{ fontSize:10 }}>{selectedSlip.net_pay_in_words}</p>
                  )}
                </div>
                <h5 className={`mb-0 fw-bold ${parseFloat(selectedSlip.net_pay) < 0 ? "text-danger" : "text-success"}`}>
                  &#8377;{fmt(selectedSlip.net_pay, allowDecimal)}
                </h5>
              </div>

              {parseFloat(selectedSlip.pf_employer || 0) > 0 && (
                <div className="mt-2 px-3 py-2 border rounded bg-light d-flex justify-content-between align-items-center">
                  <span className="text-muted" style={{ fontSize:11 }}>
                    Employer PF Contribution <span className="text-muted">(not deducted from your salary)</span>
                  </span>
                  <span className="fw-medium" style={{ fontSize:11 }}>
                    &#8377;{fmt(selectedSlip.pf_employer, allowDecimal)}
                  </span>
                </div>
              )}

              {selectedSlip.bonus_notes && (
                <div className="mt-2 px-3 py-2 border-top bg-light rounded" style={{display: "flex", alignItems: "center"}}>
                  <p className="mb-0 text-muted" style={{ fontSize:11 }}>
                    <i className="ri-information-line me-1"></i>
                    {selectedSlip.bonus_notes}
                  </p>
                </div>
              )}

              {parseFloat(selectedSlip.lop_days) > 0 && (
                <div className="mt-2 p-2 rounded border border-warning border-opacity-25 bg-warning-subtle d-flex gap-2 align-items-center">
                  <i className="ri-error-warning-line text-warning mt-1"></i>
                  <p className="mb-0 text-warning-emphasis" style={{ fontSize:12 }}>
                    <strong>{selectedSlip.lop_days} LOP days</strong> were deducted this month.
                    {parseFloat(selectedSlip.pf_employee) > 0 && (
                      <> Statutory deductions (PF: &#8377;{fmt(selectedSlip.pf_employee)}) still apply.</>
                    )}
                  </p>
                </div>
              )}

              {selectedSlip.regularizationDetails && selectedSlip.regularizationDetails.length > 0 && (
                <div className="mt-2 p-2 rounded border border-info border-opacity-25 bg-info-subtle">
                  <p className="mb-2 fw-semibold text-info-emphasis" style={{ fontSize:12 }}>
                    <i className="ri-calendar-check-line me-1"></i>
                    Regularized Days ({selectedSlip.regularizationDetails.length})
                  </p>
                  {selectedSlip.regularizationDetails.map((r) => (
                    <div key={r.date} className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize:11 }}>
                      <span className="text-muted">{r.date}{r.remarks ? ` — ${r.remarks}` : ""}</span>
                      <Badge color={r.regularized_status === "paid" ? "success" : "danger"} className="fs-11">
                        {r.regularized_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="bg-light border-top">
            <div className="d-flex justify-content-between w-100 align-items-center">
              <Button data-testid="payslip-detail-footer-close-button" color="secondary" outline size="sm" onClick={handleCloseModal}>Close</Button>
              <Button
                data-testid="payslip-detail-download-button"
                color="success" size="sm" onClick={handleDownloadPDF}
                disabled={downloading} style={{ minWidth:165 }}
              >
                {downloading ? (
                  <><Spinner size="sm" className="me-2" />Generating PDF...</>
                ) : (
                  <><i className="ri-download-2-line align-middle me-1"></i>Download Payslip</>
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