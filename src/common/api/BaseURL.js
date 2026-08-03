const platform = process.env.REACT_APP_LC_PLATFORM || "local";
const LOCAL_BASE_URL = "http://192.168.0.64:8000/";
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
export const BaseURL = getBaseUrlFromDomain();
// export const BaseURL = "https://dev.linthr.com/";
//export const BaseURL = "http://192.168.1.14:8000/";
export const ProductionBaseURL = "http://62.72.59.29:8000";
export const getWsUrlFromDomain = () => {
  const domain = window.location.hostname.split(".")[0];

  if (
    !!process.env.REACT_APP_LC_PLATFORM &&
    process.env.REACT_APP_LC_PLATFORM === "local"
  ) {
    const token = JSON.parse(localStorage.getItem("lint_hr_token"));
    const httpUrl = getBaseUrlFromDomain();
    const wsUrl = httpUrl.replace(/^http/, "ws").replace(/\/$/, "");
    return `${wsUrl}/ws/tracking/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg1NjU2MTk4LCJpYXQiOjE3ODU1Njk3OTgsImp0aSI6IjVkMzI0ZjcwY2MzZjRhOTlhZTUyM2FlZDM4ODc1MzQzIiwiZW1wX3V1aWQiOiI0ZGFkYzQ3MC00Zjc1LTQxMTItYWVhYS00ZjZjZDkwNzMxZjYiLCJ0ZW5hbnQiOiJ6WVlFWnJ3TExHNHYifQ.p9tjEVhJ14r4So3kz-ymdLSG7CoNEf4A8olhPZCA9Fo`;
  } else {
    // Construct the base URL dynamically
    if (!!domain) {
      return `wss://${domain}.${process.env.REACT_APP_BASE_URL}/ws/tracking/`;
    }
  }
};
export const WsBaseURL = getWsUrlFromDomain();
