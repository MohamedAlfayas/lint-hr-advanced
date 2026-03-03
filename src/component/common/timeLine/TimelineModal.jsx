import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Nav,
  NavItem,
  NavLink
} from "reactstrap";
import { Search } from "react-feather";
import classnames from "classnames";

const TimelineModal = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState("All");

  const timelineData = [
    {
      id: 1,
      type: "Meeting",
      title: "Client Meeting",
      time: "10:00 am | 23 Feb 2026"
    },
    {
      id: 2,
      type: "DND",
      title: "Break",
      time: "3:08 pm | 23 Feb 2026"
    },
    {
      id: 3,
      type: "DND",
      title: "Sick",
      time: "1:00 pm | 22 Feb 2026"
    },
    {
      id: 4,
      type: "DND",
      title: "Rest",
      time: "6:00 pm | 21 Feb 2026"
    },
    {
      id: 5,
      type: "DND",
      title: "Rest",
      time: "6:00 pm | 21 Feb 2026"
    },
    {
      id: 6,
      type: "DND",
      title: "Rest",
      time: "6:00 pm | 21 Feb 2026"
    },
    {
      id: 7,
      type: "DND",
      title: "Rest",
      time: "6:00 pm | 21 Feb 2026"
    },
    {
      id: 8,
      type: "DND",
      title: "Rest",
      time: "6:00 pm | 21 Feb 2026"
    },
    {
      id: 9,
      type: "DND",
      title: "Rest",
      time: "6:00 pm | 21 Feb 2026"
    },
  ];

  const filteredData =
    activeTab === "All"
      ? timelineData
      : timelineData.filter(item => item.type === activeTab);

  return (
    <>
      <Modal isOpen={show} toggle={onClose} size="lg" centered>
        <ModalHeader toggle={onClose}>
          Timeline
        </ModalHeader>

        <ModalBody className="timeline-modal-body">
          {/* Search */}
          <div className="d-flex align-items-center mb-3">
            <Search size={16} className="me-2" />
            <Input placeholder="Search location" />
          </div>

          {/* Filters */}
          <Nav pills className="mb-3">
            {["All", "Meeting", "DND"].map(tab => (
              <NavItem key={tab}>
                <NavLink
                  className={classnames({ active: activeTab === tab })}
                  onClick={() => setActiveTab(tab)}
                  style={{ cursor: "pointer" }}
                >
                  {tab}
                </NavLink>
              </NavItem>
            ))}
          </Nav>

          {/* Timeline Data */}
          <div className="border-start ps-3">
            {filteredData.length > 0 ? (
              filteredData.map(item => (
                <div key={item.id} className="mb-4">
                  <h6 className="mb-1">{item.title}</h6>
                  <small className="text-muted">{item.time}</small>
                </div>
              ))
            ) : (
              <p className="text-muted">No data available</p>
            )}
          </div>
        </ModalBody>
      </Modal>

      {/* CSS Inside Component */}
      <style>
        {`
          .timeline-modal-body {
            height: 400px;
            overflow-y: auto;
          }

          .timeline-modal-body::-webkit-scrollbar {
            width: 6px;
          }

          .timeline-modal-body::-webkit-scrollbar-thumb {
            background-color: #c1c1c1;
            border-radius: 10px;
          }

          .nav-pills .nav-link {
            cursor: pointer;
          }

          
        `}
      </style>
    </>
  );
};

export default TimelineModal;