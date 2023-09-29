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

const EmployeeForm = () => {

    const { form_obj } = useSelector(state => state.RightSideBarReducer);
    const [employeeData, setEmployeeData] = useState({});
    const [selectedDepartment, setSelectedDepartment] = useState([]);
    const dep_options = GetLocalStorageData('department') || [];

    useEffect(() => {
        setEmployeeData(form_obj);
        setSelectedDepartment(dep_options.filter(data => (form_obj.department).includes(data.id)))
    }, [form_obj]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData({
            ...employeeData,
            [name]: value
        })
    }

    const handleDepartmentChange = (obj) =>{
        console.log("Obj = ",obj);
        setSelectedDepartment(obj);
        setEmployeeData({
            ...employeeData,
            department : obj.map(d => d.id)
        })
    }

    const handleSubmit = () => {
        console.log("employee data = ", employeeData);
    }

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
                                <Row>
                                    <Col md={12} lg={12} xxl={12}>
                                        <Label htmlFor="name" className="form-label">Name</Label>
                                        <Input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            placeholder="Enter Name"
                                            value={employeeData.name || ""}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col md={12} lg={12} xxl={12}>
                                        <Label htmlFor="email" className="form-label">Email</Label>
                                        <Input
                                            type="text"
                                            name="email"
                                            className="form-control"
                                            placeholder="Enter Email"
                                            value={employeeData.email || ""}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col lg={12}>
                                        <Label htmlFor="parentDepartment" className="form-label">
                                            Department
                                        </Label>
                                        <Select
                                            isMulti={true}
                                            options={dep_options || []}
                                            className="basic-multi-select"
                                            value={selectedDepartment || []}
                                            onChange={handleDepartmentChange}
                                        />

                                    </Col>
                                    <Col md={12} lg={12} xxl={12}>
                                        <Label htmlFor="name" className="form-label">Description</Label>
                                        <Input
                                            type="textarea"
                                            name="description"
                                            className="form-control"
                                            placeholder="Enter Name"
                                            value={employeeData.description || ""}
                                            onChange={handleInputChange}
                                        />
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
