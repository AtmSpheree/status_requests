import {makeRequest} from "../helpers/makeRequest.js";

const postRequests = (data, yscToken, token) =>
  makeRequest('post', `/requests/${yscToken}`, data, token);

export default postRequests;