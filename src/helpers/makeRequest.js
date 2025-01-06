import { defaultInstance } from "../api/axios";

export const makeRequest = async (
  method,
  url,
  params = null,
  token = null,
) => {
  let add_headers = {}
  if (token !== null) {
    add_headers.Authorization = `Bearer ${token}`
  }
  try {
    const response = await defaultInstance({
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...add_headers
      },
      url: url,
      data: params,
    });

    if (response) {
      return response.data;
    }
  } catch (e) {
    return Promise.reject(e);
  }
};
