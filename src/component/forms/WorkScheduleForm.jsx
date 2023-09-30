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
import WorkSchedule from "./Common/WorkSchedule.css"
const WorkScheduleForm = () => {

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

    
    const handleSubmit = () => {
        console.log("employee data = ", employeeData);
    }
    const hourOptions = Array.from({ length: 24 }, (_, i) => ({
        label: i.toString().padStart(2, "0"),
        value: i.toString().padStart(2, "0"),
      }));
    
      const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
        label: i.toString().padStart(2, "0"),
        value: i.toString().padStart(2, "0"),
      }));

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
                                            placeholder="Work Schedule Name"
                                            required
                                            value={employeeData.name || ""}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col md={12} lg={12} xxl={12}>
                                        <Label htmlFor="name" className="form-label">Description</Label>
                                        <Input
                                            type="textarea"
                                            name="description"
                                            className="form-control"
                                            value={employeeData.description || ""}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <div class="col-md-12">
                                        <Label htmlFor="name" className="form-label">Grace Period</Label>
                                        </div>
                                    <Col md={3} >
                                    
                                        <span class="form-text text-muted">In Time</span>
                                        <Select
                      name="gracePeriodInHours"
                      options={hourOptions}
                      value={hourOptions.find(
                        (option) =>
                          option.value === employeeData.gracePeriodInHours
                      )}
                      onChange={(selectedOption) => {
                        setEmployeeData({
                          ...employeeData,
                          gracePeriodInHours: selectedOption.value,
                        });
                      }}
                    />
                    <Select
                      name="gracePeriodInMinutes"
                      options={minuteOptions}
                      value={minuteOptions.find(
                        (option) =>
                          option.value === employeeData.gracePeriodInMinutes
                      )}
                      onChange={(selectedOption) => {
                        setEmployeeData({
                          ...employeeData,
                          gracePeriodInMinutes: selectedOption.value,
                        });
                      }}
                    />
                  </Col>
                                    <Col md={3} >
                                    
                                        <span class="form-text text-muted">Out Time</span>
                                        <Select
                      name="gracePeriodInHours"
                      options={hourOptions}
                      value={hourOptions.find(
                        (option) =>
                          option.value === employeeData.gracePeriodInHours
                      )}
                      onChange={(selectedOption) => {
                        setEmployeeData({
                          ...employeeData,
                          gracePeriodInHours: selectedOption.value,
                        });
                      }}
                    />
                    <Select
                      name="gracePeriodInMinutes"
                      options={minuteOptions}
                      value={minuteOptions.find(
                        (option) =>
                          option.value === employeeData.gracePeriodInMinutes
                      )}
                      onChange={(selectedOption) => {
                        setEmployeeData({
                          ...employeeData,
                          gracePeriodInMinutes: selectedOption.value,
                        });
                      }}
                    />
                  </Col>

                                    <div class="col-md-12">
                                        <Label htmlFor="name" className="form-label">Work Duration</Label>
                                        </div>
                                    <Col md={3} >
                                    
                                        <span class="form-text text-muted">Full Day</span>
                                        <Select
                      name="gracePeriodInHours"
                      options={hourOptions}
                      value={hourOptions.find(
                        (option) =>
                          option.value === employeeData.gracePeriodInHours
                      )}
                      onChange={(selectedOption) => {
                        setEmployeeData({
                          ...employeeData,
                          gracePeriodInHours: selectedOption.value,
                        });
                      }}
                    />
                    <Select
                      name="gracePeriodInMinutes"
                      options={minuteOptions}
                      value={minuteOptions.find(
                        (option) =>
                          option.value === employeeData.gracePeriodInMinutes
                      )}
                      onChange={(selectedOption) => {
                        setEmployeeData({
                          ...employeeData,
                          gracePeriodInMinutes: selectedOption.value,
                        });
                      }}
                    />
                  </Col>
                                    <Col md={3} >
                                    
                                        <span class="form-text text-muted">Half Day</span>
                                        <Select
                      name="gracePeriodInHours"
                      options={hourOptions}
                      value={hourOptions.find(
                        (option) =>
                          option.value === employeeData.gracePeriodInHours
                      )}
                      onChange={(selectedOption) => {
                        setEmployeeData({
                          ...employeeData,
                          gracePeriodInHours: selectedOption.value,
                        });
                      }}
                    />
                    <Select
                      name="gracePeriodInMinutes"
                      options={minuteOptions}
                      value={minuteOptions.find(
                        (option) =>
                          option.value === employeeData.gracePeriodInMinutes
                      )}
                      onChange={(selectedOption) => {
                        setEmployeeData({
                          ...employeeData,
                          gracePeriodInMinutes: selectedOption.value,
                        });
                      }}
                    />
                  </Col>

                                    
                                    <div class="col-md-12">
                                        <Label htmlFor="name" className="form-label">Maximum Total Break Duration</Label>
                                        </div>
                                    <Col md={3} >
                                    
                                        <Select
                      name="gracePeriodInHours"
                      options={hourOptions}
                      value={hourOptions.find(
                        (option) =>
                          option.value === employeeData.gracePeriodInHours
                      )}
                      onChange={(selectedOption) => {
                        setEmployeeData({
                          ...employeeData,
                          gracePeriodInHours: selectedOption.value,
                        });
                      }}
                    />
                    <Select
                      name="gracePeriodInMinutes"
                      options={minuteOptions}
                      value={minuteOptions.find(
                        (option) =>
                          option.value === employeeData.gracePeriodInMinutes
                      )}
                      onChange={(selectedOption) => {
                        setEmployeeData({
                          ...employeeData,
                          gracePeriodInMinutes: selectedOption.value,
                        });
                      }}
                    />
                  </Col>

                                    <div class="form-group">
                                            <label for="auto_clock_out_cb">Auto Clock Out</label>
                                            <input type="checkbox" name="auto_clock_out_cb" id="auto_clock_out_cb"/>
                                        </div>
                                         
                                   
                                    
                                    
                                   
                                </Row>
                                <Row>
                                    <Col className="btn"> 
                                        <Button type='submit'>
                                            NEXT STEP
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

export default WorkScheduleForm
