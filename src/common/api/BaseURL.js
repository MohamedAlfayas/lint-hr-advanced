


export const getBaseUrlFromDomain = () => {
    const REACT_APP_MULTIDB_ENABLED = process.env.REACT_APP_MULTIDB_ENABLED


    let base_url = "http://192.168.0.28:8000/"

    if (REACT_APP_MULTIDB_ENABLED != null && REACT_APP_MULTIDB_ENABLED != undefined && parseInt(REACT_APP_MULTIDB_ENABLED) != 0) {
        const domain = window.location.hostname.split(".")[0];

        if (domain) {
            let allowed_domain = ['localhost', '127']

            if (allowed_domain.includes(domain)) {
                base_url = "http://192.168.0.28:8000/"
            }
            else {
                base_url = `http://${domain}.localhost:8000/`;
            }
        }


    }

    return base_url
}


export const BaseURL = getBaseUrlFromDomain();
// export const BaseURL = "https://dev.linthr.com/";
//export const BaseURL = "http://192.168.1.14:8000/";
export const ProductionBaseURL = "http://62.72.59.29:8000";
