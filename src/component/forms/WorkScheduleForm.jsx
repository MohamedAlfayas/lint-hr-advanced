import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Progress,
} from "reactstrap";
import Select from 'react-select';
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";



import classnames from "classnames";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";

// register lottie and define custom element
defineElement(loadAnimation);

const WorkScheduleForm = () => {
  const { form_obj } = useSelector(state => state.RightSideBarReducer);
  const [employeeData, setEmployeeData] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [activeTab, setactiveTab] = useState(1);
  const dep_options = GetLocalStorageData('department') || [];
  const [activeArrowTab, setactiveArrowTab] = useState(4);
  useEffect(() => {
    setEmployeeData(form_obj);
    setSelectedDepartment(dep_options.filter(data => (form_obj.department).includes(data.id)))
  }, [form_obj]);





  const handleSubmit = () => {
    console.log("employee data = ", employeeData);
  }

  const [passedarrowSteps, setPassedarrowSteps] = useState([1]);
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i.toString().padStart(2, "0"),
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i.toString().padStart(2, "0"),
  }));



  function toggleArrowTab(tab) {
    if (activeArrowTab !== tab) {
      var modifiedSteps = [...passedarrowSteps, tab];

      if (tab >= 4 && tab <= 7) {
        setactiveArrowTab(tab);
        setPassedarrowSteps(modifiedSteps);
      }
    }
  }


  document.title = "WorkSchedule | Lint HR";
  return (
    <React.Fragment>



      <Row>

        <Col xl={40}>
          <Card>
            <CardHeader>
              <h4 className="card-title mb-0"></h4>
            </CardHeader>
            <CardBody>
              <Form className="form-steps">
                <div className="text-center pt-3 pb-4 mb-1">

                </div>
                <div className="step-arrow-nav mb-4">
                  <Nav
                    className="nav-pills custom-nav nav-justified"
                    role="tablist"
                  >
                    <NavItem>
                      <NavLink
                        href="#"
                        id="steparrow-gen-info-tab"
                        className={classnames({
                          active: activeArrowTab === 4,
                          done: activeArrowTab <= 6 && activeArrowTab > 3,
                        })}
                        onClick={() => {
                          toggleArrowTab(4);
                        }}
                      >
                        1)Basic Details
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        href="#"
                        id="steparrow-gen-info-tab"
                        className={classnames({
                          active: activeArrowTab === 5,
                          done: activeArrowTab <= 6 && activeArrowTab > 4,
                        })}
                        onClick={() => {
                          toggleArrowTab(5);
                        }}
                      >
                        2)Select Working Hours
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        href="#"
                        id="steparrow-gen-info-tab"
                        className={classnames({
                          active: activeArrowTab === 6,
                          done: activeArrowTab <= 6 && activeArrowTab > 5,
                        })}
                        onClick={() => {
                          toggleArrowTab(6);
                        }}
                      >
                        3)Finish
                      </NavLink>
                    </NavItem>
                  </Nav>
                </div>

                <TabContent activeTab={activeArrowTab}>
                  <TabPane id="steparrow-gen-info" tabId={4}>
                    <div>
                      <Row>
                        <Col md={12} lg={12} xxl={12}>
                          <div className="mb-3">
                            <Label
                              className="form-label"
                              htmlFor="steparrow-gen-info-username-input"
                            >
                              Name
                            </Label>
                            <Input
                              type="text"
                              className="form-control"
                              id="steparrow-gen-info-username-input"
                              placeholder="Enter Work Schedule Name"
                            />
                          </div>
                        </Col>
                        <Col md={12} lg={12} xxl={12}>
                          <div className="mb-3">
                            <Label
                              className="form-label"
                              htmlFor="steparrow-gen-info-email-input"
                            >
                              Description
                            </Label>
                            <Input
                              type="textarea"
                              className="form-control"
                              id="steparrow-gen-info-email-input"

                            />
                          </div>
                        </Col>

                      </Row>
                      <div class="col-md-12">
                        <Label htmlFor="name" className="form-label">Grace Period</Label>
                      </div>
                      <div style={{}}>
                        <Col md={6} >

                          <span class="form-text text-muted">In Time</span>
                          <div style={{ display: "flex" }}>
                            <Select
                              name="gracePeriodInHours"
                              placeholder={'00'}
                              options={hourOptions}
                              value={hourOptions.find(
                                (option) =>
                                  option.value === employeeData.gracePeriodInHours
                              )}
                              
                            />
                            <Select
                              name="gracePeriodInMinutes"
                              placeholder={'00'}
                              options={minuteOptions}
                              value={minuteOptions.find(
                                (option) =>
                                  option.value === employeeData.gracePeriodInMinutes
                              )}
                             
                            />
                          </div>
                        </Col>
                      </div>
                      <div style={{}}>

                        <Col md={6} >

                          <span class="form-text text-muted">Out Time</span>
                          <div style={{ display: "flex" }}>
                            <Select
                              name="gracePeriodInHours"
                              placeholder={'00'}
                              options={hourOptions}
                              value={hourOptions.find(
                                (option) =>
                                  option.value === employeeData.gracePeriodInHours
                              )}
                              
                            />
                            <Select
                              name="gracePeriodInMinutes"
                              placeholder={'00'}
                              options={minuteOptions}
                              value={minuteOptions.find(
                                (option) =>
                                  option.value === employeeData.gracePeriodInMinutes
                              )}
                              
                            />
                          </div>
                        </Col>
                      </div>
                      <div style={{}}>
                        <div class="col-md-12">
                          <Label htmlFor="name" className="form-label">Work Duration</Label>
                        </div>
                        <Col md={6} >


                          <span class="form-text text-muted">Full Day</span>
                          <div style={{ display: "flex" }}>
                            <Select
                              name="gracePeriodInHours"
                              placeholder={'00'}
                              options={hourOptions}
                              value={hourOptions.find(
                                (option) =>
                                  option.value === employeeData.gracePeriodInHours
                              )}
                              
                            />
                            <Select
                              name="gracePeriodInMinutes"
                              placeholder={'00'}
                              options={minuteOptions}
                              value={minuteOptions.find(
                                (option) =>
                                  option.value === employeeData.gracePeriodInMinutes
                              )}
                              
                            />
                          </div>
                        </Col>
                      </div>
                      <div style={{}}>
                        <Col md={6} >

                          <span class="form-text text-muted">Half Day</span>
                          <div style={{ display: "flex" }}>
                            <Select
                              name="gracePeriodInHours"
                              placeholder={'00'}
                              options={hourOptions}
                              value={hourOptions.find(
                                (option) =>
                                  option.value === employeeData.gracePeriodInHours
                              )}
                              
                            />
                            <Select
                              name="gracePeriodInMinutes"
                              placeholder={'00'}
                              options={minuteOptions}
                              value={minuteOptions.find(
                                (option) =>
                                  option.value === employeeData.gracePeriodInMinutes
                              )}
                              
                            />
                          </div>
                        </Col>
                      </div>


                      <div class="col-md-12">
                        <Label htmlFor="name" className="form-label">Maximum Total Break Duration</Label>
                      </div>
                      <Col md={3} >

                        <Select
                          name="gracePeriodInHours"
                          placeholder={'00'}
                          options={hourOptions}
                          value={hourOptions.find(
                            (option) =>
                              option.value === employeeData.gracePeriodInHours
                          )}
                          
                        />
                        <Select
                          name="gracePeriodInMinutes"
                          placeholder={'00'}
                          options={minuteOptions}
                          value={minuteOptions.find(
                            (option) =>
                              option.value === employeeData.gracePeriodInMinutes
                          )}
                          
                        />
                      </Col>
                      <br />

                      <div class="form-group">
                        <label for="auto_clock_out_cb">Auto Clock Out</label>
                        <input type="checkbox" name="auto_clock_out_cb" id="auto_clock_out_cb" />
                      </div>







                      <div className="mb-3">

                      </div>
                      <div>

                      </div>
                    </div>
                    <div className="d-flex align-items-start gap-3 mt-4">
                      <button
                        type="button"
                        className="btn btn-success btn-label right ms-auto nexttab nexttab"
                        onClick={() => {
                          toggleArrowTab(activeArrowTab + 1);
                        }}
                      >
                        <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                        NEXT STEP
                      </button>
                    </div>
                  </TabPane>

                  <TabPane id="steparrow-description-info" tabId={5}>

                    <table className="table">

                      <thead>

                        <tr>
                          <th>  <input type="checkbox" name="auto_clock_out_cb" id="auto_clock_out_cb" /></th>
                          <th>Day </th>
                          <th>Time</th>
                          <th>Minute</th>
                          <th>TO</th>
                          <th>Time</th>
                          <th>Minute</th>
                          <th>Shift Hourse</th>
                        </tr>
                        <tr>
                          <th>  <input type="checkbox" name="auto_clock_out_cb" id="auto_clock_out_cb" /></th>
                          <th>Monday</th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                           
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                            
                          /></th>
                          <th><i class="ri-arrow-left-right-line"></i></th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                           
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                           
                          /></th>

                        </tr>
                        <tr>
                          <th>  <input type="checkbox" name="auto_clock_out_cb" id="auto_clock_out_cb" /></th>
                          <th>Tuesday</th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                            
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                            
                          /></th>
                          <th><i class="ri-arrow-left-right-line"></i></th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                          
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                           
                          /></th>
                        </tr>
                        <tr>
                          <th>  <input type="checkbox" name="auto_clock_out_cb" id="auto_clock_out_cb" /></th>
                          <th>Wednesday</th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                           
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                            
                          /></th>
                          <th><i class="ri-arrow-left-right-line"></i></th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                           
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                           
                          /></th>
                          
                        </tr>
                        <tr>
                          <th>  <input type="checkbox" name="auto_clock_out_cb" id="auto_clock_out_cb" /></th>
                          <th>Thursday</th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                          
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                          
                          /></th>
                          <th><i class="ri-arrow-left-right-line"></i></th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                           
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                            
                          /></th>
                        </tr>
                        <tr>
                          <th>  <input type="checkbox" name="auto_clock_out_cb" id="auto_clock_out_cb" /></th>
                          <th>Friday</th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                            
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                          
                          /></th>
                          <th><i class="ri-arrow-left-right-line"></i></th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                           
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                           
                          /></th>
                        </tr>
                        <tr>
                          <th>  <input type="checkbox" name="auto_clock_out_cb" id="auto_clock_out_cb" /></th>
                          <th>Saturday</th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                           
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                            
                          /></th>
                          <th><i class="ri-arrow-left-right-line"></i></th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                           
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                           
                          /></th>
                        </tr>
                        <tr>
                          <th>  <input type="checkbox" name="auto_clock_out_cb" id="auto_clock_out_cb" /></th>
                          <th>Sunday</th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                            
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                           
                          /></th>
                          <th><i class="ri-arrow-left-right-line"></i></th>
                          <th><Select
                            name="gracePeriodInHours"
                            placeholder={'00'}
                            options={hourOptions}
                            value={hourOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInHours
                            )}
                          
                          /></th>
                          <th> <Select
                            name="gracePeriodInMinutes"
                            placeholder={'00'}
                            options={minuteOptions}
                            value={minuteOptions.find(
                              (option) =>
                                option.value === employeeData.gracePeriodInMinutes
                            )}
                           
                          /></th>
                        </tr>
                      </thead>
                     
                    </table>




                    <div className="d-flex align-items-start gap-3 mt-4">
                      <button
                        type="button"
                        className="btn btn-light btn-label previestab"
                        onClick={() => {
                          toggleArrowTab(activeArrowTab - 1);
                        }}
                      >
                        <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                        Back to Basic Details
                      </button>
                      <button
                        type="button"
                        className="btn btn-success btn-label right ms-auto nexttab nexttab"
                        onClick={() => {
                          toggleArrowTab(activeArrowTab + 1);
                        }}
                      >
                        <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                        Submit
                      </button>
                    </div>
                  </TabPane>

                  <TabPane id="pills-experience" tabId={6}>
                    <div className="text-center">
                      <div className="avatar-md mt-5 mb-4 mx-auto">
                        <div className="avatar-title bg-light text-success display-4 rounded-circle">
                          <i className="ri-checkbox-circle-fill"></i>
                        </div>
                      </div>
                      <h5>Well Done !</h5>
                      <p className="text-muted">
                        You have Successfully Signed Up
                      </p>
                    </div>
                  </TabPane>
                </TabContent>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>





    </React.Fragment>
  );
};

export default WorkScheduleForm;
