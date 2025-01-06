import { makeRequest } from '../../helpers/makeRequest.js';

const postRegister = (data, token) =>
  makeRequest('post', `/register/${token}`, data);

export default postRegister;