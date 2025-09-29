import React, { useState } from "react";
import {
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  Table,
} from "reactstrap";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

// Dummy data with inTime and outTime
const employeeLocations = [
  {
    state: "Tamil Nadu",
    lat: 11.1271,
    lng: 78.6569,
    employees: [
      { name: "Ramesh", inTime: "09:00", outTime: "17:00" },
      { name: "Suresh", inTime: "09:30", outTime: "18:00" },
      { name: "Kavitha", inTime: "08:45", outTime: "17:15" },
      { name: "Priya", inTime: "09:10", outTime: "17:20" },
      { name: "Arun", inTime: "09:00", outTime: "16:45" },
    ],
  },
  {
    state: "Kerala",
    lat: 10.8505,
    lng: 76.2711,
    employees: [
      { name: "Anil", inTime: "09:00", outTime: "17:00" },
      { name: "Rekha", inTime: "09:15", outTime: "17:10" },
      { name: "Vijay", inTime: "09:05", outTime: "17:20" },
      { name: "Meera", inTime: "09:00", outTime: "16:50" },
      { name: "Ajith", inTime: "09:10", outTime: "17:30" },
    ],
  },
  {
    state: "Karnataka",
    lat: 15.3173,
    lng: 75.7139,
    employees: [
      { name: "Rahul", inTime: "09:00", outTime: "17:15" },
      { name: "Ananya", inTime: "09:05", outTime: "17:25" },
      { name: "Manoj", inTime: "09:10", outTime: "17:00" },
      { name: "Deepa", inTime: "09:00", outTime: "17:20" },
      { name: "Sanjay", inTime: "09:20", outTime: "17:10" },
    ],
  },
];

const containerStyle = { width: "100%", height: "300px" };
const center = { lat: 12.9716, lng: 77.5946 };

// Helper to calculate total hours
const calculateTotalTime = (inTime, outTime) => {
  const [inH, inM] = inTime.split(":").map(Number);
  const [outH, outM] = outTime.split(":").map(Number);
  let totalMinutes = outH * 60 + outM - (inH * 60 + inM);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const LocationMap = () => {
  const [selectedState, setSelectedState] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  });

  const getPercentage = (employees) => {
    const present = employees.filter((e) => e.inTime && e.outTime).length;
    return Math.round((present / employees.length) * 100);
  };

  const openModal = (state) => {
    setSelectedState(state);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedState(null);
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Google Map */}
      <Card className="mb-3">
        <CardBody>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={6}
            >
              {employeeLocations.map((loc, index) => (
                <Marker
                  key={index}
                  position={{ lat: loc.lat, lng: loc.lng }}
                  onClick={() => openModal(loc)}
                />
              ))}
            </GoogleMap>
          ) : (
            <p>Loading Map...</p>
          )}
        </CardBody>
      </Card>

      {/* Card with Custom Progress Bars */}
      <Card className="mb-3">
        <CardBody>
          {employeeLocations.map((loc, index) => {
            const percent = getPercentage(loc.employees);
            return (
              <div
                key={index}
                className="px-2 py-2 mt-1"
                onClick={() => openModal(loc)}
                style={{ cursor: "pointer" }}
              >
                <p className="mb-1">
                  {loc.state} <span className="float-end">{percent}%</span>
                </p>
                <div
                  className="progress mt-2"
                  style={{ height: "6px", backgroundColor: "#e9ecef" }}
                >
                  <div
                    className={`progress-bar progress-bar-striped ${
                      percent > 70 ? "bg-success" : "bg-warning"
                    }`}
                    role="progressbar"
                    style={{ width: `${percent}%` }}
                    aria-valuenow={percent}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>

      {/* Modal for Employee Details */}
      {selectedState && (
        <Modal isOpen={isModalOpen} toggle={closeModal} size="lg">
          <ModalHeader toggle={closeModal}>
            {selectedState.state} - Employee Details
          </ModalHeader>
          <ModalBody>
            <Table bordered responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>In Time</th>
                  <th>Out Time</th>
                  <th>Total Time</th>
                </tr>
              </thead>
              <tbody>
                {selectedState.employees.map((emp, idx) => (
                  <tr key={idx}>
                    <td>{emp.name}</td>
                    <td>{emp.inTime}</td>
                    <td>{emp.outTime}</td>
                    <td>{calculateTotalTime(emp.inTime, emp.outTime)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

export default LocationMap;
