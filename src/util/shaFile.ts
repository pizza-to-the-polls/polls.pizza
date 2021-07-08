// From Stack Overflow https://stackoverflow.com/a/53490958

const shaFile = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray.map(slice => ("00" + slice.toString(16)).slice(-2)).join("");

  return hashHex;
};

export default shaFile;
