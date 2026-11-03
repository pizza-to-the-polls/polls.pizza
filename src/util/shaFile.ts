// From Stack Overflow https://stackoverflow.com/a/53490958

/**
 * Hash a Blob (a File is a Blob) or an already-materialized ArrayBuffer.
 * form-report passes the ArrayBuffer: it reads the picked File exactly once
 * (cloud-backed picks — iCloud "optimize storage", Google Photos, OneDrive
 * placeholders — can hand back a File handle the OS later refuses to serve,
 * BUG-036's NotReadableError) and reuses those in-memory bytes for both the
 * hash and the S3 upload body.
 */
const shaFile = async (data: Blob | ArrayBuffer): Promise<string> => {
  const buffer = data instanceof ArrayBuffer ? data : await data.arrayBuffer();

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", new Uint8Array(buffer));

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray.map(slice => ("00" + slice.toString(16)).slice(-2)).join("");

  return hashHex;
};

export default shaFile;
