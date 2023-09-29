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

const RoleForm = () => {

    const { form_obj } = useSelector(state => state.RightSideBarReducer);
    const [roleData, setRoleData] = useState({});

    useEffect(() => {
        setRoleData(form_obj);
    }, [form_obj]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRoleData({
            ...roleData,
            [name]: value
        })
    }

    const handleSubmit = () => {
        console.log("role data = ", roleData);
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
                                            value={roleData.name || ""}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col md={12} lg={12} xxl={12}>
                                        <Label htmlFor="name" className="form-label">Description</Label>
                                        <Input
                                            type="textarea"
                                            name="description"
                                            className="form-control"
                                            placeholder="Enter Name"
                                            value={roleData.description || ""}
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

export default RoleForm
