/**
 * Generates a UUID (Universally Unique Identifier) using the version 4 format.
 *
 * @return {string} A randomly generated UUID in the format "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".
 */
export const getUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
