// ../../common/js/ExportSampleData.js
import * as XLSX from "xlsx";
import { employee_component_name } from "../constant/Constants";
import { employeeSampleData } from "./employeeSampleData";

export const ExportSampleData = (component_to_show) => {
  let rows = [];
  let fileName = "SampleData.xlsx";

  if (component_to_show === employee_component_name) {
    rows = employeeSampleData;
    fileName = "Bulk_Employee_Sample.xlsx";
  } else {
    // add other modules here later; bail out if unsupported
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName); // triggers the download
};
