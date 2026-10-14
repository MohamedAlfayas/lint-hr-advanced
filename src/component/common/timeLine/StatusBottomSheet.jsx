import React, { useEffect, useState } from "react";
import { Modal, ModalBody } from "reactstrap";
// import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { PostApi } from "../../../common/api/PostApi";
import Swal from "sweetalert2";
import { Api } from "../../../common/api/Api";

import { useSelector, useDispatch } from "react-redux";
import { GetTotalWorkDuration } from "../../../common/js/GetTotalWorkDuration";
import { testId, itemTestKey } from "../../../shared/testing/testId";
// ── helpers ──────────────────────────────────────────────────────────────────

const reverseGeocode = async (latitude, longitude) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "AttendanceApp/1.0",
      },
    });
    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const data = await res.json();
    return data?.display_name || `${latitude}, ${longitude}`;
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return `${latitude}, ${longitude}`;
  }
};

const getLocationPayload = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const accurate_address = await reverseGeocode(latitude, longitude);
        resolve({
          latitude: String(latitude),
          longitude: String(longitude),
          accurate_address,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        reject(new Error("Location access is required to toggle status."));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });

const NOTES_MAX = 250;

const START_NOTE_PRESETS = [
  { label: "Heading to client site", icon: "ri-building-2-line" },
  { label: "Working remotely", icon: "ri-home-wifi-line" },
  { label: "Field visit", icon: "ri-road-map-line" },
  { label: "Meeting outside", icon: "ri-team-line" },
];

const STOP_NOTE_PRESETS = [
  { label: "Task completed", icon: "ri-checkbox-circle-line" },
  { label: "Returning to office", icon: "ri-building-line" },
  { label: "Visit done", icon: "ri-map-pin-user-line" },
  { label: "Back at desk", icon: "ri-computer-line" },
];

// ── component ─────────────────────────────────────────────────────────────────

