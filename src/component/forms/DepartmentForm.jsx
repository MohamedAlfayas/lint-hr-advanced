import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
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
import SimpleBar from "simplebar-react";

const DepartmentForm = () => {

    const [hdDropDown, setHdDropDown] = useState(false);
    const toggleHd = () => setHdDropDown((prevState) => !prevState);

    const initialData = useMemo(() => {
        return {
            id: "0",
            name: "",
            head_department: 1,
            description: ""
        }
    }, []);

    const [departmentData, setDepartmentData] = useState({});
    const [selectedHeadDepartment, setSelectedHeadDepartment] = useState({});
    const { form_obj } = useSelector(state => state.RightSideBarReducer);

    const DepartmentList = [
        {
            id: 1,
            name: "Lintcloud",
        },
        {
            id: 2,
            name: "Developer"
        },
        {
            id: 3,
            name: "Tester"
        }
    ]


    useEffect(() => {
        console.log("UseEffect Running !!!!");
        setDepartmentData(form_obj);
    }, [form_obj]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDepartmentData({
            ...departmentData,
            [name]: value
        })
    }

    const handleSubmit = () => {
        console.log("department data = ", departmentData);
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
                                            value={departmentData.name || ""}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col md={12} lg={12} xxl={12}>
                                        <Label
                                            htmlFor=""
                                            className="form-label">
                                            Head Department
                                        </Label>
                                        <Dropdown isOpen={hdDropDown} toggle={toggleHd}>
                                            <DropdownToggle
                                                tag="div"
                                                className="form-control rounded-end flag-input form-select"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {selectedHeadDepartment.name || 'Select Head Department'}
                                            </DropdownToggle>
                                            <DropdownMenu as='ul' className="list-unstyled w-100 dropdown-menu-list mb-0">
                                                <SimpleBar style={{ maxHeight: "220px" }} className="px-3">
                                                    {((DepartmentList.filter(obj => obj !== parseInt(departmentData.id))).sort((a, b) => a.name.localeCompare(b.name)) || []).map((item, key) => (
                                                        <DropdownItem as='li' onClick={() => { setSelectedHeadDepartment(item); setDepartmentData({ ...departmentData, head_department: item.id }) }} key={key} className="dropdown-item d-flex">
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex">
                                                                    <div className="country-name me-1">{item.name}</div>
                                                                </div>
                                                            </div>
                                                        </DropdownItem>
                                                    ))}
                                                </SimpleBar>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </Col>
                                    <Col md={12} lg={12} xxl={12}>
                                        <Label htmlFor="name" className="form-label">Description</Label>
                                        <Input
                                            type="textarea"
                                            name="description"
                                            className="form-control"
                                            placeholder="Enter Name"
                                            value={departmentData.description || ""}
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

export default DepartmentForm
