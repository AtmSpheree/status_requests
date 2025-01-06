import {makeRequest} from "../helpers/makeRequest.js";

const getProfile = (token) =>
  makeRequest('get', `/profile`, null, token);

export default getProfile;