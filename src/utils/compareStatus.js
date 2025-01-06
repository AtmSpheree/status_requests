import styles from "../components/Home/Home.module.css"

const compareStatus = (status) => {
  if (status === "waiting") {
    return {
      status: "Ожидает",
      style: styles.user_table__cell_yellow
    }
  } else if (status === "at work") {
    return {
      status: "В работе",
      style: styles.user_table__cell_yellow
    }
  } else if (status === "completed") {
    return {
      status: "Выполнен",
      style: styles.user_table__cell_green
    }
  } else if (status === "cancelled") {
    return {
      status: "Отменён",
      style: styles.user_table__cell_red
    }
  }
  return status;
}

export default compareStatus;