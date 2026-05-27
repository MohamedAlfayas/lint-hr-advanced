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

  const [prioritiesData, setPrioritiesData] = useState({});

  // ================= SYNC form_obj INTO LOCAL STATE =================
  useEffect(() => {
    if (form_obj) {
      setPrioritiesData(form_obj);
    }
  }, [form_obj]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrioritiesData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= FORMIK =================
  const FormikForm = useFormik({
    enableReinitialize: true,
    initialValues: prioritiesData,
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Priority Name"),
    }),

    onSubmit: async () => {
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
                      invalid={
                        FormikForm.touched.name && FormikForm.errors.name
                          ? true
                          : false
                      }
                    />
                    {!FormikForm.touched.name && !FormikForm.errors.name && (
                      <i className="ri-flag-line" />
                    )}
                    {FormikForm.touched.name && FormikForm.errors.name ? (
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
                    />
                  </div>
                  <div className="form-text">
                    Pick or type a color name / hex code.
                  </div>
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
                  />
                </div>
              </Col>

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
