import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Button,
    Card,
    CardBody,
    Col,
    Form,
    Input,
    Label,
    Row,
} from "reactstrap";
import Select from 'react-select';
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";
import DummyUserImg from "../../assets/images/users/user.png"

import { Api } from "../../common/api/Api";
import { toast } from "react-toastify";
import { addEmployee, editEmployee } from "../../redux/reducers/ChildReducer/EmployeeReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
const EmployeeForm = () => {

    const dispatch = useDispatch()

    const { form_obj } = useSelector(state => state.RightSideBarReducer);
    const [employeeObj, setEmployeeObj] = useState({});


    const dep_options = GetLocalStorageData('department') || [];
    const ws_options = GetLocalStorageData('work_schedule') || [];
    const role_option = GetLocalStorageData('role') || [];

    const [employeeImage, setEmployeeImage] = useState(null);

    const [subDepOptions, setSubDeptOptions] = useState(dep_options);


    useEffect(() => {
        console.log("emp Form Obj = ",form_obj);
        setEmployeeObj(form_obj);
        let sub_dep_options = dep_options.filter(obj => obj.id !== form_obj.primary_department);
        setSubDeptOptions(sub_dep_options)
    }, [form_obj]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log("name = ", name, "   value = ", value);
        setEmployeeObj({
            ...employeeObj,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        console.log("E.target.files = ",e.target.files);
        if (e.target.files && e.target.files[0]) {
            setEmployeeImage(e.target.files[0]);
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const newImageSrc = readerEvent.target.result;
                setEmployeeObj({
                    ...employeeObj,
                    profile_url: newImageSrc
                })
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handlePrimaryDepChange = (obj) => {
        if (obj.id !== employeeObj.primary_department) {
            setEmployeeObj({
                ...employeeObj,
                primary_department: obj.id,
                sub_department: []
            });
            let sub_dep_options = dep_options.filter(data => data.id !== obj.id);
            setSubDeptOptions(sub_dep_options);
        }
    }

    const handleSubmit = () => {
        
        console.log("Submitting  Data = ", employeeObj);
        console.log("Profile = ",employeeImage);


        let formData = new FormData();
        employeeImage !== null && formData.append('profile', employeeImage, employeeImage.name);
        Object.entries(employeeObj).map((key, idx) => {
            formData.append(key[0], key[1])
        });

        Api({
            method: 'POST',
            url: 'employee/add-new/',
            headers : {
                'Content-Type' : 'multipart/form-data'
            },
            data: formData
        })
        .then(res => {
            console.log("REs = ", res);
            employeeObj.id === 0 ? dispatch(addEmployee(res?.data.data)) : dispatch(editEmployee(res?.data?.data));
            dispatch(toggleRSBView(false));
            toast.success(res?.data?.message);
        })
        .catch(err => {
            console.log("ERr == ", err);
            toast.error(err?.response?.data?.message);
        })
    };



    return (
        <React.Fragment>
            <Row>
                <Col>
                    <Card>
                        <CardBody>
                            <Form
                                onSubmit={handleSubmit}
                                action="javascript:void(0)"
                            >
                                <div className="text-center">
                                    <div className="profile-user position-relative d-inline-block mx-auto mb-4">
                                        <img
                                            src={employeeObj.profile_url ? employeeObj.profile_url : DummyUserImg}
                                            className="rounded-circle avatar-xl img-thumbnail user-profile-image"
                                            alt="user-profile"
                                        />
                                        <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                                            <Input
                                                id="profile-img-file-input"
                                                type="file"
                                                className="profile-img-file-input"
                                                onChange={handleFileChange}
                                            />
                                            <Label htmlFor="profile-img-file-input" className="profile-photo-edit avatar-xs">
                                                <span className="avatar-title rounded-circle bg-light text-body">
                                                    <i className="ri-camera-fill"></i>
                                                </span>
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <Row>
                                    <Col md={6} lg={6} xxl={6}>
                                        <Label htmlFor="firstName" className="form-label">First Name</Label>
                                        <Input
                                            type="text"
                                            name="fname"
                                            className="form-control"
                                            placeholder="Enter First Name"
                                            value={employeeObj.fname || ""}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col md={6} lg={6} xxl={6}>
                                        <Label htmlFor="lastName" className="form-label">Last Name</Label>
                                        <Input
                                            type="text"
                                            name="lname"
                                            className="form-control"
                                            placeholder="Enter Last Name"
                                            value={employeeObj.lname || ""}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col md={12} lg={12} xxl={12}>
                                        <Label htmlFor="email" className="form-label">Email</Label>
                                        <Input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            placeholder="Enter Email"
                                            value={employeeObj.email || ""}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col lg={12}>
                                        <div className="mb-3">
                                            <Label>DOB</Label>
                                            <input
                                                type="date"
                                                name="dob"
                                                id="date"
                                                className="form-control"
                                                value={employeeObj.dob || ""}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </Col>
                                    <Col lg={12}>
                                        <Label htmlFor="gender" className="form-label">
                                            Gender
                                        </Label>

                                        <div className="input-group">
                                            <select name="gender" className="form-select" id="inputGroupSelect02" value={employeeObj.gender || ""} onChange={handleInputChange}>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <label className="input-group-text" for="inputGroupSelect02">Options</label>
                                        </div>
                                    </Col>
                                    <Col lg={12}>
                                        <Label htmlFor="parentDepartment" className="form-label">
                                            Role
                                        </Label>
                                        <Select
                                            isMulti={false}
                                            options={role_option || []}
                                            className="basic-multi-select"
                                            value={(employeeObj.role && role_option.find(e => e.id === employeeObj.role)) || []}
                                            onChange={(e) => { setEmployeeObj({ ...employeeObj, role: e.id }) }}
                                        />

                                    </Col>
                                    <Col lg={12}>
                                        <Label htmlFor="parentDepartment" className="form-label">
                                            Primary Department
                                        </Label>
                                        <Select
                                            isMulti={false}
                                            options={dep_options || []}
                                            placeholder={'Select Primary Department'}
                                            className="basic-multi-select"
                                            value={(employeeObj.primary_department && dep_options.find(obj => obj.id === employeeObj.primary_department)) || []}
                                            onChange={(e) => handlePrimaryDepChange(e)}
                                        />

                                    </Col>
                                    <Col lg={12}>
                                        <Label htmlFor="parentDepartment" className="form-label">
                                            Sub Department
                                        </Label>
                                        <Select
                                            isMulti={true}
                                            options={subDepOptions || []}
                                            placeholder={'Select Sub Department'}
                                            className="basic-multi-select"
                                            value={(employeeObj.sub_department && subDepOptions.filter(obj => (employeeObj.sub_department).includes(obj.id))) || []}
                                            onChange={(e) => setEmployeeObj({ ...employeeObj, sub_department: e.map(obj => obj.id) })}
                                        />

                                    </Col>
                                    <Col lg={12}>
                                        <div className="mb-3">
                                            <Label>Work Schedule</Label>
                                            <Select
                                                required
                                                isMulti={false}
                                                options={ws_options || []}
                                                className="basic-multi-select"
                                                value={(employeeObj.work_schedule && ws_options.find(e => e.id === employeeObj.work_schedule)) || []}
                                                onChange={(e) => setEmployeeObj({ ...employeeObj, work_schedule: e.id })}
                                            />
                                        </div>
                                    </Col>
                                    <Col xxl={8} md={6}>
                                        <div>
                                            <Label
                                                htmlFor="exampleFormControlTextarea5"
                                                className="form-label">
                                                Time Zone
                                            </Label>
                                            <div className="form-icon right">
                                                <Input
                                                    type="text"
                                                    className="form-control form-control-icon"
                                                    id="profile_timezone"
                                                    name="profile_timezone"
                                                    placeholder="Asia/Kolkata"
                                                    value={employeeObj.profile_timezone || ""}
                                                    onChange={handleInputChange}
                                                />
                                                <i className="ri-time-line"></i>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col lg={12}>
                                        <div className="mb-3">
                                            <Label>Is Active</Label>
                                            <div
                                                className="form-check form-check-right form-switch form-switch-md form-switch-success align-items-center mb-1"
                                                dir="ltr">

                                                <Input
                                                    id=""
                                                    name="is_active"
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={employeeObj.is_active}
                                                    onChange={(e) => setEmployeeObj({ ...employeeObj, is_active: e.target.checked })}

                                                />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Button type='submit'>
                                            Submit
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </React.Fragment>
    )
}

export default EmployeeForm
