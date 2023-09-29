import React from 'react'
import { MetaTitle } from '../../common/data/MetaTitle';
import { useState } from 'react';
import { useMemo } from 'react';
import InfoTable from '../../component/common/table/InfoTable';

const Roles = () => {

    document.title = `Role | ${MetaTitle}` ;

    const [roledata, setRoleData] = useState([
        { id: 1, description : "", name: "Admin", status: 1, total_employees : 5, total_permissions : 100 },
        { id: 2, description : "", name: "Manager", status: 1, total_employees : 12, total_permissions : 90 },
        { id: 3, description : "", name: "Team Lead", status: 1, total_employees : 22, total_permissions : 50 },
        { id: 4, description : "", name: "Developer", status: 1, total_employees : 57, total_permissions : 30 },
        { id: 5, description : "", name: "Junior Developer", status: 2, total_employees : 25, total_permissions : 10 },
        { id: 6, description : "", name: "Content Writer", status: 2, total_employees : 25, total_permissions : 10 },
    ]);

    const additionalColumn = [
        {
            Header: "Name",
            accessor: "name",
            filterable: false,
            id:"name"
        },
        {
            Header: "Employees",
            accessor: "total_employees",
            filterable: false,
            id:"total_employees"
        },
        {
            Header: "Permissions",
            accessor: "total_permissions",
            filterable: false,
            id:"total_permissions"
        },
        {
            Header: "Status",
            id : 'status',
            filterable: false,
            accessor: (obj) => {
                let status = obj.status === 1 ? "Primary" : "Secondary";
                let statusClass = obj.status === 1 ? "success" :  "info"
                return (
                    <span className={`badge text-uppercase bg-${statusClass}-subtle text-${statusClass}`}> {status} </span>
                )
            }
        }
    ]

    const initialFormObj = useMemo(() =>{
        return {
            id : 0,
            name : "",
            total_employees : 0,
            total_permissions : 0,
            status : 1,
            description : "",
        }
    },[]);


    const filterKey = 'status';
    const filterOptions = [
        {option : "1", label : "Primary"},
        {option : "2", label : "Secondary"}
    ]
    

    return (
        <React.Fragment>
            <InfoTable 
                additionalColumn={additionalColumn} 
                tabledata={roledata} 
                formname={'role'} 
                initialFormObj={initialFormObj}
                filterKey={filterKey}  
                filterOptions={filterOptions}  
            />
        </React.Fragment>
    );
}

export default Roles;
