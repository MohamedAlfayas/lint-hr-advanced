import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
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
import avatar1 from '../../assets/images/logo-dark.png'

import { Api } from "../../common/api/Api";
import { toast } from "react-toastify";
const EmployeeForm = () => {

    const { form_obj } = useSelector(state => state.RightSideBarReducer);

    const [selectedPrimaryDepartment, setSelectedPrimaryDepartment] = useState(null);
    const [selectedSubDepartment, setSelectedSubDepartment] = useState(null);
    const [selectedRole, setSelectedRole] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const dep_options = GetLocalStorageData('department') || [];
    const ws_options = GetLocalStorageData('work_schedule') || [];
    const role_option = GetLocalStorageData('role') || [];
    const [selectedWS, setSelectedWS] = useState([])
    const [employeeObj, setEmployeeObj] = useState({});
    const [sub_dept, setSubDept] = useState(dep_options)


    useEffect(() => {
        setEmployeeObj(form_obj);
        // setSelectedWS(ws_options.filter(data => (form_obj.work_schedule_id_list).includes(data.id)))
    }, [form_obj]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log("name = ", name, "   value = ", value);
        setEmployeeObj({
            ...employeeObj,
            [name]: value,
        });
    };

    const handleWSChange = (obj) => {
        setSelectedWS(obj);
        setEmployeeObj({
            ...employeeObj,
            work_schedule: obj.id
        });
    }
    const genderChange = (obj) => {
        setSelectedWS(obj);
        setEmployeeObj({
            ...employeeObj,
            gender: obj.id
        });
    }


    const handleroleChange = (obj) => {
        console.log("Obj = ", obj);
        setSelectedRole(obj);
        setEmployeeObj({
            ...employeeObj,
            role: obj.id
        })
    }
    const handlePrimaryDepartmentChange = (obj) => {
        console.log("Obj = ", obj);
        setSelectedPrimaryDepartment(obj);
        setEmployeeObj({
            ...employeeObj,
            primary_department: obj.id

        })

        const filtered = dep_options.filter((val) => val?.name !== obj?.name)
        console.log('filteter', filtered);
        setSubDept(filtered)
    }
    const handleSubDepartmentChange = (obj) => {
        console.log("Obj = ", obj);
        setSelectedSubDepartment(obj);
        setEmployeeObj({
            ...employeeObj,
            sub_department: obj.map(d => d.id)

        })

    }
    const handleImageChange = (event) => {
        // const selectedImage = event.target.files[0];
        console.log('nvent', event?.target?.files);
        setSelectedImage(event.target.files[0])
        setEmployeeObj({
            ...employeeObj,
            profileImage: event.target.files[0]

        });

    };
    const handleSubmit = () => {
        console.log("Submitting  Data = ", employeeObj);


        let formData = new FormData();
        selectedImage !== null && formData.append('selectedImage', selectedImage, selectedImage.name);
        Object.entries(employeeObj).map((key, idx) => {
            formData.append(key[0], key[1])
        });

        Api({
            method: 'POST',
            url: 'employee/add-new/',
            data: employeeObj
        })
        .then(res => {
            console.log("REs = ", res);
            employeeObj.id === 0 ? dispatch(addEmployee(res?.data.data)) : dispatch(editEmployee(res?.data?.data));
            dispatch(toggleRSBView(false));
            toast.success(res?.data?.message);
        })
        .catch(err => {
            console.log("ERr == ", err);
            toast.success(err?.response?.data?.message);
        })
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataURL = e.target.result;
                setSelectedImage(dataURL);
            };
        }
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
                                            src={selectedImage ? selectedImage : 'default-image-url.jpg'}
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
                                            value={selectedRole || 0}
                                            onChange={handleroleChange}
                                        />

                                    </Col>
                                    <Col lg={12}>
                                        <Label htmlFor="parentDepartment" className="form-label">
                                            Primary Department
                                        </Label>
                                        <Select
                                            isMulti={false}
                                            options={dep_options || []}
                                            className="basic-multi-select"
                                            value={selectedPrimaryDepartment || null}
                                            onChange={handlePrimaryDepartmentChange}
                                        />

                                    </Col>
                                    <Col lg={12}>
                                        <Label htmlFor="parentDepartment" className="form-label">
                                            Sub Department
                                        </Label>
                                        <Select
                                            isMulti={true}
                                            options={sub_dept || []}
                                            className="basic-multi-select"
                                            value={selectedSubDepartment || []}
                                            onChange={handleSubDepartmentChange}
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
                                                value={selectedWS || []}
                                                onChange={handleWSChange}
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
                                                    id="timezone"
                                                    name="timezone"
                                                    placeholder="Asia/Kolkata"
                                                    // value={timezone || ""}
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
