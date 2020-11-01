/**
 * Convert `obj` into a URL-encoded querystring of key/value pairs
 */
function toQueryString(obj: any, includeQuestionmarkPrefix = false): string {
  if (obj == null) {
    return "";
  }
  const query = Object.keys(obj)
    .filter(k => obj[k] !== undefined)
    .map(k => {
      const val = obj[k];
      const encodedKey = encodeURIComponent(k);
      if (val instanceof Array) {
        return val.map(x => encodedKey + "=" + encodeURIComponent(x)).join("&");
      } else {
        return encodedKey + "=" + encodeURIComponent(val);
      }
    })
    .join("&");
  return (includeQuestionmarkPrefix && query !== "" ? "?" : "") + query;
}
export default toQueryString;
