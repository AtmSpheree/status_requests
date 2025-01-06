import { makeRequest } from '../../helpers/makeRequest.js';

const postConfirmRegister = (token) =>
  makeRequest('post', `/confirm_register/${token}`);

export default postConfirmRegister;