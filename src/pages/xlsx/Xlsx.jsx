import React, { useState, useCallback } from 'react';
import { Badge, Col, Container, Row } from "reactstrap";
import { useDropzone } from 'react-dropzone';
// import 'react-dropzone-uploader/dist/styles.css';
import * as XLSX from "xlsx";
import '../../common/css/lc_style.css'
import Papa from 'papaparse';
const Xlsx = () => {
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];

    if (!file) {
      setErrorMessage('Please upload a file.');
      return;
    }

    const isXlsxOrXls = /\.(xlsx|xls)$/i.test(file.name);
    const isCsv = /\.csv$/i.test(file.name);

    if (!(isXlsxOrXls || isCsv)) {
      setErrorMessage('Invalid file format. Please upload a .xlsx, .xls, or .csv file.');
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      setErrorMessage('File size exceeds the limit of 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target.result;

      if (isXlsxOrXls) {
        const workbook = XLSX.read(fileData, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);

        setData(parsedData);
      } else if (isCsv) {
        Papa.parse(file, {
          complete: (result) => {
            setData(result.data);
          },
          header: true,
        });
      }

      setErrorMessage('');
    };

    if (isXlsxOrXls) {
      reader.readAsBinaryString(file);
    } else if (isCsv) {
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.xlsx, .xls, .csv',
    onDrop,
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container>
          <div {...getRootProps()} className="container" style={{ textAlign: 'center' }}>
            <input {...getInputProps()} />
            <div className="mb-3">
              <i className="display-4 text-muted ri-upload-cloud-2-fill" />
            </div>
            <h4>Drop or upload your file here</h4>
            (.XLSX, .XLS, and .CSV formats supported; max file size 5MB)
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          </div>

          {data.length > 0 && (
            <table className="table-lc">
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, index) => (
                      <td key={index}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};



export default Xlsx;