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

const CustomFieldForm= () => {
    const dispatch = useDispatch();
    const [customFieldObj, setCustomFieldObj] = useState({});
    const { form_obj } = useSelector((state) => state.RightSideBarReducer);
    const ws_options = GetLocalStorageData('work_schedule') || [];
    const [selectedWS, setSelectedWS] = useState([])

    // useEffect(() => {
    //     setHolidayObj(form_obj);
    //     setSelectedWS(ws_options.filter(data => (form_obj.work_schedule_id_list).includes(data.id)))
    // }, [form_obj]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomFieldObj({
            ...customFieldObj,
            [name]: value,
        });
    };

    const handleWSChange = (obj) => {
        setSelectedWS(obj);
        setCustomFieldObj({
            ...customFieldObj,
            work_schedule_id_list: obj.map(d => d.id)
        });
    }

    const handleSubmit = async () => {
        Api({
            method: 'POST',
            url: 'holiday/create/',
            data: holidayObj
        })
            .then(res => {
                console.log("REs = ", res);
                holidayObj.id === 0 ? dispatch(addHoliday(res?.data.data)) : dispatch(editHoliday(res?.data?.data));
                dispatch(toggleRSBView(false));
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
                                    id="displayName"
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
                                        isMulti={true}
                                        options={ws_options || []}
                                        className="basic-multi-select"
                                        value={selectedWS || []}
                                        onChange={handleWSChange}
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
                                            id=""
                                            name=""
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={customFieldObj.is_restricted}
                                            onChange={(e) => setCustomFieldObj({ ...customFieldObj, is_restricted: e.target.checked })}
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
