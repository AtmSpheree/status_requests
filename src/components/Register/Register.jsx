import styles from "./Register.module.css"
import DefaultInput from "../DefaultInput/DefaultInput.jsx";
import {useCallback, useContext, useEffect, useState} from "react";
import testStringUsername from "../../utils/testStringUsername.js";
import DefaultCheckbox from "../DefaultCheckbox/DefaultCheckbox.jsx";
import testStringPhoneNumber from "../../utils/testStringPhoneNumber.js";
import isNumeric from "../../utils/isNumeric.js";
import {useNavigate, useOutletContext} from "react-router-dom";
import testStringEmail from "../../utils/testStringEmail.js";
import {DataContext} from "../../context/dataContext.jsx";
import normalizeError from "../../helpers/normalizeError.js";
import postRegister from "../../api/auth/postRegister.js";
import {InvisibleSmartCaptcha} from "@yandex/smart-captcha";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [usernameError, setUsernameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [emailErrorText, setEmailErrorText] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState(null);

  const [passwordError, setPasswordError] = useState(null);

  const [passwordLengthError, setPasswordLengthError] = useState(null);
  const [passwordUppercaseError, setPasswordUppercaseError] = useState(null);
  const [passwordLowercaseError, setPasswordLowercaseError] = useState(null);
  const [passwordDigitError, setPasswordDigitError] = useState(null);
  const [passwordSpecialError, setPasswordSpecialError] = useState(null);

  const [repeatPasswordError, setRepeatPasswordError] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigator = useNavigate();
  const context = useOutletContext();
  const dataContext = useContext(DataContext);

  useEffect(() => {
    if (dataContext.data?.auth?.access_token || dataContext.data?.auth?.refresh_token) {
      navigator("/")
    }
  }, []);

  useEffect(() => {
    async function onFormSubmit() {
      if (context.token === null) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const fetchedData = await postRegister({
          email: email,
          password: password,
          username: username,
          phone_number: phoneNumber
        }, context.token);
        navigator(
          '/register_success',
          {state: {
              email: email,
              password: password,
              username: username,
              phone_number: phoneNumber
            }
          }
        )
      } catch (e) {
        let norm_e = normalizeError(e)
        if (norm_e.status === 403) {
          if (norm_e.response.data.message === "The captcha token is incorrect.") {
            setError("Ошибка прохождения капчи")
          } else if (norm_e.response.data.message === "A user with such an email already exists.") {
            setError("Аккаунт с такой почтой уже зарегистрирован")
            setEmailErrorText("Укажите другую электронную почту")
            setEmailError(true)
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

  const onFormClick = (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (username === "") {
      setUsernameError(true);
    }
    if (email === "") {
      setEmailErrorText("Должно содержать электронную почту")
      setEmailError(true);
    }
    if (phoneNumber === "") {
      setPhoneNumberError(true);
    }
    if (password === "") {
      setPasswordError(true);
    }
    if (repeatPassword === "") {
      setRepeatPasswordError(true);
    }

    if (passwordError || passwordLengthError || passwordUppercaseError || passwordLowercaseError ||
      passwordDigitError || passwordSpecialError || repeatPasswordError || usernameError ||
      emailError || phoneNumberError) {
      return;
    }

    if (password === "" || repeatPassword === "" || email === "" || phoneNumber === "" || username === "") {
      return;
    }

    context.setVisible(true);
  }

  const onUsernameChange = (value) => {
    setUsername(value)
    if (value === "") {
      setUsernameError(null);
    } else if (!testStringUsername(value)) {
      setUsernameError(true);
    } else {
      setUsernameError(false);
    }
  }

  const onEmailChange = (value) => {
    setEmail(value)
    if (value === "") {
      setEmailErrorText("")
      setEmailError(null);
    } else if (!testStringEmail(value)) {
      setEmailErrorText("Должно содержать электронную почту")
      setEmailError(true);
    } else {
      setEmailErrorText("Должно содержать электронную почту")
      setEmailError(false);
    }
  }

  const onPhoneNumberChange = (value) => {
    if (testStringPhoneNumber(value)) {
      if (value === "") {
        setPhoneNumberError(null);
      } else if (value.length !== 11) {
        setPhoneNumberError(true)
      } else {
        setPhoneNumberError(false)
      }
      setPhoneNumber(value)
    } else {
      return true;
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

  return (<form className={styles.form_container}>
    <DefaultInput
      label={"ФИО"}
      placeholder={"Введите ваше ФИО"}
      type={"text"}
      onChange={onUsernameChange}
      isRequired={true}
      inputId={"default_input_register_username"}
      inputStyles={(usernameError === false) ?
        {border: "solid 2px var(--main-color-palette_accent__light)"}
        :
        (usernameError === true ?
            {border: "solid 2px var(--main-color-palette_negative__light)"}
            :
            {}
        )
      }
      maxLength={40}
    />
    <DefaultCheckbox
      isUserCheckable={false}
      styles={{
        width: "100%",
        display: (usernameError === null) ? "none" : "flex"
      }}
      label={"Должно содержать ФИО"}
      color={
        (usernameError === false) ?
          "var(--main-color-palette_accent)"
          :
          "var(--main-color-palette_negative__light)"
      }
      checked={
        (usernameError === false)
      }
      inputId={"default_checkbox_register_username_error"}
    />
    <DefaultInput
      label={"Введите вашу почту"}
      placeholder={"Введите вашу почту"}
      type={"email"}
      onChange={onEmailChange}
      isRequired={true}
      inputId={"default_input_register_email"}
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
        display: (emailError === null) ? "none" : "flex"
      }}
      label={emailErrorText}
      color={
        (emailError === false) ?
          "var(--main-color-palette_accent)"
          :
          "var(--main-color-palette_negative__light)"
      }
      checked={
        (emailError === false)
      }
      inputId={"default_checkbox_register_email_error"}
    />
    <DefaultInput
      label={"Номер телефона"}
      placeholder={"8 (***) ***-**-**"}
      type={"phone"}
      onChange={onPhoneNumberChange}
      isRequired={true}
      maxLength={11}
      inputId={"default_input_register_phone_number"}
      inputStyles={(phoneNumberError === false) ?
        {border: "solid 2px var(--main-color-palette_accent__light)"}
        :
        (phoneNumberError === true ?
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
        display: (phoneNumberError === null) ? "none" : "flex"
      }}
      label={"Должно содержать номер телефона"}
      color={
        (phoneNumberError === false) ?
          "var(--main-color-palette_accent)"
          :
          "var(--main-color-palette_negative__light)"
      }
      checked={
        phoneNumberError === false
      }
      inputId={"default_checkbox_register_phone_number_error"}
    />
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
      inputId={"default_checkbox_register_repeat_password_error"}
    />
    <div
      className={styles.submit_button}
      onClick={(e) => onFormClick(e)}
    >
      {isLoading && <span className={"loader"}></span>}
      <p>Зарегистрироваться</p>
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
        Уже есть аккаунт?
      </p>
      <a
        onClick={(e) => navigator("/login")}
      >
        Авторизуйтесь
      </a>
    </div>
  </form>)
}

export default Register;