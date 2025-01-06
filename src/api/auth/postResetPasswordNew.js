import { makeRequest } from '../../helpers/makeRequest.js';

const postResetPasswordNew = (token, data) =>
  makeRequest('post', `/reset_password/${token}`, data);

export default postResetPasswordNew;