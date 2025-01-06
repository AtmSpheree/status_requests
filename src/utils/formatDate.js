const formatDate = (timestamp) => {
  let options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timezone: 'UTC+3',
    hour: 'numeric',
    minute: 'numeric',
  };
  let date = new Date(timestamp * 1000);
  return date.toLocaleDateString("ru", options)
}

export default formatDate;