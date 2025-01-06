import { makeRequest } from '../../helpers/makeRequest.js';

const postLogin = (data, token) =>
  makeRequest('post', `/login/${token}`, data);

export default postLogin;