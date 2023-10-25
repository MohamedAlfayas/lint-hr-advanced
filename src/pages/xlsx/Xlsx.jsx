import React, { useState } from 'react';
import { Badge, Col, Container, Row } from "reactstrap";
import * as XLSX from "xlsx";
const Xlsx = () => {
    const [data,setData]=useState([]);

  const handleFileUpload = (e)=>{
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload =(e) =>{
        const data = e.target.result;
        const workbook = XLSX.read(data,{type:"binary"});
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parseData = XLSX.utils.sheet_to_json(sheet);
        setData(parseData);
        console.log("Parsed Data:", parseData);
    }
  }

  return (
    <React.Fragment>
         <div className="page-content">
        <Container fluid>
    
    
    
    <input
    type="file"
    accept=".xlsx,.xls"
    onChange={handleFileUpload}
    />
    {data.length > 0 && (
        <table className="table">
            <thead>
                <tr>
                    {Object.keys(data[0]).map((key)=>(
                        <th key={key}>{key}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, index)=>(
                    <tr key={index}>
                        {Object.values(row).map((value,index)=>(
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