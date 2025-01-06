const normalizeError = (error) => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(JSON.stringify(error));
};

export default normalizeError;