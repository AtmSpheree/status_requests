import { makeRequest } from '../../helpers/makeRequest.js';

const postResetPassword = (token, data) =>
  makeRequest('post', `/reset_password_query/${token}`, data);

export default postResetPassword;