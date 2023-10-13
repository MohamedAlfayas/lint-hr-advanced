import axios from "axios";
import { FilePond } from "filepond";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
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
} from "reactstrap";
import Select from 'react-select';
import { Api } from "../../common/api/Api";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { addCustomField, editCustomField } from "../../redux/reducers/ChildReducer/CustomFieldReducer";
import { toast } from "react-toastify";
import { setActiveTableTab } from "../../redux/reducers/ChildReducer/TableReducer";

const CustomFieldForm = () => {
    const dispatch = useDispatch();
    const [customFieldObj, setCustomFieldObj] = useState({});
    const { form_obj } = useSelector((state) => state.RightSideBarReducer);


    let types = [
        { id: "text", label: "Text", value: "text" },
        { id: "number", label: "Number", value: "number" },
        { id: "date", label: "Date", value: "date" },
    ];
    let module_lists = [
        { id: "emp", label: "Employee", value: "emp" },
        { id: "org", label: "Organization", value: "org" },
    ];
    useEffect(() => {
        setCustomFieldObj(form_obj);
    }, [form_obj]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomFieldObj({
            ...customFieldObj,
            [name]: value,
        });
    };
    
    
    console.log(" data = ", customFieldObj);
    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("employee data = ", customFieldObj);
        Api({
            method: 'POST',
            url: 'fields/custom-field/create/',
            data: customFieldObj
        })
            .then(res => {
                console.log("REs = ", res);
                customFieldObj.id === 0 ? dispatch(addCustomField(res?.data.data)) : dispatch(editCustomField(res?.data?.data));
                dispatch(toggleRSBView(false));
                dispatch(setActiveTableTab("all"))
                toast.success(res?.data?.message);
            })
            .catch(err => {
                console.log("ERr == ", err);
                toast.success(err?.response?.data?.message);
            })
    };


    return (
        <React.Fragment>
            <Row>
                <Col>
                    <Form onSubmit={handleSubmit} action="javascript:void(0)">
                        <Row className="g-3">
                            <Col lg={12}>
                                <label htmlFor="displayName" className="form-label">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    id="name"
                                    placeholder="Display Name"
                                    value={customFieldObj.name || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Col>

                            <Col lg={12}>
                                <div className="mb-3">
                                    <Label>Field Type</Label>
                                    <Select

                                        required
                                        name="type"
                                        id="type"
                                        isMulti={false}
                                        options={types || []}
                                        className="basic-multi-select"
                                        value={(customFieldObj.type && types.find(e => e.value === customFieldObj.type)) || []}
                                        onChange={(e) => setCustomFieldObj({...customFieldObj , type : e.value })}
                                    />
                                </div>
                            </Col>

                            <Col lg={12}>
                                <div className="mb-3">
                                    <Label>Applicable For</Label>
                                    <Select
                                        required
                                        name="applicable_for_modules"
                                        isMulti={true}
                                        options={module_lists || []}
                                        className="basic-multi-select"
                                        value={(customFieldObj.applicable_for_modules && module_lists.filter(e => (customFieldObj.applicable_for_modules).includes(e.value)))}
                                        onChange={(e) => setCustomFieldObj({...customFieldObj , applicable_for_modules : e.map(obj => obj.value) })}
                                    />
                                </div>
                            </Col>
                            <Col lg={12}>
                                <div className="mb-3">
                                    <Label>Is Required</Label>
                                    <div
                                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                                        dir="ltr">
                                        <Input
                                            id="is_required"
                                            name="is_required"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={customFieldObj.is_required}
                                            onChange={(e) => setCustomFieldObj({ ...customFieldObj, is_required: e.target.checked })}
                                        />
                                    </div>
                                </div>
                            </Col>


                            <Col lg={12}>
                                <div className="text-end">
                                    <Button color="success" className="btn-label">
                                        {" "}
                                        <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                                        Save{" "}
                                    </Button>{" "}
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default CustomFieldForm;
