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
  addPiriorities,
  editPiriorities,
} from "../../../redux/reducers/ChildReducer/PirioritiesReducer";

import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";

import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
// import { Api } from "../../common/api/Api";
// import { toast } from "react-toastify";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
// import { PostApi } from "../../common/api/PostApi";

import { useFormik } from "formik";
import * as Yup from "yup";
import { PostApi } from "../../../common/api/PostApi";
import { toast } from "react-toastify";
// import { SetLocalStorage } from "../../meta/SetLocalStorageData";

// register lottie and define custom element
defineElement(loadAnimation);

const PirioritiesForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const [pirioritiesData, setPirioritiesData] = useState({});

  const { Piriorities_data } = useSelector((state) => state.PirioritiesReducer);

  useEffect(() => {
    if (form_obj) {
      console.log("form_obj", form_obj);

      setPirioritiesData(form_obj);
    }
  }, [form_obj]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPirioritiesData({
      ...pirioritiesData,
      [name]: value,
    });
  };

  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: pirioritiesData,
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Status  Name"),
    }),
    onSubmit: async (values) => {
      console.log("SUCCESSSS !!!! Formik Values = ", values);

      dispatch(setLoaderVisible(true));

      const Api = await PostApi("priority/save-priority/", values, false);
      console.log("API RES = ", Api);

      if (Api.status && Api.status === 200) {
        console.log("API Success === ", Api);

        if (pirioritiesData.id === 0) {
          dispatch(addPiriorities(Api?.data.data));
          // SetLocalStorage("status", Api?.data.data, 2);
          dispatch(setLoaderVisible(false));
        } else {
          dispatch(editPiriorities(Api?.data?.data));
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
          <Form onSubmit={FormikForm.handleSubmit}>
            <Row>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="name" className="form-label">
                    Piriorities Name *
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      className="form-control"
                      placeholder="Status Name"
                      value={pirioritiesData.name || ""}
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
                      Enter Piriorities Name.
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
                    value={pirioritiesData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label className="form-label" htmlFor="lt_desc">
                    Help text for agents
                  </Label>
                  <Input
                    type="textarea"
                    className="form-control"
                    id="help_text"
                    name="help_text"
                    value={pirioritiesData.help_text}
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

export default PirioritiesForm;
