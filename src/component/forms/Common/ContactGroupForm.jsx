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
    addContactGroup,
    editContactGroup}  from "../../../redux/reducers/ChildReducer/ContactGroupReducer";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";

import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
// import { Api } from "../../common/api/Api";
// import { toast } from "react-toastify";
// import { setLoaderVisible } from "../../redux/reducers/ChildReducer/LoaderReducer";
// import { PostApi } from "../../common/api/PostApi";

import { useFormik } from "formik";
import * as Yup from "yup";
// import { SetLocalStorage } from "../../meta/SetLocalStorageData";

// register lottie and define custom element
defineElement(loadAnimation);

const ContactGroupForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
 
  const [contactGroupData, setContactGroupData] = useState({});

  const { contact_group_data } = useSelector(
    (state) => state.ContactGroupReducer

  );



  

 useEffect(() => {
    if (form_obj) {
       
        
      setContactGroupData(form_obj);
    }
  }, [form_obj]);

 

  

 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactGroupData({
      ...contactGroupData,
      [name]: value,
    });
  };
  

    
  
  
  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: contactGroupData,
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Status  Name"),
      domain: Yup.string().required("Please Enter Domain  Name"),
     
    }),
    onSubmit: (values) => {
        if (contactGroupData.id === 0) {
            const id = contact_group_data?.length ? contact_group_data[contact_group_data.length - 1].id + 1 : 1;
            const finalObj = {...values,id : id}
            dispatch(addContactGroup(finalObj));
            // SetLocalStorage("leave_types", Api?.data.data, 2);
          } else {
            dispatch(editContactGroup(values));
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
                      placeholder="Status Name"
                      value={contactGroupData.name || ""}
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
                      Enter Contact Group Name.
                    </div>
                  )} 
                  
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
                    id="description"
                    name="description"
                    value={contactGroupData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="name" className="form-label">
                  Doamin *
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="domain"
                      id="domain"
                      className="form-control"
                      placeholder="Domain"
                      value={contactGroupData.domain || ""}
                      onChange={handleInputChange}
                      invalid={
                        FormikForm.touched.domain && FormikForm.errors.domain
                          ? true
                          : false
                      }
                    />
                    {!FormikForm.touched.domain && !FormikForm.errors.domain && (
                      <i className="" />
                    )}
                    {FormikForm.touched.domain && FormikForm.errors.domain ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.domain}
                      </FormFeedback>
                    ) : null}
                  </div>
                   {!FormikForm.errors.domain && (
                    <div id="passwordHelpBlock" className="form-text">
                      Enter Domain Name.
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

export default ContactGroupForm;
