import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";

const ClearAfterModal = ({ show, onClose, onUpdate }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [customDate, setCustomDate] = useState("");

  const now = new Date().toISOString().slice(0, 16);

  const handleUpdate = () => {
    if (selectedOption === "custom") {
      if (!customDate) return;
      onUpdate(customDate);
    } else {
      onUpdate(selectedOption);
    }
    onClose();
  };

  const options = [
    { label: "Don’t clear", value: "none" },
    { label: "30 Minutes", value: "30m" },
    { label: "1 Hour", value: "1h" },
    { label: "4 Hours", value: "4h" }
  ];

  const boxStyle = (active) => ({
    border: `1px solid ${active ? "#198754" : "#e2e8f0"}`,
    borderRadius: "8px",
    padding: "12px 14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: active ? "#f0fdf4" : "#fff"
  });

  const radioOuter = {
    width: 18,
    height: 18,
    border: "2px solid #198754",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const radioInner = {
    width: 8,
    height: 8,
    background: "#198754",
    borderRadius: "50%"
  };

  return (
    <Modal isOpen={show} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Clear after</ModalHeader>

      <ModalBody>
        <div className="d-flex flex-column gap-3">

          {options.map((item) => {
            const active = selectedOption === item.value;
            return (
              <div
                key={item.value}
                style={boxStyle(active)}
                onClick={() => setSelectedOption(item.value)}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span>{item.label}</span>
                  <div style={radioOuter}>
                    {active && <div style={radioInner}></div>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Custom Date */}
          <div style={boxStyle(selectedOption === "custom")}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Custom Date</span>
              <div style={radioOuter}>
                {selectedOption === "custom" && (
                  <div style={radioInner}></div>
                )}
              </div>
            </div>

            <input
              type="datetime-local"
              className="form-control"
              min={now}
              value={customDate}
              onChange={(e) => {
                setSelectedOption("custom");
                setCustomDate(e.target.value);
              }}
              onFocus={() => setSelectedOption("custom")}
            />
          </div>

          <Button
            color="success"
            className="mt-3"
            onClick={handleUpdate}
            disabled={!selectedOption || (selectedOption === "custom" && !customDate)}
          >
            Update
          </Button>

        </div>
      </ModalBody>
    </Modal>
  );
};

export default ClearAfterModal;