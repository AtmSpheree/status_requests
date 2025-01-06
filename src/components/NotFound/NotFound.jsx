import styles from "./NotFound.module.css"
import {useNavigate} from "react-router-dom";

const NotFound = () => {
  const navigator = useNavigate();

  return (<div className="wrapper">
    <div className={styles.logo_container}>
      <a onClick={(e) => navigator("/")}>
        <img className="logo" src="/images/logo_main.svg" alt="СТАТУС"/>
      </a>
    </div>
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
        Такой страницы не существует.
      </p>
    </div>
    <a
      className={styles.back_to_auth__link}
      onClick={(e) => navigator("/")}
      style={{marginTop: 10}}
    >
      Вернуться на главную
    </a>
  </div>)
}

export default NotFound;