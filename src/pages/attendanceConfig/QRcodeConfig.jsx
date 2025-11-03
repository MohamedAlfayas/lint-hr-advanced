import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Label,
  Nav,
  NavItem,
  FormFeedback,
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
import { location_edit_form_component_name } from "../../common/constant/Constants";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";

const QrcodeConfig = () => {
  const [autoGenerateValue, setAutoGenerateValue] = useState("");
  const [securityTypeValue, setSecurityTypeValue] = useState("");

  const [qrFormData, setQrFormData] = useState({
    qr_generate_unit: 0,
    qr_generate_time: 0,
    security_type: 0,
  });

  const handleQRTimeChange = (event) => {
    setQrFormData({
      ...qrFormData,
      qr_generate_time: event.target.value,
    });
  };
  const handleAutoGenerateChange = (e) => {
    setQrFormData({
      ...qrFormData,
      qr_generate_unit: e.value,
    });
  };

  const handleSecurityTypeChange = (e) => {
    setQrFormData({
      ...qrFormData,
      security_type: e.value,
    });
  };

  const handleStartGeneratingCode = () => {
    setAutoGenerateValue("");
    setSecurityTypeValue("");
    setQrCode("");
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: qrFormData,
    validationSchema: Yup.object({
      qr_generate_time: Yup.number()
        .typeError("Please enter a valid number")
        .required("Number is required")
        .positive("Number must be positive")
        .integer("Number must be an integer"),
      qr_generate_unit: Yup.number()
        .required("Select unit")
        .min(1, "Please Select Unit"),
      security_type: Yup.number()
        .required("Select Security Type")
        .min(1, "Please Select Security Type"),
    }),
    onSubmit: async (values) => {
      
      dispatch(setLoaderVisible(true));
    },
  });

  const generate_qr = [
    { id: 1, label: "Minute(s)", value: 1 },
    { id: 2, label: "Second(s)", value: 2 },
  ];

  const security_types = [
    { id: 1, label: "Public URL For Everyone", value: 1 },
    { id: 2, label: "Restricted URL With Password", value: 2 },
  ];

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
              Generate a QR code to let everyone clock in/out easily by scanning
              with the LintHr app Start displaying QR Code
            </p>
          </Nav>

          <TabPane tabId="1" id="home1">
            <div className="d-flex mb-2">
              <Row>
                <Col md={12} lg={12} xxl={12} className="text-start">
                  <Row className="mb-3">
                    <Col>
                      <Label htmlFor="calculation" className="form-label">
                        Auto Generate QR Code Every*
                      </Label>
                    </Col>
                    <Col lg={3}>
                      <Input
                        id="qr_generate_time"
                        name="qr_generate_time"
                        type="number"
                        value={qrFormData?.qr_generate_time}
                        onChange={handleQRTimeChange}
                        className="form-control me-2"
                        invalid={
                          FormikForm.touched.qr_generate_time &&
                          FormikForm.errors.qr_generate_time
                            ? true
                            : false
                        }
                      />
                      {FormikForm.touched.qr_generate_time &&
                      FormikForm.errors.qr_generate_time ? (
                        <FormFeedback type="invalid">
                          {FormikForm.errors.qr_generate_time}
                        </FormFeedback>
                      ) : null}
                    </Col>
                    <Col lg={3}>
                      <Select
                        id=" qr_generate_unit"
                        name="qr_generate_unit"
                        isMulti={false}
                        options={generate_qr || []}
                        value={
                          (qrFormData.qr_generate_unit &&
                            generate_qr.find(
                              (e) => e.value === qrFormData.qr_generate_unit
                            )) ||
                          []
                        }
                        onChange={(e) => {
                          handleAutoGenerateChange(e);
                        }}
                        className="basic-multi-select"
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderColor:
                              !state.isFocused &&
                              FormikForm.touched.qr_generate_unit &&
                              FormikForm.errors.qr_generate_unit
                                ? "red !important"
                                : provided.borderColor,
                          }),
                        }}
                        invalid={
                          FormikForm.touched.qr_generate_unit &&
                          FormikForm.errors.qr_generate_unit
                            ? true
                            : false
                        }
                      />
                      {FormikForm.touched.qr_generate_unit &&
                      FormikForm.errors.qr_generate_unit ? (
                        <div className="lc_form_error_text">
                          {FormikForm.errors.qr_generate_unit}
                        </div>
                      ) : null}
                    </Col>
                  </Row>
                </Col>

                <Col md={12} lg={12} xxl={12} className="mb-3">
                  <Row>
                    <Col>
                      <Label htmlFor="security" className="form-label">
                        Security Type*
                      </Label>
                    </Col>
                    <Col>
                      <div>
                        <Select
                          id="security_type"
                          name="security_type"
                          isMulti={false}
                          options={security_types || []}
                          value={
                            (qrFormData.security_type &&
                              security_types.find(
                                (e) => e.value === qrFormData.security_type
                              )) ||
                            []
                          }
                          onChange={(e) => {
                            handleSecurityTypeChange(e);
                          }}
                          className="basic-multi-select"
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              borderColor:
                                !state.isFocused &&
                                FormikForm.touched.security_type &&
                                FormikForm.errors.security_type
                                  ? "red !important"
                                  : provided.borderColor,
                            }),
                          }}
                          invalid={
                            FormikForm.touched.security_type &&
                            FormikForm.errors.security_type
                              ? true
                              : false
                          }
                        />
                        {FormikForm.touched.security_type &&
                        FormikForm.errors.security_type ? (
                          <div className="lc_form_error_text">
                            {FormikForm.errors.security_type}
                          </div>
                        ) : null}
                      </div>
                    </Col>
                  </Row>
                </Col>

                <Col lg={12}>
                  <div className="text-start">
                    <Button
                      color="success"
                      className="btn-label"
                      onClick={FormikForm.handleSubmit}
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
                        Attendance General Info Heading @Dinesh!
                      </h6>
                      <p className="text-muted mb-0 hide">
                        Keep track of employee's working hours,clock in out
                        time,and which task they were doing.Time Attendance can
                        be used with Payroll to calculate salary automatically.
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
