import React, { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Col, Form, FormFeedback, Input, Label, Row, Button } from "reactstrap";

import Select from "react-select";

import { setStatus } from "../../../redux/reducers/ChildReducer/StatusReducer";

import { loadAnimation } from "lottie-web";

import { defineElement } from "lord-icon-element";

import { toast } from "react-toastify";

import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";

import { useFormik } from "formik";

import * as Yup from "yup";

import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";

import { PostApi } from "../../../common/api/PostApi";

import { PutApi } from "../../../common/api/PutApi";

import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";

defineElement(loadAnimation);

const StatusForm = () => {
  const dispatch = useDispatch();

  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  // ================= STATE =================
  const [statusData, setStatusData] = useState({
    id: 0,
    name: "",
    color: "#000000",
    description: "",
    status: true,
  });

  // ================= EDIT DATA =================
  useEffect(() => {
    if (form_obj) {
      setStatusData({
        id: form_obj.id || 0,
        name: form_obj.name || "",
        color: form_obj.color || "#000000",
        description: form_obj.description || "",
        status: form_obj.status !== undefined ? form_obj.status : true,
      });
    }
  }, [form_obj]);

  // ================= INPUT CHANGE =================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const inputValue =
      name === "name" ? value.replace(/[^a-zA-Z\s\-_]/g, "") : value;

    setStatusData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));

    FormikForm.setFieldValue(name, inputValue);

    if (FormikForm.touched[name]) {
      FormikForm.validateField(name);
    }
  };

  // ================= FORMIK =================
  const FormikForm = useFormik({
    enableReinitialize: true,

    initialValues: statusData,

    validationSchema: Yup.object({
      name: Yup.string()
        .matches(
          /^[A-Za-z\s\-_]+$/,
          "Status name should contain only letters, spaces, hyphens or underscores",
        )
        .required("Please Enter the status name")
        .test(
          "not-only-spaces",
          "Please Enter the status name",
          (value) => !value || value.trim().length > 0,
        ),
    }),

    // ================= SUBMIT =================
    onSubmit: async () => {
      const trimmedName = statusData.name.trim();

      if (!trimmedName) {
        FormikForm.setFieldTouched("name", true);
        FormikForm.setFieldError("name", "Please Enter the status name");
        return;
      }
      dispatch(setLoaderVisible(true));

      try {
        const isEdit = statusData?.id && Number(statusData.id) !== 0;

        const payload = {
          ...statusData,
          name: trimmedName,
        };

        // ================= API =================
        const response = isEdit
          ? await PutApi("task-status/", payload, false)
          : await PostApi("task-status/", payload, false);

        console.log("FULL API RESPONSE =", response);

        // ================= SUCCESS =================
        if (response?.status === 200 || response?.status === 201) {
          // IMPORTANT FIX
          const responseData = response?.data?.data || response?.data;

          console.log("RESPONSE DATA =", responseData);

          if (!responseData?.id) {
            toast.error("Invalid API Response");
            dispatch(setLoaderVisible(false));
            return;
          }

          // ================= OLD LOCAL =================
          const oldStatus = GetLocalStorageData("task_status") || [];

          let updatedStatus = [];

          // ================= EDIT =================
          if (isEdit) {
            updatedStatus = oldStatus.map((item) =>
              Number(item.id) === Number(responseData.id) ? responseData : item,
            );
            SetLocalStorage("task_status", updatedStatus, 1);
          }

          // ================= ADD =================
          else {
            updatedStatus = [...oldStatus, responseData];
            SetLocalStorage("task_status", updatedStatus, 1);
          }

          // ================= REDUX =================
          dispatch(setStatus(updatedStatus));

          // ================= SUCCESS =================
          toast.success(response?.data?.message || "Status Saved Successfully");

          dispatch(toggleRSBView(false));
        } else {
          toast.error(
            response?.data?.message ||
              response?.data?.detail ||
              "Something went wrong",
          );
        }
      } catch (error) {
        console.log("ERROR =", error);

        toast.error("API Error");
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
              {/* STATUS NAME */}
              <Col md={12}>
                <div className="mb-3">
                  <Label className="form-label">Status Name *</Label>

                  <Input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Status Name"
                    value={statusData.name}
                    onChange={handleInputChange}
                    onBlur={FormikForm.handleBlur}
                    invalid={
                      FormikForm.touched.name && !!FormikForm.errors.name
                    }
                  />

                  <FormFeedback>{FormikForm.errors.name}</FormFeedback>
                </div>
              </Col>

              {/* COLOR */}
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="color" className="form-label">
                    Color
                  </Label>
                  <div className="d-flex align-items-center gap-3">
                    <Input
                      type="color"
                      name="color"
                      id="color_picker"
                      style={{
                        width: 48,
                        height: 38,
                        padding: 2,
                        cursor: "pointer",
                      }}
                      value={statusData.color || "#000000"}
                      onChange={(e) =>
                        setStatusData((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="text"
                      name="color"
                      id="color"
                      className="form-control"
                      placeholder="e.g. lightgreen or #90ee90"
                      value={statusData.color || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-text">
                    Pick or type a color name / hex code.
                  </div>
                </div>
              </Col>

              {/* DESCRIPTION */}
              <Col md={12}>
                <div className="mb-3">
                  <Label className="form-label">Description</Label>

                  <Input
                    type="textarea"
                    name="description"
                    className="form-control"
                    value={statusData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>

              {/* SAVE */}
              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label" type="submit">
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i>
                    Save
                  </Button>
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
