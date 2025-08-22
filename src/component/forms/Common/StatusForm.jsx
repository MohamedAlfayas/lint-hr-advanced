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
    addStatus,
    editStatus,
} from "../../../redux/reducers/ChildReducer/StatusReducer";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import { behaviorTypeOptions } from "../../../common/constant/Constants";
import { toast } from "react-toastify";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";


import { useFormik } from "formik";
import * as Yup from "yup";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../../common/api/PostApi";
// import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
// import { SetLocalStorage } from "../../meta/SetLocalStorageData";

// register lottie and define custom element
defineElement(loadAnimation);

const StatusForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
 
  const [statusData, setStatusData] = useState({});
  const [selectedBehavior, setSelectedBehavior] = useState([]);

  const { status_data } = useSelector(
    (state) => state.StatusReducer
  );



  

 useEffect(() => {
    if (form_obj) {
        console.log("form_obj", form_obj);
        
      setStatusData(form_obj);
    }
  }, [form_obj]);

 

  

 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStatusData({
      ...statusData,
      [name]: value,
    });
  };
  const handleBehaviorChange = (obj) => {
    setSelectedBehavior(obj);
    setStatusData({
      ...statusData,
      behavior: obj.value,
    });

    
  };

  
  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: statusData,
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Status  Name"),
   
    }),

   
    onSubmit: async (values) => {
      dispatch(setLoaderVisible(true));

      const Api = await PostApi("task-status/create/", values, false);
      console.log("API RES = ", Api);
      
   
      
      if (Api.status && Api.status === 200) {
        if (statusData.id === 0) {
          dispatch(addStatus(Api?.data.data));
          // SetLocalStorage("status", Api?.data.data, 2);
          dispatch(setLoaderVisible(false));

        } else {
          dispatch(editStatus(Api?.data?.data));
          dispatch(setLoaderVisible(false));

          // SetLocalStorage("status", Api?.data.data, 3);
        }

        dispatch(toggleRSBView(false));
        toast.success(Api?.data?.message);
      } else {
        toast.error(Api?.data?.message || Api?.data?.detail);
      }

      dispatch(setLoaderVisible(false));
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
                    Status Name *
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      className="form-control"
                      placeholder="Status Name"
                      value={statusData.name || ""}
                      onChange={handleInputChange}
                      invalid={
                        FormikForm.touched.name && FormikForm.errors.name
                          ? true
                          : false
                      }
                    />
                    {!FormikForm.touched.name && !FormikForm.errors.name && (
                      <i className="ri-chat-new-line" />
                    )}
                    {FormikForm.touched.name && FormikForm.errors.name ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.name}
                      </FormFeedback>
                    ) : null}
                  </div>
                   {!FormikForm.errors.name && (
                    <div id="passwordHelpBlock" className="form-text">
                      Enter Status Name.
                    </div>
                  )} 
                  
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label className="form-label" htmlFor="lt_desc">
                   Status Color *
                  </Label>
                  <Input
                    type="color"
                    className="form-control"
                    id="color"
                    name="color"
                    value={statusData.color || "#000000"} 
                    onChange={handleInputChange}
                  />
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label className="form-label" htmlFor="lt_desc">
                   Behavior *
                  </Label>
                  <Select
                    name="behavior"
                    isMulti={false}
                    options={behaviorTypeOptions || []}
                    className="basic-multi-select"
                    
                    value={behaviorTypeOptions.find(d => d.value === statusData.behavior) || []}
                    onChange={handleBehaviorChange}
                   
                  />
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
                    value={statusData.description}
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

export default StatusForm;
