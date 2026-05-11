import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Form,
  FormFeedback,
  Input,
  Label,
  Button,
  FormGroup,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import EmojiPicker from "emoji-picker-react";
import { Smile } from "react-feather";
import { toggleRSBView } from "../../../redux/reducers/ChildReducer/RightSideBarReducer";
import { toast } from "react-toastify";
import { PostApi } from "../../../common/api/PostApi";
import {
  addCustomStatus,
  editCustomStatus,
} from "../../../redux/reducers/ChildReducer/CustomStatusReducer";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { PutApi } from "../../../common/api/PutApi";

const CustomStatusForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);

  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const HandleCustomStatusSaveAPI = async (values) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        icon: values.emoji,
        is_active: values.is_active,
      };

      const isNew = !values.id;
      let response;

      if (isNew) {
        response = await PostApi("attendance/custom-statuses/", payload, true);
      } else {
        response = await PutApi(
          `attendance/custom-statuses/${values.id}/`,
          payload,
          true,
        );
      }

      const savedData = response?.data?.data || response?.data || null;

      if ([200, 201].includes(response?.status) && savedData) {
        // ✅ Normalize: always store as { emoji, is_active } so the table
        //    reads consistent field names from Redux
        const normalizedData = {
          ...savedData,
          emoji: savedData.emoji ?? savedData.icon ?? values.emoji,
          is_active: savedData.is_active ?? values.is_active,
        };

        // ✅ Dispatch updates CustomStatusReducer.custom_status_data,
        //    which CustomStatus.jsx now reads correctly via useSelector
        isNew
          ? dispatch(addCustomStatus(normalizedData))
          : dispatch(editCustomStatus(normalizedData));

        // Sync localStorage
        let existingData = GetLocalStorageData("custom_statuses") || [];
        existingData = existingData.filter((i) => i && typeof i === "object");

        const updatedData = isNew
          ? [...existingData, normalizedData]
          : existingData.map((i) =>
              i.id === normalizedData.id ? normalizedData : i,
            );

        localStorage.setItem("custom_statuses", JSON.stringify(updatedData));

        let global =
          JSON.parse(localStorage.getItem("lint_hr_globaldata")) || {};
        global["custom_statuses"] = updatedData;
        localStorage.setItem("lint_hr_globaldata", JSON.stringify(global));

        toast.success(
          isNew
            ? "Custom status added successfully."
            : "Custom status updated successfully.",
        );

        dispatch(toggleRSBView(false));
      } else {
        toast.error(
          response?.data?.message || response?.data?.detail || "Failed to save",
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.detail ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: form_obj?.id || null,
      name: form_obj?.name || "",
      emoji: form_obj?.emoji ?? form_obj?.icon ?? "",
      is_active: form_obj?.is_active ?? form_obj?.active ?? true,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Status Name").min(2),
      emoji: Yup.string().required("Please Select an Emoji"),
    }),
    onSubmit: HandleCustomStatusSaveAPI,
  });

  const handleEmojiClick = (emojiData) => {
    formik.setFieldValue("emoji", emojiData.emoji);
    setShowPicker(false);
  };

  const isEdit = !!formik.values.id;

  return (
    <Row>
      <Col xl={12}>
        <Form onSubmit={formik.handleSubmit}>
          <Row>
            {/* Name */}
            <Col md={12}>
              <FormGroup>
                <Label>Name *</Label>
                <Input
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  invalid={formik.touched.name && !!formik.errors.name}
                />
                <FormFeedback>{formik.errors.name}</FormFeedback>
              </FormGroup>
            </Col>

            {/* Emoji */}
            <Col md={12}>
              <FormGroup className="position-relative">
                <Label>
                  <Smile size={16} /> Status Icon *
                </Label>

                <div ref={pickerRef}>
                  <div
                    className="form-control d-flex justify-content-between"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPicker((prev) => !prev)}
                  >
                    <span>{formik.values.emoji || "Pick an Emoji"}</span>
                    <Smile size={18} />
                  </div>

                  {formik.touched.emoji && formik.errors.emoji && (
                    <div className="text-danger small mt-1">
                      {formik.errors.emoji}
                    </div>
                  )}

                  {showPicker && (
                    <div style={{ position: "absolute", zIndex: 999 }}>
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
              </FormGroup>
            </Col>

            {/* Toggle only in Edit mode */}
            {isEdit && (
              <Col md={12} lg={12} xxl={12}>
                <div>
                  <Label htmlFor="is_active" className="form-label">
                    Status
                  </Label>
                  <div className="mb-2">
                    <div
                      className="form-check form-switch form-switch-md form-switch-success"
                      dir="ltr"
                    >
                      <Input
                        id="is_active"
                        name="is_active"
                        type="checkbox"
                        className="form-check-input"
                        checked={formik.values.is_active}
                        onChange={(e) =>
                          formik.setFieldValue("is_active", e.target.checked)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="form-text mb-3">
                  Status is currently{" "}
                  <b>
                    <i>{formik.values.is_active ? "Active" : "Inactive"}</i>
                  </b>
                </div>
              </Col>
            )}

            {/* Submit */}
            <Col>
              <div className="text-end">
                <Button color="success" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
  );
};

export default CustomStatusForm;
