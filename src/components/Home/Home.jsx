import {useContext, useEffect, useState} from "react";
import {DataContext} from "../../context/dataContext.jsx";
import {data, useNavigate} from "react-router-dom";
import styles from "./Home.module.css";
import normalizeError from "../../helpers/normalizeError.js";
import getRequests from "../../api/getRequests.js";
import useRefresh from "../../hooks/useRefresh.jsx";
import formatDate from "../../utils/formatDate.js";
import compareStatus from "../../utils/compareStatus.js";
import requestsSortingFunction from "../../utils/requestsSortingFunction.js";

const Home = () => {
  const dataContext = useContext(DataContext);
  const navigator = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isCanRequests, setIsCanRequests] = useState(false);
  const [sortType, setSortType] = useState("ФИО");
  const [sortOrder, setSortOrder] = useState("Возрастания");
  const refreshHook = useRefresh({context: dataContext});

  const getRequestsRequest = async () => {
    try {
      const fetchedData = await getRequests(
        dataContext.data?.auth?.access_token
      );
      dataContext.setData({
        ...dataContext.data,
        requests: fetchedData.requests,
      })
      setTimeout(() => setIsLoading(false), 100);
    } catch (e) {
      let norm_e = normalizeError(e)
      if (norm_e.status === 403) {
        setIsCanRequests(true);
        refreshHook.refresh();
      }
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

    if (dataContext.data?.requests === null) {
      getRequestsRequest();
    } else {
      setIsLoading(false);
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

  return (<>
    {isLoading ?
      <div className="loader_wrapper" style={{height: "80vh"}}>
        <span className="loader"
              style={{width: 100, height: 100, border: "10px dotted var(--main-color-palette_accent)"}}></span>
      </div>
    :
      <div className={styles.content_container}>
        {dataContext.data?.profile?.is_admin === 0 &&
          <div className={styles.home_container}>
            <div
              className={styles.submit_button}
              onClick={(e) => navigator("/send_request")}
            >
              <p>Оформить заявку</p>
            </div>
            <p className={styles.history_text} style={{marginTop: 50}}>
              История заказов
            </p>
            {dataContext.data?.requests.length === 0 ?
              <p className={styles.history_error_text}>
                У вас пока нет заказов
              </p>
            :
              <div className={styles.user_table}>
                <div className={styles.user_table__row_header}>
                  <div className={styles.user_table__cell__type_header}>
                    <div className={styles.user_table__cell_header}>
                      Тип устройства
                    </div>
                  </div>
                  <div className={styles.user_table__cell__price_header}>
                    <div className={styles.user_table__cell_header}>
                      Цена
                    </div>
                  </div>
                  <div className={styles.user_table__cell__datetime_header}>
                    <div className={styles.user_table__cell_header}>
                      Дата заказа
                    </div>
                  </div>
                  <div className={styles.user_table__cell__warranty_header}>
                    <div className={styles.user_table__cell_header}>
                      Срок гарантии
                    </div>
                  </div>
                  <div className={styles.user_table__cell__status_header}>
                    <div className={styles.user_table__cell_header}>
                      Статус заказа
                    </div>
                  </div>
                </div>
                <div className={styles.user_table__rows}>
                  {Array.isArray(dataContext.data?.requests) &&
                    dataContext.data?.requests.sort((a, b) => {
                      if (a.datetime < b.datetime) {
                        return 1;
                      } else if (a.datetime > b.datetime) {
                        return -1;
                      }
                      return 0;
                    }).map((item) => (
                      <div
                        key={item.id}
                        className={styles.user_table__row}
                        onClick={(e) => navigator(`/request/${item.id}`)}
                      >
                        <div className={styles.user_table__cell__type}>
                          <div className={styles.user_table__cell}>
                            {item.device_type}
                          </div>
                        </div>
                        <div className={styles.user_table__cell__price}>
                          <div className={styles.user_table__cell}>
                            {item.price} Р
                          </div>
                        </div>
                        <div className={styles.user_table__cell__datetime}>
                          <div className={styles.user_table__cell}>
                            {formatDate(item.datetime)}
                          </div>
                        </div>
                        <div className={styles.user_table__cell__warranty}>
                          <div className={styles.user_table__cell}>
                            {item.warranty_period === "" ? "-" : item.warranty_period}
                          </div>
                        </div>
                        <div className={styles.user_table__cell__status}>
                          <div className={compareStatus(item.status).style}>
                            {compareStatus(item.status).status}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            }
          </div>
        }
        {dataContext.data?.profile?.is_admin === 1 &&
          <div className={styles.home_container}>
            {dataContext.data?.requests.length !== 0 &&
              <div className={styles.sort_container}>
                <p className={styles.sort_container_text}>
                  Сортировать по
                </p>
                <div
                  className={styles.sort_container__button}
                  style={sortType === "ФИО" ?
                    {backgroundColor: "var(--main-color-palette_green)"}
                    :
                    {backgroundColor: "var(--main-color-palette_black)"}
                  }
                  onClick={(e) => setSortType("ФИО")}
                >
                  ФИО
                </div>
                <div
                  className={styles.sort_container__button}
                  style={sortType === "Дата" ?
                    {backgroundColor: "var(--main-color-palette_green)"}
                    :
                    {backgroundColor: "var(--main-color-palette_black)"}
                  }
                  onClick={(e) => setSortType("Дата")}
                >
                  Дата
                </div>
                <div
                  className={styles.sort_container__button}
                  style={sortType === "Статус" ?
                    {backgroundColor: "var(--main-color-palette_green)"}
                    :
                    {backgroundColor: "var(--main-color-palette_black)"}
                  }
                  onClick={(e) => setSortType("Статус")}
                >
                  Статус
                </div>
                <div
                  className={styles.sort_container__button}
                  style={sortType === "Устройство" ?
                    {backgroundColor: "var(--main-color-palette_green)"}
                    :
                    {backgroundColor: "var(--main-color-palette_black)"}
                  }
                  onClick={(e) => setSortType("Устройство")}
                >
                  Устройство
                </div>
              </div>
            }
            {dataContext.data?.requests.length !== 0 &&
              <div className={styles.sort_container} style={{marginTop: 20}}>
                <p className={styles.sort_container_text}>
                  В порядке
                </p>
                <div
                  className={styles.sort_container__button}
                  style={sortOrder === "Возрастания" ?
                    {backgroundColor: "var(--main-color-palette_green)"}
                    :
                    {backgroundColor: "var(--main-color-palette_black)"}
                  }
                  onClick={(e) => setSortOrder("Возрастания")}
                >
                  Возрастания
                </div>
                <div
                  className={styles.sort_container__button}
                  style={sortOrder === "Убывания" ?
                    {backgroundColor: "var(--main-color-palette_green)"}
                    :
                    {backgroundColor: "var(--main-color-palette_black)"}
                  }
                  onClick={(e) => setSortOrder("Убывания")}
                >
                  Убывания
                </div>
              </div>
            }
            <p className={styles.history_text} style={{marginTop: 20}}>
              История заказов
            </p>
            {dataContext.data?.requests.length === 0 ?
              <p className={styles.history_error_text}>
                У вас пока нет заказов
              </p>
              :
              <div className={styles.admin_table}>
                <div className={styles.admin_table__row_header}>
                  <div className={styles.admin_table__cell__phone_number_header}>
                    <div className={styles.admin_table__cell_header}>
                      Номер телефона
                    </div>
                  </div>
                  <div className={styles.admin_table__cell__username_header}>
                    <div className={styles.admin_table__cell_header}>
                      ФИО
                    </div>
                  </div>
                  <div className={styles.admin_table__cell__type_header}>
                    <div className={styles.admin_table__cell_header}>
                      Тип устройства
                    </div>
                  </div>
                  <div className={styles.admin_table__cell__datetime_header}>
                    <div className={styles.admin_table__cell_header}>
                      Дата заказа
                    </div>
                  </div>
                  <div className={styles.admin_table__cell__status_header}>
                    <div className={styles.admin_table__cell_header}>
                      Статус заказа
                    </div>
                  </div>
                </div>
                <div className={styles.admin_table__rows}>
                  {Array.isArray(dataContext.data?.requests) &&
                    dataContext.data?.requests.sort(
                      (a, b) => requestsSortingFunction(a, b, sortType, sortOrder)
                    ).map((item) => (
                      <div
                        key={item.id}
                        className={styles.admin_table__row}
                        onClick={(e) => navigator(`/request/${item.id}`)}
                      >
                        <div className={styles.admin_table__cell__phone_number}>
                          <div className={styles.admin_table__cell}>
                            {item.phone_number}
                          </div>
                        </div>
                        <div className={styles.admin_table__cell__username}>
                          <div className={styles.admin_table__cell}>
                            {item.credentials}
                          </div>
                        </div>
                        <div className={styles.admin_table__cell__type}>
                          <div className={styles.admin_table__cell}>
                            {item.device_type}
                          </div>
                        </div>
                        <div className={styles.admin_table__cell__datetime}>
                          <div className={styles.admin_table__cell}>
                            {formatDate(item.datetime)}
                          </div>
                        </div>
                        <div className={styles.admin_table__cell__status}>
                          <div className={compareStatus(item.status).style}>
                            {compareStatus(item.status).status}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    }
  </>)
}

export default Home;