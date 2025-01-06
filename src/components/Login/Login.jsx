import styles from "./Login.module.css"
import DefaultInput from "../DefaultInput/DefaultInput.jsx";
import {useCallback, useContext, useEffect, useState} from "react";
import DefaultCheckbox from "../DefaultCheckbox/DefaultCheckbox.jsx";
import {data, useNavigate, useOutletContext} from "react-router-dom";
import normalizeError from "../../helpers/normalizeError.js";
import postLogin from "../../api/auth/postLogin.js";
import {DataContext} from "../../context/dataContext.jsx";
import testStringEmail from "../../utils/testStringEmail.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigator = useNavigate();

  const context = useOutletContext();

  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const dataContext = useContext(DataContext);

  useEffect(() => {
    if (dataContext.data?.auth?.access_token || dataContext.data?.auth?.refresh_token) {
      navigator("/")
    }
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
    setPassword(value)
    if (value === "") {
      setPasswordError(null);
    } else {
      setPasswordError(false);
    }
  }

  const onFormClick = (e) => {
    e.preventDefault();

    if (!email || !password) {
      if (email === "") {
        setEmailError(true);
      }

      if (password === "") {
        setPasswordError(true);
      }

      return;
    }

    if (emailError === true || passwordError === true) {
      return;
    }

    context.setVisible(true);
  }

  useEffect(() => {
    async function onFormSubmit() {
      if (context.token === null) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const fetchedData = await postLogin({
          email: email,
          password: password
        }, context.token);
        if (rememberMe) {
          localStorage.setItem("is_remember", rememberMe)
          localStorage.setItem("access_token", fetchedData.access_token)
          localStorage.setItem("refresh_token", fetchedData.refresh_token)
        }
        dataContext.setData({
          ...dataContext.data,
          auth: {
            access_token: fetchedData.access_token,
            refresh_token: fetchedData.refresh_token,
          }
        })
        navigator('/')
      } catch (e) {
        let norm_e = normalizeError(e)
        if (norm_e.status === 403) {
          if (norm_e.response.data.message === "The captcha token is incorrect.") {
            setError("Ошибка прохождения капчи")
          } else if (norm_e.response.data.message === "The authorization data is incorrect.") {
            setError("Неверный логин или пароль")
          }
        } else {
          setError("Ошибка со стороны сервера")
        }
      }
      context.setResetCaptcha((prev) => prev + 1)
      setIsLoading(false);
    }

    onFormSubmit();
  }, [context.token]);

  return (<form className={styles.form_container}>
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
    <DefaultInput
      label={"Пароль"}
      placeholder={"*****************"}
      type={"password"}
      onChange={onPasswordChange}
      isRequired={true}
      styles={{marginTop: 20}}
      inputId={"default_input_login_password"}
      inputStyles={(passwordError === false) ?
        {border: "solid 2px var(--main-color-palette_accent__light)"}
        :
        (passwordError === true ?
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
        display: (passwordError === null) ? "none" : "flex",
        marginTop: 20,
      }}
      label={"Должно содержать пароль"}
      color={
        (passwordError === false) ?
          "var(--main-color-palette_accent)"
          :
          "var(--main-color-palette_negative__light)"
      }
      checked={
        (passwordError === false)
      }
      inputId={"default_checkbox_login_password_error"}
    />
    <div className={styles.add_block}>
      <DefaultCheckbox
        label={"Запомнить Меня"}
        inputId={"default_checkbox_login_remember_me"}
        onChange={setRememberMe}
      />
      <a onClick={(e) => navigator('/forgot_password')} className={styles.add_block_forgot_password}>
        Забыли пароль?
      </a>
    </div>
    <div
      className={styles.submit_button}
      onClick={onFormClick}
    >
      {isLoading && <span className={"loader"}></span>}
      <p>Войти</p>
    </div>
    {error !== null &&
      <p
        className={styles.error_text}
      >
        {error}
      </p>
    }
    <div
      className={styles.add_text_block}
    >
      <p>
        Ещё не зарегистрированы?
      </p>
      <a
        onClick={(e) => navigator("/register")}
      >
        Создайте аккаунт
      </a>
    </div>
  </form>)
}

export default Login;