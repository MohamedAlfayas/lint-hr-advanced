import React, { useEffect, useMemo, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    Col,
    Label,
    Nav,
    NavItem,
    NavLink,
    Row,
    Input,
    TabContent,
    TabPane,
} from "reactstrap";
import { Link } from "react-router-dom";
import Select from "react-select";
import classnames from "classnames";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import {
    location_edit_form_component_name,
} from "../../common/constant/Constants";
import { useDispatch, useSelector } from "react-redux";


const QrcodeConfig = () => {

    const [autoGenerateValue, setAutoGenerateValue] = useState("");
    const [securityTypeValue, setSecurityTypeValue] = useState("");
  
    const handleAutoGenerateChange = (value) => {
      setAutoGenerateValue(value);
    };
  
    const handleSecurityTypeChange = (value) => {
      setSecurityTypeValue(value);
    };
  
    const handleStartGeneratingCode = () => {
      if (!autoGenerateValue || !securityTypeValue) {
        console.error("Please fill in all required fields.");
        return;
      }
  
      console.log("Auto Generate QR Code Every:", autoGenerateValue);
      console.log("Security Type:", securityTypeValue);
      setAutoGenerateValue("");
      setSecurityTypeValue("");
    };
  
   

 

    const initialFormObj = {
        // qr_code: 1,
        // qr_: 1,
        security_type: 1,
        
       
    };

const generate_qr = [
  {id:1, label:"Minute(s)", value:1},
  {id:2, label:"Second(s)", value:2}
]

const security_type = [
    {id:1, label:"Public URL For Everyone", value:1},
    {id:2, label:"Restricted URL With Password", value:2}
]




    return (
        <React.Fragment>
            <TabPane>
                <Row>
                    <Nav
                        tabs
                        className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3"
                    >
                        <div>
                            <Label>
                                <strong>QR Code</strong>
                            </Label>
                        </div>
                        <p>
                            {" "}
                            Generate a QR code to let everyone clock in/out
                            easily by scanning with the LintHr app Start
                            displaying QR Code
                        </p>
                    </Nav>

                    <TabPane tabId="1" id="home1">
                        <div className="d-flex mb-2">
                            <Row>
                                <Col
                                    md={12}
                                    lg={12}
                                    xxl={12}
                                    className="text-start"
                                >
                                    <Row className="mb-3">
                                        <Col>
                                            <Label
                                                htmlFor="calculation"
                                                className="form-label"
                                            >
                                                Auto Generate QR Code Every*
                                            </Label>
                                        </Col>
                                        <Col lg={3}>
                                            <input
                                                id="number"
                                                type="number"
                                                value={autoGenerateValue}
                                                onChange={(e) =>
                                                    handleAutoGenerateChange(
                                                        e.target.value
                                                    )
                                                }
                                                className="form-control me-2"
                                            />
                                        </Col>
                                        <Col lg={3}>
                                            <Select
                                                id=""
                                                isMulti={false}
                                                options={generate_qr || []}
                                                value={autoGenerateValue}
                                                onChange={(value) =>
                                                    handleAutoGenerateChange(value)
                                                }
                                                className="basic-multi-select"
                                            />
                                        </Col>
                                    </Row>
                                </Col>

                                <Col
                                    md={12}
                                    lg={12}
                                    xxl={12}
                                    className="mb-3"
                                >
                                    <Row>
                                        <Col>
                                            <Label
                                                htmlFor="security"
                                                className="form-label"
                                            >
                                                Security Type*
                                            </Label>
                                        </Col>
                                        <Col>
                                            <div>
                                                <Select
                                                    id="security_type"
                                                    name="security_type"
                                                    isMulti={false}
                                                    options={security_type || []}
                                                    value={securityTypeValue}
                                                    onChange={(value) =>
                                                        handleSecurityTypeChange(value)
                                                    }
                                                    className="basic-multi-select"
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>

                                <Col lg={12}>
                                    <div className="text-start">
                                        <Button
                                            type="submit"
                                            color="success"
                                            className="btn-label"
                                            // onClick={handleStartGeneratingCode}
                                        >
                                            {" "}
                                            <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                                            Start Generating QR Code{" "}
                                        </Button>{" "}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <Col md={9} lg={9} xxl={9}>
                            <Card>
                                <CardBody className="bg-info-subtle">
                                    <div className="d-flex">
                                        <div className="flex-shrink-0">
                                            <FeatherIcon
                                                icon="info"
                                                className="text-info icon-dual-info"
                                            />
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h6 className="fs-15">
                                                Attendance General Info Heading
                                                @Dinesh!
                                            </h6>
                                            <p className="text-muted mb-0 hide">
                                                Keep track of employee's working
                                                hours,clock in out time,and which task
                                                they were doing.Time Attendance can be
                                                used with Payroll to calculate salary
                                                automatically.
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </TabPane>
                </Row>
            </TabPane>



        </React.Fragment>
    );
};

export default QrcodeConfig;





