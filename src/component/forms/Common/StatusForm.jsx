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

    // const inputValue =
    //   name === "name" ? value.replace(/[^a-zA-Z\s\-_]/g, "") : value;

    let inputValue = value;

    if (name === "name") {
      inputValue = value
        .replace(/^\s+/, "")
        .replace(/[^a-zA-Z0-9\s.,\-&()']/g, "");

      if (inputValue.length > 50) {
        FormikForm.setFieldError(
          "name",
          "Status name is too long. Please keep it within 50 characters.",
        );
      } else {
        FormikForm.setFieldError("name", undefined);
      }
    }

    if (name === "color") {
      inputValue = value.replace(/^\s+/, "");
    }

    if (name === "description") {
      inputValue = value
        .replace(/^\s+/, "")
        .replace(/[^a-zA-Z0-9\s.,!?'"_\-()&:;/]/g, "");

      if (inputValue.length > 200) {
        FormikForm.setFieldError(
          "description",
          "Description is too long. Please keep it within 200 characters.",
        );
      } else {
        FormikForm.setFieldError("description", undefined);
      }
    }

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
          /^[a-zA-Z0-9\s.,\-&()']+$/,
          "Status name can only contain letters, numbers, spaces, and . , - & ( ) '",
        )
        .required("Please Enter the status name")
        .min(1, "Please Enter the status name")
        .max(
          50,
          "Status name is too long. Please keep it within 50 characters.",
        )
        .test(
          "not-only-spaces",
          "Please Enter the status name",
          (value) => !value || value.trim().length > 0,
        ),

      color: Yup.string()
        .trim()
        .required("Please enter a value or select a color.")
        .max(25, "Color value must not exceed 25 characters."),

      description: Yup.string()
        .trim()
        .matches(
          /^[a-zA-Z0-9\s.,!?'"_\-()&:;/]*$/,
          "Description can contain only alphabets, numbers, spaces, and . , ! ? \" ' - _ ( ) & : ; /",
        )
        .max(
          200,
          "Description is too long. Please keep it within 200 characters.",
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

      if (trimmedName.length > 50) {
        FormikForm.setFieldTouched("name", true);
        FormikForm.setFieldError(
          "name",
          "Status name is too long. Please keep it within 50 characters.",
        );
        return;
      }

      if (statusData.description && statusData.description.length > 200) {
        FormikForm.setFieldTouched("description", true);
        FormikForm.setFieldError(
          "description",
          "Description is too long. Please keep it within 200 characters.",
        );
        return;
      }

      if (!statusData.color?.trim()) {
        FormikForm.setFieldTouched("color", true);
        FormikForm.setFieldError(
          "color",
          "Please enter a value or select a color.",
        );
        return;
      }

      if (statusData.color.length > 25) {
        FormikForm.setFieldTouched("color", true);
        FormikForm.setFieldError(
          "color",
          "Color value must not exceed 25 characters.",
        );
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
              "Status name already exists, so you cannot create a duplicate status.",
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
                      // FormikForm.touched.name &&
                      !!FormikForm.errors.name
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
                      onBlur={FormikForm.handleBlur}
                      invalid={
                        // FormikForm.touched.color &&
                        !!FormikForm.errors.color
                      }
                    />
                  </div>
                  {/* <div className="form-text">
                    Pick or type a color name / hex code. Invalid values will default to black (#000000).
                  </div> */}

                  {FormikForm.errors.color ? (
                    <FormFeedback type="invalid" style={{ display: "block" }}>
                      {FormikForm.errors.color}
                    </FormFeedback>
                  ) : (
                    <div className="form-text">
                      Pick or type a color name / hex code. Invalid values will
                      default to black (#000000).
                    </div>
                  )}
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
                    value={statusData.description || ""}
                    onChange={handleInputChange}
                    invalid={!!FormikForm.errors.description}
                  />
                  {FormikForm.errors.description ? (
                    <FormFeedback type="invalid">
                      {FormikForm.errors.description}
                    </FormFeedback>
                  ) : (
                    <div className="form-text">Description (Optional).</div>
                  )}
                </div>
              </Col>

              {statusData?.id > 0 && (
                <Col md={12}>
                  <div>
                    <Label htmlFor="status_toggle" className="form-label">
                      Status
                    </Label>

                    <div className="mb-2">
                      <div
                        className="form-check form-switch form-switch-md form-switch-success"
                        dir="ltr"
                      >
                        <Input
                          type="checkbox"
                          className="form-check-input form-switch-md"
                          id="status_toggle"
                          checked={statusData.status || false}
                          onChange={(e) =>
                            setStatusData((prev) => ({
                              ...prev,
                              status: e.target.checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              )}

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
