import { toast } from "react-toastify";
import { Api } from "../api/Api";
import Papa from "papaparse";
import { export_sample_data_info } from "../constant/Constants";
import { ExportCSV } from "./ExportCSV";

export const ExportSampleData = (mod_name) => {

    let sample_data_info = export_sample_data_info.find(d => d.module_name === mod_name)
    let api_url = sample_data_info?.api_url
    let export_file_name = sample_data_info?.export_file_name

    try {
        Api({
            method: "GET",
            url: api_url,
        })
            .then((res) => {
                let jsonData = res?.data?.data;
                let csvData = Papa.unparse(jsonData);
                ExportCSV(csvData, export_file_name);
            })
            .catch((err) => {
                console.log("ERRR");
            });
    }
    catch (err) {
        console.log("ERRRR");
        toast.error('Something Went Wrong')
    }
}