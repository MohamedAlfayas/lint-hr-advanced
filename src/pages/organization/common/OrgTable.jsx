import React, { useMemo } from 'react'
import TableContainer from '../../../component/common/table/TableContainer'
import { Link } from 'react-router-dom';

const OrgTable = ({ teamMembersID }) => {

    const TeamData = [
        { id: "8", img : "../../../assets/images/users/avatar-1.jpg", name: "Fayaz", date: "07 Oct, 2021", total: "$24.05", status: "Paid" },
        { id: "7", img : "../../../assets/images/users/avatar-1.jpg", name: "Antony", date: "07 Oct, 2021", total: "$24.05", status: "Refund" },
        { id: "6", img : "../../../assets/images/users/avatar-1.jpg", name: "Tharun", date: "07 Oct, 2021", total: "$24.05", status: "Refund" },
        { id: "5", img : "../../../assets/images/users/avatar-1.jpg", name: "Kathir", date: "07 Oct, 2021", total: "$24.05", status: "Refund" },
        { id: "4", img : "../../../assets/images/users/avatar-1.jpg", name: "Thalavai", date: "07 Oct, 2021", total: "$24.05", status: "Paid" },
        { id: "3", img : "../../../assets/images/users/avatar-1.jpg", name: "Paul", date: "07 Oct, 2021", total: "$24.05", status: "Refund" },
        { id: "2", img : "../../../assets/images/users/avatar-1.jpg", name: "Elan", date: "07 Oct, 2021", total: "$24.05", status: "Paid" },
        { id: "1", img : "../../../assets/images/users/avatar-1.jpg", name: "Lintcloud", date: "07 Oct, 2021", total: "$24.05", status: "Paid" },
    ]

    const tableData = TeamData.filter(obj => teamMembersID.includes(parseInt(obj.id)))


    const columns = useMemo(() => {
        return [
            {
                Header: "ID",
                accessor: (cellProps) => {
                    return (
                        <Link to="#">{cellProps.id}</Link>
                    )
                },
                disableFilters: true,
                filterable: false,
            },

            {
                Header: "Name",
                accessor: "name",
                accessor: (cellProps) => {
                    const imgsrc = cellProps.id % 2 === 0 ? require("../../../assets/images/users/avatar-3.jpg") : require("../../../assets/images/users/avatar-8.jpg")
                    return (
                        <div style={{textAlign : 'left'}}>
                            
                            <img
                                src={imgsrc}
                                alt={cellProps.name}
                                title={cellProps.name}
                                className="rounded-circle avatar-xxs"
                            />
                            <span style={{marginLeft : '7px'}}>{cellProps.name}</span>
                        </div>
                    )
                },
                disableFilters: true,
                filterable: false,
            },
            {
                Header: "Date",
                accessor: "date",
                disableFilters: true,
                filterable: false,
            },
            {
                Header: "Total",
                accessor: "total",
                disableFilters: true,
                filterable: false,
            },
            {
                Header: "Status",
                disableFilters: true,
                filterable: true,
                accessor: (cellProps) => {
                    switch (cellProps.status) {
                        case "Paid":
                            return (<span className="badge bg-success-subtle text-success text-uppercase"> {cellProps.status}</span>)
                        case "Refund":
                            return (<span className="badge bg-warning-subtle  text-warning text-uppercase"> {cellProps.status}</span>)
                        default:
                            return (<span className="badge bg-danger-subtle  text-danger text-uppercase"> {cellProps.status}</span>)
                    }
                },
            },
            {
                Header: "Actions",
                disableFilters: true,
                filterable: true,
                accessor: (cellProps) => {
                    return (
                        <React.Fragment>
                            Details
                        </React.Fragment>
                    )
                },
            },
        ]
    }, []);

    return (
        <React.Fragment >
            <TableContainer
                columns={(columns || [])}
                data={(tableData || [])}
                isPagination={true}
                // isGlobalFilter={false}
                iscustomPageSize={false}
                isBordered={false}
                customPageSize={5}
                className="custom-header-css table align-middle table-nowrap"
                tableClassName="table-centered align-middle table-nowrap mb-0"
                theadClassName="text-muted table-light"
                SearchPlaceholder='Search Products...'
            />
        </React.Fragment >
    )
}

export default OrgTable
