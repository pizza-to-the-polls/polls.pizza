const SHEET_URL = "https://spreadsheets.google.com/feeds/list/1mxmW0YljLEcNP1BUJoUlAEtzzE0FXwbaDBPN26dlloo/";

const TOTALS_SHEET = "2";
const DELIVERIES_SHEET = "4";

const getSheet = async (worksheet: string): Promise<Array<{ title: string; content: string }>> => {
  const resp = await fetch(`${SHEET_URL}${worksheet}/public/basic?alt=json`);
  const { feed } = await resp.json();
  const entry: Array<{ content: { $t: string }; title: { $t: string } }> = (feed || {}).entry;

  return entry.map(el => ({ content: el.content.$t, title: el.title.$t }));
};

export const getTotals = async () => {
  const [pizzas, locations, states, raised] = (await getSheet(TOTALS_SHEET)).map(el => el.content.split(": ")[1]);

  return { pizzas, locations, states, raised };
};

export const getActivity = async () => {
  const locations = (await getSheet(DELIVERIES_SHEET)).reverse();
  return locations.map(({ content, title: address }) => {
    const [city, state, pizzas, date, time, url] = content.split(",").map(el => el.split(": ")[1]);
    return {
      location: `${pizzas} pizzas to ${address} ${city}, ${state} on ${date}, ${time} PST`,
      url,
    };
  });
};
