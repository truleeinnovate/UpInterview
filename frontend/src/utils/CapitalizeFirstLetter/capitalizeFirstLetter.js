// It capitalizes the first letter of a given string.

export const capitalizeFirstLetter = (str) => {
  if (typeof str !== "string" || !str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
