import React, { useState, useCallback } from 'react';
import { Badge, Col, Container, Row } from "reactstrap";
import { useDropzone } from 'react-dropzone';
// import 'react-dropzone-uploader/dist/styles.css';
import * as XLSX from "xlsx";
import '../../common/css/lc_style.css'
const Xlsx = () => {
  const [data, setData] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parseData = XLSX.utils.sheet_to_json(sheet);
        setData(parseData);
        console.log('Parsed Data:', parseData);
      };
      reader.readAsBinaryString(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.xlsx, .xls',
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
            (.CSV,.XLSX formats supported; max file size 5MB)
          </div>

          {data.length > 0 && (
            <table className="table-lc" >
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
  )
}

export default Xlsx;