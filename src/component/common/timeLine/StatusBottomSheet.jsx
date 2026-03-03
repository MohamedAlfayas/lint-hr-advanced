import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ListGroup, ListGroupItem } from "reactstrap";
import { useSelector } from "react-redux";
import {
  Clock,
  ChevronRight,
  MessageCircle,
  Users,
  Moon,
  Heart,
  Coffee,
  MoreVertical,
  Edit2,
  Trash2
} from "react-feather";

import CustomStatusModal from "./CustomStatusModal";
import ClearAfterModal from "./ClearAfterModal";
import { color } from "echarts";

const StatusBottomSheet = ({ show, onClose, onOpenTimeline }) => {
  const { profile_data } = useSelector((state) => state.MyProfileReducer);

  const [userName, setUserName] = useState("Admin");

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const [editingStatus, setEditingStatus] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const [clearAfterValue, setClearAfterValue] = useState(null);

  const [customStatuses, setCustomStatuses] = useState([]);

  const [defaultStatuses, setDefaultStatuses] = useState([
    { id: 1, icon: Users, label: "Meeting . 1 hour", enabled: false },
    { id: 2, icon: Coffee, label: "Break . 1 hour", enabled: false },
    { id: 3, icon: Moon, label: "DND . 45 minutes", enabled: false },
    { id: 4, icon: Heart, label: "Sick", enabled: false }
  ]);

  useEffect(() => {
    setUserName(profile_data?.first_name || "Admin");
  }, [profile_data]);

  /* ---------------- SAVE CUSTOM ---------------- */

  const handleSaveCustomStatus = (data) => {
    if (editingStatus) {
      setCustomStatuses((prev) =>
        prev.map((item) =>
          item.id === editingStatus.id ? { ...item, ...data } : item
        )
      );
      setEditingStatus(null);
    } else {
      setCustomStatuses((prev) => [
        ...prev,
        { ...data, id: Date.now(), enabled: false }
      ]);
    }
    setShowCustomModal(false);
  };

  /* ---------------- EDIT ---------------- */

  const handleEdit = (item) => {
    setEditingStatus(item);
    setShowCustomModal(true);
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = (id) => {
    setCustomStatuses((prev) => prev.filter((item) => item.id !== id));
  };

  /* ---------------- TOGGLE CUSTOM ---------------- */

  const toggleCustomStatus = (id) => {
    setCustomStatuses((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, enabled: !item.enabled }
          : { ...item, enabled: false }
      )
    );

    setDefaultStatuses((prev) =>
      prev.map((item) => ({ ...item, enabled: false }))
    );
  };

  /* ---------------- TOGGLE DEFAULT ---------------- */

  const toggleDefaultStatus = (id) => {
    setDefaultStatuses((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, enabled: !item.enabled }
          : { ...item, enabled: false }
      )
    );

    setCustomStatuses((prev) =>
      prev.map((item) => ({ ...item, enabled: false }))
    );
  };

  /* ---------------- ACTIVE STATUS ---------------- */

  const activeCustom = customStatuses.find((s) => s.enabled);
  const activeDefault = defaultStatuses.find((s) => s.enabled);

  const isStatusSelected = activeCustom || activeDefault;

  /* ---------------- CONFIRM CLICK ---------------- */

  const handleConfirm = () => {
    const selectedStatus = activeCustom || activeDefault;

    const payload = {
      status: selectedStatus,
      clearAfter: clearAfterValue
    };

    console.log("CONFIRM DATA →", payload);

    // 👉 call API here

    onClose();
  };

  /* ================================================= */

  return (
    <>
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
              <img
                src={profile_data?.profile_url || ""}
                alt="profile"
                className="rounded-circle"
                width="40"
                height="40"
                style={{ objectFit: "cover" }}
              />

              <div>
                <strong>{userName}</strong>

                {activeCustom && (
                  <div className="text-muted small">
                    {activeCustom.emoji} {activeCustom.status}
                  </div>
                )}

                {!activeCustom && activeDefault && (
                  <div className="text-muted small">
                    {activeDefault.label}
                  </div>
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

            {/* CREATE */}
            <ListGroupItem
              action
              onClick={() => {
                setEditingStatus(null);
                setShowCustomModal(true);
              }}
              className="d-flex align-items-center gap-3 py-3"
            >
              <MessageCircle size={18} />
              Create Custom Status
            </ListGroupItem>

            {/* CUSTOM STATUSES */}
            {customStatuses.map((item) => {
              const showDots =
                hoveredId === item.id || openMenuId === item.id;

              return (
                <ListGroupItem
                  key={item.id}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="d-flex justify-content-between align-items-center py-3"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span style={{ fontSize: 18 }}>{item.emoji}</span>
                    <span>{item.status}</span>
                  </div>

                  <div className="d-flex align-items-center gap-2">

                    {/* MENU */}
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          opacity: showDots ? 1 : 0,
                          transform: showDots
                            ? "translateX(0)"
                            : "translateX(6px)",
                          transition: "0.18s"
                        }}
                      >
                        <MoreVertical
                          size={18}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === item.id ? null : item.id
                            )
                          }
                        />
                      </div>

                      {openMenuId === item.id && (
                        <div style={menuBox}>
                          <div
                            style={menuItem}
                            onClick={() => {
                              handleEdit(item);
                              setOpenMenuId(null);
                            }}
                          >
                            <Edit2 size={14} /> Edit
                          </div>

                          <div
                            style={{ ...menuItem, color: "#dc3545" }}
                            onClick={() => {
                              handleDelete(item.id);
                              setOpenMenuId(null);
                            }}
                          >
                            <Trash2 size={14} /> Delete
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SWITCH */}
                    <div className="form-check form-switch m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => toggleCustomStatus(item.id)}
                      />
                    </div>

                  </div>
                </ListGroupItem>
              );
            })}

            {/* DEFAULT STATUSES */}
            {defaultStatuses.map((item) => {
              const Icon = item.icon;
              return (
                <ListGroupItem
                  key={item.id}
                  className="d-flex justify-content-between align-items-center py-3"
                >
                  <div className="d-flex align-items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>

                  <div className="form-check form-switch m-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={item.enabled}
                      onChange={() => toggleDefaultStatus(item.id)}
                    />
                  </div>
                </ListGroupItem>
              );
            })}

          </ListGroup>

          {/* CLEAR AFTER + CONFIRM */}
          {isStatusSelected && (
            <div className="p-3 border-top">

              <div
                className="d-flex justify-content-between align-items-center mb-3"
                style={clearBox}
                onClick={() => setShowClearModal(true)}
              >
                <span>Clear after</span>
                <span>›</span>
              </div>

              <button
                className="btn w-100"
                style={confirmBtn}
                onClick={handleConfirm}
              >
                Confirm
              </button>

            </div>
          )}

        </ModalBody>
      </Modal>

      {/* CUSTOM STATUS MODAL */}
      <CustomStatusModal
        show={showCustomModal}
        handleClose={() => {
          setShowCustomModal(false);
          setEditingStatus(null);
        }}
        onSave={handleSaveCustomStatus}
        editingData={editingStatus}
      />

      {/* CLEAR AFTER MODAL */}
      <ClearAfterModal
        show={showClearModal}
        onClose={() => setShowClearModal(false)}
        onUpdate={(val) => setClearAfterValue(val)}
      />
    </>
  );
};

/* ================= STYLE ================= */

const menuBox = {
  position: "absolute",
  right: 0,
  top: 26,
  background: "#fff",
  borderRadius: 6,
  border: "1px solid #eee",
  zIndex: 100,
  minWidth: 130,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
};

const menuItem = {
  padding: "8px 12px",
  display: "flex",
  gap: 8,
  alignItems: "center",
  cursor: "pointer",
  fontSize: 14
};

const clearBox = {
  background: "#405189",
  padding: "12px",
  borderRadius: 8,
  cursor: "pointer",
  color: "#fff"
};

const confirmBtn = {
  background: "#0ab39c",
 
  color:"#fff"
};

export default StatusBottomSheet;