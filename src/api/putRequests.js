import {makeRequest} from "../helpers/makeRequest.js";

const putRequests = (data, token, requestId) =>
  makeRequest('put', `/requests/${requestId}`, data, token);

export default putRequests;