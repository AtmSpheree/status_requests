const formatProfileDate = (timestamp) => {
  let options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timezone: 'UTC+3',
  };
  let date = new Date(timestamp * 1000);
  return date.toLocaleDateString("ru", options)
}

export default formatProfileDate;