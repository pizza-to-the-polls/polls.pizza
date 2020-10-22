const BASE_URL = process.env.PIZZA_BASE_DOMAIN;

export const baseFetch = async (path: string, options: { [key: string]: string } = {}): Promise<any> => {
  const headers = options.headers || {};
  const resp = await fetch(`${BASE_URL}${path}`, {
    mode: "cors",
    ...options,
    headers: { "Content-Type": "application/json", ...headers },
  });

  const data = await resp.json();

  if (resp.status > 299) {
    throw data.errors;
  }

  return data;
};
