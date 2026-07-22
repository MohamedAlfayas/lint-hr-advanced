import { WsBaseURL } from "../../../common/api/BaseURL";

let socket = null;

export const connectWebSocket = (employeeId) => {
  console.log("========================================");
  console.log("🚀 connectWebSocket() called");
  console.log("👤 Employee ID:", employeeId);
  console.log("🌐 WebSocket URL:", WsBaseURL);

  if (socket) {
    console.log("📡 Existing Socket State:", socket.readyState);

    switch (socket.readyState) {
      case WebSocket.CONNECTING:
        console.log("🟡 Socket is CONNECTING");
        break;
      case WebSocket.OPEN:
        console.log("🟢 Socket is already OPEN");
        return;
      case WebSocket.CLOSING:
        console.log("🟠 Socket is CLOSING");
        break;
      case WebSocket.CLOSED:
        console.log("🔴 Socket is CLOSED");
        break;
      default:
        console.log("❓ Unknown socket state");
    }
  }

  console.log("🆕 Creating new WebSocket...");

  socket = new WebSocket(WsBaseURL);

  console.log("📡 New WebSocket Object:", socket);

  socket.onopen = () => {
    console.log("========================================");
    console.log("✅ WebSocket Connected");
    console.log("📡 Ready State:", socket.readyState);

    const payload = {
      action: "watch",
      employee_id: employeeId,
    };

    console.log("📤 Sending Payload:", payload);

    socket.send(JSON.stringify(payload));

    console.log("✅ Payload Sent");
  };

  socket.onmessage = (event) => {
    console.log("========================================");
    console.log("📩 Raw Message Event:", event);
    console.log("📩 Raw Data:", event.data);

    try {
      const data = JSON.parse(event.data);
      console.log("✅ Parsed Data:", data);
    } catch (err) {
      console.error("❌ JSON Parse Error:", err);
    }
  };

  socket.onerror = (event) => {
    console.log("========================================");
    console.error("❌ WebSocket Error");
    console.log("Event:", event);
    console.log("Socket:", socket);

    if (socket) {
      console.log("ReadyState:", socket.readyState);
      console.log("URL:", socket.url);
      console.log("Protocol:", socket.protocol);
      console.log("Buffered Amount:", socket.bufferedAmount);
      console.log("Extensions:", socket.extensions);
    }
  };

  socket.onclose = (event) => {
    console.log("========================================");
    console.warn("🔌 WebSocket Closed");
    console.log("Code:", event.code);
    console.log("Reason:", event.reason);
    console.log("Was Clean:", event.wasClean);

    socket = null;
  };
};

export const disconnectWebSocket = () => {
  console.log("========================================");
  console.log("🔌 disconnectWebSocket() called");

  if (socket) {
    console.log("Closing Socket...");
    socket.close();
    socket = null;
    console.log("Socket Closed");
  } else {
    console.log("No socket to close");
  }
};
