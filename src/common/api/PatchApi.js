export const PatchApi = async (url, data, is_multipart) => {
  try {
    const headers = is_multipart
      ? { "Content-Type": "multipart/form-data" }
      : {};

    const res = await Api({
      method: "PATCH",
      url: url,
      data,
      headers,
    });

    console.log("PATCH API SUCCESS !!!!!");
    return res;
  } catch (err) {
    console.log("PATCH API FAILURE !!!!!");

    return err?.response || {
      status: 500,
      data: {
        message: "Network error or server not reachable",
      },
    };
  }
};