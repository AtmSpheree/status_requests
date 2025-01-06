import { makeRequest } from '../../helpers/makeRequest.js';

const getResetPassword = (token) =>
  makeRequest('get', `/reset_password/${token}`);

export default getResetPassword;