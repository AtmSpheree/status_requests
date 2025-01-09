const compareStatusReverse = (status) => {
  if (status === "Ожидает") {
    return "waiting"
  } else if (status === "В работе") {
    return "at work"
  } else if (status === "Выполнен") {
    return "completed"
  } else if (status === "Отменён") {
    return "cancelled"
  }
  return status;
}

export default compareStatusReverse;