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

const BranchForm = () => {

    const initialData = useMemo(() => {
        return {
            id: "0",
            name: "",
            total_branches : 1,
            description: ""
        }
    }, []);

    const [branchData, setBranchData] = useState({});
    const { form_obj } = useSelector(state => state.RightSideBarReducer);


    useEffect(() => {
        console.log("UseEffect Running !!!!");
        setBranchData(form_obj);
    }, [form_obj]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBranchData({
            ...branchData,
            [name]: value
        })
    }

    const handleSubmit = () => {
        console.log("branch data = ", branchData);
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
                                            value={branchData.name || ""}
                                            onChange={handleInputChange}
                                        />
                                    </Col>                                   
                                    <Col md={4} lg={4} xxl={4}>
                                        <Label htmlFor="total_branches" className="form-label">Total Branches</Label>
                                        <Input
                                            type="number"
                                            name="total_branches"
                                            className="form-control"
                                            placeholder="Enter Name"
                                            value={branchData.total_branches || ""}
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
                                            value={branchData.description || ""}
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

export default BranchForm
