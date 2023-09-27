import axios from "axios";

export const Api = axios.create({
    baseURL: "http://192.168.1.100:8000/"
})

Api.interceptors.request.use(
    (req) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            req.headers['Authorization'] = 'Bearer ' + token;
            req.headers['content-type'] = 'multipart/form-data';
        }
        return req
    },
    (err) => {
        Promise.reject(err)
    }
)