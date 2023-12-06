import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Button,
} from "reactstrap";
import Select from "react-select";
import { GetLocalStorageData } from "../../meta/GetLocalStorageData";

import classnames from "classnames";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import {
  addLeaveType,
  editLeaveType,
} from "../../redux/reducers/ChildReducer/LeaveTypeReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { Api } from "../../common/api/Api";
import { toast } from "react-toastify";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";

// register lottie and define custom element
defineElement(loadAnimation);

const LeaveTypeForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [leaveTypeData, setLeaveTypeData] = useState({});
  const [currentUnit, setCurrentUnit] = useState(null);
  const ws_options = GetLocalStorageData("work_schedule") || [];
  const [selectedWS, setSelectedWS] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);

  let types = [
    { id: 1, label: "Paid", value: 1 },
    { id: 2, label: "UnPaid", value: 2 },
    { id: 3, label: "On Duty", value: 3 },
    { id: 4, label: "Comp Off", value: 4 },
  ];
  let reset = [
    { id: 1, label: "January To December", value: 1 },
    { id: 2, label: "May To April", value: 2 },
  ];

  const gender_option = useMemo(
    () => [
      { id: "Male", label: "Male", value: "Male" },
      { id: "Female", label: "Female", value: "Female" },
      { id: "Other", label: "Other", value: "Other" },
    ],
    []
  );

  useEffect(() => {
    console.log("form_obj = ", form_obj);
    setLeaveTypeData(form_obj);
    setCurrentUnit(form_obj.unit);
    setSelectedWS(
      ws_options.filter((data) => form_obj.ws_id.includes(data.id))
    );
    setSelectedGenders(
      gender_option.filter((data) => form_obj.genders.includes(data.id))
    );
  }, [form_obj]);

  // useEffect(() =>{
  //   if(unit){
  //     if(unit === "Day"){
  //       setLeaveTypeData({
  //         ...leaveTypeData,
  //         unit : unit,
  //         hour_value : ""
  //       })
  //     }
  //     else{
  //       setLeaveTypeData({
  //         ...leaveTypeData,
  //         unit : unit,
  //         day_value : ""
  //       })
  //     }
  //   }
  // },[unit])

  const handleWSChange = (obj) => {
    setSelectedWS(obj);
    setLeaveTypeData({
      ...leaveTypeData,
      ws_id: obj.map((d) => d.id),
    });
  };

  const handleGenderChange = (obj) => {
    setSelectedGenders(obj);
    setLeaveTypeData({
      ...leaveTypeData,
      genders: obj.map((d) => d.id),
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("name = ", name, "   value = ", value);
    setLeaveTypeData({
      ...leaveTypeData,
      [name]: value,
    });
  };

  const handleUnitChange = (e) => {
    console.log("Unit Change = ", e);
    if (e === "Day") {
      setLeaveTypeData({
        ...leaveTypeData,
        unit: e,
        hour_value: "",
      });
    } else {
      setLeaveTypeData({
        ...leaveTypeData,
        unit: e,
        day_value: "",
      });
    }
    setCurrentUnit(e);
  };

  console.log("Leave Data Type = ", leaveTypeData);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("employee data = ", leaveTypeData);
    dispatch(setLoaderVisible(true));
    Api({
      method: "POST",
      url: "/leave/leave_type/create/",
      data: leaveTypeData,
    })
      .then((res) => {
        console.log("REs = ", res);
        leaveTypeData.id === 0
          ? dispatch(addLeaveType(res?.data.data))
          : dispatch(editLeaveType(res?.data?.data));
        dispatch(setLoaderVisible(false));
        dispatch(toggleRSBView(false));
        toast.success(res?.data?.message);
      })
      .catch((err) => {
        dispatch(setLoaderVisible(false));
        console.log("ERr == ", err);
        toast.success(err?.response?.data?.message);
      });
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl={40}>
          <Form className="form-steps" onSubmit={handleSubmit}>
            <Row>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="lName" className="form-label">
                    Name *
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="name"
                      id="lName"
                      className="form-control"
                      placeholder="Casual"
                      value={leaveTypeData.name || ""}
                      onChange={handleInputChange}
                      required
                    />
                    <i className="ri-chat-new-line"></i>
                  </div>
                  <div id="passwordHelpBlock" className="form-text">
                    Enter Leave Type Name.
                  </div>
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="gender" className="form-label">
                    Type *
                  </Label>

                  <Select
                    required
                    isMulti={false}
                    options={types || []}
                    className="basic-multi-select"
                    value={
                      (leaveTypeData.type &&
                        types.find((e) => e.value === leaveTypeData.type)) ||
                      []
                    }
                    onChange={(e) => {
                      setLeaveTypeData({ ...leaveTypeData, type: e.value });
                    }}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Leave Type.
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="unit" className="form-label">
                    Unit *
                  </Label>
                  <div className="">
                    <div className="form-check form-check-inline">
                      <Input
                        id="lt_day"
                        name="Unit"
                        type="radio"
                        className="form-check-input"
                        checked={
                          leaveTypeData.unit && leaveTypeData.unit === "Day"
                            ? true
                            : false
                        }
                        onChange={() => handleUnitChange("Day")}
                        required
                      />
                      <Label className="form-check-label" htmlFor="lt_day">
                        Days
                      </Label>
                    </div>
                    <div className="form-check form-check-inline">
                      <Input
                        id="lt_hour"
                        name="Unit"
                        type="radio"
                        className="form-check-input"
                        checked={
                          leaveTypeData.unit && leaveTypeData.unit === "Hour"
                            ? true
                            : false
                        }
                        onChange={() => handleUnitChange("Hour")}
                        required
                      />
                      <Label className="form-check-label" htmlFor="lt_hour">
                        Hour
                      </Label>
                    </div>
                  </div>
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Select Leave Type Unit.
                </div>
              </Col>

              {currentUnit && currentUnit === "Day" && (
                <Col md={12} lg={12} xxl={12}>
                  <div className="mb-3">
                    <Label htmlFor="lt_days_allow" className="form-label">
                      Leave Days Count{" "}
                      <small>
                        <i>Leave Days Allowed in a year</i>
                      </small>
                    </Label>
                    <div className="form-icon right">
                      <Input
                        type="number"
                        name="day_value"
                        id="lt_days_allow"
                        className="form-control"
                        placeholder="Casual"
                        value={leaveTypeData.day_value || ""}
                        onChange={handleInputChange}
                      />
                      <i className="ri-calendar-2-line"></i>
                    </div>
                    <div id="passwordHelpBlock" className="form-text">
                      Please Enter Leave Days Allowed in a year.
                    </div>
                  </div>
                </Col>
              )}

              {currentUnit && currentUnit === "Hour" && (
                <Col md={12} lg={12} xxl={12}>
                  <div className="mb-3">
                    <Label htmlFor="lt_hour_allow" className="form-label">
                      Leave Hour{" "}
                      <small>
                        <i>Leave Hour Allowed in a Year</i>
                      </small>
                    </Label>
                    <div className="form-icon right">
                      <Input
                        type="number"
                        name="hour_value"
                        id="lt_hour_allow"
                        className="form-control"
                        placeholder="Casual"
                        value={leaveTypeData.hour_value || ""}
                        onChange={handleInputChange}
                      />
                      <i className="ri-time-line"></i>
                    </div>
                    <div id="passwordHelpBlock" className="form-text">
                      Please Enter Leave Hour Allowed in a year.
                    </div>
                  </div>
                  <div className="mb-3">
                    <Label htmlFor="lt_hour_allow" className="form-label">
                      Leave Hour{" "}
                      <small>
                        <i>Leave Hour Allowed in a Day</i>
                      </small>
                    </Label>
                    <div className="form-icon right">
                      <Input
                        type="number"
                        name="hour_value"
                        id="lt_hour_allow"
                        className="form-control"
                        placeholder="Casual"
                        value={leaveTypeData.hour_value || ""}
                        onChange={handleInputChange}
                      />
                      <i className="ri-time-line"></i>
                    </div>
                    <div id="passwordHelpBlock" className="form-text">
                      Please Enter Leave Hour Allowed in a day.
                    </div>
                  </div>
                </Col>
              )}

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="lt_reset" className="form-label">
                    Reset *
                  </Label>

                  <Select
                    required
                    isMulti={false}
                    options={reset || []}
                    id="lt_reset"
                    className="basic-multi-select"
                    value={
                      (leaveTypeData.reset_type &&
                        reset.find(
                          (e) => e.value === leaveTypeData.reset_type
                        )) ||
                      []
                    }
                    onChange={(e) => {
                      setLeaveTypeData({
                        ...leaveTypeData,
                        reset_type: e.value,
                      });
                    }}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Please Select Reset Leave.
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="lt_ws" className="form-label">
                    Applicable For *
                  </Label>

                  <Select
                    required
                    isMulti={true}
                    options={ws_options || []}
                    className="basic-multi-select"
                    value={selectedWS || []}
                    onChange={handleWSChange}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Please select associate work schedule.
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="unit" className="form-label">
                    Gender *
                  </Label>
                  <Select
                    isMulti={true}
                    options={gender_option || []}
                    className="basic-multi-select"
                    value={selectedGenders || []}
                    onChange={handleGenderChange}
                  />
                </div>
                <div id="passwordHelpBlock" className="form-text mb-3">
                  Please select applicable Gender.
                </div>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="lt_weekend" className="form-label">
                    Weekend Between Leave
                  </Label>
                  <div className="mb-2">
                    <div
                      className="form-check form-switch form-switch-md form-switch-success"
                      dir="ltr"
                    >
                      <Input
                        type="checkbox"
                        className="form-check-input form-switch-md"
                        id="lt_weekend"
                        checked={leaveTypeData.weekend_between_leave}
                        onChange={(e) =>
                          setLeaveTypeData({
                            ...leaveTypeData,
                            weekend_between_leave: e.target.checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="lt_holiday" className="form-label">
                    Holiday Between Leave
                  </Label>
                  <div className="mb-2">
                    <div
                      className="form-check form-switch form-switch-md form-switch-success"
                      dir="ltr"
                    >
                      <Input
                        type="checkbox"
                        className="form-check-input form-switch-md"
                        id="lt_holiday"
                        checked={leaveTypeData.holiday_between_leave}
                        onChange={(e) =>
                          setLeaveTypeData({
                            ...leaveTypeData,
                            holiday_between_leave: e.target.checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label className="form-label" htmlFor="lt_desc">
                    Description
                  </Label>
                  <Input
                    type="textarea"
                    className="form-control"
                    id="lt_desc"
                    name="description"
                    value={leaveTypeData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>
              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label">
                    {" "}
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>{" "}
                    Save{" "}
                  </Button>{" "}
                </div>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default LeaveTypeForm;
