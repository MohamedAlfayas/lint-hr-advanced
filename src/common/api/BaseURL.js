export const getBaseUrlFromDomain = () => {
  const MULTIDB_ENABLED = parseInt(
    process.env.REACT_APP_MULTIDB_ENABLED || "0",
  );

  let base_url = "http://192.168.0.57:8000/";

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
