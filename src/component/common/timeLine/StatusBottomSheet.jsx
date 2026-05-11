import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ListGroup, ListGroupItem } from "reactstrap";
import { useSelector } from "react-redux";
import { Clock, ChevronRight } from "react-feather";
import { toast } from "react-toastify";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { PostApi } from "../../../common/api/PostApi";
import Swal from "sweetalert2";

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Reverse-geocodes lat/lng using OpenStreetMap Nominatim (no API key needed).
 * Falls back gracefully to "lat, lng" string if the request fails.
 */
const reverseGeocode = async (latitude, longitude) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        // Nominatim requires a descriptive User-Agent
        "Accept-Language": "en",
        "User-Agent": "AttendanceApp/1.0",
      },
    });
    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const data = await res.json();
    // data.display_name is the full human-readable address
    return data?.display_name || `${latitude}, ${longitude}`;
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    // non-fatal fallback
    return `${latitude}, ${longitude}`;
  }
};

/**
 * Resolves the device's current GPS position + reverse-geocoded address.
 * Returns { latitude, longitude, accurate_address } or throws on denial.
 */
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

  const [userName, setUserName] = useState("Admin");
  const [imgError, setImgError] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const [activeStatus, setActiveStatus] = useState(() =>
    localStorage.getItem("active_custom_status")
      ? Number(localStorage.getItem("active_custom_status"))
      : null,
  );

  const [customStatuses, setCustomStatuses] = useState([]);

  // ── notes modal state ──
  const [notesModal, setNotesModal] = useState({
    open: false,
    statusId: null,
    notes: "",
  });

  useEffect(() => {
    setUserName(profile_data?.first_name || "Admin");
  }, [profile_data]);

  useEffect(() => {
    if (show) {
      const raw = GetLocalStorageData("custom_statuses") || [];
      const filtered = raw
        .filter((item) => item && typeof item === "object")
        .filter((item) => item.is_active === true || item.active === true)
        .map((item) => ({
          id: item.id,
          name: item.name,
          emoji: item.emoji ?? item.icon ?? "",
        }));
      setCustomStatuses(filtered);
    }
  }, [show]);

  // ── toggle handler ────────────────────────────────────────────────────────

  const handleToggle = (statusId) => {
    const isCurrentlyActive = activeStatus === statusId;

    if (isCurrentlyActive) {
      // Turning OFF → no notes needed, just confirm + call API
      handleToggleOff(statusId);
    } else {
      // Turning ON → open notes input sheet
      setNotesModal({ open: true, statusId, notes: "" });
    }
  };

  /** Toggle OFF — confirmed via SweetAlert, no notes or location needed */
  const handleToggleOff = async (statusId) => {
    const result = await Swal.fire({
      title: "Stop this status?",
      text: "This status will be turned OFF.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0ab39c",
      cancelButtonColor: "#f06548",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setLoadingId(statusId);

    try {
      const response = await PostApi(
        "attendance/custom-statuses/toggle/",
        { custom_status_id: statusId },
        false,
      );

      const data = response?.data;

      if ([200, 201].includes(response?.status) && data) {
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

  /** Toggle ON — called after user fills notes and confirms */
  const handleToggleOn = async () => {
    const { statusId, notes } = notesModal;

    // Close notes sheet immediately so UX feels snappy
    setNotesModal({ open: false, statusId: null, notes: "" });
    setLoadingId(statusId);

    let location;
    try {
      location = await getLocationPayload();
    } catch (err) {
      toast.error(err.message || "Could not get location.");
      setLoadingId(null);
      return;
    }

    const payload = {
      custom_status_id: statusId,
      location,
      notes,
    };

    try {
      const response = await PostApi(
        "attendance/custom-statuses/toggle/",
        payload,
        false,
      );

      const data = response?.data;

      if ([200, 201].includes(response?.status) && data) {
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

  // ── derived ───────────────────────────────────────────────────────────────

  const activeItem = customStatuses.find((s) => s.id === activeStatus);
  const pendingStatus = customStatuses.find(
    (s) => s.id === notesModal.statusId,
  );

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── MAIN BOTTOM SHEET ── */}
      <Modal
        isOpen={show}
        toggle={onClose}
        backdrop
        fade
        wrapClassName="d-flex align-items-end m-0"
        modalClassName="m-0 w-100"
        contentClassName="rounded-top w-100"
      >
        <ModalBody className="p-0">
          <ListGroup flush>
            {/* DRAG HANDLE */}
            <ListGroupItem className="d-flex justify-content-center pt-3 pb-1 border-0">
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: "#dee2e6",
                }}
              />
            </ListGroupItem>

            {/* PROFILE */}
            <ListGroupItem className="d-flex align-items-center gap-3 py-3">
              {profile_data?.profile_url && !imgError ? (
                <img
                  src={profile_data.profile_url}
                  alt="profile"
                  className="rounded-circle"
                  width="40"
                  height="40"
                  style={{ objectFit: "cover" }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="rounded-circle text-white d-flex justify-content-center align-items-center"
                  style={{
                    width: 40,
                    height: 40,
                    background: "#0ab39c",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {userName?.charAt(0) || "U"}
                </div>
              )}

              <div>
                <strong>{userName}</strong>
                {activeItem ? (
                  <div className="text-muted small">
                    {activeItem.emoji} {activeItem.name}
                  </div>
                ) : (
                  <div className="text-muted small">No active status</div>
                )}
              </div>
            </ListGroupItem>

            {/* CHECK-IN / CHECK-OUT */}
            {onCheckInOut && (
              <ListGroupItem className="py-3 px-3">
                <button
                  className={`btn w-100 ${
                    currentlyCheckedIn ? "btn-warning" : "btn-success"
                  }`}
                  onClick={onCheckInOut}
                  disabled={checkInLoading}
                  style={{
                    fontSize: "15px",
                    fontWeight: 500,
                    letterSpacing: "0.3px",
                  }}
                >
                  {checkInLoading ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      Processing...
                    </span>
                  ) : (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <i
                        className="ri-time-line"
                        style={{
                          fontSize: "16px",
                          lineHeight: 1,
                          verticalAlign: "middle",
                        }}
                      />
                      <span style={{ verticalAlign: "middle" }}>
                        {currentlyCheckedIn ? "Check Out" : "Check In"}
                      </span>
                    </span>
                  )}
                </button>
              </ListGroupItem>
            )}

            {/* TIMELINE */}
            <ListGroupItem
              action
              onClick={onOpenTimeline}
              className="d-flex justify-content-between align-items-center py-3"
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex align-items-center gap-3">
                <Clock size={18} />
                Timeline
              </div>
              <ChevronRight size={18} />
            </ListGroupItem>

            {/* CUSTOM STATUSES */}
            {customStatuses.length === 0 ? (
              <ListGroupItem className="text-center text-muted py-4">
                No active statuses available.
              </ListGroupItem>
            ) : (
              customStatuses.map((item) => {
                const isOn = activeStatus === item.id;
                const isLoading = loadingId === item.id;

                return (
                  <ListGroupItem
                    key={item.id}
                    className="d-flex justify-content-between align-items-center py-3"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span style={{ fontSize: 18 }}>{item.emoji}</span>
                      <span>{item.name}</span>
                    </div>

                    <div className="form-check form-switch m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isOn}
                        disabled={isLoading}
                        onChange={() => handleToggle(item.id)}
                        style={{
                          cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                      />
                    </div>
                  </ListGroupItem>
                );
              })
            )}

            {/* CLOSE */}
            <ListGroupItem className="py-3 px-3 border-0">
              <button className="btn btn-light w-100" onClick={onClose}>
                Close
              </button>
            </ListGroupItem>
          </ListGroup>
        </ModalBody>
      </Modal>

      {/* ── NOTES BOTTOM SHEET (shown only when toggling ON) ── */}
      <Modal
        isOpen={notesModal.open}
        toggle={() => setNotesModal({ open: false, statusId: null, notes: "" })}
        backdrop
        fade
        wrapClassName="d-flex align-items-end m-0"
        modalClassName="m-0 w-100"
        contentClassName="rounded-top w-100"
      >
        <ModalBody className="p-0">
          <ListGroup flush>
            {/* DRAG HANDLE */}
            <ListGroupItem className="d-flex justify-content-center pt-3 pb-1 border-0">
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: "#dee2e6",
                }}
              />
            </ListGroupItem>

            {/* HEADER */}
            <ListGroupItem className="py-3 px-3 border-0">
              <h6 className="mb-0 fw-semibold">
                {pendingStatus?.emoji && (
                  <span className="me-2">{pendingStatus.emoji}</span>
                )}
                Start "{pendingStatus?.name}"
              </h6>
              <p className="text-muted small mb-0 mt-1">
                Add a note before starting this status. Your current location
                will be recorded automatically.
              </p>
            </ListGroupItem>

            {/* NOTES TEXTAREA */}
            <ListGroupItem className="py-2 px-3 border-0">
              <label className="form-label small fw-medium text-muted mb-1">
                Notes (optional)
              </label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="e.g. Heading to client site, working remotely…"
                value={notesModal.notes}
                onChange={(e) =>
                  setNotesModal((prev) => ({ ...prev, notes: e.target.value }))
                }
                style={{ resize: "none", fontSize: 14 }}
              />
            </ListGroupItem>

            {/* ACTIONS */}
            <ListGroupItem className="py-3 px-3 border-0 d-flex gap-2">
              <button
                className="btn btn-light flex-fill"
                onClick={() =>
                  setNotesModal({ open: false, statusId: null, notes: "" })
                }
              >
                Cancel
              </button>
              <button
                className="btn btn-success flex-fill"
                onClick={handleToggleOn}
                disabled={false}
              >
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <i className="ri-map-pin-line" style={{ fontSize: 15 }} />
                  Start Status
                </span>
              </button>
            </ListGroupItem>
          </ListGroup>
        </ModalBody>
      </Modal>
    </>
  );
};

export default StatusBottomSheet;
