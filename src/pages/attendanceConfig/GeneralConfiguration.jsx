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
  TabContent,
  TabPane,
} from "reactstrap";
import Select from "react-select";
import { DatePicker } from "antd";
import classnames from "classnames";

import {
  ConvertDateFormat,
  ConvertISODateFormat,
} from "../../common/js/ConvertDateFormat";
import { DateFormat } from "../../common/constant/Constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
dayjs.extend(customParseFormat);
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";

const GeneralConfiguration = () => {
  const [generalFormData, setGeneralFormData] = useState({
    total_hour_calculation: 1,
    attendance_start_date: String(new Date()),
    approval_cycle_count: 0,
    approval_cycle_type: 0,
    repeat_on: {
      type: 1,
      date: 22,
    },
    receive_notification: false,
    locations: 1,
})

  const [totalHourCalculation, setTotalHourCalculation] = useState(
    "Every Valid Check-in&Check-out"
  );

  const hourCalculation = [
    {id:1, label: "Every Valid Check-in&Check-out", value:1}
  ]

  const approvalCycle = [
    {id:1, label: "1", value:1}
  ]

  const approvalOption = [
    {id:1, label: "Monthly", value:1},
    {id:2, label: "Weekly", value:2}
  ]

  const repeat_onselect = [
    
      { id:1, label: "Monthly on day 19", value: 1 },
      {
        id: 2,
        label: "Monthly on the third Tuesday",
        value: 2,
      },
  ]
  const location = [
    {id:1, label:"All Offices", value:1}
  ]
   
  const [repeatOn, setRepeatOn] = useState("");
  const [locations, setLocations] = useState("All Offices");

  const [generalConfiguration, setGeneralConfiguration] = useState({});
  const [atsdate, setATSDate] = useState("");
  // const [attendanceApprovalCycle, setAttendanceApprovalCycle] = useState(1);
  // const [selectedApprovalCycle, setSelectedApprovalCycle] = useState(null); 

  const handleApprovalCountChange = (e) => {
    setGeneralFormData({
      ...generalFormData,
      approval_cycle_count: e.value
  })
};

const handleApprovalTypeChange =(e) => {
  setGeneralFormData({
    ...generalFormData,
    approval_cycle_type: e.value
})
}
  // const initialFormObj = {
  //   total_hour_calculation: 1,
  //   attendance_start_date: String(new Date()),
  //   approval_cycle_count: 0,
  //   approval_cycle_type: 0,
  //   repeat_on: {
  //     type: 1,
  //     date: 22,
  //   },
  //   receive_notification: false,
  //   locations: 1,
  // };

  useEffect(() => {
    setGeneralConfiguration({
      ...generalFormData,
      attendance_start_date: ConvertISODateFormat(
        generalFormData?.attendance_start_date
      ),
    });
    setATSDate(
      ConvertDateFormat(
        ConvertISODateFormat(generalFormData?.attendance_start_date)
      )
    );
  }, []);

  const [customActiveTab1, setcustomActiveTab1] = useState("1");
  const toggleCustom1 = (tab) => {
    if (customActiveTab1 !== tab) {
      setcustomActiveTab1(tab);
    }
  };

  const handleDateChange = (selectedDates, dateStr) => {
    setATSDate(dateStr);
    setGeneralConfiguration({
      ...generalConfiguration,
      attendance_start_date: ConvertISODateFormat(ConvertDateFormat(dateStr)),
    });
  };

  // const handleInputChange = (event, setterFunction) => {
  //   setterFunction(event.target.value);
  // };

  const handleSubmit = () => {
    console.log("GENERAL Configuration = ");
  };
  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: generalFormData,
    validationSchema: Yup.object({
            approval_cycle_count: Yup.number()
            .required("Approval Cycle Count")
            .min(1, "Please Select Approval Cycle Count"),
            approval_cycle_type: Yup.number()
            .required("Approval Cycle Type")
            .min(1, "Please Select Approval Cycle Type"),

            
    }),
    onSubmit: async (values) => {
        console.log("SUCCESSSS !!!! Formik Values = ", values);
        dispatch(setLoaderVisible(true));

    },
})
  return (
    <React.Fragment>
      <div className="d-flex mb-2">
        <Row>
          <Nav
            tabs
            className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3"
          >
            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={classnames({
                  active: customActiveTab1 === "1",
                })}
                onClick={() => {
                  toggleCustom1("1");
                }}
              >
                General
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={classnames({
                  active: customActiveTab1 === "2",
                })}
                onClick={() => {
                  toggleCustom1("2");
                }}
              >
                Person In Charge
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={customActiveTab1} className="text-muted">
            <TabPane tabId="1">
              <Row>
                <Col md={12} lg={12} xxl={12}>
                  <Row className="mb-3">
                    <Col>
                      <Label htmlFor="calculation" className="form-label">
                        Total Hour Calculation*
                      </Label>
                    </Col>
                    <Col>
                      <Select
                        id="calculation"
                        isMulti={false}
                        options={
                          hourCalculation || []
                        }
                        value={{
                          label: totalHourCalculation,
                          value: 1,
                        }}
                        isDisabled={true}
                        className="basic-multi-select"
                      />
                    </Col>
                  </Row>
                </Col>

                <Col md={12} lg={12} xxl={12} className="text-start">
                  <Row className="mb-3">
                    <Col>
                      <Label htmlFor="calculation" className="form-label">
                        Attendance Start Date*
                      </Label>
                    </Col>
                    <Col>
                      <DatePicker
                        name="attendance_start_date"
                        id="attendance_start_date"
                        format={DateFormat}
                        value={dayjs(atsdate, DateFormat)}
                        allowClear={false}
                        className="form-control"
                        onChange={handleDateChange}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col md={12} lg={12} xxl={12} className="text-start">
                  <Row className="mb-3">
                    <Col>
                      <Label htmlFor="calculation" className="form-label">
                        Attendance Approval Cycle*
                      </Label>
                    </Col>
                    <Col lg={3}>
                      <Select
                        id="approval_cycle_count"
                        name="approval_cycle_count"
                        isMulti={false}
                        options={approvalCycle || []}
                        value={
                          (generalFormData.approval_cycle_count &&
                            approvalCycle.find((e) => e.value === generalFormData.approval_cycle_count)) ||
                          []
                      }
                        className="basic-multi-select"
                        onChange={(e) => {
                          handleApprovalCountChange(e);
                      }}
                      styles={{
                        control: (provided, state) => ({
                            ...provided,
                            borderColor:
                                !state.isFocused &&
                                    FormikForm.touched.approval_cycle_count &&
                                    FormikForm.errors.approval_cycle_count
                                    ? "red !important"
                                    : provided.borderColor,
                        }),
                    }}
                    invalid={
                        FormikForm.touched.approval_cycle_count &&
                            FormikForm.errors.approval_cycle_count
                            ? true
                            : false
                    }
                />
                {FormikForm.touched.approval_cycle_count &&
                    FormikForm.errors.approval_cycle_count ? (
                    <div className="lc_form_error_text">
                        {FormikForm.errors.approval_cycle_count}
                    </div>
                ) : null}


                   
                    </Col>
                    <Col lg={3}>
                      <Select
                        id="approval_cycle_type"
                        name="approval_cycle_type"
                        isMulti={false}
                        options={
                          approvalOption || []}
                        className="basic-multi-select"
                        value={
                          (generalFormData.approval_cycle_type &&
                            approvalOption.find((e) => e.value === generalFormData.approval_cycle_type)) ||
                          []
                      }
                      
                        onChange={(e) => {
                          handleApprovalTypeChange(e);
                      }}
                      styles={{
                        control: (provided, state) => ({
                            ...provided,
                            borderColor:
                                !state.isFocused &&
                                    FormikForm.touched.approval_cycle_type &&
                                    FormikForm.errors.approval_cycle_type
                                    ? "red !important"
                                    : provided.borderColor,
                        }),
                    }}
                    invalid={
                        FormikForm.touched.approval_cycle_type &&
                            FormikForm.errors.approval_cycle_type
                            ? true
                            : false
                    }
                />
                {FormikForm.touched.approval_cycle_type &&
                    FormikForm.errors.approval_cycle_type ? (
                    <div className="lc_form_error_text">
                        {FormikForm.errors.approval_cycle_type}
                    </div>
                ) : null}

                    
                    </Col>
                  </Row>
                </Col>

                <Col md={12} lg={12} xxl={12} className="text-start">
                  <Row className="mb-3">
                    <Col>
                      <Label htmlFor="repeaton" className="form-label">
                        Repeat On*
                      </Label>
                    </Col>
                    <Col>
                      <Select
                        id="repeaton"
                        isMulti={false}
                        options={repeat_onselect || []}
                       
                        className="basic-multi-select"
                        // onChange={(e) => handleInputChange(e, setRepeatOn)}
                      />
                    </Col>
                  </Row>
                </Col>

                <Col md={12} lg={12} xxl={12} className="text-start">
                  <Row className="mb-3">
                    <Col>
                      <Label htmlFor="location" className="form-label">
                        Locations*
                      </Label>
                    </Col>
                    <Col>
                      <Select
                        id="location"
                        isMulti={false}
                        options={location || []}
                        
                        value={{
                          label: locations,
                          value: locations,
                        }}
                        isDisabled={true}
                        className="basic-multi-select"
                      />
                    </Col>
                  </Row>
                </Col>
                <Col md={12} lg={12} xxl={12}>
                  <div className="form-check form-check-inline">
                    <input
                      id="p-tax"
                      name="notification"
                      type="checkbox"
                      className="form-check-input"
                      onChange={(e) =>
                        setGeneralConfiguration({
                          ...generalConfiguration,
                          receive_notification: e.target.checked,
                        })
                      }
                      checked={
                        generalConfiguration?.receive_notification || false
                      }
                    />
                    <Label className="form-check-label" htmlFor="lt_day">
                      Manager will receive notifications 1 day before the end of
                      the attendance cycle
                    </Label>
                  </div>
                </Col>
                <Col lg={12}>
                  <div className="text-start">
                    <Button
                      type="button"
                      color="success"
                      className="btn-label"
                      onClick={FormikForm.handleSubmit}
                    >
                      <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                      Save
                    </Button>
                  </div>
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
                            Time Attendance Keeps track of employees working
                            hours, clock in and out time, and which task they
                            were doing. Time Attendance can be used with Payroll
                            to calculate salary automatically.
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tabId="2">
              {" "}
              <Row>
                <Label htmlFor="location" className="form-label">
                  <i
                    className="ri-information-line"
                    style={{ fontSize: "16px" }}
                  ></i>
                  The Person In Charge Will Get Notified When An Employee's
                  Attendance Is Updated
                </Label>
                <Col md={8} lg={8} xxl={8}>
                  <div className=" mb-2">
                    <div className="table-responsive">
                      <div>
                        <div>
                          <input
                            id="text"
                            type="text"
                            // value={autoGenerateValue}
                            // onChange={(e) => handleAutoGenerateChange(e.target.value)}
                            className="form-control me-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </Row>
      </div>
    </React.Fragment>
  );
};

export default GeneralConfiguration;
