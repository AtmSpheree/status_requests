import styles from "./Request.module.css"
import {useContext, useEffect, useState} from "react";
import {DataContext} from "../../context/dataContext.jsx";
import {useNavigate, useParams} from "react-router-dom";
import useRefresh from "../../hooks/useRefresh.jsx";
import getRequests from "../../api/getRequests.js";
import normalizeError from "../../helpers/normalizeError.js";
import formatDate from "../../utils/formatDate.js";
import compareStatus from "../../utils/compareStatus.js";
import DefaultInput from "../DefaultInput/DefaultInput.jsx";
import putRequests from "../../api/putRequests.js";
import DefaultCheckbox from "../DefaultCheckbox/DefaultCheckbox.jsx";
import DefaultSelect from "../DefaultSelect/DefaultSelect.jsx";
import compareStatusReverse from "../../utils/compareStatusReverse.js";

const Request = () => {
  const dataContext = useContext(DataContext);
  const navigator = useNavigate();
  const params = useParams();
  const [isIdValid, setIsIdValid] = useState(params.id.length === 8 ? null : false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanRequests, setIsCanRequests] = useState(false);
  const refreshHook = useRefresh({context: dataContext});
  const [request, setRequest] = useState(null);

  const [isWarrantyPeriodChanging, setIsWarrantyPeriodChanging] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [isPriceChanging, setIsPriceChanging] = useState(false);
  const [warrantyPeriodError, setWarrantyPeriodError] = useState(false);
  const [statusError, setStatusError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [warrantyPeriod, setWarrantyPeriod] = useState("");
  const [status, setStatus] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isCanRefresh, setIsCanRefresh] = useState(null);

  const checkId = (id, requests) => {
    if (requests !== null) {
      return !!requests.some((item) => item.id === id);
    }
    return false;
  }

  const getRequestsRequest = async () => {
    try {
      const fetchedData = await getRequests(
        dataContext.data?.auth?.access_token
      );
      dataContext.setData({
        ...dataContext.data,
        requests: fetchedData.requests,
      })
      setTimeout(() => {
        setIsLoading(false); setIsIdValid(checkId(params.id, fetchedData.requests))
      }, 100);
    } catch (e) {
      let norm_e = normalizeError(e)
      if (norm_e.status === 403) {
        setIsCanRequests(true);
        refreshHook.refresh();
      }
    }
  }

  const onPriceChange = (value) => {
    if (value > 1000000) {
      setPriceError("Цена возможна до 1 миллиона");
      return
    } else if (value < 0) {
      setPriceError("Цена не может быть отрицательной")
      return
    }
    setPriceError(false);
    setPrice(value);
  }

  const onWarrantyPeriodChange = (value) => {
    setWarrantyPeriodError(false);
    setWarrantyPeriod(value);
  }

  const onStatusChange = (value) => {
    setStatusError(false);
    setStatus(value);
  }

  const onPriceChangeClick = () => {
    if (isFormLoading === true) {
      return;
    }

    if (price === request.price) {
      setPriceError("Должно содержать цену");
      return;
    }

    setPriceError(false)
    onPriceChangeSubmit();
  }

  const onWarrantyPeriodChangeClick = () => {
    if (isFormLoading === true) {
      return;
    }

    if (warrantyPeriod.length === 0 || warrantyPeriod === request.warranty_period) {
      setWarrantyPeriodError(true);
      return;
    }

    setWarrantyPeriodError(false)
    onWarrantyPeriodChangeSubmit();
  }

  const onStatusChangeClick = () => {
    if (isFormLoading === true) {
      return;
    }

    if (compareStatusReverse(status) === request.status) {
      setStatusError(true);
      return;
    }

    setStatusError(false)
    onStatusChangeSubmit();
  }

  const onPriceChangeSubmit = async () => {
    setIsFormLoading(true);
    setError(null);
    try {
      const fetchedData = await putRequests({
        warranty_period: request.warranty_period,
        status: request.status,
        price: price,
        email: request.email
      }, dataContext.data?.auth.access_token, request.id);
      setRequest({...request, price: price})
      dataContext.setData({
        ...dataContext.data,
        requests: dataContext.data?.requests.map((item) => (
          item.id === request.id ? {...request, price: price} : item
        ))
      })
      setIsPriceChanging(false);
      closeWindowWrapper();
      setIsCanRefresh(null);
      setIsFormLoading(false);
    } catch (e) {
      let norm_e = normalizeError(e)
      if (norm_e.status === 403) {
        setIsCanRefresh("price");
        refreshHook.refresh();
      } else {
        console.log(norm_e)
        setError("Ошибка со стороны сервера")
        setIsFormLoading(false);
      }
    }
  }

  const onWarrantyPeriodChangeSubmit = async () => {
    setIsFormLoading(true);
    setError(null);
    try {
      const fetchedData = await putRequests({
        warranty_period: warrantyPeriod,
        status: request.status,
        price: request.price,
        email: request.email
      }, dataContext.data?.auth.access_token, request.id);
      setRequest({...request, warranty_period: warrantyPeriod})
      dataContext.setData({
        ...dataContext.data,
        requests: dataContext.data?.requests.map((item) => (
          item.id === request.id ? {...request, warranty_period: warrantyPeriod} : item
        ))
      })
      setIsWarrantyPeriodChanging(false);
      closeWindowWrapper();
      setIsCanRefresh(null);
      setIsFormLoading(false);
    } catch (e) {
      let norm_e = normalizeError(e)
      if (norm_e.status === 403) {
        setIsCanRefresh("warranty_period");
        refreshHook.refresh();
      } else {
        console.log(norm_e)
        setError("Ошибка со стороны сервера")
        setIsFormLoading(false);
      }
    }
  }

  const onStatusChangeSubmit = async () => {
    setIsFormLoading(true);
    setError(null);
    try {
      const fetchedData = await putRequests({
        warranty_period: request.warranty_period,
        status: compareStatusReverse(status),
        price: request.price,
        email: request.email
      }, dataContext.data?.auth.access_token, request.id);
      setRequest({...request, status: compareStatusReverse(status)})
      dataContext.setData({
        ...dataContext.data,
        requests: dataContext.data?.requests.map((item) => (
          item.id === request.id ? {...request, status: compareStatusReverse(status)} : item
        ))
      })
      setIsStatusChanging(false);
      closeWindowWrapper();
      setIsCanRefresh(null);
      setIsFormLoading(false);
    } catch (e) {
      let norm_e = normalizeError(e)
      if (norm_e.status === 403) {
        setIsCanRefresh("status");
        refreshHook.refresh();
      } else {
        setError("Ошибка со стороны сервера")
        setIsFormLoading(false);
      }
    }
  }

  useEffect(() => {
    if (dataContext.data?.auth?.access_token !== null) {
      if (isCanRefresh === "warranty_period") {
        onWarrantyPeriodChangeSubmit();
      } else if (isCanRefresh === "status") {
        onStatusChangeSubmit();
      } else if (isCanRefresh === "price") {
        onPriceChangeSubmit();
      }
    }
  }, [dataContext.data?.auth?.access_token])

  useEffect(() => {
    if (isIdValid) {
      for (let i = 0; i < dataContext.data?.requests.length; i++) {
        if (dataContext.data?.requests[i].id === params.id) {
          setRequest(dataContext.data?.requests[i]);
          setWarrantyPeriod(dataContext.data?.requests[i].warranty_period);
          setStatus(compareStatus(dataContext.data?.requests[i].status).status);
          setPrice(dataContext.data?.requests[i].price);
          return;
        }
      }
    }
  }, [isIdValid]);

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

    if (dataContext.data?.requests === null) {
      getRequestsRequest();
    } else {
      setIsLoading(false);
      setIsIdValid(checkId(params.id, dataContext.data?.requests))
    }
  }, [])

  useEffect(() => {
    if (isLoading) {
      if (dataContext.data?.auth?.access_token !== null) {
        if (isCanRequests) {
          getRequestsRequest();
        }
      }
    }
  }, [dataContext.data?.auth?.access_token]);

  useEffect(() => {
    if (isWarrantyPeriodChanging === true || isStatusChanging === true || isPriceChanging === true) {
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.position = "fixed";
    }
  }, [isStatusChanging, isWarrantyPeriodChanging, isPriceChanging])

  const closeWindowWrapper = () => {
    let value = "0px";
    if (document.body.style.top !== "0px") {
      value = parseInt(document.body.style.top.slice(1, -2));
    }
    document.body.style.position = "static";
    document.body.style.top = `0`;
    if (value !== "0px") {
      window.scrollTo(0, value)
    }
  }

  return (<>
    {isLoading ?
      <div className="loader_wrapper" style={{height: "80vh"}}>
        <span className="loader"
              style={{width: 100, height: 100, border: "10px dotted var(--main-color-palette_accent)"}}></span>
      </div>
    :
      (isIdValid ?
          <div className={styles.content_container}>
            <div
              className={styles.admin_changing_wrapper__upper}
              style={{display: isPriceChanging ? "flex" : "none"}}
            >
              <div
                className={styles.admin_changing_wrapper}
              >
                <div className={styles.admin_changing_container}>
                  <button
                    className={styles.close_cross_button}
                    onClick={(e) => {
                      setIsPriceChanging(false);
                      setError(false);
                      setPrice(request.price);
                      closeWindowWrapper();
                    }}
                  >
                  <span className={styles.close_cross}>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="20"
                         height="20" className="g-icon" fill="currentColor" stroke="none" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
                        <path fill="currentColor" fillRule="evenodd"
                              d="M3.47 3.47a.75.75 0 0 1 1.06 0L8 6.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L9.06 8l3.47 3.47a.75.75 0 1 1-1.06 1.06L8 9.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L6.94 8 3.47 4.53a.75.75 0 0 1 0-1.06"
                              clipRule="evenodd"></path>
                      </svg>
                    </svg>
                  </span>
                  </button>
                  <DefaultInput
                    textareaId={"default_input_admin_request_warranty_period"}
                    isRequired={true}
                    label={"Введите гарантию"}
                    inputStyles={(priceError === false) ?
                      {border: "solid 2px var(--main-color-palette_accent__light)"}
                      :
                      (priceError !== null ?
                          {border: "solid 2px var(--main-color-palette_negative__light)"}
                          :
                          {}
                      )
                    }
                    value={price}
                    min={0}
                    max={1000000}
                    type={"number"}
                    onChange={onPriceChange}
                  />
                  <DefaultCheckbox
                    isUserCheckable={false}
                    styles={{
                      width: "100%",
                      display: (priceError === false) ? "none" : "flex",
                    }}
                    label={"Должно содержать гарантию"}
                    color={
                      (priceError === false) ?
                        "var(--main-color-palette_accent)"
                        :
                        "var(--main-color-palette_negative__light)"
                    }
                    checked={
                      (priceError === false)
                    }
                    inputId={"default_checkbox_admin_request_warranty_period_error"}
                  />
                  <div
                    className={styles.submit_button}
                    onClick={onPriceChangeClick}
                  >
                    {isFormLoading && <span className={"loader"}></span>}
                    <p>Изменить</p>
                  </div>
                  {error !== null &&
                    <p
                      className={styles.error_text}
                    >
                      {error}
                    </p>
                  }
                </div>
              </div>
            </div>
            <div
              className={styles.admin_changing_wrapper__upper}
              style={{display: isWarrantyPeriodChanging ? "flex" : "none"}}
            >
              <div
                className={styles.admin_changing_wrapper}
              >
                <div className={styles.admin_changing_container}>
                  <button
                    className={styles.close_cross_button}
                    onClick={(e) => {
                      setIsWarrantyPeriodChanging(false);
                      setError(false);
                      setWarrantyPeriod(request.warranty_period);
                      closeWindowWrapper();
                    }}
                  >
                  <span className={styles.close_cross}>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="20"
                         height="20" className="g-icon" fill="currentColor" stroke="none" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
                        <path fill="currentColor" fillRule="evenodd"
                              d="M3.47 3.47a.75.75 0 0 1 1.06 0L8 6.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L9.06 8l3.47 3.47a.75.75 0 1 1-1.06 1.06L8 9.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L6.94 8 3.47 4.53a.75.75 0 0 1 0-1.06"
                              clipRule="evenodd"></path>
                      </svg>
                    </svg>
                  </span>
                  </button>
                  <DefaultInput
                    textareaId={"default_input_admin_request_warranty_period"}
                    isRequired={true}
                    label={"Введите гарантию"}
                    inputStyles={(warrantyPeriodError === false) ?
                      {border: "solid 2px var(--main-color-palette_accent__light)"}
                      :
                      (warrantyPeriodError === true ?
                          {border: "solid 2px var(--main-color-palette_negative__light)"}
                          :
                          {}
                      )
                    }
                    value={warrantyPeriod}
                    maxLength={50}
                    onChange={onWarrantyPeriodChange}
                  />
                  <DefaultCheckbox
                    isUserCheckable={false}
                    styles={{
                      width: "100%",
                      display: (warrantyPeriodError !== true) ? "none" : "flex",
                    }}
                    label={"Должно содержать гарантию"}
                    color={
                      (warrantyPeriodError === false) ?
                        "var(--main-color-palette_accent)"
                        :
                        "var(--main-color-palette_negative__light)"
                    }
                    checked={
                      (warrantyPeriodError === false)
                    }
                    inputId={"default_checkbox_admin_request_warranty_period_error"}
                  />
                  <div
                    className={styles.submit_button}
                    onClick={onWarrantyPeriodChangeClick}
                  >
                    {isFormLoading && <span className={"loader"}></span>}
                    <p>Изменить</p>
                  </div>
                  {error !== null &&
                    <p
                      className={styles.error_text}
                    >
                      {error}
                    </p>
                  }
                </div>
              </div>
            </div>
            <div
              className={styles.admin_changing_wrapper__upper}
              style={{display: isStatusChanging ? "flex" : "none"}}
            >
              <div
                className={styles.admin_changing_wrapper}
              >
                <div className={styles.admin_changing_container}>
                  <button
                    className={styles.close_cross_button}
                    onClick={(e) => {
                      setIsStatusChanging(false);
                      setError(false);
                      setStatus(compareStatus(request.status).status);
                      closeWindowWrapper();
                    }}
                  >
                    <span className={styles.close_cross}>
                      <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="20"
                           height="20" className="g-icon" fill="currentColor" stroke="none" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
                          <path fill="currentColor" fillRule="evenodd"
                                d="M3.47 3.47a.75.75 0 0 1 1.06 0L8 6.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L9.06 8l3.47 3.47a.75.75 0 1 1-1.06 1.06L8 9.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L6.94 8 3.47 4.53a.75.75 0 0 1 0-1.06"
                                clipRule="evenodd"></path>
                        </svg>
                      </svg>
                    </span>
                  </button>
                  <DefaultSelect
                    isRequired={true}
                    label={"Выберите статус"}
                    value={status}
                    options={[
                      "Ожидает",
                      "В работе",
                      "Выполнен",
                      "Отменён"
                    ]}
                    selectStyles={(statusError === false) ?
                      {border: "solid 2px var(--main-color-palette_accent__light)"}
                      :
                      (statusError === true ?
                          {border: "solid 2px var(--main-color-palette_negative__light)"}
                          :
                          {}
                      )
                    }
                    selectId={"default_select_send_request_device_type"}
                    onChange={onStatusChange}
                  />
                  <DefaultCheckbox
                    isUserCheckable={false}
                    styles={{
                      width: "100%",
                      display: (statusError !== true) ? "none" : "flex",
                    }}
                    label={"Должно содержать статус"}
                    color={
                      (statusError === false) ?
                        "var(--main-color-palette_accent)"
                        :
                        "var(--main-color-palette_negative__light)"
                    }
                    checked={
                      (statusError === false)
                    }
                    inputId={"default_checkbox_admin_request_warranty_period_error"}
                  />
                  <div
                    className={styles.submit_button}
                    onClick={onStatusChangeClick}
                  >
                    {isFormLoading && <span className={"loader"}></span>}
                    <p>Изменить</p>
                  </div>
                  {error !== null &&
                    <p
                      className={styles.error_text}
                    >
                      {error}
                    </p>
                  }
                </div>
              </div>
            </div>
            <div className="noselect">
              <p
                className={styles.request_text}
                onClick={(e) => navigator("/")}
              >
                ← Назад / Заказ # {params.id}
              </p>
            </div>
            {request !== null &&
              <>
                {dataContext.data?.profile?.is_admin === 0 &&
                  <div className={styles.request_table}>
                    <div className={styles.request_table__row}>
                      <div className={styles.request_table__cell__device_type_header}>
                        <div className={styles.request_table__cell_header}>
                          Тип устройства
                        </div>
                      </div>
                      <div className={styles.request_table__cell__device_type}>
                        <div className={styles.request_table__cell}>
                          {request.device_type}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_table__row}>
                      <div className={styles.request_table__cell__breakdown_header}>
                        <div className={styles.request_table__cell_header}>
                          Поломка
                        </div>
                      </div>
                      <div className={styles.request_table__cell__breakdown}>
                        <div className={styles.request_table__cell}>
                          {request.breakdown}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_table__row}>
                      <div className={styles.request_table__cell__description_header}>
                        <div className={styles.request_table__cell_header}>
                          Описание
                        </div>
                      </div>
                      <div className={styles.request_table__cell__description}>
                        <div className={styles.request_table__cell}>
                          {request.description}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_table__row}>
                      <div className={styles.request_table__cell__repair_method_header}>
                        <div className={styles.request_table__cell_header}>
                          Способ починки
                        </div>
                      </div>
                      <div className={styles.request_table__cell__repair_method}>
                        <div className={styles.request_table__cell}>
                          {request.repair_method}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_table__row}>
                      <div className={styles.request_table__cell__price_header}>
                        <div className={styles.request_table__cell_header}>
                          Цена
                        </div>
                      </div>
                      <div className={styles.request_table__cell__price}>
                        <div className={styles.request_table__cell}>
                          {request.price}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_table__row}>
                      <div className={styles.request_table__cell__datetime_header}>
                        <div className={styles.request_table__cell_header}>
                          Дата заказа
                        </div>
                      </div>
                      <div className={styles.request_table__cell__datetime}>
                        <div className={styles.request_table__cell}>
                          {formatDate(request.datetime)}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_table__row}>
                      <div className={styles.request_table__cell__warranty_period_header}>
                        <div className={styles.request_table__cell_header}>
                          Гарантия
                        </div>
                      </div>
                      <div className={styles.request_table__cell__warranty_period}>
                        <div className={styles.request_table__cell}>
                          {request.warranty_period === "" ? "-" : request.warranty_period}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_table__row}>
                      <div className={styles.request_table__cell__device_type_header}>
                        <div className={styles.request_table__cell_header}>
                          Статус
                        </div>
                      </div>
                      <div className={styles.request_table__cell__device_type}>
                        <div className={compareStatus(request.status).style}>
                          {compareStatus(request.status).status}
                        </div>
                      </div>
                    </div>
                  </div>
                }
                {dataContext.data?.profile?.is_admin === 1 &&
                  <div className={styles.request_admin_table}>
                    <div className={styles.request_admin_table__row}>
                      <div className={styles.request_admin_table__cell__email_header}>
                        <div className={styles.request_admin_table__cell_header}>
                          Почта
                        </div>
                      </div>
                      <div className={styles.request_admin_table__cell__email}>
                        <div className={styles.request_admin_table__cell}>
                          {request.email}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_admin_table__row}>
                      <div className={styles.request_admin_table__cell__username_header}>
                        <div className={styles.request_admin_table__cell_header}>
                          ФИО
                        </div>
                      </div>
                      <div className={styles.request_admin_table__cell__username}>
                        <div className={styles.request_admin_table__cell}>
                          {request.credentials}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_admin_table__row}>
                      <div className={styles.request_admin_table__cell__phone_number_header}>
                        <div className={styles.request_admin_table__cell_header}>
                          Телефон
                        </div>
                      </div>
                      <div className={styles.request_admin_table__cell__phone_number}>
                        <div className={styles.request_admin_table__cell}>
                          {request.phone_number}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_admin_table__row}>
                      <div className={styles.request_admin_table__cell__device_type_header}>
                        <div className={styles.request_admin_table__cell_header}>
                          Тип устройства
                        </div>
                      </div>
                      <div className={styles.request_admin_table__cell__device_type}>
                        <div className={styles.request_admin_table__cell}>
                          {request.device_type}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_admin_table__row}>
                      <div className={styles.request_admin_table__cell__breakdown_header}>
                        <div className={styles.request_admin_table__cell_header}>
                          Поломка
                        </div>
                      </div>
                      <div className={styles.request_admin_table__cell__breakdown}>
                        <div className={styles.request_admin_table__cell}>
                          {request.breakdown}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_admin_table__row}>
                      <div className={styles.request_admin_table__cell__description_header}>
                        <div className={styles.request_admin_table__cell_header}>
                          Описание
                        </div>
                      </div>
                      <div className={styles.request_admin_table__cell__description}>
                        <div className={styles.request_admin_table__cell}>
                          {request.description}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_admin_table__row}>
                      <div className={styles.request_admin_table__cell__repair_method_header}>
                        <div className={styles.request_admin_table__cell_header}>
                          Способ починки
                        </div>
                      </div>
                      <div className={styles.request_admin_table__cell__repair_method}>
                        <div className={styles.request_admin_table__cell}>
                          {request.repair_method}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_admin_table__row}>
                      <div className={styles.request_admin_table__cell__datetime_header}>
                        <div className={styles.request_admin_table__cell_header}>
                          Дата заказа
                        </div>
                      </div>
                      <div className={styles.request_admin_table__cell__datetime}>
                        <div className={styles.request_admin_table__cell}>
                          {formatDate(request.datetime)}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_admin_table__row}>
                      <div className={styles.request_admin_table__cell__price_header}>
                        <div
                          className={styles.request_admin_table__cell_header}
                          onClick={(e) => setIsPriceChanging(!isPriceChanging)}
                        >
                          Цена
                          <svg aria-hidden="true" display="block"
                               width="24" height="24" viewBox="0 0 24 24" style={{width: 24, height: 24}}>
                            <g fill="none" fillRule="evenodd">
                              <path d="M0 0h24v24H0z"></path>
                              <path fill="currentColor"
                                    d="m14.188 6.273 3.54 3.54-8.624 8.622a6.7 6.7 0 0 1-2.77 1.664l-2.903.886a.334.334 0 0 1-.416-.416l.886-2.902a6.7 6.7 0 0 1 1.664-2.771zm1.061-1.06 1.769-1.77a1.5 1.5 0 0 1 2.121 0l1.418 1.419a1.5 1.5 0 0 1 0 2.121L18.79 8.752z"></path>
                            </g>
                          </svg>
                        </div>
                      </div>
                      <div className={styles.request_admin_table__cell__price}>
                        <div className={styles.request_admin_table__cell}>
                          {request.price} Р
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_admin_table__row}>
                      <div className={styles.request_admin_table__cell__warranty_period_header}>
                        <div
                          className={styles.request_admin_table__cell_header}
                          onClick={(e) => setIsWarrantyPeriodChanging(!isWarrantyPeriodChanging)}
                        >
                          Гарантия
                          <svg aria-hidden="true" display="block"
                               width="24" height="24" viewBox="0 0 24 24" style={{width: 24, height: 24}}>
                            <g fill="none" fillRule="evenodd">
                              <path d="M0 0h24v24H0z"></path>
                              <path fill="currentColor"
                                    d="m14.188 6.273 3.54 3.54-8.624 8.622a6.7 6.7 0 0 1-2.77 1.664l-2.903.886a.334.334 0 0 1-.416-.416l.886-2.902a6.7 6.7 0 0 1 1.664-2.771zm1.061-1.06 1.769-1.77a1.5 1.5 0 0 1 2.121 0l1.418 1.419a1.5 1.5 0 0 1 0 2.121L18.79 8.752z"></path>
                            </g>
                          </svg>
                        </div>
                      </div>
                      <div className={styles.request_admin_table__cell__warranty_period}>
                        <div className={styles.request_admin_table__cell}>
                          {request.warranty_period === "" ? "-" : request.warranty_period}
                        </div>
                      </div>
                    </div>
                    <div className={styles.request_admin_table__row}>
                      <div className={styles.request_admin_table__cell__device_type_header}>
                        <div
                          className={styles.request_admin_table__cell_header}
                          onClick={(e) => setIsStatusChanging(!isStatusChanging)}
                        >
                          Статус
                          <svg aria-hidden="true" display="block"
                               width="24" height="24" viewBox="0 0 24 24" style={{width: 24, height: 24}}>
                            <g fill="none" fillRule="evenodd">
                              <path d="M0 0h24v24H0z"></path>
                              <path fill="currentColor"
                                    d="m14.188 6.273 3.54 3.54-8.624 8.622a6.7 6.7 0 0 1-2.77 1.664l-2.903.886a.334.334 0 0 1-.416-.416l.886-2.902a6.7 6.7 0 0 1 1.664-2.771zm1.061-1.06 1.769-1.77a1.5 1.5 0 0 1 2.121 0l1.418 1.419a1.5 1.5 0 0 1 0 2.121L18.79 8.752z"></path>
                            </g>
                          </svg>
                        </div>
                      </div>
                      <div className={styles.request_admin_table__cell__device_type}>
                        <div className={compareStatus(request.status).style}>
                          {compareStatus(request.status).status}
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </>
            }
          </div>
          :
          <div className={styles.content_container}>
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
                Заказ с таким ID не найден.
              </p>
            </div>
            <a
              className={styles.back_to_requests__link}
              onClick={(e) => navigator("/")}
            >
              Вернуться на главную
            </a>
          </div>
      )
    }
  </>)
}

export default Request;