import { toast } from "react-toastify";

export const ExportCSV = (data, export_file_name) => {
    try {
        const csvDataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(
            data
        )}`;
        const link = document.createElement("a");
        link.href = csvDataUri;
        link.download = `${export_file_name}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    catch (err) {
        toast.error('Something Went Wrong')
    }
}