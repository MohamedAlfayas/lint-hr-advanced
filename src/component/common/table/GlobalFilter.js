import React, { useState } from 'react';
import {
    Col,
    Row,
    Button,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownItem,
    DropdownMenu,
} from "reactstrap";
import { Link } from "react-router-dom";
import Flatpickr from "react-flatpickr";
import Select from "react-select";



const OrderGlobalFilter = () => {
    const [orderStatus, setorderStatus] = useState([]);
    const [orderPayement, setorderPayement] = useState(null);

    function handleorderStatus(orderstatus) {
        setorderStatus(orderstatus);
    }

    function handleorderPayement(orderPayement) {
        setorderPayement(orderPayement);
    }

    const orderstatus = [
        {
            options: [
                { label: "Status", value: "Status" },
                { label: "All", value: "All" },
                { label: "Pending", value: "Pending" },
                { label: "Inprogress", value: "Inprogress" },
                { label: "Cancelled", value: "Cancelled" },
                { label: "Pickups", value: "Pickups" },
                { label: "Returns", value: "Returns" },
                { label: "Delivered", value: "Delivered" },
            ],
        },
    ];

    const orderpayement = [
        {
            options: [
                { label: "Select Payment", value: "Select Payment" },
                { label: "All", value: "All" },
                { label: "Mastercard", value: "Mastercard" },
                { label: "Paypal", value: "Paypal" },
                { label: "Visa", value: "Visa" },
                { label: "COD", value: "COD" },
            ],
        },
    ];
    return (
        <React.Fragment>

            <Col sm={2} className="col-xxl-2">
                <div>
                    <Select
                        value={orderStatus}
                        onChange={(e) => {
                            handleorderStatus(e);
                        }}
                        options={orderstatus}
                        name="choices-single-default"
                        id="idStatus"
                    ></Select>
                </div>
            </Col>

            <Col sm={2} className="col-xxl-2">
                <div>
                    <Select
                        value={orderPayement}
                        onChange={() => {
                            handleorderPayement();
                        }}
                        options={orderpayement}
                        name="choices-payment-default"
                        id="idPayment"
                    ></Select>
                </div>
            </Col>

            <Col sm={2} className="col-xxl-1">
                <div>
                    <button type="button" className="btn btn-primary w-100">
                        {" "}
                        <i className="ri-equalizer-fill me-1 align-bottom"></i>
                        Filters
                    </button>
                </div>
            </Col>
        </React.Fragment>
    );
};

export default OrderGlobalFilter;
