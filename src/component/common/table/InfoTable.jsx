import React from 'react'
import { useState } from 'react';

import {
    Card,
    CardBody,
    Col,
    Container,
    CardHeader,
    Nav,
    NavItem,
    NavLink,
    Row,
} from "reactstrap";

import TableContainer from "../../../component/common/table/TableContainer"
import DeleteModal from "../../../component/common/modal/DeleteModal";
import Loader from "../../../component/common/loader/Loader";
import ExportCSV from "../../../component/common/export/ExportCSV"
import { useEffect } from 'react';
import { useCallback } from 'react';


import classnames from "classnames";
import { isEmpty } from "lodash";
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { setComponentToShow, setFormObj, setFormTitle, setFormWidthPercentage, toggleRSBView } from '../../../redux/reducers/ChildReducer/RightSideBarReducer';
import { useDispatch } from 'react-redux';

const InfoTable = ({ additionalColumn, tabledata, formname, initialFormObj, filterKey, filterOptions, width_per }) => {
    
    console.log("Page Refreshing !!!!");

    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState(1);
    const [dataList, setDataList] = useState([]);
    const [isExportCSV, setIsExportCSV] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalMulti, setDeleteModalMulti] = useState(false);


    // Checked All
    const checkedAll = useCallback(() => {
        const checkall = document.getElementById("checkBoxAll");
        const ele = document.querySelectorAll(".dataCheckBox");
        if (checkall.checked) {
            ele.forEach((ele) => {
                ele.checked = true;
            });
        } else {
            ele.forEach((ele) => {
                ele.checked = false;
            });
        }
        deleteCheckbox();
    }, []);


    // Column
    const columns = useMemo(() => [
        {
            Header: <input type="checkbox" id="checkBoxAll" className="form-check-input" onClick={() => checkedAll()} />,
            Cell: (cellProps) => {
                return <input type="checkbox" className="dataCheckBox form-check-input" id={`checkbox-${cellProps.row.original.id}`} value={cellProps.row.original.id} onClick={() => { deleteCheckbox(`checkbox-${cellProps.row.original.id}`); }} />;
            },
            id: '#',
        },
        {
            Header: "Action",
            Cell: (cellProps) => {
                return (
                    <ul className="list-inline hstack gap-2 mb-0">
                        <li className="list-inline-item">
                            <Link
                                to="#"
                                className="text-primary d-inline-block"
                            >
                                <i className="ri-eye-fill fs-16"></i>
                            </Link>
                        </li>
                        <li className="list-inline-item edit">
                            <Link
                                to="javascript:void(0)"
                                className="text-primary d-inline-block edit-item-btn"
                                onClick={() => {
                                    const orderData = cellProps.row.original;
                                    handleCreateAndUpdate(orderData.id, orderData);
                                }}
                            >
                                <i className="ri-pencil-fill fs-16"></i>
                            </Link>
                        </li>
                        <li className="list-inline-item">
                            <Link
                                to="#"
                                className="text-danger d-inline-block remove-item-btn"
                                onClick={() => {
                                    const orderData = cellProps.row.original;
                                    onClickDelete(orderData);
                                }}
                            >
                                <i className="ri-delete-bin-5-fill fs-16"></i>
                            </Link>
                        </li>
                    </ul>
                );
            },
        },
    ], []);    

    useEffect(() => {
        columns.splice(1, 0, ...additionalColumn)
    }, [])


    const toggleTab = (tab, type) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            let filteredDatas = [...tabledata];
            if (type !== "all") {
                filteredDatas = [...tabledata].filter((data) => data[filterKey] == type);
            }
            setDataList(filteredDatas);
        }
    };

    useEffect(() => {
        if (tabledata.length) {
            console.log("Datalist = ",tabledata);
            setDataList(tabledata);
        }
    }, [tabledata]);


    const handleDataClicks = () => {
        setData("");
    };


    const handleDataClick = (data) => {
        console.log("Edit DAta = ", data);
    }


    // Delete Multiple
    const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState([]);
    const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

    const deleteMultiple = () => {
        const checkall = document.getElementById("checkBoxAll");
        selectedCheckBoxDelete.forEach((element) => {
            setTimeout(() => { toast.clearWaitingQueue(); }, 3000);
        });
        checkall.checked = false;
        setIsMultiDeleteButton(false);
    };

    const deleteCheckbox = (id) => {
        console.log("CB clicked");
        const ele = document.querySelectorAll(".dataCheckBox:checked");
        ele.length > 0 ? setIsMultiDeleteButton(true) : setIsMultiDeleteButton(false);
        setSelectedCheckBoxDelete(ele);
    };


    const handleDeleteData = (data) => {
        console.log(data);
    }



    // CUSTOM FORM

    const handleCreateAndUpdate = ($id, obj) => {
        console.log($id);
        const FormObj = $id === 0 ? initialFormObj : obj;

        dispatch(setFormTitle(formname.charAt(0).toUpperCase() + formname.slice(1)));
        dispatch(setFormObj(FormObj));
        dispatch(setFormWidthPercentage(width_per));
        dispatch(setComponentToShow(formname));
        dispatch(toggleRSBView(true));
    };


    return (
        <div className="page-content">
            <ExportCSV
                show={isExportCSV}
                onCloseClick={() => setIsExportCSV(false)}
                data={dataList}
            />
            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDeleteData}
                onCloseClick={() => setDeleteModal(false)}
            />
            <DeleteModal
                show={deleteModalMulti}
                onDeleteClick={() => {
                    deleteMultiple();
                    setDeleteModalMulti(false);
                }}
                onCloseClick={() => setDeleteModalMulti(false)}
            />
            <Container fluid>

                <Row>
                    <Col lg={12}>
                        <Card id="dataList">
                            <CardHeader className="bdata-0">
                                <Row className="align-items-center gy-3">
                                    <div className="col-sm">
                                        <h5 className="card-title mb-0">Data History</h5>
                                    </div>
                                    <div className="col-sm-auto">
                                        <div className="d-flex gap-1 flex-wrap">
                                            <button
                                                type="button"
                                                className="btn btn-success add-btn"
                                                id="create-btn"
                                                onClick={() => { handleCreateAndUpdate(0); }}
                                            >
                                                <i className="ri-add-line align-bottom me-1"></i> Create {formname.charAt(0).toUpperCase() + formname.slice(1)}
                                            </button>{" "}
                                            <button type="button" className="btn btn-info" onClick={() => setIsExportCSV(true)}>
                                                <i className="ri-file-download-line align-bottom me-1"></i>{" "}
                                                Export
                                            </button>
                                            {" "}
                                            {isMultiDeleteButton && <button className="btn btn-soft-danger"
                                                onClick={() => setDeleteModalMulti(true)}
                                            ><i
                                                className="ri-delete-bin-2-line"></i></button>}
                                        </div>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody className="pt-0">
                                <div>
                                    <Nav
                                        className="nav-tabs nav-tabs-custom nav-success"
                                        role="tablist">
                                        <NavItem>
                                            <NavLink
                                                className={classnames(
                                                    { active: activeTab === 1 },
                                                    "fw-semibold"
                                                )}
                                                onClick={() => {
                                                    toggleTab(1, "all");
                                                }}
                                                href="#"
                                            >
                                                <i className="ri-store-2-fill me-1 align-bottom"></i>{" "}
                                                All Datas
                                            </NavLink>
                                        </NavItem>
                                        {!!filterOptions && filterOptions.map((obj, idx) => (
                                            <NavItem>
                                                <NavLink
                                                    className={classnames(
                                                        { active: activeTab === String(idx+2) },
                                                        "fw-semibold"
                                                    )}
                                                    onClick={() => {
                                                        toggleTab(String(idx+2), obj.option);
                                                    }}
                                                    href="#"
                                                >
                                                    <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                                                    {obj.label}
                                                </NavLink>
                                            </NavItem>
                                        ))}
                                        {/* <NavItem>
                                            <NavLink
                                                className={classnames(
                                                    { active: activeTab === "2" },
                                                    "fw-semibold"
                                                )}
                                                onClick={() => {
                                                    toggleTab("2", "1");
                                                }}
                                                href="#"
                                            >
                                                <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                                                Active
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                className={classnames(
                                                    { active: activeTab === "3" },
                                                    "fw-semibold"
                                                )}
                                                onClick={() => {
                                                    toggleTab("3", "2");
                                                }}
                                                href="#"
                                            >
                                                <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                                                Inactive
                                            </NavLink>
                                        </NavItem> */}
                                    </Nav>
                                    {dataList.length ? (
                                        <TableContainer
                                            columns={columns}
                                            data={(dataList || [])}
                                            isGlobalFilter={true}
                                            isAddUserList={false}
                                            customPageSize={15}
                                            divClass="table-responsive table-card mb-1"
                                            tableClass="align-middle table-nowrap"
                                            theadClass="table-light text-muted"
                                            handleDataClick={handleDataClicks}
                                            isDataFilter={true}
                                            SearchPlaceholder='Search for data ID, customer, data status or something...'
                                        />
                                    ) : (<Loader error={null} />)
                                    }
                                </div>
                                <ToastContainer closeButton={false} limit={1} />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default InfoTable
