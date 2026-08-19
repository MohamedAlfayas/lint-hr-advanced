const platform = process.env.REACT_APP_LC_PLATFORM || "local";
const LOCAL_BASE_URL = "http://192.168.0.41:8000/";
export const getBaseUrlFromDomain = () => {
  // Local dev/testing (e.g. on a physical device pointed at your machine's
  // LAN IP) always talks to the fixed local server — skip hostname/subdomain
  // resolution entirely.
  if (platform === "local") {
    return LOCAL_BASE_URL;
  }
  const MULTIDB_ENABLED = parseInt(
    process.env.REACT_APP_MULTIDB_ENABLED || "0",
  );
  let base_url = LOCAL_BASE_URL;
  if (MULTIDB_ENABLED !== 0) {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168");
    if (!isLocal) {
      const subdomain = hostname.split(".")[0];
      if (subdomain) {
        // Match the page's own protocol so production (https) correctly
        // yields wss:// for websockets instead of being hardcoded to ws://.
        const protocol =
          window.location.protocol === "https:" ? "https" : "http";
        base_url = `${protocol}://${subdomain}.localhost:8000/`;
      }
    }
  }
  return base_url;
};
export const getWsUrlFromDomain = () => {
  const domain = window.location.hostname.split(".")[0];

  // Safely extract token without crashing or returning "undefined"
  let token = "";
  try {
    const rawToken = localStorage.getItem("lint_hr_token");
    const parsed = rawToken ? JSON.parse(rawToken) : null;
    token = (typeof parsed === "object" && parsed !== null ? parsed.access : parsed) || "";
  } catch {
    token = localStorage.getItem("lint_hr_token") || "";
  }

  if (
    !!process.env.REACT_APP_LC_PLATFORM &&
    process.env.REACT_APP_LC_PLATFORM === "local"
  ) {
    const httpUrl = getBaseUrlFromDomain();
    const wsUrl = httpUrl.replace(/^http/, "ws").replace(/\/$/, "");
    return `${wsUrl}/ws/tracking/?token=${token}`;
  } else {
    // Construct the base URL dynamically
    if (!!domain) {
      return `wss://${domain}.${process.env.REACT_APP_BASE_URL}/ws/tracking/?token=${token}`;
    }
  }
};
};
export const WsBaseURL = getWsUrlFromDomain();
