const testStringUsername = (value) => {
  return /^(?=.{1,40}$)[а-яёА-ЯЁ]+(?:[-' ][а-яёА-ЯЁ]+)*$/.test(value);
}

export default testStringUsername;