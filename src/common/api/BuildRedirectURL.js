export const buildRedirectUrl = (domain) => {
    const host = window.location.host;
    const protocol = window.location.protocol;

    let newHost = "";

    if (host.includes("localhost")) {
        const port = host.split(":")[1] || "3000";
        newHost = `${domain}.localhost:${port}`;
    } else {
        const parts = host.split(".");
        newHost =
            parts.length === 2
                ? `${domain}.${host}`
                : [domain, ...parts.slice(1)].join(".");
    }

    return `${protocol}//${newHost}/auth/login/`;
};