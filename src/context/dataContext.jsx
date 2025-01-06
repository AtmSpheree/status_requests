import { createContext, useState } from 'react';

export const DataContext = createContext(null);

export const DataContextProvider = ({ children }) => {
  const [data, setData] = useState({
    auth: {
      access_token: localStorage.getItem("access_token") ?? null,
      refresh_token: localStorage.getItem("refresh_token") ?? null
    },
    profile: null,
    requests: null,
    isRemember: localStorage.getItem("is_remember") ?? true,
  });

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
};
