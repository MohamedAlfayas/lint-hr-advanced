import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    Input,
    Label,
    Row,
    UncontrolledDropdown,
    Table,
} from "reactstrap";


const salaryPloiciesForm = () => {
    const { form_obj } = useSelector((state) => state.RightSideBarReducer);
    const [customFieldObj, setCustomFieldObj] = useState(form_obj);
    console.log("fghj", form_obj);
    const [showTable, setShowTable] = useState(false);



    const contributionOptions = useMemo(
        () => [
            { id: "1", label: "ESI", value: "ESI" },
            { id: "2", label: "EPF", value: "EPF" },
        ],
        []
    );
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomFieldObj({
            ...customFieldObj,
            [name]: value,
        });
    };
    const handleSelectEarning = () => {
        setShowTable(!showTable);
    }
    useEffect(() => {
        setCustomFieldObj(form_obj);
    }, [form_obj]);

    return (
        <React.Fragment>
            <Row>
                <Col md={12} lg={12} xxl={12} className="folder-card" key={1}>
                    <Form action="javascript:void(0)">

                        <Col md={12} lg={12} xxl={12}>
                            <div className="mb-3">
                                <Label htmlFor="tax_state" className="form-label">
                                    Name
                                </Label>
                                <div className="form-icon right">
                                    <Input
                                        type="text"
                                        name="name"
                                        id="name"
                                        className="form-control"
                                        placeholder="Name"
                                        value={customFieldObj.name || ""}
                                        onChange={handleInputChange}

                                    />
                                    <div id="passwordHelpBlock" className="form-text mb-3">
                                        Enter Name
                                    </div>
                                    <Col md={12} lg={12} xxl={12}>
                                        <div className="mb-3">
                                            <Label className="form-label" htmlFor="ws_desc">
                                                Description
                                            </Label>
                                            <Input
                                                type="textarea"
                                                className="form-control"
                                                id="earn_desc"
                                                value={customFieldObj.desc || ""}
                                                onChange={(e) =>
                                                    setCustomFieldObj({
                                                        ...customFieldObj,
                                                        desc: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </Col>
                                    <div className="mb-3">
                                        <Label htmlFor="tax_state" className="form-label">
                                            Earnings
                                        </Label>
                                        <div className="form-icon right">
                                            <Button color="primary"
                                                onClick={handleSelectEarning}
                                            >
                                                <i className="ri-add-line align-bottom me-1"></i>
                                                Select Components
                                            </Button>{' '}
                                            {showTable && (
                                                <div>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Components</th>
                                                                <th>Calculation Type</th>
                                                                {/* Add more columns as needed */}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>Data 1</td>
                                                                <td>Data 2</td>
                                                                {/* Add more data rows as needed */}
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Cancel icon */}
                                                    <button onClick={handleSelectEarning}>Cancel</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <Label htmlFor="tax_state" className="form-label">
                                            Allowences
                                        </Label>
                                        <div className="form-icon right">
                                            <Button color="primary"
                                                onClick={handleSelectEarning}
                                            >
                                                <i className="ri-add-line align-bottom me-1"></i>
                                                Select Components
                                            </Button>{' '}
                                            {showTable && (
                                                <div>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Components</th>
                                                                <th>Calculation Type</th>
                                                                {/* Add more columns as needed */}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>Data 1</td>
                                                                <td>Data 2</td>
                                                                {/* Add more data rows as needed */}
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Cancel icon */}
                                                    <button onClick={handleSelectEarning}>Cancel</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <Label htmlFor="tax_state" className="form-label">
                                            Deductions
                                        </Label>
                                        <div className="form-icon right">
                                            <Button color="primary"
                                                onClick={handleSelectEarning}
                                            >
                                                <i className="ri-add-line align-bottom me-1"></i>
                                                Select Components
                                            </Button>{' '}
                                            {showTable && (
                                                <div>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Components</th>
                                                                <th>Calculation Type</th>
                                                                {/* Add more columns as needed */}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>Data 1</td>
                                                                <td>Data 2</td>
                                                                <button onClick={handleSelectEarning}>Cancel</button>
                                                                {/* Add more data rows as needed */}
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Cancel icon */}

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <Label htmlFor="tax_state" className="form-label">
                                            Compliances
                                        </Label>
                                        <div className="">
                                            <div className="form-check form-check-inline">
                                                <Input
                                                    id="p-tax"
                                                    name="Unit"
                                                    type="checkbox"
                                                    className="form-check-input"

                                                    required
                                                />
                                                <Label className="form-check-label" htmlFor="lt_day">
                                                   Profession Tax
                                                </Label>
                                            </div>
                                        </div>
                                        <div className="">
                                            <div className="form-check form-check-inline">
                                                <Input
                                                    id="p-fund"
                                                    name="Unit"
                                                    type="checkbox"
                                                    className="form-check-input"

                                                    required
                                                />
                                                <Label className="form-check-label" htmlFor="lt_day">
                                                   Labour Welfare Fund
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </Col>
                        
                        <Col lg={12}>
                            
                            <div className="text-end">
                            <Button type="submit" color="success" className="btn-label">
                                    {" "}
                                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                                    create{" "}
                                </Button>{" "}
                                <Button type="submit" color="success" className="btn-label">
                                    {" "}
                                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                                    Cancel{" "}
                                </Button>{" "}
                                <Button type="submit" color="success" className="btn-label">
                                    {" "}
                                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                                    Save{" "}
                                </Button>{" "}
                            </div>
                        </Col>
                    </Form>

                </Col>
            </Row>
        </React.Fragment>
    );
};

export default salaryPloiciesForm;
