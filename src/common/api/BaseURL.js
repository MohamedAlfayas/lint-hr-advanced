const platform = process.env.REACT_APP_LC_PLATFORM || "local";

const LOCAL_BASE_URL = "http://192.168.0.52:8000/";

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
        base_url = `http://${subdomain}.localhost:8000/`;
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
  const httpUrl = getBaseUrlFromDomain(); // reuse same platform/subdomain/local logic
  // Handles both http:// -> ws:// and https:// -> wss:// in one pass, since
  // the regex only consumes the leading "http" and leaves any trailing "s".
  const wsUrl = httpUrl.replace(/^http/, "ws").replace(/\/$/, "");
  return `${wsUrl}/ws/tracking/`;
};

export const WsBaseURL = getWsUrlFromDomain();
