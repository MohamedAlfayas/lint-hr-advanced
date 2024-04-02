import { Api } from "./Api";

export const GetApi = (url) => new Promise((resolve, reject) => {
    Api({
        method: 'GET',
        url: url,
    }).then(res => {
        console.log("GET API SUCCESS !!!!!");
        resolve(res)
    }).catch(err => {
        console.log("GET API FAILURE !!!!!");
        resolve(err?.response)
    })
})