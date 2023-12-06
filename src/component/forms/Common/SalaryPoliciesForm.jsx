import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import { SweetAlert } from "../../common/sweetAlert/SweetAlert";
import Swal from "sweetalert2";
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
    const { earnings_data } = useSelector((state) => state.SalaryComponentsReducer);
    console.log("kkk", earnings_data);
    const { allowances_data } = useSelector((state) => state.SalaryComponentsReducer);
    // console.log("kkk",allowances_data);
    const { deductions_data } = useSelector((state) => state.SalaryComponentsReducer);
    // console.log("kkk",deductions_data);selectedItems  
    const [customFieldObj, setCustomFieldObj] = useState(form_obj);
    console.log("fghj", form_obj);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedAllowanceItems, setSelectedAlowanceItems] = useState([]);
    const [selectedDeductionItems, setSelectedDeductionItems] = useState([]);
    const [calculationType, setCalculationType] = useState("option1");
    const [selectField, setSelectField] = useState("option1");


    const handleCalculationTypeChange = (event) => {
        const selectedValue = event.target.value;
        setCalculationType(selectedValue);


        setSelectField("option1");
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomFieldObj({
            ...customFieldObj,
            [name]: value,
        });
    };

    const hanldeEarningComponent = () => {

        //         const tableRow1 = earnings_data?.map((item) => {
        //     if (selectedItems.length > 0 && selectedItems.find((obj) => obj.name == item.name)) {
        //         console.log('yes', item);
        //     } else {
        //         console.log('no', item);
        //     }
        // });
        // console.log('table1' , tableRow1);
        const tableRows = earnings_data.map((item) => `
          <tr>
            <td><input type="checkbox" class="earning-checkbox" data-id="${item.id}"></td>
            <td>${item.name}</td>
            <td>${item.pro_rata ? "Yes" : "No"}</td>
            <td>${item.tax ? "Yes" : "No"}</td>
            <td>${item.insurance ? "Yes" : "No"}</td>
          </tr>
        `).join('');

        Swal.fire({
            title: "Select Earning Components",
            html: `
            <table class="table">
              <thead>
                <tr>
                  <th><input type="checkbox" id="selectAll"></th>
                  <th>Name</th>
                  <th>Pro-rata</th>
                  <th>Taxable</th>
                  <th>Contribute to insurance&Fund</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          `,
            customClass: {
                container: 'custom-modal-container',
            },
            width: '60%',
            showCloseButton: true,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            cancelButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                const selectedCheckboxes = document.querySelectorAll('.earning-checkbox:checked');
                const selectedItems = Array.from(selectedCheckboxes).map(checkbox => ({
                    // id: checkbox.dataset.id,
                    name: (earnings_data).find((val) => val.id == checkbox.dataset.id)?.name
                }));
                console.log('selectedItems', selectedItems);
                // Update state with selected item names and IDs
                setSelectedItems(selectedItems);

                // Log selected items to the console
            }
        });




        // Add event listener for the "Select All" checkbox
        document.getElementById('selectAll').addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('.earning-checkbox');
            checkboxes.forEach((checkbox) => {
                checkbox.checked = document.getElementById('selectAll').checked;
            });
        });
    };
    const hanldeAllowancesComponent = () => {
        const tableRows = allowances_data.map((item) => `
          <tr>
            <td><input type="checkbox" class="earning-checkbox" data-id="${item.id}"></td>
            <td>${item.name}</td>
            <td>${item.pro_rata ? "Yes" : "No"}</td>
            <td>${item.tax ? "Yes" : "No"}</td>
            <td>${item.insurance ? "Yes" : "No"}</td>
          </tr>
        `).join('');

        Swal.fire({
            title: "Select Allowances Components",
            html: `
            <table class="table">
              <thead>
                <tr>
                  <th><input type="checkbox" id="selectAll"></th>
                  <th>Name</th>
                  <th>Pro-rata</th>
                  <th>Taxable</th>
                  <th>Contribute to insurance&Fund</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          `,
            customClass: {
                container: 'custom-modal-container',
            },
            width: '60%',
            showCloseButton: true,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            cancelButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                const selectedCheckboxes = document.querySelectorAll('.earning-checkbox:checked');
                const selectedAllowanceItems = Array.from(selectedCheckboxes).map(checkbox => ({
                    // id: checkbox.dataset.id,
                    name: (allowances_data).find((val) => val.id == checkbox.dataset.id)?.name
                }));
                console.log('selectedItems', selectedAllowanceItems);
                // Update state with selected item names and IDs
                setSelectedAlowanceItems(selectedAllowanceItems);

                // Log selected items to the console
            }
        });


        // Add event listener for the "Select All" checkbox
        document.getElementById('selectAll').addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('.earning-checkbox');
            checkboxes.forEach((checkbox) => {
                checkbox.checked = document.getElementById('selectAll').checked;
            });
        });
    };

    const hanldeDeductionsComponent = () => {
        const tableRows = deductions_data.map((item) => `
          <tr>
            <td><input type="checkbox" class="earning-checkbox" data-id="${item.id}"></td>
            <td>${item.name}</td>
            <td>${item.pro_rata ? "Yes" : "No"}</td>
            <td>${item.tax ? "Yes" : "No"}</td>
            <td>${item.insurance ? "Yes" : "No"}</td>
          </tr>
        `).join('');

        Swal.fire({
            title: "Select Deductions Components",
            html: `
            <table class="table">
              <thead>
                <tr>
                  <th><input type="checkbox" id="selectAll"></th>
                  <th>Name</th>
                  <th>Pro-rata</th>
                  <th>Taxable</th>
                  <th>Contribute to insurance&Fund</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          `,
            customClass: {
                container: 'custom-modal-container',
            },
            width: '60%',
            showCloseButton: true,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            cancelButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                const selectedCheckboxes = document.querySelectorAll('.earning-checkbox:checked');
                const selectedDeductionItems = Array.from(selectedCheckboxes).map(checkbox => ({
                    // id: checkbox.dataset.id,
                    name: (deductions_data).find((val) => val.id == checkbox.dataset.id)?.name
                }));
                console.log('selectedItems', selectedDeductionItems);
                // Update state with selected item names and IDs
                setSelectedDeductionItems(selectedDeductionItems);

                // Log selected items to the console
            }
        });

        // Add event listener for the "Select All" checkbox
        document.getElementById('selectAll').addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('.earning-checkbox');
            checkboxes.forEach((checkbox) => {
                checkbox.checked = document.getElementById('selectAll').checked;
            });
        });
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

                                        {selectedItems.length > 0 && (
                                            <div className="mb-3">
                                                <table className="table">
                                                    <tbody>
                                                        <tr>
                                                            <th>
                                                                <Label htmlFor="selectedEarnings" className="form-label">
                                                                    Components
                                                                </Label>
                                                            </th>
                                                            <td>
                                                                <div className="form-icon right">
                                                                    {selectedItems.map((item, index) => (
                                                                        <span key={index}>{item.name} </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <th>
                                                                <Label htmlFor="selectField" className="form-label">
                                                                    Calculation Type
                                                                </Label>
                                                            </th>
                                                            <td>
                                                                <select
                                                                    id="calculationType"
                                                                    name="calculationType"
                                                                    className="form-select"
                                                                    value={calculationType}
                                                                    onChange={handleCalculationTypeChange}
                                                                >
                                                                    <option value="option1">Flat Amount</option>
                                                                    <option value="option2">Percentage</option>

                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>
                                                                {/* <Label htmlFor="additionalInput" className="form-label">
                                                                        Additional Input
                                                                    </Label> */}
                                                            </th>
                                                            <td>
                                                                <Input
                                                                    type="text"
                                                                    id="additionalInput"
                                                                    name="additionalInput"
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>
                                                                <Label htmlFor="selectField" className="form-label">
                                                                    Select Field
                                                                </Label>
                                                            </th>
                                                            <td>
                                                                <select
                                                                    id="selectField"
                                                                    name="selectField"
                                                                    className="form-select"
                                                                    value={selectField}
                                                                    onChange={(e) => setSelectField(e.target.value)}
                                                                >
                                                                    {calculationType === "option2" ? (
                                                                        <option value="option1">Per Year</option>
                                                                    ) : null}
                                                                    {calculationType === "option1" ? (
                                                                        <Fragment>
                                                                        <option value="option2">Monthly</option>
                                                                        <option value="option3">Weekly</option>
                                                                        </Fragment>
                                                                    ) : null}

                                                                </select>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        <div className="form-icon right">
                                            <Button color="primary"
                                                onClick={() => hanldeEarningComponent()}>
                                                <i className="ri-add-line align-bottom me-1"></i>
                                                Select Components
                                            </Button>{' '}

                                        </div>
                                    </div>
                                    <hr></hr>
                                    <div className="mb-3">
                                        <Label htmlFor="tax_state" className="form-label">
                                            Allowances
                                        </Label>
                                        {selectedAllowanceItems.length > 0 && (
                                            <div className="mb-3">
                                                <table className="table">
                                                    <tbody>
                                                        <tr>
                                                            <th>
                                                                <Label htmlFor="selectedEarnings" className="form-label">
                                                                    Components
                                                                </Label>
                                                            </th>
                                                            <td>
                                                                <div className="form-icon right">
                                                                    {selectedAllowanceItems.map((item, index) => (
                                                                        <span key={index}>{item.name} </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <th>
                                                                <Label htmlFor="selectField" className="form-label">
                                                                    Calculation Type
                                                                </Label>
                                                            </th>
                                                            <td>
                                                                <select
                                                                    id="calculationType"
                                                                    name="calculationType"
                                                                    className="form-select"
                                                                    value={calculationType}
                                                                    onChange={handleCalculationTypeChange}
                                                                >
                                                                    <option value="option1">Flat Amount</option>
                                                                    <option value="option2">Percentage</option>

                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>
                                                                {/* <Label htmlFor="additionalInput" className="form-label">
                                                                        Additional Input
                                                                    </Label> */}
                                                            </th>
                                                            <td>
                                                                <Input
                                                                    type="text"
                                                                    id="additionalInput"
                                                                    name="additionalInput"
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>
                                                                {/* <Label htmlFor="selectField" className="form-label">
                                                                    Select Field
                                                                </Label> */}
                                                            </th>
                                                            <td>
                                                                <select
                                                                    id="selectField"
                                                                    name="selectField"
                                                                    className="form-select"
                                                                    value={selectField}
                                                                    onChange={(e) => setSelectField(e.target.value)}
                                                                >
                                                                    {calculationType === "option2" ? (
                                                                        <option value="option1">Per Year</option>
                                                                    ) : null}
                                                                     {calculationType === "option1" ? (
                                                                        <Fragment>
                                                                        <option value="option2">Monthly</option>
                                                                        <option value="option3">Weekly</option>
                                                                        </Fragment>
                                                                    ) : null}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        <div className="form-icon right">
                                            <Button color="primary"
                                                onClick={() => hanldeAllowancesComponent()}>
                                                <i className="ri-add-line align-bottom me-1"></i>
                                                Select Components
                                            </Button>{' '}

                                        </div>
                                    </div>
                                    <hr></hr>
                                    <div className="mb-3">
                                        <Label htmlFor="tax_state" className="form-label">
                                            Deductions
                                        </Label>
                                        {selectedDeductionItems.length > 0 && (
                                            <div className="mb-3">
                                                <table className="table">
                                                    <tbody>
                                                        <tr>
                                                            <th>
                                                                <Label htmlFor="selectedEarnings" className="form-label">
                                                                    Components
                                                                </Label>
                                                            </th>
                                                            <td>
                                                                <div className="form-icon right">
                                                                    {selectedDeductionItems.map((item, index) => (
                                                                        <span key={index}>{item.name} </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <th>
                                                                <Label htmlFor="selectField" className="form-label">
                                                                    Calculation Type
                                                                </Label>
                                                            </th>
                                                            <td>
                                                                <select
                                                                    id="calculationType"
                                                                    name="calculationType"
                                                                    className="form-select"
                                                                    value={calculationType}
                                                                    onChange={handleCalculationTypeChange}
                                                                >
                                                                    <option value="option1">Flat Amount</option>
                                                                    <option value="option2">Percentage</option>

                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>
                                                                {/* <Label htmlFor="additionalInput" className="form-label">
                                                                        Additional Input
                                                                    </Label> */}
                                                            </th>
                                                            <td>
                                                                <Input
                                                                    type="text"
                                                                    id="additionalInput"
                                                                    name="additionalInput"
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>
                                                                {/* <Label htmlFor="selectField" className="form-label">
                                                                    Select Field
                                                                </Label> */}
                                                            </th>
                                                            <td>
                                                                <select
                                                                    id="selectField"
                                                                    name="selectField"
                                                                    className="form-select"
                                                                >
                                                                    {calculationType === "option2" ? (
                                                                        <option value="option1">Per Year</option>
                                                                    ) : null}
                                                                   {calculationType === "option1" ? (
                                                                        <Fragment>
                                                                        <option value="option2">Monthly</option>
                                                                        <option value="option3">Weekly</option>
                                                                        </Fragment>
                                                                    ) : null}

                                                                </select>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        <div className="form-icon right">
                                            <Button color="primary"
                                                onClick={() => hanldeDeductionsComponent()}>
                                                <i className="ri-add-line align-bottom me-1"></i>
                                                Select Components
                                            </Button>{' '}

                                        </div>
                                    </div>
                                    <hr></hr>
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
