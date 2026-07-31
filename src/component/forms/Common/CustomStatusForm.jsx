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
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";

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
        location_required: values.location_required,
        notes_required: values.notes_required,
        is_break: values.is_break,
      };

      const isNew = !values.id;
      let response;

      if (isNew) {
        response = await PostApi(
          "attendance/custom-statuses/v2/",
          payload,
          true,
        );
      } else {
        response = await PutApi(
          `attendance/custom-statuses/${values.id}/v2/`,
          payload,
          true,
        );
      }

      const savedData = response?.data?.data || response?.data || null;

      if ([200, 201].includes(response?.status) && savedData) {
        const normalizedData = {
          ...savedData,
          emoji: savedData.emoji ?? savedData.icon ?? values.emoji,
          is_active: savedData.is_active ?? values.is_active,
          location_required:
            savedData.location_required ?? values.location_required,
          notes_required: savedData.notes_required ?? values.notes_required,
        };

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

        SetLocalStorage("custom_statuses", JSON.stringify(updatedData));

        let global =
          JSON.parse(localStorage.getItem("lint_hr_globaldata")) || {};
        global["custom_statuses"] = updatedData;
        SetLocalStorage("lint_hr_globaldata", JSON.stringify(global));

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
      location_required: form_obj?.location_required ?? false,
      notes_required: form_obj?.notes_required ?? false,
      is_break: form_obj?.is_break ?? false,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .matches(/^[A-Za-z0-9\s.,&()'-]+$/, "Please Enter Status Name")
        .min(1, "Please Enter Status Name")
        .max(50, "Status name cannot exceed 50 characters")
        .required("Please Enter Status Name"),
      emoji: Yup.string().required("Please Select an Emoji"),
    }),
    onSubmit: HandleCustomStatusSaveAPI,
  });

  const handleStatusNameChange = (e) => {
    const { name, value } = e.target;

    const val = value.replace(/[^A-Za-z0-9\s.,&()'-]/g, "");

    formik.setFieldValue(name, val);
    formik.setFieldTouched(name, true, false);

    if (val.length > 50) {
      formik.setFieldError(name, "Status name cannot exceed 50 characters");
    } else {
      formik.setFieldError(name, undefined);
    }
  };

  const handleEmojiClick = (emojiData) => {
    formik.setFieldValue("emoji", emojiData.emoji);
    setShowPicker(false);
  };

  const isEdit = !!formik.values.id;

  // const ToggleField = ({ id, label, helpText }) => (
  //   <Col md={12} lg={12} xxl={12}>
  //     <div>
  //       <Label htmlFor={id} className="form-label">
  //         {label}
  //       </Label>
  //       <div className="mb-2">
  //         <div
  //           className="form-check form-switch form-switch-md form-switch-success"
  //           dir="ltr"
  //         >
  //           <Input
  //             id={id}
  //             name={id}
  //             type="checkbox"
  //             className="form-check-input"
  //             checked={formik.values[id]}
  //             onChange={(e) => formik.setFieldValue(id, e.target.checked)}
  //           />
  //         </div>
  //       </div>
  //     </div>
  //     <div className="form-text mb-3">
  //       {helpText}{" "}
  //       <b>
  //         <i>{formik.values[id] ? "Yes" : "No"}</i>
  //       </b>
  //     </div>
  //   </Col>
  // );

  const ToggleField = ({ id, label, helpText }) => (
    <Col md={12} lg={12} xxl={12}>
      <div>
        <Label htmlFor={id} className="form-label">
          {label}
        </Label>
        <div className="mb-2">
          <div
            className="form-check form-switch form-switch-md form-switch-success"
            dir="ltr"
          >
            <Input
              id={id}
              name={id}
              type="checkbox"
              className="form-check-input"
              checked={formik.values[id]}
              onChange={(e) => formik.setFieldValue(id, e.target.checked)}
            />
          </div>
        </div>
      </div>
      {helpText && (
        <div className="form-text mb-3">
          {helpText}{" "}
          <b>
            <i>{formik.values[id] ? "Yes" : "No"}</i>
          </b>
        </div>
      )}
    </Col>
  );

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
                  onChange={handleStatusNameChange}
                  onBlur={() => formik.setFieldTouched("name", true)}
                  invalid={!!formik.errors.name}
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
            {/* Location Required — always visible */}
            <ToggleField id="location_required" label="Location Required" />

            {/* Notes Required — always visible */}
            <ToggleField id="notes_required" label="Notes Required" />

            {/* Break Status — always visible */}
            <ToggleField
              id="is_break"
              label="Exclude from Working Hours"
              helpText=" When enabled, time logged will not be counted toward working hours"
            />

            {/* Toggle only in Edit mode */}
            {isEdit && (
              <ToggleField
                id="is_active"
                label="Status"
                helpText="Status is currently"
              />
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
