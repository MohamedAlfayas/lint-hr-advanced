import { WsBaseURL } from "../../../common/api/BaseURL";

let socket = null;

export const connectWebSocket = (employeeId) => {
  console.log(employeeId);

  if (socket && socket.readyState === window.WebSocket.OPEN) return;

  socket = new window.WebSocket(WsBaseURL);

  socket.onopen = () => {
    socket.send(JSON.stringify({ action: "watch", employee_id: employeeId }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("📍 Live Location Received", data);
  };

  socket.onerror = (error) => console.error("❌ WebSocket Error", error);

  socket.onclose = () => {
    socket = null;
  };
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
