import { Api } from "./Api";

export const DeleteApi = (url) =>
  new Promise((resolve, reject) => {
    Api({
      method: "DELETE",
      url: url,
    })
      .then((res) => {
        console.log("DELETE API SUCCESS !!!!!");
        resolve(res);
      })
      .catch((err) => {
        console.log("DELETE API FAILURE !!!!!");
        resolve(err?.response);
      });
  });