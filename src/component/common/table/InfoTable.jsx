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
    Label,
    Modal,
    ModalHeader,
    Form,
    ModalBody,
    Input,
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
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

const InfoTable = ({ additionalColumn, tabledata, formname, initialFormObj, filterKey, filterOptions, width_per }) => {

    console.log("Page Refreshing !!!!", tabledata);

    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState(1);
    const [dataList, setDataList] = useState([]);
    const [isExportCSV, setIsExportCSV] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalMulti, setDeleteModalMulti] = useState(false);
    const [modal, setModal] = useState(false);
    const [modal_list, setmodal_list] = useState(false);
    const tog_list = () => {
        setmodal_list(!modal_list);
    };
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(new Date(currentYear, 0, 1));


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
        console.log("Tab = ",tab,"    type = ",type);
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
            console.log("Datalist = ", tabledata);
            setDataList(tabledata);
        }
        if (!tabledata?.length) {
            setDataList([])
        }
    }, [tabledata]);


    const handleDataClicks = () => {
        setData("");
    };



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
    const toggle = useCallback(() => {
        if (modal) {
            setModal(false);
            setOrder(null);
        } else {
            setModal(true);
            setDate(defaultdate());
        }
    }, [modal]);

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
                                        <h5 className="card-title mb-0">{formname.charAt(0).toUpperCase() + formname.slice(1)}</h5>

                                        <Datetime
                                            value={selectedYear}
                                            onChange={(date) => {
                                                if (date.isValid()) {
                                                    const year = date.year();
                                                    setSelectedYear(new Date(year, 0, 1));
                                                } else {
                                                    setSelectedYear(null);
                                                }
                                            }}
                                            dateFormat="YYYY"
                                            timeFormat={false}
                                            viewMode="years"
                                        />

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
                                                        { active: activeTab === String(idx + 2) },
                                                        "fw-semibold"
                                                    )}
                                                    onClick={() => {
                                                        toggleTab(String(idx + 2), obj.option);
                                                    }}
                                                    href="#"
                                                >
                                                    <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                                                    {obj.label}
                                                </NavLink>
                                            </NavItem>
                                        ))}
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
                                    ) : (
                                        <React.Fragment>
                                            <div className='text-center'>
                                                <h2>No Data</h2>
                                            </div>
                                        </React.Fragment>
                                    )
                                    }
                                </div>
                                <Modal id="showModal" isOpen={modal} toggle={toggle} centered>
                                    <ModalHeader className="bg-light p-3" toggle={toggle}>
                                        {/* {!!isEdit ? "Edit Order" : "Add Order"} */}
                                    </ModalHeader>
                                    <Form className="tablelist-form" onSubmit={(e) => {
                                        e.preventDefault();
                                        // validation.handleSubmit();
                                        return false;
                                    }}>
                                        <ModalBody>
                                            <input type="hidden" id="id-field" />

                                            <div className="mb-3">
                                                <Label
                                                    htmlFor="id-field"
                                                    className="form-label"
                                                >
                                                    Order Id
                                                </Label>
                                                <Input
                                                    name="orderId"
                                                    id="id-field"
                                                    className="form-control"
                                                    placeholder="Enter Order Id"
                                                    type="text"
                                                // validate={{
                                                //     required: { value: true },
                                                // }}
                                                // onChange={validation.handleChange}
                                                // onBlur={validation.handleBlur}
                                                // value={validation.values.orderId || ""}
                                                // invalid={
                                                //     validation.touched.orderId && validation.errors.orderId ? true : false
                                                // }
                                                />
                                                {/* {validation.touched.orderId && validation.errors.orderId ? (
                                                    <FormFeedback type="invalid">{validation.errors.orderId}</FormFeedback>
                                                ) : null} */}

                                            </div>

                                            <div className="mb-3">
                                                <Label
                                                    htmlFor="customername-field"
                                                    className="form-label"
                                                >
                                                    Customer Name
                                                </Label>
                                                <Input
                                                    name="customer"
                                                    id="customername-field"
                                                    className="form-control"
                                                    placeholder="Enter Name"
                                                    type="text"
                                                // validate={{
                                                //     required: { value: true },
                                                // }}
                                                // onChange={validation.handleChange}
                                                // onBlur={validation.handleBlur}
                                                // value={validation.values.customer || ""}
                                                // invalid={
                                                //     validation.touched.customer && validation.errors.customer ? true : false
                                                // }
                                                />
                                                {/* {validation.touched.customer && validation.errors.customer ? (
                                                    <FormFeedback type="invalid">{validation.errors.customer}</FormFeedback>
                                                ) : null} */}

                                            </div>

                                            <div className="mb-3">
                                                <Label
                                                    htmlFor="productname-field"
                                                    className="form-label"
                                                >
                                                    Product
                                                </Label>

                                                <Input
                                                    name="product"
                                                    type="select"
                                                    className="form-select"
                                                    // onChange={validation.handleChange}
                                                    // onBlur={validation.handleBlur}
                                                    // value={
                                                    //     validation.values.product || ""
                                                    // }
                                                    required>
                                                    {/* {productname.map((item, key) => (
                                                        <React.Fragment key={key}>
                                                            {item.options.map((item, key) => (<option value={item.value} key={key}>{item.label}</option>))}
                                                        </React.Fragment>
                                                    ))} */}
                                                </Input>
                                                {/* {validation.touched.product &&
                                                    validation.errors.product ? (
                                                    <FormFeedback type="invalid">
                                                        {validation.errors.product}
                                                    </FormFeedback>
                                                ) : null} */}
                                            </div>

                                            <div className="mb-3">
                                                <Label htmlFor="date-field" className="form-label">
                                                    Order Date
                                                </Label>
                                                {/* 
                                                <Flatpickr
                                                    name="orderDate"
                                                    className="form-control"
                                                    id="datepicker-publish-input"
                                                    placeholder="Select a date"
                                                    options={{
                                                        enableTime: true,
                                                        altInput: true,
                                                        altFormat: "d M, Y, G:i K",
                                                        dateFormat: "d M, Y, G:i K",
                                                    }}
                                                    onChange={(e) =>
                                                        dateformate(e)
                                                    }
                                                    value={validation.values.orderDate || ""}
                                                /> */}

                                                {/* {validation.touched.orderDate && validation.errors.orderDate ? (
                                                    <FormFeedback type="invalid">{validation.errors.orderDate}</FormFeedback>
                                                ) : null} */}
                                            </div>
                                            <div className="row gy-4 mb-3">
                                                <div className="col-md-6">
                                                    <div>
                                                        <Label
                                                            htmlFor="amount-field"
                                                            className="form-label"
                                                        >
                                                            Amount
                                                        </Label>
                                                        <Input
                                                            name="amount"
                                                            type="text"
                                                        // onChange={validation.handleChange}
                                                        // onBlur={validation.handleBlur}
                                                        // value={validation.values.amount || ""}
                                                        // invalid={
                                                        //     validation.touched.amount && validation.errors.amount ? true : false
                                                        // }
                                                        />
                                                        {/* {validation.touched.amount && validation.errors.amount ? (
                                                            <FormFeedback type="invalid">{validation.errors.amount}</FormFeedback>
                                                        ) : null} */}

                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div>
                                                        <Label
                                                            htmlFor="payment-field"
                                                            className="form-label"
                                                        >
                                                            Payment Method
                                                        </Label>

                                                        <Input
                                                            name="payment"
                                                            type="select"
                                                            className="form-select"
                                                        // onChange={validation.handleChange}
                                                        // onBlur={validation.handleBlur}
                                                        // value={
                                                        //     validation.values.payment || ""
                                                        // }
                                                        >
                                                            {/* {orderpayement.map((item, key) => (
                                                                <React.Fragment key={key}>
                                                                    {item.options.map((item, key) => (<option value={item.value} key={key}>{item.label}</option>))}
                                                                </React.Fragment>
                                                            ))} */}
                                                        </Input>
                                                        {/* {validation.touched.payment &&
                                                            validation.errors.payment ? (
                                                            <FormFeedback type="invalid">
                                                                {validation.errors.payment}
                                                            </FormFeedback>
                                                        ) : null} */}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <Label
                                                    htmlFor="delivered-status"
                                                    className="form-label"
                                                >
                                                    Delivery Status
                                                </Label>

                                                <Input
                                                    name="status"
                                                    type="select"
                                                    className="form-select"
                                                // onChange={validation.handleChange}
                                                // onBlur={validation.handleBlur}
                                                // value={
                                                //     validation.values.status || ""
                                                // }
                                                >
                                                    {/* {orderstatus.map((item, key) => (
                                                        <React.Fragment key={key}>
                                                            {item.options.map((item, key) => (<option value={item.value} key={key}>{item.label}</option>))}
                                                        </React.Fragment>
                                                    ))} */}
                                                </Input>
                                                {/* {validation.touched.status &&
                                                    validation.errors.status ? (
                                                    <FormFeedback type="invalid">
                                                        {validation.errors.status}
                                                    </FormFeedback>
                                                ) : null} */}

                                            </div>
                                        </ModalBody>
                                        <div className="modal-footer">
                                            <div className="hstack gap-2 justify-content-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-light"
                                                    onClick={() => {
                                                        setModal(false);
                                                    }}
                                                >
                                                    Close
                                                </button>

                                                {/* <button type="submit" className="btn btn-success">
                                                    {!!isEdit
                                                        ? "Update"
                                                        : "Add Customer"}
                                                </button> */}
                                            </div>
                                        </div>
                                    </Form>
                                </Modal>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default InfoTable
