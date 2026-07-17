import React, { useEffect, useState } from "react";
import { Col, Form, FormFeedback, Input, Label, Row, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  addPriorities,
  editPriorities,
} from "../../../redux/reducers/ChildReducer/PrioritiesReducer";
import { toast } from "react-toastify";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setLoaderVisible } from "../../../redux/reducers/ChildReducer/LoaderReducer";
import { PostApi } from "../../../common/api/PostApi";
import { PutApi } from "../../../common/api/PutApi";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { loadAnimation } from "lottie-web";
import { defineElement } from "lord-icon-element";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";

defineElement(loadAnimation);

const PrioritiesForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const [prioritiesData, setPrioritiesData] = useState({
      id: 0,
      name: "",
      color: "#000000",
      description: "",
      status: true,
  });

  // ================= SYNC form_obj INTO LOCAL STATE =================
  useEffect(() => {
    if (form_obj) {
      // setPrioritiesData(form_obj);
          setPrioritiesData({
      id: form_obj.id || 0,
      name: form_obj.name || "",
      color: form_obj.color || "#000000",
      description: form_obj.description || "",
      status: form_obj.status !== undefined ? form_obj.status : true,
    });
    }
  }, [form_obj]);

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setPrioritiesData((prev) => ({ ...prev, [name]: value }));
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let inputValue = value;

    if (name === "name") {
      inputValue = value
        .replace(/^\s+/, "")
        .replace(/[^a-zA-Z0-9\s.,\-&()']/g, "");

      if (inputValue.length > 50) {
        FormikForm.setFieldError(
          "name",
          "Status name is too long. Please keep it within 50 characters."
        );
      } else {
        FormikForm.setFieldError("name", undefined);
      }
    }

    if (name === "color") {
      inputValue = value
      .replace(/^\s+/, "")
      .replace(/[^a-zA-Z0-9\s.,\-&()']/g, "");
      if (inputValue.length > 50) {
      FormikForm.setFieldError(
        "name",
        "Priority name is too long. Please keep it within 50 characters."
      );
    }
    }

    if (name === "description") {
      inputValue = value
      .replace(/^\s+/, "")
      .replace(
        /[^a-zA-Z0-9\s.,!?'"_\-()&:;/]/g,
        ""
      );

      if (inputValue.length > 200) {
        FormikForm.setFieldError(
          "description",
          "Description is too long. Please keep it within 200 characters."
        );
      } else {
        FormikForm.setFieldError("description", undefined);
      }
    }

    setPrioritiesData((prev) => ({
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
    initialValues: prioritiesData,
    validationSchema: Yup.object({
      // name: Yup.string().required("Please Enter Priority Name"),

      name: Yup.string()
        .matches(
          /^[a-zA-Z0-9\s.,\-&()']+$/,
          "Priority name can only contain letters, numbers, spaces, and . , - & ( ) '"
        )
        .required("Please Enter Priority Name")
        .min(1, "Please Enter Priority Name")
        .max(50, "Priority name is too long. Please keep it within 50 characters.")
        .test(
          "not-only-spaces",
          "Please Enter Priority Name",
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
          "Description can contain only alphabets, numbers, spaces, and . , ! ? \" ' - _ ( ) & : ; /"
        )
        .max(
          200,
          "Description is too long. Please keep it within 200 characters."
        ),
    }),

    onSubmit: async () => {

      const trimmedName = prioritiesData.name?.trim();

      if (!trimmedName) {
        FormikForm.setFieldTouched("name", true);
        FormikForm.setFieldError("name", "Please Enter Priority Name");
        return;
      }

      if (trimmedName.length > 50) {
        FormikForm.setFieldTouched("name", true);
        FormikForm.setFieldError(
          "name",
          "Priority name is too long. Please keep it within 50 characters."
        );
        return;
      }

      if (!prioritiesData.color?.trim()) {
        FormikForm.setFieldTouched("color", true);
        FormikForm.setFieldError(
          "color",
          "Please enter a value or select a color."
        );
        return;
      }

      if (prioritiesData.color.length > 25) {
        FormikForm.setFieldTouched("color", true);
        FormikForm.setFieldError(
          "color",
          "Color value must not exceed 25 characters."
        );
        return;
      }
      // Description validation
      if (
        prioritiesData.description &&
        prioritiesData.description.length > 200
      ) {
        FormikForm.setFieldTouched("description", true);
        FormikForm.setFieldError(
          "description",
          "Description is too long. Please keep it within 200 characters."
        );
        return;
      }
      dispatch(setLoaderVisible(true));

      try {
        
        const isEdit = prioritiesData?.id && prioritiesData.id !== 0;

        // ── API call ────────────────────────────────────────────────
        const Api = isEdit
          ? await PutApi("task-priority/", prioritiesData, false)
          : await PostApi("task-priority/", prioritiesData, false);

        if (Api?.status === 200 || Api?.status === 201) {
          const responseData = Api?.data?.data;

          // ================= REDUX UPDATE =================
          dispatch(
            isEdit ? editPriorities(responseData) : addPriorities(responseData),
          );

          // ================= LOCAL STORAGE UPDATE =================
          const oldPriorities = GetLocalStorageData("task_priority") || [];
          let updatedPriorities = [];

          if (isEdit) {
            updatedPriorities = oldPriorities.map((item) =>
              item.id === responseData.id ? responseData : item,
            );
            SetLocalStorage("task_priority", updatedPriorities, 1);
          } else {
            updatedPriorities = [...oldPriorities, responseData];
            SetLocalStorage("task_priority", updatedPriorities, 1);
          }

          toast.success(Api?.data?.message || "Success");
          dispatch(toggleRSBView(false));
        } else {
          toast.error(
            Api?.data?.message || Api?.data?.detail || "Something went wrong",
          );
        }
      } catch (error) {
        console.error(error);
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
              {/* ── Priority Name ─────────────────────────────────── */}
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="name" className="form-label">
                    Priority Name *
                  </Label>
                  <div className="form-icon right">
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      className="form-control"
                      placeholder="Priority Name"
                      value={prioritiesData.name || ""}
                      onChange={handleInputChange}
                      onBlur={FormikForm.handleBlur}
                      invalid={!!FormikForm.errors.name}
                    />
                    {!FormikForm.errors.name && (
                      <i className="ri-flag-line" />
                    )}
                    {FormikForm.errors.name ? (
                      <FormFeedback type="invalid">
                        {FormikForm.errors.name}
                      </FormFeedback>
                    ) : null}
                  </div>
                  {!FormikForm.errors.name && (
                    <div className="form-text">Enter Priority Name.</div>
                  )}
                </div>
              </Col>

              {/* ── Color ─────────────────────────────────────────── */}
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
                      value={prioritiesData.color || "#000000"}
                      onChange={(e) =>
                        setPrioritiesData((prev) => ({
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
                      value={prioritiesData.color || ""}
                      onChange={handleInputChange}
                      onBlur={FormikForm.handleBlur}
                      invalid={!!FormikForm.errors.color}
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
                      Pick or type a color name / hex code. Invalid values will default to black (#000000).
                    </div>
                  )}

                </div>
              </Col>

              {/* ── Description ───────────────────────────────────── */}
              <Col md={12} lg={12} xxl={12}>
                <div className="mb-3">
                  <Label htmlFor="description" className="form-label">
                    Description
                  </Label>
                  <Input
                    type="textarea"
                    className="form-control"
                    id="description"
                    name="description"
                    value={prioritiesData.description || ""}
                    onChange={handleInputChange}
                    invalid={!!FormikForm.errors.description}
                  />
                  {FormikForm.errors.description ? (
                    <FormFeedback type="invalid">
                      {FormikForm.errors.description}
                    </FormFeedback>
                  ) : (
                    <div className="form-text">
                      Description (Optional).
                    </div>
                  )}
                </div>
              </Col>


              {prioritiesData?.id > 0 && (
                <Col md={12}>
                  <div>
                    <Label htmlFor="priority_status" className="form-label">
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
                          id="priority_status"
                          checked={prioritiesData.status || false}
                          onChange={(e) =>
                            setPrioritiesData((prev) => ({
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

              {/* ── Submit ────────────────────────────────────────── */}
              <Col lg={12}>
                <div className="text-end">
                  <Button color="success" className="btn-label" type="submit">
                    <i className="ri-check-double-line label-icon align-middle fs-16 me-2" />
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

export default PrioritiesForm;
