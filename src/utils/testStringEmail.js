const testStringEmail = (value) => {
  return /^\S+@\S+\.\S+$/.test(value);
}

export default testStringEmail;