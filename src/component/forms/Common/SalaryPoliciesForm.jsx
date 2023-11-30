import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
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
    const [showTable, setShowTable] = useState({
        earning: false,
        allowance: false,
        deduction: false,
    });



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomFieldObj({
            ...customFieldObj,
            [name]: value,
        });
    };
    const handleSelectTable = (tableType) => {

        setShowTable((prevShowTable) => ({
            earning: tableType === "earning" ? !prevShowTable.earning : prevShowTable.earning,
            allowance: tableType === "allowance" ? !prevShowTable.allowance : prevShowTable.allowance,
            deduction: tableType === "deduction" ? !prevShowTable.deduction : prevShowTable.deduction,
        }));
    };
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
                                                onClick={() => handleSelectTable("earning")}>
                                                <i className="ri-add-line align-bottom me-1"></i>
                                                Select Components
                                            </Button>{' '}
                                            {showTable.earning && (
                                                <div>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Components</th>
                                                                <th>Calculation Type</th>

                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <input type="text" style={{ width: '100px' }} />
                                                                </td>
                                                                <td>

                                                                    <select style={{ width: '100px' }}>
                                                                        <option value="1">Option 1</option>
                                                                        <option value="2">Option 2</option>
                                                                        <option value="3">Option 3</option>

                                                                    </select>
                                                                </td>
                                                                <td>
                                                                    <input type="number" style={{ width: '100px' }} />
                                                                </td>

                                                            </tr>


                                                        </tbody>
                                                    </table>

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <Label htmlFor="tax_state" className="form-label">
                                            Allowances
                                        </Label>
                                        <div className="form-icon right">
                                            <Button color="primary"
                                                onClick={() => handleSelectTable("allowance")}>
                                                <i className="ri-add-line align-bottom me-1"></i>
                                                Select Components
                                            </Button>{' '}
                                            {showTable.allowance && (
                                                <div>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Components</th>
                                                                <th>Calculation Type</th>

                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <input type="text" style={{ width: '100px' }} />
                                                                </td>
                                                                <td>

                                                                    <select style={{ width: '100px' }}>
                                                                        <option value="1">Option 1</option>
                                                                        <option value="2">Option 2</option>
                                                                        <option value="3">Option 3</option>

                                                                    </select>
                                                                </td>
                                                                <td>
                                                                    <input type="number" style={{ width: '100px' }} />
                                                                </td>

                                                            </tr>


                                                        </tbody>
                                                    </table>

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
                                                onClick={() => handleSelectTable("deduction")}>
                                                <i className="ri-add-line align-bottom me-1"></i>
                                                Select Components
                                            </Button>{' '}
                                            {showTable.deduction && (
                                                <div>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Components</th>
                                                                <th>Calculation Type</th>

                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <input type="text" style={{ width: '100px' }} />
                                                                </td>
                                                                <td>

                                                                    <select style={{ width: '100px' }}>
                                                                        <option value="1">Option 1</option>
                                                                        <option value="2">Option 2</option>
                                                                        <option value="3">Option 3</option>

                                                                    </select>
                                                                </td>
                                                                <td>
                                                                    <input type="number" style={{ width: '100px' }} />
                                                                </td>

                                                            </tr>


                                                        </tbody>
                                                    </table>



                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <Label htmlFor="tax_state" className="form-label">
                                            Compliances
                                        </Label>
                                        <div className="">
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <i className="ri-information-line" style={{ fontSize: '16px' }}></i>
                                                <h1 className="fs-13" style={{ marginLeft: '5px' }}>Compliances included ESI, EPF</h1>
                                            </div>
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

                            <div className="text-start">
                                <Button color="success" type="submit">


                                    create
                                </Button>{" "}
                                <Button color="light" type="submit">


                                    Cancel
                                </Button>

                            </div>
                        </Col>
                    </Form>

                </Col>
            </Row>
        </React.Fragment>
    );
};

export default salaryPloiciesForm;
