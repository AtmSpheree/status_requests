import styles from "./RegisterSuccess.module.css"
import {useCallback, useContext, useEffect, useState} from "react";
import {DataContext} from "../../context/dataContext.jsx";
import {useLocation, useNavigate} from "react-router-dom";
import useTimer from "../../hooks/useTimer.jsx";
import postRegister from "../../api/auth/postRegister.js";
import normalizeError from "../../helpers/normalizeError.js";
import {InvisibleSmartCaptcha} from "@yandex/smart-captcha";

const RegisterSuccess = (props) => {
  const navigator = useNavigate();
  const dataContext = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const timer = useTimer({seconds: 120});
  const { state: params } = useLocation();

  const [resetCaptcha, setResetCaptcha] = useState(0);
  const [token, setToken] = useState(null);
  const [visible, setVisible] = useState(false);
  const handleChallengeHidden = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (dataContext.data?.auth?.access_token || dataContext.data?.auth?.refresh_token) {
      navigator("/")
    }
    if (params === null) {
      navigator("/register")
    }
    timer.reloadTimer()
  }, []);

  useEffect(() => {
    async function sendEmailAgain() {
      if (token === null) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const fetchedData = await postRegister(params, token);
        timer.reloadTimer()
      } catch (e) {
        let norm_e = normalizeError(e)
        if (norm_e.status === 403) {
          if (norm_e.response.data.message === "The captcha token is incorrect.") {
            setError("Ошибка прохождения капчи")
          } else if (norm_e.response.data.message === "A user with such an email already exists.") {
            setError("Аккаунт с такой почтой уже зарегистрирован")
          }
        } else {
          setError("Ошибка со стороны сервера")
        }
      }
      setResetCaptcha((prev) => prev + 1)
      setIsLoading(false);
    }

    sendEmailAgain();
  }, [token])

  return (<div className="wrapper">
    <div className={styles.logo_container}>
      <a onClick={(e) => navigator("/")}>
        <img className="logo" src="/images/logo_main.svg" alt="СТАТУС"/>
      </a>
    </div>
    <div className={"status_container"} style={{marginTop: 30}}>
      <img className={styles.email} src={"/images/email.svg"} alt="Почта"/>
    </div>
    <div className={styles.info_container}>
      <p className={styles.info_container__header}>
        Проверьте почту
      </p>
      <p className={styles.info_container__text}>
        Мы отправили ссылку-подтверждение регистрации вам на почту.<br/>
        Ссылка действительна в течении 15 минут.<br/>
        После подтверждения вы сможете войти в аккаунт.
      </p>
    </div>
    <InvisibleSmartCaptcha
      key={resetCaptcha}
      sitekey={import.meta.env.VITE_YSC_TOKEN}
      onSuccess={(token) => {setToken(token); setVisible(false)}}
      onJavascriptError={() => {setToken(null); setError("Критическая ошибка")}}
      onTokenExpired={() => {setToken(null); setError("Пройдите капчу заново")}}
      onNetworkError={() => {setToken(null); setError("Ошибка сети")}}
      onChallengeHidden={handleChallengeHidden}
      visible={visible}
    />
    <div className={styles.add_text_container}>
      <p className={styles.add_text_container__text}>
        Не получили ссылку?
      </p>
      {isLoading &&
        <span
          className={"loader"}
          style={{
            width: 20,
            height: 20,
            border: "3px dotted var(--main-color-palette_accent)",
          }}
        >
        </span>
      }
      <div className={styles.timer_container}>
        <a className={`noselect ${styles.add_text_container__link}`}
           style={{
             pointerEvents: timer.remains !== 0 && "none",
             color: timer.remains !== 0 && "var(--main-color-palette_grey__light)",
             cursor: timer.remains !== 0 && "auto"
           }}
           onClick={(e) => setVisible(true)}
        >
          Отправить ещё раз
        </a>
        {timer.remains !== 0 &&
          <p className={`noselect ${styles.add_text_container__text}`}>
            {Math.floor(timer.remains / 60)}:{("0" + String(timer.remains % 60)).slice(-2)}
          </p>
        }
        {timer.remains !== 0 &&
          <img className={styles.add_text_container__clock} src="/images/clock.svg" alt="Время"/>
        }
      </div>
    </div>
    {error !== null &&
      <p
        className={styles.error_text}
      >
        {error}
      </p>
    }
    <a
      className={styles.add_text_container__link}
      onClick={(e) => navigator("/login")}
      style={{marginTop: 10}}
    >
      Вернуться к авторизации
    </a>
  </div>)
}

RegisterSuccess.props = {}

export default RegisterSuccess;