import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ListGroup, ListGroupItem } from "reactstrap";
import { useSelector } from "react-redux";
import { Clock, ChevronRight } from "react-feather";
import { toast } from "react-toastify";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { PostApi } from "../../../common/api/PostApi";
import Swal from "sweetalert2";

const StatusBottomSheet = ({ show, onClose, onOpenTimeline }) => {
  const { profile_data } = useSelector((state) => state.MyProfileReducer);

  const [userName, setUserName] = useState("Admin");
  const [imgError, setImgError] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);
  const [customStatuses, setCustomStatuses] = useState([]);

  useEffect(() => {
    setUserName(profile_data?.first_name || "Admin");
  }, [profile_data]);

  // ✅ Load only is_active: true statuses from localStorage
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

  const handleToggle = async (statusId) => {
    const isCurrentlyActive = activeStatus === statusId;

    // ✅ Show confirmation popup
    const result = await Swal.fire({
      title: isCurrentlyActive ? "Stop this status?" : "Start this status?",
      text: isCurrentlyActive
        ? "This status will be turned OFF."
        : "This status will be turned ON.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0ab39c",
      cancelButtonColor: "#f06548",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    });

    // ❌ If user cancels → do nothing
    if (!result.isConfirmed) return;

    // ✅ Continue API call
    setLoadingId(statusId);

    try {
      const response = await PostApi(
        "attendance/toggle-custom-status/",
        { custom_status_id: statusId },
        false,
      );

      const data = response?.data;

      if ([200, 201].includes(response?.status) && data) {
        const action = data.action;

        if (action === "started") {
          setActiveStatus(statusId);
          toast.success(`Status "${data.current_status?.name}" started.`);
        } else if (action === "switched") {
          setActiveStatus(statusId);
          toast.info(
            `Switched from "${data.previous_status?.name}" to "${data.current_status?.name}".`,
          );
        } else if (action === "stopped") {
          setActiveStatus(null);
          toast.success(`Status "${data.previous_status?.name}" stopped.`);
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

  const activeItem = customStatuses.find((s) => s.id === activeStatus);

  return (
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

          {/* TIMELINE */}
          <ListGroupItem
            action
            onClick={onOpenTimeline}
            className="d-flex justify-content-between align-items-center py-3"
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
                      style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
                    />
                  </div>
                </ListGroupItem>
              );
            })
          )}
        </ListGroup>
      </ModalBody>
    </Modal>
  );
};

export default StatusBottomSheet;
