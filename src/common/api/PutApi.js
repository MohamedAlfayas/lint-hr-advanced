import { Api } from "./Api";

export const PutApi = async (url, data, is_multipart) => {
  try {
    const headers = is_multipart
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" };

    const res = await Api({
      method: "PUT",
      url: url,
      data,
      headers,
    });

    console.log("PUT API SUCCESS !!!!!");
    return res;
  } catch (err) {
    console.log("PUT API FAILURE !!!!!");

    return err?.response || {
      status: 500,
      data: {
        message: "Network error",
      },
    };
  }
};