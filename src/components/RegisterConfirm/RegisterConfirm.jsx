import styles from "./RegisterConfirm.module.css"
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import postRegister from "../../api/auth/postRegister.js";
import normalizeError from "../../helpers/normalizeError.js";
import postConfirmRegister from "../../api/auth/postConfirmRegister.js";

const RegisterConfirm = () => {
  const params = useParams();
  const navigator = useNavigate();
  const [isTokenValid, setIsTokenValid] = useState(params.token.startsWith("gAAAAA") ? null : false);
  const [error, setError] = useState("Ссылка недействительна.");

  useEffect(() => {
    async function sendRequest() {
      if (isTokenValid === false) {
        return;
      }
      try {
        const fetchedData = await postConfirmRegister(params.token);
        setIsTokenValid(true);
      } catch (e) {
        let norm_e = normalizeError(e)
        setIsTokenValid(false);
        if (norm_e.status === 403) {
          if (norm_e.response.data.message === "The link is invalid.") {
            setError("Ссылка недействительна.")
          } else if (norm_e.response.data.message === "Registration has already been confirmed.") {
            setError("Аккаунт уже был зарегистрирован.")
          }
        } else if (norm_e.status === 408) {
          setError("Срок действия ссылки истёк, запросите новую.")
        } else {
          setError("Ошибка со стороны сервера")
        }
      }
    }

    sendRequest()
  }, [])

  return (<div className="wrapper">
    <div className={styles.logo_container}>
      <a onClick={(e) => navigator("/")}>
        <img className="logo" src="/images/logo_main.svg" alt="СТАТУС"/>
      </a>
    </div>
    {(isTokenValid === null) &&
      <span
        className="loader"
        style={{
          width: 50,
          height: 50,
          border: "5px dotted var(--main-color-palette_accent)",
          marginTop: 30,
        }}
      >
      </span>
    }
    {(isTokenValid === false) && <>
      <div
        className={"status_container"}
        style={{
          marginTop: 30,
          backgroundColor: "var(--main-color-palette_negative__light)"
        }}
      >
        <img
          className={styles.error}
          src={"/images/error.svg"}
          alt="Ошибка"
        />
      </div>
      <div className={styles.info_container}>
        <p className={styles.info_container__header}>
          Ошибка.
        </p>
        <p className={styles.info_container__text}>
          {error}
        </p>
      </div>
      <a
        className={styles.back_to_auth__link}
        onClick={(e) => navigator("/login")}
        style={{marginTop: 10}}
      >
        Вернуться к авторизации
      </a>
    </>}
    {(isTokenValid === true) && <>
      <div
        className={"status_container"}
        style={{
          marginTop: 30,
        }}
      >
        <img
          className={styles.checkbox}
          src={"/images/checkmark.svg"}
          alt="Успешно"
        />
      </div>
      <div className={styles.info_container}>
        <p className={styles.info_container__header}>
          Успешно.
        </p>
        <p className={styles.info_container__text}>
          Ваш аккаунт был успешно зарегистрирован.
        </p>
      </div>
      <a
        className={styles.back_to_auth__link}
        onClick={(e) => navigator("/login")}
        style={{marginTop: 10}}
      >
        Вернуться к авторизации
      </a>
    </>}
  </div>)
}

export default RegisterConfirm;