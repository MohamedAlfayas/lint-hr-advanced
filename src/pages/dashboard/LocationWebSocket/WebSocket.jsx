import { WsBaseURL } from "../../../common/api/BaseURL";

let socket = null;
let currentEmployeeId = null;

/**
 * Opens (or reuses) a WebSocket "watch" connection for a given employee.
 *
 * @param {string|number} employeeId
 * @param {Object} callbacks
 * @param {Function} [callbacks.onOpen]    - called once the socket is open and the watch payload has been sent
 * @param {Function} [callbacks.onMessage] - called with the parsed JSON payload for every incoming message
 * @param {Function} [callbacks.onError]   - called with the raw error event
 * @param {Function} [callbacks.onClose]   - called with the raw close event
 */
export const connectWebSocket = (
  employeeId,
  { onOpen, onMessage, onError, onClose } = {},
) => {
  if (!employeeId) return;

  // Already watching this exact employee on an open socket — nothing to do.
  if (
    socket &&
    socket.readyState === WebSocket.OPEN &&
    currentEmployeeId === employeeId
  ) {
    if (onOpen) onOpen();
    return;
  }

  // Different employee, or the existing socket isn't usable — tear it down
  // first so we never end up watching the wrong employee on a stale socket.
  if (socket) {
    try {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
    } catch (err) {
      console.error("Error closing previous WebSocket:", err);
    }
    socket = null;
  }

  currentEmployeeId = employeeId;
  socket = new WebSocket(WsBaseURL);

  socket.onopen = () => {
    const payload = {
      action: "watch",
      employee_id: employeeId,
    };
    socket.send(JSON.stringify(payload));
    if (onOpen) onOpen();
  };

  socket.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (err) {
      console.error("WebSocket message parse error:", err, event.data);
      return;
    }
    if (onMessage) onMessage(data);
  };

  socket.onerror = (event) => {
    console.error("WebSocket error:", event);
    if (onError) onError(event);
  };

  socket.onclose = (event) => {
    // Only clear the shared references if this close event belongs to the
    // socket/employee we still think is current (avoids a late close event
    // for a superseded connection wiping out a newer one).
    if (currentEmployeeId === employeeId) {
      socket = null;
      currentEmployeeId = null;
    }
    if (onClose) onClose(event);
  };
};

export const disconnectWebSocket = () => {
  if (socket) {
    try {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
    } catch (err) {
      console.error("Error closing WebSocket:", err);
    }
    socket = null;
    currentEmployeeId = null;
  }
};
