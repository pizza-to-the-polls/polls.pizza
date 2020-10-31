/**
 * Return the value of a URL parameter
 * @param url String
 * @param key String
 */
export default (url: string, key: string) => {
  const results = new RegExp("[?&]" + key + "=([^&#]*)").exec(url);
  return results ? decodeURI(results[1]) : null;
};
