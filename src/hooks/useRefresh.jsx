import {useEffect, useState} from 'react';
import normalizeError from "../helpers/normalizeError.js";
import postRefreshToken from "../api/auth/postRefreshToken.js";

const useRefresh = (props) => {
  const [isError, setIsError] = useState(false);

  const refresh = async () => {
    if (props.context !== undefined) {
      if (props.context.data?.auth?.refresh_token !== null) {
        try {
          const fetchedData = await postRefreshToken({
            refresh_token: props.context.data?.auth?.refresh_token
          });
          if (props.context.data?.isRemember) {
            localStorage.setItem("access_token", fetchedData.access_token)
            localStorage.setItem("refresh_token", fetchedData.refresh_token)
          }
          props.context.setData({
            ...props.context.data,
            auth: {
              access_token: fetchedData.access_token,
              refresh_token: fetchedData.refresh_token,
            }
          })
          setIsError(false)
        } catch (e) {
          let norm_e = normalizeError(e)
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setIsError(true)
        }
      }
    }
  }

  return {
    isError: isError,
    refresh: refresh,
  }
}

useRefresh.props = {
  context: undefined,
}

export default useRefresh;