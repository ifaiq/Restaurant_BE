export const generateCode = async (length = 6) => {
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * 10);
    randomString += randomIndex;
  }

  return randomString;
};
