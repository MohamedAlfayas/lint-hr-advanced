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
 import {
    setDepartmentData,
    setComponentToShow,
    setFormObj,
    setFormTitle,
    setFormWidthPercentage,
    toggleRSBView,
    setTaxSlab,
  } from "../../redux/reducers/ChildReducer/RightSideBarReducer";

const LocationsAndPoliciesConfig = () => {
  

    const attendanceobj = {
       
       
        basic_components: {
         
          loc_pol: [
            {
              is_active: true,
              company: "Lintcloud It Service Pvt Ltd",
              tag: "HEADQUARTER",
              add: "694, C/10, SAHAR COMPLEX, NEAR MATHUMITHA HOSPITAL, OPP BUS STAND, VALLIOOR - 627117,Tamil Nadu",
              qr_code: "No",
              in_out: "Desktop,Mobile",
              radius: "25 meters",
              policy: "Not allow clock in/out outside the office",
            },
          ],
        },
       
      };

      const dispatch = useDispatch();
      const handlelocationEdit = ($id) => {
        dispatch(setFormTitle("Locations and Policies Edit"));
    
        dispatch(setFormWidthPercentage("40%"));
        dispatch(setComponentToShow(location_edit_form_component_name));
        dispatch(toggleRSBView(true));
      };
    
    const initialFormObj = {
        total_hour_calculation: 1,
        attendance_start_date: String(new Date()),
        approval_cycle_count: 1,
        approval_cycle_type: 1,
        repeat_on: {
            type: 1,
            date: 22,
        },
        receive_notification: false,
        locations: 1,
    };

   

   
   



    return (
        <React.Fragment>
            <TabPane>
                  <div className="d-flex mb-2">
                            <Label>
                              <strong>Locations and Policies</strong>
                            </Label>
                          </div>
                          <Col xxl={12} sm={12} className="project-card">
                            {(attendanceobj.basic_components.loc_pol || []).map(
                              (item, key) => (
                                <Card key={key}>
                                  <CardBody>
                                    <div
                                      className={`p-3 mt-n3 mx-n3 bg-${
                                        item.is_active ? "success" : "dark"
                                      }-subtle rounded-top`}
                                    >
                                      <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                          <h5 className="mb-0 fs-14">
                                            <Link to="#" className="text-body">
                                              {item.company}
                                              <span className="badge border border-dark text-body ms-2">
                                                {item.tag}
                                              </span>
                                            </Link>
                                          </h5>
                                        </div>

                                        <div className="flex-shrink-0">
                                          <div className="d-flex gap-1 align-items-center my-n2">
                                            <a
                                              onClick={() =>
                                                handlelocationEdit()
                                              }
                                              className="text-primary d-inline-block edit-item-btn ms-2"
                                              href="javascript:void(0)"
                                            >
                                              <i className="mdi mdi-dots-vertical"></i>
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </CardBody>
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
                                              htmlFor="location"
                                              className="form-label"
                                            >
                                              Clocking in/out from
                                            </Label>
                                          </Col>
                                          <Col>
                                            <div className="d-flex align-items-center">
                                              <h5 className="fs-14">
                                                {item.in_out}
                                              </h5>
                                            </div>
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
                                              QR Code
                                            </Label>
                                          </Col>
                                          <Col>
                                            <div>
                                              <h5 className="fs-14">
                                                {item.qr_code}
                                              </h5>
                                            </div>
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
                                              Geofencing
                                            </Label>
                                          </Col>
                                          <Col>
                                            <div className="form-check form-switch form-switch-success">
                                              <Input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="enablegeofencing"
                                                checked={item.is_active}
                                              />
                                            </div>
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
                                              Accurate Address
                                            </Label>
                                          </Col>
                                          <Col>
                                            <div>
                                              <h5 className="fs-14">
                                                {item.add}
                                              </h5>
                                            </div>
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
                                              Radius
                                            </Label>
                                          </Col>
                                          <Col>
                                            <div>
                                              <h5 className="fs-14">
                                                {item.radius}
                                              </h5>
                                            </div>
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
                                              Policy
                                            </Label>
                                          </Col>
                                          <Col>
                                            <div>
                                              <h5 className="fs-14">
                                                {item.policy}
                                              </h5>
                                            </div>
                                          </Col>
                                        </Row>
                                      </Col>
                                    </Row>
                                  </div>
                                </Card>
                              )
                            )}
                          </Col>
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
                                      Attendance General Info Heading @Dinesh!
                                    </h6>
                                    <p className="text-muted mb-0 hide">
                                      Time Attendance Keeps track of employees
                                      working hours, clock in and out time, and
                                      which task they were doing. Time
                                      Attendance can be used with Payroll to
                                      calculate salary automatically.
                                    </p>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        </TabPane>
                  
                
           
        </React.Fragment>
    );
};

export default LocationsAndPoliciesConfig;
