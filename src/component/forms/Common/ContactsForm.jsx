import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormFeedback,
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


import classnames from "classnames";
import {
  addContacts,
  editContacts,
} from "../../../redux/reducers/ChildReducer/ContactsReducer";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";

import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
// import { Api } from "../../common/api/Api";
// import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
// import { PostApi } from "../../common/api/PostApi";

import { useFormik } from "formik";
import * as Yup from "yup";
import { phoneTypes } from "../../../common/constant/Constants";
import { toast } from "react-toastify";
// import { SetLocalStorage } from "../../meta/SetLocalStorageData";

// register lottie and define custom element
defineElement(loadAnimation);

const ContactsForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const [contactsData, setContactsData] = useState({});


  const { contacts_data } = useSelector(
    (state) => state.ContactsReducer

  );





  useEffect(() => {
    if (form_obj) {
    

      setContactsData(form_obj);
    }
  }, [form_obj]);

  const handlePhoneChange = (index, field, value, phone) => {
    const newPhoneNumbers = [...contactsData.phone_numbers];

   

    newPhoneNumbers[index] = {
      ...newPhoneNumbers[index], // Spread the current phone object
      [field]: value, // Dynamically update the field with the new value
    };
    setContactsData({
      ...contactsData,
      phone_numbers: contactsData.phone_numbers.map((p, i) => (i === index ? newPhoneNumbers[index] : p)),
    })


  };

  // Add new phone number field
  const handleAddPhoneNumber = () => {

    const hasEmptyNumber = contactsData.phone_numbers.some(phone => phone.number.trim() === "");
    const hasEmptyType = contactsData.phone_numbers.some(phone => !phone.type );
    

    if (hasEmptyNumber || hasEmptyType) {
      toast.error("Please fill the fields.");
      return;
    }

    setContactsData({
      ...contactsData,
      phone_numbers: [...contactsData.phone_numbers, { number: "", type: "", primary: false, id: 0, row_id: contactsData?.phone_numbers?.length ? contactsData.phone_numbers[contactsData.phone_numbers.length - 1].row_id + 1 : 1 }],
    });
  };

  // Remove phone number field
  const handleRemovePhoneNumber = (phone) => {
    const newPhoneNumbers = contactsData?.phone_numbers.filter((p) => p.row_id !== phone.row_id);
    setContactsData({
      ...contactsData,
      phone_numbers: newPhoneNumbers,
    });
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactsData({
      ...contactsData,
      [name]: value,
    });
  };





  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: contactsData,
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Customer  Name"),
      project_number: Yup.string().required("Please Enter Project Number"),
      email: Yup.string()
        .email("Please Enter Valid Email")
        .required("Please Enter Email"),

    }),
    onSubmit: (values) => {
      const hasEmptyPhoneNumber = values.phone_numbers?.some(
        (phone) => phone.number.trim() === ""
      );

      const hasEmptyType = contactsData.phone_numbers.some(phone => !phone.type );

      if (hasEmptyPhoneNumber || hasEmptyType) {
        toast.error("Please fill the fields.");
        return;
      }

      if (contactsData.id === 0) {
        const id = contacts_data?.length ? contacts_data[contacts_data.length - 1].id + 1 : 1;
        const finalObj = { ...values, id: id }
        dispatch(addContacts(finalObj));
        // SetLocalStorage("leave_types", Api?.data.data, 2);
      } else {
        dispatch(editContacts(values));
        // SetLocalStorage("leave_types", Api?.data.data, 3);
      }
     
    },
  });

  return (
    <React.Fragment>
      <Row>
        <Col xl={40}>
          <Form
            onSubmit={FormikForm.handleSubmit}
          >
            <Row>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="name" className="form-label">
                    Contact Group Name *
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      className="form-control"
                      placeholder="Customer Name"
                      value={contactsData.name || ""}
                      onChange={handleInputChange}
                      invalid={
                        FormikForm.touched.name && FormikForm.errors.name
                          ? true
                          : false
                      }
                    />
                    {!FormikForm.touched.name && !FormikForm.errors.name && (
                      <i className="" />
                    )}
                    {FormikForm.touched.name && FormikForm.errors.name ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.name}
                      </FormFeedback>
                    ) : null}
                  </div>
                  {!FormikForm.errors.name && (
                    <div id="passwordHelpBlock" className="form-text">
                      Enter Customer Name.
                    </div>
                  )}

                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="emailid" className="form-label">
                    Email
                  </Label>
                  <div className="form-icon right">
                    <Input
                      name="email"
                      id="emailid"
                      className="form-control"
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderColor:
                            !state.isFocused &&
                              FormikForm.touched.email &&
                              FormikForm.errors.email
                              ? "red !important"
                              : provided.borderColor,
                        }),
                      }}
                      placeholder=" Enter Email"
                      value={contactsData.email || ""}
                      onChange={handleInputChange}
                      invalid={
                        FormikForm.touched.email && FormikForm.errors.email
                          ? true
                          : false
                      }
                    />
                    {!FormikForm.touched.email && !FormikForm.errors.email && (
                      <i className="ri-at-line"></i>
                    )}
                    {FormikForm.touched.email && FormikForm.errors.email ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.email}
                      </FormFeedback>
                    ) : null}
                  </div>
                  {!FormikForm.errors.email && (
                    <div id="passwordHelpBlock" className="form-text mb-3">
                      Enter Email.
                    </div>
                  )}
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label className="form-label" htmlFor="lt_desc">
                    Contact Groups *
                  </Label>
                  <Select
                    name="contact_groups"
                    isMulti={false}
                    // options={behaviorTypeOptions || []}
                    className="basic-multi-select"

                  // value={behaviorTypeOptions.find(d => d.value === statusData.behavior) || []}
                  // onChange={handleBehaviorChange}

                  />
                </div>
              </Col>
              <Col md={12}>
                <Label>Phone Numbers</Label>
                {(contactsData.phone_numbers || []).map((phone, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={4}>
                      <Select
                        options={phoneTypes}
                        value={phoneTypes.find((type) => type.value === phone.type)}
                        onChange={(selectedOption) =>
                          handlePhoneChange(index, "type", selectedOption.value, phone)


                        }
                        placeholder="Select type"
                      />
                    </Col>
                    <Col md={4}>
                      <Input
                        type="number"
                        placeholder="Enter contact number"
                        value={phone.number}
                        onChange={(e) =>
                          handlePhoneChange(index, "number", e.target.value, phone)
                        }
                      />
                    </Col>
                    <Col md={2}>
                      <Input
                        type="checkbox"
                        checked={phone.primary}
                        onChange={(e) =>
                          handlePhoneChange(index, "primary", e.target.checked, phone)
                        }
                      />{" "}
                      Primary
                    </Col>
                    <Col md={2}>
                     
                        <Button
                          color="danger"
                          outline
                          onClick={() => handleRemovePhoneNumber(phone)}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                    
                    </Col>
                  </Row>
                ))}
                <Button color="primary" outline onClick={handleAddPhoneNumber}>
                  + Add
                </Button>
              </Col>

              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label className="form-label" htmlFor="lt_desc">
                    Description
                  </Label>
                  <Input
                    type="textarea"
                    className="form-control"
                    id="description"
                    name="description"
                    value={contactsData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="name" className="form-label">
                    Project Number *
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="project_number"
                      id="project_number"
                      className="form-control"
                      placeholder="Project Number"
                      value={contactsData.project_number || ""}
                      onChange={handleInputChange}
                      invalid={
                        FormikForm.touched.project_number && FormikForm.errors.project_number
                          ? true
                          : false
                      }
                    />
                    {!FormikForm.touched.project_number && !FormikForm.errors.project_number && (
                      <i className="" />
                    )}
                    {FormikForm.touched.project_number && FormikForm.errors.project_number ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.project_number}
                      </FormFeedback>
                    ) : null}
                  </div>
                  {!FormikForm.errors.project_number && (
                    <div id="passwordHelpBlock" className="form-text">
                      Enter Your Project Number..
                    </div>
                  )}

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

export default ContactsForm;
