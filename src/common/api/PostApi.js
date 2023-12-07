import { Api } from "./Api"

export const PostApi = (url, data, is_multipart) => new Promise((resolve, reject) => {
    const headers = is_multipart
        ? { "Content-Type": "multipart/form-data" }
        : {};

    Api({
        method: 'POST',
        url: url,
        data: data,
        headers: headers
    }).then(res => {
        console.log("API SUCCESS !!!!!");
        resolve(res)
    }).catch(err => {
        console.log("API FAILURE !!!!!");
        resolve(err?.response)
    })
})