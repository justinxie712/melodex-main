export const getRandomNumber = (
  min: number,
  max: number,
  decimals = 2
): number => {
  const random = Math.random() * (max - min) + min;
  return Number(random.toFixed(decimals));
};

export const refreshToken = async () => {
  // Redirect to login page to get a fresh token
  window.location.href = "/"; // Adjust this to your login page URL
};
