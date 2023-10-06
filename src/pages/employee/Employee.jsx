import React, { useState } from "react";

import 'react-toastify/dist/ReactToastify.css';

import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import InfoTable from "../../component/common/table/InfoTable";
import { MetaTitle } from "../../common/data/MetaTitle";
import { useMemo } from "react";

const Employee = () => {


    const [empdata, setEmpData] = useState([
        { id: 1, name: "Elan", email: "elan@lintcloud.com", department: [9, 10], status: 1 },
        { id: 2, name: "Paul", email: "paul@lintcloud.com", department: [10], status: 1 },
        { id: 3, name: "Antony", email: "antony@lintcloud.com", department: [10], status: 1 },
        { id: 4, name: "Fayaz", email: "fayaz@lintcloud.com", department: [12], status: 1 },
        { id: 5, name: "Thalavai", email: "thalavai@lintcloud.com", department: [11], status: 2 },
        { id: 6, name: "Kathir", email: "kathir@lintcloud.com", department: [15], status: 1 },
        { id: 7, name: "Vinish", email: "vinish@lintcloud.com", department: [10], status: 2 },
        { id: 8, name: "Tharun", email: "tharun@lintcloud.com", department: [15], status: 2 },
        { id: 9, name: "Arun", email: "arun@lintcloud.com", department: [15], status: 2 },
        { id: 10, name: "Dinesh", email: "dinesh@lintcloud.com", department: [11], status: 2 },
    ])



    // Column
    const additionalColumn = [
        {
            Header: "Name",
            accessor: "name",
            filterable: false,
            id: "name"
        },
        {
            Header: "Email",
            accessor: "email",
            filterable: false,
            id: "email"
        },
        {
            Header: "Department",
            id: "department",
            filterable: false,
            accessor: (obj) => {
                const DepartmentData = GetLocalStorageData('department');
                let thisDepartment = DepartmentData ? DepartmentData.filter(data => (obj.department).includes(data.id)) : []
                console.log("Name = ", thisDepartment);
                return (
                    <>
                        {thisDepartment.map(d => (
                            <React.Fragment>
                                {d.name}
                            </React.Fragment>
                        ))}
                    </>
                )
            }
        },
        {
            Header: "Status",
            id: 'status',
            filterable: false,
            accessor: (obj) => {
                let status = obj.status === 1 ? "Active" : "Inactive";
                let statusClass = obj.status === 1 ? "success" : "warning"
                return (
                    <span className={`badge text-uppercase bg-${statusClass}-subtle text-${statusClass}`}> {status} </span>
                )
            }
        }
    ]

    const initialFormObj = useMemo(() => {
        return {
            id: 0,
            fname: "",
            lname: "",
            dob: "",
            gender: "Male",
            primary_department: 1,
            sub_department: [2,3],
            role: 0,
            work_schedule: 0,
            profile_timezone: "Asia/Kolkata",
            is_active: true,
            profile: [] 
        }
    }, []);

    const filterKey = 'status';
    const filterOptions = [
        { option: "1", label: "Active" },
        { option: "2", label: "Inactive" }
    ]

    document.title = `Employee | ${MetaTitle}`;
    return (
        <React.Fragment>
            <InfoTable
                additionalColumn={additionalColumn}
                tabledata={empdata}
                formname={'employee'}
                initialFormObj={initialFormObj}
                filterKey={filterKey}
                filterOptions={filterOptions}
                width_per={"40%"}
            />
        </React.Fragment>
    );
};

export default Employee;


