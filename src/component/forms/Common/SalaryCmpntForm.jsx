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


const salaryCmpntForm = () => {
    const { form_obj } = useSelector((state) => state.RightSideBarReducer);
    const [customFieldObj, setCustomFieldObj] = useState(form_obj.name);
    console.log("fghj", form_obj);


    const contributionOptions = useMemo(
        () => [
            { id: "1", label: "ESI", value: "ESI" },
            { id: "2", label: "EPF", value: "EPF" },
        ],
        []
    );
    useEffect(() => {
        setCustomFieldObj(form_obj);
    }, [form_obj]);

    return (
        <React.Fragment>
            <Row>
                <Col md={12} lg={12} xxl={12} className="folder-card" key={1}>
                    <Form action="javascript:void(0)">
                        <div className="mb-3">
                            <Label htmlFor="pageSelection" className="form-label">
                                Selected Page
                            </Label>
                            <select
                                className="form-control"
                                id="pageSelection"
                            // value={selectedPage}
                            // onChange={handlePageChange}
                            >
                                <option value="earnings">Earnings</option>
                                <option value="allowances">Allowances</option>
                                <option value="deductions">Deductions</option>
                            </select>
                        </div>
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
                                    // value={form_obj.state}

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
                                            //   value={workScheduleData.description || ""}
                                            // onChange={(e) =>
                                            //     setWorkScheduleData({
                                            //         ...workScheduleData,
                                            //         description: e.target.value,
                                            //     })
                                            // }
                                            />
                                        </div>
                                    </Col>
                                    <div className="mb-3">
                                        <Row>
                                            <Col lg={6} sm={12}>
                                                <Label
                                                    className="form-label"
                                                    htmlFor="gen-info-username-input">
                                                    Pro-rata
                                                </Label>
                                            </Col>
                                            <Col lg={6} sm={12}>
                                                <div
                                                    className="form-check form-switch form-switch-md form-switch-success"
                                                    dir="ltr">
                                                    {" "}
                                                    <Input
                                                        id="company_has_pf"
                                                        name="company_has_pf"
                                                        type="checkbox"
                                                        className="form-check-input"
                                                    //   checked={payRollObj.company_has_pf}
                                                    //   onChange={(e) => setPayRollObj({...payRollObj, company_has_pf : e.target.checked})}
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="mb-3">
                                        <Row>
                                            <Col lg={6} sm={12}>
                                                <Label
                                                    className="form-label"
                                                    htmlFor="gen-info-username-input">
                                                    Taxable
                                                </Label>
                                            </Col>
                                            <Col lg={6} sm={12}>
                                                <div
                                                    className="form-check form-switch form-switch-md form-switch-success"
                                                    dir="ltr">
                                                    {" "}
                                                    <Input
                                                        id="company_has_pf"
                                                        name="company_has_pf"
                                                        type="checkbox"
                                                        className="form-check-input"
                                                    //   checked={payRollObj.company_has_pf}
                                                    //   onChange={(e) => setPayRollObj({...payRollObj, company_has_pf : e.target.checked})}
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Col lg={12}>
                                        <div>
                                            <Label htmlFor="subDepartment" className="form-label">
                                                Contribution
                                            </Label>
                                            <Select
                                                required
                                                isMulti={true}
                                                name="contribute"
                                                options={contributionOptions || []}
                                                className="basic-multi-select"
                                                // value={(form_obj.contribute && contributionOptions.filter(e => (form_obj.contribute).includes(e.value)))}
                                                onChange={(e) => setCustomFieldObj({ ...customFieldObj, contribute: e.map(obj => obj.value) })}
                                            />
                                        </div>
                                        <div id="passwordHelpBlock" className="form-text mb-3">
                                            Select Contribution
                                        </div>
                                    </Col>
                                </div>
                            </div>
                        </Col>
                        <Col lg={12}>
                            <div className="text-end">
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

export default salaryCmpntForm;
