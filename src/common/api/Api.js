import axios from "axios";
import { BaseURL } from "./BaseURL";

export const Api = axios.create({
    baseURL: BaseURL
});


let isRefreshing = false;
let refreshSubscribers = [];

// Function to refresh the token
const getRefreshToken = async () => {
    const refreshToken = JSON.parse(localStorage.getItem('lint_hr_token')).refresh;
    try {
        const response = await axios.post(`${BaseURL}api/token/refresh/`, {
            refresh: refreshToken
        });

        console.log("RT RES = ", response?.data);

        const newAccessToken = response.data.access;

        console.log("New Token = ", newAccessToken);

        // Update the token in local storage
        const tokenData = JSON.parse(('lint_hr_token'));
        tokenData.access = newAccessToken;
        localStorage.setItem('lint_hr_token', JSON.stringify(tokenData));
        // Return the new token
        return newAccessToken;
    } catch (error) {
        // Handle error
        console.error('Error refreshing token:', error);
        throw error; // Rethrow the error for the caller to handle
    }
}



Api.interceptors.request.use(
    (req) => {
        const token = JSON.parse(localStorage.getItem('lint_hr_token'))
        if (token) {
            req.headers['Authorization'] = 'Bearer ' + token?.access;
            req.headers['Accept'] = 'application/json';
        }
        return req
    },
    (err) => {
        Promise.reject(err)
    }
);


// Add response interceptor
Api.interceptors.response.use(
    (response) => {
        // Handle successful responses
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle token-related exceptions
        if (error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If token is being refreshed, wait for the new token
                try {
                    const newToken = await new Promise(resolve => {
                        refreshSubscribers.push(token => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(token);
                        });
                    });
                    originalRequest._retry = true;
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    // Resend the original request with the new token
                    return axios(originalRequest);
                } catch (err) {
                    return Promise.reject(err);
                }
            } else {
                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const newToken = await getRefreshToken();
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    refreshSubscribers.forEach(callback => callback(newToken));
                    refreshSubscribers = [];
                    return axios(originalRequest);
                } catch (refreshError) {
                    console.log("Refresh Error = ", refreshError);
                    // Check if refresh token is expired
                    if (!!refreshError.response && refreshError.response.status === 401) {
                        console.error('Refresh token expired');
                        // Perform logout action (e.g., clear local storage, redirect to login page)
                        logout();
                    }
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
        }

        console.log("API ERROR = ", error);

        // Handle other types of errors
        return Promise.reject(error);
    }
);


const logout = () => {
    // Clear local storage or perform any other logout actions
    localStorage.removeItem("lint_hr_token");
    localStorage.removeItem("lint_hr_v");
    localStorage.removeItem("lint_hr_globaldata");
    localStorage.removeItem("lint_hr_profile_data");
    localStorage.removeItem("user_perm_list");


    if (window.logoutChannel) {
        window.logoutChannel.close();
    }

    // Create a new broadcast channel
    window.logoutChannel = new BroadcastChannel("logoutChannel");

    // Broadcast logout event to other tabs
    window.logoutChannel.postMessage("logoutEvent");

    // Redirect to login page or perform any other appropriate actions
    window.location.href = '/auth/login';
}