const testStringPhoneNumber = (value) => {
  let letters = "0123456789"
  if (value === "") {
    return true;
  }
  if (!value.startsWith("8")) {
    return false;
  }
  for (let i = 0; i < value.length; i++) {
    if (!letters.includes(value.toLowerCase()[i])) {
      return false;
    }
  }
  return true;
}

export default testStringPhoneNumber;