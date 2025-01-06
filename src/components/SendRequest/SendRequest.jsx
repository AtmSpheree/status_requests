import styles from "./SendRequest.module.css"
import {useCallback, useContext, useEffect, useState} from "react";
import {DataContext} from "../../context/dataContext.jsx";
import {data, useNavigate} from "react-router-dom";
import DefaultInput from "../DefaultInput/DefaultInput.jsx";
import DefaultCheckbox from "../DefaultCheckbox/DefaultCheckbox.jsx";
import DefaultSelect from "../DefaultSelect/DefaultSelect.jsx";
import DefaultTextarea from "../DefaultTextarea/DefaultTextarea.jsx";
import {InvisibleSmartCaptcha} from "@yandex/smart-captcha";
import normalizeError from "../../helpers/normalizeError.js";
import postRequests from "../../api/postRequests.js";
import useRefresh from "../../hooks/useRefresh.jsx";

const SendRequest = () => {
  const dataContext = useContext(DataContext);
  const navigator = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [deviceType, setDeviceType] = useState("");
  const [breakdown, setBreakdown] = useState("");
  const [description, setDescription] = useState("");
  const [repairMethod, setRepairMethod] = useState("");
  const [error, setError] = useState(null);
  const [deviceTypeError, setDeviceTypeError] = useState(null);
  const [breakdownError, setBreakdownError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);
  const [repairMethodError, setRepairMethodError] = useState(null);

  const [captchaError, setCaptchaError] = useState(null);
  const [resetCaptcha, setResetCaptcha] = useState(0);
  const [token, setToken] = useState(null);
  const [visible, setVisible] = useState(false);
  const handleChallengeHidden = useCallback(() => {
    setVisible(false);
  }, []);
  const refreshHook = useRefresh({context: dataContext});

  useEffect(() => {
    if (refreshHook.isError) {
      navigator("/login")
    }
  }, [refreshHook.isError]);

  const onDeviceTypeChange = (value) => {
    setDeviceType(value)
    setDeviceTypeError(false)
  }

  const onBreakdownChange = (value) => {
    setBreakdown(value);
    setBreakdownError(null);
  }

  const onDescriptionChange = (value) => {
    setDescription(value);
    setDescriptionError(null);
  }

  const onRepairMethodChange = (value) => {
    setRepairMethod(value);
    setRepairMethodError(null);
  }

  useEffect(() => {
    const onSendRequest = async () => {
      if (token === null) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const fetchedData = await postRequests({
          device_type: deviceType,
          breakdown: breakdown,
          description: description,
          repair_method: repairMethod
        }, token, dataContext.data?.auth.access_token);
        dataContext.setData({
          ...dataContext.data,
          requests: [
            ...dataContext.data?.requests,
            fetchedData.request,
          ]
        })
        setIsLoading(false);
        setIsSuccess(true);
      } catch (e) {
        let norm_e = normalizeError(e)
        if (norm_e.status === 403) {
          if (norm_e.response.data.message === "Forbidden") {
            refreshHook.refresh()
          } else {
            setError("Ошибка прохождения капчи")
            setIsLoading(false);
          }
        } else {
          setError("Ошибка со стороны сервера")
          setIsLoading(false);
        }
      }

      setResetCaptcha((prev) => prev + 1)
    }

    onSendRequest();
  }, [token, dataContext.data?.auth.access_token])

  const onFormClick = (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (!deviceType || !breakdown || !description || !repairMethod) {
      if (deviceType === "") {
        setDeviceTypeError(true);
      }

      if (breakdown === "") {
        setBreakdownError(true);
      }

      if (description === "") {
        setDescriptionError(true);
      }

      if (repairMethod === "") {
        setRepairMethodError(true);
      }

      return;
    }

    if (deviceTypeError === true || breakdownError === true || descriptionError === true || repairMethodError === true) {
      return;
    }

    setVisible(true);
  }

  useEffect(() => {
    if (dataContext.data?.profile.is_admin === 1) {
      navigator("/")
    }
  }, []);

  return (<>
    {isSuccess ?
      <div className={styles.success_container}>
        <div className={"status_container"}>
          <img className={styles.checkmark} src={"/images/checkmark.svg"} alt="Успешно"/>
        </div>
        <div className={styles.info_container}>
          <p className={styles.info_container__header}>
            Заказ оформлен
          </p>
          <p className={styles.info_container__text}>
            Наш мастер свяжется с вами в течении нескольких минут для уточнения всех деталей.<br/>
            В дальнейшем вы можете ослеживать статус заказа в профиле.
          </p>
        </div>
        <p className={styles.thanks_text}>
          Благодарим за заказ!
        </p>
        <a
          className={styles.back_to_home_link}
          onClick={(e) => navigator("/")}
          style={{marginTop: 10}}
        >
          Вернуться на главную
        </a>
      </div>
      :
      <>
        {dataContext.data?.profile.is_admin === 1 ?
          <div></div>
          :
          <form className={styles.form_container}>
            <DefaultSelect
              isRequired={true}
              label={"Выберите тип устройства"}
              innerLabel={"..."}
              options={[
                "Телефон",
                "Компьютер",
                "Ноутбук",
                "Принтер",
                "Сканер",
                "МФУ",
                "Шрэдэр",
                "Ламинатор",
                "Компьютерная переферия",
                "Монитор"
              ]}
              selectStyles={(deviceTypeError === false) ?
                {border: "solid 2px var(--main-color-palette_accent__light)"}
                :
                (deviceTypeError === true ?
                    {border: "solid 2px var(--main-color-palette_negative__light)"}
                    :
                    {}
                )
              }
              selectId={"default_select_send_request_device_type"}
              onChange={onDeviceTypeChange}
            />
            <DefaultCheckbox
              isUserCheckable={false}
              styles={{
                width: "100%",
                display: (deviceTypeError !== true) ? "none" : "flex",
                marginTop: 20,
              }}
              label={"Должно содержать тип устройства"}
              color={
                (deviceTypeError === false) ?
                  "var(--main-color-palette_accent)"
                  :
                  "var(--main-color-palette_negative__light)"
              }
              checked={
                (deviceTypeError === false)
              }
              inputId={"default_select_send_request_device_type_error"}
            />
            <DefaultInput
              label={"Напишите предполагаемую поломку"}
              placeholder={"Замена картриджа..."}
              type={"text"}
              onChange={onBreakdownChange}
              isRequired={true}
              styles={{marginTop: 20}}
              maxLength={50}
              inputId={"default_input_send_request_breakdown"}
              inputStyles={(breakdownError === false) ?
                {border: "solid 2px var(--main-color-palette_accent__light)"}
                :
                (breakdownError === true ?
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
                display: (breakdownError !== true) ? "none" : "flex",
                marginTop: 20,
              }}
              label={"Должно содержать причину поломки"}
              color={
                (breakdownError === false) ?
                  "var(--main-color-palette_accent)"
                  :
                  "var(--main-color-palette_negative__light)"
              }
              checked={
                (breakdownError === false)
              }
              inputId={"default_checkbox_send_request_breakdown_error"}
            />
            <DefaultTextarea
              textareaId={"default_textarea_send_request_description"}
              isRequired={true}
              label={"Опишите поломку"}
              styles={{marginTop: 20}}
              textareaStyles={(descriptionError === false) ?
                {border: "solid 2px var(--main-color-palette_accent__light)", height: 200}
                :
                (descriptionError === true ?
                    {border: "solid 2px var(--main-color-palette_negative__light)", height: 200}
                    :
                    {height: 200}
                )
              }
              maxLength={500}
              onChange={onDescriptionChange}
            />
            <DefaultCheckbox
              isUserCheckable={false}
              styles={{
                width: "100%",
                display: (descriptionError !== true) ? "none" : "flex",
                marginTop: 20,
              }}
              label={"Должно содержать описание"}
              color={
                (descriptionError === false) ?
                  "var(--main-color-palette_accent)"
                  :
                  "var(--main-color-palette_negative__light)"
              }
              checked={
                (descriptionError === false)
              }
              inputId={"default_checkbox_send_request_description_error"}
            />
            <DefaultSelect
              isRequired={true}
              label={"Выберите удобный способ ремонта"}
              innerLabel={"..."}
              styles={{marginTop: 20}}
              options={[
                "В сервисе",
                "Мастер на дом",
              ]}
              selectStyles={(repairMethodError === false) ?
                {border: "solid 2px var(--main-color-palette_accent__light)"}
                :
                (repairMethodError === true ?
                    {border: "solid 2px var(--main-color-palette_negative__light)"}
                    :
                    {}
                )
              }
              selectId={"default_select_send_request_device_type"}
              onChange={onRepairMethodChange}
            />
            <DefaultCheckbox
              isUserCheckable={false}
              styles={{
                width: "100%",
                display: (repairMethodError !== true) ? "none" : "flex",
                marginTop: 20,
              }}
              label={"Должно содержать способ ремонта"}
              color={
                (repairMethodError === false) ?
                  "var(--main-color-palette_accent)"
                  :
                  "var(--main-color-palette_negative__light)"
              }
              checked={
                (repairMethodError === false)
              }
              inputId={"default_select_send_request_device_type_error"}
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
              onClick={onFormClick}
            >
              {isLoading && <span className={"loader"}></span>}
              <p>Оформить</p>
            </div>
            {error !== null &&
              <p
                className={styles.error_text}
              >
                {error}
              </p>
            }
          </form>
        }
      </>
    }
  </>)
}

export default SendRequest;