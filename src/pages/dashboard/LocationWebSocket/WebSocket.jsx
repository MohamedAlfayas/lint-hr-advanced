import { WsBaseURL } from "../../../common/api/BaseURL";

let socket = null;
let currentEmployeeId = null;

/**
 * Opens (or reuses) a WebSocket connection for a given employee.
 */
export const connectWebSocket = (
  employeeId,
  { onOpen, onMessage, onRouteUpdate, onError, onClose } = {},
) => {
  if (!employeeId) {
    console.warn("⚠️ Employee ID is missing.");
    return;
  }

  console.log("====================================");
  console.log("🚀 Connecting WebSocket...");
  console.log("🌐 URL:", WsBaseURL);
  console.log("👤 Employee ID:", employeeId);
  console.log("====================================");

  // Already connected for this employee
  if (
    socket &&
    socket.readyState === WebSocket.OPEN &&
    currentEmployeeId === employeeId
  ) {
    console.log("✅ WebSocket already connected.");
    if (onOpen) onOpen();
    return;
  }

  // Close previous socket if exists
  if (socket) {
    console.log("🔄 Closing previous WebSocket connection...");

    try {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
    } catch (err) {
      console.error("❌ Error closing previous WebSocket:", err);
    }

    socket = null;
  }

  currentEmployeeId = employeeId;

  socket = new WebSocket(WsBaseURL);

  socket.onopen = () => {
    console.log("====================================");
    console.log("✅ WebSocket Connected Successfully");
    console.log("Ready State:", socket.readyState); // 1 = OPEN
    console.log("====================================");

    const payload = {
      action: "watch",
      employee_id: employeeId,
    };

    console.log("📤 Sending Payload:");
    console.log(payload);

    socket.send(JSON.stringify(payload));

    if (onOpen) onOpen();
  };

  socket.onmessage = (event) => {
    console.log("====================================");
    console.log("📥 Message Received");
    console.log("Raw:", event.data);

    try {
      const data = JSON.parse(event.data);
      console.log("Parsed:", data);

      if (data.action === "route_update") {
        if (onRouteUpdate) onRouteUpdate(data);
        console.log("====================================");
        return;
      }

      if (onMessage) onMessage(data);
    } catch (err) {
      console.error("❌ JSON Parse Error:", err);
      console.log("Received:", event.data);
    }

    console.log("====================================");
  };

  socket.onerror = (event) => {
    console.log("====================================");
    console.error("❌ WebSocket Error");
    console.error(event);
    console.log("====================================");

    if (onError) onError(event);
  };

  socket.onclose = (event) => {
    console.log("====================================");
    console.warn("🔌 WebSocket Closed");
    console.log("Code:", event.code);
    console.log("Reason:", event.reason || "No reason provided");
    console.log("Was Clean:", event.wasClean);
    console.log("====================================");

    if (currentEmployeeId === employeeId) {
      socket = null;
      currentEmployeeId = null;
    }

    if (onClose) onClose(event);
  };
};

export const disconnectWebSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting WebSocket...");

    try {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
    } catch (err) {
      console.error("❌ Error closing WebSocket:", err);
    }

    socket = null;
    currentEmployeeId = null;

    console.log("✅ WebSocket Disconnected.");
  } else {
    console.log("ℹ️ No active WebSocket connection.");
  }
};
