import styles from './ForgotPassword.module.css'
import {useCallback, useEffect, useState} from "react";
import DefaultInput from "../DefaultInput/DefaultInput.jsx";
import DefaultCheckbox from "../DefaultCheckbox/DefaultCheckbox.jsx";
import testStringEmail from "../../utils/testStringEmail.js";
import normalizeError from "../../helpers/normalizeError.js";
import postResetPassword from "../../api/auth/postResetPassword.js";
import useTimer from "../../hooks/useTimer.jsx";
import {useNavigate, useParams} from "react-router-dom";
import getResetPassword from "../../api/auth/getResetPassword.js";
import isNumeric from "../../utils/isNumeric.js";
import postResetPasswordNew from "../../api/auth/postResetPasswordNew.js";
import {InvisibleSmartCaptcha} from "@yandex/smart-captcha";

const ForgotPassword = () => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(params.token ? (
    params.token.startsWith("gAAAAA")
  ) : false);
  const [stage, setStage] = useState(params.token ? (
    params.token.startsWith("gAAAAA") ? 0 : 4
  ) : 1);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(params.token ? (
    params.token.startsWith("gAAAAA") ? null : "Ссылка недействительна."
  ) : null);
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [passwordError, setPasswordError] = useState(null);

  const [passwordLengthError, setPasswordLengthError] = useState(null);
  const [passwordUppercaseError, setPasswordUppercaseError] = useState(null);
  const [passwordLowercaseError, setPasswordLowercaseError] = useState(null);
  const [passwordDigitError, setPasswordDigitError] = useState(null);
  const [passwordSpecialError, setPasswordSpecialError] = useState(null);

  const [repeatPasswordError, setRepeatPasswordError] = useState(null);

  const [captchaError, setCaptchaError] = useState(null);
  const [resetCaptcha, setResetCaptcha] = useState(0);
  const [token, setToken] = useState(null);
  const [visible, setVisible] = useState(false);
  const handleChallengeHidden = useCallback(() => {
    setVisible(false);
  }, []);

  const timer = useTimer({seconds: 120});

  const navigator = useNavigate();

  useEffect(() => {
    async function sendRequest() {
      if (stage === 0) {
        setIsLoading(true);
        try {
          let fetchedData = await getResetPassword(params.token)
          setStage(3)
        } catch (e) {
          let norm_e = normalizeError(e)
          setStage(4)
          if (norm_e.status === 403) {
            setError("Ссылка недействительна.")
          } else if (norm_e.status === 404) {
            setError("Пользователь с такой почтой не найден.")
          } else if (norm_e.status === 408) {
            setError("Срок действия ссылки истёк, запросите новую.")
          } else {
            setError("Ошибка со стороны сервера")
          }
        }
        setIsLoading(false);
      }
    }

    sendRequest();
  }, []);

  const onEmailChange = (value) => {
    setEmail(value)
    if (value === "") {
      setEmailError(null);
    } else if (!testStringEmail(value)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  }

  const onPasswordChange = (value) => {
    setPassword(value);
    if (repeatPassword !== value) {
      setRepeatPasswordError(true);
    } else {
      setRepeatPasswordError(false);
    }

    if (value === "") {
      setPasswordLengthError(null);
      setPasswordUppercaseError(null);
      setPasswordLowercaseError(null);
      setPasswordDigitError(null);
      setPasswordSpecialError(null);
      setRepeatPasswordError(null);
      return;
    } else {
      setPasswordError(null);
    }

    if (value.length < 8) {
      setPasswordLengthError(true);
    } else {
      setPasswordLengthError(false);
    }
    if (!value.split("").some((e) => (e === e.toUpperCase() && e.toLowerCase() !== e.toUpperCase()))) {
      setPasswordUppercaseError(true);
    } else {
      setPasswordUppercaseError(false);
    }
    if (!value.split("").some((e) => (e === e.toLowerCase() && e.toLowerCase() !== e.toUpperCase()))) {
      setPasswordLowercaseError(true);
    } else {
      setPasswordLowercaseError(false);
    }
    if (!value.split("").some((e) => isNumeric(e))) {
      setPasswordDigitError(true);
    } else {
      setPasswordDigitError(false);
    }
    if (!value.split("").some((e) => '#?!@$%^&*-'.includes(e))) {
      setPasswordSpecialError(true);
    } else {
      setPasswordSpecialError(false);
    }
  }

  const onRepeatPasswordChange = (value) => {
    setRepeatPassword(value);
    if (password !== value) {
      setRepeatPasswordError(true);
    } else {
      setRepeatPasswordError(false);
    }
    if (value === "") {
      setRepeatPasswordError(null);
    }
  }

  const onFormSendEmailClick = (e) => {
    e.preventDefault();

    if (email === "" || emailError === true) {
      return;
    }

    setVisible(true);
  }

  useEffect(() => {
    const onFormSendEmailSubmit = async () => {
      if (token === null) {
        return;
      }

      setIsLoading(true);
      try {
        const fetchedData = await postResetPassword(token, {email: email});
        setStage(2)
        timer.reloadTimer();
        setError(null);
      } catch (e) {
        let norm_e = normalizeError(e)
        if (norm_e.status === 403) {
          setError("Пользователя с такой почтой не существует")
        } else {
          setError("Ошибка со стороны сервера")
        }
      }
      setResetCaptcha((prev) => prev + 1)
      setIsLoading(false);
    }

    onFormSendEmailSubmit();
  }, [token]);

  const onFormSendPasswordSubmit = async (e) => {
    e.preventDefault();
    if (password === "") {
      setPasswordError(true);
    }
    if (repeatPassword === "") {
      setRepeatPasswordError(true);
    }

    if (passwordError || repeatPasswordError) {
      return;
    }

    if (password === "" || repeatPassword === "") {
      return;
    }

    setIsLoading(true);
    try {
      const fetchedData = await postResetPasswordNew(params.token, {password: password});
      setStage(5)
      setError(null);
    } catch (e) {
      let norm_e = normalizeError(e)
      if (norm_e.status === 403) {
        if (norm_e.response.data.message === "The passwords match.") {
          setError("Новый пароль совпадает с предыдущим.")
        } else if (norm_e.response.data.message === "The link is invalid.") {
          setError("Ссылка недействительна.")
          setStage(4)
        }
      } else if (norm_e.status === 404) {
        setError("Пользователь с такой почтой не найден.")
        setStage(4)
      } else if (norm_e.status === 408) {
        setError("Срок действия ссылки истёк, запросите новую.")
        setStage(4)
      } else {
        setError("Ошибка со стороны сервера")
      }
    }
    setIsLoading(false);
  }

  return (<div className="wrapper" style={{height: "100vh"}}>
    <div className={styles.logo_container}>
      <a onClick={(e) => navigator("/")}>
        <img className="logo" src="/images/logo_main.svg" alt="СТАТУС"/>
      </a>
    </div>
    {stage !== 0 &&
      <div
        className={"status_container"}
        style={stage === 4 ?
            {
              marginTop: 30,
              backgroundColor: "var(--main-color-palette_negative__light)"
            }
          :
            {
              marginTop: 30,
            }
        }
      >
        {(stage === 1 || stage === 3) &&
          <img
            className={styles.password_key}
            src={"/images/password_key.svg"}
            alt="Ключ"
          />
        }
        {stage === 2 &&
          <img
            className={styles.email}
            src={"/images/email.svg"}
            alt="Почта"
          />
        }
        {stage === 4 &&
          <img
            className={styles.error_status}
            src={"/images/error.svg"}
            alt="Ошибка"
          />
        }
        {stage === 5 &&
          <img
            className={styles.success}
            src={"/images/success.svg"}
            alt="Успех"
          />
        }
      </div>
    }
    <div className={styles.info_container}>
      <p className={styles.info_container__header}>
        {stage === 1 && "Забыли пароль?"}
        {stage === 2 && "Проверьте почту"}
        {stage === 3 && "Новый пароль"}
        {stage === 4 && "Ошибка"}
        {stage === 5 && "Пароль изменён"}
      </p>
      <p className={styles.info_container__text}>
        {stage === 1 && "Не беспокойтесь. Мы отправим на почту инструкцию."}
        {stage === 2 && "Мы отправили ссылку-подтверждение сброса пароля вам на почту."}
        {stage === 3 && "Ваш пароль должен отличаться от предыдущего."}
        {stage === 4 && error}
        {stage === 5 && "Ваш пароль был обновлён."}
      </p>
    </div>
    {(stage === 4 || stage === 5) &&
      <a
        className={styles.add_text_container__link}
        onClick={(e) => navigator("/login")}
        style={{marginTop: 10}}
      >
        Вернуться к авторизации
      </a>
    }
    {stage === 0 &&
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
    {stage === 1 &&
      <form className={styles.form_container}>
        <DefaultInput
          label={"Почта"}
          placeholder={"email@email.ru"}
          type={"email"}
          onChange={onEmailChange}
          isRequired={true}
          inputId={"default_input_login_email"}
          inputStyles={(emailError === false) ?
            {border: "solid 2px var(--main-color-palette_accent__light)"}
            :
            (emailError === true ?
                {border: "solid 2px var(--main-color-palette_negative__light)"}
                :
                {}
            )
          }
        />
        <DefaultCheckbox
          isUserCheckable={false}
          styles={{
            width: "100%",
            display: (emailError === null) ? "none" : "flex",
            marginTop: 20,
          }}
          label={"Должно содержать электронную почту"}
          color={
            (emailError === false) ?
              "var(--main-color-palette_accent)"
              :
              "var(--main-color-palette_negative__light)"
          }
          checked={
            (emailError === false)
          }
          inputId={"default_checkbox_login_email_error"}
        />
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
        <div
          className={styles.submit_button}
          onClick={onFormSendEmailClick}
        >
          {isLoading && <span className={"loader"}></span>}
          <p>Восстановить пароль</p>
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
      </form>
    }
      {stage === 2 &&
        <div className={styles.upper_container}>
          <div className={styles.add_text_container}>
            <p className={styles.add_text_container__text}>
              Не получили ссылку?
            </p>
            <div className={styles.add_text_container_timer}>
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
              <a className={`noselect ${styles.add_text_container__link}`}
                 style={{
                   pointerEvents: timer.remains !== 0 && "none",
                   color: timer.remains !== 0 && "var(--main-color-palette_grey__light)",
                   cursor: timer.remains !== 0 && "auto"
                 }}
                 onClick={onFormSendEmailClick}
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
      </div>
    }
    {stage === 3 &&
      <form
        className={styles.form_container}
        onSubmit={onFormSendPasswordSubmit}
      >
        <DefaultInput
          label={"Пароль"}
          placeholder={"*****************"}
          type={"password"}
          onChange={onPasswordChange}
          isRequired={true}
          inputId={"default_input_register_password"}
          inputStyles={(passwordLengthError === false &&
            passwordUppercaseError === false &&
            passwordLowercaseError === false &&
            passwordSpecialError === false &&
            passwordDigitError === false && passwordError === false) ?
            {border: "solid 2px var(--main-color-palette_accent__light)"}
            :
            (passwordLengthError === true ||
              passwordUppercaseError === true ||
              passwordLowercaseError === true ||
              passwordSpecialError === true ||
              passwordDigitError === true || passwordError === true ?
                {border: "solid 2px var(--main-color-palette_negative__light)"}
                :
                {}
            )
          }
        />
        <DefaultCheckbox
          isUserCheckable={false}
          styles={{
            width: "100%",
            display: (passwordError === null) ? "none" : "flex"
          }}
          label={"Введите пароль"}
          color={
            (passwordError === true) &&
            "var(--main-color-palette_negative__light)"
          }
          checked={false}
          inputId={"default_checkbox_register_password_error"}
        />
        <DefaultCheckbox
          isUserCheckable={false}
          styles={{
            width: "100%",
            display: (passwordLengthError === null) ? "none" : "flex"
          }}
          label={"Пароль должен состоять хотя бы из 8 символов"}
          color={
            (passwordLengthError === false) ?
              "var(--main-color-palette_accent)"
              :
              "var(--main-color-palette_negative__light)"
          }
          checked={
            (passwordLengthError === false)
          }
          inputId={"default_checkbox_register_password_length_error"}
        />
        <DefaultCheckbox
          isUserCheckable={false}
          styles={{
            width: "100%",
            display: (passwordUppercaseError === null) ? "none" : "flex"
          }}
          label={"Пароль должен содержать хотя бы 1 заглавную букву"}
          color={
            (passwordUppercaseError === false) ?
              "var(--main-color-palette_accent)"
              :
              "var(--main-color-palette_negative__light)"
          }
          checked={
            (passwordUppercaseError === false)
          }
          inputId={"default_checkbox_register_password_uppercase_error"}
        />
        <DefaultCheckbox
          isUserCheckable={false}
          styles={{
            width: "100%",
            display: (passwordLowercaseError === null) ? "none" : "flex"
          }}
          label={"Пароль должен содержать хотя бы 1 строчную букву"}
          color={
            (passwordLowercaseError === false) ?
              "var(--main-color-palette_accent)"
              :
              "var(--main-color-palette_negative__light)"
          }
          checked={
            (passwordLowercaseError === false)
          }
          inputId={"default_checkbox_register_password_lowercase_error"}
        />
        <DefaultCheckbox
          isUserCheckable={false}
          styles={{
            width: "100%",
            display: (passwordDigitError === null) ? "none" : "flex"
          }}
          label={"Пароль должен содержать хотя бы 1 цифру"}
          color={
            (passwordDigitError === false) ?
              "var(--main-color-palette_accent)"
              :
              "var(--main-color-palette_negative__light)"
          }
          checked={
            (passwordDigitError === false)
          }
          inputId={"default_checkbox_register_password_digit_error"}
        />
        <DefaultCheckbox
          isUserCheckable={false}
          styles={{
            width: "100%",
            display: (passwordSpecialError === null) ? "none" : "flex"
          }}
          label={"Пароль должен содержать хотя бы один специальный символ - #?!@$%^&*-"}
          color={
            (passwordSpecialError === false) ?
              "var(--main-color-palette_accent)"
              :
              "var(--main-color-palette_negative__light)"
          }
          checked={
            (passwordSpecialError === false)
          }
          inputId={"default_checkbox_register_password_special_error"}
        />
        <DefaultInput
          label={"Повтор пароля"}
          placeholder={"*****************"}
          type={"password"}
          onChange={onRepeatPasswordChange}
          isRequired={true}
          maxLength={100}
          inputId={"default_input_register_repeat_password"}
          inputStyles={(repeatPasswordError === false) ?
            {border: "solid 2px var(--main-color-palette_accent__light)"}
            :
            (repeatPasswordError === true ?
                {border: "solid 2px var(--main-color-palette_negative__light)"}
                :
                {}
            )
          }
        />
        <DefaultCheckbox
          isUserCheckable={false}
          styles={{
            width: "100%",
            display: (repeatPasswordError === null) ? "none" : "flex"
          }}
          label={"Пароли должны совпадать"}
          color={
            (repeatPasswordError === false) ?
              "var(--main-color-palette_accent)"
              :
              "var(--main-color-palette_negative__light)"
          }
          checked={
            (repeatPasswordError === false)
          }
          inputId={"default_checkbox_register_username_error"}
        />
        <div
          className={styles.submit_button}
          onClick={onFormSendPasswordSubmit}
        >
          {isLoading && <span className={"loader"}></span>}
          <p>Изменить пароль</p>
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
      </form>
    }
    {stage === 1 &&
      <div className={styles.status_bar_container__wrapper}>
        <div className={styles.status_bar_container}>
          <div className={styles.status_bar__status_correct}>
            <img className={styles.status_bar__status_img} src={"/images/checkbox.svg"} alt="OK"/>
          </div>
          <div className={styles.status_bar__bar_correct}></div>
          <div className={styles.status_bar__status_default}></div>
          <div className={styles.status_bar__bar_default}></div>
          <div className={styles.status_bar__status_default}></div>
          <div className={styles.status_bar__bar_default}></div>
          <div className={styles.status_bar__status_default}></div>
        </div>
      </div>
    }
    {stage === 2 &&
      <div className={styles.status_bar_container__wrapper}>
        <div className={styles.status_bar_container}>
          <div className={styles.status_bar__status_correct}>
            <img className={styles.status_bar__status_img} src={"/images/checkbox.svg"} alt="OK"/>
          </div>
          <div className={styles.status_bar__bar_correct}></div>
          <div className={styles.status_bar__status_correct}>
            <img className={styles.status_bar__status_img} src={"/images/checkbox.svg"} alt="OK"/>
          </div>
          <div className={styles.status_bar__bar_correct}></div>
          <div className={styles.status_bar__status_default}></div>
          <div className={styles.status_bar__bar_default}></div>
          <div className={styles.status_bar__status_default}></div>
        </div>
      </div>
    }
    {stage === 3 &&
      <div className={styles.status_bar_container__wrapper}>
        <div className={styles.status_bar_container}>
          <div className={styles.status_bar__status_correct}>
            <img className={styles.status_bar__status_img} src={"/images/checkbox.svg"} alt="OK"/>
          </div>
          <div className={styles.status_bar__bar_correct}></div>
          <div className={styles.status_bar__status_correct}>
            <img className={styles.status_bar__status_img} src={"/images/checkbox.svg"} alt="OK"/>
          </div>
          <div className={styles.status_bar__bar_correct}></div>
          <div className={styles.status_bar__status_correct}>
            <img className={styles.status_bar__status_img} src={"/images/checkbox.svg"} alt="OK"/>
          </div>
          <div className={styles.status_bar__bar_default}></div>
          <div className={styles.status_bar__status_default}></div>
        </div>
      </div>
    }
    {stage === 4 &&
      <div className={styles.status_bar_container__wrapper}>
        <div className={styles.status_bar_container}>
          <div className={styles.status_bar__status_correct}>
            <img className={styles.status_bar__status_img} src={"/images/checkbox.svg"} alt="OK"/>
          </div>
          <div className={styles.status_bar__bar_correct}></div>
          <div className={styles.status_bar__status_correct}>
            <img className={styles.status_bar__status_img} src={"/images/checkbox.svg"} alt="OK"/>
          </div>
          <div className={styles.status_bar__bar_correct}></div>
          <div className={styles.status_bar__status_incorrect}>
            <img className={styles.status_bar__status_img} src={"/images/cross.svg"} alt="OK"/>
          </div>
          <div className={styles.status_bar__bar_default}></div>
          <div className={styles.status_bar__status_default}></div>
        </div>
      </div>
    }
    {stage === 5 &&
      <div className={styles.status_bar_container__wrapper}>
        <div className={styles.status_bar_container}>
          <div className={styles.status_bar__status_correct}>
          <img className={styles.status_bar__status_img} src={"/images/checkbox.svg"} alt="OK"/>
        </div>
        <div className={styles.status_bar__bar_correct}></div>
        <div className={styles.status_bar__status_correct}>
          <img className={styles.status_bar__status_img} src={"/images/checkbox.svg"} alt="OK"/>
        </div>
        <div className={styles.status_bar__bar_correct}></div>
        <div className={styles.status_bar__status_correct}>
          <img className={styles.status_bar__status_img} src={"/images/checkbox.svg"} alt="OK"/>
        </div>
        <div className={styles.status_bar__bar_correct}></div>
        <div className={styles.status_bar__status_correct}>
          <img className={styles.status_bar__status_img} src={"/images/checkbox.svg"} alt="OK"/>
        </div>
      </div>
    </div>
    }
    <span style={{minHeight: 40, opacity: 0}}>void</span>
    </div>
  )
}

export default ForgotPassword;