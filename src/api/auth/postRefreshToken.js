import { makeRequest } from '../../helpers/makeRequest.js';

const postRefreshToken = (data) =>
  makeRequest('post', `/refresh_token`, data);

export default postRefreshToken;