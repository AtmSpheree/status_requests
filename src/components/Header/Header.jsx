import styles from "./Header.module.css"
import {data, Outlet, useNavigate} from "react-router-dom"
import {useContext, useEffect, useState} from "react";
import {DataContext} from "../../context/dataContext.jsx";
import useRefresh from "../../hooks/useRefresh.jsx";
import normalizeError from "../../helpers/normalizeError.js";
import getProfile from "../../api/getProfile.js";

const Header = () => {
  const dataContext = useContext(DataContext);
  const navigator = useNavigate();
  const [isChecked, setIsChecked] = useState(false);
  const [isCanRefresh, setIsCanRefresh] = useState(false);
  const refreshHook = useRefresh({context: dataContext});

  const getProfileRequest = async () => {
    try {
      const fetchedData = await getProfile(dataContext.data?.auth?.access_token);

      dataContext.setData({
        ...dataContext.data,
        profile: fetchedData
      })
      setIsCanRefresh(false);
      setIsChecked(true);
    } catch (e) {
      let norm_e = normalizeError(e)
      setIsCanRefresh(true);
      refreshHook.refresh()
    }
  }

  useEffect(() => {
    if (refreshHook.isError) {
      navigator("/login")
    }
  }, [refreshHook.isError]);

  useEffect(() => {
    if (!dataContext.data?.auth?.access_token || !dataContext.data?.auth?.refresh_token) {
      navigator("/login")
      return;
    }

    getProfileRequest();
  }, []);

  useEffect(() => {
    if (!isChecked) {
      if (dataContext.data?.auth?.access_token !== null) {
        if (isCanRefresh) {
          getProfileRequest();
        }
      }
    }
  }, [dataContext.data?.auth?.access_token])

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    dataContext.setData({
      ...dataContext.data,
      auth: {
        access_token: null,
        refresh_token: null,
      }
    });
    navigator("/login");
  }

  return (!isChecked ?
    <div className="loader_wrapper">
      <span className="loader" style={{width: 100, height: 100, border: "10px dotted var(--main-color-palette_accent)"}}></span>
    </div>
  :
    <div className="wrapper">
      <div className={styles.header_container}>
        <div className={styles.header_subcontainer}>
          <a onClick={(e) => navigator("/")}>
            <img className="logo" src="/images/logo_main.svg" alt="СТАТУС"/>
          </a>
          {dataContext.data?.profile?.is_admin === 1 &&
            <p className={styles.header_admin_mark}>
              admin
            </p>
          }
        </div>
        <div className={styles.header_subcontainer_menu}>
        <p
            className={styles.logout_button}
            onClick={logout}
          >
            Выйти
          </p>
          <a onClick={(e) => navigator("/profile")}>
            <img className={styles.profile_img} alt="Профиль" src="/images/profile.svg"/>
          </a>
        </div>
      </div>
      <Outlet/>
    </div>
  )
}

export default Header;