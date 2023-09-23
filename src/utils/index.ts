/**
 * Generates an alphanumeric unique identifier.
 *
 * @returns {string} The alphanumeric unique identifier.
 */
export const generateAlphaNumericUniqueId = (): string => {
  // Generate a random number between 0 and 35.
  const randomNumber = Math.floor(Math.random() * 36);

  // Get the current timestamp.
  const timestamp = Date.now();

  // Combine the random number and timestamp to create a unique identifier.
  const uniqueId = `${randomNumber}-${timestamp}`;

  // Convert the unique identifier to a base-36 string.
  const alphaNumericUniqueId = uniqueId.replace(/[\W_]/g, "");

  // Return the alpha numeric unique identifier.
  return alphaNumericUniqueId;
};
