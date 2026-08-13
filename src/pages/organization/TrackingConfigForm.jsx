import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormFeedback,
  Label,
  Input,
  Button,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { GetApi } from "../../common/api/GetApi";
import { PostApi } from "../../common/api/PostApi";
import { PutApi } from "../../common/api/PutApi";
import { setTrackingConfig } from "../../redux/reducers/ChildReducer/TrackingConfigReducer";

const CONFIG_ENDPOINT = "tracking/configuration/";

const TrackingConfigForm = () => {
  const dispatch = useDispatch();
  const { tracking_config_data } = useSelector(
    (state) => state.TrackingConfigReducer,
  );

  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const HandleFetchConfig = async () => {
    setFetching(true);
    try {
      const response = await GetApi(CONFIG_ENDPOINT, true);
      const data = response?.data?.data || response?.data || null;

      if (response?.status === 200 && data) {
        dispatch(setTrackingConfig(data));
      } else {
        toast.error(
          response?.data?.message ||
            response?.data?.detail ||
            "Failed to load configuration",
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
      setFetching(false);
    }
  };

  useEffect(() => {
    HandleFetchConfig();
  }, []);

  const HandleConfigSaveAPI = async (values) => {
    setLoading(true);
    try {
      const payload = {
        still_mode_interval: Number(values.still_mode_interval),
        move_mode_interval: Number(values.move_mode_interval),
        always_track_on_interval: values.always_track_on_interval,
        tracking_radius_range: Number(values.tracking_radius_range),
      };

      const hasId = !!values.id;

      const response = hasId
        ? await PutApi(CONFIG_ENDPOINT, payload, true)
        : await PostApi(CONFIG_ENDPOINT, payload, true);

      const savedData = response?.data?.data || response?.data || null;

      if ([200, 201].includes(response?.status) && savedData) {
        dispatch(setTrackingConfig(savedData));
        toast.success("Configuration updated successfully.");
        setIsEditable(false);
      } else {
        toast.error(
          response?.data?.message ||
            response?.data?.detail ||
            "Failed to save configuration",
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
      id: tracking_config_data?.id || null,
      still_mode_interval: tracking_config_data?.still_mode_interval ?? "",
      move_mode_interval: tracking_config_data?.move_mode_interval ?? "",
      always_track_on_interval:
        tracking_config_data?.always_track_on_interval ?? false,
      tracking_radius_range: tracking_config_data?.tracking_radius_range ?? "",
    },
    validationSchema: Yup.object({
      still_mode_interval: Yup.number()
        .typeError("Please Enter Still Mode Interval")
        .required("Please Enter Still Mode Interval")
        .min(60, "Must be at least 60 seconds")
        .moreThan(
          Yup.ref("move_mode_interval"),
          "Must be greater than Move Mode Interval",
        ),
      move_mode_interval: Yup.number()
        .typeError("Please Enter Move Mode Interval")
        .required("Please Enter Move Mode Interval")
        .min(5, "Must be at least 5 seconds"),
      tracking_radius_range: Yup.number()
        .typeError("Please Enter Tracking Radius Range")
        .required("Please Enter Tracking Radius Range")
        .min(10, "Must be at least 10 meters"),
      always_track_on_interval: Yup.boolean().required(),
    }),
    onSubmit: HandleConfigSaveAPI,
  });

  const handleNumberOnly = (e, field, maxLen) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, maxLen);
    formik.setFieldValue(field, val);
    formik.setFieldTouched(field, true, false);
  };

  const handleCancel = () => {
    formik.resetForm({
      values: {
        id: tracking_config_data?.id || null,
        still_mode_interval: tracking_config_data?.still_mode_interval ?? "",
        move_mode_interval: tracking_config_data?.move_mode_interval ?? "",
        always_track_on_interval:
          tracking_config_data?.always_track_on_interval ?? false,
        tracking_radius_range:
          tracking_config_data?.tracking_radius_range ?? "",
      },
    });
    setIsEditable(false);
  };

  const isInvalid = (name) =>
    Boolean(formik.touched[name] && formik.errors[name]);

  return (
    <Row>
      <Col xl={9} lg={8}>
        <Card>
          <CardBody>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="mb-0 fw-semibold text-uppercase">
                Tracking Configuration
              </h6>
              {!isEditable && !fetching && (
                <button
                  type="button"
                  className="btn btn-icon btn-sm btn-soft-info"
                  onClick={() => setIsEditable(true)}
                  title="Edit"
                >
                  <i className="ri-pencil-fill" />
                </button>
              )}
            </div>

            <Form onSubmit={formik.handleSubmit} noValidate>
              <Row className="gy-4">
                <Col md={6}>
                  <Label htmlFor="still_mode_interval" className="form-label">
                    Still Mode Interval (sec) <span>*</span>
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    id="still_mode_interval"
                    name="still_mode_interval"
                    disabled={!isEditable || fetching}
                    value={formik.values.still_mode_interval}
                    onChange={(e) =>
                      handleNumberOnly(e, "still_mode_interval", 5)
                    }
                    onBlur={() =>
                      formik.setFieldTouched("still_mode_interval", true)
                    }
                    invalid={isInvalid("still_mode_interval")}
                  />
                  <FormFeedback>
                    {formik.errors.still_mode_interval}
                  </FormFeedback>
                </Col>

                <Col md={6}>
                  <Label htmlFor="move_mode_interval" className="form-label">
                    Move Mode Interval (sec) <span>*</span>
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    id="move_mode_interval"
                    name="move_mode_interval"
                    disabled={!isEditable || fetching}
                    value={formik.values.move_mode_interval}
                    onChange={(e) =>
                      handleNumberOnly(e, "move_mode_interval", 5)
                    }
                    onBlur={() =>
                      formik.setFieldTouched("move_mode_interval", true)
                    }
                    invalid={isInvalid("move_mode_interval")}
                  />
                  <FormFeedback>
                    {formik.errors.move_mode_interval}
                  </FormFeedback>
                </Col>

                <Col md={6}>
                  <Label htmlFor="tracking_radius_range" className="form-label">
                    Tracking Radius Range (m) <span>*</span>
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    id="tracking_radius_range"
                    name="tracking_radius_range"
                    disabled={!isEditable || fetching}
                    value={formik.values.tracking_radius_range}
                    onChange={(e) =>
                      handleNumberOnly(e, "tracking_radius_range", 6)
                    }
                    onBlur={() =>
                      formik.setFieldTouched("tracking_radius_range", true)
                    }
                    invalid={isInvalid("tracking_radius_range")}
                  />
                  <FormFeedback>
                    {formik.errors.tracking_radius_range}
                  </FormFeedback>
                </Col>

                <Col md={6}>
                  <Label
                    htmlFor="always_track_on_interval"
                    className="form-label d-block"
                  >
                    Always Track On Interval
                  </Label>
                  <div
                    className="form-check form-switch form-switch-md form-switch-success"
                    dir="ltr"
                  >
                    <Input
                      id="always_track_on_interval"
                      name="always_track_on_interval"
                      type="checkbox"
                      className="form-check-input"
                      disabled={!isEditable || fetching}
                      checked={formik.values.always_track_on_interval}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "always_track_on_interval",
                          e.target.checked,
                        )
                      }
                    />
                  </div>
                  <div className="form-text">
                    Currently{" "}
                    <b>
                      <i>
                        {formik.values.always_track_on_interval ? "Yes" : "No"}
                      </i>
                    </b>
                  </div>
                </Col>

                {isEditable && (
                  <Col xxl={12}>
                    <div className="d-flex gap-2">
                      <Button
                        type="submit"
                        color="success"
                        className="btn-label"
                        disabled={loading}
                      >
                        <i className="ri-check-double-line label-icon align-middle fs-16 me-2" />
                        {loading ? "Saving..." : "Update"}
                      </Button>
                      <Button
                        type="button"
                        color="light"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Col>
                )}
              </Row>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default TrackingConfigForm;
