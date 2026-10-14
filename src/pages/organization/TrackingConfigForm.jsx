import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { GetApi } from "../../common/api/GetApi";
import { PostApi } from "../../common/api/PostApi";
import { PutApi } from "../../common/api/PutApi";
import { setTrackingConfig } from "../../redux/reducers/ChildReducer/TrackingConfigReducer";
import "./TrackingConfigForm.scss";
import { testId, itemTestKey } from "../../shared/testing/testId";

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
        is_tracking_enabled: values.is_tracking_enabled,
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
      is_tracking_enabled: tracking_config_data?.is_tracking_enabled ?? false,
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
      is_tracking_enabled: Yup.boolean().required(),
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
        is_tracking_enabled: tracking_config_data?.is_tracking_enabled ?? false,
        tracking_radius_range:
          tracking_config_data?.tracking_radius_range ?? "",
      },
    });
    setIsEditable(false);
  };

  const isInvalid = (name) =>
    Boolean(formik.touched[name] && formik.errors[name]);

  const locked = !isEditable || fetching;
  const trackingOn = !!formik.values.is_tracking_enabled;

  const humanSeconds = (v) => {
    const n = Number(v);
    if (!v || Number.isNaN(n)) return "—";
    if (n < 60) return `every ${n} sec`;
    const m = Math.floor(n / 60);
    const s = n % 60;
    return `every ${m} min${s ? ` ${s} sec` : ""}`;
  };

  const metrics = [
    {
      name: "still_mode_interval",
      label: "Still mode interval",
      icon: "ri-pause-circle-line",
      tone: "info",
      unit: "sec",
      maxLen: 5,
      hint: "Min 60 sec · must be longer than move mode",
      readable: humanSeconds(formik.values.still_mode_interval),
      desc: "Ping rate while the employee is stationary",
    },
    {
      name: "move_mode_interval",
      label: "Move mode interval",
      icon: "ri-walk-line",
      tone: "success",
      unit: "sec",
      maxLen: 5,
      hint: "Min 5 sec",
      readable: humanSeconds(formik.values.move_mode_interval),
      desc: "Ping rate while the employee is moving",
    },
    {
      name: "tracking_radius_range",
      label: "Tracking radius",
      icon: "ri-focus-3-line",
      tone: "warning",
      unit: "m",
      maxLen: 6,
      hint: "Min 10 m",
      readable: formik.values.tracking_radius_range ? `${Number(formik.values.tracking_radius_range).toLocaleString("en-IN")} m movement threshold` : "—",
      desc: "Distance that switches still → move mode",
    },
  ];

  return (
    <Form onSubmit={formik.handleSubmit} noValidate className={`tcf ${isEditable ? "is-editing" : ""}`}>
      <div className="tcf-head">
        <span className="tcf-head-icon"><i className="ri-map-pin-time-line"></i></span>
        <div className="tcf-head-text">
          <h5>Tracking Configuration</h5>
          <p>Control how often employee locations are captured</p>
        </div>
        <span className={`tcf-status ${trackingOn ? "is-on" : ""}`}>
          <span className="tcf-status-dot"></span>
          {fetching ? "Loading…" : trackingOn ? "Tracking active" : "Tracking paused"}
        </span>
        {!isEditable && !fetching && (
          <button data-testid="tracking-config-edit-button" type="button" className="it-btn is-soft" onClick={() => setIsEditable(true)}>
            <i className="ri-pencil-line"></i>Edit
          </button>
        )}
        {isEditable && <span className="tcf-editing"><i className="ri-pencil-line"></i>Editing</span>}
      </div>

      <button
        data-testid="tracking-config-location-tracking-button"
        type="button"
        role="switch"
        aria-checked={trackingOn}
        disabled={locked}
        className={`tcf-master ${trackingOn ? "is-on" : ""}`}
        onClick={() => formik.setFieldValue("is_tracking_enabled", !trackingOn)}
      >
        <span className="tcf-master-icon"><i className="ri-radar-line"></i></span>
        <span className="tcf-master-text">
          <b>Location tracking</b>
          <small>
            {trackingOn
              ? "Employees' locations are recorded during working hours"
              : "No location data is collected from employees"}
          </small>
        </span>
        <span className="tcf-switch is-lg"><span></span></span>
      </button>

      <div className="tcf-section-label">Intervals & range</div>
      <div className="tcf-metrics">
        {metrics.map((m) => (
          <div key={m.name} className={`tcf-metric tone-${m.tone} ${isInvalid(m.name) ? "is-invalid" : ""}`}>
            <div className="tcf-metric-top">
              <span className="tcf-metric-icon"><i className={m.icon}></i></span>
              <div className="tcf-metric-title">
                <label htmlFor={m.name}>{m.label} <span>*</span></label>
                <small>{m.desc}</small>
              </div>
            </div>
            <div className="tcf-input">
              <input
                data-testid={testId("tracking-config", m.name, "input")}
                type="text"
                inputMode="numeric"
                id={m.name}
                name={m.name}
                disabled={locked}
                value={formik.values[m.name]}
                onChange={(e) => handleNumberOnly(e, m.name, m.maxLen)}
                onBlur={() => formik.setFieldTouched(m.name, true)}
              />
              <span className="tcf-unit">{m.unit}</span>
            </div>
            {isInvalid(m.name) ? (
              <div className="tcf-error"><i className="ri-error-warning-line"></i>{formik.errors[m.name]}</div>
            ) : (
              <div className="tcf-readable">
                <span>{m.readable}</span>
                {isEditable && <em><i className="ri-information-line"></i>{m.hint}</em>}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        data-testid="tracking-config-always-track-on-interval-switch"
        type="button"
        role="switch"
        aria-checked={!!formik.values.always_track_on_interval}
        disabled={locked}
        className={`tcf-toggle ${formik.values.always_track_on_interval ? "is-on" : ""}`}
        onClick={() => formik.setFieldValue("always_track_on_interval", !formik.values.always_track_on_interval)}
      >
        <span className="tcf-toggle-icon"><i className="ri-repeat-line"></i></span>
        <span className="tcf-toggle-text">
          <b>Always track on interval</b>
          <small>Capture location on every interval even when the position hasn't changed</small>
        </span>
        <span className="tcf-switch"><span></span></span>
      </button>

      {isEditable && (
        <div className="tcf-actions">
          <span className="tcf-actions-note"><i className="ri-information-line"></i>Changes apply to all employees with tracking enabled</span>
          <button data-testid="tracking-config-cancel-button" type="button" className="it-btn is-soft" onClick={handleCancel} disabled={loading}>
            Cancel
          </button>
          <button data-testid="tracking-config-save-changes-button" type="submit" className="it-btn is-primary" disabled={loading}>
            <i className={loading ? "ri-loader-4-line tcf-spin" : "ri-save-3-line"}></i>
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}
    </Form>
  );
};

export default TrackingConfigForm;
