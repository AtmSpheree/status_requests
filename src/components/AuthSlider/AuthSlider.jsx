import styles from './AuthSlider.module.css'
import './AuthSlider.css'
import {useCallback, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import { Outlet } from "react-router-dom"
import {InvisibleSmartCaptcha} from "@yandex/smart-captcha";
import useWindowSize from "../../hooks/useWindowSize.jsx";

const AuthSlider = () => {
  const [authSliderTexts, setAuthSliderTexts] = useState({
    login: "auth_slider__active",
    register: "auth_slider__inactive"
  });
  const location = useLocation();
  const navigator = useNavigate();

  const [width, height] = useWindowSize();
  const [captchaError, setCaptchaError] = useState(null);
  const [resetCaptcha, setResetCaptcha] = useState(0);
  const [token, setToken] = useState(null);
  const [visible, setVisible] = useState(false);
  const handleChallengeHidden = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (location.pathname === "/login") {
      setAuthSliderTexts({
        login: "auth_slider_texts auth_slider__active",
        register: "auth_slider_texts auth_slider__inactive"
      })
    } else if (location.pathname === "/register") {
      setAuthSliderTexts({
        login: "auth_slider_texts auth_slider__inactive",
        register: "auth_slider_texts auth_slider__active"
      })
    }
  }, [location.pathname]);

  return (<div className="wrapper">
    <div className={styles.logo_container}>
      <a onClick={(e) => navigator("/")}>
        <img className="logo" src="/images/logo_main.svg" alt="СТАТУС"/>
      </a>
    </div>
    <div className="noselect">
      <div className={styles.auth_slider}>
        <div
          className={styles.auth_slider_background}
          style={{
            left: location.pathname === "/login" ?
              5
              :
              width > 600 ? 205 : (width > 350 ? 155 : 130),
          }}
        >
        </div>
        <p
          className={authSliderTexts.login}
          onClick={(e) => navigator("/login")}
        >
          Авторизация
        </p>
        <p
          className={authSliderTexts.register}
          onClick={(e) => navigator("/register")}
        >
          Регистрация
        </p>
      </div>
    </div>
    <InvisibleSmartCaptcha
      key={resetCaptcha}
      sitekey={import.meta.env.VITE_YSC_TOKEN}
      onSuccess={(token) => {setToken(token); setVisible(false)}}
      onJavascriptError={() => {setToken(null); setCaptchaError("Критическая ошибка")}}
      onTokenExpired={() => {setToken(null); setCaptchaError("Пройдите капчу заново")}}
      onNetworkError={() => {setToken(null); setCaptchaError("Ошибка сети")}}
      onChallengeHidden={handleChallengeHidden}
      visible={visible}
      shieldPosition={"bottom-right"}
    />
    <Outlet context={{
      setVisible: setVisible,
      token: token,
      setResetCaptcha: setResetCaptcha,
      captchaError: captchaError
    }}/>
  </div>)
}

export default AuthSlider;