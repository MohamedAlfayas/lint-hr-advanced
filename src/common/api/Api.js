import axios from "axios";
import { BaseURL } from "./BaseURL";

export const Api = axios.create({
    baseURL: BaseURL
})

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
)