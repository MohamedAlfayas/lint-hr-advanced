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
import { addHoliday, editHoliday } from "../../redux/reducers/ChildReducer/HolidayReducer";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";

const HolidayForm = () => {
    const dispatch = useDispatch();
    const [holidayObj, setHolidayObj] = useState({});
    const { form_obj } = useSelector((state) => state.RightSideBarReducer);
    const ws_options = GetLocalStorageData('work_schedule') || [];
    const [selectedWS, setSelectedWS] = useState([])

    useEffect(() => {
        setHolidayObj(form_obj);
        setSelectedWS(ws_options.filter(data => (form_obj.work_schedule_id_list).includes(data.id)))
    }, [form_obj]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setHolidayObj({
            ...holidayObj,
            [name]: value,
        });
    };

    const handleWSChange = (obj) => {
        setSelectedWS(obj);
        setHolidayObj({
            ...holidayObj,
            work_schedule_id_list: obj.map(d => d.id)
        });
    }

    const handleSubmit = async () => {        
        dispatch(setLoaderVisible(true));
        Api({
            method: 'POST',
            url: 'holiday/create/',
            data: holidayObj
        })
            .then(res => {
                console.log("REs = ", res);
                holidayObj.id === 0 ? dispatch(addHoliday(res?.data.data)) : dispatch(editHoliday(res?.data?.data));
                dispatch(setLoaderVisible(false));
                dispatch(toggleRSBView(false));
                toast.success(res?.data?.message);
            })
            .catch(err => {                
                dispatch(setLoaderVisible(false));
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
                                <label htmlFor="holidayName" className="form-label">
                                    Holiday Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    id="holidayName"
                                    placeholder="Enter holiday name"
                                    value={holidayObj.name || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Col>
                            <Col lg={12}>
                                <div className="mb-3">
                                    <Label>Date</Label>
                                    <input
                                        type="date"
                                        name=" "
                                        id="date"
                                        className="form-control"
                                        value={holidayObj.date || ""}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </Col>
                            <Col lg={12}>
                                <div className="mb-3">
                                    <Label>Work Schedule</Label>
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
                                    <Label>Is Restricted</Label>
                                    <div
                                        className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                                        dir="ltr">
                                        <Input
                                            id=""
                                            name=""
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={holidayObj.is_restricted}
                                            onChange={(e) => setHolidayObj({ ...holidayObj, is_restricted: e.target.checked })}
                                        />
                                    </div>
                                </div>
                            </Col>
                            <Col lg={12}>
                                <label htmlFor="description" className="form-label">
                                    Description
                                </label>
                                <textarea
                                    type="text"
                                    name="description"
                                    className="form-control"
                                    id="description"
                                    placeholder="Enter description"
                                    value={holidayObj.description || ""}
                                    onChange={handleInputChange}
                                ></textarea>
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

export default HolidayForm;
