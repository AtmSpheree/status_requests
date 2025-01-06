import styles from "./Profile.module.css"
import {useContext} from "react";
import {DataContext} from "../../context/dataContext.jsx";
import formatProfileDate from "../../utils/formatProfileDate.js";

const Profile = () => {
  const dataContext = useContext(DataContext);

  return (<div className={styles.profile_container}>
    <p className={styles.profile_container__text}>
      Аккаунт
    </p>
    <div className={styles.profile_table}>
      <div className={styles.profile_table__row}>
        <div className={styles.profile_table__cell__username_header}>
          <div className={styles.profile_table__cell_header}>
            ФИО
          </div>
        </div>
        <div className={styles.profile_table__cell__username}>
          <div className={styles.profile_table__cell} style={{wordBreak: "normal"}}>
            {dataContext.data?.profile.username}
          </div>
        </div>
      </div>
      <div className={styles.profile_table__row}>
        <div className={styles.profile_table__cell__email_header}>
          <div className={styles.profile_table__cell_header}>
            Почта
          </div>
        </div>
        <div className={styles.profile_table__cell__email}>
          <div className={styles.profile_table__cell}>
            {dataContext.data?.profile.email}
          </div>
        </div>
      </div>
      <div className={styles.profile_table__row}>
        <div className={styles.profile_table__cell__phone_number_header}>
          <div className={styles.profile_table__cell_header}>
            Телефон
          </div>
        </div>
        <div className={styles.profile_table__cell__phone_number}>
          <div className={styles.profile_table__cell}>
            {dataContext.data?.profile.phone_number}
          </div>
        </div>
      </div>
      <div className={styles.profile_table__row}>
        <div className={styles.profile_table__cell__datetime_header}>
          <div className={styles.profile_table__cell_header}>
            Дата регистрации
          </div>
        </div>
        <div className={styles.profile_table__cell__datetime}>
          <div className={styles.profile_table__cell}>
            {formatProfileDate(dataContext.data?.profile.datetime)}
          </div>
        </div>
      </div>
    </div>
  </div>)
}

export default Profile;