const StatusBottomSheet = ({
  show,
  onClose,
  onOpenTimeline,
  onCheckInOut = null,
  currentlyCheckedIn = false,
  checkInLoading = false,
}) => {
  const { profile_data } = useSelector((state) => state.MyProfileReducer);
  const dispatch = useDispatch(); //Added
  const [userName, setUserName] = useState("Admin");
  const [imgError, setImgError] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const [activeStatus, setActiveStatus] = useState(null);

  const [customStatuses, setCustomStatuses] = useState([]);

  // mode: "start" | "stop"
  const [notesModal, setNotesModal] = useState({
    open: false,
    mode: "start",
    statusId: null,
    notes: "",
    switchingFromId: null,
  });

  useEffect(() => {
    setUserName(profile_data?.first_name || "Admin");
  }, [profile_data]);

  useEffect(() => {
    if (!show) return;

    const raw = GetLocalStorageData("custom_statuses") || [];

    const filtered = Array.isArray(raw)
      ? raw
          .filter((item) => item && typeof item === "object")
          .filter((item) => item.is_active === true)
          .filter((item) => {
            const type = String(item.type || "")
              .trim()
              .toLowerCase();

            return type === "custom" || type === "break";
          })
          .map((item) => ({
            id: Number(item.id),
            name: item.name || "",
            emoji: item.icon || item.emoji || "",
            notes_required: Boolean(item.notes_required),
            location_required: Boolean(item.location_required),
            type: String(item.type || "")
              .trim()
              .toLowerCase(),
            is_break: Boolean(item.is_break),
          }))
      : [];

    setCustomStatuses(filtered);

    // Current active custom status
    Api({
      type: "GET",
      url: "attendance/custom-statuses/current/v2/",
    })
      .then((res) => {
        const data = res?.data;

        if (data?.id) {
          setActiveStatus(Number(data.id));
          localStorage.setItem("active_custom_status", String(data.id));
        } else {
          setActiveStatus(null);
          localStorage.removeItem("active_custom_status");
        }
      })
      .catch(() => {
        setActiveStatus(null);
        localStorage.removeItem("active_custom_status");
      });
  }, [show]);

  // ── helpers ───────────────────────────────────────────────────────────────

  const closeNotesModal = () =>
    setNotesModal({
      open: false,
      mode: "start",
      statusId: null,
      notes: "",
      switchingFromId: null,
    });

  /**
   * Fetches GPS location ONLY when location_required === true.
   * Returns null (no GPS call at all) when location_required === false.
   */
  const maybeGetLocation = async (statusId) => {
    const status = customStatuses.find((s) => s.id === statusId);

    // ✅ Strict boolean check — only fetch GPS when explicitly true
    if (status?.location_required !== true) {
      return null; // skip GPS entirely, no location in payload
    }

    return await getLocationPayload(); // throws if user denies
  };

  /**
   * Builds the API payload.
   * ✅ "location" key is ONLY added when location is a non-null object.
   *    When maybeGetLocation returns null (location_required false),
   *    the location key is completely absent from the payload — not null, not undefined.
   * - "notes" key → included only when a non-empty string is provided.
   */
  const buildPayload = (statusId, notes, location) => {
    const payload = { custom_status_id: statusId };

    // ✅ Only add notes if there is actual content
    if (notes && notes.trim()) {
      payload.notes = notes.trim();
    }

    // ✅ Only add location if it's a real object (i.e. location_required was true AND GPS succeeded)
    // null / undefined → location key is NOT added to payload at all
    if (location && typeof location === "object") {
      payload.location = location;
    }

    return payload;
  };

  // ── toggle handler ────────────────────────────────────────────────────────

  const confirmToggle = async (statusId) => {
    const status = customStatuses.find((s) => s.id === statusId);
    if (status?.notes_required) return true;

    const label = `${status?.emoji ? `${status.emoji} ` : ""}${status?.name || "status"}`;
    const current = customStatuses.find((s) => s.id === activeStatus);
    const isStop = activeStatus === statusId;
    const isSwitch = !isStop && activeStatus !== null;

    let title = `Start "${label}"?`;
    let text =
      status?.type === "break"
        ? "Your break will start now."
        : `Your status will be set to "${status?.name}".`;
    if (isStop) {
      title = `Stop "${label}"?`;
      text = "This status will be turned off.";
    } else if (isSwitch) {
      title = `Switch to "${label}"?`;
      text = `"${current?.name || "Current status"}" will stop and "${status?.name}" will start.`;
    }
    if (status?.location_required) {
      text += " Your current location will be recorded.";
    }

    const result = await Swal.fire({
      title,
      text,
      icon: isStop ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: isStop ? "#f06548" : "#0ab39c",
      confirmButtonText: isStop ? "Yes, stop" : isSwitch ? "Yes, switch" : "Yes, start",
      cancelButtonText: "Cancel",
    });
    return result.isConfirmed;
  };

  const handleToggle = async (statusId) => {
    const isCurrentlyActive = activeStatus === statusId;

    if (!(await confirmToggle(statusId))) return;

    if (isCurrentlyActive) {
      // Turning the active status OFF
      handleToggleOff(statusId);
    } else if (activeStatus !== null) {
      // A different status is active → switch
      handleSwitch(statusId);
    } else {
      // Nothing active → fresh start
      handleToggleOn(statusId);
    }
  };

  // ── Toggle OFF ────────────────────────────────────────────────────────────

  const handleToggleOff = (statusId) => {
    const status = customStatuses.find((s) => s.id === statusId);

    if (status?.notes_required) {
      setNotesModal({
        open: true,
        mode: "stop",
        statusId,
        notes: "",
        switchingFromId: null,
      });
      return;
    }

    executeToggleOff(statusId, "");
  };

  const executeToggleOff = async (statusId, notes) => {
    setLoadingId(statusId);

    // ✅ Only calls GPS if location_required === true
    let location = null;
    try {
      location = await maybeGetLocation(statusId);
    } catch (err) {
      toast.error(err.message || "Could not get location.");
      setLoadingId(null);
      return;
    }

    // ✅ location is null here when location_required === false → not added to payload
    const payload = buildPayload(statusId, notes, location);

    try {
      const response = await PostApi(
        "attendance/custom-statuses/toggle/v2/",
        payload,
        false,
      );
      const data = response?.data;

      if ([200, 201].includes(response?.status) && data) {
        await GetTotalWorkDuration(dispatch); //Added

        if (data.action === "stopped") {
          setActiveStatus(null);
          localStorage.removeItem("active_custom_status");
          toast.success(`Status "${data.previous_status?.name}" stopped.`);
        } else {
          toast.info(data?.message || "Status updated.");
        }
      } else {
        toast.error(
          data?.message || data?.detail || "Failed to toggle status.",
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
          error?.message ||
          "Something went wrong.",
      );
    } finally {
      setLoadingId(null);
    }
  };

  // ── Toggle ON ─────────────────────────────────────────────────────────────

  const handleToggleOn = (statusId) => {
    const status = customStatuses.find((s) => s.id === statusId);

    if (status?.notes_required) {
      setNotesModal({
        open: true,
        mode: "start",
        statusId,
        notes: "",
        switchingFromId: null,
      });
      return;
    }

    executeToggleOn(statusId, "");
  };

  const executeToggleOn = async (statusId, notes) => {
    setLoadingId(statusId);

    // ✅ Only calls GPS if location_required === true
    let location = null;
    try {
      location = await maybeGetLocation(statusId);
    } catch (err) {
      toast.error(err.message || "Could not get location.");
      setLoadingId(null);
      return;
    }

    // ✅ location is null here when location_required === false → not added to payload
    const payload = buildPayload(statusId, notes, location);

    try {
      const response = await PostApi(
        "attendance/custom-statuses/toggle/v2/",
        payload,
        false,
      );
      const data = response?.data;

      if ([200, 201].includes(response?.status) && data) {
        await GetTotalWorkDuration(dispatch); //Added

        const action = data.action;

        if (action === "started") {
          setActiveStatus(statusId);
          localStorage.setItem("active_custom_status", statusId);
          toast.success(`Status "${data.current_status?.name}" started.`);
        } else if (action === "switched") {
          setActiveStatus(statusId);
          localStorage.setItem("active_custom_status", statusId);
          toast.info(
            `Switched from "${data.previous_status?.name}" to "${data.current_status?.name}".`,
          );
        } else {
          toast.info(data?.message || "Status updated.");
        }
      } else {
        toast.error(
          data?.message || data?.detail || "Failed to toggle status.",
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
          error?.message ||
          "Something went wrong.",
      );
    } finally {
      setLoadingId(null);
    }
  };

  // ── Switch ────────────────────────────────────────────────────────────────

  const handleSwitch = (newStatusId) => {
    const newStatus = customStatuses.find((s) => s.id === newStatusId);

    if (newStatus?.notes_required) {
      setNotesModal({
        open: true,
        mode: "start",
        statusId: newStatusId,
        notes: "",
        switchingFromId: activeStatus,
      });
      return;
    }

    executeToggleOn(newStatusId, "");
  };

  // ── Notes modal confirm ───────────────────────────────────────────────────

  const handleNotesConfirm = () => {
    const { mode, statusId, notes } = notesModal;
    closeNotesModal();

    if (mode === "start") {
      executeToggleOn(statusId, notes);
    } else {
      executeToggleOff(statusId, notes);
    }
  };

  // ── derived ───────────────────────────────────────────────────────────────

  const activeItem = customStatuses.find((s) => s.id === activeStatus);
  const pendingStatus = customStatuses.find(
    (s) => s.id === notesModal.statusId,
  );
  const isStartMode = notesModal.mode === "start";
  const notesLength = notesModal.notes.length;
  const canSubmitNotes = notesModal.notes.trim().length > 0;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── MAIN BOTTOM SHEET ── */}
      <Modal
        data-testid="status-sheet-show-dialog"
        isOpen={show}
        toggle={onClose}
        backdrop
        fade
        centered
        modalClassName="sbs-modal"
        contentClassName="sbs-sheet"
      >
        <ModalBody className="p-0">
          {/* HEADER */}
          <div className="sbs-header">
            <div className="sbs-avatar-wrap">
              {profile_data?.profile_url && !imgError ? (
                <img
                  src={profile_data.profile_url}
                  alt="profile"
                  className="sbs-avatar"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="sbs-avatar sbs-avatar-initial">
                  {userName?.charAt(0) || "U"}
                </div>
              )}
              <span
                className={`sbs-presence ${currentlyCheckedIn ? "is-on" : ""}`}
              />
            </div>

            <div className="flex-grow-1 min-w-0">
              <div className="sbs-name text-truncate">{userName}</div>
              <span className={`sbs-pill ${activeItem ? "is-active" : ""}`}>
                {activeItem ? (
                  <>
                    {activeItem.emoji && <span>{activeItem.emoji}</span>}
                    {activeItem.name}
                  </>
                ) : currentlyCheckedIn ? (
                  "Working"
                ) : (
                  "Not checked in"
                )}
              </span>
            </div>

            <button
              data-testid="status-sheet-show-close-button"
              type="button"
              className="sbs-icon-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <i className="ri-close-line" />
            </button>
          </div>

          <div className="sbs-body">
            {/* CHECK-IN / CHECK-OUT */}
            {onCheckInOut && (
              <button
                data-testid="status-sheet-show-check-out-button"
                type="button"
                className={`sbs-check-btn ${currentlyCheckedIn ? "is-out" : "is-in"}`}
                onClick={onCheckInOut}
                disabled={checkInLoading}
              >
                {checkInLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    Processing...
                  </>
                ) : (
                  <>
                    <i
                      className={
                        currentlyCheckedIn
                          ? "ri-logout-circle-r-line"
                          : "ri-login-circle-line"
                      }
                    />
                    {currentlyCheckedIn ? "Check Out" : "Check In"}
                  </>
                )}
              </button>
            )}

            {/* TIMELINE */}
            <button data-testid="status-sheet-show-timeline-button" type="button" className="sbs-row sbs-row-action" onClick={onOpenTimeline}>
              <span className="sbs-row-icon">
                <i className="ri-time-line" />
              </span>
              <span className="flex-grow-1 text-start">
                <span className="sbs-row-title">Timeline</span>
                <span className="sbs-row-sub">View today's activity</span>
              </span>
              <i className="ri-arrow-right-s-line sbs-chevron" />
            </button>

            {/* CUSTOM STATUSES */}
            <div className="sbs-section-label">Set status</div>

            {customStatuses.length === 0 ? (
              <div className="sbs-empty">
                <i className="ri-emotion-normal-line" />
                <span>No statuses available right now.</span>
              </div>
            ) : (
              <div className="sbs-status-list">
                {customStatuses.map((item) => {
                  const isOn = activeStatus === item.id;
                  const isLoading = loadingId === item.id;

                  return (
                    <label
                      key={item.id}
                      className={`sbs-row sbs-status ${isOn ? "is-on" : ""}`}
                      style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
                    >
                      <span className="sbs-row-icon sbs-emoji">
                        {item.emoji || <i className="ri-flag-line" />}
                      </span>
                      <span className="flex-grow-1 min-w-0">
                        <span className="sbs-row-title text-truncate">
                          {item.name}
                        </span>
                        <span className="sbs-row-sub">
                          {isLoading
                            ? "Updating..."
                            : isOn
                              ? "Active now"
                              : item.type === "break"
                                ? "Break"
                                : "Custom status"}
                          {item.notes_required && (
                            <i className="ri-sticky-note-line ms-2" title="Notes required" />
                          )}
                          {item.location_required && (
                            <i className="ri-map-pin-line ms-1" title="Location recorded" />
                          )}
                        </span>
                      </span>
                      <span className="form-check form-switch m-0">
                        <input
                          data-testid={testId("status-sheet-show-is-on", itemTestKey(item), "checkbox")}
                          className="form-check-input"
                          type="checkbox"
                          checked={isOn}
                          disabled={isLoading}
                          onChange={() => handleToggle(item.id)}
                        />
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </ModalBody>
      </Modal>

      {/* NOTES SHEET (shared for start & stop) */}
      <Modal
        data-testid="status-sheet-open-dialog"
        isOpen={notesModal.open}
        toggle={closeNotesModal}
        backdrop
        fade
        centered
        modalClassName="sbs-modal"
        contentClassName="sbs-sheet"
      >
        <ModalBody className="p-0">
          <div className={`sbn ${isStartMode ? "is-start" : "is-stop"}`}>
            <div className="sbn-head">
              <span className="sbn-handle" />
              <div className="sbn-head-row">
                <span className="sbn-emoji">
                  {pendingStatus?.emoji || (
                    <i className={isStartMode ? "ri-play-circle-line" : "ri-stop-circle-line"} />
                  )}
                </span>
                <div className="flex-grow-1 min-w-0">
                  <span className="sbn-badge">
                    <i className={isStartMode ? "ri-play-fill" : "ri-stop-fill"} />
                    {isStartMode ? "Starting status" : "Stopping status"}
                  </span>
                  <div className="sbn-title text-truncate">{pendingStatus?.name}</div>
                </div>
                <button
                  data-testid="status-sheet-open-close-button"
                  type="button"
                  className="sbs-icon-btn"
                  onClick={closeNotesModal}
                  aria-label="Close"
                >
                  <i className="ri-close-line" />
                </button>
              </div>
            </div>

            <div className="sbn-body">
              {pendingStatus?.location_required === true && (
                <div className="sbn-info">
                  <span className="sbn-info-icon">
                    <i className="ri-map-pin-2-line" />
                  </span>
                  <div>
                    <div className="sbn-info-title">Location will be recorded</div>
                    <div className="sbn-info-sub">
                      Your current location is captured when you{" "}
                      {isStartMode ? "start" : "stop"} this status.
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="sbn-label-row">
                  <label className="sbn-label" htmlFor="sbn-notes">
                    {isStartMode ? "Start notes" : "End notes"}
                    <span className="text-danger ms-1">*</span>
                  </label>
                  <span className={`sbn-count ${notesLength >= NOTES_MAX ? "is-max" : ""}`}>
                    {notesLength}/{NOTES_MAX}
                  </span>
                </div>
                <div className="sbn-field">
                  <i className="ri-sticky-note-line sbn-field-icon" />
                  <textarea
                    data-testid="status-sheet-open-sbn-notes-textarea"
                    id="sbn-notes"
                    className="sbn-textarea"
                    rows={3}
                    maxLength={NOTES_MAX}
                    autoFocus
                    placeholder={
                      isStartMode
                        ? "e.g. Heading to client site, working remotely…"
                        : "e.g. Task completed, returning to office…"
                    }
                    value={notesModal.notes}
                    onChange={(e) =>
                      setNotesModal((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && canSubmitNotes) {
                        handleNotesConfirm();
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="sbn-label mb-2">Quick notes</div>
                <div className="sbn-chips">
                  {(isStartMode ? START_NOTE_PRESETS : STOP_NOTE_PRESETS).map((preset) => (
                    <button
                      data-testid={testId("status-sheet-open", itemTestKey(preset), "button")}
                      key={preset.label}
                      type="button"
                      className={`sbn-chip ${notesModal.notes === preset.label ? "is-active" : ""}`}
                      onClick={() =>
                        setNotesModal((prev) => ({ ...prev, notes: preset.label }))
                      }
                    >
                      <i className={preset.icon} />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sbn-foot">
              <span className="sbn-hint">
                <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to confirm
              </span>
              <div className="sbn-actions">
                <button data-testid="status-sheet-open-cancel-button" type="button" className="sbn-btn is-ghost" onClick={closeNotesModal}>
                  Cancel
                </button>
                <button
                  data-testid="status-sheet-open-start-status-button"
                  type="button"
                  className="sbn-btn is-main"
                  onClick={handleNotesConfirm}
                  disabled={!canSubmitNotes}
                >
                  <i
                    className={
                      isStartMode
                        ? pendingStatus?.location_required
                          ? "ri-map-pin-line"
                          : "ri-play-circle-line"
                        : "ri-stop-circle-line"
                    }
                  />
                  {isStartMode ? "Start Status" : "Stop Status"}
                </button>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>

      <style>{`
        .sbs-modal .modal-dialog { max-width: 440px; }
        .sbs-sheet {
          border: 0; border-radius: 18px; overflow: hidden;
          box-shadow: 0 24px 60px rgba(15, 23, 42, .25);
        }
        .sbs-header {
          display: flex; align-items: center; gap: 14px; padding: 20px 20px 18px;
          background: linear-gradient(135deg, rgba(var(--vz-primary-rgb), .12), rgba(var(--vz-success-rgb), .08));
          border-bottom: 1px solid var(--vz-border-color);
        }
        .sbs-avatar-wrap { position: relative; flex: 0 0 auto; }
        .sbs-avatar {
          width: 52px; height: 52px; border-radius: 50%; object-fit: cover;
          border: 3px solid var(--vz-secondary-bg); box-shadow: 0 4px 12px rgba(15, 23, 42, .12);
        }
        .sbs-avatar-initial {
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #0ab39c, #099885); color: #fff;
          font-size: 20px; font-weight: 700; text-transform: uppercase;
        }
        .sbs-presence {
          position: absolute; right: 1px; bottom: 1px; width: 13px; height: 13px; border-radius: 50%;
          background: var(--vz-secondary-color); border: 2px solid var(--vz-secondary-bg);
        }
        .sbs-presence.is-on { background: var(--vz-success); }
        .sbs-name { font-size: 16px; font-weight: 700; color: var(--vz-heading-color, var(--vz-body-color)); }
        .sbs-pill {
          display: inline-flex; align-items: center; gap: 5px; margin-top: 4px; padding: 2px 10px;
          border-radius: 999px; font-size: 12px; font-weight: 500;
          background: rgba(var(--vz-secondary-rgb, 135, 138, 153), .14); color: var(--vz-secondary-color);
        }
        .sbs-pill.is-active { background: rgba(var(--vz-primary-rgb), .14); color: var(--vz-primary); }
        .sbs-icon-btn {
          width: 34px; height: 34px; border: 0; border-radius: 10px; flex: 0 0 auto;
          display: inline-flex; align-items: center; justify-content: center; font-size: 20px;
          background: var(--vz-secondary-bg); color: var(--vz-secondary-color);
          transition: background-color .15s ease, color .15s ease;
        }
        .sbs-icon-btn:hover { background: rgba(var(--vz-danger-rgb), .1); color: var(--vz-danger); }

        .sbs-body { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 12px; }
        .sbs-check-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
          border: 0; border-radius: 12px; padding: 13px 16px; color: #fff;
          font-size: 15px; font-weight: 600; letter-spacing: .2px;
          transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
        }
        .sbs-check-btn i { font-size: 18px; line-height: 1; }
        .sbs-check-btn.is-in { background: linear-gradient(135deg, #0ab39c, #07917e); box-shadow: 0 8px 18px rgba(10, 179, 156, .3); }
        .sbs-check-btn.is-out { background: linear-gradient(135deg, #f06548, #d9472b); box-shadow: 0 8px 18px rgba(240, 101, 72, .3); }
        .sbs-check-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .sbs-check-btn:disabled { opacity: .7; }

        .sbs-row {
          display: flex; align-items: center; gap: 12px; width: 100%; margin: 0;
          padding: 11px 12px; border-radius: 12px; border: 1px solid var(--vz-border-color);
          background: transparent; color: inherit;
          transition: border-color .15s ease, background-color .15s ease;
        }
        .sbs-row-action:hover, .sbs-status:hover { border-color: rgba(var(--vz-primary-rgb), .4); background: rgba(var(--vz-primary-rgb), .04); }
        .sbs-row-icon {
          width: 38px; height: 38px; flex: 0 0 38px; border-radius: 10px; font-size: 18px;
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(var(--vz-primary-rgb), .1); color: var(--vz-primary);
        }
        .sbs-emoji { background: var(--vz-tertiary-bg, var(--vz-secondary-bg)); font-size: 19px; }
        .sbs-row-title { display: block; font-size: 14px; font-weight: 600; color: var(--vz-heading-color, var(--vz-body-color)); }
        .sbs-row-sub { display: flex; align-items: center; font-size: 12px; color: var(--vz-secondary-color); }
        .sbs-chevron { font-size: 20px; color: var(--vz-secondary-color); }

        .sbs-section-label {
          margin-top: 4px; font-size: 11px; font-weight: 600; letter-spacing: .6px;
          text-transform: uppercase; color: var(--vz-secondary-color);
        }
        .sbs-status-list { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; }
        .sbs-status.is-on { border-color: rgba(var(--vz-success-rgb), .5); background: rgba(var(--vz-success-rgb), .07); }
        .sbs-status.is-on .sbs-row-sub { color: var(--vz-success); font-weight: 500; }
        .sbs-status .form-check-input { width: 2.4em; height: 1.3em; cursor: inherit; }

        .sbs-empty {
          display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px;
          border-radius: 12px; border: 1px dashed var(--vz-border-color);
          color: var(--vz-secondary-color); font-size: 13px;
        }
        .sbs-empty i { font-size: 18px; }

        .sbn { --sbn-c: var(--vz-success); }
        .sbn.is-stop { --sbn-c: var(--vz-danger); }
        .sbn-head {
          position: relative; padding: 10px 20px 18px;
          background: radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--sbn-c) 14%, transparent), transparent 55%), var(--vz-secondary-bg);
          border-bottom: 1px solid var(--vz-border-color);
        }
        .sbn-handle {
          display: block; width: 40px; height: 4px; margin: 0 auto 14px; border-radius: 4px;
          background: var(--vz-border-color);
        }
        .sbn-head-row { display: flex; align-items: center; gap: 14px; }
        .sbn-emoji {
          width: 52px; height: 52px; flex: 0 0 52px; border-radius: 15px; font-size: 26px;
          display: inline-flex; align-items: center; justify-content: center; color: var(--sbn-c);
          background: color-mix(in srgb, var(--sbn-c) 12%, var(--vz-secondary-bg));
          border: 1px solid color-mix(in srgb, var(--sbn-c) 28%, transparent);
          box-shadow: 0 6px 16px color-mix(in srgb, var(--sbn-c) 20%, transparent);
        }
        .sbn-badge {
          display: inline-flex; align-items: center; gap: 4px; padding: 2px 9px; border-radius: 999px;
          font-size: 11px; font-weight: 600; letter-spacing: .3px; text-transform: uppercase;
          color: var(--sbn-c); background: color-mix(in srgb, var(--sbn-c) 12%, transparent);
        }
        .sbn-badge i { font-size: 12px; }
        .sbn-title { margin-top: 4px; font-size: 17px; font-weight: 700; color: var(--vz-heading-color, var(--vz-body-color)); }

        .sbn-body { padding: 18px 20px 6px; display: flex; flex-direction: column; gap: 16px; }
        .sbn-info {
          display: flex; align-items: flex-start; gap: 12px; padding: 11px 12px; border-radius: 12px;
          background: color-mix(in srgb, var(--vz-info) 8%, transparent);
          border: 1px solid color-mix(in srgb, var(--vz-info) 22%, transparent);
        }
        .sbn-info-icon {
          width: 32px; height: 32px; flex: 0 0 32px; border-radius: 9px; font-size: 16px;
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--vz-info); background: color-mix(in srgb, var(--vz-info) 14%, transparent);
        }
        .sbn-info-title { font-size: 13px; font-weight: 600; color: var(--vz-heading-color, var(--vz-body-color)); }
        .sbn-info-sub { font-size: 12px; color: var(--vz-secondary-color); }

        .sbn-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .sbn-label { font-size: 12px; font-weight: 600; letter-spacing: .3px; color: var(--vz-secondary-color); margin: 0; display: block; }
        .sbn-count { font-size: 11px; font-weight: 600; color: var(--vz-secondary-color); font-variant-numeric: tabular-nums; }
        .sbn-count.is-max { color: var(--vz-danger); }
        .sbn-field { position: relative; }
        .sbn-field-icon { position: absolute; left: 13px; top: 12px; font-size: 16px; color: var(--vz-secondary-color); pointer-events: none; transition: color .15s ease; }
        .sbn-textarea {
          display: block; width: 100%; min-height: 96px; resize: none; padding: 11px 14px 11px 38px;
          font-size: 14px; line-height: 1.5; border-radius: 12px; outline: 0;
          color: var(--vz-body-color); background: var(--vz-tertiary-bg, var(--vz-secondary-bg));
          border: 1px solid var(--vz-border-color);
          transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
        }
        .sbn-textarea::placeholder { color: var(--vz-secondary-color); opacity: .8; }
        .sbn-textarea:focus {
          background: var(--vz-secondary-bg); border-color: var(--sbn-c);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--sbn-c) 14%, transparent);
        }
        .sbn-field:focus-within .sbn-field-icon { color: var(--sbn-c); }

        .sbn-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .sbn-chip {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px;
          font-size: 12.5px; font-weight: 500; color: var(--vz-body-color);
          background: var(--vz-secondary-bg); border: 1px solid var(--vz-border-color);
          transition: all .15s ease;
        }
        .sbn-chip i { font-size: 14px; color: var(--vz-secondary-color); transition: color .15s ease; }
        .sbn-chip:hover { border-color: color-mix(in srgb, var(--sbn-c) 45%, transparent); color: var(--sbn-c); }
        .sbn-chip:hover i { color: var(--sbn-c); }
        .sbn-chip.is-active {
          color: #fff; border-color: transparent; background: var(--sbn-c);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--sbn-c) 30%, transparent);
        }
        .sbn-chip.is-active i { color: #fff; }

        .sbn-foot { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 10px; }
        .sbn-hint { align-self: flex-end; font-size: 11px; color: var(--vz-secondary-color); }
        .sbn-hint kbd {
          padding: 1px 6px; font-size: 10.5px; border-radius: 5px; font-family: inherit;
          color: var(--vz-body-color); background: var(--vz-tertiary-bg, var(--vz-secondary-bg));
          border: 1px solid var(--vz-border-color); box-shadow: none;
        }
        .sbn-actions { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); gap: 10px; }
        .sbn-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px;
          border-radius: 12px; font-size: 14.5px; font-weight: 600; border: 1px solid transparent;
          transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease, opacity .15s ease;
        }
        .sbn-btn i { font-size: 17px; }
        .sbn-btn.is-ghost { color: var(--vz-body-color); background: var(--vz-tertiary-bg, var(--vz-secondary-bg)); border-color: var(--vz-border-color); }
        .sbn-btn.is-ghost:hover { background: var(--vz-border-color); }
        .sbn-btn.is-main {
          color: #fff; background: var(--sbn-c);
          box-shadow: 0 8px 18px color-mix(in srgb, var(--sbn-c) 32%, transparent);
        }
        .sbn-btn.is-main:hover:not(:disabled) { transform: translateY(-1px); background: color-mix(in srgb, var(--sbn-c) 88%, #000); }
        .sbn-btn.is-main:disabled { opacity: .45; box-shadow: none; cursor: not-allowed; }
        .min-w-0 { min-width: 0; }
      `}</style>
    </>
  );
};

export default StatusBottomSheet;
