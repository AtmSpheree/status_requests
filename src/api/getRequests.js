import {makeRequest} from "../helpers/makeRequest.js";

const getRequests = (token) =>
  makeRequest('get', `/requests`, null, token);

export default getRequests;