const requestsSortingFunction = (a, b, type, order) => {
  let boolOrder = order === "Возрастания";
  let statusOrder = ["waiting", "at work", "completed", "cancelled"]
  if (type === "ФИО") {
    if (a.credentials > b.credentials) {
      return (boolOrder ? 1 : -1)
    }
    if (a.credentials < b.credentials) {
      return (boolOrder ? -1 : 1)
    }
    return 0;
  }
  if (type === "Дата") {
    if (a.datetime > b.datetime) {
      return (boolOrder ? 1 : -1)
    }
    if (a.datetime < b.datetime) {
      return (boolOrder ? -1 : 1)
    }
    return 0;
  }
  if (type === "Статус") {
    if (statusOrder.indexOf(a.status) < statusOrder.indexOf(b.status)) {
      return (boolOrder ? 1 : -1)
    }
    if (statusOrder.indexOf(a.status) > statusOrder.indexOf(b.status)) {
      return (boolOrder ? -1 : 1)
    }
    return 0;
  }
  if (type === "Устройство") {
    if (a.device_type > b.device_type) {
      return (boolOrder ? 1 : -1)
    }
    if (a.device_type < b.device_type) {
      return (boolOrder ? -1 : 1)
    }
    return 0;
  }
}

export default requestsSortingFunction;